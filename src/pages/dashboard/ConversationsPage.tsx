import { useState } from 'react';
import {
    Search,
    Phone,
    MessageSquare,
    Image,
    Mic,
    FileText,
    Clock,
    CheckCircle,
    Bot,
    User,
    ArrowLeft,
} from 'lucide-react';

const conversations = [
    {
        id: '1',
        customer: '050-123-4567',
        name: 'לקוח',
        summary: 'שאל על שעות פעילות ומיקום העסק',
        status: 'resolved' as const,
        time: 'לפני 5 דק\'',
        messageCount: 6,
        hasMedia: false,
    },
    {
        id: '2',
        customer: '052-987-6543',
        name: 'לקוח',
        summary: 'ביקש שיחזרו אליו ב-14:00 לגבי הצעת מחיר',
        status: 'waiting_callback' as const,
        time: 'לפני 20 דק\'',
        messageCount: 4,
        hasMedia: false,
    },
    {
        id: '3',
        customer: '054-555-1212',
        name: 'לקוח',
        summary: 'שלח תמונה של מוצר וביקש מידע',
        status: 'open' as const,
        time: 'לפני 1 שעה',
        messageCount: 3,
        hasMedia: true,
    },
    {
        id: '4',
        customer: '058-222-3333',
        name: 'לקוח',
        summary: 'שאל על מדיניות ביטולים ותנאי שירות',
        status: 'resolved' as const,
        time: 'לפני 2 שעות',
        messageCount: 8,
        hasMedia: false,
    },
    {
        id: '5',
        customer: '053-444-5555',
        name: 'לקוח',
        summary: 'שלח הודעה קולית עם תיאור בעיה',
        status: 'open' as const,
        time: 'לפני 3 שעות',
        messageCount: 2,
        hasMedia: true,
    },
];

const sampleMessages = [
    {
        id: '1',
        sender: 'forli' as const,
        content: 'היי, אני פורלי העוזרת של "מסעדת הים". ראיתי שניסית להתקשר ולא הצלחת להשיג אותנו. איך נוכל לעזור?',
        time: '10:30',
        buttons: ['שיחה עכשיו', 'קביעת שיחה'],
    },
    { id: '2', sender: 'customer' as const, content: 'היי, רציתי לשאול מה שעות הפעילות שלכם?', time: '10:31' },
    { id: '3', sender: 'forli' as const, content: 'שעות הפעילות שלנו:\n📅 ראשון-חמישי: 11:00-23:00\n📅 שישי: 11:00-15:00\n📅 שבת: סגור\n\nיש עוד משהו שאוכל לעזור?', time: '10:31' },
    { id: '4', sender: 'customer' as const, content: 'תודה! ואיפה אתם נמצאים?', time: '10:32' },
    { id: '5', sender: 'forli' as const, content: '📍 אנחנו נמצאים ברחוב הים 15, תל אביב.\nקל למצוא — ממש מול חוף גורדון.\n\nעוד משהו?', time: '10:32' },
    { id: '6', sender: 'customer' as const, content: 'מושלם, תודה רבה!', time: '10:33' },
];

const statusConfig = {
    resolved: { label: 'טופל', color: 'bg-emerald-500/10 text-emerald-400', icon: CheckCircle },
    waiting_callback: { label: 'ממתין לשיחה', color: 'bg-amber-500/10 text-amber-400', icon: Clock },
    open: { label: 'פתוח', color: 'bg-indigo-500/10 text-indigo-400', icon: MessageSquare },
};

export default function ConversationsPage() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const filtered = conversations.filter(
        (c) => c.customer.includes(search) || c.summary.includes(search)
    );

    const selected = conversations.find((c) => c.id === selectedId);

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">שיחות</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                {/* Conversation List */}
                <div className="glass rounded-2xl p-4 lg:col-span-1 overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="חיפוש לפי מספר או תוכן..."
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {filtered.map((c) => {
                            const cfg = statusConfig[c.status];
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className={`w-full text-right p-3 rounded-xl transition-all duration-200 ${selectedId === c.id
                                            ? 'bg-indigo-500/10 border border-indigo-500/20'
                                            : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium" dir="ltr">{c.customer}</span>
                                        <span className="text-xs text-[var(--color-text-muted)]">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)] truncate mb-2">{c.summary}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                        {c.hasMedia && (
                                            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                                <Image className="w-3 h-3" /> מדיה
                                            </span>
                                        )}
                                        <span className="text-xs text-[var(--color-text-muted)]">{c.messageCount} הודעות</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conversation Detail */}
                <div className="glass rounded-2xl lg:col-span-2 overflow-hidden flex flex-col">
                    {selectedId && selected ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium" dir="ltr">{selected.customer}</p>
                                        <p className={`text-xs ${statusConfig[selected.status].color}`}>
                                            {statusConfig[selected.status].label}
                                        </p>
                                    </div>
                                </div>

                                {/* AI Summary */}
                                <div className="glass-light rounded-xl px-3 py-2 max-w-xs hidden sm:block">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Bot className="w-3 h-3 text-indigo-400" />
                                        <span className="text-xs text-indigo-400 font-medium">סיכום AI</span>
                                    </div>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{selected.summary}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {sampleMessages.map((m) => (
                                    <div
                                        key={m.id}
                                        className={`flex ${m.sender === 'customer' ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.sender === 'customer'
                                                    ? 'bg-[var(--color-surface)] border border-[var(--color-border)]'
                                                    : 'bg-gradient-to-br from-indigo-500/20 to-cyan-500/15 border border-indigo-500/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                {m.sender === 'forli' ? (
                                                    <Bot className="w-3 h-3 text-indigo-400" />
                                                ) : (
                                                    <User className="w-3 h-3 text-[var(--color-text-muted)]" />
                                                )}
                                                <span className="text-xs text-[var(--color-text-muted)]">
                                                    {m.sender === 'forli' ? 'פורלי' : 'לקוח'}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-muted)] mr-auto" dir="ltr">{m.time}</span>
                                            </div>
                                            <p className="text-sm whitespace-pre-line">{m.content}</p>
                                            {m.buttons && (
                                                <div className="flex gap-2 mt-2">
                                                    {m.buttons.map((btn) => (
                                                        <span
                                                            key={btn}
                                                            className="text-xs px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-400"
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
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">
                            <div className="text-center">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">בחר שיחה לצפייה</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
