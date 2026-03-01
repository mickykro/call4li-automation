import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from './_lib/firebase-admin.js';

/**
 * GET /api/conversations?businessId=XXX
 * List conversations for a business
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { businessId } = req.query;
    if (!businessId) {
        return res.status(400).json({ error: 'Missing businessId query param' });
    }

    try {
        const db = await getFirestore();
        const snap = await db
            .collection('conversations')
            .where('businessId', '==', businessId)
            .orderBy('lastMessageAt', 'desc')
            .limit(50)
            .get();

        const conversations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json({ conversations });
    } catch (error) {
        console.error('Conversations list error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
