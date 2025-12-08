import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { sendEmailVerification, signOut, reload } from "firebase/auth";
import { auth } from '../firebase';
import { motion } from 'framer-motion';

const VerifyEmail = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(c => c - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0) return;
        setLoading(true);
        try {
            await sendEmailVerification(user);
            setMessage('Verification email sent! Please check your inbox.');
            setCooldown(60);
        } catch (error) {
            setMessage('Error sending email: ' + error.message);
        }
        setLoading(false);
    };

    const handleReload = async () => {
        setLoading(true);
        try {
            await user.reload();
            // App.jsx will automatically detect the change in user.emailVerified
            window.location.reload(); // Force hard reload to ensure state sync if needed
        } catch (error) {
            setMessage('Error checking status: ' + error.message);
        }
        setLoading(false);
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
                className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 rounded-3xl p-8 relative z-10 text-center"
            >
                <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <Mail size={32} />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify your Email</h1>
                <p className="text-slate-500 mb-6">
                    We've sent a verification email to <span className="font-semibold text-slate-700">{user.email}</span>.
                    Please verify your email to continue.
                </p>

                {message && (
                    <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleReload}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : 'I have verified my email'}
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || loading}
                        className="w-full py-3 px-4 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
                    </button>

                    <button
                        onClick={() => signOut(auth)}
                        className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center justify-center gap-1 mx-auto mt-4 transition-colors"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
