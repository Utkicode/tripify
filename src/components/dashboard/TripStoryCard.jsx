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
            className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
        >
            {/* Minimal Cover - Focus on content */}
            <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden group-hover:h-28 transition-all duration-300">
                <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-slate-900/0 transition-colors" />
                <div className="absolute bottom-3 left-4">
                    <h3 className="font-bold text-lg text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                        {trip.destination || trip.tripName}
                    </h3>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">

                {/* Status/Readiness Section */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Readiness Ring */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="transform -rotate-90 w-12 h-12">
                            <circle
                                cx="24"
                                cy="24"
                                r={radius}
                                stroke="#F1F5F9"
                                strokeWidth="4"
                                fill="transparent"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r={radius}
                                stroke={ringColor}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={`absolute text-[10px] font-bold ${statusColor}`}>
                            {readiness.score}%
                        </span>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                            Readiness: <span className={statusColor}>{readiness.level}</span>
                        </p>
                        <p className="text-sm text-slate-600 leading-snug">
                            {readiness.missing.length > 0
                                ? `Missing: ${readiness.missing[0]}${readiness.missing.length > 1 ? ` +${readiness.missing.length - 1} more` : ''}`
                                : 'All set! Ready to go.'
                            }
                        </p>
                    </div>
                </div>

                {/* Details Footer */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {trip.days?.length || 0}d</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {trip.travelerCount || 1}</span>
                    </div>

                    <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                        <ArrowRight size={18} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TripStoryCard;
