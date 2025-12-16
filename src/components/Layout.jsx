import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

const Layout = ({ children, user, handleLogout, currentView, setCurrentView, setCurrentTripId }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 -ml-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu size={20} />
                        </button>
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

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl"
                    >
                        <Sidebar
                            currentView={currentView}
                            setCurrentView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }}
                            handleLogout={handleLogout}
                            user={user}
                            isCollapsed={false}
                            setIsCollapsed={() => { }}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Layout;
