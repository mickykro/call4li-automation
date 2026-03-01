import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../_lib/firebase-admin.js';

/**
 * Twilio Voice Webhook — Handles missed call detection
 *
 * When a call is forwarded from a business phone to the Twilio number
 * (via Follow-Me), this webhook is triggered.
 *
 * POST /api/webhooks/twilio-voice
 * Body (from Twilio):
 *   - Called: Twilio number
 *   - Caller: Customer phone
 *   - CallStatus: completed | busy | no-answer | failed
 *   - ForwardedFrom: Business phone number
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { Caller, ForwardedFrom, CallStatus, Called } = req.body;

        // Only process missed calls (no-answer or busy)
        if (!['no-answer', 'busy', 'completed'].includes(CallStatus)) {
            return res.status(200).send('<Response></Response>');
        }

        const customerPhone = Caller;
        const businessPhone = ForwardedFrom || Called;

        const db = await getFirestore();

        // Find the business by phone number
        const businessSnap = await db
            .collection('businesses')
            .where('phone', '==', businessPhone)
            .limit(1)
            .get();

        if (businessSnap.empty) {
            console.warn(`No business found for phone: ${businessPhone}`);
            return res.status(200).send('<Response></Response>');
        }

        const business = businessSnap.docs[0];
        const businessData = business.data();
        const businessId = business.id;

        // Check if conversation already exists for this customer + business
        const existingConv = await db
            .collection('conversations')
            .where('businessId', '==', businessId)
            .where('customerPhone', '==', customerPhone)
            .where('status', 'in', ['open', 'waiting_callback'])
            .limit(1)
            .get();

        let conversationId: string;

        if (existingConv.empty) {
            // Create new conversation
            const convRef = await db.collection('conversations').add({
                businessId,
                customerPhone,
                status: 'open',
                language: 'he', // Default, will be updated on first message
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastMessageAt: new Date().toISOString(),
            });
            conversationId = convRef.id;
        } else {
            conversationId = existingConv.docs[0].id;
            await db.collection('conversations').doc(conversationId).update({
                updatedAt: new Date().toISOString(),
            });
        }

        // TODO: Send WhatsApp greeting message to customer via Twilio API
        // This would call /api/whatsapp/send with the initial greeting template
        console.log(`[Missed Call] Business: ${businessData.businessName}, Customer: ${customerPhone}`);

        // Return TwiML response
        return res.status(200).send('<Response></Response>');
    } catch (error) {
        console.error('Twilio Voice webhook error:', error);
        return res.status(500).send('<Response></Response>');
    }
}
