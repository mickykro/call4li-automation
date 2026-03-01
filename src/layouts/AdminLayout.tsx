import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Megaphone,
    CreditCard,
    Phone,
    Menu,
    Shield,
} from 'lucide-react';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'דשבורד', end: true },
    { to: '/admin/businesses', icon: Building2, label: 'עסקים', end: false },
    { to: '/admin/broadcast', icon: Megaphone, label: 'שליחת הודעות', end: false },
    { to: '/admin/plans', icon: CreditCard, label: 'תוכניות', end: false },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--color-surface)]">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-40 w-64 flex flex-col border-l border-[var(--color-border)] bg-[var(--color-surface-light)] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center gap-2 px-4 border-b border-[var(--color-border)]">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Admin
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] block -mt-1">Call4li</span>
                        </div>
                    </Link>
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
                                    ? 'bg-gradient-to-l from-orange-500/15 to-red-500/10 text-orange-400 border border-orange-500/20'
                                    : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-hover)]'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Back to dashboard */}
                <div className="border-t border-[var(--color-border)] p-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                        <Phone className="w-5 h-5" />
                        <span>חזרה לפאנל עסק</span>
                    </Link>
                </div>
            </aside>

            {/* Backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Content */}
            <div className="lg:ms-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-8 glass sticky top-0 z-20">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--color-text-secondary)]">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">Admin Panel</span>
                    </div>
                    <div />
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
