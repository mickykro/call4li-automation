import { config as loadEnv } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../lib/firebase-admin';

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

    // Green API sometimes requires a shard-based host like 7105.api.greenapi.com
    const shardHost = (idInstance.length >= 4 ? `${idInstance.slice(0, 4)}.api.greenapi.com` : 'api.green-api.com');
    const baseUrl = `https://${shardHost}/waInstance${idInstance}`;
    const chatId = formatChatId(to);

    console.log('green send start', { chatId, baseUrl, hasId: !!idInstance, hasToken: !!apiTokenInstance });

    const resp = await fetch(`${baseUrl}/sendMessage/${apiTokenInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
    });

    const text = await resp.text();
    console.log('green send response', { status: resp.status, body: text });

    if (!resp.ok) {
        throw new Error(`Green API send failed: ${resp.status}`);
    }

    return { skipped: false };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone } = req.body || {};
    if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: 'Missing phone' });
    }

    console.log('request-otp incoming', { phone });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
        let stored = false;
        try {
            const db = await getFirestore();
            await db.collection('otp_codes').add({
                phone,
                code,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt,
            });
            stored = true;
        } catch (dbErr) {
            console.warn('Firestore unavailable, using in-memory OTP store', dbErr);
            memoryOtps.set(phone, { code, expiresAt });
        }

        const text = `קוד כניסה לדשבורד: ${code}\nהקוד בתוקף ל-10 דקות.`;
        const result = await sendWhatsApp(phone, text);

        console.log('request-otp sent', { to: phone, code, skipped: result.skipped, stored });

        return res.status(200).json({ ok: true, skipped: result.skipped });
    } catch (error) {
        console.error('OTP send error:', error);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
}

// Export in-memory store for verify handler fallback
export { memoryOtps };
