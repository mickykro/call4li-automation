/**
 * Media handler — processes images, documents, and voice messages
 * Stores in Firebase Storage and optionally analyzes with AI
 */

import type { Firestore } from 'firebase-admin/firestore';

interface MediaInput {
    url: string;
    contentType: string;
    conversationId: string;
    businessId: string;
}

export async function handleMedia(input: MediaInput, db: Firestore): Promise<string> {
    const { url, contentType, conversationId, businessId } = input;

    // Determine media type
    let type: 'image' | 'document' | 'voice';
    if (contentType.startsWith('image/')) type = 'image';
    else if (contentType.startsWith('audio/')) type = 'voice';
    else type = 'document';

    // Save metadata to Firestore
    const mediaData = {
        conversationId,
        type,
        url,
        contentType,
        analysis: null as string | null,
        createdAt: new Date().toISOString(),
    };

    // In production: download from Twilio, re-upload to Firebase Storage
    // For now, we store the Twilio URL directly

    // AI Analysis placeholder
    // In production, this would use Claude API:
    // - Image: "Describe what's in this image"
    // - Document: "Extract key information from this document"
    // - Voice: "Transcribe this audio message" (first convert with a speech-to-text service)
    switch (type) {
        case 'image':
            mediaData.analysis = 'תמונה שנשלחה מהלקוח — ממתינה לניתוח';
            break;
        case 'voice':
            mediaData.analysis = 'הודעה קולית — ממתינה לתמלול';
            break;
        case 'document':
            mediaData.analysis = 'מסמך — ממתין לניתוח';
            break;
    }

    await db.collection('media').add(mediaData);

    return mediaData.analysis || '';
}
