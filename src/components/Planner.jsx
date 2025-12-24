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
                                        <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
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
                                                    className="text-2xl md:text-3xl font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 w-full"
                                                    placeholder="Day Title"
                                                />
                                            </div>
                                            <button
                                                onClick={() => openDeleteDayModal(day.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Timeline */}
                                        <div className="p-4 md:p-8 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[38px] md:left-[54px] top-8 bottom-8 w-0.5 bg-slate-100 z-0"></div>

                                            <div className="space-y-6 relative z-10">
                                                <AnimatePresence initial={false}>
                                                    {day.items.map((item) => (
                                                        <motion.div
                                                            key={item.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className="flex gap-3 md:gap-6 group"
                                                        >
                                                            {/* Time & Icon */}
                                                            <div className="flex flex-col items-center gap-3 pt-1 shrink-0 w-12 md:w-20">
                                                                <div className="flex items-center justify-center">
                                                                    <input
                                                                        type="time"
                                                                        value={item.time}
                                                                        onChange={(e) => updateItem(day.id, item.id, 'time', e.target.value)}
                                                                        className="text-xs md:text-sm font-bold text-slate-700 bg-white/50 border border-slate-200 rounded-md px-1 py-0.5 w-full text-center focus:text-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
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
                                                            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all min-w-0">
                                                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                                                    <div className="flex-1 w-full space-y-2 min-w-0">
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

                                                                        {/* Location & Notes */}
                                                                        <div className="space-y-1">
                                                                            {item.location && (
                                                                                <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit max-w-full">
                                                                                    <MapPin size={12} className="shrink-0" />
                                                                                    <span className="truncate">{item.location.name}</span>
                                                                                    <button onClick={() => updateItem(day.id, item.id, 'location', null)} className="ml-1 hover:text-blue-800 shrink-0"><X size={12} /></button>
                                                                                </div>
                                                                            )}

                                                                            <input
                                                                                type="text"
                                                                                value={item.notes}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'notes', e.target.value)}
                                                                                placeholder="Add notes, e.g. tickets..."
                                                                                className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                                                            />
                                                                        </div>
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
                                                                                onClick={() => setLocationSearch({ isOpen: true, dayId: day.id, itemId: item.id })}
                                                                                className={`text-slate-300 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors ${item.location ? 'text-blue-500' : ''}`}
                                                                                title="Set Location"
                                                                            >
                                                                                <MapPin size={18} />
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
                                                                                className="text-slate-300 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                                                title="Log as Expense"
                                                                            >
                                                                                <IndianRupee size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openDeleteItemModal(day.id, item.id)}
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
                                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 transition-all font-bold flex items-center justify-center gap-2 group md:ml-20 ml-12"
                                                    style={{ width: 'auto', flex: 1 }} // Reset fixed width calc
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
