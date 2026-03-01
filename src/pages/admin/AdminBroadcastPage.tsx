import { useState } from 'react';
import { Megaphone, Send, Users, Building2, AlertCircle } from 'lucide-react';

export default function AdminBroadcastPage() {
    const [target, setTarget] = useState<'all_businesses' | 'business_customers'>('all_businesses');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        if (message.trim()) {
            setSent(true);
            setTimeout(() => setSent(false), 3000);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold">שליחת הודעות</h1>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">שלח הודעה לכלל העסקים או ללקוחות</p>
            </div>

            {/* Target Selection */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold">קהל יעד</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => setTarget('all_businesses')}
                        className={`p-4 rounded-xl border text-right transition-all ${target === 'all_businesses'
                                ? 'border-orange-500/30 bg-orange-500/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-surface-hover)]'
                            }`}
                    >
                        <Building2 className={`w-6 h-6 mb-2 ${target === 'all_businesses' ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}`} />
                        <p className="text-sm font-medium">כל העסקים</p>
                        <p className="text-xs text-[var(--color-text-muted)]">23 עסקים רשומים</p>
                    </button>
                    <button
                        onClick={() => setTarget('business_customers')}
                        className={`p-4 rounded-xl border text-right transition-all ${target === 'business_customers'
                                ? 'border-orange-500/30 bg-orange-500/5'
                                : 'border-[var(--color-border)] hover:border-[var(--color-surface-hover)]'
                            }`}
                    >
                        <Users className={`w-6 h-6 mb-2 ${target === 'business_customers' ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}`} />
                        <p className="text-sm font-medium">לקוחות של עסק</p>
                        <p className="text-xs text-[var(--color-text-muted)]">בחר עסק ספציפי</p>
                    </button>
                </div>
            </div>

            {/* Message */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-orange-400" />
                    הודעה
                </h2>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={5}
                    placeholder="כתוב את ההודעה שתישלח..."
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-orange-500 resize-none"
                />
                <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-muted)]">{message.length} תווים</p>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        {target === 'all_businesses' ? 'שלח לכל העסקים' : 'שלח ללקוחות'}
                    </button>
                </div>
            </div>

            {sent && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-emerald-400">ההודעה נשלחה בהצלחה!</p>
                </div>
            )}
        </div>
    );
}
