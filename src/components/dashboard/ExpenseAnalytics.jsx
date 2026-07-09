import React from'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from'recharts';
import { Wallet, TrendUp, WarningCircle } from'@phosphor-icons/react';
import { CATEGORIES } from'../../constants';

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
                    <p className="text-[#1A1A1A] font-medium">
                        {currencySymbol}{payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Overall Health Card - Massive Glass Pill */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl lg:col-span-1 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                {/* Decorative Circles */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 0/40 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 opacity-90">
                        <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="font-bold tracking-widest text-sm uppercase text-indigo-100">Total Spend</span>
                    </div>
                    <h3 className="text-6xl font-black mb-2 tracking-tighter">
                        {currencySymbol}{totalSpent.toLocaleString()}
                    </h3>
                    <p className="text-indigo-200 text-lg font-medium mb-8">
                        of {currencySymbol}{totalBudget.toLocaleString()} total budget
                    </p>
                </div>

                <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                    <div className="flex justify-between text-sm font-bold mb-3 opacity-100 text-white">
                        <span>{Math.min(budgetUtilized, 100).toFixed(0)}% Utilized</span>
                        {isOverBudget && <span className="flex items-center gap-1 text-red-300 animate-pulse"><WarningCircle size={16} /> Over Budget</span>}
                    </div>
                    {/* Progress Bar */}
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ?'bg-gradient-to-r from-red-400 to-pink-500' :'bg-gradient-to-r from-emerald-400 to-teal-400'}`}
                            style={{ width: `${Math.min(budgetUtilized, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Category Breakdown Chart - Floating Glass Card */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 p-8 shadow-xl lg:col-span-2 flex flex-col sm:flex-row items-center gap-10 relative">
                <div className="absolute top-6 left-8 /80 backdrop-blur px-3 py-1 rounded-full text-[#1A1A1A] font-bold text-xs uppercase tracking-wider border border-blue-100/50">
                    Spending by Category
                </div>

                <div className="flex-1 w-full h-72 min-h-[280px]">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={6}
                                    dataKey="value"
                                    cornerRadius={8}
                                >
                                    {chartData.map((entry, index) => {
                                        const catColor = CATEGORIES.find(c => c.name === entry.name)?.color ||'#94a3b8';
                                        return <Cell key={`cell-${index}`} fill={catColor} stroke="none" />;
                                    })}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill:'transparent' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-20 h-20  rounded-[2rem] flex items-center justify-center shadow-inner">
                                <TrendUp size={32} />
                            </div>
                            <p className="text-lg font-bold">No expenses logged yet</p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="w-full sm:w-72 space-y-4 pr-4">
                    <h4 className="font-extrabold text-slate-800 mb-4 text-xl">Top Categories</h4>
                    {chartData.slice(0, 4).map((entry, index) => {
                        const catColor = CATEGORIES.find(c => c.name === entry.name)?.color ||'#94a3b8';
                        return (
                            <div key={index} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/50 transition-colors border border-transparent hover:border-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white" style={{ backgroundColor: catColor }}></div>
                                    <span className="text-sm font-bold text-slate-600">{entry.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">
                                    {currencySymbol}{entry.value.toLocaleString()}
                                </span>
                            </div>
                        );
                    })}
                    {chartData.length > 4 && (
                        <p className="text-xs font-bold text-slate-400 pt-3 border-t border-slate-200/50 text-center uppercase tracking-wider">
                            + {chartData.length - 4} more categories
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseAnalytics;
