import React, { useState, useEffect } from'react';
import { EnvelopeSimple, LockKey, User, ArrowRight, Check, Eye, EyeSlash } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from"firebase/auth";
import { auth } from'../firebase.js';
import { logError } from '../utils/logger.js';
import { AUTH_ERROR_MESSAGES } from '../utils/validation.js';

const Auth = ({ isModal = false, onClose }) => {
    // Mode State
    const [isSignUp, setIsSignUp] = useState(false);

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passStrength, setPassStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // General State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkStrength = (pass) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        setPassStrength(score);
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (isSignUp) checkStrength(val);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isSignUp) {
                // Enforce minimum password strength before allowing signup
                if (password.length < 8) {
                    setError('Password must be at least 8 characters.');
                    setLoading(false);
                    return;
                }
                if (!/[A-Z]/.test(password)) {
                    setError('Password must contain at least one uppercase letter.');
                    setLoading(false);
                    return;
                }
                if (!/[0-9]/.test(password)) {
                    setError('Password must contain at least one number.');
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                // App.jsx will pick up the user state and handle redirect
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            logError(err);
            setError(AUTH_ERROR_MESSAGES[err.code] || 'Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    // If NOT modal, we use full screen. If modal, we fit content.
    const containerClasses = isModal
        ?"w-full bg-white rounded-xl p-8 md:p-10 relative z-10 shadow-2xl border border-[#E5E7EB]"
        :"w-full max-w-[420px] bg-white rounded-xl p-8 md:p-10 relative z-10 shadow-lg border border-[#E5E7EB]";

    const wrapperClasses = isModal
        ?"relative w-full"
        :"min-h-screen bg-[#FAFAF7] flex items-center justify-center p-6";

    return (
        <div className={wrapperClasses}>
            {/* SEO is now handled by LandingPage or App, so removed from here to avoid duplication if used as modal */}
            {/* {!isModal && <SEO ... />} - Removed as per plan to keep LandingPage as primary SEO entry */}

            {/* No decorative blobs — flat background only */}

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease:"easeOut" }}
                className={containerClasses}
            >
                {/* Close Button for Modal */}
                {isModal && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2  hover: rounded-full text-[#6B7280] transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}

                {/* Brand Logo Area */}
                <div className="flex flex-col items-center mb-10 gap-5">
                    {/* Flat dark square — no gradient */}
                    <div className="w-14 h-14 bg-[#1A1A1A] flex items-center justify-center text-white">
                        <span className="text-2xl font-black tracking-tighter">T</span>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-3xl tracking-tighter text-[#1A1A1A]">
                                TravelCFO
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider  text-[#6B7280] border border-[#E5E7EB]">
                                BETA
                            </span>
                        </div>
                        <p className="text-[#9CA3AF] font-medium text-xs">
                            Know what you owe. Split it fast.
                        </p>
                    </div>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-2">
                        {isSignUp ?'Create Account' :'Welcome Back'}
                    </h1>
                    <p className="text-[#6B7280] font-medium text-sm">
                        {isSignUp ?'Start your journey with us today' :'Enter your details to access your account'}
                    </p>
                </div>

                {/* Forms */}
                <form onSubmit={handleEmailAuth} className="space-y-6">

                    <AnimatePresence mode="popLayout">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                            key="auth-fields"
                        >
                            {isSignUp && (
                                <div>
                                    <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 pl-1">FULL NAME</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#374151] transition-colors">
                                            <User size={18} strokeWidth={2} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-[#E8A317]/20 focus:border-[#E8A317] text-[#1A1A1A] font-semibold transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                                            placeholder="Your full name"
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 pl-1">EMAIL</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#374151] transition-colors">
                                        <EnvelopeSimple size={18} strokeWidth={2} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-[#E8A317]/20 focus:border-[#E8A317] text-[#1A1A1A] font-semibold transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 pl-1">PASSWORD</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#374151] transition-colors">
                                        <LockKey size={18} strokeWidth={2} />
                                    </div>
                                    <input
                                        type={showPassword ?"text" :"password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-11 py-3.5 bg-[#F9FAFB] border border-[#E5E7EB] focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-[#E8A317]/20 focus:border-[#E8A317] text-[#1A1A1A] font-semibold transition-all outline-none placeholder:text-slate-300 placeholder:font-normal"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] p-1.5 transition-all"
                                    >
                                        {showPassword ? <EyeSlash size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                                    </button>
                                </div>
                                {isSignUp && password.length > 0 && (
                                    <div className="flex gap-1.5 mt-2.5">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${passStrength >= i
                                                    ? (passStrength < 3 ?'bg-[#E8A317]' :'bg-[#16A34A]')
                                                    :''
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl  text-[#1A1A1A] text-sm font-bold flex items-center gap-3"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" /> {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 bg-[#1A1A1A] hover:bg-black text-white rounded-lg font-bold text-base transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignUp ?'Create Account' :'Sign In'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[3px]" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 text-center">
                    <p className="text-[#6B7280] font-medium text-sm">
                        {isSignUp ?'Already have an account?' :"Don't have an account?"}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="ml-2 font-black text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                        >
                            {isSignUp ?'Log in' :'Sign up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;