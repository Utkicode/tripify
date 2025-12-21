import React, { useState, useEffect } from 'react';
import { Clock, Map, Zap, Save, Loader, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';
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
        <div
            onClick={() => onClick(option.value)}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${selected
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
        >
            <div className={`mt-0.5 p-2 rounded-lg ${selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Icon size={18} />
            </div>
            <div>
                <h4 className={`font-bold text-sm ${selected ? 'text-blue-900' : 'text-slate-700'}`}>{option.label}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Travel Pace */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" /> Travel Pace
                    </label>
                    <div className="grid md:grid-cols-3 gap-3">
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
                </div>

                {/* Transport */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Map size={16} className="text-emerald-500" /> Preferred Transport
                    </label>
                    <div className="grid md:grid-cols-3 gap-3">
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
                </div>

                {/* Day Start Time */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" /> Typical Start Time
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-slate-600">
                            <Coffee size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-500 mb-1">When do you usually start your activities?</p>
                            <input
                                type="time"
                                name="dayStartTime"
                                value={formData.dayStartTime}
                                onChange={handleChange}
                                className="bg-transparent font-bold text-slate-800 text-xl outline-none"
                            />
                        </div>
                    </div>
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
                        {saving ? <Loader className="animate-spin" size={18} /> : <><Save size={18} /> Save Preferences</>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfilePreferences;
