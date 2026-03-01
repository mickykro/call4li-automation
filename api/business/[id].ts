import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin';

/**
 * GET /api/business/[id] — Get business by ID
 * PUT /api/business/[id] — Update business
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;
    const bizId = Array.isArray(id) ? id[0] : id;

    if (!bizId) {
        return res.status(400).json({ error: 'Missing business ID' });
    }

    const db = await getFirestore();

    try {
        if (req.method === 'GET') {
            const doc = await db.collection('businesses').doc(bizId).get();
            if (!doc.exists) {
                return res.status(404).json({ error: 'Business not found' });
            }
            return res.status(200).json(doc.data());
        }

        if (req.method === 'PUT') {
            const updates = req.body;
            updates.updatedAt = new Date().toISOString();
            await db.collection('businesses').doc(bizId).update(updates);
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Business API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
