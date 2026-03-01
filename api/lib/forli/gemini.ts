import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeminiContext {
    businessName: string;
    description: string;
    faqs: Array<{ question: string; answer: string }>;
    policy: string;
    hours: string;
    location: string;
    customerPhone: string;
    currentTime: string;
}

export interface GeminiAnalysis {
    intent: 'answer' | 'schedule_callback' | 'forward' | 'unknown';
    response: string;
    normalizedTime?: string; // If intent is schedule_callback
}

export async function analyzeMessage(text: string, context: GeminiContext): Promise<GeminiAnalysis> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `
You are Forli (פורלי), an AI assistant for the business "${context.businessName}".
Your goal is to help customers by answering questions from the knowledge base or helping them schedule a callback if the business owner is unavailable.

BUSINESS KNOWLEDGE:
- Description: ${context.description}
- FAQs: ${context.faqs.map(f => `Q: ${f.question} | A: ${f.answer}`).join('\n')}
- Policy: ${context.policy}
- Hours: ${context.hours}
- Location: ${context.location}

CURRENT CONTEXT:
- Customer: ${context.customerPhone}
- Current Time: ${context.currentTime}

INSTRUCTIONS:
1. If the user asks a question that can be answered by the knowledge base, provide a helpful and concise answer in Hebrew. Set intent to "answer".
2. If the user wants to schedule a call, visit, or callback, try to detect the time they want. Set intent to "schedule_callback". If they mention a time, normalize it to "YYYY-MM-DD HH:MM".
3. If you cannot answer or the request is complex, set intent to "forward" and provide a polite acknowledgment.
4. Always respond in Hebrew. Use a friendly but professional tone.

OUTPUT FORMAT (JSON):
{
  "intent": "answer" | "schedule_callback" | "forward" | "unknown",
  "response": "Your response text here",
  "normalizedTime": "YYYY-MM-DD HH:MM" (optional)
}
`;

    const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Customer message: "${text}"` }
    ]);

    const responseText = result.response.text();

    try {
        // Find JSON block in response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as GeminiAnalysis;
        }
        throw new Error('No JSON found in response');
    } catch (e) {
        console.error('Failed to parse Gemini response:', responseText);
        return {
            intent: 'forward',
            response: 'מצטער, אני מתקשה להבין כרגע. אני מעביר את ההודעה שלך לבעל העסק.'
        };
    }
}
