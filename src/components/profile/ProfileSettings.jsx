import React, { useState, useEffect } from'react';
import { CreditCard, Wallet, WarningCircle, FloppyDisk, SpinnerGap, CurrencyDollar, FileText, Bell, Download, UserMinus, ShieldWarning } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';
import { useProfile } from'../../context/ProfileContext';
import { generateExpenseReport } from'../../utils/pdfGenerator'; // Use new generator
import { logError } from '../../utils/logger.js';
import { db } from'../../firebase'; // Need db for fetching trips
import { collection, query, where, getDocs } from'firebase/firestore'; // Firestore imports
import { appId } from'../../constants';
import { useConfirm } from'../../context/ConfirmContext';

const CURRENCIES = [
    { value:'INR', label:'INR - Indian Rupee' },
];

const CONTENT_TYPES = [
    { value:'CREDIT', label:'Credit Card' },
    { value:'DEBIT', label:'Debit Card' },
    { value:'CASH', label:'Cash' },
];

const ProfileSettings = () => {
    const { profile, updateProfile, user } = useProfile();
    const confirm = useConfirm();
    const [formData, setFormData] = useState({
        defaultCurrency:'INR',
        defaultPaymentMode:'CREDIT',
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
                defaultCurrency: profile.behavior.defaultCurrency ||'INR',
                defaultPaymentMode: profile.behavior.defaultPaymentMode ||'CREDIT',
                dailyBudgetSoftLimit: profile.behavior.dailyBudgetSoftLimit || 0,
                receiptAutoLink: profile.behavior.receiptAutoLink ?? true,
                notifications: profile.behavior.notifications || { email: true, push: true }
            }));
        }
    }, [profile]);

    const handleChange = (e) => {
        const value = e.target.type ==='checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;

        if (name.startsWith('notify_')) {
            const key = name.replace('notify_','');
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
        const finalVal = (name ==='dailyBudgetSoftLimit') ? parseFloat(value) || 0 : value;

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
            // 1. Fetch User's Trips (Metadata Only)
            // We need this list to pass to the generator, which then fetches details.
            const tripsQuery = query(
                collection(db,'artifacts', appId,'trips'),
                where('collaborators','array-contains', user.uid)
            );
            const snapshot = await getDocs(tripsQuery);
            const tripsList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. Generate Report
            await generateExpenseReport(user, profile, tripsList, profile?.behavior?.defaultCurrency);

            setMessage('Report generated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to generate report.');
            logError(error);
        } finally {
            setExportLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        setMessage('For safety in this demo, account deletion is simulated. In production, this would wipe your data.');
        setTimeout(() => setMessage(''), 5000);
        // Actual delete logic:
        // await deleteUser(auth.currentUser);
    };

    const confirmDeleteAccount = () => {
        confirm({
            title: 'Delete Account?',
            message: 'Are you ABSOLUTELY sure? This will delete your account and all data. This action cannot be undone.',
            confirmLabel: 'Yes, Delete My Account',
            isDestructive: true,
            onConfirm: handleDeleteAccount
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">App Settings</h2>
                    <p className="text-slate-500 mt-1">Manage notifications, currency, and data.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 group"
                >
                    {saving ? <SpinnerGap className="animate-spin" size={18} /> : <><FloppyDisk size={18} /> Save Settings</>}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">

                {/* Section: Financial */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2  text-[#1A1A1A] rounded-lg">
                            <CurrencyDollar size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Financial Preferences</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Currency Card */}
                        <div className="p-6 rounded-2xl border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-3">Default Currency</label>
                            <div className="relative">
                                <select
                                    name="defaultCurrency"
                                    value={formData.defaultCurrency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 transition-all font-bold text-slate-800 outline-none appearance-none"
                                >
                                    {CURRENCIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>

                        {/* Budget Card */}
                        <div className="p-6 rounded-2xl border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-3">Daily Soft Limit</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    name="dailyBudgetSoftLimit"
                                    value={formData.dailyBudgetSoftLimit ||''}
                                    onChange={handleChange}
                                    placeholder="No limit"
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="p-6 rounded-2xl border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-4">Default Payment Method</label>
                        <div className="flex gap-4">
                            {CONTENT_TYPES.map(type => (
                                <button
                                    type="button"
                                    key={type.value}
                                    onClick={() => setFormData({ ...formData, defaultPaymentMode: type.value })}
                                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.defaultPaymentMode === type.value
                                        ?'border-blue-500  text-[#1A1A1A] shadow-sm'
                                        :'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="w-full h-px" />

                {/* Section: Notifications */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2  text-[#1A1A1A] rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Notifications</h3>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                        <label className="flex items-center justify-between p-5 hover: cursor-pointer transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2  text-[#1A1A1A] rounded-lg"><Bell size={20} /></div>
                                <div>
                                    <span className="block font-bold text-slate-800">Push Notifications</span>
                                    <span className="block text-xs text-slate-500">Real-time alerts for shared trips.</span>
                                </div>
                            </div>
                            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.notifications?.push ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.notifications?.push ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" name="notify_push" checked={formData.notifications?.push ?? true} onChange={handleChange} className="hidden" />
                        </label>

                        <label className="flex items-center justify-between p-5 hover: cursor-pointer transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2  text-[#1A1A1A] rounded-lg"><WarningCircle size={20} /></div>
                                <div>
                                    <span className="block font-bold text-slate-800">Email Alerts</span>
                                    <span className="block text-xs text-slate-500">Weekly summaries and security notices.</span>
                                </div>
                            </div>
                            <div className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.notifications?.email ? 'bg-blue-600' : 'bg-slate-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.notifications?.email ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" name="notify_email" checked={formData.notifications?.email ?? true} onChange={handleChange} className="hidden" />
                        </label>
                    </div>

                    {/* Receipt Auto-Link */}
                    <div className="p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2  text-[#1A1A1A] rounded-lg"><FileText size={20} /></div>
                            <div>
                                <span className="block font-bold text-slate-800">Auto-Link Receipts</span>
                                <span className="block text-xs text-slate-500">Automatically try to match uploaded files.</span>
                            </div>
                        </div>
                        <label className="cursor-pointer">
                            <input type="checkbox" name="receiptAutoLink" checked={formData.receiptAutoLink} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                        </label>
                    </div>
                </section>
            </form>

            <div className="w-full h-px" />

            {/* Section: Account Management */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2  text-slate-600 rounded-lg">
                        <ShieldWarning size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Account & Data</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Export */}
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        disabled={exportLoading}
                        className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all text-left group"
                    >
                        <div className="p-3  text-[#1A1A1A] rounded-xl mb-4 group-hover: transition-colors">
                            <Download size={24} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg">Export Data</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Download a full PDF report of your trips.</p>
                        <div className={`mt-auto text-[#1A1A1A] font-bold text-sm ${exportLoading ?'opacity-50' :''}`}>
                            {exportLoading ?'Generating Report...' :'Download PDF →'}
                        </div>
                    </motion.button>

                    {/* Delete */}
                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDeleteAccount}
                        className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-red-200 transition-all text-left group"
                    >
                        <div className="p-3  text-[#1A1A1A] rounded-xl mb-4 group-hover: transition-colors">
                            <UserMinus size={24} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg">Delete Account</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-4">Permanently remove all your personal data.</p>
                        <span className="mt-auto text-[#1A1A1A] font-bold text-sm">Delete Account →</span>
                    </motion.button>
                </div>
            </section>

            {/* Floating Success Message */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg font-bold text-white flex items-center gap-2 z-50 ${message.includes('Failed') ?'0' :'0'}`}
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};
export default ProfileSettings;
