import { useState } from 'react';
import { CreditCard, Edit3, Save, Plus, Check, X } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    nameHe: string;
    price: number;
    features: string[];
    maxCalls: number | null;
    highlighted: boolean;
}

const initialPlans: Plan[] = [
    {
        id: 'free',
        name: 'Free',
        nameHe: 'חינם',
        price: 0,
        maxCalls: 30,
        features: ['עד 30 שיחות בחודש', 'מענה בסיסי ב-WhatsApp', 'סיכום שיחות'],
        highlighted: false,
    },
    {
        id: 'basic',
        name: 'Basic',
        nameHe: 'עסקי',
        price: 99,
        maxCalls: null,
        features: ['שיחות ללא הגבלה', 'מענה חכם AI', 'קביעת שיחות חוזרות', 'ניהול ידע (FAQ)', 'סיכום שיחה אוטומטי'],
        highlighted: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        nameHe: 'פרימיום',
        price: 249,
        maxCalls: null,
        features: ['כל הפיצ\'רים של עסקי', 'כפתורים מותאמים אישית', 'שליחת הודעות שיווקיות', 'ניתוח מדיה', 'תמיכה מועדפת'],
        highlighted: false,
    },
];

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [editing, setEditing] = useState<string | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ניהול תוכניות</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">הגדרת תוכניות ומחירים</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`rounded-2xl p-6 transition-all ${plan.highlighted
                                ? 'bg-gradient-to-b from-orange-500/10 to-red-500/5 border-2 border-orange-500/30'
                                : 'glass'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold">{plan.nameHe}</h3>
                                <p className="text-xs text-[var(--color-text-muted)]">{plan.name}</p>
                            </div>
                            <button
                                onClick={() => setEditing(editing === plan.id ? null : plan.id)}
                                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-3xl font-extrabold">
                                {plan.price === 0 ? 'חינם' : `₪${plan.price}`}
                            </span>
                            {plan.price > 0 && <span className="text-sm text-[var(--color-text-muted)]">/חודש</span>}
                        </div>

                        {plan.maxCalls && (
                            <p className="text-xs text-[var(--color-text-muted)] mb-3">
                                עד {plan.maxCalls} שיחות בחודש
                            </p>
                        )}

                        <ul className="space-y-2">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {editing === plan.id && (
                            <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3 animate-fade-in">
                                <div>
                                    <label className="text-xs text-[var(--color-text-muted)]">מחיר (₪)</label>
                                    <input
                                        type="number"
                                        value={plan.price}
                                        onChange={e => {
                                            const updated = plans.map(p =>
                                                p.id === plan.id ? { ...p, price: Number(e.target.value) } : p
                                            );
                                            setPlans(updated);
                                        }}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-orange-500"
                                        dir="ltr"
                                    />
                                </div>
                                <button
                                    onClick={() => setEditing(null)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
                                >
                                    <Save className="w-4 h-4" /> שמור
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
