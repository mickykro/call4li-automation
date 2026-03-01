import { useEffect, useMemo, useState } from 'react';
import {
    Bot,
    Send,
    FlaskConical,
    RefreshCcw,
    Phone,
    Loader2,
    AlertTriangle,
    MessageSquare,
    Clock,
    Wand2,
} from 'lucide-react';

type ChatEntry = {
    id: string;
    sender: 'tester' | 'bot';
    text: string;
    time: string;
    meta?: string;
    buttons?: string[];
};

const quickTemplates = [
    { label: 'שעות פעילות', value: 'מה שעות הפעילות שלכם?', hint: 'שאלה רגילה מלקוח' },
    { label: 'קבעו שיחה', value: 'תתקשרו אלי ב-14:30', hint: 'בודק הבנת זמן' },
    { label: 'דמו לבעלים', value: 'דמו', hint: 'מפעיל מצב הדגמה' },
    { label: 'הוסף ידע', value: 'הוסף שאלה: מה הכתובת? - רחוב הים 15', hint: 'מוסיף שאלה/תשובה' },
];

export default function WhatsAppTesterPage() {
    const [from, setFrom] = useState('+972501234567');
    const [text, setText] = useState('מה שעות הפעילות שלכם?');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaContentType, setMediaContentType] = useState('');
    const [isButtonClick, setIsButtonClick] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ChatEntry[]>([{
        id: 'intro',
        sender: 'bot',
        text: 'הקלד הודעה כאילו אתה בוואטסאפ וקבל את התגובה של הבוט. ניתן גם לדמות לחיצה על כפתור או לשלוח קישור לקובץ.',
        time: formatTime(new Date()),
    }]);

    const latestBotResponse = useMemo(() => history.filter(h => h.sender === 'bot').slice(-1)[0], [history]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('call4li:dashboard-access');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.phone) {
                    setFrom(parsed.phone as string);
                }
            }
        } catch (err) {
            console.warn('Failed to load stored phone', err);
        }
    }, []);

    async function handleSend() {
        if (!from.trim()) {
            setError('צריך להזין מספר שולח');
            return;
        }

        if (!text.trim() && !mediaUrl.trim()) {
            setError('צריך להזין טקסט או קישור לקובץ');
            return;
        }

        setError(null);
        const now = new Date();
        const newEntry: ChatEntry = {
            id: `tester-${now.getTime()}`,
            sender: 'tester',
            text: text || mediaUrl,
            time: formatTime(now),
            meta: isButtonClick ? 'לחיצה על כפתור' : mediaUrl ? 'כולל מדיה' : undefined,
        };

        setHistory(prev => [...prev, newEntry]);
        setSending(true);

        try {
            const res = await fetch('/api/whatsapp/tester', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: from.trim(),
                    text,
                    isButtonClick,
                    mediaUrl: mediaUrl.trim() || undefined,
                    mediaContentType: mediaContentType.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'הבקשה נכשלה');
            }

            const botText: string = data.response?.text || 'לא התקבלה תגובה';
            const buttons: string[] | undefined = data.response?.buttons;

            setHistory(prev => [
                ...prev,
                {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: botText,
                    buttons,
                    time: formatTime(new Date()),
                    meta: data.mode === 'fallback' ? 'תשובת דמו' : undefined,
                },
            ]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'שגיאה לא ידועה';
            setError(message);
        } finally {
            setSending(false);
        }
    }

    function clearHistory() {
        setHistory([{
            id: 'intro',
            sender: 'bot',
            text: 'ניקינו את ההיסטוריה. שלח הודעה חדשה כדי לראות את תגובת הבוט.',
            time: formatTime(new Date()),
        }]);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                        <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">מעבדת וואטסאפ</h1>
                        <p className="text-sm text-[var(--color-text-muted)]">בדקו את שיחות הבוט בלי לפתוח את האפליקציה</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearHistory}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-indigo-500/40 hover:text-white transition-colors"
                        type="button"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        איפוס שיחה
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="glass rounded-2xl p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <Phone className="w-5 h-5 text-indigo-400" />
                                הודעת טסט
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">הזינו את פרטי ההודעה המדומה</p>
                        </div>
                        {sending && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-[var(--color-text-muted)] block mb-1">מספר שולח (לקוח או בעל עסק)</label>
                            <input
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                                placeholder="+972501234567"
                                dir="ltr"
                                readOnly
                                title="המספר נקבע לפי ההתחברות"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-[var(--color-text-muted)]">תוכן ההודעה</label>
                                <button
                                    type="button"
                                    className="text-[10px] text-indigo-300 hover:text-indigo-200"
                                    onClick={() => setText('מה שעות הפעילות שלכם?')}
                                >
                                    איפוס טקסט
                                </button>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500 h-24"
                                placeholder="הקלד את ההודעה שברצונך לשלוח..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 cursor-pointer hover:border-indigo-500/40">
                                <input
                                    type="checkbox"
                                    checked={isButtonClick}
                                    onChange={(e) => setIsButtonClick(e.target.checked)}
                                    className="accent-indigo-500"
                                />
                                לדמות לחיצה על כפתור
                            </label>
                            <div className="text-xs text-[var(--color-text-muted)] px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-400" />
                                בקשות זמן כמו "14:30" יאתרו שיחה חוזרת
                            </div>
                        </div>

                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <MessageSquare className="w-4 h-4 text-cyan-400" />
                                שליחת קובץ (אופציונלי)
                            </div>
                            <input
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-cyan-500"
                                dir="ltr"
                            />
                            <input
                                value={mediaContentType}
                                onChange={(e) => setMediaContentType(e.target.value)}
                                placeholder="image/jpeg, application/pdf..."
                                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-cyan-500"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {quickTemplates.map((tpl) => (
                                <button
                                    key={tpl.label}
                                    type="button"
                                    onClick={() => setText(tpl.value)}
                                    className="px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:border-indigo-500/50 hover:text-white transition-colors"
                                    title={tpl.hint}
                                >
                                    <Wand2 className="w-3 h-3 inline-block ml-1" />
                                    {tpl.label}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-l from-indigo-500 to-cyan-500 text-white font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            שלח לבוט
                        </button>
                    </div>
                </div>

                {/* Chat */}
                <div className="xl:col-span-2 glass rounded-2xl p-5 flex flex-col min-h-[520px]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-semibold flex items-center gap-2">
                                <Bot className="w-5 h-5 text-indigo-400" />
                                זרימת השיחה
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">הודעות שנשלחו והתשובות שהתקבלו</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className={`flex ${item.sender === 'tester' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 border ${item.sender === 'tester'
                                        ? 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border-indigo-500/30'
                                        : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-muted)]">
                                        {item.sender === 'tester' ? 'את/ה' : 'פורלי'}
                                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
                                        <span dir="ltr">{item.time}</span>
                                        {item.meta && (
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px]">
                                                {item.meta}
                                            </span>
                                        )}
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p>
                                    {item.buttons && item.buttons.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.buttons.map((btn) => (
                                                <span
                                                    key={btn}
                                                    className="text-xs px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-300 bg-indigo-500/10"
                                                >
                                                    {btn}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {latestBotResponse && (
                        <div className="mt-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text-muted)]">
                            <p className="flex items-center gap-2 text-[var(--color-text-primary)] font-medium mb-1">
                                <Bot className="w-4 h-4 text-indigo-400" />
                                תגובה אחרונה
                            </p>
                            <p className="text-[var(--color-text-secondary)]">{latestBotResponse.text}</p>
                            {latestBotResponse.buttons && latestBotResponse.buttons.length > 0 && (
                                <p className="mt-2 text-[var(--color-text-secondary)]">
                                    כפתורים מוצעים: {latestBotResponse.buttons.join(' • ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatTime(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
