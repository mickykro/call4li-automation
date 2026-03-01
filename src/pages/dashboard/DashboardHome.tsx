import {
    Phone,
    PhoneMissed,
    Clock,
    CheckCircle,
    TrendingUp,
    MessageSquare,
    ArrowLeft,
    Activity,
} from 'lucide-react';

// Mock data for demo
const recentConversations = [
    { id: '1', customer: '050-123-4567', summary: 'שאל על שעות פעילות', time: 'לפני 5 דק\'', status: 'resolved' as const },
    { id: '2', customer: '052-987-6543', summary: 'ביקש שיחזרו אליו ב-14:00', time: 'לפני 20 דק\'', status: 'waiting' as const },
    { id: '3', customer: '054-555-1212', summary: 'שלח תמונה של מוצר', time: 'לפני 1 שעה', status: 'open' as const },
    { id: '4', customer: '058-222-3333', summary: 'שאל על מדיניות ביטולים', time: 'לפני 2 שעות', status: 'resolved' as const },
];

const upcomingCallbacks = [
    { customer: '052-987-6543', time: '14:00', summary: 'רוצה לדעת על מחירים' },
    { customer: '050-111-2222', time: '16:30', summary: 'בירור לגבי הזמנה' },
];

const stats = [
    { label: 'שיחות שלא נענו', value: '47', icon: PhoneMissed, change: '+12%', color: 'from-indigo-500 to-purple-500' },
    { label: 'טופלו ע"י פורלי', value: '42', icon: MessageSquare, change: '89%', color: 'from-cyan-500 to-blue-500' },
    { label: 'שיחות חוזרות', value: '15', icon: Clock, change: '+3', color: 'from-amber-500 to-orange-500' },
    { label: 'לקוחות מרוצים', value: '38', icon: CheckCircle, change: '90%', color: 'from-emerald-500 to-teal-500' },
];

const statusColor = {
    resolved: 'bg-emerald-500/10 text-emerald-400',
    waiting: 'bg-amber-500/10 text-amber-400',
    open: 'bg-indigo-500/10 text-indigo-400',
};

const statusLabel = {
    resolved: 'טופל',
    waiting: 'ממתין',
    open: 'פתוח',
};

export default function DashboardHome() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">שלום, ישראל 👋</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">הנה סקירה של הפעילות שלך</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Follow-Me פעיל</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div
                        key={s.label}
                        className="glass rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                                <s.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" />
                                {s.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Conversations */}
                <div className="lg:col-span-2 glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                            שיחות אחרונות
                        </h2>
                        <a href="/dashboard/conversations" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                            הכל <ArrowLeft className="w-3 h-3" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {recentConversations.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" dir="ltr">{c.customer}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{c.summary}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>
                                        {statusLabel[c.status]}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)]">{c.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Callbacks */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-semibold flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-amber-400" />
                        שיחות חוזרות קרובות
                    </h2>
                    <div className="space-y-3">
                        {upcomingCallbacks.map((cb, i) => (
                            <div key={i} className="p-3 rounded-xl bg-[var(--color-surface)] border border-amber-500/10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium" dir="ltr">{cb.customer}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                                        {cb.time}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">{cb.summary}</p>
                            </div>
                        ))}
                    </div>

                    {/* Activity */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
                        <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            פעילות היום
                        </h3>
                        <div className="space-y-2">
                            {['פורלי ענתה ל-3 שאלות', 'נקבעו 2 שיחות חוזרות', 'סוכם שיחה 1 אוטומטית'].map(
                                (item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <p className="text-xs text-[var(--color-text-secondary)]">{item}</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
