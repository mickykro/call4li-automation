import { getFirestore } from '../firebase-admin';
import { detectLanguage, getGreeting } from './language';
import { parseTime } from './time-parser';
import { searchKnowledge } from './knowledge';
import { detectRole } from './roles';
import { analyzeMessage } from './gemini';
import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// ─── Types ───────────────────────────────────────────────────
export interface IncomingMessage {
    from: string;
    text: string;
    media: Array<{ url: string; contentType: string }>;
    isButtonClick: boolean;
    isTest?: boolean;
}

export interface ForliResponse {
    text: string;
    buttons?: string[];
}

// ─── Main Engine ─────────────────────────────────────────────
export async function handleIncomingMessage(msg: IncomingMessage): Promise<ForliResponse> {
    const db = await getFirestore();
    const { from, text, media, isButtonClick, isTest } = msg;

    // 1) Detect role: known customer, business owner, or unknown
    const role = await detectRole(from, db);

    // 2) Handle unknown number — pitch Call4li service
    if (role.type === 'unknown') {
        return handleUnknown(from, text);
    }

    // 3) Handle business owner messages
    if (role.type === 'owner') {
        return handleOwner(from, text, role.businessId!, db);
    }

    // 4) Multi-business: ask which business
    if (role.type === 'multi_business') {
        return handleMultiBusiness(from, text, role.businesses!, db);
    }

    // 5) Known customer — process through Gemini-enhanced flow
    const businessId = role.businessId!;
    const language = detectLanguage(text);

    // Find or create conversation
    const convSnap = await db
        .collection('conversations')
        .where('businessId', '==', businessId)
        .where('customerPhone', '==', from)
        .where('status', 'in', ['open', 'waiting_callback'])
        .limit(1)
        .get();

    if (convSnap.empty) {
        // No active conversation — should not happen normally
        return { text: getGreeting(language).error };
    }

    const convDoc = convSnap.docs[0];
    const convId = convDoc.id;

    if (!isTest) {
        // Save the incoming message
        await db.collection('conversations').doc(convId).collection('messages').add({
            sender: 'customer',
            type: media.length > 0 ? detectMediaType(media[0].contentType) : 'text',
            content: text,
            mediaUrl: media.length > 0 ? media[0].url : null,
            createdAt: new Date().toISOString(),
        });

        // Update conversation timestamp
        await db.collection('conversations').doc(convId).update({
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            language,
        });
    }

    // Handle button clicks
    if (isButtonClick) {
        return handleButtonClick(text, convId, businessId, from, language, db, isTest);
    }

    // Fetch business and knowledge for Gemini context
    const [bizDoc, knowledgeDoc] = await Promise.all([
        db.collection('businesses').doc(businessId).get(),
        db.collection('knowledge').doc(businessId).get(),
    ]);

    const bizData = bizDoc.data();
    const knowData = knowledgeDoc.data();

    // 6) Analyze with Gemini
    try {
        const analysis = await analyzeMessage(text, {
            businessName: bizData?.businessName || 'Business',
            description: bizData?.description || knowData?.description || '',
            faqs: knowData?.faqs || [],
            policy: knowData?.policy || '',
            hours: knowData?.hours || '',
            location: knowData?.location || '',
            customerPhone: from,
            currentTime: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
        });

        console.log(`[Gemini] Analysis for ${from}:`, analysis);

        if (analysis.intent === 'schedule_callback') {
            const timeResult = {
                normalizedTime: analysis.normalizedTime || new Date().toISOString(),
                confidence: 0.9,
            };
            return handleCallbackScheduling(convId, businessId, from, text, timeResult, language, db, isTest);
        }

        if (analysis.intent === 'answer' || analysis.intent === 'forward') {
            await saveForliMessage(convId, analysis.response, db, isTest);
            return { text: analysis.response };
        }
    } catch (geminiErr) {
        console.error('Gemini error, falling back to basic knowledge search:', geminiErr);
    }

    // Fallback if Gemini fails or is bypassed
    const knowledgeAnswer = await searchKnowledge(businessId, text, db);
    if (knowledgeAnswer) {
        await saveForliMessage(convId, knowledgeAnswer, db, isTest);
        return { text: knowledgeAnswer };
    }

    // Check if this looks like a time expression (basic backup parser)
    const timeResult = parseTime(text);
    if (timeResult.confidence > 0.6) {
        return handleCallbackScheduling(convId, businessId, from, text, timeResult, language, db, isTest);
    }

    // Default: acknowledge and forward to business
    return handleForwardToBusiness(convId, businessId, from, text, media, language, db, isTest);
}

// ─── Flow Handlers ───────────────────────────────────────────

async function handleButtonClick(
    buttonText: string,
    convId: string,
    _businessId: string,
    _customerPhone: string,
    language: string,
    db: Firestore,
    isTest: boolean = false
): Promise<ForliResponse> {
    const greetings = getGreeting(language);

    if (buttonText === 'שיחה עכשיו' || buttonText === 'Call Now') {
        const response = greetings.callNow;
        await saveForliMessage(convId, response, db, isTest);
        return { text: response };
    }

    if (buttonText === 'קביעת שיחה' || buttonText === 'Schedule Call') {
        const response = greetings.scheduleCall;
        await saveForliMessage(convId, response, db, isTest);
        return { text: response };
    }

    return { text: greetings.default };
}

async function handleCallbackScheduling(
    convId: string,
    businessId: string,
    _customerPhone: string,
    _rawText: string,
    timeResult: { normalizedTime: string; confidence: number },
    language: string,
    db: Firestore,
    isTest: boolean = false
): Promise<ForliResponse> {
    if (!isTest) {
        // Save callback
        await db.collection('callbacks').add({
            conversationId: convId,
            businessId,
            customerPhone: _customerPhone,
            rawText: _rawText,
            normalizedTime: timeResult.normalizedTime,
            confidence: timeResult.confidence,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
        });

        // Update conversation
        await db.collection('conversations').doc(convId).update({
            status: 'waiting_callback',
            callbackTime: timeResult.normalizedTime,
            updatedAt: new Date().toISOString(),
        });
    }

    const greetings = getGreeting(language);
    const response = greetings.callbackConfirmed;
    await saveForliMessage(convId, response, db, isTest);

    // TODO: Send summary to business via WhatsApp
    return { text: response };
}

async function handleForwardToBusiness(
    convId: string,
    _businessId: string,
    _customerPhone: string,
    _text: string,
    media: Array<{ url: string; contentType: string }>,
    language: string,
    db: Firestore,
    isTest: boolean = false
): Promise<ForliResponse> {
    const greetings = getGreeting(language);
    const response = media.length > 0
        ? greetings.mediaReceived
        : greetings.forwarded;

    await saveForliMessage(convId, response, db, isTest);

    // TODO: Send notification to business with summary
    return { text: response };
}

function handleUnknown(_phone: string, text: string): ForliResponse {
    const lang = detectLanguage(text);
    const greetings = getGreeting(lang);
    return { text: greetings.unknownPitch };
}

async function handleOwner(
    _phone: string,
    text: string,
    _businessId: string,
    db: Firestore
): Promise<ForliResponse> {
    const businessId = _businessId;
    const lower = text.toLowerCase().trim();

    // Demo mode
    if (lower === 'דמו' || lower === 'demo') {
        return {
            text: '🎭 מצב דמו פעיל!\n\nאדמה שיחה עם לקוח שניסה להתקשר אליך.\n\n---\n\nהיי, אני פורלי העוזרת שלך. ראיתי שמישהו ניסה להגיע אליך ולא הצליח. איך נוכל לעזור?',
            buttons: ['שיחה עכשיו', 'קביעת שיחה', 'סיים דמו'],
        };
    }

    if (lower === 'סיים דמו' || lower === 'end demo') {
        return { text: '✅ מצב דמו הסתיים. חזרנו למצב רגיל.' };
    }

    // Knowledge Addition check: "הוסף שאלה:" (Add question:)
    if (lower.startsWith('הוסף שאלה:')) {
        // Fetch the business plan properly
        const businessDoc = await db.collection('businesses').doc(businessId).get();
        if (businessDoc.exists) {
            const plan = businessDoc.data()?.plan;

            if (plan !== 'premium') {
                return {
                    text: '⭐ תכונה זו זמינה למנויי פרימיום בלבד.\nניתן להוסיף שאלות ישירות דרך פאנל הניהול באתר או לשדרג את המנוי.',
                };
            }

            // Parse Question - Answer
            const content = text.substring('הוסף שאלה:'.length).trim();
            const parts = content.split('-');

            if (parts.length < 2) {
                return {
                    text: '⚠️ לא צוינה תשובה כראוי. אנא רשום בפורמט: הוסף שאלה: [השאלה] - [התשובה]',
                };
            }

            const question = parts[0].trim();
            const answer = parts.slice(1).join('-').trim(); // Ensure anything after the first dash is the answer

            if (question && answer) {
                // Update Firestore Knowledge Base
                const knowledgeRef = db.collection('knowledge').doc(businessId);
                const knowledgeDoc = await knowledgeRef.get();

                const newFaq = {
                    id: `faq-${Date.now()}`,
                    question,
                    answer,
                };

                if (knowledgeDoc.exists) {
                    await knowledgeRef.update({
                        faqs: FieldValue.arrayUnion(newFaq),
                    });
                } else {
                    // Initialize if it doesn't exist
                    await knowledgeRef.set({
                        businessId,
                        faqs: [newFaq],
                    });
                }

                return {
                    text: `✅ נוספה שאלה חדשה למאגר המידע!\n\n*שאלה:* ${question}\n*תשובה:* ${answer}`,
                };
            }
        }
    }

    return {
        text: 'שלום! 👋\nאני פורלי, העוזרת שלך.\n\nמה תרצה לעשות?\n• כתוב "דמו" לדמות שיחה\n• הוסף שאלה ותשובה חדשה על ידי "הוסף שאלה: שעות פתיחה? - 08:00 עד 17:00"\n• היכנס לפאנל הניהול לצפייה בשיחות',
    };
}

async function handleMultiBusiness(
    _phone: string,
    _text: string,
    businesses: Array<{ id: string; name: string }>,
    _db: Firestore
): Promise<ForliResponse> {
    const list = businesses.map((b, i) => `${i + 1}. ${b.name}`).join('\n');
    return {
        text: `שלום! ראיתי שניסית להגיע לאחד מהעסקים הבאים:\n\n${list}\n\nלאיזה עסק רצית להגיע? כתוב את המספר.`,
    };
}

// ─── Helpers ─────────────────────────────────────────────────

async function saveForliMessage(convId: string, content: string, db: Firestore, isTest: boolean = false) {
    if (isTest) return;
    await db.collection('conversations').doc(convId).collection('messages').add({
        sender: 'forli',
        type: 'text',
        content,
        createdAt: new Date().toISOString(),
    });
}

function detectMediaType(contentType: string): string {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('audio/')) return 'voice';
    return 'document';
}
