import { Link } from 'react-router-dom';
import { CheckCircle, Phone } from 'lucide-react';

export default function OnboardingCompletePage() {
    return (
        <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center px-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md text-center relative z-10 animate-fade-in">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                    <CheckCircle className="w-14 h-14 text-emerald-400" />
                </div>

                <h1 className="text-3xl font-bold mb-3">ברוך הבא ל-Call4li! 🎉</h1>
                <p className="text-[var(--color-text-secondary)] text-lg mb-8">
                    פורלי מוכנה לעבוד. כל שיחה שלא תענה — פורלי כבר מטפלת.
                </p>

                <div className="glass rounded-2xl p-6 mb-8 text-right">
                    <h3 className="font-semibold mb-3">מה קורה עכשיו?</h3>
                    <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                        <li className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                            לקוח מתקשר ולא נענה
                        </li>
                        <li className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            פורלי שולחת לו WhatsApp ומציעה עזרה
                        </li>
                        <li className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            אתה מקבל סיכום + תזכורת לחזור
                        </li>
                    </ul>
                </div>

                <Link
                    to="/dashboard"
                    className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                    כניסה לפאנל הניהול
                </Link>
            </div>
        </div>
    );
}
