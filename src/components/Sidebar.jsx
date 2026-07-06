import React from'react';
import { SquaresFour, MapTrifold, Gear, SignOut, CaretLeft, CaretRight, ChartPie, Info, Lightbulb } from'@phosphor-icons/react';
import { motion } from'framer-motion';

const Sidebar = ({ currentView, setCurrentView, handleLogout, user, isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { id:'dashboard', label:'Dashboard', icon: SquaresFour },
        { id:'trips', label:'My Trips', icon: MapTrifold },
        { id:'expenses', label:'Expenses', icon: ChartPie },
        { id:'protips', label:'Pro Tips', icon: Lightbulb },
        { id:'about', label:'About Us', icon: Info },
        { id:'profile', label:'My Profile', icon: Gear }, // Replaced Settings or added new
    ];

    return (
        <motion.div
            initial={{ width: isCollapsed ? 100 : 280 }}
            animate={{ width: isCollapsed ? 100 : 280 }}
            transition={{ type:"spring", stiffness: 300, damping: 30 }}
            className={`h-screen sticky top-0 left-0 hidden md:flex flex-col z-50 py-4 pl-4`}
        >
            <div className={`h-full bg-white/60 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden relative ${isCollapsed ?'px-2' :'px-4'}`}>
                {/* Decorative Blur */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

                {/* Logo Area */}
                <div className={`flex flex-col ${isCollapsed ?'items-center gap-4' :'pl-2 pr-1'} shrink-0 mb-6 transition-all`}>
                    <div className={`flex items-center ${isCollapsed ?'justify-center' :'justify-between'} w-full`}>
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className={`group flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 outline-none ${isCollapsed ?'justify-center' :''}`}
                        >
                            {/* Modern One UI 8 Logo */}
                            <div className="relative w-10 h-10 shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[1.2rem] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all flex items-center justify-center text-white">
                                    <span className="font-black text-xl tracking-tighter">T</span>
                                </div>
                                <div className="absolute inset-0 bg-blue-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full z-[-1]"></div>
                            </div>

                            {!isCollapsed && (
                                <div className="flex flex-col items-start leading-none">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-slate-800">
                                            TravelCFO
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded-md  text-[#1A1A1A] text-[9px] font-bold tracking-wider border border-blue-200">
                                            BETA
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400 mt-1">
                                        Plan smarter. Spend in control.
                                    </span>
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600 transition-all ${isCollapsed ?'hidden' :'block'}`}
                        >
                            <CaretLeft size={18} />
                        </button>
                    </div>

                    {!isCollapsed && (
                        <div className="mt-4 p-3 /50 rounded-xl border border-blue-100/50 text-[10px] text-slate-500 leading-relaxed font-medium">
                            <span className="font-bold text-[#1A1A1A] block mb-0.5">Public Beta</span>
                            We’re actively improving features and performance.
                        </div>
                    )}

                    {/* Collapsed Toggle if hidden above */}
                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <CaretRight size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[1.5rem] transition-all group relative overflow-hidden ${isActive
                                    ?'shadow-lg shadow-blue-500/20'
                                    :'hover:bg-white/50 hover:shadow-sm text-slate-500'
                                    }`}
                                title={isCollapsed ? item.label :''}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNavBg"
                                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 z-0"
                                        transition={{ type:"spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <span className={`relative z-10 flex items-center justify-center ${isActive ?'text-white' :'text-slate-400 group-hover:text-[#1A1A1A]'}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </span>

                                {!isCollapsed && (
                                    <span className={`relative z-10 font-bold whitespace-nowrap ${isActive ?'text-white' :'text-slate-600 group-hover:text-slate-900'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* User Profile */}
                <div className="p-2 pt-4 mt-auto">
                    <div className={`bg-white/50 rounded-[2rem] p-2 border border-white/50 shadow-sm ${isCollapsed ?'flex flex-col items-center gap-2' :''}`}>
                        <div className={`flex items-center gap-3 p-1.5 rounded-[1.5rem] hover:bg-white transition-all cursor-pointer ${isCollapsed ?'justify-center p-0 hover:bg-transparent' :''}`}>
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-slate-900/20 ring-2 ring-white">
                                {(user.email || user.displayName || 'U')[0].toUpperCase()}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-sm font-bold text-slate-800 truncate">{user.displayName || user.name ||'Traveler'}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 truncate tracking-wider">Free Member</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-full text-[#1A1A1A] hover: hover:text-[#1A1A1A] transition-all font-bold text-xs mt-1 ${isCollapsed ?'justify-center px-0' :''}`}
                            title="Sign Out"
                        >
                            <SignOut size={16} strokeWidth={2.5} />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
