import { useState } from 'react';
import {
    Building2,
    Search,
    Eye,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
} from 'lucide-react';

const businesses = [
    { id: 'P8M2A-BIZ', name: 'מסעדת הים', owner: 'ישראל ישראלי', phone: '050-123-4567', plan: 'premium', status: 'active', conversations: 47, lastActive: 'לפני 5 דק\'' },
    { id: '9K3X7-BIZ', name: 'קפה חן', owner: 'דנה כהן', phone: '052-987-6543', plan: 'basic', status: 'active', conversations: 23, lastActive: 'לפני 1 שעה' },
    { id: '1T5WQ-BIZ', name: 'סטודיו פיט', owner: 'יוסי לוי', phone: '054-555-1212', plan: 'free', status: 'active', conversations: 8, lastActive: 'לפני 3 שעות' },
    { id: 'R4G8N-BIZ', name: 'חשמל פלוס', owner: 'משה אברהם', phone: '058-222-3333', plan: 'basic', status: 'pending', conversations: 0, lastActive: 'לפני יום' },
    { id: 'W2H6J-BIZ', name: 'ספרא', owner: 'ליאת שמעון', phone: '053-444-5555', plan: 'premium', status: 'active', conversations: 62, lastActive: 'לפני 30 דק\'' },
];

const planColors = {
    free: 'bg-gray-500/10 text-gray-400',
    basic: 'bg-indigo-500/10 text-indigo-400',
    premium: 'bg-amber-500/10 text-amber-400',
};

const planLabels = { free: 'חינם', basic: 'עסקי', premium: 'פרימיום' };

const statusConfig = {
    active: { icon: CheckCircle, color: 'text-emerald-400', label: 'פעיל' },
    pending: { icon: Clock, color: 'text-amber-400', label: 'ממתין' },
    suspended: { icon: XCircle, color: 'text-red-400', label: 'מושהה' },
};

export default function BusinessListPage() {
    const [search, setSearch] = useState('');
    const filtered = businesses.filter(
        b => b.name.includes(search) || b.id.includes(search) || b.owner.includes(search)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ניהול עסקים</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">{businesses.length} עסקים רשומים</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="חיפוש לפי שם, מזהה או בעלים..."
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors">
                    <Filter className="w-4 h-4" /> סינון
                </button>
            </div>

            {/* Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-border)]">
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">עסק</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">מזהה</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">תוכנית</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">סטטוס</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">שיחות</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">פעילות אחרונה</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--color-text-muted)]">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b) => {
                                const status = statusConfig[b.status as keyof typeof statusConfig];
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{b.name}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{b.owner}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-mono text-[var(--color-text-muted)]">{b.id}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${planColors[b.plan as keyof typeof planColors]}`}>
                                                {planLabels[b.plan as keyof typeof planLabels]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                                                <StatusIcon className="w-3 h-3" /> {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{b.conversations}</td>
                                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{b.lastActive}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-white transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
