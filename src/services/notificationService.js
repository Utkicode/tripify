import { collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, updateDoc, doc, writeBatch, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';

// Send a notification to a specific user
export const sendNotification = async (toUserId, notificationData) => {
    try {
        const notificationsRef = collection(db, 'artifacts', appId, 'users', toUserId, 'notifications');

        await addDoc(notificationsRef, {
            ...notificationData,
            timestamp: serverTimestamp(),
            read: false
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending notification:", error);
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
        console.error("Error subscribing to notifications:", error);
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
        console.error("Error marking notification as read:", error);
    }
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
    try {
        const notificationsRef = collection(db, 'artifacts', appId, 'users', userId, 'notifications');
        const q = query(notificationsRef, where('read', '==', false));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error marking all as read:", error);
    }
};
