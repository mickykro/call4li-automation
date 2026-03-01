import { config as loadEnv } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin.js';

loadEnv();

const memoryOtps = new Map<string, { code: string; expiresAt: number }>();

function formatChatId(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '972' + cleaned.slice(1);
    if (!cleaned.startsWith('972')) cleaned = '972' + cleaned;
    return `${cleaned}@c.us`;
}

async function sendWhatsApp(to: string, message: string) {
    const idInstance = process.env.GREEN_API_INSTANCE_ID;
    const apiTokenInstance = process.env.GREEN_API_TOKEN;
    if (!idInstance || !apiTokenInstance) {
        throw new Error('Missing Green API credentials');
    }

    const shardHost = (idInstance.length >= 4 ? `${idInstance.slice(0, 4)}.api.greenapi.com` : 'api.green-api.com');
    const baseUrl = `https://${shardHost}/waInstance${idInstance}`;
    const chatId = formatChatId(to);

    const resp = await fetch(`${baseUrl}/sendMessage/${apiTokenInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
    });

    if (!resp.ok) {
        throw new Error(`Green API send failed: ${resp.status}`);
    }

    return { skipped: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (action === 'request-otp') {
        const { phone } = req.body || {};
        if (!phone || typeof phone !== 'string') {
            return res.status(400).json({ error: 'Missing phone' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        try {
            try {
                const db = await getFirestore();
                await db.collection('otp_codes').add({
                    phone,
                    code,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    expiresAt,
                });
            } catch (dbErr) {
                console.warn('Firestore unavailable, using in-memory OTP store', dbErr);
                memoryOtps.set(phone, { code, expiresAt });
            }

            const text = `קוד כניסה לדשבורד: ${code}\nהקוד בתוקף ל-10 דקות.`;
            await sendWhatsApp(phone, text);

            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error('OTP send error:', error);
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    }

    if (action === 'verify-otp') {
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
                const otpSnap = await db
                    .collection('otp_codes')
                    .where('phone', '==', phone)
                    .orderBy('createdAt', 'desc')
                    .limit(1)
                    .get();

                if (!otpSnap.empty) {
                    const otpDoc = otpSnap.docs[0];
                    const otpData = otpDoc.data();

                    if (otpData.status === 'pending' && Date.now() <= (otpData.expiresAt || 0) && otpData.code === otp) {
                        const snap = await db.collection('businesses').where('phone', '==', phone).limit(1).get();
                        if (snap.empty) return res.status(404).json({ error: 'Business not found' });

                        const doc = snap.docs[0];
                        const data = doc.data();
                        if (data.plan !== 'premium') return res.status(403).json({ error: 'Premium plan required' });

                        await otpDoc.ref.update({ status: 'used', usedAt: new Date().toISOString() });
                        otpVerified = true;
                        businessId = doc.id;
                        businessName = data.businessName;
                    }
                }
            } catch (dbErr) {
                console.warn('Firestore unavailable for verify, trying memory store', dbErr);
            }

            if (!otpVerified) {
                const record = memoryOtps.get(phone);
                if (record && Date.now() <= record.expiresAt && record.code === otp) {
                    otpVerified = true;
                    businessId = 'dev-business';
                    businessName = 'Dev Business';
                    memoryOtps.delete(phone);
                }
            }

            if (!otpVerified) return res.status(401).json({ error: 'Invalid or expired OTP' });
            return res.status(200).json({ ok: true, businessId, businessName });
        } catch (error) {
            console.error('OTP verify error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(404).json({ error: 'Action not found' });
}
