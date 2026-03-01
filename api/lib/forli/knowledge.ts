/**
 * Knowledge base search — matches customer questions against business FAQ
 */

import type { Firestore } from 'firebase-admin/firestore';

export async function searchKnowledge(
    businessId: string,
    query: string,
    db: Firestore
): Promise<string | null> {
    try {
        const doc = await db.collection('knowledge').doc(businessId).get();
        if (!doc.exists) return null;

        const data = doc.data();
        if (!data) return null;

        const normalizedQuery = query.toLowerCase().trim();

        // Search FAQs
        if (data.faqs && Array.isArray(data.faqs)) {
            for (const faq of data.faqs) {
                const question = (faq.question || '').toLowerCase();
                // Simple keyword matching — in production, use AI semantic search
                if (
                    normalizedQuery.includes(question) ||
                    question.includes(normalizedQuery) ||
                    computeSimilarity(normalizedQuery, question) > 0.5
                ) {
                    return faq.answer;
                }
            }
        }

        // Search structured data
        if (matchesKeywords(normalizedQuery, ['שעות', 'hours', 'פתוח', 'סגור', 'ساعات'])) {
            return data.hours || null;
        }

        if (matchesKeywords(normalizedQuery, ['מיקום', 'כתובת', 'location', 'address', 'איפה', 'أين', 'عنوان'])) {
            return data.location ? `📍 ${data.location}` : null;
        }

        if (matchesKeywords(normalizedQuery, ['ביטול', 'מדיניות', 'cancel', 'policy', 'החזר', 'إلغاء'])) {
            return data.policy || null;
        }

        return null;
    } catch (error) {
        console.error('Knowledge search error:', error);
        return null;
    }
}

// ─── Helpers ─────────────────────────────────────────────────

function matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
}

/**
 * Simple word-overlap similarity score (0-1)
 * In production, this would use Claude API or embeddings
 */
function computeSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.split(/\s+/).filter(w => w.length > 1));
    const wordsB = new Set(b.split(/\s+/).filter(w => w.length > 1));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let overlap = 0;
    for (const word of wordsA) {
        if (wordsB.has(word)) overlap++;
    }

    return overlap / Math.max(wordsA.size, wordsB.size);
}
