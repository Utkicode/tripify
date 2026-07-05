import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { X, EnvelopeSimple, UserPlus, CheckCircle, MagnifyingGlass, WarningCircle } from'@phosphor-icons/react';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from"firebase/firestore";
import { db } from'../firebase';
import { appId } from'../constants';
import { sendNotification } from'../services/notificationService';

const InviteModal = ({ isOpen, onClose, tripId, tripName, currentUser, currentCollaborators = [] }) => {
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
            const usersRef = collection(db,'artifacts', appId,'users');
            const q = query(usersRef, where('email','==', email));
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
            const tripRef = doc(db,'artifacts', appId,'trips', tripId);

            await updateDoc(tripRef, {
                collaborators: arrayUnion(targetUid),
                travelers: arrayUnion({
                    id: targetUid,
                    name: targetUserData.displayName || targetUserData.name ||'Traveler',
                    email: targetUserData.email
                })
            });

            // 4. Send Notification
            await sendNotification(targetUid, {
                type:'trip_invite',
                tripId,
                tripName: tripName ||'Unknown Trip',
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email ||'Someone',
                message: `${currentUser.displayName ||'Someone'} invited you to join"${tripName ||'a trip'}"`,
                link: `/trip/${tripId}`
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type:"spring", damping: 25, stiffness: 300 }}
                        className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/40 w-full max-w-md overflow-hidden relative z-10 border border-white/50"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-1">
                                        <UserPlus size={24} className="text-[#1A1A1A]" />
                                        Invite Friends
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">Trip planning is better together.</p>
                                </div>
                                <button onClick={onClose} className="p-2  hover: rounded-full text-slate-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleInvite} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1A1A1A] transition-colors">
                                            <EnvelopeSimple size={20} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4  border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-slate-900 font-bold transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                                            placeholder="friend@example.com"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 pl-1 font-medium">Make sure they have a TravelCFO account.</p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {status ==='error' && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-[#1A1A1A] text-sm font-bold  p-4 rounded-2xl border border-red-100">
                                            <WarningCircle size={20} className="shrink-0" />
                                            {message}
                                        </motion.div>
                                    )}

                                    {status ==='success' && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-[#1A1A1A] text-sm font-bold  p-4 rounded-2xl border border-emerald-100">
                                            <CheckCircle size={20} className="shrink-0" />
                                            Invitation sent successfully!
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={status ==='searching' || status ==='inviting' || status ==='success'}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {(status ==='searching' || status ==='inviting') ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            sending...
                                        </>
                                    ) : (
                                        <>Send Invite <UserPlus size={20} strokeWidth={2.5} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteModal;
