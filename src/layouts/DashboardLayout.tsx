import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    BookOpen,
    Settings,
    Phone,
    Menu,
    LogOut,
    ChevronLeft,
    FlaskConical,
    LockKeyhole,
    ShieldCheck,
} from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'דשבורד', end: true },
    { to: '/dashboard/conversations', icon: MessageSquare, label: 'שיחות', end: false },
    { to: '/dashboard/knowledge', icon: BookOpen, label: 'ניהול ידע', end: false },
    { to: '/dashboard/settings', icon: Settings, label: 'הגדרות', end: false },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [otpForm, setOtpForm] = useState({ phone: '+972542045280', otp: '' });
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpInfo, setOtpInfo] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('call4li:dashboard-access');
        if (token) setAccessGranted(true);
    }, []);

    async function requestOtp() {
        if (!otpForm.phone) {
            setOtpError('יש להזין טלפון');
            return;
        }
        setOtpError(null);
        setOtpInfo(null);
        setOtpLoading(true);
        try {
            console.log('Sending OTP request to:', '/api/auth/request-otp');
            const res = await fetch('/api/auth/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: otpForm.phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'שליחת קוד נכשלה');
            setOtpSent(true);
            setOtpInfo('קוד נשלח בוואטסאפ. בדוק את השיחה מפורלי.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'שליחת קוד נכשלה';
            setOtpError(message);
        } finally {
            setOtpLoading(false);
        }
    }

    async function verifyOtp() {
        if (!otpForm.phone || !otpForm.otp) {
            setOtpError('יש להזין טלפון וקוד OTP');
            return;
        }

        setOtpError(null);
        setOtpInfo(null);
        setOtpLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpForm),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'אימות נכשל');
            }

            localStorage.setItem('call4li:dashboard-access', JSON.stringify({ phone: otpForm.phone, businessId: data.businessId }));
            setAccessGranted(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'אימות נכשל';
            setOtpError(message);
        } finally {
            setOtpLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--color-surface)] lg:flex">
            {/* Sidebar */}
            <aside
                className={`z-40 flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-light)] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'
                    } ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} fixed inset-y-0 right-0 lg:static lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
                    <Link to="/" className="flex items-center gap-2 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
                                Call4li
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-l from-indigo-500/15 to-cyan-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-hover)]'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="border-t border-[var(--color-border)] p-3">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-red-500/5 transition-colors w-full">
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>יציאה</span>}
                    </button>
                </div>
            </aside>

            {/* Backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Content */}
            <div className="transition-all duration-300 flex flex-col min-h-screen flex-1 lg:pr-0">
                {/* Top bar */}
                <header className="h-16 border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-8 glass sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-[var(--color-text-secondary)]"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm text-[var(--color-text-secondary)]">העסק שלי</span>
                    </div>
                    <div />
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {!accessGranted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md glass rounded-2xl p-6 space-y-4 border border-indigo-500/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">כניסה למנויי פרימיום</p>
                                <p className="text-xs text-[var(--color-text-muted)]">הזן טלפון, קבל קוד בוואטסאפ, והזן אותו לאימות</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">מספר טלפון</label>
                                <input
                                    value={otpForm.phone}
                                    onChange={(e) => setOtpForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                                    placeholder="+9725XXXXXXX"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">קוד OTP</label>
                                <input
                                    value={otpForm.otp}
                                    onChange={(e) => setOtpForm(f => ({ ...f, otp: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                                    placeholder="קוד 6 ספרות"
                                    dir="ltr"
                                />
                            </div>

                            {otpInfo && (
                                <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                                    {otpInfo}
                                </div>
                            )}
                            {otpError && (
                                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                                    {otpError}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={requestOtp}
                                    disabled={otpLoading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-500/40 text-indigo-200 font-medium disabled:opacity-60"
                                    type="button"
                                >
                                    {otpLoading && !otpSent ? 'שולח...' : 'שלח קוד בוואטסאפ'}
                                </button>
                                <button
                                    onClick={verifyOtp}
                                    disabled={otpLoading || !otpSent}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-l from-indigo-500 to-cyan-500 text-white font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                                    type="button"
                                >
                                    {otpLoading && otpSent ? 'מאמת...' : 'כניסה'}
                                    <LockKeyhole className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                                הגישה מתאפשרת רק לעסקים בתוכנית פרימיום עם קוד חד-פעמי שנשלח בוואטסאפ ע"י פורלי.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
