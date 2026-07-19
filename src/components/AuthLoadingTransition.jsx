import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthLoadingTransition = ({ isDataReady, destination, onTransitionComplete }) => {
    const [statusIndex, setStatusIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const hasTriggeredExit = useRef(false);

    const phrases = destination
        ? ['Authentication confirmed', `Fetching itinerary to ${destination}`, 'Ready!']
        : ['Authentication confirmed', 'Preparing your trips', 'Ready!'];

    // Phase 1 → Phase 2: Advance from "Auth confirmed" to "Preparing..." after 900ms
    useEffect(() => {
        const timer = setTimeout(() => {
            setStatusIndex(prev => (prev < 1 ? 1 : prev));
        }, 900);
        return () => clearTimeout(timer);
    }, []);

    // When backend data is ready, move to "Ready!" then fade out
    useEffect(() => {
        if (isDataReady && !hasTriggeredExit.current) {
            hasTriggeredExit.current = true;
            setStatusIndex(2);
            // Short pause so user reads "Ready!" then fade out
            const timer = setTimeout(() => {
                setIsExiting(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isDataReady]);

    return (
        <AnimatePresence onExitComplete={() => onTransitionComplete?.()}>
            {!isExiting && (
                <motion.div
                    key="auth-loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.04, filter: 'blur(4px)' }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[99999] bg-[#FAFAF7] flex flex-col items-center justify-center overflow-hidden"
                    style={{ isolation: 'isolate' }}
                >
                    {/* Pulsing Logo Mark */}
                    <motion.div
                        animate={{
                            scale: [1, 1.08, 1],
                            boxShadow: [
                                '0 4px 20px rgba(255, 107, 53, 0.18)',
                                '0 6px 36px rgba(255, 107, 53, 0.38)',
                                '0 4px 20px rgba(255, 107, 53, 0.18)'
                            ]
                        }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                        className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#e8553d] rounded-3xl flex items-center justify-center text-white mb-12 border border-white/20 select-none"
                    >
                        <span className="text-3xl font-black tracking-tighter">T</span>
                    </motion.div>

                    {/* SVG Flight Path Draw-on */}
                    <div className="w-64 h-28 mb-8">
                        <svg
                            viewBox="0 0 256 112"
                            className="w-full h-full overflow-visible"
                            aria-hidden="true"
                        >
                            {/* Origin dot */}
                            <circle cx="24" cy="90" r="5" fill="#FF6B35" />
                            <circle
                                cx="24" cy="90" r="9"
                                fill="none" stroke="#FF6B35" strokeWidth="1.5"
                                style={{ animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }}
                                opacity="0.6"
                            />

                            {/* Dashed arc path drawing on */}
                            <motion.path
                                d="M 24 90 Q 128 -10 232 90"
                                fill="none"
                                stroke="#FF6B35"
                                strokeWidth="2.5"
                                strokeDasharray="7 5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.1 }}
                            />

                            {/* Animated plane dot travelling along path */}
                            <motion.circle
                                cx="0" cy="0" r="5"
                                fill="#FF6B35"
                                initial={{ offsetDistance: '0%' }}
                                animate={{ offsetDistance: '100%' }}
                                transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.1 }}
                                style={{
                                    offsetPath: "path('M 24 90 Q 128 -10 232 90')",
                                    offsetRotate: 'auto'
                                }}
                            />

                            {/* Destination dot */}
                            <motion.circle
                                cx="232" cy="90" r="5"
                                fill="#FF6B35"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.6, duration: 0.3 }}
                            />
                            {isDataReady && (
                                <circle
                                    cx="232" cy="90" r="9"
                                    fill="none" stroke="#FF6B35" strokeWidth="1.5"
                                    style={{ animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }}
                                    opacity="0.6"
                                />
                            )}
                        </svg>
                    </div>

                    {/* Cycling Status Text */}
                    <div className="h-7 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={statusIndex}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.28 }}
                                className="text-slate-700 font-bold text-xs uppercase tracking-[0.12em]"
                            >
                                {phrases[statusIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Subtle spinner dots */}
                    <div className="flex items-center gap-1.5 mt-6">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1.2,
                                    delay: i * 0.2,
                                    ease: 'easeInOut'
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthLoadingTransition;
