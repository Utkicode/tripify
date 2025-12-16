import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, Settings, Share2, Plus, MapPin } from 'lucide-react';
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { appId, createInitialDays, createInitialTravelers } from '../constants';
import Planner from './Planner';
import Travelers from './Travelers';
import Insights from './Insights';
import Expenses from './Expenses';
import Files from './Files';
import TripMap from './TripMap';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const TripDetail = ({ user, tripId, setCurrentTripId }) => {
    const [tripName, setTripName] = useState('My Trip');
    const [destination, setDestination] = useState('');
    const [days, setDays] = useState([]);
    const [travelers, setTravelers] = useState([]);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [syncStatus, setSyncStatus] = useState('synced');
    const [detailLoading, setDetailLoading] = useState(false);

    // --- Data Sync: Fetch Detail ---
    useEffect(() => {
        if (!user || !tripId) return;
        setDetailLoading(true);

        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trips', tripId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            setDetailLoading(false);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (JSON.stringify(data.days) !== JSON.stringify(days)) setDays(data.days || createInitialDays());
                if (JSON.stringify(data.travelers) !== JSON.stringify(travelers)) setTravelers(data.travelers || createInitialTravelers());
                if (data.tripName && data.tripName !== tripName) setTripName(data.tripName);
                if (data.destination && data.destination !== destination) setDestination(data.destination || '');
            }
        }, (error) => {
            console.error("Error fetching trip details:", error);
            setDetailLoading(false);
        });
        return () => unsubscribe();
    }, [user, tripId]);

    // --- Data Sync: Save Changes ---
    useEffect(() => {
        if (!user || !tripId || detailLoading) return;

        const saveData = async () => {
            setSyncStatus('saving');
            try {
                const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trips', tripId);
                const totalCost = days ? days.reduce((total, day) => total + day.items.reduce((dTotal, item) => dTotal + Number(item.amount), 0), 0) : 0;

                await updateDoc(docRef, {
                    days,
                    travelers,
                    tripName,
                    destination,
                    updatedAt: Date.now(),
                    totalCost,
                    travelerCount: travelers.length
                });
                setSyncStatus('synced');
            } catch (error) {
                console.error("Save error:", error);
                setSyncStatus('error');
            }
        };

        const timer = setTimeout(saveData, 1000);
        return () => clearTimeout(timer);
    }, [days, travelers, tripName, destination, user, tripId]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            {/* Top Navigation Bar (Workspace Header) */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentTripId(null)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500 hidden sm:inline">Trips /</span>
                        <input
                            type="text"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            className="text-base font-bold text-slate-800 border-none bg-transparent focus:ring-2 focus:ring-blue-100 p-1 hover:bg-slate-50 rounded transition-colors cursor-text min-w-[200px]"
                            placeholder="Trip Name"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 mr-2">
                        {travelers.slice(0, 3).map((t, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                                {t.name?.[0] || 'T'}
                            </div>
                        ))}
                        <button className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-500 hover:bg-slate-200 transition-colors">
                            <Plus size={14} />
                        </button>
                    </div>
                    <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2">
                        <Share2 size={16} /> Share
                    </button>
                    <NotificationBell user={user} tripId={tripId} />

                    <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${syncStatus === 'synced' ? 'text-slate-400' : 'text-amber-500'}`}>
                        {syncStatus === 'saving' ? 'Saving...' : 'Saved'}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Cover Image Area (Mockup) */}
                <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative shrink-0">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-sm font-medium">
                                <Calendar size={16} /> {days.length} Days  •  <Users size={16} /> {travelers.length} Travelers
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={24} className="text-white/80" />
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Add Destination"
                                    className="bg-transparent border-none text-3xl font-bold text-white placeholder-white/50 p-0 focus:ring-0 w-full max-w-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-white px-6">
                    <div className="flex gap-6">
                        {[
                            { id: 'itinerary', label: 'Itinerary' },
                            { id: 'expenses', label: 'Expenses' },
                            { id: 'map', label: 'Map' },
                            { id: 'travelers', label: 'Travelers' },
                            { id: 'files', label: 'Files' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 text-sm font-medium border-b-2 transition-colors relative ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Tab Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    <div className="max-w-5xl mx-auto pb-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'itinerary' && <Planner days={days} setDays={setDays} user={user} tripId={tripId} />}
                                {activeTab === 'travelers' && <Travelers travelers={travelers} setTravelers={setTravelers} />}
                                {activeTab === 'expenses' && <Expenses days={days} />}
                                {activeTab === 'map' && <TripMap />}
                                {activeTab === 'files' && <Files user={user} tripId={tripId} />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripDetail;
