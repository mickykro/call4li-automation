import { useState } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Building2,
    FileText,
    Smartphone,
    Globe,
    Sparkles,
    Play,
    Palette,
    Save,
} from 'lucide-react';

export default function SettingsPage() {
    const [form, setForm] = useState({
        ownerName: 'ישראל ישראלי',
        businessName: 'מסעדת הים',
        description: 'מסעדה ים תיכונית עם נוף לים',
        phone: '050-123-4567',
        language: 'he',
        plan: 'basic',
    });

    const [buttons, setButtons] = useState(['שיחה עכשיו', 'קביעת שיחה', '']);
    const [demoActive, setDemoActive] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">הגדרות</h1>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">ניהול פרופיל העסק וההגדרות</p>
            </div>

            {/* Profile */}
            <div className="glass rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    פרופיל עסק
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">שם בעל העסק</label>
                        <input
                            value={form.ownerName}
                            onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">שם העסק</label>
                        <input
                            value={form.businessName}
                            onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">תיאור קצר</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">מספר טלפון</label>
                        <input
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">שפה</label>
                        <select
                            value={form.language}
                            onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="he">עברית</option>
                            <option value="ar">ערבית</option>
                            <option value="en">אנגלית</option>
                        </select>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                    <Save className="w-4 h-4" /> שמור שינויים
                </button>
            </div>

            {/* Custom Buttons (Premium) */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-400" />
                        כפתורי פתיחה מותאמים
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20">
                        פרימיום
                    </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                    הגדר עד 3 כפתורים שיופיעו בהודעה הראשונה ללקוח
                </p>
                <div className="space-y-3">
                    {buttons.map((btn, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-text-muted)] w-5">{i + 1}</span>
                            <input
                                value={btn}
                                onChange={e => {
                                    const newBtns = [...buttons];
                                    newBtns[i] = e.target.value;
                                    setButtons(newBtns);
                                }}
                                placeholder={`כפתור ${i + 1}`}
                                className="flex-1 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    ))}
                </div>

                {/* Preview */}
                <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">תצוגה מקדימה:</p>
                    <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-xl p-3 border border-indigo-500/20">
                        <p className="text-sm mb-3">
                            היי, אני פורלי העוזרת של "{form.businessName}". ראיתי שניסית להתקשר. איך נוכל לעזור?
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {buttons.filter(Boolean).map((btn, i) => (
                                <span key={i} className="px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-400 text-xs">
                                    {btn}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Mode */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    מצב דמו
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    הפעל דמו כדי לראות איך פורלי מדברת עם הלקוחות שלך
                </p>
                <button
                    onClick={() => setDemoActive(!demoActive)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${demoActive
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            : 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 border border-cyan-500/20 hover:from-cyan-500/20 hover:to-indigo-500/20'
                        }`}
                >
                    <Play className="w-4 h-4" />
                    {demoActive ? 'סיים דמו' : 'הפעל דמו'}
                </button>

                {demoActive && (
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-sm animate-fade-in">
                        <p className="text-cyan-400 font-medium mb-2">🎭 מצב דמו פעיל</p>
                        <p className="text-[var(--color-text-secondary)] text-xs">
                            כתוב "דמו" ב-WhatsApp כדי לדמות שיחה עם לקוח. כתוב "סיים דמו" לסיום.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
