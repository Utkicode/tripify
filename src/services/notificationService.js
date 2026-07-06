import { collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, updateDoc, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import { validateNotificationData } from '../utils/validation.js';
import { logError } from '../utils/logger.js';

// Send a notification to a specific user
export const sendNotification = async (toUserId, notificationData) => {
    try {
        const validation = validateNotificationData(notificationData);
        if (!validation.valid) throw new Error(validation.errors.join('; '));

        const notificationsRef = collection(db, 'artifacts', appId, 'users', toUserId, 'notifications');

        await addDoc(notificationsRef, {
            ...notificationData,
            timestamp: serverTimestamp(),
            read: false
        });

        return { success: true };
    } catch (error) {
        logError("Error sending notification:", error);
        return { success: false, error };
    }
};

// Subscribe to a user's notifications
export const subscribeToNotifications = (userId, callback) => {
    const notificationsRef = collection(db, 'artifacts', appId, 'users', userId, 'notifications');

    // Order by timestamp desc
    const q = query(
        notificationsRef,
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(notifications);
    }, (error) => {
        logError("Error subscribing to notifications:", error);
    });

    return unsubscribe;
};

// Mark a single notification as read
export const markAsRead = async (userId, notificationId) => {
    try {
        const notificationRef = doc(db, 'artifacts', appId, 'users', userId, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true
        });
    } catch (error) {
        logError("Error marking notification as read:", error);
    }
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
    try {
        const notificationsRef = collection(db, 'artifacts', appId, 'users', userId, 'notifications');
        const q = query(notificationsRef, where('read', '==', false));
        const snapshot = await getDocs(q);

        const CHUNK_SIZE = 400; // Stay under Firestore's 500 limit
        const unreadDocs = snapshot.docs;
        for (let i = 0; i < unreadDocs.length; i += CHUNK_SIZE) {
            const chunk = unreadDocs.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);
            chunk.forEach((doc) => batch.update(doc.ref, { read: true }));
            await batch.commit();
        }
    } catch (error) {
        logError("Error marking all as read:", error);
    }
};
