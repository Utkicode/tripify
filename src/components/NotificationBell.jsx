import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, collectionGroup } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import ActivityFeed from './ActivityFeed';
import { AnimatePresence } from 'framer-motion';

const NotificationBell = ({ user, tripId, setCurrentTripId, setCurrentView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activities, setActivities] = useState([]);
    const bellRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Listen to activities
    useEffect(() => {
        if (!user) return;

        let q;
        if (tripId) {
            // Context-specific (inside a trip)
            q = query(
                collection(db, 'artifacts', appId, 'trips', tripId, 'activities'),
                orderBy('timestamp', 'desc'),
                limit(50)
            );
        } else {
            // Global (all shared trips) - Requires 'collaborators' array in activity doc
            // NOTE: This requires a Firestore Composite Index: activities (collaborators: arrays, timestamp: desc)
            q = query(
                collectionGroup(db, 'activities'),
                where('collaborators', 'array-contains', user.uid),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter out my own actions for global view (notification noise)
            const filteredActivities = tripId
                ? newActivities
                : newActivities.filter(a => a.performedBy !== user.uid);

            setActivities(filteredActivities);

            // Calculate Unread Count
            if (!isOpen) {
                const lastReadStr = localStorage.getItem('tripify_last_read_time');
                const lastRead = lastReadStr ? Number(lastReadStr) : 0;

                const count = filteredActivities.filter(a => (a.timestamp || 0) > lastRead).length;
                setUnreadCount(count);
            }
        }, (error) => {
            console.error("Notification listener error (check indexes):", error);
        });

        return () => unsubscribe();
    }, [user, tripId, isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Opening: Mark all as read
            setUnreadCount(0);
            localStorage.setItem('tripify_last_read_time', Date.now().toString());
        }
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={handleToggle}
                className={`p-2 rounded-lg transition-colors relative ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <ActivityFeed
                        activities={activities}
                        setCurrentTripId={setCurrentTripId}
                        setCurrentView={setCurrentView}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
