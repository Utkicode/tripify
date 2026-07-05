import React, { useState } from'react';
import { X, Check, SpinnerGap } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';
import { collection, addDoc } from"firebase/firestore";
import { db } from'../firebase';
import { appId } from'../constants';

const FeedbackModal = ({ isOpen, onClose, user }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Save Feedback Doc
            await addDoc(collection(db,'feedback'), {
                appId: appId,
                title,
                description,
                userEmail: user?.email ||'anonymous',
                userId: user?.uid ||'anonymous',
                timestamp: Date.now(),
                status:'new',
                userAgent: navigator.userAgent
            });

            setIsSuccess(true);

            // Reset form after delay
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setTitle('');
                setDescription('');
            }, 3000);

        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to send feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
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
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type:"spring", duration: 0.5, bounce: 0.3 }}
                        className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/20 w-full max-w-lg overflow-hidden border border-white/50"
                    >
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 pointer-events-none" />

                        {isSuccess ? (
                            <div className="p-12 text-center relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type:"spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-emerald-500/30"
                                >
                                    <Check size={40} strokeWidth={3} />
                                </motion.div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Thanks for helping us!</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">Your feedback has been sent to the team.<br />We're building TravelCFO together. 🚀</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 md:p-8 pb-0 relative z-10">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Feedback & Bugs</h3>
                                            <p className="text-slate-500 font-medium text-sm">Help us improve your experience</p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover: rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 relative z-10">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Found a bug in..."
                                            className="w-full px-5 py-4 rounded-2xl  border-2 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Details</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Tell us what happened..."
                                            className="w-full px-5 py-4 rounded-2xl  border-2 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-400 leading-relaxed"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                    >
                                        {isSubmitting ? (
                                            <SpinnerGap className="animate-spin text-white/80" size={20} />
                                        ) : (
                                            <>Send Feedback</>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
