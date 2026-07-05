import React from'react';
import { motion } from'framer-motion';
import { CheckCircle, Plus, Trash, PencilSimple, FileText, User, UserPlus } from'@phosphor-icons/react';
import { formatDistanceToNow, subDays } from'date-fns';
import { useState } from'react';

const ActivityFeed = ({ activities, setCurrentTripId, setCurrentView, onClose }) => {
    const [filter, setFilter] = useState('All'); // All, 3d, 7d, 30d

    const handleActivityClick = (activity) => {
        if (activity.tripId) {
            if (setCurrentTripId && setCurrentView) {
                // Navigate to the trip
                setCurrentTripId(activity.tripId);
                setCurrentView('dashboard');
                onClose();
            }
        }
    };

    const filteredActivities = activities.filter(activity => {
        if (filter ==='All') return true;
        const activityDate = activity.timestamp;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (filter ==='3d') return (now - activityDate) <= (3 * oneDay);
        if (filter ==='7d') return (now - activityDate) <= (7 * oneDay);
        if (filter ==='30d') return (now - activityDate) <= (30 * oneDay);
        return true;
    });

    const getIcon = (type) => {
        switch (type) {
            case'add': return <Plus size={14} className="text-white" />;
            case'delete': return <Trash size={14} className="text-white" />;
            case'edit': return <PencilSimple size={14} className="text-white" />;
            case'file': return <FileText size={14} className="text-white" />;
            case'trip_invite': return <UserPlus size={14} className="text-white" />;
            default: return <CheckCircle size={14} className="text-white" />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case'add': return'0';
            case'delete': return'0';
            case'edit': return'0';
            case'file': return'0';
            case'trip_invite': return'0';
            default: return'0';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
        >
            <div className="p-4 border-b border-slate-100 /50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-800">Activity</h3>
                    <span className="text-xs font-bold text-slate-400">{filteredActivities.length} items</span>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {['All','3d','7d','30d'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${filter === f
                                ?'bg-blue-600 text-white shadow-sm'
                                :'bg-white text-slate-500 border border-slate-200 hover:'
                                }`}
                        >
                            {f ==='All' ?'All' : `Last ${f.replace('d',' Days')}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        <p className="text-sm">No recent activity</p>
                        {filter !=='All' && <button onClick={() => setFilter('All')} className="text-xs text-[#1A1A1A] mt-2 hover:underline">Clear Filter</button>}
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <div
                            key={activity.id}
                            onClick={() => handleActivityClick(activity)}
                            className={`p-3 rounded-xl hover: transition-colors flex gap-3 group ${activity.tripId ?'cursor-pointer' :''}`}
                        >
                            <div className={`mt-1 w-8 h-8 rounded-full ${getColor(activity.type)} flex items-center justify-center shrink-0 border-2 border-white shadow-sm`}>
                                {getIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 leading-snug">
                                    <span className="font-semibold">{activity.userName || activity.user ||'Someone'}</span> {activity.text || activity.message}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    {activity.timestamp ? formatDistanceToNow(activity.timestamp, { addSuffix: true }) :'Just now'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 border-t border-slate-100 /50 text-center">
                <button className="text-xs font-medium text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors">
                    View all history
                </button>
            </div>
        </motion.div>
    );
};

export default ActivityFeed;
