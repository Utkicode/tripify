import React from'react';
import { MapPin, Trash, Clock, Users, PencilSimple, Plus, ArrowRight } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';

const TripList = ({ tripsList, setCurrentTripId, createNewTrip, deleteTrip, limit }) => {
    // Apply limit if provided (for dashboard view)
    const displayedTrips = limit ? tripsList.slice(0, limit) : tripsList;

    // Simplified animations to prevent'opacity: 0' stuck state
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full space-y-12 pb-24">
            {!limit && (
                <header className="relative py-8 md:py-12 px-4 md:px-0">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-purple-400/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/50 text-[#1A1A1A] font-bold text-xs uppercase tracking-widest mb-4 shadow-sm"
                            >
                                Your Collection
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Trips</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-xl leading-relaxed">
                                {tripsList.length} adventures planned and counting. Where to next?
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={createNewTrip}
                            className="bg-slate-900 text-white pl-6 pr-8 py-5 rounded-[2.5rem] font-bold shadow-2xl shadow-slate-900/30 flex items-center gap-4 group transition-all"
                        >
                            <div className="bg-white/20 p-2 rounded-full group-hover:rotate-90 transition-transform duration-500">
                                <Plus size={24} />
                            </div>
                            <span className="text-lg">New Trip</span>
                        </motion.button>
                    </div>
                </header>
            )}

            {displayedTrips.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl p-12 md:p-20 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-white/60">
                            <MapPin size={48} className="text-[#1A1A1A]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No trips found</h3>
                        <p className="text-xl text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed font-medium">
                            Your passport is waiting to be stamped. Start planning your next great escape today.
                        </p>
                        <button
                            onClick={createNewTrip}
                            className="bg-purple-600 text-white px-10 py-4 rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-105 active:scale-95 text-lg flex items-center justify-center gap-3 mx-auto"
                        >
                            Create Your First Trip <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {displayedTrips.map((trip, index) => (
                            <motion.div
                                key={trip.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                onClick={() => setCurrentTripId(trip.id)}
                                whileHover={{ y: -8, boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                            >
                                {/* Cover Image Placeholder */}
                                <div className={`h-40 w-full bg-gradient-to-br ${index % 2 === 0 ?'from-blue-50 to-indigo-50' :'from-purple-50 to-pink-50'} relative overflow-hidden group-hover:h-44 transition-all duration-500`}>
                                    {/* Decorative Blob */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[40px] transition-transform group-hover:scale-150"></div>

                                    <div className="absolute bottom-6 left-8 right-8 z-10 flex items-center justify-between gap-2">
                                        <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md border border-white/40 px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm truncate">
                                            <MapPin size={12} className="text-slate-900 shrink-0" /> <span className="truncate">{trip.destination ||'Planning...'}</span>
                                        </div>
                                        {trip.isCompleted && (
                                            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm z-20 shrink-0">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-[#1A1A1A] transition-colors line-clamp-2 tracking-tight" title={trip.tripName}>
                                            {trip.tripName}
                                        </h3>
                                        <button
                                            onClick={(e) => deleteTrip(e, trip.id, trip.tripName)}
                                            className="text-slate-300 hover:text-[#1A1A1A] bg-white/50 hover: p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100 transform translate-x-4 group-hover:translate-x-0"
                                            title="Delete Trip"
                                        >
                                            <Trash size={18} strokeWidth={2} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white/40 rounded-2xl p-3 border border-white/50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration</p>
                                            <p className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                                                <Clock size={14} className="text-[#1A1A1A]" /> {trip.dayCount || 0} Days
                                            </p>
                                        </div>
                                        <div className="bg-white/40 rounded-2xl p-3 border border-white/50">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Travelers</p>
                                            <p className="flex items-center gap-1.5 font-bold text-slate-700 text-sm">
                                                <Users size={14} className="text-[#1A1A1A]" /> {trip.travelerCount || 1}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-slate-200/60 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget</p>
                                            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{(trip.totalCost || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full  flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                            <PencilSimple size={16} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Card (only in full list) - Premium Glass Tile */}
                    {!limit && (
                        <motion.button
                            variants={item}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            onClick={createNewTrip}
                            whileHover={{ scale: 1.02, backgroundColor:'rgba(255, 255, 255, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white/20 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-300/50 hover:border-purple-400/50 flex flex-col items-center justify-center gap-6 p-8 text-slate-400 hover:text-[#1A1A1A] transition-all min-h-[350px] group"
                        >
                            <div className="w-20 h-20 rounded-[2rem] bg-white/40 border border-white/50 flex items-center justify-center shadow-lg group-hover:shadow-purple-200/50 group-hover:scale-110 transition-all duration-300">
                                <Plus size={32} strokeWidth={2.5} />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight">Plan a New Adventure</span>
                        </motion.button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripList;
