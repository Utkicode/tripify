import React from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Warning, Trash, Info, SpinnerGap } from'@phosphor-icons/react';
import { createPortal } from'react-dom';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel ="Delete",
    cancelLabel ="Cancel",
    isDestructive = true,
    isLoading = false,
    errorMessage =''
}) => {
    if (typeof document ==='undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ?'bg-red-50 text-red-600' :'bg-orange-50 text-[#FF6B35]'}`}>
                            {isDestructive ? <Warning size={24} /> : <Info size={24} />}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            {message}
                        </p>
                        {errorMessage && (
                            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-60"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isDestructive
                                    ?'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                    :'bg-[#FF6B35] hover:bg-[#E8553D] shadow-orange-500/30'
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? (
                                    <>
                                        <SpinnerGap size={18} className="animate-spin" />
                                        Working...
                                    </>
                                ) : (
                                    <>
                                        {isDestructive && <Trash size={18} />}
                                        {confirmLabel}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmModal;
