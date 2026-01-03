import React, { useState, useEffect, useMemo } from 'react';
import { IndianRupee, Tag, TrendingUp, Filter, AlertCircle, ArrowUpRight, Plus, Trash2, Edit2, PieChart, Users, CheckCircle, X, ArrowRight, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { ExpenseService } from '../services/ExpenseService';
import AddExpenseModal from './AddExpenseModal';
import ConfirmModal from './common/ConfirmModal';
import { calculateTripBalances, calculateSettlements } from '../utils/expenseUtils';

const Expenses = ({ days = [], user, tripId, budget = 0, onUpdateTripInfo, travelers = [] }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(budget);
    const [viewMode, setViewMode] = useState('transactions'); // 'transactions' or 'balances'
    const [showSettlementModal, setShowSettlementModal] = useState(false);

    // --- Data Sync ---
    useEffect(() => {
        if (!user || !tripId) return;

        const unsubscribe = ExpenseService.subscribeToExpenses(
            user.uid,
            tripId,
            (data) => {
                setExpenses(data);
                setLoading(false);
            },
            (error) => {
                console.error("Expense sync error:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, tripId]);

    useEffect(() => {
        setTempBudget(budget);
    }, [budget]);

    // --- Helpers ---
    const getDayName = (dateStr) => {
        const day = days.find(d => d.date === dateStr);
        return day ? `Day ${days.indexOf(day) + 1}` : 'Extra Day';
    };

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const openDeleteModal = (id) => setConfirmDeleteId(id);

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await ExpenseService.deleteExpense(user.uid, tripId, confirmDeleteId);
        } catch (error) {
            console.error('Failed to delete expense', error);
        }
        setConfirmDeleteId(null);
    };

    const handleSaveBudget = () => {
        onUpdateTripInfo('budget', tempBudget);
        setIsEditingBudget(false);
    };

    // --- Stats Calculation ---
    const enrichedExpenses = expenses.map(e => ({
        ...e,
        dayName: getDayName(e.date)
    }));

    const totalCost = enrichedExpenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const avgDaily = days.length > 0 ? Math.round(totalCost / days.length) : 0;

    // Balances
    const { balances, myBalance } = useMemo(() => calculateTripBalances(expenses, travelers, user.uid), [expenses, travelers, user.uid]);

    // Settlements
    const settlements = useMemo(() => calculateSettlements(balances), [balances]);

    // Max Day
    const expensesByDay = enrichedExpenses.reduce((acc, item) => {
        const key = item.date;
        if (!acc[key]) acc[key] = { name: item.dayName, total: 0 };
        acc[key].total += Number(item.amount);
        return acc;
    }, {});

    const maxDay = Object.values(expensesByDay).reduce((max, current) => {
        return current.total > max.total ? current : max;
    }, { name: '-', total: 0 });

    const filteredExpenses = filterCategory === 'All'
        ? enrichedExpenses
        : enrichedExpenses.filter(e => e.category === filterCategory);

    // Budget Calculations
    const budgetStats = ExpenseService.calculateStats(expenses, budget);
    const isBudgetSet = budget > 0;

    if (loading) {
        return <div className="p-12 text-center text-slate-400">Loading expenses...</div>;
    }

    return (
        <div className="space-y-8 relative">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trip Wallet</h2>
                    {isBudgetSet ? (
                        <div className="flex items-center gap-3 mt-2 text-sm font-semibold text-slate-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/50 shadow-sm">
                            <span>Budget: <span className="text-slate-900">₹{budget.toLocaleString()}</span></span>
                            <button onClick={() => setIsEditingBudget(true)} className="p-1 hover:bg-slate-200 rounded-full text-blue-600 transition-colors"><Edit2 size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingBudget(true)} className="text-sm text-blue-600 font-bold hover:underline mt-2 flex items-center gap-1">
                            <Plus size={14} /> Set a Budget
                        </button>
                    )}
                </div>

                <div className="flex gap-4 items-center">
                    {/* View Toggles */}
                    <div className="bg-white/40 backdrop-blur-md border border-white/50 p-1.5 rounded-[1.2rem] flex shadow-inner">
                        <button
                            onClick={() => setViewMode('transactions')}
                            className={`px-5 py-2.5 text-sm font-bold rounded-2xl transition-all ${viewMode === 'transactions' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setViewMode('balances')}
                            className={`px-5 py-2.5 text-sm font-bold rounded-2xl transition-all ${viewMode === 'balances' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}
                        >
                            Balances
                        </button>
                    </div>

                    {isEditingBudget && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-blue-200 shadow-xl absolute top-16 right-0 md:static md:shadow-none z-20">
                            <input
                                type="number"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                className="w-28 px-3 py-1 text-sm border-none outline-none font-bold text-slate-900 bg-slate-50 rounded-xl"
                                placeholder="Amount"
                                autoFocus
                            />
                            <button onClick={handleSaveBudget} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">Save</button>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[1.2rem] shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={22} /> <span className="hidden md:inline">Log Expense</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={IndianRupee} iconColor="text-blue-600" bgColor="bg-blue-50"
                    label="Total Spending"
                    value={`₹${totalCost.toLocaleString()}`}
                    subElement={totalCost > 0 && <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-bold flex items-center shadow-sm">+<ArrowUpRight size={12} strokeWidth={3} /></span>}
                />

                {travelers.length > 1 ? (
                    <StatsCard
                        icon={Users} iconColor={myBalance >= 0 ? "text-emerald-600" : "text-rose-600"} bgColor={myBalance >= 0 ? "bg-emerald-50" : "bg-rose-50"}
                        label="My Position"
                        value={myBalance === 0 ? "Settled" : `₹${Math.abs(myBalance).toLocaleString()}`}
                        subValue={myBalance > 0 ? "You are owed" : myBalance < 0 ? "You owe" : "All squared up"}
                        delay={0.1}
                    />
                ) : (
                    <StatsCard
                        icon={TrendingUp} iconColor="text-purple-600" bgColor="bg-purple-50"
                        label="Average / Day"
                        value={`₹${avgDaily.toLocaleString()}`}
                        subElement={<span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100/80 text-slate-500 px-3 py-1 rounded-full border border-slate-200">Daily Avg</span>}
                        delay={0.1}
                    />
                )}

                {/* Budget Stat */}
                <div className="md:col-span-1">
                    {isBudgetSet ? (
                        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-lg shadow-slate-200/50 h-full flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-[4rem] z-0 pointer-events-none"></div>
                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Status</p>
                                <p className={`text-2xl font-black ${budgetStats.remaining < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                    {Math.round(budgetStats.percentageUsed)}%
                                </p>
                            </div>
                            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200/50 relative z-10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(budgetStats.percentageUsed, 100)}%` }}
                                    className={`h-full rounded-full shadow-sm ${budgetStats.percentageUsed > 100 ? 'bg-red-500' : budgetStats.percentageUsed > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-right font-bold relative z-10">
                                {budgetStats.remaining >= 0 ? <span className="text-emerald-600">₹{budgetStats.remaining.toLocaleString()} Left</span> : <span className="text-red-500">Over by ₹{Math.abs(budgetStats.remaining).toLocaleString()}</span>}
                            </p>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditingBudget(true)}
                            className="w-full bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-300 p-6 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all cursor-pointer group"
                        >
                            <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all text-blue-500"><Plus size={28} /></div>
                            <span className="font-bold text-sm tracking-wide">Set a Budget</span>
                        </motion.button>
                    )}
                </div>
            </div>

            {viewMode === 'transactions' ? (
                <>
                    {/* Filters */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2">
                        <FilterButton active={filterCategory === 'All'} onClick={() => setFilterCategory('All')} label="All Expenses" />
                        {CATEGORIES.map(cat => (
                            <FilterButton
                                key={cat.name}
                                active={filterCategory === cat.name}
                                onClick={() => setFilterCategory(cat.name)}
                                label={cat.name}
                                color={cat.color}
                                hasDot
                            />
                        ))}
                    </div>

                    {/* Modern List View (Unified for Desktop/Mobile) */}
                    <div className="space-y-3">
                        {filteredExpenses.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-[2.5rem] bg-white/50 backdrop-blur-sm">
                                {filterCategory === 'All' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500">
                                            <IndianRupee size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800">No expenses yet</h3>
                                            <p className="text-slate-500 font-medium">Start adding expenses to track your spending.</p>
                                        </div>
                                        <button onClick={() => setIsAddModalOpen(true)} className="mt-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Add First Expense</button>
                                    </div>
                                ) : 'No expenses in this category.'}
                            </div>
                        ) : (
                            filteredExpenses.map((expense) => {
                                const payer = travelers.find(t => t.id === expense.paidBy)?.name || 'Someone';
                                const isMultiSplit = expense.splitDetails && Object.keys(expense.splitDetails).length > 1;

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={expense.id}
                                        className="bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                            <div className="flex items-start gap-5 w-full md:w-auto">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200" style={{ backgroundColor: CATEGORIES.find(c => c.name === expense.category)?.color || '#94a3b8' }}>
                                                    {expense.category === 'Food' ? <Utensils size={24} /> : <Tag size={24} />}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-900 text-lg leading-tight mb-1">{expense.description || 'Untitled Expense'}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                                        <span>{expense.dayName}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span>{expense.date}</span>
                                                    </div>
                                                    <div className="mt-2 text-sm font-medium text-slate-600 flex items-center gap-2">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-xs">Paid by <span className="text-slate-900 font-bold">{expense.paidBy === user.uid ? 'You' : payer}</span></span>
                                                        {isMultiSplit && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg font-bold">Split group</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 pl-[4.5rem] md:pl-0">
                                                <div className="text-right">
                                                    <div className="font-black text-2xl text-slate-900">₹{Number(expense.amount).toLocaleString()}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{expense.category}</div>
                                                </div>
                                                <button
                                                    onClick={() => openDeleteModal(expense.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </>
            ) : (
                // Balances View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Balances List */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" /> Trip Balances
                        </h3>
                        <div className="space-y-4">
                            {travelers.map(t => {
                                const bal = balances[t.id] || 0;
                                const isOwed = bal > 0;
                                const isDebt = bal < 0;

                                return (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                {t.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700">{t.id === user.uid ? 'You' : t.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${isOwed ? 'text-emerald-600' : isDebt ? 'text-red-500' : 'text-slate-400'}`}>
                                                {bal === 0 ? 'Settled' : `${isOwed ? '+' : '-'}₹${Math.abs(bal).toLocaleString()}`}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">
                                                {isOwed ? 'Gets back' : isDebt ? 'Owes' : 'Balanced'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pending Settlements */}
                    <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col items-center justify-center text-center">
                        <CheckCircle size={48} className="text-emerald-500 mb-4" />
                        <h3 className="text-lg font-bold text-emerald-900 mb-2">How to Settle Up?</h3>
                        <p className="text-emerald-700 text-sm mb-4">
                            We have calculated the most efficient way to clear all debts in just <b>{settlements.length}</b> transactions.
                        </p>
                        <button
                            onClick={() => setShowSettlementModal(true)}
                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            View Settlement Plan
                        </button>
                    </div>
                </div>
            )}

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                user={user}
                tripId={tripId}
                travelers={travelers}
            />

            {/* Settlement Modal */}
            <AnimatePresence>
                {showSettlementModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettlementModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl">
                            <button onClick={() => setShowSettlementModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Settlement Plan</h3>

                            {settlements.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                                    <p>All settled up! No transactions needed.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settlements.map((s, idx) => {
                                        const fromName = travelers.find(t => t.id === s.from)?.name || 'Someone';
                                        const toName = travelers.find(t => t.id === s.to)?.name || 'Someone';
                                        const isMeFrom = s.from === user.uid;
                                        const isMeTo = s.to === user.uid;

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-sm">
                                                        <span className={`font-bold ${isMeFrom ? 'text-red-600' : 'text-slate-700'}`}>{isMeFrom ? 'You' : fromName}</span>
                                                        <span className="text-slate-400 mx-1">pays</span>
                                                        <span className={`font-bold ${isMeTo ? 'text-emerald-600' : 'text-slate-700'}`}>{isMeTo ? 'You' : toName}</span>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-slate-800">₹{s.amount.toLocaleString()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-center text-slate-400 mt-6">
                                Settle these offline via UPI/Cash and then add an expense with "Settlement" category to clear balances.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Expense?"
                message="Are you sure you want to remove this expense? This will affect trip totals and splits."
            />
        </div>
    );
};

// --- Subcomponents for cleanliness ---

const StatsCard = ({ icon: Icon, iconColor, bgColor, label, value, subValue, subElement, delay = 0 }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-lg shadow-slate-200/50 relative overflow-hidden h-full flex flex-col justify-between"
    >
        <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 ${bgColor} ${iconColor} rounded-[1.2rem] shadow-sm`}><Icon size={22} className="stroke-[2.5px]" /></div>
                {subElement}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 truncate tracking-tight text-shadow-sm" title={value}>{value}</p>
            {subValue && <p className="text-xs font-bold text-slate-400 mt-1">{subValue}</p>}
        </div>
    </motion.div>
);

const FilterButton = ({ active, onClick, label, color, hasDot }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${active
            ? (color ? 'ring-4 ring-opacity-20 text-white shadow-lg scale-105' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105')
            : 'bg-white/70 backdrop-blur-md text-slate-600 border border-white/50 hover:bg-white hover:shadow-md'
            }`}
        style={active && color ? { backgroundColor: color, borderColor: color, '--tw-ring-color': color } : {}}
    >
        {hasDot && <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : ''}`} style={!active ? { backgroundColor: color } : {}} />}
        {label}
    </button>
);

// Helper Components
const CategoryBadge = ({ category }) => {
    const cat = CATEGORIES.find(c => c.name === category) || { color: '#94a3b8' };
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
            {category}
        </span>
    );
};

export default Expenses;
