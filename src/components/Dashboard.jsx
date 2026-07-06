import React from'react';
import { motion } from'framer-motion';
import { TrendUp, MapTrifold, CurrencyInr, ArrowRight, Plus, CurrencyDollar } from'@phosphor-icons/react';
import { useProfile } from'../context/ProfileContext';
import { getCurrencySymbol } from'../utils/currency';
import { EMPTY_STATE_MESSAGES } from'./dashboard/SmartExamples';

// New Components
import NBAWidget from'./dashboard/NBAWidget';
import InsightCard from'./dashboard/InsightCard';
import TripStoryCard from'./dashboard/TripStoryCard';
import SmartTipWidget from'./dashboard/SmartTipWidget';
import { calculateGlobalStats, calculateTripStats } from'../utils/analytics';

import { DashboardSkeleton } from'./common/LoadingSkeleton';

// ... existing imports ...

const Dashboard = ({ tripsList, setCurrentTripId, createNewTrip, setCurrentView, setTargetTab, isLoading }) => {
    const { profile, user } = useProfile();

    if (isLoading) return <DashboardSkeleton />;

    // safe fallbacks
    const currencyCode = profile?.behavior?.defaultCurrency ||'USD';
    const currencySymbol = getCurrencySymbol(currencyCode);
    const displayName = profile?.identity?.displayName || user?.displayName ||'Traveler';
    const firstName = displayName.split(' ')[0];

    // --- Metric Calculations ---
    const { totalBudget, totalSpent } = React.useMemo(() => calculateGlobalStats(tripsList), [tripsList]);

    // Enrich trips with financial stats for Intelligence Engine
    const enrichedTrips = React.useMemo(() => {
        return tripsList.map(trip => {
            const stats = calculateTripStats(trip);
            return { ...trip, ...stats, totalCost: stats.spent }; // Ensure totalCost is present
        });
    }, [tripsList]);

    const totalTrips = tripsList.length;

    const upcomingTrips = tripsList
        .filter(t => !t.isArchived)
        .sort((a, b) => (a.startDate || 0) - (b.startDate || 0))
        .slice(0, 3);

    // --- Handlers ---
    const handleNBAAction = (action) => {
        if (action.action ==='create_trip') createNewTrip();
        else if (action.tripId) {
            setCurrentTripId(action.tripId);
            if (action.action ==='view_trip_expenses') setTargetTab('expenses');
            if (action.action ==='view_trip_itinerary') setTargetTab('itinerary');
        }
    };

    const handleTipAction = (action) => {
        if (upcomingTrips.length === 0) {
            createNewTrip();
            return;
        }

        const tripId = upcomingTrips[0].id;
        let tab ='itinerary';

        switch (action) {
            case'view_expenses': tab ='expenses'; break;
            case'view_files': tab ='files'; break;
            case'open_checklist': tab ='itinerary'; break;
            case'view_itinerary': tab ='itinerary'; break;
            default: return;
        }

        setTargetTab(tab);
        setCurrentTripId(tripId);
    };

    // Helper to format currency
    const formatMoney = (amount) => {
        return `${currencySymbol}${(amount / 1000).toFixed(1)}k`;
    };

    return (
        <div className="space-y-12 pb-24">
            {/* 1. Immersive Header */}
            <header className="relative py-8 md:py-12 px-4 md:px-0">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur border border-white/50 text-[#1A1A1A] font-bold text-xs uppercase tracking-widest mb-4 shadow-sm"
                        >
                            {(() => {
                                const hours = new Date().getHours();
                                if (hours < 12) return'Good Morning';
                                if (hours < 18) return'Good Afternoon';
                                return'Good Evening';
                            })()}
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-4">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{firstName}</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
                            Your financial compass for every journey. Ready to plan?
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={createNewTrip}
                        className="bg-slate-900 text-white pl-6 pr-8 py-4 md:py-5 rounded-[2.5rem] font-bold shadow-2xl shadow-slate-900/30 flex items-center gap-4 group transition-all w-fit"
                    >
                        <div className="bg-white/20 p-2 rounded-full group-hover:rotate-90 transition-transform duration-500">
                            <Plus size={24} />
                        </div>
                        <span className="text-lg">New Trip</span>
                    </motion.button>
                </div>
            </header>

            {/* 2. Next Best Action (Hero) - Updated in separate file, but container is here */}
            <section className="relative z-10">
                <NBAWidget
                    trips={enrichedTrips}
                    user={user}
                    onActionClick={handleNBAAction}
                />
            </section>

            {/* 3. Insight Grid (Metrics) */}
            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                <InsightCard
                    label="Active Trips"
                    value={totalTrips}
                    subtext="All planned adventures"
                    icon={MapTrifold}
                    color="0"
                    trend="up"
                    trendLabel="+1"
                />
                <InsightCard
                    label="Total Budget"
                    value={formatMoney(totalBudget)}
                    subtext="Planned across trips"
                    icon={currencyCode ==='INR' ? CurrencyInr : CurrencyDollar}
                    color="0"
                />
                <InsightCard
                    label="Actual Spent"
                    value={formatMoney(totalSpent)}
                    subtext="Current total spending"
                    icon={TrendUp}
                    color="0"
                    trend={totalSpent > totalBudget ?'down' :'up'}
                    trendLabel={totalSpent > totalBudget ?'Over Budget' :'On Track'}
                />

                {/* Smart Tips often span full width or fit alongside */}
                <div className="md:col-span-2 lg:col-span-3">
                    <SmartTipWidget onViewTip={handleTipAction} />
                </div>
            </section>

            {/* 4. Active Trips (Story Cards) */}
            <section className="space-y-8 relative z-10">
                <div className="flex justify-between items-end px-2">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Your Adventures</h3>
                        <p className="text-slate-500 font-medium">Continue where you left off</p>
                    </div>
                    {tripsList.length > 3 && (
                        <button
                            onClick={() => setCurrentView('trips')}
                            className="px-6 py-2 bg-white rounded-full font-bold text-slate-600 hover:text-[#1A1A1A] hover: transition-all shadow-sm border border-slate-200 flex items-center gap-2 group"
                        >
                            View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {upcomingTrips.length === 0 ? (
                    // Empty State - Glassmorphism
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/50 shadow-xl p-12 md:p-20 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-white/60">
                                <MapTrifold size={48} className="text-[#1A1A1A]" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{EMPTY_STATE_MESSAGES.no_trips.headline}</h3>
                            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed font-medium">{EMPTY_STATE_MESSAGES.no_trips.subhead}</p>
                            <button
                                onClick={createNewTrip}
                                className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 text-lg"
                            >
                                {EMPTY_STATE_MESSAGES.no_trips.cta}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // Story Grid
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {upcomingTrips.map(trip => (
                            <TripStoryCard
                                key={trip.id}
                                trip={trip}
                                onClick={setCurrentTripId}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
export default Dashboard;
