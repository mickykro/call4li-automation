import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleIncomingMessage } from '../lib/forli/engine';

/**
 * Green API WhatsApp Webhook — Handles incoming WhatsApp messages
 *
 * POST /api/webhooks/twilio-whatsapp
 *
 * Green API sends JSON payloads with the following structure:
 * {
 *   "typeWebhook": "incomingMessageReceived",
 *   "instanceData": { "idInstance": 1234, "wid": "972XXXXXXXXX@c.us" },
 *   "timestamp": 1234567890,
 *   "idMessage": "ABC123",
 *   "senderData": {
 *     "chatId": "972XXXXXXXXX@c.us",
 *     "sender": "972XXXXXXXXX@c.us",
 *     "senderName": "John",
 *     "senderContactName": "John Doe"
 *   },
 *   "messageData": {
 *     "typeMessage": "textMessage" | "imageMessage" | "documentMessage" | "audioMessage" | "extendedTextMessage" | "buttonsResponseMessage" | "listResponseMessage",
 *     "textMessageData": { "textMessage": "..." },
 *     "extendedTextMessageData": { "text": "..." },
 *     "fileMessageData": { "downloadUrl": "...", "mimeType": "...", "fileName": "..." },
 *     "buttonsResponseMessage": { "selectedButtonId": "...", "selectedButtonText": "..." },
 *     "listResponseMessage": { "title": "...", "listResponseId": "..." }
 *   }
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;

        // Only handle incoming messages
        if (body.typeWebhook !== 'incomingMessageReceived') {
            return res.status(200).json({ ok: true });
        }

        const senderData = body.senderData || {};
        const messageData = body.messageData || {};

        // Extract phone number from Green API format (972XXXXXXXXX@c.us → +972XXXXXXXXX)
        const rawSender = senderData.sender || senderData.chatId || '';
        const customerPhone = '+' + rawSender.replace('@c.us', '');

        // Extract message text based on message type
        let messageText = '';
        let isButtonClick = false;
        const mediaUrls: Array<{ url: string; contentType: string }> = [];

        switch (messageData.typeMessage) {
            case 'textMessage':
                messageText = messageData.textMessageData?.textMessage || '';
                break;

            case 'extendedTextMessage':
                messageText = messageData.extendedTextMessageData?.text || '';
                break;

            case 'buttonsResponseMessage':
                messageText = messageData.buttonsResponseMessage?.selectedButtonText || '';
                isButtonClick = true;
                break;

            case 'listResponseMessage':
                messageText = messageData.listResponseMessage?.title || '';
                isButtonClick = true;
                break;

            case 'imageMessage':
            case 'documentMessage':
            case 'audioMessage':
            case 'videoMessage': {
                const fileData = messageData.fileMessageData || {};
                messageText = fileData.caption || messageData.textMessageData?.textMessage || '';
                if (fileData.downloadUrl) {
                    mediaUrls.push({
                        url: fileData.downloadUrl,
                        contentType: fileData.mimeType || 'application/octet-stream',
                    });
                }
                break;
            }

            default:
                messageText = '';
        }

        // Process through Forli engine
        const response = await handleIncomingMessage({
            from: customerPhone,
            text: messageText,
            media: mediaUrls,
            isButtonClick,
        });

        // Send reply via Green API
        const idInstance = process.env.GREEN_API_INSTANCE_ID;
        const apiTokenInstance = process.env.GREEN_API_TOKEN;

        if (idInstance && apiTokenInstance) {
            const chatId = rawSender;

            await fetch(
                `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatId,
                        message: response.text,
                    }),
                }
            );
        }

        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Green API webhook error:', error);
        return res.status(200).json({ ok: true }); // Always return 200 to prevent retries
    }
}
