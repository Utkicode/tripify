import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '../../constants';

const COLORS = CATEGORIES.map(c => c.color);

const ExpenseAnalytics = ({ totalBudget, totalSpent, chartData, currencySymbol }) => {
    // Calculate percentages
    const budgetUtilized = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = totalSpent > totalBudget;

    // Custom Tooltip for Pie Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                    <p className="font-bold text-slate-800">{payload[0].name}</p>
                    <p className="text-blue-600 font-medium">
                        {currencySymbol}{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 1. Overall Health Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white text-white shadow-lg lg:col-span-1 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-2xl"></div>

                <div>
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <Wallet size={20} />
                        <span className="font-medium tracking-wide text-sm uppercase">Total Spend</span>
                    </div>
                    <h3 className="text-4xl font-extrabold mb-1">
                        {currencySymbol}{totalSpent.toLocaleString()}
                    </h3>
                    <p className="text-indigo-100 text-sm mb-6">
                        of {currencySymbol}{totalBudget.toLocaleString()} budget
                    </p>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between text-xs font-medium mb-2 opacity-90">
                        <span>{Math.min(budgetUtilized, 100).toFixed(0)}% Used</span>
                        {isOverBudget && <span className="flex items-center gap-1 text-red-200"><AlertCircle size={12} /> Over Budget</span>}
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(budgetUtilized, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Category Breakdown Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1 w-full h-64 min-h-[250px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => {
                                        const catColor = CATEGORIES.find(c => c.name === entry.name)?.color || '#94a3b8';
                                        return <Cell key={`cell-${index}`} fill={catColor} stroke="none" />;
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                <TrendingUp size={24} />
                            </div>
                            <p className="text-sm">No expenses logged yet</p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="w-full sm:w-64 space-y-3">
                    <h4 className="font-bold text-slate-700 mb-2">Top Categories</h4>
                    {chartData.slice(0, 4).map((entry, index) => {
                        const catColor = CATEGORIES.find(c => c.name === entry.name)?.color || '#94a3b8';
                        return (
                            <div key={index} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }}></div>
                                    <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-800">
                                    {currencySymbol}{entry.value.toLocaleString()}
                                </span>
                            </div>
                        );
                    })}
                    {chartData.length > 4 && (
                        <p className="text-xs text-slate-400 pt-2 border-t border-slate-100 text-center">
                            + {chartData.length - 4} more categories
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseAnalytics;
