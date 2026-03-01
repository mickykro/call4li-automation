import {
    Building2,
    MessageSquare,
    TrendingUp,
    Activity,
    Users,
    PhoneMissed,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

const stats = [
    { label: 'עסקים פעילים', value: '23', icon: Building2, color: 'from-indigo-500 to-purple-500' },
    { label: 'שיחות היום', value: '127', icon: PhoneMissed, color: 'from-cyan-500 to-blue-500' },
    { label: 'טופלו ע"י AI', value: '89%', icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
    { label: 'לקוחות ייחודיים', value: '1,842', icon: Users, color: 'from-amber-500 to-orange-500' },
];

const recentActivity = [
    { type: 'new_business', text: '"קפה חן" נרשם למערכת', time: 'לפני 12 דק\'', status: 'success' },
    { type: 'conversation', text: 'פורלי טיפלה ב-5 שיחות של "מסעדת הים"', time: 'לפני 25 דק\'', status: 'info' },
    { type: 'alert', text: 'Follow-Me לא פעיל — "חשמל פלוס"', time: 'לפני 1 שעה', status: 'warning' },
    { type: 'new_business', text: '"סטודיו פיט" נרשם למערכת', time: 'לפני 2 שעות', status: 'success' },
    { type: 'conversation', text: 'סוכמו 12 שיחות אוטומטית', time: 'לפני 3 שעות', status: 'info' },
];

const statusIcon = {
    success: CheckCircle,
    info: Activity,
    warning: AlertCircle,
};

const statusColor = {
    success: 'text-emerald-400 bg-emerald-500/10',
    info: 'text-indigo-400 bg-indigo-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
};

export default function AdminDashboard() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">סקירת מערכת כללית</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div
                        key={s.label}
                        className="glass rounded-2xl p-5 hover:border-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                            <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-orange-400" />
                    פעילות אחרונה
                </h2>
                <div className="space-y-3">
                    {recentActivity.map((a, i) => {
                        const Icon = statusIcon[a.status as keyof typeof statusIcon];
                        const colors = statusColor[a.status as keyof typeof statusColor];
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className="flex-1 text-sm">{a.text}</p>
                                <span className="text-xs text-[var(--color-text-muted)]">{a.time}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
