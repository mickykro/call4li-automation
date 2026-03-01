/**
 * Language detection and response templates for Forli
 * Supports Hebrew, Arabic, and English
 */

type Lang = 'he' | 'ar' | 'en';

// ─── Language Detection ──────────────────────────────────────

const hebrewPattern = /[\u0590-\u05FF]/;
const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;

export function detectLanguage(text: string): Lang {
    if (!text) return 'he';

    const hebrewCount = (text.match(hebrewPattern) || []).length;
    const arabicCount = (text.match(arabicPattern) || []).length;
    const latinCount = (text.match(/[a-zA-Z]/g) || []).length;

    if (arabicCount > hebrewCount && arabicCount > latinCount) return 'ar';
    if (latinCount > hebrewCount && latinCount > arabicCount) return 'en';
    return 'he';
}

// ─── Response Templates ──────────────────────────────────────

interface GreetingSet {
    initial: (businessName: string) => string;
    callNow: string;
    scheduleCall: string;
    callbackConfirmed: string;
    forwarded: string;
    mediaReceived: string;
    error: string;
    default: string;
    unknownPitch: string;
}

const templates: Record<Lang, GreetingSet> = {
    he: {
        initial: (name) =>
            `היי, אני פורלי העוזרת של "${name}". ראיתי שניסית להתקשר ולא הצלחת להשיג אותנו.\nאיך נוכל לעזור?`,
        callNow: 'מה קרה? תכתוב לי בקצרה ואעביר לנציג לחזרה דחופה. 📞',
        scheduleCall: 'מעולה. מתי נוח שיחזרו אליך? 🕐',
        callbackConfirmed: 'סגור. העברתי לעסק, יחזרו אליך בזמן שביקשת. ✅',
        forwarded: 'שלחתי את הפרטים לעסק, יחזרו אליך בהקדם. 📨',
        mediaReceived: 'קיבלתי! העברתי את הקובץ לעסק, יחזרו אליך בהקדם. 📎',
        error: 'מצטערת, משהו השתבש. אנא נסה שוב מאוחר יותר.',
        default: 'איך אוכל לעזור? 😊',
        unknownPitch:
            'שלום! 👋 אני פורלי — עוזרת אישית חכמה לעסקים.\n\nאני עוזרת לעסקים לטפל בשיחות שלא נענו ולא להפסיד לקוחות.\n\n🔗 רוצה לשמוע עוד? בקר ב-call4li.com',
    },
    ar: {
        initial: (name) =>
            `مرحباً، أنا فورلي مساعدة "${name}". لاحظت أنك حاولت الاتصال ولم تستطع الوصول إلينا.\nكيف يمكننا مساعدتك؟`,
        callNow: 'ماذا حدث؟ اكتب لي باختصار وسأحيلك إلى ممثل للرد العاجل. 📞',
        scheduleCall: 'ممتاز. متى يناسبك أن يعاودوا الاتصال بك؟ 🕐',
        callbackConfirmed: 'تم. أبلغت الشركة، سيعاودون الاتصال بك في الوقت المطلوب. ✅',
        forwarded: 'أرسلت التفاصيل للشركة، سيعاودون الاتصال بك قريباً. 📨',
        mediaReceived: 'استلمت! أرسلت الملف للشركة، سيعاودون الاتصال بك قريباً. 📎',
        error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.',
        default: 'كيف يمكنني مساعدتك؟ 😊',
        unknownPitch:
            'مرحباً! 👋 أنا فورلي — مساعدة ذكية للشركات.\n\nأساعد الشركات في التعامل مع المكالمات الفائتة وعدم خسارة العملاء.\n\n🔗 تريد معرفة المزيد؟ قم بزيارة call4li.com',
    },
    en: {
        initial: (name) =>
            `Hi, I'm Forli, the assistant of "${name}". I noticed you tried to call and couldn't reach us.\nHow can we help?`,
        callNow: "What happened? Write me briefly and I'll forward it to a representative for an urgent callback. 📞",
        scheduleCall: 'Great. When would be a good time for a callback? 🕐',
        callbackConfirmed: "Done. I've informed the business, they'll call you back at the requested time. ✅",
        forwarded: "I've sent the details to the business, they'll get back to you shortly. 📨",
        mediaReceived: "Got it! I've forwarded the file to the business, they'll get back to you soon. 📎",
        error: 'Sorry, something went wrong. Please try again later.',
        default: 'How can I help? 😊',
        unknownPitch:
            "Hi! 👋 I'm Forli — a smart assistant for businesses.\n\nI help businesses handle missed calls and never lose a customer.\n\n🔗 Want to learn more? Visit call4li.com",
    },
};

export function getGreeting(lang: string): GreetingSet {
    return templates[lang as Lang] || templates.he;
}
