import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Tag, Check, IndianRupee, DollarSign, Euro, PoundSterling, JapaneseYen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { ExpenseService } from '../services/ExpenseService';
import { useProfile } from '../context/ProfileContext';

const CurrencyIcon = ({ currency }) => {
    switch (currency) {
        case 'EUR': return <Euro size={24} className="text-slate-400" />;
        case 'GBP': return <PoundSterling size={24} className="text-slate-400" />;
        case 'JPY': return <JapaneseYen size={24} className="text-slate-400" />;
        case 'INR': return <IndianRupee size={24} className="text-slate-400" />;
        default: return <DollarSign size={24} className="text-slate-400" />;
    }
};

const AddExpenseModal = ({ isOpen, onClose, user, tripId, initialData = null }) => {
    const { profile } = useProfile();
    const defaultCurrency = profile?.behavior?.defaultCurrency || 'USD';

    // Use empty object if initialData is null for safe access
    const data = initialData || {};

    const [amount, setAmount] = useState(data.amount || '');
    const [category, setCategory] = useState(data.category || CATEGORIES[0].name);
    const [description, setDescription] = useState(data.name || '');
    const [date, setDate] = useState(data.date || new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    // Update state when initialData changes or modal opens
    useEffect(() => {
        if (isOpen) {
            const d = initialData || {};
            setAmount(d.amount || '');
            setCategory(d.category || CATEGORIES[0].name);
            setDescription(d.name || '');
            if (d.date) setDate(d.date);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !user || !tripId) return;

        setLoading(true);
        try {
            await ExpenseService.addExpense(user.uid, tripId, {
                amount: Number(amount),
                category,
                description,
                date,
                currency: defaultCurrency,
                userName: user.displayName || user.email,
                userId: user.uid
            });
            onClose();
            // Reset form
            setAmount('');
            setDescription('');
            setCategory(CATEGORIES[0].name);
        } catch (error) {
            console.error("Failed to add expense", error);
        } finally {
            setLoading(false);
        }
    };

    // Client-side guard
    if (typeof document === 'undefined') return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative z-10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold text-slate-800 mb-6">Add Expense</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Amount Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amount ({defaultCurrency})</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <CurrencyIcon currency={defaultCurrency} />
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-4 text-4xl font-black text-slate-800 bg-slate-50 rounded-xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setCategory(cat.name)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${category === cat.name
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                            </div>
                                            <span className="text-[10px] font-medium truncate w-full text-center">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What was this for?"
                                        className="w-full px-4 py-2 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {loading ? 'Saving...' : <><Check size={20} /> Save Expense</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AddExpenseModal;
