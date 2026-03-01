import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/whatsapp/send
 * Send a WhatsApp message via Green API
 *
 * Green API endpoints:
 *   - sendMessage: https://api.green-api.com/waInstance{idInstance}/sendMessage/{apiTokenInstance}
 *   - sendFileByUrl: https://api.green-api.com/waInstance{idInstance}/sendFileByUrl/{apiTokenInstance}
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, message, buttons, fileUrl, fileName } = req.body;

        if (!to || !message) {
            return res.status(400).json({ error: 'Missing required fields: to, message' });
        }

        const idInstance = process.env.GREEN_API_INSTANCE_ID;
        const apiTokenInstance = process.env.GREEN_API_TOKEN;

        if (!idInstance || !apiTokenInstance) {
            console.error('Missing Green API credentials');
            return res.status(500).json({ error: 'Green API configuration missing' });
        }

        const shardHost = (idInstance.length >= 4 ? `${idInstance.slice(0, 4)}.api.greenapi.com` : 'api.green-api.com');
        const baseUrl = `https://${shardHost}/waInstance${idInstance}`;

        // Format phone to Green API chatId (972XXXXXXXXX@c.us)
        const chatId = formatChatId(to);

        // Send file if provided
        if (fileUrl) {
            const fileResponse = await fetch(`${baseUrl}/sendFileByUrl/${apiTokenInstance}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId,
                    urlFile: fileUrl,
                    fileName: fileName || 'file',
                    caption: message,
                }),
            });

            const fileData = await fileResponse.json();
            return res.status(200).json({ success: true, idMessage: fileData.idMessage });
        }

        // Send text message
        const response = await fetch(`${baseUrl}/sendMessage/${apiTokenInstance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chatId,
                message,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Green API send error:', data);
            return res.status(response.status).json({ error: 'Failed to send WhatsApp message', details: data });
        }

        return res.status(200).json({
            success: true,
            idMessage: data.idMessage,
        });
    } catch (error) {
        console.error('WhatsApp send error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Format phone number to Green API chatId format
 * Input: "+972501234567" or "972501234567" or "0501234567"
 * Output: "972501234567@c.us"
 */
function formatChatId(phone: string): string {
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');

    // Convert Israeli local format to international
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.slice(1);
    }

    return `${cleaned}@c.us`;
}
