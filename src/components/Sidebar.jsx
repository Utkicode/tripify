import React from 'react';
import { SquaresFour, MapTrifold, Gear, SignOut, CaretLeft, CaretRight, ChartPie, Info, Lightbulb } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

const Sidebar = ({ currentView, setCurrentView, handleLogout, user, isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
        { id: 'trips', label: 'My Trips', icon: MapTrifold },
        { id: 'expenses', label: 'Expenses', icon: ChartPie },
        { id: 'protips', label: 'Pro Tips', icon: Lightbulb },
        { id: 'about', label: 'About Us', icon: Info },
        { id: 'profile', label: 'My Profile', icon: Gear },
    ];

    return (
        <motion.div
            initial={{ width: isCollapsed ? 80 : 260 }}
            animate={{ width: isCollapsed ? 80 : 260 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-screen sticky top-0 left-0 hidden md:flex flex-col z-50 shrink-0"
            style={{ background: '#1E293B' }}
        >
            {/* Inner container */}
            <div className={`h-full flex flex-col overflow-hidden relative ${isCollapsed ? 'px-3' : 'px-4'} py-5`}>

                {/* Logo Area */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8 shrink-0`}>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`flex items-center gap-3 outline-none group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        {/* Logo mark — solid #FF6B35 */}
                        <div
                            className="relative w-9 h-9 shrink-0 rounded-[0.75rem] flex items-center justify-center shadow-md"
                            style={{ background: '#FF6B35' }}
                        >
                            <span className="font-black text-lg text-white tracking-tighter select-none">T</span>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col items-start leading-none">
                                <span className="font-black text-xl tracking-tight text-white">
                                    TravelCFO
                                </span>
                                <span className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Plan smarter. Spend in control.
                                </span>
                            </div>
                        )}
                    </button>

                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                        >
                            <CaretLeft size={16} />
                        </button>
                    )}
                    {isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.35)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                        >
                            <CaretRight size={16} />
                        </button>
                    )}
                </div>

                {/* Beta notice */}
                {!isCollapsed && (
                    <div
                        className="mb-6 px-3 py-2.5 rounded-lg text-[10px] leading-relaxed shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>Public Beta — </span>
                        actively improving features and performance.
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                title={isCollapsed ? item.label : ''}
                                className={`w-full flex items-center gap-3 py-2.5 rounded-xl transition-all relative overflow-hidden ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
                                style={isActive ? {
                                    background: '#FF6B35',
                                    color: '#fff',
                                } : {
                                    color: 'rgba(255,255,255,0.55)',
                                    background: 'transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                                    }
                                }}
                            >
                                <item.icon size={20} weight={isActive ? 'fill' : 'regular'} />
                                {!isCollapsed && (
                                    <span className="font-semibold text-sm whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                                {/* Active indicator dot for collapsed mode */}
                                {isActive && isCollapsed && (
                                    <span
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.5)' }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="my-4 shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

                {/* User Profile */}
                <div className={`shrink-0 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: '#FF6B35' }}
                    >
                        {(user.email || user.displayName || 'U')[0].toUpperCase()}
                    </div>

                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.displayName || user.name || 'Traveler'}</p>
                                <p className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>Free Member</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="p-1.5 rounded-lg transition-colors shrink-0"
                                style={{ color: 'rgba(255,255,255,0.35)' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                            >
                                <SignOut size={18} />
                            </button>
                        </>
                    )}
                    {isCollapsed && (
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="hidden"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
