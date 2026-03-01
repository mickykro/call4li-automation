import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, CheckCircle, Loader2, ArrowLeft, Building2, User, FileText, Smartphone } from 'lucide-react';

type Step = 'info' | 'followme' | 'verifying' | 'done';

export default function OnboardingPage() {
    const { bizId } = useParams<{ bizId: string }>();
    const [step, setStep] = useState<Step>('info');
    const [form, setForm] = useState({
        ownerName: '',
        businessName: '',
        description: '',
        phone: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('followme');
    };

    const handleActivateFollowMe = () => {
        setStep('verifying');
        // Simulate verification
        setTimeout(() => setStep('done'), 3000);
    };

    return (
        <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4 py-12">
            {/* Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                            Call4li
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">הרשמה לפורלי</h1>
                    {bizId && (
                        <p className="text-[var(--color-text-muted)] text-sm">
                            מזהה עסק: <span className="font-mono text-indigo-400">{bizId}</span>
                        </p>
                    )}
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {(['info', 'followme', 'done'] as const).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step === s || (['followme', 'verifying'].includes(step) && i === 1) || (step === 'done' && i <= 2)
                                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                                        : 'bg-[var(--color-surface-light)] text-[var(--color-text-muted)]'
                                    }`}
                            >
                                {i + 1}
                            </div>
                            {i < 2 && <div className="w-12 h-0.5 bg-[var(--color-border)]" />}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8">
                    {/* Step 1: Business Info */}
                    {step === 'info' && (
                        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    <User className="w-4 h-4 inline-block ml-1" />
                                    שם בעל העסק
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.ownerName}
                                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="ישראל ישראלי"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    <Building2 className="w-4 h-4 inline-block ml-1" />
                                    שם העסק
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.businessName}
                                    onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="איך פורלי תציג אותך"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    <FileText className="w-4 h-4 inline-block ml-1" />
                                    תיאור קצר
                                </label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                                    placeholder="מה העסק עושה?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                                    <Smartphone className="w-4 h-4 inline-block ml-1" />
                                    מספר טלפון
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    placeholder="050-000-0000"
                                    dir="ltr"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                המשך
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* Step 2: Follow-Me Setup */}
                    {step === 'followme' && (
                        <div className="text-center space-y-6 animate-fade-in">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
                                <Phone className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2">הפעלת שיחות שלא נענו</h2>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                                    לחץ על הכפתור למטה כדי לחייג למספר שמגדיר העברת שיחות שלא נענו מהטלפון שלך לפורלי.
                                </p>
                            </div>

                            <a
                                href="tel:*61*+1234567890%23"
                                onClick={handleActivateFollowMe}
                                className="block py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 animate-pulse-glow"
                            >
                                📞 הפעלת שיחות שלא נענו
                            </a>

                            <p className="text-[var(--color-text-muted)] text-xs">
                                הפעולה מגדירה Follow-Me אצל ספק התקשורת שלך
                            </p>
                        </div>
                    )}

                    {/* Step 2.5: Verifying */}
                    {step === 'verifying' && (
                        <div className="text-center space-y-6 animate-fade-in">
                            <Loader2 className="w-16 h-16 mx-auto text-indigo-400 animate-spin" />
                            <div>
                                <h2 className="text-xl font-bold mb-2">מאמת את ההעברה...</h2>
                                <p className="text-[var(--color-text-secondary)] text-sm">
                                    אנחנו בודקים שהשיחות מועברות בהצלחה. זה לוקח כמה שניות.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Done */}
                    {step === 'done' && (
                        <div className="text-center space-y-6 animate-fade-in">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">מעולה! הכל מוכן 🎉</h2>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    ההעברה פועלת. מעכשיו כל שיחה שלא תענה תגרום לפורלי לשלוח הודעת WhatsApp ללקוח ולעזור לו.
                                </p>
                            </div>

                            <div className="glass-light rounded-xl p-4 text-right">
                                <p className="text-sm text-[var(--color-text-secondary)] mb-1">מזהה העסק שלך:</p>
                                <p className="font-mono text-lg text-indigo-400 font-bold">{bizId}</p>
                            </div>

                            <a
                                href="/dashboard"
                                className="block py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                            >
                                כניסה לפאנל הניהול
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
