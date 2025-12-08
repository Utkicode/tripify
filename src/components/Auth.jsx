import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Phone, Check, Smartphone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    sendEmailVerification
} from "firebase/auth";
import { auth } from '../firebase.js';

const Auth = () => {
    // Mode State
    const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
    const [isSignUp, setIsSignUp] = useState(false);

    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [passStrength, setPassStrength] = useState(0);

    // Phone State
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState(null);
    const [phoneStep, setPhoneStep] = useState('input'); // 'input' or 'otp'
    const [countryCode, setCountryCode] = useState('+91'); // Default to India or generic

    // General State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Cleanup recaptcha if component unmounts
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        }
    }, []);

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

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setError('Recaptcha expired. Please try again.');
                }
            });
        }
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

    const handlePhoneAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (phoneStep === 'input') {
            // Send OTP
            try {
                setupRecaptcha();
                const appVerifier = window.recaptchaVerifier;
                const formatPh = `${countryCode}${phoneNumber.replace(/\D/g, '')}`; // Basic formatting

                const confirmationResult = await signInWithPhoneNumber(auth, formatPh, appVerifier);
                window.confirmationResult = confirmationResult;
                setVerificationId(confirmationResult.verificationId);
                setPhoneStep('otp');
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message.replace('Firebase: ', ''));
                setLoading(false);
                if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
            }
        } else {
            // Verify OTP
            try {
                await window.confirmationResult.confirm(otp);
                // Success - auth state listener in App.jsx takes over
            } catch (err) {
                console.error(err);
                setError('Invalid OTP. Please try again.');
                setLoading(false);
            }
        }
    };

    const toggleAuthMode = (mode) => {
        setAuthMethod(mode);
        setError('');
        setPhoneStep('input');
        setVerificationId(null);
        setOtp('');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 rounded-3xl p-8 relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mb-6 shadow-inner">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                            T
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {isSignUp ? 'Start your journey with Tripify' : 'Enter your details to access your account'}
                    </p>
                </div>

                {/* Method Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6 select-none relative">
                    <motion.div
                        layoutId="activeTab"
                        className="absolute bg-white shadow-sm border border-black/5 rounded-lg h-[calc(100%-8px)] top-1"
                        style={{
                            width: 'calc(50% - 4px)',
                            left: authMethod === 'email' ? '4px' : 'calc(50%)'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                    <button
                        onClick={() => toggleAuthMode('email')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold relative z-10 transition-colors ${authMethod === 'email' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-600'}`}
                    >
                        <Mail size={16} /> Email
                    </button>
                    <button
                        onClick={() => toggleAuthMode('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold relative z-10 transition-colors ${authMethod === 'phone' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-600'}`}
                    >
                        <Smartphone size={16} /> Phone
                    </button>
                </div>

                {/* Forms */}
                <form onSubmit={authMethod === 'email' ? handleEmailAuth : handlePhoneAuth} className="space-y-5">

                    {/* --- EMAIL FORM --- */}
                    {authMethod === 'email' && (
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                                key="email-form"
                            >
                                {isSignUp && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                                                placeholder="John Doe"
                                                required={isSignUp}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    {isSignUp && password.length > 0 && (
                                        <div className="flex gap-1.5 mt-2 ml-1 h-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-full flex-1 rounded-full transition-all duration-300 ${passStrength >= i
                                                        ? (passStrength < 3 ? 'bg-amber-400' : 'bg-emerald-500')
                                                        : 'bg-slate-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* --- PHONE FORM --- */}
                    {authMethod === 'phone' && (
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5"
                                key="phone-form"
                            >
                                {phoneStep === 'input' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={countryCode}
                                                onChange={e => setCountryCode(e.target.value)}
                                                className="w-20 pl-3 pr-1 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700 text-center"
                                            />
                                            <div className="relative group flex-1">
                                                <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700"
                                                    placeholder="9876543210"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div id="recaptcha-container"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">OTP Code</label>
                                        <div className="relative group">
                                            <MessageSquare className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700 tracking-widest text-lg"
                                                placeholder="123456"
                                                required
                                                maxLength={6}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setPhoneStep('input'); setOtp(''); }}
                                            className="text-xs text-blue-600 font-bold hover:underline ml-1"
                                        >
                                            Change Number
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-center transition-all transform active:scale-[0.98] shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {authMethod === 'email'
                                    ? (isSignUp ? 'Create Account' : 'Sign In')
                                    : (phoneStep === 'input' ? 'Send OTP' : 'Verify & Sign In')
                                }
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Toggle (Only for Email) */}
                {authMethod === 'email' && (
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                className="ml-2 font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {isSignUp ? 'Log in' : 'Sign up'}
                            </button>
                        </p>
                    </div>
                )}
                {authMethod === 'phone' && (
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-xs">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Auth;