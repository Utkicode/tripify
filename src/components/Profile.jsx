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
        <div className="max-w-7xl mx-auto pb-40 px-4 sm:px-6">
            {/* Page Header */}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Your Profile</h1>
                <p className="text-lg text-slate-500 mt-2 font-medium">Manage your account settings and travel style.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sidebar (Navigation & Score) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">

                    {/* Profile Score Card */}
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[3rem] -mr-8 -mt-8 z-0"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100 opacity-50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className={`${score >= 80 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-1000`} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                                <span className="text-lg font-black text-slate-800">{score}%</span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">Profile Strength</h3>
                                <p className="text-sm text-slate-500 mt-1 leading-snug font-medium">
                                    {score < 100 ? 'Complete details for better AI recs.' : 'Your profile is rock solid!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="space-y-4 relative z-10">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all text-left outline-none ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-white shadow-lg shadow-blue-500/5 rounded-[2rem]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className={`relative z-10 p-3 rounded-2xl transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-white/50 text-slate-400 group-hover:bg-white group-hover:text-slate-600 shadow-sm'}`}>
                                    <tab.icon size={22} strokeWidth={2.5} />
                                </div>
                                <div className="relative z-10 flex-1">
                                    <span className="block font-bold text-lg tracking-tight">{tab.label}</span>
                                    <span className="block text-sm opacity-60 font-medium">{tab.desc}</span>
                                </div>
                                {activeTab === tab.id && <ChevronRight size={20} className="relative z-10 text-blue-400" strokeWidth={3} />}
                            </button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="pt-8 mt-4 border-t border-slate-200/50">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-between p-5 rounded-[2rem] font-bold text-red-500 hover:bg-red-50/80 transition-all group bg-white/40 backdrop-blur-sm border border-red-100/50"
                        >
                            <span className="flex items-center gap-4">
                                <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <motion.div
                        layout
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 p-8 md:p-12 min-h-[600px] relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "circOut" }}
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
