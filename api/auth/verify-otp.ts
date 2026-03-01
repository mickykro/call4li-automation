import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin';
import { memoryOtps } from './request-otp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, otp } = req.body || {};

    if (!phone || !otp) {
        return res.status(400).json({ error: 'Missing phone or otp' });
    }

    try {
        let otpVerified = false;
        let businessId = '';
        let businessName = '';

        try {
            const db = await getFirestore();

            // Validate OTP from Firestore
            const otpSnap = await db
                .collection('otp_codes')
                .where('phone', '==', phone)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!otpSnap.empty) {
                const otpDoc = otpSnap.docs[0];
                const otpData = otpDoc.data();

                if (otpData.status !== 'pending') {
                    return res.status(401).json({ error: 'OTP already used' });
                }

                if (Date.now() > (otpData.expiresAt || 0)) {
                    return res.status(401).json({ error: 'OTP expired' });
                }

                if (otpData.code !== otp) {
                    return res.status(401).json({ error: 'Invalid OTP' });
                }

                // Check plan
                const snap = await db
                    .collection('businesses')
                    .where('phone', '==', phone)
                    .limit(1)
                    .get();

                if (snap.empty) {
                    return res.status(404).json({ error: 'Business not found for this phone' });
                }

                const doc = snap.docs[0];
                const data = doc.data();

                if (data.plan !== 'premium') {
                    return res.status(403).json({ error: 'Premium plan required' });
                }

                await otpDoc.ref.update({ status: 'used', usedAt: new Date().toISOString() });

                otpVerified = true;
                businessId = doc.id;
                businessName = data.businessName;
            }
        } catch (dbErr) {
            console.warn('Firestore unavailable for verify, trying memory store', dbErr);
        }

        if (!otpVerified) {
            const record = memoryOtps.get(phone);
            if (!record) return res.status(401).json({ error: 'OTP not found' });
            if (Date.now() > record.expiresAt) return res.status(401).json({ error: 'OTP expired' });
            if (record.code !== otp) return res.status(401).json({ error: 'Invalid OTP' });

            // In memory mode we cannot check plan safely, assume premium for dev; for production require Firestore.
            otpVerified = true;
            businessId = 'dev-business';
            businessName = 'Dev Business';
            memoryOtps.delete(phone);
        }

        return res.status(200).json({ ok: true, businessId, businessName });
    } catch (error) {
        console.error('OTP verify error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
