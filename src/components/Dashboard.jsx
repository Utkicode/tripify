import React from 'react';
import { motion } from 'framer-motion';
import { TrendUp, MapTrifold, CurrencyInr, ArrowRight, Plus, CurrencyDollar } from '@phosphor-icons/react';
import { useProfile } from '../context/ProfileContext';
import { getCurrencySymbol } from '../utils/currency';
import { EMPTY_STATE_MESSAGES } from './dashboard/SmartExamples';

// New Components
import NBAWidget from './dashboard/NBAWidget';
import InsightCard from './dashboard/InsightCard';
import TripStoryCard from './dashboard/TripStoryCard';
import SmartTipWidget from './dashboard/SmartTipWidget';
import { calculateGlobalStats, calculateTripStats } from '../utils/analytics';

import { DashboardSkeleton } from './common/LoadingSkeleton';

// ... existing imports ...

const Dashboard = ({ tripsList, setCurrentTripId, createNewTrip, setCurrentView, setTargetTab, isLoading }) => {
    const { profile, user } = useProfile();

    if (isLoading) return <DashboardSkeleton />;

    // safe fallbacks
    const currencyCode = profile?.behavior?.defaultCurrency || 'INR';
    const currencySymbol = getCurrencySymbol(currencyCode);
    const displayName = profile?.identity?.displayName || user?.displayName || 'Traveler';
    const firstName = displayName.split(' ')[0];

    // --- Metric Calculations ---
    const { totalBudget, totalSpent } = React.useMemo(() => calculateGlobalStats(tripsList), [tripsList]);

    // Disambiguate duplicate trip names
    const processedTripsList = React.useMemo(() => {
        return tripsList.map(trip => {
            const baseName = trip.tripName || trip.destination || 'Untitled Trip';
            if (baseName === 'Untitled Trip' || baseName === 'New Trip') return trip;
            
            const duplicates = tripsList.filter(t => {
                const tName = t.tripName || t.destination || 'Untitled Trip';
                return tName.toLowerCase() === baseName.toLowerCase();
            });
            
            if (duplicates.length > 1) {
                const dateTag = trip.startDate 
                    ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'Draft';
                return { 
                    ...trip, 
                    tripName: trip.tripName ? `${trip.tripName} (${dateTag})` : trip.tripName,
                    destination: trip.destination ? `${trip.destination} (${dateTag})` : trip.destination
                };
            }
            return trip;
        });
    }, [tripsList]);

    // Enrich trips with financial stats for Intelligence Engine
    const enrichedTrips = React.useMemo(() => {
        return processedTripsList.map(trip => {
            const stats = calculateTripStats(trip);
            return { ...trip, ...stats, totalCost: stats.spent }; // Ensure totalCost is present
        });
    }, [processedTripsList]);

    const totalTrips = processedTripsList.length;

    const upcomingTrips = processedTripsList
        .filter(t => !t.isArchived)
        .sort((a, b) => (a.startDate || 0) - (b.startDate || 0))
        .slice(0, 3);

    // --- Handlers ---
    const handleNBAAction = (action) => {
        if (action.action === 'create_trip') {
            createNewTrip();
        } else if (action.id && action.id.startsWith('add_dest_')) {
            createNewTrip(action.tripId);
        } else if (action.tripId) {
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
        <div className="space-y-12 pb-24">
            {/* 1. Page Header — solid-color title, CTA inline in header row */}
            <header className="py-8 md:py-10 px-4 md:px-0">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest mb-4 shadow-sm"
                        >
                            {(() => {
                                const hours = new Date().getHours();
                                if (hours < 12) return 'Good Morning';
                                if (hours < 18) return 'Good Afternoon';
                                return 'Good Evening';
                            })()}
                        </motion.div>
                        {/* Solid-color h1 — 26px/800 weight, no gradient */}
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '6px' }}>
                            Hello, <span style={{ color: '#FF6B35' }}>{firstName}</span>.
                        </h1>
                        <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
                            Your financial compass for every journey. Ready to plan?
                        </p>
                    </div>

                    {/* Primary CTA lives inside header row */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={createNewTrip}
                        className="btn-primary pl-5 pr-6 py-3 rounded-xl flex items-center gap-2.5 w-fit shrink-0 text-sm"
                    >
                        <Plus size={18} />
                        <span className="font-bold">New Trip</span>
                    </motion.button>
                </div>
            </header>

            {/* 2. Next Best Action (Hero) */}
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
                    icon={currencyCode === 'INR' ? CurrencyInr : CurrencyDollar}
                    color="0"
                />
                <InsightCard
                    label="Actual Spent"
                    value={formatMoney(totalSpent)}
                    subtext="Current total spending"
                    icon={TrendUp}
                    color="0"
                    trend={totalSpent > totalBudget ? 'down' : 'up'}
                    trendLabel={totalSpent > totalBudget ? 'Over Budget' : 'On Track'}
                />

                {/* Smart Tips */}
                <div className="md:col-span-2 lg:col-span-3">
                    <SmartTipWidget onViewTip={handleTipAction} />
                </div>
            </section>

            {/* 4. Active Trips */}
            <section className="space-y-6 relative z-10">
                {/* Section header — solid-color title, grey subtitle, CTA inline */}
                <div className="flex justify-between items-end px-1">
                    <div>
                        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
                            Your Adventures
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Continue where you left off</p>
                    </div>
                    {tripsList.length > 3 && (
                        <button
                            onClick={() => setCurrentView('trips')}
                            className="px-5 py-2 bg-white rounded-lg font-semibold text-slate-600 transition-all shadow-sm border border-slate-200 flex items-center gap-2 group text-sm hover:border-[#FF6B35] hover:text-[#FF6B35]"
                        >
                            View All <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    )}
                </div>

                {upcomingTrips.length === 0 ? (
                    // Empty State
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-12 md:p-20 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
                            <MapTrifold size={32} strokeWidth={1.5} style={{ color: '#FF6B35' }} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                            {EMPTY_STATE_MESSAGES.no_trips.headline}
                        </h3>
                        <p className="text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed text-sm">
                            {EMPTY_STATE_MESSAGES.no_trips.subhead}
                        </p>
                        <button
                            onClick={createNewTrip}
                            className="btn-primary px-8 py-3 rounded-xl text-sm"
                        >
                            {EMPTY_STATE_MESSAGES.no_trips.cta}
                        </button>
                    </motion.div>
                ) : (
                    // Story Grid
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
