import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Tag, ChevronRight, IndianRupee, MapPin, Search, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useProfile } from '../context/ProfileContext';

import { collection, addDoc, updateDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import AddExpenseModal from './AddExpenseModal';
import ConfirmModal from './common/ConfirmModal';

const Planner = ({ days, setDays, user, tripId, collaborators = [], isLoading = false }) => {
    const { profile } = useProfile();
    const [expandedDay, setExpandedDay] = useState(days[0]?.id || null);
    const [expenseModalInfo, setExpenseModalInfo] = useState({ isOpen: false, data: {} });
    const [locationSearch, setLocationSearch] = useState({ isOpen: false, dayId: null, itemId: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const logActivity = async (message, type = 'update') => {
        if (!user || !tripId) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'activities'), {
                text: message,
                type,
                timestamp: Date.now(),
                performedBy: user.uid,
                userName: user.displayName || 'Traveler',
                collaborators: collaborators // key for filtering notifications
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    // Debounced Search Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Determine user's current view logic or just global search
                // For now, global search via Nominatim
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const selectLocation = (loc) => {
        updateItem(locationSearch.dayId, locationSearch.itemId, 'location', {
            name: loc.display_name.split(',')[0],
            address: loc.display_name,
            lat: parseFloat(loc.lat),
            lon: parseFloat(loc.lon)
        });
        setLocationSearch({ isOpen: false, dayId: null, itemId: null });
        setSearchQuery('');
        setSearchResults([]);
    };

    const addDay = async () => {
        const newDay = {
            id: Date.now(),
            date: '',
            dayName: `Day ${days.length + 1}`,
            items: []
        };
        try {
            await setDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(newDay.id)), newDay);
            setExpandedDay(newDay.id);
            logActivity(`added a new day: ${newDay.dayName}`, 'add');
        } catch (error) {
            console.error("Error adding day:", error);
        }
    };

    // --- Delete Confirmation State ---
    const [confirmInfo, setConfirmInfo] = useState({
        isOpen: false,
        type: null, // 'day' or 'item'
        id: null,
        secondaryId: null // for item deletion (dayId)
    });

    const openDeleteDayModal = (dayId) => {
        setConfirmInfo({
            isOpen: true,
            type: 'day',
            id: dayId,
            secondaryId: null
        });
    };

    const openDeleteItemModal = (dayId, itemId) => {
        setConfirmInfo({
            isOpen: true,
            type: 'item',
            id: itemId,
            secondaryId: dayId
        });
    };

    const handleConfirmDelete = async () => {
        if (confirmInfo.type === 'day') {
            const dayId = confirmInfo.id;
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId)));
                if (expandedDay === dayId) setExpandedDay(days[0]?.id || null);
                logActivity(`deleted a day`, 'delete');
            } catch (error) {
                console.error("Error deleting day:", error);
            }
        } else if (confirmInfo.type === 'item') {
            const itemId = confirmInfo.id;
            const dayId = confirmInfo.secondaryId;
            const day = days.find(d => d.id === dayId);
            if (day) {
                const updatedItems = day.items.filter(item => item.id !== itemId);
                try {
                    const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
                    await updateDoc(dayRef, { items: updatedItems });
                    logActivity(`removed an activity`, 'delete');
                } catch (error) {
                    console.error("Error deleting item:", error);
                }
            }
        }
        setConfirmInfo({ isOpen: false, type: null, id: null, secondaryId: null });
    };

    const sortItems = (items) => {
        return [...items].sort((a, b) => a.time.localeCompare(b.time));
    };

    const addItem = async (dayId) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;

        let newItemTime;
        // Use Profile Preference for Day Start Time if it's the first item
        if (day.items.length === 0 && profile?.preferences?.dayStartTime) {
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
            notes: '',
            location: null
        };

        const updatedItems = sortItems([...day.items, newItem]);

        try {
            const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
            await updateDoc(dayRef, { items: updatedItems });
            logActivity(`added an activity`, 'add');
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    const updateItem = async (dayId, itemId, field, value) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;

        const updatedItems = day.items.map(item => {
            if (item.id === itemId) return { ...item, [field]: value };
            return item;
        });

        const finalItems = field === 'time' ? sortItems(updatedItems) : updatedItems;

        try {
            const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
            await updateDoc(dayRef, { items: finalItems });
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    // deleteItem function replaced by openDeleteItemModal + handleConfirmDelete logic above

    const updateDay = async (dayId, field, value) => {
        try {
            const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
            await updateDoc(dayRef, { [field]: value });
        } catch (error) {
            console.error("Error updating day:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex gap-8">
                    <div className="w-64 hidden lg:block space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-200 rounded-xl animate-pulse" />)}
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
                        <div className="h-20 bg-slate-200 rounded-3xl animate-pulse" />
                        <div className="h-20 bg-slate-200 rounded-3xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto relative">
            {/* Ambient Background Glows */}
            <div className="fixed top-32 left-0 w-96 h-96 bg-blue-400/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 blur-[150px] rounded-full -z-10 pointer-events-none"></div>

            {days.length === 0 ? (
                <div className="text-center py-24 border border-white/60 rounded-[3rem] bg-white/40 backdrop-blur-xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    <div className="bg-gradient-to-br from-blue-100 to-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-sm border border-white/50 relative z-10">
                        <Calendar size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 relative z-10">Your itinerary is empty</h3>
                    <p className="text-slate-500 mb-10 font-medium text-lg relative z-10">Start planning your adventure by adding days.</p>
                    <button onClick={addDay} className="relative z-10 bg-slate-900 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                        <Plus size={22} /> <span className="text-lg">Add First Day</span>
                    </button>
                </div>
            ) : (
                <div className="flex gap-8 items-start relative z-10">
                    {/* Sidebar / Timeline Nav */}
                    <div className="w-72 shrink-0 hidden lg:block sticky top-28 h-fit">
                        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 p-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 mb-4 flex items-center gap-2">
                                <Calendar size={14} /> Itinerary
                            </h3>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {days.map((day, index) => (
                                    <button
                                        key={day.id}
                                        onClick={() => setExpandedDay(day.id)}
                                        className={`w-full text-left px-5 py-4 rounded-[1.8rem] flex items-center justify-between group transition-all duration-300 relative overflow-hidden ${expandedDay === day.id
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-105 z-10'
                                            : 'hover:bg-white/60 text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="relative z-10">
                                            <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${expandedDay === day.id ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Day {index + 1}
                                            </p>
                                            <p className="font-bold truncate text-sm tracking-tight">{day.dayName}</p>
                                        </div>

                                        {expandedDay === day.id ? (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
                                                <ChevronRight size={16} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={addDay}
                                className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 hover:border-blue-400 bg-transparent hover:bg-blue-50 rounded-[1.8rem] text-slate-400 hover:text-blue-600 font-bold transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={18} strokeWidth={2.5} /> Add Day
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6 min-w-0">
                        <AnimatePresence mode="wait">
                            {days.map((day, index) => (
                                (expandedDay === day.id) && (
                                    <motion.div
                                        key={day.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        className="bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden relative"
                                    >
                                        {/* Day Header */}
                                        <div className="p-6 md:p-10 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-blue-500/20 shadow-lg">
                                                        Day {index + 1}
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={day.date}
                                                        onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                                                        className="bg-transparent border-none text-sm font-semibold text-slate-500 p-0 focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={day.dayName}
                                                    onChange={(e) => updateDay(day.id, 'dayName', e.target.value)}
                                                    className="text-3xl md:text-4xl font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 w-full tracking-tight"
                                                    placeholder="Day Title"
                                                />
                                            </div>
                                            <button
                                                onClick={() => openDeleteDayModal(day.id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                title="Delete Day"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Timeline */}
                                        <div className="p-6 md:p-10 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[54px] md:left-[85px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-100 via-indigo-100 to-slate-100 z-0"></div>

                                            <div className="space-y-8 relative z-10">
                                                <AnimatePresence initial={false}>
                                                    {day.items.map((item) => (
                                                        <motion.div
                                                            key={item.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="flex gap-4 md:gap-8 group"
                                                        >
                                                            {/* Time & Icon */}
                                                            <div className="flex flex-col items-center gap-4 pt-2 shrink-0 w-16 md:w-24">
                                                                <div className="flex items-center justify-center w-full">
                                                                    <input
                                                                        type="time"
                                                                        value={item.time}
                                                                        onChange={(e) => updateItem(day.id, item.id, 'time', e.target.value)}
                                                                        className="text-xs md:text-sm font-bold text-slate-500 bg-white/50 hover:bg-white border border-transparent hover:border-blue-200 rounded-xl px-2 py-1.5 w-full text-center focus:text-blue-600 focus:ring-0 transition-all cursor-pointer shadow-sm"
                                                                    />
                                                                </div>
                                                                <div
                                                                    className="w-14 h-14 rounded-[1.2rem] shadow-lg flex items-center justify-center text-white z-10 transition-transform duration-300 group-hover:scale-110 border-[3px] border-white ring-1 ring-slate-100"
                                                                    style={{ backgroundColor: CATEGORIES.find(c => c.name === item.category)?.color || '#94a3b8' }}
                                                                >
                                                                    <Tag size={20} strokeWidth={2.5} />
                                                                </div>
                                                            </div>

                                                            {/* Card */}
                                                            <div className="flex-1 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 rounded-[2.2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-200/20 hover:-translate-y-1 transition-all duration-300 min-w-0 relative overflow-hidden group/card">

                                                                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center relative z-10">
                                                                    <div className="flex-1 w-full space-y-3 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <select
                                                                                value={item.category}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'category', e.target.value)}
                                                                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-100 hover:border-blue-200 rounded-full py-1.5 pl-3 pr-8 focus:ring-0 cursor-pointer transition-colors shadow-sm"
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
                                                                            className="w-full font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 text-xl md:text-2xl placeholder:text-slate-300/80 tracking-tight"
                                                                        />

                                                                        {/* Location & Notes */}
                                                                        <div className="space-y-3">
                                                                            {item.location && (
                                                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-xl w-fit max-w-full backdrop-blur-md">
                                                                                    <MapPin size={14} className="shrink-0" />
                                                                                    <span className="truncate">{item.location.name}</span>
                                                                                    <button onClick={() => updateItem(day.id, item.id, 'location', null)} className="ml-1 hover:text-blue-900 shrink-0"><X size={14} /></button>
                                                                                </div>
                                                                            )}

                                                                            <input
                                                                                type="text"
                                                                                value={item.notes}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'notes', e.target.value)}
                                                                                placeholder="Add details, tickets, or notes..."
                                                                                className="w-full text-sm font-semibold text-slate-500 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-400"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-none border-slate-100 pt-4 xl:pt-0">
                                                                        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2 border border-slate-200/50 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                                                            <IndianRupee size={16} className="text-slate-400" />
                                                                            <input
                                                                                type="number"
                                                                                value={item.amount}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'amount', e.target.value)}
                                                                                placeholder="0"
                                                                                className="bg-transparent border-none w-16 md:w-20 text-sm font-bold text-slate-800 p-0 focus:ring-0 text-right"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <button
                                                                                onClick={() => setLocationSearch({ isOpen: true, dayId: day.id, itemId: item.id })}
                                                                                className={`p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 ${item.location ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-white'}`}
                                                                                title="Set Location"
                                                                            >
                                                                                <MapPin size={20} />
                                                                            </button>
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
                                                                                className="text-slate-400 hover:text-emerald-600 p-3 hover:bg-white rounded-2xl transition-all hover:scale-110 active:scale-95"
                                                                                title="Log as Expense"
                                                                            >
                                                                                <IndianRupee size={20} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openDeleteItemModal(day.id, item.id)}
                                                                                className="text-slate-400 hover:text-red-500 p-3 hover:bg-white rounded-2xl transition-all hover:scale-110 active:scale-95"
                                                                            >
                                                                                <Trash2 size={20} />
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
                                                    className="w-full py-6 border border-white/60 bg-white/40 backdrop-blur rounded-[2.5rem] text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-all font-bold flex items-center justify-center gap-3 group md:ml-32 ml-20 text-sm shadow-sm hover:shadow-md"
                                                    style={{ width: 'auto', flex: 1 }}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="group-hover:translate-x-1 transition-transform">Add New Activity</span>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>

                        {/* Mobile Day Nav */}
                        <div className="lg:hidden flex overflow-x-auto gap-3 pb-6 pt-2 scrollbar-hide px-1 sticky top-16 z-20 -mx-4 px-4 bg-gradient-to-b from-slate-50/90 to-slate-50/0 backdrop-blur-[2px]">
                            {days.map((day, index) => (
                                <button
                                    key={day.id}
                                    onClick={() => setExpandedDay(day.id)}
                                    className={`px-5 py-2.5 rounded-[1rem] whitespace-nowrap text-xs font-bold border flex-shrink-0 snap-center transition-all shadow-sm ${expandedDay === day.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105'
                                        : 'bg-white/80 backdrop-blur-md text-slate-600 border-white/50 hover:bg-white'
                                        }`}
                                >
                                    <span className="opacity-60 text-[10px] uppercase mr-1.5">Day {index + 1}</span>
                                    {day.dayName}
                                </button>
                            ))}
                            <button onClick={addDay} className="px-5 py-2.5 rounded-[1rem] border-2 border-dashed border-slate-300 bg-white/40 text-slate-500 font-bold whitespace-nowrap flex-shrink-0 snap-center hover:bg-white/80 transition-all text-xs flex items-center gap-1">
                                <Plus size={14} /> Add
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

            {/* Location Search Modal */}
            <AnimatePresence>
                {locationSearch.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Search Location</h3>
                                <button
                                    onClick={() => setLocationSearch({ isOpen: false, dayId: null, itemId: null })}
                                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for a place..."
                                        className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                                        autoFocus
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {isSearching ? (
                                            <Loader className="animate-spin text-blue-500" size={18} />
                                        ) : searchQuery ? (
                                            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="hover:text-slate-600">
                                                <X size={18} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-1 -mx-2 px-2 custom-scrollbar">
                                    {searchResults.length > 0 ? (
                                        searchResults.map((result, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => selectLocation(result)}
                                                className="w-full text-left p-3 hover:bg-blue-50 hover:border-blue-100 rounded-xl transition-all border border-transparent flex items-start gap-3 group"
                                            >
                                                <div className="p-2 bg-slate-100 text-slate-400 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors mt-0.5">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 truncate">{result.display_name.split(',')[0]}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{result.display_name}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        !isSearching && searchQuery && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2 text-slate-300">
                                                    <MapPin size={24} />
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">No locations found</p>
                                                <p className="text-xs text-slate-400">Try a different search term</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Powered by OpenStreetMap
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmInfo.isOpen}
                onClose={() => setConfirmInfo({ ...confirmInfo, isOpen: false })}
                onConfirm={handleConfirmDelete}
                title={confirmInfo.type === 'day' ? "Delete Day?" : "Delete Activity?"}
                message={confirmInfo.type === 'day'
                    ? "Are you sure you want to delete this day? All activities within it will be lost."
                    : "Are you sure you want to delete this activity?"
                }
            />
        </div>
    );
};

export default Planner;
