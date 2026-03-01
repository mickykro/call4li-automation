import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin';

/**
 * POST /api/verify/follow-me
 * Verify that Follow-Me call forwarding is active for a business
 *
 * This is triggered by the Twilio test calls after Follow-Me activation
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { businessId, testCallSid, verified } = req.body;

        if (!businessId) {
            return res.status(400).json({ error: 'Missing businessId' });
        }

        const db = await getFirestore();
        const businessRef = db.collection('businesses').doc(businessId);
        const doc = await businessRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        if (verified) {
            await businessRef.update({
                followMeActive: true,
                status: 'active',
                updatedAt: new Date().toISOString(),
            });

            // TODO: Send WhatsApp confirmation to business owner
            // "מעולה! ההעברה פועלת. מעכשיו כל שיחה שלא תענה תגרום לי לשלוח הודעת WhatsApp ללקוח ולעזור לו."

            return res.status(200).json({ success: true, followMeActive: true });
        }

        return res.status(200).json({ success: false, followMeActive: false });
    } catch (error) {
        console.error('Follow-Me verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
