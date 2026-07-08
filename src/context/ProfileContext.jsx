import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { profileService } from '../services/profileService';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Auth user
    const [profile, setProfile] = useState(null); // Firestore profile data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Calculate completeness score (0.0 - 1.0)
    const calculateCompleteness = (p) => {
        if (!p) return 0;
        let score = 0;
        let checks = 0;

        // Identity (30%)
        if (p.identity?.displayName) score += 0.15;
        if (p.identity?.email) score += 0.15;

        // preferences (30%)
        if (p.preferences?.travelPace) score += 0.1;
        if (p.preferences?.dayStartTime) score += 0.1;
        if (p.preferences?.transportPreference) score += 0.1;

        // Behavior (20%)
        if (p.behavior?.defaultCurrency) score += 0.1;
        if (p.behavior?.dailyBudgetSoftLimit > 0) score += 0.1;

        // Personalization (20%)
        if (p.identity?.bio && p.identity.bio.length > 10) score += 0.1;
        if (p.identity?.photoURL) score += 0.1;

        return Math.min(1.0, parseFloat(score.toFixed(2)));
    };

    const refreshProfile = async (uid) => {
        try {
            setLoading(true);
            const data = await profileService.getUserProfile(uid);
            setProfile(data);
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        try {
            // Optimistic update
            setProfile(prev => ({ ...prev, ...updates }));

            // Persist
            await profileService.updateUserProfile(user.uid, updates);

            // Re-fetch to confirm and recalc score/metadata if backend does triggered updates
            // For now, client-side recalc of score might be needed or just simple merge
            const newScore = calculateCompleteness({ ...profile, ...updates });
            if (newScore !== profile?.metadata?.completenessScore) {
                await profileService.updateUserProfile(user.uid, {
                    'metadata.completenessScore': newScore
                });
                setProfile(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, completenessScore: newScore }
                }));
            }

        } catch (err) {
            console.error("Failed to update profile", err);
            setError(err);
            // Revert on error? For now just log.
            refreshProfile(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    // Ensure profile exists (migration/init)
                    let userProfile = await profileService.ensureProfileExists(currentUser.uid, currentUser);

                    // --- Auto-Heal Legacy Profiles (Missing Score or Structure) ---
                    if (userProfile && (userProfile.metadata?.completenessScore === undefined || !userProfile.identity)) {
                        console.log("Legacy profile detected. Auto-migrating structure & score...");

                        // 1. Structure Migration (Flat -> Nested)
                        const migratedProfile = { ...userProfile };

                        // Ensure sections exist
                        if (!migratedProfile.identity) migratedProfile.identity = {};
                        if (!migratedProfile.preferences) migratedProfile.preferences = {};
                        if (!migratedProfile.behavior) migratedProfile.behavior = {};
                        if (!migratedProfile.metadata) migratedProfile.metadata = {};

                        // Move flat fields if they exist and target is empty
                        if (migratedProfile.displayName && !migratedProfile.identity.displayName) {
                            migratedProfile.identity.displayName = migratedProfile.displayName;
                        }
                        if (migratedProfile.email && !migratedProfile.identity.email) {
                            migratedProfile.identity.email = migratedProfile.email;
                        }
                        if (migratedProfile.photoURL && !migratedProfile.identity.photoURL) {
                            migratedProfile.identity.photoURL = migratedProfile.photoURL;
                        }
                        // Default preferences for legacy
                        if (!migratedProfile.preferences.travelPace) migratedProfile.preferences.travelPace = 'MODERATE';
                        if (!migratedProfile.behavior.defaultCurrency) migratedProfile.behavior.defaultCurrency = 'INR';

                        // 2. Calculate New Score
                        const score = calculateCompleteness(migratedProfile);
                        migratedProfile.metadata.completenessScore = score;

                        // 3. Update local object immediately to unblock UI
                        userProfile = migratedProfile;

                        // 4. Persist to Firestore in background
                        // We set the whole object to ensure structure is saved, not just score
                        profileService.setUserProfile(currentUser.uid, migratedProfile)
                            .catch(e => console.error("Failed to persist legacy migration:", e));
                    }

                    setProfile(userProfile);
                } catch (err) {
                    console.error("Profile init error:", err);
                    setError(err);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        isProfileComplete: profile?.metadata?.completenessScore > 0.3 || profile?.isProfileComplete // Backwards compat
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
