import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateTripReadiness } from '../../utils/intelligence';

const TripStoryCard = ({ trip, onClick }) => {
    const readiness = useMemo(() => calculateTripReadiness(trip), [trip]);

    // Color coding based on readiness level
    const statusColor = {
        'High': 'text-emerald-500',
        'Medium': 'text-amber-500',
        'Low': 'text-rose-500'
    }[readiness.level] || 'text-slate-500';

    const ringColor = {
        'High': '#10B981',   // emerald-500
        'Medium': '#F59E0B', // amber-500
        'Low': '#F43F5E'     // rose-500
    }[readiness.level] || '#94A3B8';

    // SVG Circle params
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (readiness.score / 100) * circumference;

    return (
        <motion.div
            layout
            onClick={() => onClick(trip.id)}
            whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            {/* Minimal Cover - Focus on content */}
            <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden group-hover:h-36 transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-colors"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px]"></div>

                <div className="absolute bottom-6 left-8 right-8 z-10">
                    <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-blue-700 transition-colors drop-shadow-sm truncate tracking-tight">
                        {trip.destination || trip.tripName}
                    </h3>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-between relative z-10">

                {/* Status/Readiness Section */}
                <div className="flex items-start gap-5 mb-5">
                    {/* Readiness Ring */}
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="transform -rotate-90 w-14 h-14">
                            <circle
                                cx="28"
                                cy="28"
                                r="22"
                                stroke="#F1F5F9"
                                strokeWidth="5"
                                fill="transparent"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="22"
                                stroke={ringColor}
                                strokeWidth="5"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 22}
                                strokeDashoffset={2 * Math.PI * 22 - (readiness.score / 100) * (2 * Math.PI * 22)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={`absolute text-xs font-black ${statusColor}`}>
                            {readiness.score}%
                        </span>
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

                {/* Details Footer */}
                <div className="pt-5 border-t border-slate-200/60 flex justify-between items-center mt-auto">
                    <div className="flex gap-4 text-xs text-slate-500 font-bold uppercase tracking-wide">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Calendar size={12} strokeWidth={2.5} /> {trip.days?.length || 0}d</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full"><Users size={12} strokeWidth={2.5} /> {trip.travelerCount || 1}</span>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TripStoryCard;
