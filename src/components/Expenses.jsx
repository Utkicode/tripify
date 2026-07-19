import React, { useState, useEffect, useMemo } from 'react';
import { CurrencyInr, Tag, TrendUp, Faders, WarningCircle, ArrowUpRight, Plus, Trash, PencilSimple, ChartPie, Users, CheckCircle, X, ArrowRight, ForkKnife, ArrowsLeftRight, Car, House, Storefront, MagnifyingGlass } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { ExpenseService } from '../services/ExpenseService';
import AddExpenseModal from './AddExpenseModal';
import { calculateTripBalances, calculateSettlements } from '../utils/expenseUtils';
import { getCurrencySymbol } from '../utils/currency.js';
import { useProfile } from '../context/ProfileContext';
import { useConfirm } from '../context/ConfirmContext';

// Category icon map
const CATEGORY_ICONS = {
    Transport: Car,
    Stay: House,
    Food: ForkKnife,
    Activity: Faders,
    Misc: Storefront,
};

const Expenses = ({ days = [], user, tripId, budget = 0, onUpdateTripInfo, travelers = [], currencyCode: currencyProp, isCompleted = false }) => {
    const { profile } = useProfile();
    const confirm = useConfirm();
    const currencyCode = currencyProp || profile?.behavior?.defaultCurrency || 'INR';
    const symbol = getCurrencySymbol(currencyCode);
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
            (data) => { setExpenses(data); setLoading(false); },
            (error) => { console.error("Expense sync error:", error); setLoading(false); }
        );
        return () => unsubscribe();
    }, [user, tripId]);

    useEffect(() => { setTempBudget(budget); }, [budget]);

    // --- Helpers ---
    const getDayName = (dateStr) => {
        const day = days.find(d => d.date === dateStr);
        return day ? `Day ${days.indexOf(day) + 1}` : 'Extra Day';
    };

    const openDeleteModal = (id) => {
        confirm({
            title: 'Delete Expense?',
            message: 'Are you sure you want to remove this expense? This will affect trip totals and splits.',
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () => ExpenseService.deleteExpense(user.uid, tripId, id)
        });
    };

    const handleSaveBudget = () => {
        onUpdateTripInfo('budget', Number(tempBudget));
        setIsEditingBudget(false);
    };

    // --- Stats Calculation ---
    const enrichedExpenses = expenses.map(e => ({ ...e, dayName: getDayName(e.date) }));
    const totalCost = enrichedExpenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const avgDaily = days.length > 0 ? Math.round(totalCost / days.length) : 0;

    // Balances
    const { balances, myBalance } = useMemo(() => calculateTripBalances(expenses, travelers, user.uid), [expenses, travelers, user.uid]);
    const settlements = useMemo(() => calculateSettlements(balances), [balances]);

    // Budget stats
    const budgetStats = ExpenseService.calculateStats(expenses, budget);
    const isBudgetSet = budget > 0;
    const perPersonBudget = travelers.length > 0 && isBudgetSet ? Math.round(budget / travelers.length) : 0;
    const budgetPct = isBudgetSet ? Math.min(Math.round(budgetStats.percentageUsed), 100) : 0;
    const isOverBudget = isBudgetSet && budgetStats.remaining < 0;

    const filteredExpenses = filterCategory === 'All'
        ? enrichedExpenses
        : enrichedExpenses.filter(e => e.category === filterCategory);

    if (loading) {
        return <div className="p-12 text-center text-slate-400">Loading expenses...</div>;
    }

    return (
        <div className="space-y-8 relative">

            {/* ── WALLET HERO ── */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="wallet-hero p-8 md:p-10"
            >
                {/* Top row: label + action buttons */}
                <div className="flex items-start justify-between mb-8 relative z-10">
                    <div>
                        <p className="wallet-hero__label mb-2">Trip Wallet</p>
                        <div className="wallet-hero__amount">
                            {symbol}{totalCost.toLocaleString()}
                        </div>
                        <p className="text-white/50 text-sm font-medium mt-1">
                            Total spent &nbsp;·&nbsp; {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                        {/* View Toggle — pill style */}
                        <div className="flex bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-0.5">
                            {['transactions', 'balances'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                                        viewMode === mode
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Log Expense — brand orange */}
                        {!isCompleted && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                <span className="hidden sm:inline">Log Expense</span>
                                <span className="sm:hidden">Log</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {/* Daily Average */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="wallet-hero__label mb-1">Daily Avg</p>
                        <p className="text-white font-black text-xl" style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                            {symbol}{avgDaily.toLocaleString()}
                        </p>
                    </div>

                    {/* My Position (only if group trip) */}
                    {travelers.length > 1 ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="wallet-hero__label mb-1">My Position</p>
                            <p className={`font-black text-xl ${myBalance > 0 ? 'text-emerald-300' : myBalance < 0 ? 'text-rose-300' : 'text-white/60'}`}
                               style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                                {myBalance === 0 ? 'Settled' : `${myBalance > 0 ? '+' : '-'}${symbol}${Math.abs(myBalance).toLocaleString()}`}
                            </p>
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                                {myBalance > 0 ? 'you are owed' : myBalance < 0 ? 'you owe' : 'all square'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                            <p className="wallet-hero__label mb-1">Solo Trip</p>
                            <p className="text-white/60 text-sm font-bold">{travelers.length > 0 ? travelers[0]?.name || 'You' : 'You'}</p>
                        </div>
                    )}

                    {/* Budget — editable */}
                    <div className="col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <p className="wallet-hero__label mb-0.5">Budget</p>
                                {isBudgetSet ? (
                                    <p className="text-white font-black text-xl" style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                                        {symbol}{budget.toLocaleString()}
                                        {perPersonBudget > 0 && (
                                            <span className="text-white/40 text-sm font-medium ml-2">
                                                ({symbol}{perPersonBudget.toLocaleString()}/person)
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <p className="text-white/40 text-sm font-medium">No budget set</p>
                                )}
                            </div>
                            {!isCompleted && (
                                <button
                                    onClick={() => setIsEditingBudget(!isEditingBudget)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                                >
                                    <PencilSimple size={14} />
                                </button>
                            )}
                        </div>

                        {/* Budget progress bar */}
                        {isBudgetSet && (
                            <>
                                <div className="h-2 bg-white/15 rounded-full overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${budgetPct}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${isOverBudget ? 'bg-rose-400' : budgetPct > 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                    />
                                </div>
                                <p className="text-white/50 text-xs font-bold">
                                    {budgetPct}% used ·{' '}
                                    {isOverBudget
                                        ? <span className="text-rose-300">Over by {symbol}{Math.abs(budgetStats.remaining).toLocaleString()}</span>
                                        : <span className="text-emerald-300">{symbol}{budgetStats.remaining.toLocaleString()} remaining</span>
                                    }
                                </p>
                            </>
                        )}

                        {/* Inline budget edit */}
                        <AnimatePresence>
                            {isEditingBudget && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 flex items-center gap-2 overflow-hidden"
                                >
                                    <input
                                        type="number"
                                        value={tempBudget}
                                        onChange={(e) => setTempBudget(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white/20 text-white placeholder-white/40 border border-white/20 rounded-xl text-sm font-bold outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 min-w-0"
                                        placeholder="Enter budget"
                                        autoFocus
                                    />
                                    <button onClick={handleSaveBudget} className="btn-primary px-4 py-2 rounded-xl text-xs shrink-0">Save</button>
                                    <button onClick={() => setIsEditingBudget(false)} className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white transition-all shrink-0"><X size={14} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Set budget prompt if none */}
                        {!isBudgetSet && !isEditingBudget && !isCompleted && (
                            <button onClick={() => setIsEditingBudget(true)} className="mt-2 text-[#FF6B35] text-xs font-bold flex items-center gap-1 hover:underline">
                                <Plus size={12} /> Set a budget
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── TRANSACTIONS VIEW ── */}
            {viewMode === 'transactions' ? (
                <>
                    {/* Category Filters — badge style */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-hide">
                        {/* All */}
                        <CategoryFilterPill
                            active={filterCategory === 'All'}
                            onClick={() => setFilterCategory('All')}
                            label="All"
                            color={null}
                        />
                        {CATEGORIES.map(cat => (
                            <CategoryFilterPill
                                key={cat.name}
                                active={filterCategory === cat.name}
                                onClick={() => setFilterCategory(cat.name)}
                                label={cat.name}
                                color={cat.color}
                            />
                        ))}
                    </div>

                    {/* Expense List */}
                    <div className="space-y-3">
                        {filteredExpenses.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200/60 rounded-[2.5rem] bg-white/50 backdrop-blur-sm">
                                {filterCategory === 'All' ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                                            <CurrencyInr size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800">No expenses yet</h3>
                                            <p className="text-slate-500 font-medium mt-1">
                                                Planned itinerary costs appear here once you log actual expenses.
                                            </p>
                                        </div>
                                        {!isCompleted && (
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="btn-primary px-8 py-3 rounded-2xl font-bold"
                                            >
                                                <Plus size={16} /> Add First Expense
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 font-medium">No <strong>{filterCategory}</strong> expenses found.</p>
                                )}
                            </div>
                        ) : (
                            filteredExpenses.map((expense) => {
                                const payer = travelers.find(t => t.id === expense.paidBy)?.name || 'Someone';
                                const isMultiSplit = expense.splitDetails && Object.keys(expense.splitDetails).length > 1;
                                const catColor = CATEGORIES.find(c => c.name === expense.category)?.color || '#94a3b8';
                                const CatIcon = CATEGORY_ICONS[expense.category] || Tag;

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
                                                {/* Category icon */}
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
                                                    style={{ backgroundColor: catColor }}
                                                >
                                                    <CatIcon size={24} />
                                                </div>

                                                <div>
                                                    <div className="font-extrabold text-slate-900 text-lg leading-tight mb-1">
                                                        {expense.description || 'Untitled Expense'}
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                                        <span>{expense.dayName}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span>{expense.date}</span>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-medium text-slate-600">
                                                            Paid by <span className="text-slate-900 font-bold">{expense.paidBy === user.uid ? 'You' : payer}</span>
                                                        </span>
                                                        {isMultiSplit && (
                                                            <span
                                                                className="badge"
                                                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                                            >
                                                                Split
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 pl-[4.5rem] md:pl-0">
                                                <div className="text-right">
                                                    <div className="font-black text-2xl text-slate-900" style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                                                        {symbol}{Number(expense.amount).toLocaleString()}
                                                    </div>
                                                    <div
                                                        className="text-xs font-bold uppercase tracking-widest mt-0.5"
                                                        style={{ color: catColor }}
                                                    >
                                                        {expense.category}
                                                    </div>
                                                </div>
                                                {!isCompleted && (
                                                    <button
                                                        onClick={() => openDeleteModal(expense.id)}
                                                        className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Delete"
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </>
            ) : (
                // ── BALANCES VIEW ──
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Per-person balances */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                        <h3 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                            <Users size={20} className="text-[#FF6B35]" /> Trip Balances
                        </h3>
                        {travelers.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6">Add travelers to see split balances.</p>
                        ) : (
                            <div className="space-y-3">
                                {travelers.map(t => {
                                    const bal = balances[t.id] || 0;
                                    const isOwed = bal > 0;
                                    const isDebt = bal < 0;
                                    const isMe = t.id === user.uid;

                                    return (
                                        <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                                            {/* Avatar + name */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center font-bold text-[#FF6B35] text-sm border border-orange-200/60">
                                                    {t.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {isMe ? 'You' : t.name}
                                                </p>
                                            </div>

                                            {/* Balance */}
                                            <div className="text-right">
                                                {bal === 0 ? (
                                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Settled</span>
                                                ) : (
                                                    <>
                                                        <p className={`font-black text-lg ${isOwed ? 'text-emerald-600' : 'text-rose-600'}`}
                                                           style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                                                            {isOwed ? '+' : '-'}{symbol}{Math.abs(bal).toLocaleString()}
                                                        </p>
                                                        <p className={`text-[10px] uppercase font-bold tracking-wider ${isOwed ? 'text-emerald-500' : 'text-rose-400'}`}>
                                                            {isOwed ? 'is owed' : 'owes'}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Settlement plan teaser */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-[2rem] border border-emerald-100 p-6 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <ArrowsLeftRight size={28} className="text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-emerald-900 mb-1">Settlement Plan</h3>
                            <p className="text-emerald-700/70 text-sm">
                                Clear all debts in just <strong>{settlements.length}</strong> transaction{settlements.length !== 1 ? 's' : ''}.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSettlementModal(true)}
                            className="btn-secondary px-6 py-2.5 rounded-xl text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                            View Plan
                        </button>
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
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
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowSettlementModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setShowSettlementModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <ArrowsLeftRight size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Settlement Plan</h3>
                            </div>

                            {settlements.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                                    <p className="text-slate-600 font-medium">All settled up! No transactions needed.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {settlements.map((s, idx) => {
                                        const fromName = travelers.find(t => t.id === s.from)?.name || 'Someone';
                                        const toName = travelers.find(t => t.id === s.to)?.name || 'Someone';
                                        const isMeFrom = s.from === user.uid;
                                        const isMeTo = s.to === user.uid;

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="text-sm">
                                                    <span className={`font-bold ${isMeFrom ? 'text-rose-600' : 'text-slate-700'}`}>
                                                        {isMeFrom ? 'You' : fromName}
                                                    </span>
                                                    <span className="text-slate-400 mx-2">pays</span>
                                                    <span className={`font-bold ${isMeTo ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                        {isMeTo ? 'You' : toName}
                                                    </span>
                                                </div>
                                                <div className="font-black text-slate-800" style={{ fontFamily: 'var(--font-mono-numeric)' }}>
                                                    {symbol}{s.amount.toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-center text-slate-400 mt-6">
                                Settle offline via UPI/Cash, then log a &quot;Misc&quot; expense to keep records updated.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── Sub-components ──

/** Category filter pill using .badge styling */
const CategoryFilterPill = ({ active, onClick, label, color }) => {
    const badgeVariant = !color ? null
        : label === 'Transport' ? 'badge-info'
        : label === 'Stay' ? 'badge-money'
        : label === 'Food' ? 'badge'
        : label === 'Activity' ? 'badge-warning'
        : 'badge-neutral';

    if (active && color) {
        return (
            <button
                onClick={onClick}
                className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap text-white shadow-md scale-105 transition-all flex items-center gap-1.5"
                style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}40` }}
            >
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                {label}
            </button>
        );
    }
    if (active && !color) {
        return (
            <button
                onClick={onClick}
                className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap bg-slate-900 text-white shadow-md scale-105 transition-all"
            >
                {label}
            </button>
        );
    }
    // Inactive
    return (
        <button
            onClick={onClick}
            className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border border-slate-200 bg-white/80 text-slate-600 hover:shadow-sm hover:border-slate-300 transition-all flex items-center gap-1.5"
        >
            {color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />}
            {label}
        </button>
    );
};

export default Expenses;
