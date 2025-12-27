import React, { useState } from 'react';
import { User, Settings, Map, LogOut, Shield, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';

// Sub-components
import ProfileIdentity from './profile/ProfileIdentity';
import ProfilePreferences from './profile/ProfilePreferences';
import ProfileSettings from './profile/ProfileSettings';

const TABS = [
    { id: 'identity', label: 'Identity', icon: User, desc: 'Personal details' },
    { id: 'preferences', label: 'Travel Defaults', icon: Map, desc: 'Pace & Transport' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'App preferences' },
];

const Profile = ({ user, onLogout }) => {
    const { profile, loading } = useProfile();
    const [activeTab, setActiveTab] = useState('identity');

    // Calculate score
    const score = profile?.metadata?.completenessScore
        ? Math.round(profile.metadata.completenessScore * 100)
        : 0;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
                <p className="text-slate-500 mt-2">Manage your account settings and travel preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar (Navigation & Score) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Profile Score Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className={`${score >= 80 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-1000`} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <span className="text-sm font-bold text-slate-800">{score}%</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Profile Strength</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-snug">
                                    {score < 100 ? 'Complete your profile to get better recommendations.' : 'Your profile is rock solid!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="space-y-2 sticky top-20 z-10 bg-slate-50/95 backdrop-blur-sm p-2 -mx-2 rounded-2xl border border-slate-100/50 lg:static lg:bg-transparent lg:p-0 lg:border-none">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left outline-none ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-white'}`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-white rounded-2xl border border-blue-100 shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div className={`relative z-10 p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                                    <tab.icon size={20} />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <span className="block font-bold text-sm tracking-wide">{tab.label}</span>
                                    <span className="block text-xs opacity-70 font-medium">{tab.desc}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={16} className="relative z-10" />}
                            </button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="pt-6 border-t border-slate-200/60">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all group"
                        >
                            <span className="flex items-center gap-3">
                                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </span>
                        </button>

                        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex gap-3 text-indigo-800">
                            <Shield size={20} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-medium leading-relaxed opacity-80">
                                Your data is private. We only use it to personalize your experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <motion.div
                        layout
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 md:p-10 min-h-[600px] relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                {activeTab === 'identity' && <ProfileIdentity />}
                                {activeTab === 'preferences' && <ProfilePreferences />}
                                {activeTab === 'settings' && <ProfileSettings />}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
