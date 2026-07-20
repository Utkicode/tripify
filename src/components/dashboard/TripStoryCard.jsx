import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { calculateTripReadiness } from '../../utils/intelligence';
import { getCurrencySymbol } from '../../utils/currency';
import { getImageUrl } from '../../services/plannerService';

const TripStoryCard = ({ trip, onClick }) => {
    const readiness = useMemo(() => calculateTripReadiness(trip), [trip]);

    // Color coding based on readiness level
    const statusColor = {
        'High': 'text-emerald-600',
        'Medium': 'text-amber-600',
        'Low': 'text-rose-600'
    }[readiness.level] || 'text-slate-500';

    const symbol = getCurrencySymbol(trip.currency || 'INR');

    const formatDateRange = (start, end) => {
        if (!start) return '';
        try {
            const startDate = new Date(start);
            if (isNaN(startDate.getTime())) return '';

            const startFormat = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!end) return startFormat;

            const endDate = new Date(end);
            if (isNaN(endDate.getTime())) return startFormat;

            const endFormat = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${startFormat} - ${endFormat}`;
        } catch (e) {
            return '';
        }
    };

    return (
        <motion.div
            layout
            onClick={() => onClick(trip.id)}
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            <div
                className="h-32 relative overflow-hidden group-hover:h-36 transition-all duration-300 bg-cover bg-center"
                style={{
                    backgroundImage: (trip.imageUrl || trip.destination)
                        ? `url(${getImageUrl(trip.imageUrl || `/media/destination?q=${encodeURIComponent(trip.destination.replace(/\s*\([^)]*\)\s*$/, '').trim())}`)})`
                        : 'none',
                    background: (trip.imageUrl || trip.destination)
                        ? undefined
                        : 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'
                }}
            >
                {!(trip.imageUrl || trip.destination) && (
                    <>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] group-hover:bg-indigo-500/20 transition-colors"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>
                    </>
                )}
                {(trip.imageUrl || trip.destination) && (
                    <div className="absolute inset-0 bg-black/35" />
                )}

                {trip.isCompleted && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                            Completed
                        </span>
                    </div>
                )}

                <div className="absolute bottom-6 left-8 right-8 z-10">
                    <h3 className={`font-black text-2xl leading-tight transition-colors drop-shadow-sm truncate tracking-tight ${
                        (trip.imageUrl || trip.destination) ? 'text-white group-hover:text-white/95' : 'text-slate-900 group-hover:text-[#1A1A1A]'
                    }`}>
                        {trip.destination || trip.tripName}
                    </h3>
                    {trip.startDate && (
                        <p className={`text-xs font-semibold mt-1 ${
                            (trip.imageUrl || trip.destination) ? 'text-white/80' : 'text-slate-500'
                        }`}>
                            {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between relative z-10">

                {/* Status/Readiness Section */}
                {trip.isCompleted ? (
                    <div className="flex items-center gap-4 mb-5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 w-full">
                        <CheckCircle size={28} className="text-emerald-600 shrink-0" weight="fill" />
                        <div>
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-0.5">
                                Trip Status
                            </p>
                            <p className="text-sm font-bold text-emerald-950">
                                Successfully Completed
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-4 mb-5">
                        <div className="shrink-0 mt-0.5">
                            {readiness.level === 'High' ? (
                                <CheckCircle size={28} className="text-emerald-500" weight="fill" />
                            ) : (
                                <WarningCircle size={28} className={readiness.level === 'Medium' ? 'text-amber-500' : 'text-rose-500'} weight="fill" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Readiness
                            </p>
                            <p className={`text-sm font-bold ${statusColor}`}>
                                {readiness.level}
                            </p>
                            <p className="text-xs text-slate-500 leading-snug font-medium mt-1">
                                {readiness.missing.length > 0
                                    ? `Missing: ${readiness.missing[0]}${readiness.missing.length > 1 ? ` +${readiness.missing.length - 1}` : ''}`
                                    : 'All set! Ready to go.'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* Details Footer */}
                <div className="pt-5 border-t border-slate-200/60 flex justify-between items-center mt-auto">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 text-xs text-slate-500 font-bold uppercase tracking-wide">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-full"><Calendar size={12} strokeWidth={2.5} /> {trip.dayCount || 0}d</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-full"><Users size={12} strokeWidth={2.5} /> {trip.travelerCount || 1}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 px-1">
                            {trip.budget > 0 ? (
                                <span>Spent: <span className="text-slate-800">{symbol}{(trip.totalCost || 0).toLocaleString()}</span> / {symbol}{(trip.budget).toLocaleString()}</span>
                            ) : (
                                <span>Spent: <span className="text-slate-800">{symbol}{(trip.totalCost || 0).toLocaleString()}</span></span>
                            )}
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm shrink-0">
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TripStoryCard;
