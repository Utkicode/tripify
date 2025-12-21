import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Tag, ChevronRight, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useProfile } from '../context/ProfileContext';

import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import AddExpenseModal from './AddExpenseModal';

const Planner = ({ days, setDays, user, tripId }) => {
    const { profile } = useProfile();
    const [expandedDay, setExpandedDay] = useState(days[0]?.id || null);
    const [expenseModalInfo, setExpenseModalInfo] = useState({ isOpen: false, data: {} });

    const logActivity = async (message, type = 'edit') => {
        if (!user || !tripId) return;
        try {
            const activity = {
                type,
                message,
                user: user.displayName || 'User',
                timestamp: Date.now(),
                tripId: tripId // Add tripId for context
            };

            // 1. Trip Level
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'trips', tripId, 'activities'), activity);

            // 2. Global Level (for Dashboard)
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), activity);

        } catch (error) {
            console.error("Error logging activity:", error);
        }
    };

    const addDay = () => {
        const newDay = {
            id: Date.now(),
            date: '',
            dayName: `Day ${days.length + 1}`,
            items: []
        };
        setDays([...days, newDay]);
        setExpandedDay(newDay.id);
        logActivity(`added a new day: ${newDay.dayName}`, 'add');
    };

    const deleteDay = (dayId) => {
        if (!confirm('Delete this day?')) return;
        setDays(days.filter(d => d.id !== dayId));
        if (expandedDay === dayId) setExpandedDay(days[0]?.id || null);
        logActivity(`deleted a day`, 'delete');
    };

    const sortItems = (items) => {
        return [...items].sort((a, b) => a.time.localeCompare(b.time));
    };

    const addItem = (dayId) => {
        const day = days.find(d => d.id === dayId);
        let newItemTime;

        // Use Profile Preference for Day Start Time if it's the first item
        if (day && day.items.length === 0 && profile?.preferences?.dayStartTime) {
            newItemTime = profile.preferences.dayStartTime;
        } else {
            const now = new Date();
            newItemTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        }

        const newItem = {
            id: Date.now(),
            name: '',
            amount: '',
            category: 'Misc',
            time: newItemTime,
            notes: ''
        };
        const updatedDays = days.map(day => {
            if (day.id === dayId) {
                // Add new item and Sort
                return { ...day, items: sortItems([...day.items, newItem]) };
            }
            return day;
        });
        setDays(updatedDays);
        logActivity(`added an activity`, 'add');
    };

    const updateItem = (dayId, itemId, field, value) => {
        const updatedDays = days.map(day => {
            if (day.id === dayId) {
                const updatedItems = day.items.map(item => {
                    if (item.id === itemId) return { ...item, [field]: value };
                    return item;
                });
                // Sort if time was changed
                return { ...day, items: field === 'time' ? sortItems(updatedItems) : updatedItems };
            }
            return day;
        });
        setDays(updatedDays);
    };

    const deleteItem = (dayId, itemId) => {
        const updatedDays = days.map(day => {
            if (day.id === dayId) {
                return { ...day, items: day.items.filter(item => item.id !== itemId) };
            }
            return day;
        });
        setDays(updatedDays);
        logActivity(`removed an activity`, 'delete');
    };

    const updateDay = (dayId, field, value) => {
        setDays(days.map(d => d.id === dayId ? { ...d, [field]: value } : d));
    };

    return (
        <div className="max-w-4xl mx-auto">
            {days.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    <Calendar className="mx-auto h-16 w-16 text-blue-100 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">Your itinerary is empty</h3>
                    <p className="text-slate-500 mb-6">Start planning your days.</p>
                    <button onClick={addDay} className="btn-primary mx-auto">
                        <Plus size={18} /> Add First Day
                    </button>
                </div>
            ) : (
                <div className="flex gap-8 items-start">
                    {/* Sidebar / Timeline Nav */}
                    <div className="w-64 shrink-0 hidden lg:block sticky top-24">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                            {days.map((day, index) => (
                                <button
                                    key={day.id}
                                    onClick={() => setExpandedDay(day.id)}
                                    className={`w-full text-left px-4 py-3 rounded-xl mb-1 flex items-center justify-between group transition-all ${expandedDay === day.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <div>
                                        <p className={`text-xs font-semibold uppercase tracking-wider ${expandedDay === day.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                            Day {index + 1}
                                        </p>
                                        <p className="font-bold truncate">{day.dayName}</p>
                                    </div>
                                    {expandedDay === day.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                            <button
                                onClick={addDay}
                                className="w-full mt-2 py-3 border border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Day
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <AnimatePresence mode="wait">
                            {days.map((day, index) => (
                                (expandedDay === day.id) && (
                                    <motion.div
                                        key={day.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                                    >
                                        {/* Day Header */}
                                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        Day {index + 1}
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={day.date}
                                                        onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                                                        className="bg-transparent border-none text-sm text-slate-500 p-0 focus:ring-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={day.dayName}
                                                    onChange={(e) => updateDay(day.id, 'dayName', e.target.value)}
                                                    className="text-3xl font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 w-full"
                                                    placeholder="Day Title"
                                                />
                                            </div>
                                            <button
                                                onClick={() => deleteDay(day.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Timeline */}
                                        <div className="p-8 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[54px] top-8 bottom-8 w-0.5 bg-slate-100 z-0"></div>

                                            <div className="space-y-6 relative z-10">
                                                <AnimatePresence initial={false}>
                                                    {day.items.map((item) => (
                                                        <motion.div
                                                            key={item.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="flex gap-6 group"
                                                        >
                                                            {/* Time & Icon */}
                                                            <div className="flex flex-col items-center gap-3 pt-1 shrink-0 w-20">
                                                                <div className="flex items-center justify-center">
                                                                    <input
                                                                        type="time"
                                                                        value={item.time}
                                                                        onChange={(e) => updateItem(day.id, item.id, 'time', e.target.value)}
                                                                        className="text-sm font-bold text-slate-700 bg-white/50 border border-slate-200 rounded-md px-1 py-0.5 w-auto text-center focus:text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                                                                    />
                                                                </div>
                                                                <div
                                                                    className="w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white z-10 transition-transform group-hover:scale-110"
                                                                    style={{ backgroundColor: CATEGORIES.find(c => c.name === item.category)?.color || '#94a3b8' }}
                                                                >
                                                                    <Tag size={16} />
                                                                </div>
                                                            </div>

                                                            {/* Card */}
                                                            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all">
                                                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                                    <div className="flex-1 w-full space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <select
                                                                                value={item.category}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'category', e.target.value)}
                                                                                className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 rounded-md border-none py-1 pl-2 pr-6 focus:ring-0 cursor-pointer"
                                                                            >
                                                                                {CATEGORIES.map(cat => (
                                                                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={item.name}
                                                                            onChange={(e) => updateItem(day.id, item.id, 'name', e.target.value)}
                                                                            placeholder="Activity name..."
                                                                            className="w-full font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 text-lg placeholder:text-slate-300"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={item.notes}
                                                                            onChange={(e) => updateItem(day.id, item.id, 'notes', e.target.value)}
                                                                            placeholder="Add notes, location, or details..."
                                                                            className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                                        />
                                                                    </div>

                                                                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                                                        <div className="bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-100">
                                                                            <IndianRupee size={14} className="text-slate-400" />
                                                                            <input
                                                                                type="number"
                                                                                value={item.amount}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'amount', e.target.value)}
                                                                                placeholder="0"
                                                                                className="bg-transparent border-none w-20 text-sm font-semibold text-slate-700 p-0 focus:ring-0 text-right"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => setExpenseModalInfo({
                                                                                    isOpen: true,
                                                                                    data: {
                                                                                        name: item.name,
                                                                                        amount: item.amount,
                                                                                        category: item.category,
                                                                                        date: day.date
                                                                                    }
                                                                                })}
                                                                                className="text-slate-300 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                                                title="Log as Expense"
                                                                            >
                                                                                <IndianRupee size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deleteItem(day.id, item.id)}
                                                                                className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 size={18} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>

                                                <motion.button
                                                    layout
                                                    onClick={() => addItem(day.id)}
                                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 transition-all font-bold flex items-center justify-center gap-2 group ml-20"
                                                    style={{ width: 'calc(100% - 5rem)' }}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                        <Plus size={16} />
                                                    </div>
                                                    Add Activity
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>

                        {/* Mobile Day Nav */}
                        <div className="lg:hidden flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
                            {days.map((day, index) => (
                                <button
                                    key={day.id}
                                    onClick={() => setExpandedDay(day.id)}
                                    className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium border ${expandedDay === day.id
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-200'
                                        }`}
                                >
                                    Day {index + 1}
                                </button>
                            ))}
                            <button onClick={addDay} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 font-medium whitespace-nowrap">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AddExpenseModal
                isOpen={expenseModalInfo.isOpen}
                onClose={() => setExpenseModalInfo({ ...expenseModalInfo, isOpen: false })}
                user={user}
                tripId={tripId}
                initialData={expenseModalInfo.data}
            />
        </div>
    );
};

export default Planner;
