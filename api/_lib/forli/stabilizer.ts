/**
 * Conversation stabilizer — auto-summarizes conversations after inactivity
 * 
 * This would typically run as a cron job or scheduled function.
 * After 10 minutes of no messages from the customer, Forli creates
 * an AI summary and sends it to the business.
 */

import type { Firestore } from 'firebase-admin/firestore';

const STABILIZATION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export async function checkAndStabilize(db: Firestore): Promise<number> {
    const cutoff = new Date(Date.now() - STABILIZATION_TIMEOUT_MS).toISOString();

    // Find open conversations with last message older than 10 min
    const snap = await db
        .collection('conversations')
        .where('status', '==', 'open')
        .where('lastMessageAt', '<', cutoff)
        .limit(20)
        .get();

    let stabilized = 0;

    for (const doc of snap.docs) {
        const data = doc.data();

        // Get all messages
        const messagesSnap = await db
            .collection('conversations')
            .doc(doc.id)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        if (messagesSnap.empty) continue;

        const messages = messagesSnap.docs.map(m => m.data());

        // Generate summary
        const summary = generateSummary(messages);

        // Update conversation
        await db.collection('conversations').doc(doc.id).update({
            status: 'resolved',
            summary,
            updatedAt: new Date().toISOString(),
        });

        // TODO: Send summary to business via WhatsApp
        // await sendSummaryToBusiness(data.businessId, data.customerPhone, summary);

        stabilized++;
    }

    return stabilized;
}

/**
 * Generate a conversation summary from messages.
 * In production, this would use Claude API for intelligent summarization.
 */
function generateSummary(messages: Array<Record<string, unknown>>): string {
    const customerMessages = messages
        .filter(m => m.sender === 'customer')
        .map(m => m.content as string)
        .filter(Boolean);

    if (customerMessages.length === 0) {
        return 'הלקוח לא הגיב להודעת הפתיחה.';
    }

    if (customerMessages.length === 1) {
        return `הלקוח כתב: "${customerMessages[0]}"`;
    }

    return `הלקוח שלח ${customerMessages.length} הודעות. תוכן: ${customerMessages.slice(0, 2).join(', ')}${customerMessages.length > 2 ? '...' : ''}`;
}
