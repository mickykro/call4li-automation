import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    MessageSquare,
    Brain,
    Globe,
    Image,
    Megaphone,
    ArrowLeft,
    Check,
    Sparkles,
    Zap,
    Shield,
    Clock,
    ChevronDown,
    Menu,
    X,
} from 'lucide-react';

const features = [
    {
        icon: Phone,
        title: 'זיהוי שיחות שלא נענו',
        desc: 'המערכת מזהה אוטומטית כל שיחה שלא נענתה ויוצרת קשר עם הלקוח מיד.',
        gradient: 'from-indigo-500 to-purple-600',
    },
    {
        icon: MessageSquare,
        title: 'מענה אוטומטי ב-WhatsApp',
        desc: 'פורלי שולחת הודעת WhatsApp אישית ללקוח ומציעה עזרה מיידית.',
        gradient: 'from-cyan-500 to-blue-600',
    },
    {
        icon: Brain,
        title: 'בינה מלאכותית',
        desc: 'מענה חכם לשאלות נפוצות על בסיס FAQ של העסק, כולל ניתוח תמונות ומסמכים.',
        gradient: 'from-amber-500 to-orange-600',
    },
    {
        icon: Globe,
        title: 'רב-שפתי',
        desc: 'תמיכה מלאה בעברית, ערבית ואנגלית עם זיהוי שפה אוטומטי.',
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        icon: Image,
        title: 'קבלת מדיה',
        desc: 'הלקוחות יכולים לשלוח תמונות, מסמכים והודעות קוליות — הכל מגיע אליך.',
        gradient: 'from-pink-500 to-rose-600',
    },
    {
        icon: Megaphone,
        title: 'הגדלת מכירות',
        desc: 'שלח הודעות שיווקיות לכל הלקוחות שלך בלחיצת כפתור.',
        gradient: 'from-violet-500 to-purple-600',
    },
];

const steps = [
    { num: '01', title: 'הרשמה', desc: 'מלא טופס קצר ופורלי תתחיל לעבוד בשבילך.' },
    { num: '02', title: 'הפעלת העברה', desc: 'לחץ כפתור אחד כדי להפעיל העברת שיחות שלא נענו.' },
    { num: '03', title: 'פורלי עובדת', desc: 'כל שיחה שלא נענתה — פורלי יוצרת קשר עם הלקוח.' },
    { num: '04', title: 'אתה מקבל סיכום', desc: 'קבל סיכום חכם ודחוף ישירות ל-WhatsApp.' },
];

const pricing = [
    {
        name: 'חינם',
        price: '0',
        period: '/חודש',
        features: ['עד 30 שיחות בחודש', 'מענה בסיסי ב-WhatsApp', 'סיכום שיחות'],
        cta: 'התחל בחינם',
        highlighted: false,
    },
    {
        name: 'עסקי',
        price: '99',
        period: '₪/חודש',
        features: ['שיחות ללא הגבלה', 'מענה חכם AI לשאלות', 'קביעת שיחות חוזרות', 'ניהול ידע (FAQ)', 'סיכום שיחה אוטומטי'],
        cta: 'התחל עכשיו',
        highlighted: true,
    },
    {
        name: 'פרימיום',
        price: '249',
        period: '₪/חודש',
        features: ['כל הפיצ\'רים של עסקי', 'כפתורים מותאמים אישית', 'שליחת הודעות שיווקיות', 'ניתוח מדיה (תמונות/קול)', 'תמיכה מועדפת'],
        cta: 'דבר איתנו',
        highlighted: false,
    },
];

export default function LandingPage() {
    const [mobileMenu, setMobileMenu] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            {/* ─── Navbar ─────────────────────────────── */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                                Call4li
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm">תכונות</a>
                            <a href="#how-it-works" className="text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm">איך זה עובד</a>
                            <a href="#pricing" className="text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm">מחירים</a>
                            <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-white transition-colors text-sm">פאנל ניהול</Link>
                            <Link
                                to="/onboard/DEMO1-BIZ"
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
                            >
                                התחל בחינם
                            </Link>
                        </div>

                        <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-[var(--color-text-secondary)]">
                            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {mobileMenu && (
                    <div className="md:hidden glass border-t border-[var(--color-border)] px-4 pb-4 space-y-3">
                        <a href="#features" className="block py-2 text-[var(--color-text-secondary)]">תכונות</a>
                        <a href="#how-it-works" className="block py-2 text-[var(--color-text-secondary)]">איך זה עובד</a>
                        <a href="#pricing" className="block py-2 text-[var(--color-text-secondary)]">מחירים</a>
                        <Link to="/onboard/DEMO1-BIZ" className="block py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-center font-medium">
                            התחל בחינם
                        </Link>
                    </div>
                )}
            </nav>

            {/* ─── Hero ──────────────────────────────── */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-float" />
                <div className="absolute top-60 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: '1.5s' }} />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
                            <Sparkles className="w-4 h-4" />
                            עוזרת אישית חכמה לעסקים
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <span className="block">אל תפספס עוד</span>
                        <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent animate-gradient">
                            שיחה אחת
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        פורלי מזהה שיחות שלא נענו, יוצרת קשר עם הלקוח ב-WhatsApp, ומטפלת בפנייה —
                        כדי שאף לקוח לא ילך למתחרים.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Link
                            to="/onboard/DEMO1-BIZ"
                            className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 animate-pulse-glow"
                        >
                            התחל בחינם
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="px-8 py-4 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-text-muted)] transition-all duration-300 font-medium text-lg flex items-center justify-center gap-2"
                        >
                            איך זה עובד?
                            <ChevronDown className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-16 flex justify-center gap-8 flex-wrap animate-fade-in" style={{ animationDelay: '0.5s' }}>
                        {[
                            { icon: Zap, label: 'מענה תוך שניות' },
                            { icon: Shield, label: 'מאובטח ופרטי' },
                            { icon: Clock, label: '24/7 פעיל' },
                        ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                                <Icon className="w-4 h-4 text-indigo-400" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features ──────────────────────────── */}
            <section id="features" className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">הכל בתוך עוזרת אחת</h2>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
                            פורלי מטפלת בכל מה שקשור ללקוחות שלא הצלחת לענות להם
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="group glass rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <f.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ──────────────────────── */}
            <section id="how-it-works" className="py-24 px-4 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">איך זה עובד?</h2>
                        <p className="text-[var(--color-text-secondary)] text-lg">4 צעדים פשוטים ואתה בפנים</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <div
                                key={s.num}
                                className="relative glass rounded-2xl p-6 text-center animate-slide-up"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="text-5xl font-black bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 bg-clip-text text-transparent mb-4">
                                    {s.num}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm">{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -left-3 transform -translate-y-1/2">
                                        <ArrowLeft className="w-5 h-5 text-indigo-500/30" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pricing ───────────────────────────── */}
            <section id="pricing" className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">תוכניות ומחירים</h2>
                        <p className="text-[var(--color-text-secondary)] text-lg">בחר את התוכנית שמתאימה לעסק שלך</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pricing.map((p, i) => (
                            <div
                                key={p.name}
                                className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 animate-fade-in ${p.highlighted
                                        ? 'bg-gradient-to-b from-indigo-500/20 to-cyan-500/10 border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/10 relative scale-105'
                                        : 'glass'
                                    }`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                {p.highlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-medium">
                                        הכי פופולרי
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-extrabold">{p.price === '0' ? 'חינם' : p.price}</span>
                                    {p.price !== '0' && <span className="text-[var(--color-text-muted)] text-sm">{p.period}</span>}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {p.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/onboard/DEMO1-BIZ"
                                    className={`block text-center py-3 rounded-xl font-medium transition-all duration-300 ${p.highlighted
                                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                                            : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-text-muted)]'
                                        }`}
                                >
                                    {p.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer ────────────────────────────── */}
            <footer className="border-t border-[var(--color-border)] py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                            Call4li
                        </span>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-sm">
                        © {new Date().getFullYear()} Call4li. כל הזכויות שמורות.
                    </p>
                    <div className="flex gap-6 text-sm text-[var(--color-text-muted)]">
                        <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
                        <a href="#" className="hover:text-white transition-colors">פרטיות</a>
                        <a href="#" className="hover:text-white transition-colors">צור קשר</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
