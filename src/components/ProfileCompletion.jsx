import React, { useState } from'react';
import { User, TextAlignLeft, Phone, ArrowRight, FloppyDisk } from'@phosphor-icons/react';
import { motion } from'framer-motion';
import { doc, setDoc, getDoc } from"firebase/firestore";
import { updateProfile } from"firebase/auth";
import { db } from'../firebase';
import { appId } from'../constants'; // Using the appId from constants

const ProfileCompletion = ({ user, onComplete }) => {
    const [name, setName] = useState(user.displayName ||'');
    const [bio, setBio] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ||''); // Pre-fill if phone auth used
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Update Auth Profile (if name changed)
            if (name !== user.displayName) {
                await updateProfile(user, { displayName: name });
            }

            // 2. Save complete profile to Firestore
            // We use the'users' collection scoped by appId if needed, or global.
            // Based on previous code: collection(db,'artifacts', appId,'users', user.uid,'trips')
            // It seems user data might be better at a higher level or within artifacts?
            // Let's store user profile at `artifacts/{appId}/users/{uid}` directly.

            const userRef = doc(db,'artifacts', appId,'users', user.uid);

            // Check if it exists to preserve creation date if needed (or just merge)
            // But we are"completing" it now.

            await setDoc(userRef, {
                displayName: name,
                bio: bio,
                phoneNumber: phoneNumber,
                email: user.email,
                isProfileComplete: true,
                updatedAt: Date.now(),
                photoURL: user.photoURL || null
            }, { merge: true });

            onComplete(); // Call parent to update state
        } catch (err) {
            console.error("Profile Error:", err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen  flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 rounded-3xl p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl  mb-4">
                        <User size={32} className="text-slate-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
                    <p className="text-slate-500">Tell us a bit more about yourself to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <User size={16} /> Full Name <span className="text-[#1A1A1A]">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Phone size={16} /> Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none"
                            placeholder="+1 234 567 8900"
                        />
                        <p className="text-xs text-slate-400">Optional, used for trip coordination.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <TextAlignLeft size={16} /> Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none min-h-[100px] resize-none"
                            placeholder="I love hiking and exploring new cities..."
                        />
                    </div>

                    {error && (
                        <div className="p-3  text-[#1A1A1A] text-sm rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Complete Setup <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileCompletion;
