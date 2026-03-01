import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin';

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
 * POST /api/business/create
 * Create a new business during onboarding
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { ownerName, businessName, description, phone } = req.body;

        if (!ownerName || !businessName || !phone) {
            return res.status(400).json({ error: 'Missing required fields: ownerName, businessName, phone' });
        }

        const db = await getFirestore();
        const bizId = generateBizId();

        const businessData = {
            id: bizId,
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

        await db.collection('businesses').doc(bizId).set(businessData);

        // Create empty knowledge base
        await db.collection('knowledge').doc(bizId).set({
            businessId: bizId,
            faqs: [],
            hours: '',
            location: '',
            policy: '',
            products: [],
        });

        return res.status(201).json({
            success: true,
            business: businessData,
            onboardingUrl: `${process.env.VITE_APP_URL || 'https://call4li.com'}/onboard/${bizId}`,
        });
    } catch (error) {
        console.error('Create business error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
