import React, { useState } from 'react';
import { X, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase';
import { appId } from '../constants';

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
            await addDoc(collection(db, 'feedback'), {
                appId: appId,
                title,
                description,
                userEmail: user?.email || 'anonymous',
                userId: user?.uid || 'anonymous',
                timestamp: Date.now(),
                status: 'new',
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                {isSuccess ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                        <p className="text-slate-500">Your feedback has been sent. We appreciate your help in making Tripify better.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Report a Bug / Feedback</h3>
                            <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Brief summary of the issue..."
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe what happened..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? <Loader className="animate-spin" size={20} /> : 'Submit Feedback'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default FeedbackModal;
