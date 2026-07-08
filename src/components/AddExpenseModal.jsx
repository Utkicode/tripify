import React, { useState, useEffect } from'react';
import ReactDOM from'react-dom';
import { X, Calendar, Tag, Check, CurrencyInr, CurrencyDollar, CurrencyEur, CurrencyGbp, CurrencyJpy } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';
import { CATEGORIES } from'../constants';
import { ExpenseService } from'../services/ExpenseService';
import { useProfile } from'../context/ProfileContext';
import { addDoc, collection } from'firebase/firestore';
import { db } from'../firebase';
import { appId } from'../constants';

const CurrencyIcon = ({ currency }) => {
    switch (currency) {
        case'EUR': return <CurrencyEur size={24} className="text-slate-400" />;
        case'GBP': return <CurrencyGbp size={24} className="text-slate-400" />;
        case'JPY': return <CurrencyJpy size={24} className="text-slate-400" />;
        case'INR': return <CurrencyInr size={24} className="text-slate-400" />;
        default: return <CurrencyInr size={24} className="text-slate-400" />;
    }
};

const AddExpenseModal = ({ isOpen, onClose, user, tripId, travelers = [], initialData = null }) => {
    const { profile } = useProfile();
    const defaultCurrency = profile?.behavior?.defaultCurrency ||'INR';

    // Use empty object if initialData is null for safe access
    const data = initialData || {};

    // Combine current user with travelers for a complete list
    const allStartParticipants = [
        { id: user.uid, name:"Me" },
        ...travelers.filter(t => t.id !== user.uid) // Avoid duplicates if user is in travelers list (unlikely but safe)
    ];

    const [amount, setAmount] = useState(data.amount ||'');
    const [category, setCategory] = useState(data.category || CATEGORIES[0].name);
    const [description, setDescription] = useState(data.name ||'');
    const [date, setDate] = useState(data.date || new Date().toISOString().split('T')[0]);
    const [paidBy, setPaidBy] = useState(user.uid);
    const [splitParticipants, setSplitParticipants] = useState(allStartParticipants.map(p => p.id));
    const [loading, setLoading] = useState(false);

    // Update state when initialData changes or modal opens
    useEffect(() => {
        if (isOpen) {
            const d = initialData || {};
            setAmount(d.amount ||'');
            setCategory(d.category || CATEGORIES[0].name);
            setDescription(d.name ||'');
            if (d.date) setDate(d.date);
            setPaidBy(d.paidBy || user.uid);

            // If editing, load split participants. If new, default to all.
            if (d.splitDetails) {
                setSplitParticipants(Object.keys(d.splitDetails));
            } else {
                setSplitParticipants(allStartParticipants.map(p => p.id));
            }
        }
    }, [isOpen, initialData, user.uid, travelers]);

    const toggleParticipant = (id) => {
        if (splitParticipants.includes(id)) {
            if (splitParticipants.length > 1) { // Prevent unchecking the last person
                setSplitParticipants(splitParticipants.filter(p => p !== id));
            }
        } else {
            setSplitParticipants([...splitParticipants, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !user || !tripId) return;

        setLoading(true);
        try {
            // Calculate Split (Equal)
            const splitAmount = Number(amount) / splitParticipants.length;
            const splitDetails = {};
            splitParticipants.forEach(uid => {
                splitDetails[uid] = Number(splitAmount.toFixed(2));
            });

            // Adjust rounding error on the first participant 
            const calculatedTotal = Object.values(splitDetails).reduce((a, b) => a + b, 0);
            const diff = Number(amount) - calculatedTotal;
            if (diff !== 0 && splitParticipants.length > 0) {
                splitDetails[splitParticipants[0]] += diff;
            }

            await ExpenseService.addExpense(user.uid, tripId, {
                amount: Number(amount),
                category,
                description,
                date,
                currency: defaultCurrency,
                userName: user.displayName || user.email,
                userId: user.uid,
                paidBy,
                splitType:'EQUAL',
                splitDetails
            });

            // Log Activity for Notifications
            try {
                const collaboratorIds = allStartParticipants.map(p => p.id);
                await addDoc(collection(db,'artifacts', appId,'trips', tripId,'activities'), {
                    text: `added a new expense: ${description || category}`,
                    type:'money',
                    timestamp: Date.now(),
                    performedBy: user.uid,
                    userName: user.displayName ||'Traveler',
                    collaborators: collaboratorIds
                });
            } catch (err) {
                console.error("Failed to log expense activity", err);
            }

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
    if (typeof document ==='undefined') return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y:"100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y:"100%", opacity: 0 }}
                        transition={{ type:"spring", damping: 25, stiffness: 300 }}
                        className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-8 relative z-10 shadow-2xl shadow-slate-900/50 border border-white/50 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Log Expense</h2>
                                <p className="text-sm font-medium text-slate-500">Track your spending</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5  hover: text-slate-500 hover:text-slate-800 rounded-full transition-all"
                            >
                                <X size={20} className="stroke-[2.5px]" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Amount Input */}
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Amount ({defaultCurrency})</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A1A1A] transition-colors">
                                        <CurrencyIcon currency={defaultCurrency} />
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0"
                                        autoFocus
                                        className="w-full pl-14 pr-6 py-5 text-4xl font-black text-slate-900  rounded-[1.5rem] border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-slate-300 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category Selection */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Category</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setCategory(cat.name)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all relative overflow-hidden group ${category === cat.name
                                                ?'border-blue-500/30  text-[#1A1A1A] shadow-md shadow-blue-500/10 scale-105'
                                                :'border-transparent  text-slate-500 hover:'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mb-2 transition-all ${category === cat.name ?'scale-110' :'grayscale group-hover:grayscale-0'}`} style={{ backgroundColor: cat.color +'25', color: cat.color }}>
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                                            </div>
                                            <span className="text-[10px] font-bold truncate w-full text-center tracking-tight">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <Calendar size={16} />
                                        </div>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5  rounded-2xl text-sm font-bold text-slate-700 border-none focus:ring-2 focus:ring-blue-100 outline-none hover: transition-colors cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Dinner, Taxi, etc..."
                                        className="w-full px-5 py-3.5  rounded-2xl text-sm font-bold text-slate-700 border-none focus:ring-2 focus:ring-blue-100 outline-none hover: transition-colors placeholder:font-medium placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Paid By & Split (Pill Style) */}
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Who Paid?</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPaidBy(user.uid)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${paidBy === user.uid
                                                ?'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                :'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            Me
                                        </button>
                                        {travelers.filter(t => t.id !== user.uid).map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setPaidBy(t.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${paidBy === t.id
                                                    ?'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                    :'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Split With</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allStartParticipants.map(participant => {
                                            const isSelected = splitParticipants.includes(participant.id);
                                            return (
                                                <button
                                                    key={participant.id}
                                                    type="button"
                                                    onClick={() => toggleParticipant(participant.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${isSelected
                                                        ?'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                                        :'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                                    {participant.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount || splitParticipants.length === 0}
                                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-lg mt-4"
                            >
                                {loading ?'Saving...' : <>Save Expense <Check size={22} strokeWidth={3} /></>}
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
