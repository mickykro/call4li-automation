import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../_lib/firebase-admin.js';

/**
 * POST /api/callbacks/schedule
 * Schedule a callback and create a reminder
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { conversationId, businessId, customerPhone, rawText, normalizedTime, confidence } = req.body;

        if (!conversationId || !businessId || !normalizedTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const db = await getFirestore();

        // Create callback record
        const callbackData = {
            conversationId,
            businessId,
            customerPhone,
            rawText: rawText || '',
            normalizedTime,
            confidence: confidence || 0.8,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
        };

        const ref = await db.collection('callbacks').add(callbackData);

        // Update conversation status
        await db.collection('conversations').doc(conversationId).update({
            status: 'waiting_callback',
            callbackTime: normalizedTime,
            updatedAt: new Date().toISOString(),
        });

        // Create reminder job (30 min before callback time)
        const callbackDate = new Date(normalizedTime);
        const reminderDate = new Date(callbackDate.getTime() - 30 * 60 * 1000);

        await db.collection('jobs').add({
            type: 'callback_reminder',
            callbackId: ref.id,
            businessId,
            customerPhone,
            scheduledFor: reminderDate.toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString(),
        });

        return res.status(201).json({
            success: true,
            callbackId: ref.id,
            scheduledFor: normalizedTime,
            reminderAt: reminderDate.toISOString(),
        });
    } catch (error) {
        console.error('Schedule callback error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
