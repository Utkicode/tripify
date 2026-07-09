import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Gear, ShareNetwork, Plus, MapPin, CheckCircle } from '@phosphor-icons/react';
import { doc, onSnapshot, updateDoc, collection, query, orderBy, writeBatch, deleteField, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import { appId, createInitialDays, createInitialTravelers } from '../constants';
import Planner from './Planner';
import Travelers from './Travelers';
import Insights from './Insights';
import Expenses from './Expenses';
import TripMap from './TripMap';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

import InviteModal from './InviteModal';

const TripDetail = ({ user, tripId, setCurrentTripId, initialTab, clearInitialTab }) => {
    const [tripName, setTripName] = useState('My Trip');
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState([]);
    const [travelers, setTravelers] = useState([]);
    const [collaborators, setCollaborators] = useState([]); // Track who has access
    const [activeTab, setActiveTab] = useState(initialTab || 'itinerary');
    const [budget, setBudget] = useState(0);
    const [syncStatus, setSyncStatus] = useState('synced');
    const [detailLoading, setDetailLoading] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const hasUnsavedChanges = React.useRef(false);
    const [daysLoading, setDaysLoading] = useState(true); // Track sub-collection load
    const [tripData, setTripData] = useState(null);
    const [currency, setCurrency] = useState('INR');
    const [actualCost, setActualCost] = useState(0);

    // --- Data Sync: Fetch Detail ---
    // --- Data Sync: Fetch Detail & Days ---
    useEffect(() => {
        if (!user || !tripId) return;
        setDetailLoading(true);
        setDaysLoading(true); // Reset on ID change

        const tripRef = doc(db, 'artifacts', appId, 'trips', tripId);

        // 1. Metadata Listener
        const unsubscribeTrip = onSnapshot(tripRef, async (docSnap) => {
            // Ignore updates if we have unsaved local changes to prevent reversion
            if (hasUnsavedChanges.current) return;

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTripData(data);
                setDetailLoading(false);
                if (data.currency) setCurrency(data.currency);

                // --- Lazy Migration Check ---
                if (data.days && Array.isArray(data.days) && data.days.length > 0) {
                    console.log("Migrating legacy days to sub-collections...");
                    try {
                        const batch = writeBatch(db);
                        const daysCollectionRef = collection(db, 'artifacts', appId, 'trips', tripId, 'days');

                        data.days.forEach(day => {
                            const newDayRef = doc(daysCollectionRef, String(day.id));
                            batch.set(newDayRef, day);
                        });

                        // Remove'days' from main doc
                        batch.update(tripRef, { days: deleteField() });
                        await batch.commit();
                        console.log("Migration successful.");
                    } catch (err) {
                        console.error("Migration failed:", err);
                    }
                    return; // Stop here, let the listeners pick up the new state
                }

                // Normal Metadata Update
                if (JSON.stringify(data.travelers) !== JSON.stringify(travelers)) setTravelers(data.travelers || createInitialTravelers());
                if (data.tripName && data.tripName !== tripName) setTripName(data.tripName);
                if (data.destination && data.destination !== destination) setDestination(data.destination || '');
                if (data.budget !== undefined && data.budget !== budget) setBudget(data.budget);
                if (data.collaborators) setCollaborators(data.collaborators);
            } else {
                setDetailLoading(false);
                setTripData(null);
            }
        }, (error) => {
            console.error("Error fetching trip details:", error);
            setDetailLoading(false);
        });

        // 2. Days Sub-collection Listener
        const daysQuery = query(
            collection(db, 'artifacts', appId, 'trips', tripId, 'days'),
            orderBy('id', 'asc') // Ensure consistent order
        );

        const unsubscribeDays = onSnapshot(daysQuery, (snapshot) => {
            const daysData = snapshot.docs.map(doc => doc.data());
            // Update days from sub-collection. 
            // Note: We do NOT set hasUnsavedChanges here, as this is the source of truth.
            if (JSON.stringify(daysData) !== JSON.stringify(days)) {
                setDays(daysData.length > 0 ? daysData : createInitialDays()); // Fallback if truly empty? Should be handled by migration or creation.
                // For now, let's just display.
            }
            setDaysLoading(false); // Data loaded (or empty confirmed)
        });

        // 3. Expenses Sub-collection Listener
        const expensesQuery = query(
            collection(db, 'artifacts', appId, 'trips', tripId, 'expenses')
        );

        const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
            const expensesData = snapshot.docs.map(doc => doc.data());
            const computedActualCost = expensesData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            setActualCost(computedActualCost);
        }, (error) => {
            console.error("Error listening to expenses:", error);
        });

        return () => {
            unsubscribeTrip();
            unsubscribeDays();
            unsubscribeExpenses();
        };
    }, [user, tripId]); // Removed dependencies to prevent listener recreation

    const isCompleted = !!tripData?.isCompleted;
    const isOwner = tripData?.ownerId === user?.uid;

    const handleCompleteTrip = async () => {
        if (!user || !tripId) return;
        try {
            const docRef = doc(db, 'artifacts', appId, 'trips', tripId);
            await updateDoc(docRef, {
                isCompleted: true,
                updatedAt: Date.now()
            });
            await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'activities'), {
                text: `marked the trip as completed`,
                type: 'update',
                timestamp: Date.now(),
                performedBy: user.uid,
                userName: user.displayName || 'Traveler',
                collaborators: collaborators
            });
        } catch (error) {
            console.error("Failed to complete trip:", error);
        }
    };

    const handleReopenTrip = async () => {
        if (!user || !tripId) return;
        try {
            const docRef = doc(db, 'artifacts', appId, 'trips', tripId);
            await updateDoc(docRef, {
                isCompleted: false,
                updatedAt: Date.now()
            });
            await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'activities'), {
                text: `reopened the trip`,
                type: 'update',
                timestamp: Date.now(),
                performedBy: user.uid,
                userName: user.displayName || 'Traveler',
                collaborators: collaborators
            });
        } catch (error) {
            console.error("Failed to reopen trip:", error);
        }
    };

    // Wrappers to track USER changes
    const handleSetDays = (newDays) => {
        hasUnsavedChanges.current = true;
        setDays(newDays);
    };

    const handleSetTravelers = (newTravelers) => {
        hasUnsavedChanges.current = true;
        setTravelers(newTravelers);
    };

    const handleUpdateTripInfo = (field, value) => {
        hasUnsavedChanges.current = true;
        if (field === 'tripName') setTripName(value);
        if (field === 'destination') setDestination(value);
        if (field === 'budget') setBudget(Number(value));
    };

    // --- Data Sync: Save Changes (Metadata Only) ---
    useEffect(() => {
        // Only save if explicitly marked as unsaved (user action)
        if (!user || !tripId || detailLoading || !hasUnsavedChanges.current || isCompleted) return;

        const saveData = async () => {
            setSyncStatus('saving');
            try {
                const docRef = doc(db, 'artifacts', appId, 'trips', tripId);
                const totalCost = actualCost;

                await updateDoc(docRef, {
                    // days, // REMOVED: Days are now in sub-collection
                    travelers,
                    tripName,
                    destination,
                    budget,
                    updatedAt: Date.now(),
                    totalCost,
                    travelerCount: travelers.length,
                    dayCount: days ? days.length : 0
                });
                setSyncStatus('synced');
                hasUnsavedChanges.current = false; // Sync complete
            } catch (error) {
                console.error("Save error:", error);
                setSyncStatus('error');
            }
        };

        const timer = setTimeout(saveData, 1000);
        return () => clearTimeout(timer);
    }, [travelers, tripName, destination, budget, user, tripId, days, isCompleted, actualCost]);

    // --- Data Sync: Keep trip document stats in sync with days/travelers sub-collection data ---
    useEffect(() => {
        if (!user || !tripId || detailLoading || !tripData) return;

        const dayDates = days ? days.map(d => d.date).filter(Boolean) : [];
        const computedStartDate = dayDates.length > 0 ? dayDates.reduce((min, d) => d < min ? d : min, dayDates[0]) : null;
        const computedEndDate = dayDates.length > 0 ? dayDates.reduce((max, d) => d > max ? d : max, dayDates[0]) : null;
        const computedTotalCost = actualCost;
        const computedDayCount = days ? days.length : 0;
        const computedTravelerCount = travelers ? travelers.length : 0;
        const computedDaysWithActivitiesCount = days ? days.filter(day => day.items && day.items.length > 0).length : 0;

        // Check if anything actually changed to prevent redundant writes
        const hasChanged =
            computedTotalCost !== (tripData.totalCost || 0) ||
            computedDayCount !== (tripData.dayCount || 0) ||
            computedTravelerCount !== (tripData.travelerCount || 0) ||
            computedStartDate !== (tripData.startDate || null) ||
            computedEndDate !== (tripData.endDate || null) ||
            computedDaysWithActivitiesCount !== (tripData.daysWithActivitiesCount || 0);

        if (hasChanged) {
            const updateObj = {
                totalCost: computedTotalCost,
                dayCount: computedDayCount,
                travelerCount: computedTravelerCount,
                daysWithActivitiesCount: computedDaysWithActivitiesCount,
                updatedAt: Date.now()
            };
            if (computedStartDate) updateObj.startDate = computedStartDate;
            if (computedEndDate) updateObj.endDate = computedEndDate;

            const docRef = doc(db, 'artifacts', appId, 'trips', tripId);
            updateDoc(docRef, updateObj).catch(err => console.error("Error syncing stats to trip:", err));
        }
    }, [days, travelers, tripData, user, tripId, detailLoading, actualCost]);

    // --- Deep Link Handling ---
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
            if (clearInitialTab) clearInitialTab();
        }
    }, [initialTab, clearInitialTab]);

    if (!detailLoading && !tripData) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#FAFAF7]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-700">Trip Not Found</h2>
                    <p className="text-slate-500 mt-2">This trip doesn't exist or you don't have access.</p>
                    <button onClick={() => { setCurrentTripId(null); }}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg">
                        Back to My Trips
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  text-slate-800 font-sans flex flex-col">
            {/* Top Navigation Bar (Workspace Header) */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 px-4 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                    <button
                        onClick={() => setCurrentTripId(null)}
                        className="p-2.5 hover: rounded-full text-slate-500 transition-colors shrink-0"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={22} className="stroke-[2.5]" />
                    </button>
                    <div className="h-8 w-px  shrink-0 hidden md:block"></div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block text-left">Trip Workspace</span>
                        <input
                            type="text"
                            value={tripName}
                            onChange={(e) => handleUpdateTripInfo('tripName', e.target.value)}
                            disabled={isCompleted}
                            className={`text-lg md:text-xl font-black text-slate-800 border-none bg-transparent focus:ring-0 p-0 w-full min-w-[100px] text-ellipsis placeholder:text-slate-300 text-left ${isCompleted ? 'cursor-default' : 'hover:text-[#1A1A1A] cursor-text transition-colors'}`}
                            placeholder="Untitled Trip"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {/* Complete Trip / Completed Badge */}
                    {isCompleted ? (
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20">
                                <CheckCircle size={16} weight="fill" />
                                <span>Completed</span>
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={handleCompleteTrip}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-all active:scale-95 border border-emerald-200/50"
                        >
                            <CheckCircle size={16} className="stroke-[2.5]" />
                            <span>Complete Trip</span>
                        </button>
                    )}

                    {/* Share Button One UI (Only shown if NOT completed) */}
                    {!isCompleted && (
                        <button
                            onClick={() => setIsInviteOpen(true)}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#1A1A1A]  hover: rounded-full transition-all active:scale-95"
                        >
                            <ShareNetwork size={18} className="stroke-[2.5]" />
                            <span>Share</span>
                        </button>
                    )}

                    <div className="hidden sm:flex -space-x-3 mr-2">
                        {travelers.slice(0, 3).map((t, i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm relative z-0 hover:z-10 hover:scale-110 transition-transform cursor-context-menu">
                                {t.name?.[0] || 'T'}
                            </div>
                        ))}
                        {!isCompleted && (
                            <button
                                onClick={() => setIsInviteOpen(true)}
                                className="w-10 h-10 rounded-full border-[3px] border-white  flex items-center justify-center text-slate-400 hover: hover:text-[#1A1A1A] transition-all z-0 shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>

                    <div className="w-px h-8  hidden sm:block mx-1"></div>

                    <NotificationBell user={user} tripId={tripId} />

                    {!isCompleted && (
                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all hidden sm:inline-block border ${syncStatus === 'synced' ? ' text-[#1A1A1A] border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {syncStatus === 'saving' ? 'SAVING...' : 'SAVED'}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Cover Image Area (Mockup) */}
                <div className="h-40 md:h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative shrink-0 transition-all">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent">
                        <div className="text-white w-full">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs md:text-sm font-medium">
                                <Calendar size={14} className="md:w-4 md:h-4" /> {days.length} Days  •  <Users size={14} className="md:w-4 md:h-4" /> {travelers.length} Travelers
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-white/80 md:w-6 md:h-6" />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => handleUpdateTripInfo('destination', e.target.value)}
                                    disabled={isCompleted}
                                    placeholder="Add Destination"
                                    className={`bg-transparent border-none text-2xl md:text-3xl font-bold text-white placeholder-white/50 p-0 focus:ring-0 w-full max-w-md ${isCompleted ? 'cursor-default' : 'cursor-text'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 md:px-8 z-20 sticky top-14 md:top-16">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {[
                            { id: 'itinerary', label: 'Itinerary' },
                            { id: 'expenses', label: 'Expenses' },
                            { id: 'map', label: 'Map' },
                            { id: 'travelers', label: 'Travelers' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 text-sm font-bold border-b-[3px] transition-all relative whitespace-nowrap px-1 ${activeTab === tab.id
                                    ? 'border-blue-600 text-[#1A1A1A]'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Read-Only Status Banner */}
                {isCompleted && (
                    <div className="bg-slate-900 text-white px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 text-xs md:text-sm font-bold border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0" />
                            <span>This trip is completed and is in read-only mode.</span>
                        </div>
                        {isOwner && (
                            <button
                                onClick={handleReopenTrip}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-xs transition-all active:scale-95 shrink-0"
                            >
                                Reopen Trip
                            </button>
                        )}
                    </div>
                )}

                {/* Main Tab Content */}
                <div className="flex-1 overflow-y-auto  p-4 md:p-6">
                    <div className="max-w-5xl mx-auto pb-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'itinerary' && (
                                    <Planner
                                        days={days}
                                        setDays={handleSetDays}
                                        user={user}
                                        tripId={tripId}
                                        collaborators={collaborators}
                                        isLoading={detailLoading || daysLoading}
                                        isCompleted={isCompleted}
                                    />
                                )}
                                {activeTab === 'travelers' && (
                                    <Travelers
                                        travelers={travelers}
                                        setTravelers={handleSetTravelers}
                                        isCompleted={isCompleted}
                                    />
                                )}
                                {activeTab === 'expenses' && (
                                    <Expenses
                                        days={days}
                                        user={user}
                                        tripId={tripId}
                                        budget={budget}
                                        onUpdateTripInfo={handleUpdateTripInfo}
                                        travelers={travelers}
                                        currencyCode={currency}
                                        isCompleted={isCompleted}
                                    />
                                )}
                                {activeTab === 'map' && <TripMap days={days} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                tripId={tripId}
                tripName={tripName}
                currentUser={user}
                currentCollaborators={collaborators}
            />
        </div>
    );
};

export default TripDetail;
