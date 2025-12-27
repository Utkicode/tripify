import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import FeedbackModal from './FeedbackModal';

const Layout = ({ children, user, handleLogout, currentView, setCurrentView, setCurrentTripId, tripsList = [] }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // Mobile search state
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // Filtering logic
    React.useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const results = tripsList.filter(trip =>
            (trip.tripName && trip.tripName.toLowerCase().includes(lowerQuery)) ||
            (trip.destination && typeof trip.destination === 'string' && trip.destination.toLowerCase().includes(lowerQuery)) ||
            (trip.destination && trip.destination.name && trip.destination.name.toLowerCase().includes(lowerQuery))
        ).slice(0, 5); // Limit to 5 results for quick jump

        setSearchResults(results);
    }, [searchQuery, tripsList]);

    const handleResultClick = (tripId) => {
        setCurrentTripId(tripId);
        setSearchQuery('');
        setSearchResults([]);
        setIsMobileSearchOpen(false); // Close mobile search on selection
    };

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
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 relative">
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
                        <div className="relative z-50">
                            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <Search size={16} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-sm w-48 placeholder:text-slate-400 outline-none"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                            >
                                <Search size={20} />
                            </button>

                            {/* Mobile Search Overlay */}
                            <AnimatePresence>
                                {isMobileSearchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="sm:hidden absolute top-14 right-0 w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 mr-[-50px]"
                                    >
                                        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 w-full focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                            <Search size={16} className="text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search trips..."
                                                autoFocus
                                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none ml-2"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 shrink-0">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Search Results Dropdown */}
                            {searchQuery && (
                                <div className="absolute top-full mt-2 w-64 right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trips</p>
                                            {searchResults.map(trip => (
                                                <button
                                                    key={trip.id}
                                                    onClick={() => handleResultClick(trip.id)}
                                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                        <Search size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{trip.tripName}</p>
                                                        <p className="text-xs text-slate-400 truncate">{trip.destination?.name || trip.destination || 'No location'}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-slate-400 text-sm">
                                            No trips found.
                                        </div>
                                    )}
                                </div>
                            )}
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
                    {/* Integrated Footer */}
                    <div className="mt-auto">
                        <Footer setCurrentView={setCurrentView} onOpenFeedback={() => setIsFeedbackOpen(true)} />
                    </div>
                </main>
            </div>

            {/* Global Modals */}
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                user={user}
            />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />
        </div>
    );
};

export default Layout;
