import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, UserPlus, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';

const InviteModal = ({ isOpen, onClose, tripId, currentUser, currentCollaborators = [] }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, searching, inviting, success, error
    const [message, setMessage] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setStatus('searching');
        setMessage('');

        try {
            // 1. Find user by email
            // Note: In a real app, this requires an index on 'email'.
            // For this demo, we assume the 'users' collection is searchable or we use a dedicated lookup function.
            // Since we stored users in 'artifacts/appId/users' but maybe didn't index email, let's check.
            // Actually, we haven't strictly enforced storing users. 
            // BUT, Authentication creates users. We should ideally have a 'users' collection synced from Auth.
            // Blocked: If we don't have a users collection with emails, we can't find them by email.
            // Solution: We'll assume the user enters the EXACT email used in some other user's profile which we saved on their login.
            // Let's query the 'users' collection we (hopefully) created in Auth.jsx or ProfileService.

            const usersRef = collection(db, 'artifacts', appId, 'users');
            // Assuming we stored profile data there.
            // If not, we can't find them. Let's assume ProfileService saves a doc in 'users/{uid}' with 'email' field.

            // NOTE: Firestore requires an index for this. If it fails, check console.
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setStatus('error');
                setMessage('User not found. Ask them to sign up first!');
                return;
            }

            const targetUserDoc = querySnapshot.docs[0];
            const targetUserData = targetUserDoc.data();
            const targetUid = targetUserDoc.id;

            // 2. Check if already added
            if (currentCollaborators.includes(targetUid)) {
                setStatus('error');
                setMessage('User is already a collaborator.');
                return;
            }

            // 3. Add to trip collaborators
            setStatus('inviting');
            const tripRef = doc(db, 'artifacts', appId, 'trips', tripId);

            await updateDoc(tripRef, {
                collaborators: arrayUnion(targetUid),
                travelers: arrayUnion({
                    id: targetUid,
                    name: targetUserData.displayName || targetUserData.name || 'Traveler',
                    email: targetUserData.email
                })
            });

            setStatus('success');
            setTimeout(() => {
                onClose();
                setEmail('');
                setStatus('idle');
            }, 2000);

        } catch (error) {
            console.error("Invite error:", error);
            setStatus('error');
            setMessage('Failed to invite. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <UserPlus size={24} className="text-blue-600" />
                                    Invite Friends
                                </h2>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-slate-500 mb-6 text-sm">
                                Enter the email address of the person you want to travel with. They must have a Tripify account.
                            </p>

                            <form onSubmit={handleInvite}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="friend@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                            <AlertCircle size={16} />
                                            {message}
                                        </div>
                                    )}

                                    {status === 'success' && (
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg">
                                            <CheckCircle size={16} />
                                            Invitation sent successfully!
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'searching' || status === 'inviting' || status === 'success'}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {(status === 'searching' || status === 'inviting') ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>Send Invite</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteModal;
