import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Map, Calendar, IndianRupee, ArrowUpRight, ArrowRight } from 'lucide-react';
import TripList from './TripList';

import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = ({ user, tripsList, setCurrentTripId, createNewTrip, deleteTrip, setCurrentView }) => {
    // Activity State
    const [activities, setActivities] = React.useState([]);

    React.useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'artifacts', appId, 'users', user.uid, 'notifications'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(newActivities);
        });

        return () => unsubscribe();
    }, [user]);

    // Calculate Stats
    const totalTrips = tripsList.length;
    const totalBudget = tripsList.reduce((acc, trip) => acc + (trip.totalCost || 0), 0);
    const upcomingTrips = tripsList.filter(t => t.updatedAt > Date.now() - 86400000); // Mock logic for now

    const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={22} className={color.replace('bg-', 'text-')} />
                </div>
                <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +12% <ArrowUpRight size={12} className="ml-0.5" />
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </motion.div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {user.displayName?.split(' ')[0] || user.name?.split(' ')[0] || 'Traveler'} 👋</h2>
                    <p className="text-slate-500">Here's what's happening with your adventures.</p>
                </div>
                <button
                    onClick={createNewTrip}
                    className="hidden sm:flex btn-primary"
                >
                    Create New Trip
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Trips"
                    value={totalTrips}
                    subtext="4 trips this year"
                    icon={Map}
                    color="bg-blue-500"
                />
                <StatCard
                    label="Total Budget"
                    value={`₹${(totalBudget / 1000).toFixed(1)}k`}
                    subtext="Across all active trips"
                    icon={IndianRupee}
                    color="bg-purple-500"
                />
                <StatCard
                    label="Travel Days"
                    value="12"
                    subtext="Upcoming days away"
                    icon={Calendar}
                    color="bg-amber-500"
                />
            </div>

            {/* Recent Trips Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Recent Trips</h3>
                    <button
                        onClick={() => setCurrentView('trips')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                    >
                        View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <TripList
                    tripsList={tripsList}
                    setCurrentTripId={setCurrentTripId}
                    createNewTrip={createNewTrip}
                    deleteTrip={deleteTrip}
                    limit={3}
                />
            </div>

            {/* Activity Feed Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Activity Feed</h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-slate-400 text-sm">No recent functionality.</p>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                        {activity.user?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold">{activity.user || 'User'}</span> {activity.message}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {activity.timestamp ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Pro Tip 💡</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            Did you know? Organizing your expenses by category helps you save up to 15% on travel costs.
                        </p>
                        <button
                            onClick={() => setCurrentView('protips')}
                            className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-opacity-90"
                        >
                            Learn More
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
