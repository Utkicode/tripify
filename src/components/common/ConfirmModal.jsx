import React from'react';
import { motion, AnimatePresence } from'framer-motion';
import { Warning, Trash, X, Info } from'@phosphor-icons/react';
import { createPortal } from'react-dom';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel ="Delete", isDestructive = true }) => {
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
                        className="bg-white w-full max-w-sm rounded-2xl p-6 relative z-10 shadow-2xl overflow-hidden"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ?' text-[#1A1A1A]' :' text-[#1A1A1A]'}`}>
                            {isDestructive ? <Warning size={24} /> : <Info size={24} />}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3  hover: text-slate-700 font-bold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isDestructive
                                    ?'0 hover:bg-red-600 shadow-red-500/30'
                                    :'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    }`}
                            >
                                {isDestructive && <Trash size={18} />}
                                {confirmLabel}
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
