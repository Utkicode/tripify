import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Map, IndianRupee, ArrowRight, Plus, DollarSign } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getCurrencySymbol } from '../utils/currency';
import { EMPTY_STATE_MESSAGES } from './dashboard/SmartExamples';

// New Components
import NBAWidget from './dashboard/NBAWidget';
import InsightCard from './dashboard/InsightCard';
import TripStoryCard from './dashboard/TripStoryCard';
import SmartTipWidget from './dashboard/SmartTipWidget';
import { calculateGlobalStats, calculateTripStats } from '../utils/analytics';

const Dashboard = ({ tripsList, setCurrentTripId, createNewTrip, setCurrentView, setTargetTab }) => {
    const { profile, user } = useProfile();

    // safe fallbacks
    const currencyCode = profile?.behavior?.defaultCurrency || 'USD';
    const currencySymbol = getCurrencySymbol(currencyCode);
    const displayName = profile?.identity?.displayName || user?.displayName || 'Traveler';
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
        if (action.action === 'create_trip') createNewTrip();
        else if (action.tripId) {
            setCurrentTripId(action.tripId);
            if (action.action === 'view_trip_expenses') setTargetTab('expenses');
            if (action.action === 'view_trip_itinerary') setTargetTab('itinerary');
        }
    };

    const handleTipAction = (action) => {
        if (upcomingTrips.length === 0) {
            createNewTrip();
            return;
        }

        const tripId = upcomingTrips[0].id;
        let tab = 'itinerary';

        switch (action) {
            case 'view_expenses': tab = 'expenses'; break;
            case 'view_files': tab = 'files'; break;
            case 'open_checklist': tab = 'itinerary'; break;
            case 'view_itinerary': tab = 'itinerary'; break;
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
        <div className="space-y-6 md:space-y-8 pb-20">
            {/* 1. Header & Welcome */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {(() => {
                            const hours = new Date().getHours();
                            if (hours < 12) return 'Good Morning';
                            if (hours < 18) return 'Good Afternoon';
                            return 'Good Evening';
                        })()}, {firstName}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Here is your daily travel briefing.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={createNewTrip}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} /> New Trip
                    </button>
                </div>
            </header>

            {/* 2. Next Best Action (Hero) */}
            <section>
                <NBAWidget
                    trips={enrichedTrips}
                    user={user}
                    onActionClick={handleNBAAction}
                />
            </section>

            {/* 4. Insight Grid (Metrics) */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InsightCard
                    label="Active Trips"
                    value={totalTrips}
                    subtext="All planned adventures"
                    icon={Map}
                    color="bg-blue-500"
                    trend="up"
                    trendLabel="+1"
                />
                <InsightCard
                    label="Total Budget"
                    value={formatMoney(totalBudget)}
                    subtext="Planned across trips"
                    icon={currencyCode === 'INR' ? IndianRupee : DollarSign}
                    color="bg-purple-500"
                />
                <InsightCard
                    label="Actual Spent"
                    value={formatMoney(totalSpent)}
                    subtext="Current total spending"
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    trend={totalSpent > totalBudget ? 'down' : 'up'}
                    trendLabel={totalSpent > totalBudget ? 'Over Budget' : 'On Track'}
                />

                <SmartTipWidget
                    onViewTip={handleTipAction}
                />
            </section>

            {/* 4. Active Trips (Story Cards) */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xl font-bold text-slate-800">Your Adventures</h3>
                    {tripsList.length > 3 && (
                        <button
                            onClick={() => setCurrentView('trips')}
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                        >
                            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {upcomingTrips.length === 0 ? (
                    // Empty State
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 md:p-12 text-center"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Map size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{EMPTY_STATE_MESSAGES.no_trips.headline}</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">{EMPTY_STATE_MESSAGES.no_trips.subhead}</p>
                        <button onClick={createNewTrip} className="text-blue-600 font-bold hover:text-blue-700">
                            {EMPTY_STATE_MESSAGES.no_trips.cta}
                        </button>
                    </motion.div>
                ) : (
                    // Story Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
