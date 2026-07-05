import React, { useState, useRef, useEffect } from'react';
import { CaretDown, Check } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';

const CustomSelect = ({ label, icon: Icon, value, onChange, options = [], className ='', placeholder ="Select...", error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-500">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full bg-white text-slate-900 
          border-2 rounded-xl py-3
          ${Icon ?'pl-10' :'pl-4'} pr-10
          text-sm font-medium
          transition-all duration-200 ease-in-out
          outline-none cursor-pointer relative
          flex items-center
          ${error
                        ?'border-red-300'
                        : isOpen
                            ?'border-blue-500 ring-4 ring-blue-500/10'
                            :'border-slate-200 hover:border-slate-300'
                    }
        `}
            >
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isOpen ?'text-[#1A1A1A]' :'text-slate-400'}`}>
                        <Icon size={18} />
                    </div>
                )}

                {selectedOption ? (
                    <div className="flex items-center gap-2">
                        {selectedOption.icon && <selectedOption.icon size={16} className="text-slate-500" style={{ color: selectedOption.color }} />}
                        <span className="truncate">{selectedOption.label}</span>
                    </div>
                ) : (
                    <span className="text-slate-400">{placeholder}</span>
                )}

                <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isOpen ?'rotate-180 text-[#1A1A1A]' :'text-slate-400'}`}>
                    <CaretDown size={16} strokeWidth={3} />
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-[#1A1A1A]">{error}</p>}

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-4 py-2  border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Select your category
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange({ target: { value: opt.value } });
                                        setIsOpen(false);
                                    }}
                                    className={`
                                px-4 py-3 cursor-pointer flex items-center justify-between group transition-colors
                                ${value === opt.value ?' text-[#1A1A1A]' :'text-slate-700 hover:'}
                            `}
                                >
                                    <div className="flex items-center gap-3">
                                        {opt.icon && (
                                            <div className={`p-1.5 rounded-md ${value === opt.value ?'' :' group-hover:bg-white'} transition-colors`}>
                                                <opt.icon size={16} style={{ color: opt.color }} />
                                            </div>
                                        )}
                                        <span className="font-medium">{opt.label}</span>
                                    </div>
                                    {value === opt.value && <Check size={16} className="text-[#1A1A1A]" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
