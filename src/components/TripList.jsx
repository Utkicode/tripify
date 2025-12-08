import React from 'react';
import { MapPin, Trash2, Clock, Users, Edit2, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TripList = ({ tripsList, setCurrentTripId, createNewTrip, deleteTrip, limit }) => {
    // Apply limit if provided (for dashboard view)
    const displayedTrips = limit ? tripsList.slice(0, limit) : tripsList;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full">
            {!limit && (
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Your Trips</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={createNewTrip}
                        className="btn-primary"
                    >
                        <Plus size={18} /> New Trip
                    </motion.button>
                </div>
            )}

            {displayedTrips.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"><MapPin size={32} /></div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No trips found</h3>
                    <p className="text-slate-500 mb-6">Ready to start your next adventure?</p>
                    <button onClick={createNewTrip} className="text-blue-600 font-bold hover:text-blue-700 flex items-center justify-center gap-2 mx-auto">
                        CREATE TRIP <ArrowRight size={16} />
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {displayedTrips.map((trip, index) => (
                            <motion.div
                                key={trip.id}
                                variants={item}
                                layout
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setCurrentTripId(trip.id)}
                                className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                            >
                                {/* Cover Image Placeholder */}
                                <div className={`h-32 w-full bg-gradient-to-r ${index % 2 === 0 ? 'from-blue-400 to-indigo-500' : 'from-purple-400 to-pink-500'} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    {/* Country/City Badge Mockup */}
                                    <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/30 flex items-center gap-1">
                                        <MapPin size={12} /> {trip.destination || 'Destination'}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1" title={trip.tripName}>
                                            {trip.tripName}
                                        </h3>
                                        <button
                                            onClick={(e) => deleteTrip(e, trip.id)}
                                            className="text-slate-300 hover:text-red-500 bg-transparent hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Trip"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><Clock size={12} /> {trip.days?.length || 0} Days</span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><Users size={12} /> {trip.travelerCount || 1}</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Budget</p>
                                            <p className="font-bold text-slate-800">₹{(trip.totalCost || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                                            <Edit2 size={14} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Card (only in full list) */}
                    {!limit && (
                        <motion.button
                            variants={item}
                            onClick={createNewTrip}
                            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-3 p-6 text-slate-400 hover:text-blue-500 transition-all min-h-[280px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold text-sm">Create New Trip</span>
                        </motion.button>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default TripList;
