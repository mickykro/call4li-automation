import { useState } from 'react';
import {
    BookOpen,
    Plus,
    Trash2,
    Clock,
    MapPin,
    FileText,
    ShoppingBag,
    Edit3,
    Save,
    X,
    HelpCircle,
} from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const initialFaqs: FAQItem[] = [
    { id: '1', question: 'מה שעות הפעילות?', answer: 'ראשון-חמישי: 09:00-18:00, שישי: 09:00-13:00' },
    { id: '2', question: 'איפה אתם נמצאים?', answer: 'רחוב הרצל 50, תל אביב' },
    { id: '3', question: 'מה מדיניות הביטולים?', answer: 'ניתן לבטל עד 24 שעות לפני המועד ללא עלות' },
];

export default function KnowledgePage() {
    const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newFaq, setNewFaq] = useState<Partial<FAQItem> | null>(null);
    const [hours, setHours] = useState('ראשון-חמישי: 09:00-18:00\nשישי: 09:00-13:00\nשבת: סגור');
    const [location, setLocation] = useState('רחוב הרצל 50, תל אביב');
    const [policy, setPolicy] = useState('ניתן לבטל עד 24 שעות לפני המועד ללא עלות.');
    const [activeTab, setActiveTab] = useState<'faq' | 'info'>('faq');

    const addFaq = () => {
        if (newFaq?.question && newFaq?.answer) {
            setFaqs([...faqs, { id: Date.now().toString(), question: newFaq.question, answer: newFaq.answer }]);
            setNewFaq(null);
        }
    };

    const deleteFaq = (id: string) => {
        setFaqs(faqs.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ניהול ידע</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">
                        הידע שפורלי משתמשת בו כדי לענות ללקוחות
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'faq' as const, label: 'שאלות נפוצות', icon: HelpCircle },
                    { key: 'info' as const, label: 'מידע כללי', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                            שאלות ותשובות ({faqs.length})
                        </h2>
                        <button
                            onClick={() => setNewFaq({ question: '', answer: '' })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm hover:bg-indigo-500/20 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> הוספה
                        </button>
                    </div>

                    {newFaq && (
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                            <input
                                type="text"
                                placeholder="שאלה..."
                                value={newFaq.question || ''}
                                onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <textarea
                                placeholder="תשובה..."
                                value={newFaq.answer || ''}
                                onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500 resize-none"
                            />
                            <div className="flex gap-2">
                                <button onClick={addFaq} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20">
                                    <Save className="w-4 h-4" /> שמור
                                </button>
                                <button onClick={() => setNewFaq(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20">
                                    <X className="w-4 h-4" /> ביטול
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {faqs.map(faq => (
                            <div key={faq.id} className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-surface-hover)] transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium mb-1">❓ {faq.question}</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">{faq.answer}</p>
                                    </div>
                                    <div className="flex gap-1 mr-3">
                                        <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-white transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteFaq(faq.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-amber-400" />
                            שעות פעילות
                        </h3>
                        <textarea
                            value={hours}
                            onChange={e => setHours(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                            מיקום
                        </h3>
                        <input
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="glass rounded-2xl p-6 md:col-span-2">
                        <h3 className="font-semibold flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            מדיניות ביטולים/שירות
                        </h3>
                        <textarea
                            value={policy}
                            onChange={e => setPolicy(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:border-indigo-500 resize-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5">
                            שמור שינויים
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
