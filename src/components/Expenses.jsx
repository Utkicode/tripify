import React, { useState, useEffect, useMemo } from 'react';
import { IndianRupee, Tag, TrendingUp, Filter, AlertCircle, ArrowUpRight, Plus, Trash2, Edit2, PieChart, Users, CheckCircle, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { ExpenseService } from '../services/ExpenseService';
import AddExpenseModal from './AddExpenseModal';
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

    const handleDelete = async (expenseId) => {
        if (!confirm('Delete this expense?')) return;
        try {
            await ExpenseService.deleteExpense(user.uid, tripId, expenseId);
        } catch (error) {
            alert('Failed to delete expense');
        }
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Trip Wallet</h2>
                    {isBudgetSet ? (
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span>Budget: ₹{budget.toLocaleString()}</span>
                            <button onClick={() => setIsEditingBudget(true)} className="p-1 hover:bg-slate-100 rounded text-blue-600"><Edit2 size={12} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingBudget(true)} className="text-sm text-blue-600 font-medium hover:underline mt-1">
                            + Set a Budget
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    {/* View Toggles */}
                    <div className="bg-white border border-slate-200 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode('transactions')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'transactions' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Transactions
                        </button>
                        <button
                            onClick={() => setViewMode('balances')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'balances' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Balances
                        </button>
                    </div>

                    {isEditingBudget && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-white p-1 rounded-lg border border-blue-200">
                            <input
                                type="number"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                className="w-24 px-2 py-1 text-sm border-none outline-none font-bold text-slate-700"
                                placeholder="Amount"
                                autoFocus
                            />
                            <button onClick={handleSaveBudget} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">Save</button>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Add
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={IndianRupee} iconColor="text-blue-600" bgColor="bg-blue-50"
                    label="Total Spending"
                    value={`₹${totalCost.toLocaleString()}`}
                    subElement={totalCost > 0 && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold flex items-center">+<ArrowUpRight size={12} /></span>}
                />

                {travelers.length > 1 ? (
                    <StatsCard
                        icon={Users} iconColor={myBalance >= 0 ? "text-emerald-600" : "text-red-600"} bgColor={myBalance >= 0 ? "bg-emerald-50" : "bg-red-50"}
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
                        subElement={<span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">Daily Avg</span>}
                        delay={0.1}
                    />
                )}

                {/* Budget Stat */}
                <div className="md:col-span-1">
                    {isBudgetSet ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Status</p>
                                <p className={`text-lg font-black ${budgetStats.remaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                    {Math.round(budgetStats.percentageUsed)}%
                                </p>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(budgetStats.percentageUsed, 100)}%` }}
                                    className={`h-full rounded-full ${budgetStats.percentageUsed > 100 ? 'bg-red-500' : budgetStats.percentageUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">
                                {budgetStats.remaining >= 0 ? `₹${budgetStats.remaining.toLocaleString()} Left` : `Over by ₹${Math.abs(budgetStats.remaining).toLocaleString()}`}
                            </p>
                        </div>
                    ) : (
                        <div onClick={() => setIsEditingBudget(true)} className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-2xl h-full flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-colors cursor-pointer">
                            <Plus size={24} className="mb-2" />
                            <span className="font-semibold text-sm">Set a Budget</span>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'transactions' ? (
                <>
                    {/* Filters */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
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

                    {/* Expense List */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid By</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                {filterCategory === 'All'
                                                    ? <div className="flex flex-col items-center gap-2">
                                                        <span>No expenses logged yet.</span>
                                                        <button onClick={() => setIsAddModalOpen(true)} className="text-blue-600 font-medium hover:underline">Add your first expense</button>
                                                    </div>
                                                    : 'No expenses found for this category.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map((expense) => {
                                            const payer = travelers.find(t => t.id === expense.paidBy)?.name || 'Someone';
                                            const isMultiSplit = expense.splitDetails && Object.keys(expense.splitDetails).length > 1;

                                            return (
                                                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-800">{expense.description || 'Untitled Expense'}</div>
                                                        <div className="text-xs text-slate-400">{expense.dayName} • {expense.date}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <CategoryBadge category={expense.category} />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {expense.paidBy === user.uid ? 'You' : payer}
                                                        {isMultiSplit && <span className="text-xs text-slate-400 block">Split with group</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                        ₹{Number(expense.amount).toLocaleString()}
                                                    </td>
                                                    <td className="px-2 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(expense.id)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
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
        </div>
    );
};

// --- Subcomponents for cleanliness ---

const StatsCard = ({ icon: Icon, iconColor, bgColor, label, value, subValue, subElement, delay = 0 }) => (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 ${bgColor} ${iconColor} rounded-xl`}><Icon size={20} /></div>
                {subElement}
            </div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className="text-2xl font-black text-slate-800 truncate" title={value}>{value}</p>
            {subValue && <p className="text-sm text-slate-400">{subValue}</p>}
        </div>
    </motion.div>
);

const FilterButton = ({ active, onClick, label, color, hasDot }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${active
            ? (color ? 'ring-2 ring-offset-1 text-white' : 'bg-slate-900 text-white')
            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
        style={active && color ? { backgroundColor: color, borderColor: color, ringColor: color } : {}}
    >
        {hasDot && <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : ''}`} style={!active ? { backgroundColor: color } : {}} />}
        {label}
    </button>
);

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
