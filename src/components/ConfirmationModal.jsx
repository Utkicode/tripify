import React from'react';
import ReactDOM from'react-dom';
import { motion, AnimatePresence } from'framer-motion';
import { Warning, Trash, X, SpinnerGap } from'@phosphor-icons/react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title ="Are you sure?",
    message ="This action cannot be undone.",
    confirmText ="Delete",
    isLoading = false
}) => {
    if (typeof document ==='undefined') return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={!isLoading ? onClose : undefined}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full  text-[#1A1A1A] flex items-center justify-center mb-4">
                                <Warning size={24} />
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                            <p className="text-slate-500 text-sm mb-6">{message}</p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover: transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 py-2.5 rounded-xl 0 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <SpinnerGap size={18} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash size={18} />
                                            {confirmText}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmationModal;
