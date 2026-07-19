import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, CurrencyInr, Users, X, SpinnerGap, Sparkle } from '@phosphor-icons/react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { appId } from '../constants';
import { plannerService } from '../services/plannerService';

const NewTripModal = ({ isOpen, onClose, tripId = null, user, setCurrentTripId, setTargetTab }) => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('1000');
    const [travelerCount, setTravelerCount] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!destination.trim()) {
            setError('Please enter a destination.');
            return;
        }
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Generate Itinerary
            const data = await plannerService.generateItinerary({
                destination,
                start_date: startDate,
                end_date: endDate,
                budget,
                traveler_count: travelerCount
            });

            let targetTripId = tripId;

            // 2. If creating a new trip, insert it first
            if (!targetTripId) {
                const newTrip = {
                    tripName: destination ? `${destination} Trip` : 'New Trip',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    days: [], // Start empty, will be populated next
                    travelers: [{ id: user.uid, name: user.displayName || 'You', email: user.email }],
                    travelerCount: Number(travelerCount) || 1,
                    totalCost: 0,
                    ownerId: user.uid,
                    collaborators: [user.uid]
                };

                const docRef = await addDoc(collection(db, 'artifacts', appId, 'trips'), newTrip);
                targetTripId = docRef.id;

                // Log local creation notification
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'), {
                    type: 'create',
                    message: `Created a new trip to ${destination}`,
                    user: user.displayName || 'User',
                    timestamp: Date.now(),
                    read: false
                });
            } else {
                // If updating existing trip, update traveler count
                const tripRef = doc(db, 'artifacts', appId, 'trips', targetTripId);
                await updateDoc(tripRef, {
                    travelerCount: Number(travelerCount) || 1
                });
            }

            // 3. Persist the generated itinerary
            await plannerService.persistItinerary(
                targetTripId,
                destination,
                startDate,
                endDate,
                budget,
                data.draft
            );

            // 4. Redirect user to populated itinerary view
            setTargetTab('itinerary');
            setCurrentTripId(targetTripId);
            
            // Clean up state
            setDestination('');
            setStartDate('');
            setEndDate('');
            setBudget('1000');
            setTravelerCount('1');
            onClose();
        } catch (err) {
            console.error("Failed to plan trip:", err);
            setError(err.message || 'An unexpected error occurred while generating the itinerary.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        onClick={isLoading ? undefined : onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Custom Close Button */}
                        {!isLoading && (
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shadow-inner">
                                <Sparkle size={24} weight="fill" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {tripId ? 'Plan Your Itinerary' : 'Plan a New Adventure'}
                                </h3>
                                <p className="text-sm text-slate-500 font-semibold">One-shot AI itinerary draft generator</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 leading-snug">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Destination */}
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Destination</label>
                                <div className="relative">
                                    <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        disabled={isLoading}
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="e.g. Paris, Tokyo, Bali"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all focus:ring-0"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Start Date</label>
                                    <div className="relative">
                                        <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            required
                                            disabled={isLoading}
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all focus:ring-0 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">End Date</label>
                                    <div className="relative">
                                        <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            required
                                            disabled={isLoading}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all focus:ring-0 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Budget & Travelers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Budget (INR)</label>
                                    <div className="relative">
                                        <CurrencyInr size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            disabled={isLoading}
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            placeholder="1000"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400">Travelers</label>
                                    <div className="relative">
                                        <Users size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            disabled={isLoading}
                                            value={travelerCount}
                                            onChange={(e) => setTravelerCount(e.target.value)}
                                            placeholder="1"
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 focus:border-[#FF6B35] focus:bg-white rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 transition-all focus:ring-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-4">
                                {!isLoading && (
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-80 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <SpinnerGap size={18} className="animate-spin text-white" />
                                            <span>Drafting Itinerary...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkle size={18} weight="fill" className="text-amber-400" />
                                            <span>Generate Itinerary</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Loading Overlay Decor */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-8 text-center z-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="text-[#FF6B35] mb-4"
                                >
                                    <Sparkle size={48} weight="fill" />
                                </motion.div>
                                <h4 className="text-lg font-black text-slate-950">Generating your custom AI itinerary...</h4>
                                <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
                                    We are structuring your day-by-day plans, mapping activity categories, and estimating costs.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NewTripModal;
