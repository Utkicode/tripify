import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { CATEGORIES } from '../constants';

const Insights = ({ days }) => {
    const getDailyData = () => days.map(day => ({
        name: day.dayName || day.date,
        total: day.items.reduce((sum, i) => sum + Number(i.amount), 0),
        ...day.items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + Number(i.amount); return acc; }, {})
    }));

    const getCategoryData = () => {
        const totals = { Transport: 0, Stay: 0, Food: 0, Activity: 0, Misc: 0 };
        days.forEach(d => d.items.forEach(i => { if (totals[i.category] !== undefined) totals[i.category] += Number(i.amount); }));
        return Object.keys(totals).map(k => ({ name: k, value: totals[k], color: CATEGORIES.find(c => c.name === k)?.color })).filter(c => c.value > 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDailyData()} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Legend />
                        <Bar dataKey="Transport" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Stay" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="Activity" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Food" stackId="a" fill="#10b981" />
                        <Bar dataKey="Misc" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={getCategoryData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {getCategoryData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Insights;
