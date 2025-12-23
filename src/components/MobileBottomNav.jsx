import React from 'react';
import { LayoutDashboard, Map, PieChart, Lightbulb, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'trips', label: 'Trips', icon: Map },
        { id: 'expenses', label: 'Spent', icon: PieChart },
        { id: 'protips', label: 'Tips', icon: Lightbulb },
        { id: 'profile', label: 'Me', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-6 py-2 z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe-area-inset-bottom">
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <div className="relative">
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavActive"
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                                />
                            )}
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default MobileBottomNav;
