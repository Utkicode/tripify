import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, AlertCircle, Save, Loader, DollarSign, FileText, Bell, Download, UserMinus, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '../../context/ProfileContext';
import { generatePDFReport } from '../../utils/exportUtils';
import { auth } from '../../firebase';
import { deleteUser } from 'firebase/auth';

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
    const { profile, updateProfile, user } = useProfile();
    const [formData, setFormData] = useState({
        defaultCurrency: 'USD',
        defaultPaymentMode: 'CREDIT',
        dailyBudgetSoftLimit: 0,
        receiptAutoLink: true,
        notifications: {
            email: true,
            push: true
        }
    });
    const [saving, setSaving] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile?.behavior) {
            setFormData(prev => ({
                ...prev,
                defaultCurrency: profile.behavior.defaultCurrency || 'USD',
                defaultPaymentMode: profile.behavior.defaultPaymentMode || 'CREDIT',
                dailyBudgetSoftLimit: profile.behavior.dailyBudgetSoftLimit || 0,
                receiptAutoLink: profile.behavior.receiptAutoLink ?? true,
                notifications: profile.behavior.notifications || { email: true, push: true }
            }));
        }
    }, [profile]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;

        if (name.startsWith('notify_')) {
            const key = name.replace('notify_', '');
            setFormData({
                ...formData,
                notifications: {
                    ...formData.notifications,
                    [key]: value
                }
            });
            return;
        }

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

    const handleExport = async () => {
        setExportLoading(true);
        try {
            await generatePDFReport(user, profile);
            setMessage('Report generated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to generate report.');
            console.error(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you ABSOLUTELY sure? This will delete your account and all data. This action cannot be undone.")) {
            alert("For safety in this demo, account deletion is simulated. In production, this would wipe your data.");
            // Actual delete logic:
            // await deleteUser(auth.currentUser);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            <form onSubmit={handleSubmit} className="space-y-10">

                {/* Section: Financial Preferences */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Financial Preferences</h3>

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
                    </div>
                </div>

                {/* Section: Notifications */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Notifications</h3>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><Bell size={18} /></div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Push Notifications</span>
                                    <span className="block text-xs text-slate-400">Receive alerts about trip updates.</span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="notify_push"
                                checked={formData.notifications?.push ?? true}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                        <div className="w-full h-px bg-slate-200" />
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-purple-500 shadow-sm"><AlertCircle size={18} /></div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-700">Email Alerts</span>
                                    <span className="block text-xs text-slate-400">Get summaries and security alerts via email.</span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                name="notify_email"
                                checked={formData.notifications?.email ?? true}
                                onChange={handleChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Section: Automation */}
                <div className="space-y-6">
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

                {/* Save Logic */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t-0 shadow-lg md:shadow-none md:relative md:bg-transparent md:p-0 md:border-t">
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

            {/* Section: Account Management */}
            <div className="pt-10 border-t-2 border-slate-100 space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Account Management</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Download size={24} />
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">Export Data</h4>
                        <p className="text-xs text-slate-500 mb-4">Download a PDF report of all your trips and expenses.</p>
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exportLoading}
                            className="w-full py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                        >
                            {exportLoading ? 'Generating...' : 'Download Report'}
                        </button>
                    </div>

                    <div className="p-4 rounded-2xl border border-red-100 bg-red-50/50 hover:bg-red-50 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-100 text-red-500 rounded-xl group-hover:bg-red-200 transition-colors">
                                <UserMinus size={24} />
                            </div>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">Delete Account</h4>
                        <p className="text-xs text-slate-500 mb-4">Permanently remove your account and all associated data.</p>
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="w-full py-2 bg-white border-2 border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
export default ProfileSettings;
