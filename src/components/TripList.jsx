import React from 'react';
import { MapPin, Trash, Clock, Users, PencilSimple, Plus, ArrowRight, Warning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const TripList = ({ tripsList, setCurrentTripId, createNewTrip, deleteTrip, limit }) => {
    const processedTrips = React.useMemo(() => {
        return tripsList.map(trip => {
            const baseName = trip.tripName || trip.destination || 'Untitled Trip';
            if (baseName === 'Untitled Trip' || baseName === 'New Trip') return trip;
            
            const duplicates = tripsList.filter(t => {
                const tName = t.tripName || t.destination || 'Untitled Trip';
                return tName.toLowerCase() === baseName.toLowerCase();
            });
            
            if (duplicates.length > 1) {
                const dateTag = trip.startDate 
                    ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'Draft';
                return { 
                    ...trip, 
                    tripName: trip.tripName ? `${trip.tripName} (${dateTag})` : trip.tripName,
                    destination: trip.destination ? `${trip.destination} (${dateTag})` : trip.destination
                };
            }
            return trip;
        });
    }, [tripsList]);

    const displayedTrips = limit ? processedTrips.slice(0, limit) : processedTrips;

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full space-y-10 pb-24">
            {/* ── Page Header — solid title, New Trip CTA inline right-aligned ── */}
            {!limit && (
                <header className="pt-8 pb-2 px-4 md:px-0">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Your Collection</p>
                            {/* Solid-color h1 — no gradient, no second accent */}
                            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '4px' }}>
                                My Trips
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                {tripsList.length} {tripsList.length === 1 ? 'adventure' : 'adventures'} planned. Where to next?
                            </p>
                        </div>
                        {/* Primary CTA — inside header row, standard btn-primary */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={createNewTrip}
                            className="btn-primary pl-4 pr-5 py-2.5 rounded-xl flex items-center gap-2 w-fit shrink-0 text-sm font-bold"
                        >
                            <Plus size={17} strokeWidth={2.5} />
                            New Trip
                        </motion.button>
                    </div>
                </header>
            )}

            {displayedTrips.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] p-16 text-center"
                >
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-5">
                        <MapPin size={28} strokeWidth={1.5} style={{ color: '#FF6B35' }} />
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>No trips found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-7 leading-relaxed">
                        Your passport is waiting to be stamped. Start planning your next great escape today.
                    </p>
                    <button onClick={createNewTrip} className="btn-primary px-7 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto">
                        Create Your First Trip <ArrowRight size={16} />
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {displayedTrips.map((trip) => {
                            const isUntitled = !trip.tripName || trip.tripName === 'New Trip';
                            const hasNoDestination = !trip.destination;
                            const isBlank = isUntitled && hasNoDestination;

                            return (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    onClick={() => setCurrentTripId(trip.id)}
                                    whileHover={{ y: -2, boxShadow: '0 8px 30px -8px rgba(0,0,0,0.12)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative bg-white rounded-2xl border border-black/[0.05] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
                                    style={{ borderRadius: '16px' }}
                                >
                                    {/* ── Cover strip ── */}
                                    {isBlank ? (
                                        /* Distinct "untitled" cover — dashed border, no colour confusion */
                                        <div className="h-28 flex flex-col items-center justify-center gap-2 border-b-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden">
                                            <Warning size={22} strokeWidth={1.8} className="text-slate-300" />
                                            <p className="text-xs font-bold text-slate-400 tracking-wide">Untitled trip — tap to name it</p>
                                        </div>
                                    ) : (
                                        <div className="h-28 relative overflow-hidden" style={{ background: '#F1F5F9' }}>
                                            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between gap-2">
                                                <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-white/60 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm truncate max-w-[70%]">
                                                    <MapPin size={11} className="text-[#FF6B35] shrink-0" />
                                                    <span className="truncate">{trip.destination || 'Destination TBD'}</span>
                                                </div>
                                                {trip.isCompleted && (
                                                    <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wide shadow-sm shrink-0">
                                                        Done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Card body ── */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3
                                                className="font-bold text-base text-slate-900 leading-snug line-clamp-2 flex-1 pr-2"
                                                style={{ color: isBlank ? '#94a3b8' : '#1E293B', fontStyle: isBlank ? 'italic' : 'normal' }}
                                                title={trip.tripName}
                                            >
                                                {isBlank ? 'Untitled Trip' : trip.tripName}
                                            </h3>
                                            <button
                                                onClick={(e) => deleteTrip(e, trip.id, trip.tripName)}
                                                className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0 hover:bg-red-50"
                                                title="Delete Trip"
                                            >
                                                <Trash size={15} strokeWidth={2} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Duration</p>
                                                <p className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                                    <Clock size={12} className="text-slate-400" /> {trip.dayCount || 0} Days
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Travelers</p>
                                                <p className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                                    <Users size={12} className="text-slate-400" /> {trip.travelerCount || 1}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Budget</p>
                                                <p
                                                    className="text-lg font-bold text-slate-900 tabular-nums"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                                                >
                                                    ₹{(trip.totalCost || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 transition-all group-hover:border-[#FF6B35] group-hover:text-[#FF6B35] group-hover:bg-orange-50">
                                                <PencilSimple size={14} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add New Card */}
                    {!limit && (
                        <motion.button
                            variants={item}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            onClick={createNewTrip}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#FF6B35]/50 flex flex-col items-center justify-center gap-4 p-8 text-slate-400 hover:text-[#FF6B35] transition-all min-h-[280px] group bg-white/50 hover:bg-orange-50/30"
                            style={{ borderRadius: '16px' }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-all duration-200">
                                <Plus size={26} strokeWidth={2} />
                            </div>
                            <span className="font-bold text-sm">Plan a New Adventure</span>
                        </motion.button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripList;
