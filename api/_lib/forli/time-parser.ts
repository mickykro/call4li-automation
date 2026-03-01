/**
 * Natural language time parser for callback scheduling
 * Handles Hebrew, Arabic, and English time expressions
 */

export interface TimeParseResult {
    rawText: string;
    normalizedTime: string; // ISO 8601
    confidence: number;     // 0-1
}

const hebrewTimePatterns = [
    // "מחר ב-8" / "מחר בשמונה"
    { regex: /מחר\s*(?:ב-?\s*)?(\d{1,2})(?::(\d{2}))?/i, handler: parseTomorrow },
    // "היום ב-16" / "היום בערב"
    { regex: /היום\s*(?:ב-?\s*)?(\d{1,2})(?::(\d{2}))?/i, handler: parseToday },
    // "היום בערב"
    { regex: /היום\s*בערב/i, handler: parseTodayEvening },
    // "בין 16 ל-18" / "בין 4 ל-6"
    { regex: /בין\s*(\d{1,2})\s*ל-?\s*(\d{1,2})/i, handler: parseRange },
    // "בעוד שעה"
    { regex: /בעוד\s*(\d+)?\s*שעה/i, handler: parseInHours },
    // "בעוד חצי שעה"
    { regex: /בעוד\s*חצי\s*שעה/i, handler: parseInHalfHour },
    // Raw time "14:00" / "16:30"
    { regex: /^(\d{1,2}):(\d{2})$/i, handler: parseRawTime },
    // Just a number  "8" / "16"
    { regex: /^(\d{1,2})$/, handler: parseRawHour },
];

export function parseTime(text: string): TimeParseResult {
    const trimmed = text.trim();

    for (const pattern of hebrewTimePatterns) {
        const match = trimmed.match(pattern.regex);
        if (match) {
            const result = pattern.handler(match);
            if (result) {
                return {
                    rawText: trimmed,
                    ...result,
                };
            }
        }
    }

    // No match
    return {
        rawText: trimmed,
        normalizedTime: '',
        confidence: 0,
    };
}

// ─── Handlers ────────────────────────────────────────────────

function parseTomorrow(match: RegExpMatchArray): { normalizedTime: string; confidence: number } | null {
    const hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    if (hour < 0 || hour > 23) return null;

    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return { normalizedTime: d.toISOString(), confidence: 0.9 };
}

function parseToday(match: RegExpMatchArray): { normalizedTime: string; confidence: number } | null {
    const hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    if (hour < 0 || hour > 23) return null;

    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    // If time already passed, move to tomorrow
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return { normalizedTime: d.toISOString(), confidence: 0.85 };
}

function parseTodayEvening(): { normalizedTime: string; confidence: number } {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return { normalizedTime: d.toISOString(), confidence: 0.6 };
}

function parseRange(match: RegExpMatchArray): { normalizedTime: string; confidence: number } | null {
    const from = parseInt(match[1], 10);
    const to = parseInt(match[2], 10);
    const mid = Math.floor((from + to) / 2);

    const d = new Date();
    d.setHours(mid, 0, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return { normalizedTime: d.toISOString(), confidence: 0.7 };
}

function parseInHours(match: RegExpMatchArray): { normalizedTime: string; confidence: number } {
    const hours = match[1] ? parseInt(match[1], 10) : 1;
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    return { normalizedTime: d.toISOString(), confidence: 0.85 };
}

function parseInHalfHour(): { normalizedTime: string; confidence: number } {
    const d = new Date();
    d.setTime(d.getTime() + 30 * 60 * 1000);
    return { normalizedTime: d.toISOString(), confidence: 0.9 };
}

function parseRawTime(match: RegExpMatchArray): { normalizedTime: string; confidence: number } | null {
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    if (hour < 0 || hour > 23) return null;

    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return { normalizedTime: d.toISOString(), confidence: 0.8 };
}

function parseRawHour(match: RegExpMatchArray): { normalizedTime: string; confidence: number } | null {
    const hour = parseInt(match[1], 10);
    if (hour < 0 || hour > 23) return null;

    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return { normalizedTime: d.toISOString(), confidence: 0.65 };
}
