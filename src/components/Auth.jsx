import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from "firebase/auth";
import { auth } from '../firebase.js';
import SEO from './common/SEO';

const Auth = () => {
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
        if (pass.length > 5) score++;
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
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                // App.jsx will pick up the user state, check emailVerified (false), and show VerifyEmail
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <SEO
                title="TravelCFO - Trip Planner & Expense Tracker"
                description="TravelCFO is the smartest way to plan trips, track expenses, and manage travel budgets. Free, private, and secure."
                canonical="https://tripify-c49b6.web.app/"
            />
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[420px] bg-white rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50"
            >
                {/* Brand Logo Area */}
                <div className="flex flex-col items-center mb-10 gap-5">
                    {/* One UI 8 Squircle Icon */}
                    <div className="w-20 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-[1.6rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                        <span className="text-4xl font-black tracking-tighter">T</span>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-3xl tracking-tighter text-slate-900">
                                TravelCFO
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-black tracking-wider border border-blue-100">
                                BETA
                            </span>
                        </div>
                        <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                            Plan smarter. Spend in control.
                        </p>
                    </div>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        {isSignUp ? 'Start your journey with us today' : 'Enter your details to access your account'}
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
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">FULL NAME</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <User size={20} strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-slate-900 font-bold transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                                            placeholder="John Doe"
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">EMAIL</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-slate-900 font-bold transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">PASSWORD</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock size={20} strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-slate-900 font-bold transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-2 rounded-xl hover:bg-white transition-all"
                                    >
                                        {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                                    </button>
                                </div>
                                {isSignUp && password.length > 0 && (
                                    <div className="flex gap-2 mt-3 px-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${passStrength >= i
                                                    ? (passStrength < 3 ? 'bg-amber-400' : 'bg-emerald-500')
                                                    : 'bg-slate-100'
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
                            className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-3"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" /> {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg transition-all transform active:scale-[0.98] shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform stroke-[3px]" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-medium text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="ml-2 font-black text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            {isSignUp ? 'Log in' : 'Sign up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;