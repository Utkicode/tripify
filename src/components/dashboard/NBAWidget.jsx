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

    const isPrimary = topAction.type ==='primary';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={topAction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="wallet-hero p-6 md:p-8"
            >
                {/* Background Decor (Only for Primary) */}
                {isPrimary && (
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-5 flex-1">
                        <div className="p-4 rounded-[1.5rem] shrink-0 bg-white/15 shadow-sm border border-white/10">
                            <Icon size={28} className="text-white" />
                        </div>
                        <div>
                            <div className="wallet-hero__label mb-1.5">
                                Recommended for you
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight tracking-tight text-white">{topAction.title}</h2>
                            <p className="text-base leading-relaxed text-white/75">
                                {topAction.message}
                            </p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onActionClick(topAction)}
                        className="btn-primary w-full md:w-auto rounded-full px-8 py-3.5"
                    >
                        {topAction.cta} <ArrowRight size={18} />
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NBAWidget;
