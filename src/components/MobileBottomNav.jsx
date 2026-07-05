import React from'react';
import { SquaresFour, MapTrifold, ChartPie, Lightbulb, User } from'@phosphor-icons/react';
import { motion } from'framer-motion';

const MobileBottomNav = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id:'dashboard', label:'Home', icon: SquaresFour },
        { id:'trips', label:'Trips', icon: MapTrifold },
        { id:'expenses', label:'Spent', icon: ChartPie },
        { id:'protips', label:'Tips', icon: Lightbulb },
        { id:'profile', label:'Me', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] px-6 py-4 z-50 flex justify-between items-center shadow-2xl shadow-slate-900/10">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${isActive ?'-translate-y-4' :'hover:bg-white/50'}`}
                    >
                        <div className={`relative z-10 p-3 rounded-full transition-all duration-300 ${isActive ?'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-110' :'text-slate-400'}`}>
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>

                        {isActive && (
                            <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-6 text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm border border-white/50"
                            >
                                {item.label}
                            </motion.span>
                        )}
                        {!isActive && (
                            <span className="hidden"></span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
