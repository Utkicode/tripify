import React, { useState, useEffect } from 'react';
import { IndianRupee, Tag, TrendingUp, Filter, AlertCircle, ArrowUpRight, Plus, Trash2, Edit2, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { ExpenseService } from '../services/ExpenseService';
import AddExpenseModal from './AddExpenseModal';

const Expenses = ({ days = [], user, tripId, budget = 0, onUpdateTripInfo }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(budget);

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
                    <h2 className="text-2xl font-bold text-slate-800">Expenses</h2>
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
                        <Plus size={20} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Budget Progress Bar (Visible only if budget set) */}
            {isBudgetSet && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2 relative z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Status</p>
                            <p className={`text-xl font-black ${budgetStats.remaining < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                {budgetStats.remaining >= 0 ? `₹${budgetStats.remaining.toLocaleString()} Left` : `Over by ₹${Math.abs(budgetStats.remaining).toLocaleString()}`}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400">{Math.round(budgetStats.percentageUsed)}% Used</p>
                        </div>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(budgetStats.percentageUsed, 100)}%` }}
                            className={`h-full rounded-full ${budgetStats.percentageUsed > 100 ? 'bg-red-500' : budgetStats.percentageUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        />
                    </div>
                </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    icon={IndianRupee} iconColor="text-blue-600" bgColor="bg-blue-50"
                    label="Total Spending"
                    value={`₹${totalCost.toLocaleString()}`}
                    subElement={totalCost > 0 && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold flex items-center">+<ArrowUpRight size={12} /></span>}
                />
                <StatsCard
                    icon={TrendingUp} iconColor="text-purple-600" bgColor="bg-purple-50"
                    label="Average / Day"
                    value={`₹${avgDaily.toLocaleString()}`}
                    subElement={<span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">Daily Avg</span>}
                    delay={0.1}
                />
                <StatsCard
                    icon={AlertCircle} iconColor="text-amber-600" bgColor="bg-amber-50"
                    label="Most Expensive Day"
                    value={maxDay.name}
                    subValue={`₹${maxDay.total.toLocaleString()}`}
                    subElement={<span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold">Highest</span>}
                    delay={0.2}
                />
            </div>

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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Detail</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</th>
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
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{expense.description || 'Untitled Expense'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <CategoryBadge category={expense.category} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {expense.dayName} <span className="text-xs text-slate-400">({expense.date})</span>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                user={user}
                tripId={tripId}
            />
        </div>
    );
};

// --- Subcomponents for cleanliness ---

const StatsCard = ({ icon: Icon, iconColor, bgColor, label, value, subValue, subElement, delay = 0 }) => (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 ${bgColor} ${iconColor} rounded-xl`}><Icon size={20} /></div>
            {subElement}
        </div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800 truncate" title={value}>{value}</p>
        {subValue && <p className="text-sm text-slate-400">{subValue}</p>}
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
