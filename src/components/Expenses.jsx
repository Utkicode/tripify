import React, { useState } from 'react';
import { DollarSign, Tag, TrendingUp, Filter, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';

const Expenses = ({ days }) => {
    // Flatten all items into a single expenses array
    const allExpenses = days.flatMap(day =>
        day.items
            .filter(item => Number(item.amount) > 0)
            .map(item => ({ ...item, date: day.date, dayName: day.dayName }))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalCost = allExpenses.reduce((acc, item) => acc + Number(item.amount), 0);
    const avgDaily = days.length > 0 ? Math.round(totalCost / days.length) : 0;
    const maxDay = days.reduce((max, day) => {
        const dTotal = day.items.reduce((s, i) => s + Number(i.amount), 0);
        return dTotal > max.total ? { name: day.dayName, total: dTotal } : max;
    }, { name: '-', total: 0 });

    const [filterCategory, setFilterCategory] = useState('All');

    const filteredExpenses = filterCategory === 'All'
        ? allExpenses
        : allExpenses.filter(e => e.category === filterCategory);

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={20} /></div>
                        {totalCost > 0 && <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold flex items-center">+<ArrowUpRight size={12} /></span>}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Total Spending</p>
                    <p className="text-2xl font-black text-slate-800">₹{totalCost.toLocaleString()}</p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={20} /></div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">Daily Avg</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Average / Day</p>
                    <p className="text-2xl font-black text-slate-800">₹{avgDaily.toLocaleString()}</p>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={20} /></div>
                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full font-bold">Highest</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Most Expensive Day</p>
                    <p className="text-lg font-bold text-slate-800 truncate" title={maxDay.name}>{maxDay.name}</p>
                    <p className="text-sm text-slate-400">₹{maxDay.total.toLocaleString()}</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilterCategory('All')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterCategory === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                >
                    All Expenses
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => setFilterCategory(cat.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${filterCategory === cat.name ? 'ring-2 ring-offset-1' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                        style={filterCategory === cat.name ? { backgroundColor: cat.color, color: 'white', borderColor: cat.color, ringColor: cat.color } : {}}
                    >
                        <span className={`w-2 h-2 rounded-full ${filterCategory === cat.name ? 'bg-white' : ''}`} style={filterCategory !== cat.name ? { backgroundColor: cat.color } : {}} /> {cat.name}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Detail</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        No expenses found for this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{expense.name || 'Untitled Expense'}</div>
                                            {expense.notes && <div className="text-xs text-slate-400 mt-0.5">{expense.notes}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORIES.find(c => c.name === expense.category)?.color }} />
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {expense.dayName} <span className="text-xs text-slate-400">({expense.date || 'No Date'})</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                            ₹{Number(expense.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
