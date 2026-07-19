import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash, Calendar, Tag, CaretRight, CurrencyInr, MapPin, MagnifyingGlass, SpinnerGap, X, Sparkle } from '@phosphor-icons/react';

// Auto-resize textarea that grows with content and never truncates
const AutoTextarea = ({ value, onChange, disabled, placeholder, className }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [value]);
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`${className} resize-none overflow-hidden`}
        />
    );
};

// Compute total estimated cost for a day's items
const getDayTotal = (items = []) =>
    items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

const formatINR = (n) =>
    n === 0 ? null : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../constants';
import { useProfile } from '../context/ProfileContext';
import { mapCategoryAndFallback } from '../utils/intelligence';

import { collection, addDoc, updateDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import AddExpenseModal from './AddExpenseModal';
import { useConfirm } from '../context/ConfirmContext';

// Shimmer animation keyframe is defined in index.css as @keyframes shimmer
// We rely on the 'animate-pulse' Tailwind class for the skeleton cards here.

const Planner = ({
    days,
    setDays,
    user,
    tripId,
    collaborators = [],
    isLoading = false,
    isCompleted = false,
    isRegenerating = false,
    regeneratingDayId = null,
    onRegenerateDay = null,
    travelers = [],
}) => {
    const { profile } = useProfile();
    const confirm = useConfirm();
    const [expandedDay, setExpandedDay] = useState(days[0]?.id || null);
    const [expenseModalInfo, setExpenseModalInfo] = useState({ isOpen: false, data: {} });
    const [locationSearch, setLocationSearch] = useState({ isOpen: false, dayId: null, itemId: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Keep expandedDay in sync when days list changes (e.g. after regeneration)
    useEffect(() => {
        if (days.length > 0 && !days.find(d => d.id === expandedDay)) {
            setExpandedDay(days[0]?.id || null);
        }
    }, [days]);

    const logActivity = async (message, type = 'update') => {
        if (!user || !tripId) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'activities'), {
                text: message,
                type,
                timestamp: Date.now(),
                performedBy: user.uid,
                userName: user.displayName || 'Traveler',
                collaborators: collaborators
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
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`);
                const data = await response.json();
                if (data && data.features) {
                    const mapped = data.features.map(feature => {
                        const props = feature.properties;
                        const [lon, lat] = feature.geometry.coordinates;

                        let name = props.name;
                        if (!name && props.street) {
                            name = props.housenumber ? `${props.housenumber} ${props.street}` : props.street;
                        }

                        const nameParts = [];
                        if (name) nameParts.push(name);
                        const cityOrTown = props.city || props.town || props.village;
                        if (cityOrTown && cityOrTown !== name) nameParts.push(cityOrTown);
                        if (props.state && props.state !== name && props.state !== cityOrTown) nameParts.push(props.state);
                        if (props.country && props.country !== name) nameParts.push(props.country);

                        const displayName = nameParts.join(', ');
                        return {
                            display_name: displayName,
                            lat: String(lat),
                            lon: String(lon)
                        };
                    });
                    setSearchResults(mapped);
                } else {
                    setSearchResults([]);
                }
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
            await updateDoc(doc(db, 'artifacts', appId, 'trips', tripId), { dayCount: days.length + 1 });
            setExpandedDay(newDay.id);
            logActivity(`added a new day: ${newDay.dayName}`, 'add');
        } catch (error) {
            console.error("Error adding day:", error);
        }
    };

    const openDeleteDayModal = (dayId) => {
        confirm({
            title: 'Delete Day?',
            message: 'Are you sure you want to delete this day? All activities within it will be lost.',
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () => handleDeleteDay(dayId)
        });
    };

    const openDeleteItemModal = (dayId, itemId) => {
        confirm({
            title: 'Delete Activity?',
            message: 'Are you sure you want to delete this activity?',
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () => handleDeleteItem(dayId, itemId)
        });
    };

    const handleDeleteDay = async (dayId) => {
        await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId)));
        await updateDoc(doc(db, 'artifacts', appId, 'trips', tripId), { dayCount: Math.max(0, days.length - 1) });
        if (expandedDay === dayId) setExpandedDay(days[0]?.id || null);
        logActivity(`deleted a day`, 'delete');
    };

    const handleDeleteItem = async (dayId, itemId) => {
        const day = days.find(d => d.id === dayId);
        if (!day) return;

        const updatedItems = day.items.filter(item => item.id !== itemId);
        const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
        await updateDoc(dayRef, { items: updatedItems });
        logActivity(`removed an activity`, 'delete');
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
            id: crypto.randomUUID(),
            name: '',
            amount: '',
            isEstimate: false,
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
            if (item.id === itemId) {
                const updated = { ...item, [field]: value };
                if (field === 'name') {
                    const mappedCategory = mapCategoryAndFallback(value, null);
                    if (mappedCategory !== 'Misc' || item.category === 'Misc') {
                        updated.category = mappedCategory;
                    }
                }
                // When a user manually edits the amount, clear the isEstimate flag
                if (field === 'amount') {
                    updated.isEstimate = false;
                }
                return updated;
            }
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

    const updateDay = async (dayId, field, value) => {
        try {
            const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
            await updateDoc(dayRef, { [field]: value });
        } catch (error) {
            console.error("Error updating day:", error);
        }
    };

    // Loading skeleton — shown while initial data loads
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex gap-8">
                    <div className="w-64 hidden lg:block space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    <div className="flex-1 space-y-4">
                        {/* Day header skeleton */}
                        <div className="bg-white/60 rounded-[3rem] border border-white/60 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 space-y-3">
                                <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
                                <div className="h-8 w-56 bg-slate-100 rounded-xl animate-pulse" />
                            </div>
                            <div className="p-8 space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-8">
                                        <div className="flex flex-col items-center gap-3 w-24 shrink-0">
                                            <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
                                            <div className="w-14 h-14 bg-slate-100 rounded-[1.2rem] animate-pulse" />
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-[2.2rem] p-6 space-y-3 border border-slate-100">
                                            <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
                                            <div className="h-6 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                                            <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-sm text-slate-400 font-medium animate-pulse">Building your itinerary…</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto relative">

            {days.length === 0 ? (
                <div className="text-center py-24 border border-white/60 rounded-[3rem] bg-white/40 backdrop-blur-xl shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    <div className="bg-gradient-to-br from-blue-100 to-white w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-[#1A1A1A] shadow-sm border border-white/50 relative z-10">
                        <Calendar size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 relative z-10">Your itinerary is empty</h3>
                    <p className="text-slate-500 mb-10 font-medium text-lg relative z-10">Start planning your adventure by adding days.</p>
                    {!isCompleted && (
                        <button onClick={addDay} className="relative z-10 bg-slate-900 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                            <Plus size={22} /> <span className="text-lg">Add First Day</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex gap-8 items-start relative z-10">
                    {/* Sidebar / Timeline Nav */}
                    {/* sticky: top must be below workspace header (80px) + tabs bar (~48px) = 128px = 8rem */}
                    <div className="w-72 shrink-0 hidden lg:block sticky top-[8.5rem] h-fit">
                        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 p-5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 mb-4 flex items-center gap-2">
                                <Calendar size={14} /> Itinerary
                            </h3>
                            <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                                {days.map((day, index) => {
                                    const dayTotal = getDayTotal(day.items);
                                    const hasEstimates = day.items?.some(i => i.isEstimate);
                                    const isActive = expandedDay === day.id;
                                    return (
                                        <button
                                            key={day.id}
                                            onClick={() => setExpandedDay(day.id)}
                                            className={`w-full text-left px-4 py-3.5 rounded-[1.5rem] flex items-start justify-between group transition-all duration-300 relative overflow-hidden ${isActive
                                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-[1.02] z-10'
                                                : 'hover:bg-white/60 text-slate-500 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="relative z-10 min-w-0 flex-1 pr-2">
                                                {/* Day N + date */}
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                                                        Day {index + 1}
                                                    </p>
                                                    {day.date && (
                                                        <p className={`text-[9px] font-semibold ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                                                            {new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Theme — wraps up to 2 lines */}
                                                <p className={`font-bold text-sm tracking-tight leading-snug line-clamp-2 ${isActive ? 'text-white' : ''}`}>{day.dayName}</p>
                                                {/* Day total */}
                                                {dayTotal > 0 && (
                                                    <p className={`text-[10px] font-bold mt-1.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                                                        {hasEstimates ? 'Est. ' : ''}₹{formatINR(dayTotal)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                                                {/* Per-day regen button */}
                                                {!isCompleted && onRegenerateDay && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRegenerateDay(day.id, index);
                                                        }}
                                                        disabled={regeneratingDayId === day.id}
                                                        title={`Regenerate Day ${index + 1}`}
                                                        className={`p-1.5 rounded-full transition-all ${isActive
                                                            ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800'
                                                            : 'text-slate-300 hover:text-amber-500 hover:bg-white/60'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {regeneratingDayId === day.id
                                                            ? <SpinnerGap size={12} className="animate-spin" />
                                                            : <Sparkle size={12} weight="fill" />
                                                        }
                                                    </button>
                                                )}
                                                {isActive ? (
                                                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[#FF6B35] shadow-inner">
                                                        <CaretRight size={14} strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#FF6B35] transition-colors mt-1"></div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {!isCompleted && (
                                <button
                                    onClick={addDay}
                                    className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 hover:border-[#FF6B35]/40 bg-transparent rounded-[1.8rem] text-slate-400 hover:text-[#FF6B35] font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Plus size={18} strokeWidth={2.5} /> Add Day
                                </button>
                            )}
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
                                        {/* Per-day regeneration overlay */}
                                        <AnimatePresence>
                                            {regeneratingDayId === day.id && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 z-30 rounded-[3rem] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                                                >
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                                                        <Sparkle size={28} weight="fill" className="text-white animate-pulse" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-slate-900 text-lg">Regenerating Day {index + 1}</p>
                                                        <p className="text-slate-400 text-sm font-medium mt-1">AI is crafting a fresh plan…</p>
                                                    </div>
                                                    <div className="flex gap-1.5 mt-2">
                                                        {[0, 1, 2].map(i => (
                                                            <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Day Header */}
                                        <div className="px-6 md:px-10 pt-8 pb-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
                                            {/* Top row: Day N badge + date + day total + actions */}
                                            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="bg-[#FF6B35] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[#FF6B35]/25 shadow-lg shrink-0">
                                                        Day {index + 1}
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={day.date}
                                                        onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                                                        disabled={isCompleted}
                                                        className={`bg-transparent border-none text-sm font-semibold text-slate-500 p-0 focus:ring-0 transition-colors ${isCompleted ? 'cursor-default' : 'cursor-pointer hover:text-[#1A1A1A]'}`}
                                                    />
                                                    {/* Day total cost pill */}
                                                    {(() => {
                                                        const total = getDayTotal(day.items);
                                                        const hasEst = day.items?.some(i => i.isEstimate);
                                                        if (!total) return null;
                                                        return (
                                                            <span className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 text-amber-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">
                                                                {hasEst && <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider">Est.</span>}
                                                                <CurrencyInr size={11} />
                                                                {formatINR(total)}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                {!isCompleted && (
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {onRegenerateDay && (
                                                            <button
                                                                onClick={() => onRegenerateDay(day.id, index)}
                                                                disabled={regeneratingDayId === day.id}
                                                                title={`Regenerate Day ${index + 1}`}
                                                                className="p-2.5 text-amber-400 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                            >
                                                                {regeneratingDayId === day.id
                                                                    ? <SpinnerGap size={18} className="animate-spin" />
                                                                    : <Sparkle size={18} weight="fill" />
                                                                }
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openDeleteDayModal(day.id)}
                                                            className="p-2.5 text-slate-300 hover:text-slate-600 rounded-2xl transition-all"
                                                            title="Delete Day"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Day title — auto-resizing textarea so it wraps, never truncates */}
                                            <AutoTextarea
                                                value={day.dayName}
                                                onChange={(e) => updateDay(day.id, 'dayName', e.target.value)}
                                                disabled={isCompleted}
                                                placeholder="Day Title"
                                                className={`text-3xl md:text-4xl font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 w-full tracking-tight leading-tight ${isCompleted ? 'cursor-default' : ''}`}
                                            />
                                        </div>

                                        {/* Timeline */}
                                        <div className="p-6 md:p-10 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-[54px] md:left-[85px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-100 via-indigo-100 to-slate-100 z-0"></div>

                                            <div className="space-y-8 relative z-10">
                                                <AnimatePresence initial={false}>
                                                    {day.items.map((item) => {
                                                        // Location pill: only show if the location name is
                                                        // meaningfully different from the activity name
                                                        const activityName = (item.name || '').trim().toLowerCase();
                                                        const locationName = (item.location?.name || '').trim().toLowerCase();
                                                        const showLocationPill = item.location &&
                                                            locationName &&
                                                            locationName !== activityName &&
                                                            !activityName.startsWith(locationName) &&
                                                            !locationName.startsWith(activityName);

                                                        return (
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
                                                                            disabled={isCompleted}
                                                                            className={`text-xs md:text-sm font-bold text-slate-500 bg-white/50 border border-transparent rounded-xl px-2 py-1.5 w-full text-center focus:text-[#1A1A1A] focus:ring-0 transition-all shadow-sm ${isCompleted ? 'cursor-default' : 'hover:bg-white hover:border-[#FF6B35]/30 cursor-pointer'}`}
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        className="w-14 h-14 rounded-[1.2rem] shadow-lg flex items-center justify-center text-white z-10 transition-transform duration-300 group-hover:scale-110 border-[3px] border-white ring-1 ring-slate-100"
                                                                        style={{ backgroundColor: CATEGORIES.find(c => c.name === item.category)?.color || '#94a3b8' }}
                                                                    >
                                                                        <Tag size={20} strokeWidth={2.5} />
                                                                    </div>
                                                                </div>

                                                                {/* Card — full-width single column, no dead xl:flex-row space */}
                                                                <div className="flex-1 bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-white/60 rounded-[2.2rem] p-5 md:p-6 shadow-sm hover:shadow-xl hover:shadow-[#FF6B35]/5 hover:-translate-y-0.5 transition-all duration-300 min-w-0 relative overflow-hidden group/card">
                                                                    <div className="relative z-10 space-y-2.5">
                                                                        {/* Row 1: category select */}
                                                                        <div className="flex items-center gap-2">
                                                                            <select
                                                                                value={item.category}
                                                                                onChange={(e) => updateItem(day.id, item.id, 'category', e.target.value)}
                                                                                disabled={isCompleted}
                                                                                className={`text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-100 rounded-full py-1.5 pl-3 pr-8 focus:ring-0 transition-colors shadow-sm ${isCompleted ? 'cursor-default appearance-none' : 'hover:border-[#FF6B35]/30 cursor-pointer'}`}
                                                                            >
                                                                                {CATEGORIES.map(cat => (
                                                                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>

                                                                        {/* Row 2: activity title — auto-resizing, wraps fully */}
                                                                        <AutoTextarea
                                                                            value={item.name}
                                                                            onChange={(e) => updateItem(day.id, item.id, 'name', e.target.value)}
                                                                            disabled={isCompleted}
                                                                            placeholder="Activity name..."
                                                                            className={`w-full font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 text-xl md:text-2xl placeholder:text-slate-300/80 tracking-tight leading-tight ${isCompleted ? 'cursor-default' : ''}`}
                                                                        />

                                                                        {/* Row 3: location pill (only if genuinely distinct) */}
                                                                        {showLocationPill && (
                                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg w-fit max-w-full">
                                                                                <MapPin size={12} className="shrink-0 text-[#FF6B35]" />
                                                                                <span className="truncate max-w-[260px]">{item.location.name}</span>
                                                                                {!isCompleted && (
                                                                                    <button onClick={() => updateItem(day.id, item.id, 'location', null)} className="ml-0.5 text-slate-400 hover:text-[#FF6B35] shrink-0">
                                                                                        <X size={11} />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Row 4: notes */}
                                                                        <input
                                                                            type="text"
                                                                            value={item.notes}
                                                                            onChange={(e) => updateItem(day.id, item.id, 'notes', e.target.value)}
                                                                            disabled={isCompleted}
                                                                            placeholder="Add notes, ticket info..."
                                                                            className={`w-full text-sm font-medium text-slate-400 bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300 ${isCompleted ? 'cursor-default' : ''}`}
                                                                        />

                                                                        {/* Dietary Badges: shown when category is Food */}
                                                                        {item.category === 'Food' && travelers.some(t => t.dietaryPreferences?.trim()) && (
                                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                                {travelers
                                                                                    .filter(t => t.dietaryPreferences?.trim())
                                                                                    .map(t => (
                                                                                        <span
                                                                                            key={t.id}
                                                                                            title={`${t.name}: ${t.dietaryPreferences}`}
                                                                                            className="badge"
                                                                                            style={{ fontSize: '9px', padding: '2px 7px', textTransform: 'uppercase' }}
                                                                                        >
                                                                                            {t.name?.split(' ')[0]}: {t.dietaryPreferences}
                                                                                        </span>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        )}

                                                                        {/* Row 5: cost + actions — single bottom bar, full width */}
                                                                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100/80">
                                                                            {/* Cost input with Est. badge */}
                                                                            <div className={`rounded-xl px-3 py-2 flex items-center gap-1.5 border focus-within:ring-2 focus-within:ring-[#FF6B35]/10 transition-all ${item.isEstimate ? 'bg-amber-50/80 border-amber-200/50' : 'bg-slate-50 border-slate-200/50'}`}>
                                                                                {item.isEstimate && (
                                                                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider leading-none select-none">Est.</span>
                                                                                )}
                                                                                <CurrencyInr size={14} className={item.isEstimate ? 'text-amber-400' : 'text-slate-400'} />
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.amount}
                                                                                    onChange={(e) => updateItem(day.id, item.id, 'amount', e.target.value)}
                                                                                    disabled={isCompleted}
                                                                                    placeholder="0"
                                                                                    className={`bg-transparent border-none w-20 text-sm font-bold p-0 focus:ring-0 text-right ${item.isEstimate ? 'text-amber-700' : 'text-slate-700'} ${isCompleted ? 'cursor-default' : ''}`}
                                                                                />
                                                                            </div>
                                                                            {/* Action buttons */}
                                                                            {!isCompleted ? (
                                                                                <div className="flex items-center gap-0.5">
                                                                                    <button
                                                                                        onClick={() => setLocationSearch({ isOpen: true, dayId: day.id, itemId: item.id })}
                                                                                        className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${item.location ? 'text-[#FF6B35] bg-orange-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                                                                        title="Set Location"
                                                                                    >
                                                                                        <MapPin size={17} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setExpenseModalInfo({
                                                                                            isOpen: true,
                                                                                            data: { name: item.name, amount: item.amount, category: item.category, date: day.date }
                                                                                        })}
                                                                                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                                                                                        title="Log as Expense"
                                                                                    >
                                                                                        <CurrencyInr size={17} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => openDeleteItemModal(day.id, item.id)}
                                                                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
                                                                                        title="Delete activity"
                                                                                    >
                                                                                        <Trash size={17} />
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                /* read-only: show category dot instead of buttons */
                                                                                <div
                                                                                    className="w-3 h-3 rounded-full shrink-0"
                                                                                    style={{ backgroundColor: CATEGORIES.find(c => c.name === item.category)?.color || '#94a3b8' }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>

                                                {!isCompleted && (
                                                    <motion.button
                                                        layout
                                                        onClick={() => addItem(day.id)}
                                                        className="w-full py-6 border border-white/60 bg-white/40 backdrop-blur rounded-[2.5rem] text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-all font-bold flex items-center justify-center gap-3 group md:ml-32 ml-20 text-sm shadow-sm hover:shadow-md"
                                                        style={{ width: 'auto', flex: 1 }}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#FF6B35] group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                                                            <Plus size={20} />
                                                        </div>
                                                        <span className="group-hover:translate-x-1 transition-transform">Add New Activity</span>
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>

                        {/* Mobile Day Nav
                            z-index: z-10 (below workspace header z-30 and tabs z-20)
                            top: 128px on mobile = header(64px) + tabs(~48px) + small gap
                                 136px on md = header(80px) + tabs(~48px) + small gap */}
                        <div className="lg:hidden flex overflow-x-auto gap-3 pb-6 pt-2 scrollbar-hide px-1 sticky top-[128px] md:top-[136px] z-10 -mx-4 px-4 bg-gradient-to-b from-slate-50/90 to-slate-50/0 backdrop-blur-[2px]">
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
                            {!isCompleted && (
                                <button onClick={addDay} className="px-5 py-2.5 rounded-[1rem] border-2 border-dashed border-slate-300 bg-white/40 text-slate-500 font-bold whitespace-nowrap flex-shrink-0 snap-center hover:bg-white/80 transition-all text-xs flex items-center gap-1">
                                    <Plus size={14} /> Add
                                </button>
                            )}
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
                                    className="p-1 rounded-full text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="relative mb-4">
                                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for a place..."
                                        className="w-full pl-11 pr-10 py-3 border-2 border-transparent focus:bg-white focus:border-[#FF6B35] rounded-xl transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                                        autoFocus
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {isSearching ? (
                                            <SpinnerGap className="animate-spin text-[#1A1A1A]" size={18} />
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
                                                className="w-full text-left p-3 hover: hover:border-blue-100 rounded-xl transition-all border border-transparent flex items-start gap-3 group"
                                            >
                                                <div className="p-2  text-slate-400 rounded-lg group-hover: group-hover:text-[#1A1A1A] transition-colors mt-0.5">
                                                    <MapPin size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm group-hover:text-[#1A1A1A] truncate">{result.display_name.split(',')[0]}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{result.display_name}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        !isSearching && searchQuery && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-12 h-12  rounded-full flex items-center justify-center mb-2 text-slate-300">
                                                    <MapPin size={24} />
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">No locations found</p>
                                                <p className="text-xs text-slate-400">Try a different search term</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="p-3  border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Powered by OpenStreetMap
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Planner;
