import React, { useState, useEffect } from'react';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from"firebase/auth";
import { auth } from'../firebase';
import { CheckCircle, XCircle, SpinnerGap, LockKey, ArrowRight } from'@phosphor-icons/react';
import { logError } from '../utils/logger.js';
import { AUTH_ERROR_MESSAGES } from '../utils/validation.js';

export default function AuthActionHandler({ onComplete }) {
    // We can't use react-router hooks if this component is rendered conditionally OUTSIDE the router in App.jsx. 
    // App.jsx structure shows Conditional Rendering based on state, no top-level Router provider visible in App.jsx itself (likely wrapped in main.jsx).
    // However, since we are planning to render this conditionally in App.jsx *before* other views, we should just parse window.location.

    const [mode, setMode] = useState(null);
    const [actionCode, setActionCode] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, success, error, input-password (for reset)
    const [message, setMessage] = useState('Processing your request...');
    const [newPassword, setNewPassword] = useState('');

    // For password reset
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Parse query params manually since we might be outside Router context or just simplifying
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get('mode');
        const oobCodeParam = params.get('oobCode');

        if (!modeParam || !oobCodeParam) {
            setStatus('error');
            setMessage('Invalid link. Missing parameters.');
            return;
        }

        setMode(modeParam);
        setActionCode(oobCodeParam);

        if (modeParam ==='verifyEmail') {
            handleVerifyEmail(oobCodeParam);
        } else if (modeParam ==='resetPassword') {
            handleVerifyResetCode(oobCodeParam);
        } else {
            setStatus('error');
            setMessage('Unknown action mode.');
        }
    }, []);

    const handleVerifyEmail = async (code) => {
        try {
            await applyActionCode(auth, code);
            setStatus('success');
            setMessage('Your email has been verified successfully! You can now access all features.');
        } catch (error) {
            console.error("Email verification error:", error);
            setStatus('error');
            setMessage(getErrorMessage(error));
        }
    };

    const handleVerifyResetCode = async (code) => {
        try {
            const email = await verifyPasswordResetCode(auth, code);
            setEmail(email);
            setStatus('input-password');
            setMessage('');
        } catch (error) {
            console.error("Reset code error:", error);
            setStatus('error');
            setMessage(getErrorMessage(error));
        }
    };

    const handlePasswordResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!newPassword) return;

        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            setError('Password must be at least 8 characters with an uppercase letter and a number.');
            return;
        }

        setStatus('loading');
        try {
            await confirmPasswordReset(auth, actionCode, newPassword);
            setStatus('success');
            setMessage('Your password has been reset successfully. You can now login with your new password.');
        } catch (error) {
            logError("Password reset error:", error);
            setStatus('error');
            setMessage(getErrorMessage(error));
        }
    };

    const getErrorMessage = (error) => {
        if (error.code ==='auth/expired-action-code') {
            return'The link has expired. Please request a new one.';
        }
        if (error.code ==='auth/invalid-action-code') {
            return'The link is invalid. It may have specifically been used already.';
        }
        return AUTH_ERROR_MESSAGES[error.code] || error.message || 'An error occurred.';
    };

    const handleContinue = () => {
        // Clear query params and reload/render app
        window.history.replaceState({}, document.title, window.location.pathname);
        if (onComplete) {
            onComplete();
        } else {
            window.location.reload();
        }
    };

    if (status ==='loading') {
        return (
            <div className="min-h-screen  flex flex-col items-center justify-center p-4">
                <SpinnerGap className="animate-spin text-[#1A1A1A] mb-4" size={48} />
                <h2 className="text-xl font-semibold text-slate-700">{message}</h2>
            </div>
        );
    }

    if (status ==='input-password') {
        return (
            <div className="min-h-screen  flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4 text-[#1A1A1A]">
                            <LockKey size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
                        <p className="text-slate-500 mt-2">Enter a new password for {email}</p>
                    </div>

                    <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 mb-4 rounded-xl text-red-600 bg-red-50 text-sm font-semibold text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                {status ==='success' ? (
                    <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4 text-[#1A1A1A]">
                        <CheckCircle size={32} />
                    </div>
                ) : (
                    <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4 text-[#1A1A1A]">
                        <XCircle size={32} />
                    </div>
                )}

                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    {status ==='success' ?'Success!' :'Something went wrong'}
                </h2>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={handleContinue}
                    className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${status ==='success'
                        ?'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                        :' text-slate-700 hover:bg-slate-300'
                        }`}
                >
                    {status ==='success' ? (mode ==='resetPassword' ?'Go to Login' :'Continue to TravelCFO') :'Back to Home'}
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
