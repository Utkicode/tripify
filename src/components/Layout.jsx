import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import MobileBottomNav from './MobileBottomNav';

const Layout = ({ children, user, handleLogout, currentView, setCurrentView, setCurrentTripId }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // We can remove isMobileMenuOpen logic as we are switching to Bottom Nav pattern
    // But keeping it just in case we want a side drawer for "More" later, 
    // though the plan is to replace it. Let's stick to the plan and use BottomNav.
    // The previous mobile menu button in header might need to be removed or repurposed.

    return (
        <div className="flex bg-slate-50 min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar
                currentView={currentView}
                setCurrentView={setCurrentView}
                handleLogout={handleLogout}
                user={user}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header - Simplified for Mobile */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {/* Logo visible on mobile since Sidebar is hidden */}
                        <div className="md:hidden font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Tripify
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 capitalize hidden sm:block">
                            {currentView === 'dashboard' ? 'Overview' : currentView}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search trips..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-slate-400"
                            />
                        </div>
                        <NotificationBell
                            user={user}
                            tripId={null}
                            setCurrentTripId={setCurrentTripId}
                            setCurrentView={setCurrentView}
                        />
                    </div>
                </header>

                {/* Content - Added padding bottom for mobile nav */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />
        </div>
    );
};

export default Layout;
