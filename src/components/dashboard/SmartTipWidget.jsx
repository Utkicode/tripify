import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { SMART_TIPS } from './SmartExamples';

const SmartTipWidget = ({ onViewTip }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Rotate tips every session or on refresh.
    // For demo, we'll just pick random on mount or simple state
    useEffect(() => {
        // Random start tip
        const randomStart = Math.floor(Math.random() * SMART_TIPS.length);
        setCurrentIndex(randomStart);
    }, []);

    const tip = SMART_TIPS[currentIndex];

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-2xl relative"
        >
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-3 right-3 text-amber-300 hover:text-amber-500 transition-colors"
            >
                <X size={16} />
            </button>

            <div className="flex gap-4">
                <div className="text-2xl pt-1 select-none">{tip.icon}</div>
                <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-1 flex items-center gap-2">
                        Smart Tip: {tip.category}
                    </h4>
                    <p className="text-sm text-amber-900/80 leading-relaxed mb-3">
                        {tip.text}
                    </p>
                    {tip.action !== 'none' && (
                        <button
                            onClick={() => onViewTip(tip.action)}
                            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-2 transition-colors"
                        >
                            Show me how
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SmartTipWidget;
