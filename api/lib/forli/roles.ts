/**
 * Role detection — determines if an incoming number is:
 * - A known customer of a specific business
 * - A business owner
 * - A new/unknown number
 * - Associated with multiple businesses
 */

import type { Firestore } from 'firebase-admin/firestore';

export interface RoleResult {
    type: 'customer' | 'owner' | 'unknown' | 'multi_business';
    businessId?: string;
    businesses?: Array<{ id: string; name: string }>;
}

export async function detectRole(phone: string, db: Firestore): Promise<RoleResult> {
    // 1) Check if this is a business owner
    const ownerSnap = await db
        .collection('businesses')
        .where('phone', '==', phone)
        .limit(1)
        .get();

    if (!ownerSnap.empty) {
        return {
            type: 'owner',
            businessId: ownerSnap.docs[0].id,
        };
    }

    // 2) Check if this is a known customer (has existing conversations)
    const convSnap = await db
        .collection('conversations')
        .where('customerPhone', '==', phone)
        .orderBy('lastMessageAt', 'desc')
        .limit(10)
        .get();

    if (convSnap.empty) {
        return { type: 'unknown' };
    }

    // Collect unique businesses
    const businessMap = new Map<string, string>();
    for (const doc of convSnap.docs) {
        const data = doc.data();
        if (!businessMap.has(data.businessId)) {
            businessMap.set(data.businessId, data.businessId);
        }
    }

    // Single business
    if (businessMap.size === 1) {
        const [businessId] = businessMap.keys();
        return { type: 'customer', businessId };
    }

    // Multiple businesses — need to ask which one
    const businesses: Array<{ id: string; name: string }> = [];
    for (const [bizId] of businessMap) {
        const bizDoc = await db.collection('businesses').doc(bizId).get();
        const data = bizDoc.data();
        businesses.push({ id: bizId, name: data?.businessName || bizId });
    }

    return {
        type: 'multi_business',
        businesses,
    };
}
