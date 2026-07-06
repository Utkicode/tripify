import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';
import { validateProfileData } from '../utils/validation.js';
import { logError } from '../utils/logger.js';

const COLLECTION_PATH = `artifacts/${appId}/users`;

export const profileService = {
    /**
     * Fetch user profile from Firestore
     * @param {string} uid 
     * @returns {Promise<Object|null>} Profile data or null
     */
    async getUserProfile(uid) {
        try {
            const docRef = doc(db, COLLECTION_PATH, uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            logError("Error fetching user profile:", error);
            throw error;
        }
    },

    /**
     * Create or overwrite user profile
     * @param {string} uid 
     * @param {Object} data 
     */
    async setUserProfile(uid, data) {
        const validation = validateProfileData(data);
        if (!validation.valid) throw new Error(validation.errors.join('; '));
        try {
            const docRef = doc(db, COLLECTION_PATH, uid);
            await setDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            logError("Error setting user profile:", error);
            throw error;
        }
    },

    /**
     * Update specific fields in user profile
     * @param {string} uid 
     * @param {Object} data 
     */
    async updateUserProfile(uid, data) {
        const validation = validateProfileData(data);
        if (!validation.valid) throw new Error(validation.errors.join('; '));
        try {
            const docRef = doc(db, COLLECTION_PATH, uid);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            logError("Error updating user profile:", error);
            throw error;
        }
    },

    /**
     * Ensure a profile exists for the user. Migrates basic auth data if needed.
     * @param {string} uid 
     * @param {Object} authUser Firebase Auth User object
     * @returns {Promise<Object>} The profile object
     */
    async ensureProfileExists(uid, authUser) {
        const existing = await this.getUserProfile(uid);
        if (existing) return existing;

        // Create default profile
        const newProfile = {
            identity: {
                displayName: authUser.displayName || '',
                email: authUser.email || '',
                phoneNumber: authUser.phoneNumber || '',
                bio: '',
                photoURL: authUser.photoURL || null
            },
            preferences: {
                travelPace: 'MODERATE', // 'RELAXED', 'MODERATE', 'PACKED'
                dayStartTime: '09:00',
                transportPreference: 'PUBLIC',
                dietaryRestrictions: []
            },
            behavior: {
                defaultCurrency: 'USD',
                defaultPaymentMode: 'CREDIT',
                dailyBudgetSoftLimit: 0,
                receiptAutoLink: true
            },
            metadata: {
                createdAt: Date.now(),
                version: 1,
                completenessScore: 0.3 // Base score for identity
            },
            // Legacy flat fields for backward compatibility (optional, but good for safety)
            displayName: authUser.displayName || '',
            isProfileComplete: false
        };

        await this.setUserProfile(uid, newProfile);
        return newProfile;
    }
};
