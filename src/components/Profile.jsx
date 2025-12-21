import React, { useState, useEffect } from 'react';
import { User, Settings, Map, CheckCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';

// Sub-components
import ProfileIdentity from './profile/ProfileIdentity';
import ProfilePreferences from './profile/ProfilePreferences';
import ProfileSettings from './profile/ProfileSettings';

const TABS = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'preferences', label: 'Travel Defaults', icon: Map },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const Profile = () => {
    const { profile, loading } = useProfile();
    const [activeTab, setActiveTab] = useState('identity');

    // Calculate score for display (0-100)
    const score = profile?.metadata?.completenessScore
        ? Math.round(profile.metadata.completenessScore * 100)
        : 0;

    const getScoreColor = (s) => {
        if (s < 40) return 'text-red-500 bg-red-50';
        if (s < 80) return 'text-amber-500 bg-amber-50';
        return 'text-emerald-500 bg-emerald-50';
    };

    if (loading) return null; // Or skeleton

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile & Settings</h1>
                    <p className="text-slate-500">Manage your identity and calibrate Tripify behavior.</p>
                </div>

                {/* Completeness Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 min-w-[240px]">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className={`${score >= 80 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-1000`}
                                strokeDasharray={`${score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">{score}%</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Profile Strength</h4>
                        <p className="text-xs text-slate-400">
                            {score < 100 ? 'Add more info to unlock insights.' : 'You are all set!'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                    : 'bg-transparent text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}

                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 text-blue-700">
                            <Shield size={20} className="shrink-0" />
                            <p className="text-xs font-medium leading-relaxed">
                                Your data is private and only used to personalize your trip planning experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-[400px] bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10"
                        >
                            {activeTab === 'identity' && <ProfileIdentity />}
                            {activeTab === 'preferences' && <ProfilePreferences />}
                            {activeTab === 'settings' && <ProfileSettings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Profile;
