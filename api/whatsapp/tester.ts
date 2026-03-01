import { config as loadEnv } from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleIncomingMessage } from '../lib/forli/engine.js';
import { detectLanguage, getGreeting } from '../lib/forli/language.js';

loadEnv();


/**
 * POST /api/whatsapp/tester
 * Process a message through the bot engine and send the real response via WhatsApp.
 * No webhook needed — the engine already has the input.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log('WhatsApp tester incoming', req.body);
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        from,
        text = '',
        isButtonClick = false,
        mediaUrl,
        mediaContentType,
    } = req.body || {};

    if (!from) {
        return res.status(400).json({ error: 'Missing required field: from' });
    }

    if (!text && !mediaUrl) {
        return res.status(400).json({ error: 'Provide text or mediaUrl' });
    }

    try {
        const media = mediaUrl
            ? [{ url: mediaUrl as string, contentType: (mediaContentType as string) || 'application/octet-stream' }]
            : [];

        let response: { text: string; buttons?: string[] };
        let mode: string;

        try {
            response = await handleIncomingMessage({
                from,
                text,
                media,
                isButtonClick: Boolean(isButtonClick),
                isTest: true,
            });
            mode = 'engine';
        } catch (engineErr: any) {
            console.warn('Engine unavailable, using fallback:', engineErr);
            console.log('Original message:', { from, text, media, isButtonClick });
            const lang = detectLanguage(text);
            const greetings = getGreeting(lang);

            // Format the error message to be visible in the chat UI
            const errMsg = engineErr?.message || String(engineErr);

            const fallback = text.trim()
                ? `${greetings.forwarded}\n\n(תשובת דמו — מנוע לא זמין: ${errMsg})`
                : greetings.unknownPitch;

            response = { text: fallback };
            mode = 'fallback';

            // Also include it in the JSON response details
            (response as any).errorReason = errMsg;
        }

        // Return the response so it can be viewed in the UI tester
        return res.status(200).json({ ok: true, response, mode, sent: false });
    } catch (error) {
        console.error('WhatsApp tester error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
            ok: false,
            error: 'Failed to process and send message',
            details: message,
        });
    }
}
