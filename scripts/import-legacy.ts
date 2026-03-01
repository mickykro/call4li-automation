import * as fs from 'fs';
import { getFirestore } from '../api/lib/firebase-admin.js';

// ─── CSV Parser ──────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    // DD/MM/YYYY HH:MM
    const m1 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (m1) {
        const [, day, month, year, hours, minutes] = m1;
        return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`).toISOString();
    }

    // YYYY-MM-DD HH:MM
    const m2 = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (m2) {
        const [, year, month, day, hours, minutes] = m2;
        return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`).toISOString();
    }

    // DD/MM/YYYY
    const m3 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m3) {
        const [, day, month, year] = m3;
        return new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
    }

    return new Date().toISOString();
}

function readCSV(filePath: string): { headers: string[]; rows: string[][] } {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/\s+$/, ''));
    const rows = lines.slice(1).map(l => parseCSVLine(l));
    return { headers, rows };
}

// ─── Importers ───────────────────────────────────────────────

async function importBusinesses() {
    console.log('\n═══ IMPORTING BUSINESSES ═══');
    const db = await getFirestore();
    const { rows } = readCSV('./prev_data/Call4li automation - Businesses (1).csv');

    // Deduplicate by business_id — keep last occurrence
    const bizMap = new Map<string, string[]>();
    for (const cols of rows) {
        const id = cols[0]?.trim();
        if (!id) continue;
        bizMap.set(id, cols);
    }

    let count = 0;
    for (const [id, cols] of bizMap) {
        const [
            business_id, business_name, phone_number, status, details, date,
            _wa_template, _notes, _blocked, business_profile_compact,
            policies_compact, faqs_compact, _updated_at, hours, _intent, _knowledge_stage
        ] = cols;

        const mappedStatus = status?.trim().toLowerCase() === 'activate' ? 'active'
            : status?.trim().toLowerCase() === 'disable' ? 'suspended'
                : 'pending';

        const businessData = {
            id: business_id.trim(),
            ownerName: business_name?.trim() || 'Unknown',
            businessName: business_name?.trim() || 'Unnamed',
            description: details?.trim() || '',
            phone: phone_number?.trim() || '',
            plan: 'basic',
            status: mappedStatus,
            followMeActive: mappedStatus === 'active',
            language: 'he',
            createdAt: parseDate(date),
            updatedAt: new Date().toISOString(),
        };

        await db.collection('businesses').doc(businessData.id).set(businessData);

        // Build knowledge doc
        const faqs: Array<{ id: string; question: string; answer: string }> = [];
        if (faqs_compact?.trim()) {
            faqs.push({
                id: `faq-legacy-${Date.now()}`,
                question: 'מידע כללי ושאלות נפוצות',
                answer: faqs_compact.trim(),
            });
        }

        const knowledgeData = {
            businessId: businessData.id,
            faqs,
            hours: hours?.trim() || '',
            policy: policies_compact?.trim() || '',
            location: '',
        };

        await db.collection('knowledge').doc(businessData.id).set(knowledgeData);
        console.log(`  ✅ ${businessData.id}: ${businessData.businessName} (${mappedStatus})`);
        count++;
    }

    console.log(`  📊 Imported ${count} businesses + knowledge docs\n`);
    return count;
}

async function importChats() {
    console.log('═══ IMPORTING CHATS ═══');
    const db = await getFirestore();
    const { rows } = readCSV('./prev_data/Call4li automation - Chats (2).csv');

    let chatCount = 0;
    let msgCount = 0;

    for (const cols of rows) {
        const chat_id = cols[0]?.trim();
        const business_id = cols[1]?.trim();
        if (!chat_id || !business_id) continue;

        const customer_name = cols[2]?.trim() || '';
        const customer_location = cols[3]?.trim() || '';
        const customer_issue = cols[4]?.trim() || '';
        const customer_number = cols[5]?.trim() || '';
        const last_message = cols[6]?.trim() || '';
        const status = cols[7]?.trim() || '';
        const date_created = cols[8]?.trim() || '';
        const chat_history = cols[11]?.trim() || '';
        const schedule = cols[13]?.trim() || '';
        const rolling_summary = cols[14]?.trim() || '';

        const mappedStatus = status.toLowerCase() === 'complete' ? 'resolved'
            : status.toLowerCase() === 'waiting_callback' ? 'waiting_callback'
                : 'open';

        const summary = rolling_summary || customer_issue || '';

        const conversationData: Record<string, any> = {
            id: chat_id,
            businessId: business_id,
            customerPhone: customer_number,
            status: mappedStatus,
            summary,
            language: 'he',
            createdAt: parseDate(date_created),
            lastMessageAt: parseDate(last_message || date_created),
            updatedAt: new Date().toISOString(),
        };

        if (customer_name) conversationData.customerName = customer_name;
        if (customer_location) conversationData.customerLocation = customer_location;
        if (schedule) conversationData.callbackTime = schedule;

        await db.collection('conversations').doc(chat_id).set(conversationData);
        chatCount++;

        // Parse chat_history into individual messages
        if (chat_history) {
            const messages = parseChatHistory(chat_history);
            for (const msg of messages) {
                await db.collection('conversations').doc(chat_id).collection('messages').add(msg);
                msgCount++;
            }
        }

        if (chatCount % 50 === 0) console.log(`  ... processed ${chatCount} conversations`);
    }

    console.log(`  📊 Imported ${chatCount} conversations, ${msgCount} messages\n`);
    return chatCount;
}

function parseChatHistory(raw: string): Array<Record<string, any>> {
    const messages: Array<Record<string, any>> = [];

    // Pattern: "SenderDD-MM-YYYY HH:MM: "message"" or "Bot (DD-MM-YYYY HH:MM): message"
    // Also handles: "YYYY-MM-DD HH:MM bot:message"

    // Try splitting by the bot/user pattern
    const segments = raw.split(/,\s*(?=\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+bot:|Bot\s*\(|[^,]{1,30}\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:)/);

    for (const seg of segments) {
        const trimmed = seg.trim().replace(/^,\s*/, '').replace(/^"/, '').replace(/"$/, '');
        if (!trimmed) continue;

        // bot message: "2025-12-07 10:17 bot:message"
        const botMatch = trimmed.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+bot:(.*)/s);
        if (botMatch) {
            messages.push({
                sender: 'forli',
                type: 'text',
                content: botMatch[3].trim().replace(/^""/, '').replace(/""$/, ''),
                createdAt: new Date(`${botMatch[1]}T${botMatch[2]}:00Z`).toISOString(),
            });
            continue;
        }

        // Bot (DD-MM-YYYY HH:MM): message
        const botMatch2 = trimmed.match(/Bot\s*\((\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\):\s*(.*)/s);
        if (botMatch2) {
            const [, day, month, year, h, m, content] = botMatch2;
            messages.push({
                sender: 'forli',
                type: 'text',
                content: content.trim(),
                createdAt: new Date(`${year}-${month}-${day}T${h}:${m}:00Z`).toISOString(),
            });
            continue;
        }

        // Customer message: "Name DD-MM-YYYY HH:MM: ""message"""
        const custMatch = trimmed.match(/(.+?)(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):\s*""?(.*?)""?\s*$/s);
        if (custMatch) {
            const [, _name, month, day, year, h, m, content] = custMatch;
            messages.push({
                sender: 'customer',
                type: 'text',
                content: content.trim(),
                createdAt: new Date(`${year}-${day}-${month}T${h}:${m}:00Z`).toISOString(),
            });
            continue;
        }

        // Fallback: save as-is
        if (trimmed.length > 2) {
            messages.push({
                sender: 'forli',
                type: 'text',
                content: `[LEGACY] ${trimmed}`,
                createdAt: new Date().toISOString(),
            });
        }
    }

    // If nothing was parsed, save the whole blob
    if (messages.length === 0 && raw.trim().length > 2) {
        messages.push({
            sender: 'forli',
            type: 'text',
            content: `[LEGACY LOG]\n${raw.trim()}`,
            createdAt: new Date().toISOString(),
        });
    }

    return messages;
}

async function importLeads() {
    console.log('═══ IMPORTING LEADS ═══');
    const db = await getFirestore();
    const { rows } = readCSV('./prev_data/Call4li automation - leads (1).csv');

    let count = 0;

    for (const cols of rows) {
        const business_id = cols[0]?.trim();
        if (!business_id) continue;

        const date = cols[1]?.trim() || '';
        const name = cols[4]?.trim() || '';
        const phone = cols[5]?.trim() || '';
        const business_name = cols[6]?.trim() || '';
        const status = cols[7]?.trim() || '';
        const last_called = cols[8]?.trim() || '';
        const chat_id = cols[9]?.trim() || '';
        const source = cols[11]?.trim() || '';
        const description = cols[12]?.trim() || '';
        const chat_history = cols[13]?.trim() || '';
        const signup_step = cols[14]?.trim() || '';
        const step_message = cols[15]?.trim() || '';

        // Use chat_id as doc ID if available, otherwise auto-generate
        const docId = chat_id || undefined;

        const leadData: Record<string, any> = {
            businessId: business_id,
            name,
            phone,
            businessName: business_name,
            status,
            source: source || 'website',
            description,
            createdAt: parseDate(date),
            updatedAt: new Date().toISOString(),
        };

        if (signup_step) leadData.signupStep = signup_step;
        if (step_message) leadData.stepMessage = step_message;
        if (chat_history) leadData.chatHistory = chat_history;
        if (last_called) leadData.lastCalledAt = parseDate(last_called);

        if (docId) {
            leadData.id = docId;
            await db.collection('leads').doc(docId).set(leadData);
        } else {
            const ref = await db.collection('leads').add(leadData);
            leadData.id = ref.id;
        }

        count++;
        if (count % 20 === 0) console.log(`  ... processed ${count} leads`);
    }

    console.log(`  📊 Imported ${count} leads\n`);
    return count;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
    console.log('🚀 Starting Call4li data migration...\n');

    const bizCount = await importBusinesses();
    const chatCount = await importChats();
    const leadCount = await importLeads();

    console.log('════════════════════════════════════');
    console.log(`✅ Migration complete!`);
    console.log(`   Businesses: ${bizCount}`);
    console.log(`   Conversations: ${chatCount}`);
    console.log(`   Leads: ${leadCount}`);
    console.log('════════════════════════════════════\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
