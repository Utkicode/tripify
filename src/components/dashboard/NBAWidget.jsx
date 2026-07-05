import React from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Sparkle, ArrowRight, Warning, MapTrifold, Wallet, CheckSquare } from'@phosphor-icons/react';
import { getNextBestActions } from'../../utils/intelligence';

const NBAWidget = ({ trips, user, onActionClick }) => {
    // Get recommendations
    const actions = React.useMemo(() => getNextBestActions(trips, user), [trips, user]);
    const topAction = actions.length > 0 ? actions[0] : null;

    if (!topAction) return null;

    // Icon mapping based on action type/ID
    const getIcon = () => {
        if (topAction.id.includes('dest')) return MapTrifold;
        if (topAction.id.includes('budget')) return Wallet;
        if (topAction.id.includes('plan')) return CheckSquare;
        if (topAction.type ==='critical') return Warning;
        return Sparkle; // Default
    };

    const Icon = getIcon();

    // Style mapping
    const styleMap = {'critical':' border-rose-100 text-rose-900','high':' border-indigo-100 text-indigo-900','medium':' border-blue-100 text-blue-900','info':' border-slate-100 text-slate-800','primary':'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent'
    };

    const currentStyle = styleMap[topAction.type] || styleMap['medium'];
    const isPrimary = topAction.type ==='primary';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={topAction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-6 md:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden backdrop-blur-xl ${currentStyle}`}
            >
                {/* Background Decor (Only for Primary) */}
                {isPrimary && (
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                        <div className={`p-4 rounded-[1.5rem] shrink-0 ${isPrimary ?'bg-white/20' :'bg-white shadow-sm'}`}>
                            <Icon size={28} className={isPrimary ?'text-white' :'text-[#1A1A1A]'} />
                        </div>
                        <div>
                            <div className={`text-xs font-extrabold uppercase tracking-widest mb-1.5 ${isPrimary ?'text-blue-100' :'text-slate-500 opacity-70'}`}>
                                Recommended for you
                            </div>
                            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight">{topAction.title}</h2>
                            <p className={`text-base leading-relaxed ${isPrimary ?'text-blue-50' :'opacity-80'}`}>
                                {topAction.message}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onActionClick(topAction)}
                        className={`px-8 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-all w-full md:w-auto ${isPrimary
                            ?'bg-white text-[#1A1A1A] hover:'
                            :'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {topAction.cta} <ArrowRight size={18} />
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NBAWidget;
