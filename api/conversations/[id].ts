import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../_lib/firebase-admin.js';

/**
 * GET /api/conversations/[id] — Get conversation with messages
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const convId = Array.isArray(id) ? id[0] : id;

    if (!convId) {
        return res.status(400).json({ error: 'Missing conversation ID' });
    }

    try {
        const db = await getFirestore();

        const convDoc = await db.collection('conversations').doc(convId).get();
        if (!convDoc.exists) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messagesSnap = await db
            .collection('conversations')
            .doc(convId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return res.status(200).json({
            conversation: { id: convDoc.id, ...convDoc.data() },
            messages,
        });
    } catch (error) {
        console.error('Conversation detail error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
