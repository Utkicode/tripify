import React from 'react';
import { LayoutDashboard, Map, Settings, LogOut, ChevronLeft, ChevronRight, PieChart, Info, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ currentView, setCurrentView, handleLogout, user, isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'trips', label: 'My Trips', icon: Map },
        { id: 'expenses', label: 'Expenses', icon: PieChart },
        { id: 'protips', label: 'Pro Tips', icon: Lightbulb },
        { id: 'about', label: 'About Us', icon: Info },
        { id: 'profile', label: 'My Profile', icon: Settings }, // Replaced Settings or added new
    ];

    return (
        <motion.div
            initial={{ width: isCollapsed ? 80 : 250 }}
            animate={{ width: isCollapsed ? 80 : 250 }}
            className={`h-screen bg-white border-r border-slate-200 sticky top-0 left-0 flex flex-col z-40 hidden md:flex`}
        >
            {/* Logo Area */}
            <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100`}>
                <div className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 whitespace-nowrap overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
                    Tripify
                </div>
                {isCollapsed && <div className="font-bold text-xl text-blue-600">T</div>}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${currentView === item.id
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} className="shrink-0" />
                        {!isCollapsed && (
                            <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                        )}
                        {currentView === item.id && !isCollapsed && (
                            <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                    </button>
                ))}
            </div>

            {/* User Profile */}
            <div className="p-3 border-t border-slate-100">
                <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-blue-500/20">
                        {user.email[0].toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{user.displayName || user.name || 'Traveler'}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className={`mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                    title="Sign Out"
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
