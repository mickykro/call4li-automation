// ============================================================
// Call4li — Shared TypeScript Types
// ============================================================

export type PlanTier = 'free' | 'basic' | 'premium';
export type BusinessStatus = 'pending' | 'active' | 'suspended';
export type ConversationStatus = 'open' | 'resolved' | 'waiting_callback';
export type MessageSender = 'customer' | 'forli' | 'business';
export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'buttons';
export type CallbackStatus = 'scheduled' | 'reminded' | 'completed' | 'missed';
export type Language = 'he' | 'ar' | 'en';

// ─── Business ────────────────────────────────────────────────
export interface Business {
    id: string;                 // e.g. "P8M2A-BIZ"
    ownerName: string;
    businessName: string;
    description: string;
    phone: string;
    plan: PlanTier;
    status: BusinessStatus;
    followMeActive: boolean;
    twilioNumber?: string;
    language: Language;
    customButtons?: string[];   // up to 3 (premium)
    createdAt: string;          // ISO
    updatedAt: string;
}

// ─── Knowledge Base ──────────────────────────────────────────
export interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export interface BusinessKnowledge {
    businessId: string;
    faqs: FAQ[];
    hours?: string;
    location?: string;
    policy?: string;
    products?: Product[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price?: number;
    imageUrl?: string;
}

// ─── Conversations ───────────────────────────────────────────
export interface Conversation {
    id: string;
    businessId: string;
    customerPhone: string;
    status: ConversationStatus;
    summary?: string;
    language: Language;
    callbackTime?: string;     // ISO
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    sender: MessageSender;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    buttons?: ButtonAction[];
    createdAt: string;
}

export interface ButtonAction {
    id: string;
    label: string;
    action: string;
}

// ─── Callbacks ───────────────────────────────────────────────
export interface Callback {
    id: string;
    conversationId: string;
    businessId: string;
    customerPhone: string;
    rawText: string;
    normalizedTime: string;    // ISO
    confidence: number;
    status: CallbackStatus;
    createdAt: string;
}

// ─── Media ───────────────────────────────────────────────────
export interface Media {
    id: string;
    conversationId: string;
    type: 'image' | 'document' | 'voice';
    url: string;
    analysis?: string;
    createdAt: string;
}

// ─── Leads ───────────────────────────────────────────────────
export interface Lead {
    id: string;
    businessId: string;
    name: string;
    phone: string;
    businessName: string;
    status: string;
    source: string;
    description: string;
    signupStep?: string;
    chatHistory?: string;
    createdAt: string;
    lastCalledAt?: string;
}

// ─── Admin ───────────────────────────────────────────────────
export interface Broadcast {
    id: string;
    message: string;
    targetType: 'all_businesses' | 'business_customers';
    targetBusinessId?: string;
    sentAt: string;
    sentBy: string;
}
