import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import ActivityFeed from './ActivityFeed';
import { AnimatePresence } from 'framer-motion';

const NotificationBell = ({ user, tripId, setCurrentTripId, setCurrentView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
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

        const collectionPath = tripId
            ? collection(db, 'artifacts', appId, 'users', user.uid, 'trips', tripId, 'activities')
            : collection(db, 'artifacts', appId, 'users', user.uid, 'notifications');

        const q = query(
            collectionPath,
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(newActivities);

            // Simple logic: if we have activities and local storage says last read is old, show badge.
            // For now, just show badge if there are any activities and we haven't opened yet.
            if (newActivities.length > 0 && !isOpen) {
                // In a real app we'd track 'lastReadTimestamp' in user profile
                // setHasUnread(true); 
            }
        });

        return () => unsubscribe();
    }, [user, tripId]);

    const handleToggle = () => {
        console.log("Toggling notification bell. Current state:", isOpen);
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={handleToggle}
                className={`p-2 rounded-lg transition-colors relative ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
                <Bell size={20} />
                {hasUnread && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
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
