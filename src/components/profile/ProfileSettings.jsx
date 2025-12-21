import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, AlertCircle, Save, Loader, DollarSign, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../context/ProfileContext';

const CURRENCIES = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

const CONTENT_TYPES = [
    { value: 'CREDIT', label: 'Credit Card' },
    { value: 'DEBIT', label: 'Debit Card' },
    { value: 'CASH', label: 'Cash' },
];

const ProfileSettings = () => {
    const { profile, updateProfile } = useProfile();
    const [formData, setFormData] = useState({
        defaultCurrency: 'USD',
        defaultPaymentMode: 'CREDIT',
        dailyBudgetSoftLimit: 0,
        receiptAutoLink: true
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile?.behavior) {
            setFormData({
                defaultCurrency: profile.behavior.defaultCurrency || 'USD',
                defaultPaymentMode: profile.behavior.defaultPaymentMode || 'CREDIT',
                dailyBudgetSoftLimit: profile.behavior.dailyBudgetSoftLimit || 0,
                receiptAutoLink: profile.behavior.receiptAutoLink ?? true
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;

        // Handle number input
        const finalVal = (name === 'dailyBudgetSoftLimit') ? parseFloat(value) || 0 : value;

        setFormData({ ...formData, [name]: finalVal });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await updateProfile({
                behavior: {
                    ...profile.behavior,
                    ...formData
                }
            });
            setMessage('Settings saved!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Default Currency */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-500" /> Default Currency
                    </label>
                    <div className="relative">
                        <select
                            name="defaultCurrency"
                            value={formData.defaultCurrency}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none font-medium"
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 pl-1">New expense entries will default to this currency.</p>
                </div>

                {/* Default Payment Mode */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-500" /> Default Payment Method
                    </label>
                    <div className="flex gap-3">
                        {CONTENT_TYPES.map(type => (
                            <button
                                type="button"
                                key={type.value}
                                onClick={() => setFormData({ ...formData, defaultPaymentMode: type.value })}
                                className={`flex-1 py-3 px-2 rounded-xl border-2 font-bold text-sm transition-all ${formData.defaultPaymentMode === type.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Daily Budget Limit */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" /> Daily Soft Limit
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                name="dailyBudgetSoftLimit"
                                value={formData.dailyBudgetSoftLimit || ''}
                                onChange={handleChange}
                                placeholder="0 (No limit)"
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                            />
                        </div>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">/ day</span>
                    </div>
                    <p className="text-xs text-slate-400 pl-1">We'll warn you if your daily average exceeds this amount.</p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.receiptAutoLink ? 'bg-blue-500' : 'bg-slate-200'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.receiptAutoLink ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <input
                            type="checkbox"
                            name="receiptAutoLink"
                            checked={formData.receiptAutoLink}
                            onChange={handleChange}
                            className="hidden"
                        />
                        <div>
                            <span className="block text-sm font-bold text-slate-800">Auto-Link Receipts</span>
                            <span className="block text-xs text-slate-500">Automatically try to match uploaded files to expenses.</span>
                        </div>
                    </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {message && (
                        <span className={`text-sm font-bold ${message.includes('Failed') ? 'text-red-500' : 'text-emerald-500'}`}>
                            {message}
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                        {saving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Settings</>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfileSettings;
