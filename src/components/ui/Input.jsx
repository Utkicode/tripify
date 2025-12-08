import React, { useState } from 'react';

const Input = ({ label, icon: Icon, className = '', error, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors ${isFocused ? 'text-blue-600' : 'text-slate-500'}`}>
                    {label}
                </label>
            )}
            <div className={`relative group transition-all duration-200 ${isFocused ? 'transform -translate-y-[1px]' : ''}`}>
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    {...props}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus && props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur && props.onBlur(e);
                    }}
                    className={`
            w-full bg-white text-slate-900 placeholder-slate-400
            border-2 rounded-xl py-3
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            text-sm font-medium
            transition-all duration-200 ease-in-out
            outline-none
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                            : isFocused
                                ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
                                : 'border-slate-200 hover:border-slate-300'
                        }
          `}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default Input;
