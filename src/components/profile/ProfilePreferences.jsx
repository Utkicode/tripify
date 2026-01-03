import React, { useState, useEffect } from 'react';
import { Clock, Map, Zap, Save, Loader, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../../context/ProfileContext';

const PACE_OPTIONS = [
    { value: 'RELAXED', label: 'Relaxed', desc: '1-2 activities per day' },
    { value: 'MODERATE', label: 'Moderate', desc: '3-4 activities per day' },
    { value: 'PACKED', label: 'Packed', desc: 'See everything possible' }
];

const TRANSPORT_OPTIONS = [
    { value: 'PUBLIC', label: 'Public Transport', desc: 'Trains, buses, subway' },
    { value: 'PRIVATE', label: 'Private / Taxi', desc: 'Uber, Taxi, Rental Car' },
    { value: 'WALKING', label: 'Walking Heavy', desc: 'Prefer to walk everywhere' }
];

const ProfilePreferences = () => {
    const { profile, updateProfile } = useProfile();
    const [formData, setFormData] = useState({
        travelPace: 'MODERATE',
        dayStartTime: '09:00',
        transportPreference: 'PUBLIC'
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile?.preferences) {
            setFormData({
                travelPace: profile.preferences.travelPace || 'MODERATE',
                dayStartTime: profile.preferences.dayStartTime || '09:00',
                transportPreference: profile.preferences.transportPreference || 'PUBLIC'
            });
        }
    }, [profile]);

    const handleSelect = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await updateProfile({
                preferences: {
                    ...profile.preferences,
                    ...formData
                }
            });
            setMessage('Preferences saved!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to save preferences.');
        } finally {
            setSaving(false);
        }
    };

    const OptionCard = ({ option, selected, onClick, icon: Icon }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(option.value)}
            className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-4 h-full ${selected
                ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
        >
            <div className={`mt-1 p-2.5 rounded-xl transition-colors ${selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className={`font-bold text-base ${selected ? 'text-slate-900' : 'text-slate-700'}`}>{option.label}</h4>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Travel Preferences</h2>
                    <p className="text-slate-500 mt-1">Customize how TravelCFO plans your days.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 group"
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Travel Pace */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Zap size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Travel Pace</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {PACE_OPTIONS.map(opt => (
                            <OptionCard
                                key={opt.value}
                                option={opt}
                                selected={formData.travelPace === opt.value}
                                onClick={(val) => handleSelect('travelPace', val)}
                                icon={Zap}
                            />
                        ))}
                    </div>
                </section>

                <div className="w-full h-px bg-slate-100" />

                {/* Transport */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <Map size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Transport Preference</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {TRANSPORT_OPTIONS.map(opt => (
                            <OptionCard
                                key={opt.value}
                                option={opt}
                                selected={formData.transportPreference === opt.value}
                                onClick={(val) => handleSelect('transportPreference', val)}
                                icon={Map}
                            />
                        ))}
                    </div>
                </section>

                <div className="w-full h-px bg-slate-100" />

                {/* Day Start Time */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Clock size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Daily Schedule</h3>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg">
                        <div className="p-4 bg-white rounded-xl shadow-sm text-slate-600">
                            <Coffee size={28} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Typical Start Time</label>
                            <input
                                type="time"
                                name="dayStartTime"
                                value={formData.dayStartTime}
                                onChange={handleChange}
                                className="bg-transparent font-bold text-slate-800 text-3xl outline-none w-full"
                            />
                            <p className="text-xs text-slate-400 mt-2">We'll schedule your first activity around this time.</p>
                        </div>
                    </div>
                </section>

                {/* Floating Success Message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-lg font-bold text-white flex items-center gap-2 z-50 ${message.includes('Failed') ? 'bg-red-500' : 'bg-emerald-500'}`}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

export default ProfilePreferences;
