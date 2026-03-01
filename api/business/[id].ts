import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin.js';

/**
 * Generate a BIZ-ID in XXXXX-BIZ format
 */
function generateBizId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${result}-BIZ`;
}

/**
 * Combined Business Handler
 * handles:
 * POST /api/business/create
 * GET /api/business/[id]
 * PUT /api/business/[id]
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;
    const bizId = Array.isArray(id) ? id[0] : id;

    try {
        const db = await getFirestore();

        // Handle CREATE
        if (bizId === 'create' && req.method === 'POST') {
            const { ownerName, businessName, description, phone } = req.body;
            if (!ownerName || !businessName || !phone) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newId = generateBizId();
            const businessData = {
                id: newId,
                ownerName,
                businessName,
                description: description || '',
                phone,
                plan: 'free',
                status: 'pending',
                followMeActive: false,
                language: 'he',
                customButtons: ['שיחה עכשיו', 'קביעת שיחה'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.collection('businesses').doc(newId).set(businessData);
            await db.collection('knowledge').doc(newId).set({
                businessId: newId,
                faqs: [],
                hours: '',
                location: '',
                policy: '',
                products: [],
            });

            return res.status(201).json({
                success: true,
                business: businessData,
                onboardingUrl: `${process.env.VITE_APP_URL || 'https://call4li.com'}/onboard/${newId}`,
            });
        }

        // Handle DETAIL / UPDATE
        if (!bizId || bizId === 'create') {
            return res.status(400).json({ error: 'Invalid business ID' });
        }

        if (req.method === 'GET') {
            const doc = await db.collection('businesses').doc(bizId).get();
            if (!doc.exists) return res.status(404).json({ error: 'Business not found' });
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
