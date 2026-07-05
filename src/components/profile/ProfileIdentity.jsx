import React, { useState, useEffect } from'react';
import { User, Phone, TextAlignLeft, Camera, FloppyDisk, SpinnerGap } from'@phosphor-icons/react';
import { motion } from'framer-motion';
import { useProfile } from'../../context/ProfileContext';

const ProfileIdentity = () => {
    const { profile, updateProfile, user } = useProfile();
    const [formData, setFormData] = useState({
        displayName:'',
        phoneNumber:'',
        bio:''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.identity?.displayName || user.displayName ||'',
                phoneNumber: profile.identity?.phoneNumber ||'',
                bio: profile.identity?.bio ||''
            });
        }
    }, [profile, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await updateProfile({
                identity: {
                    ...profile.identity,
                    ...formData
                },
                // Also update root displayName for backward compatibility if needed, 
                // but Context updateProfile handles merging. 
                // We should ensure the context handles deep merges or we do it here.
                // For now, let's assume specific field updates.
                displayName: formData.displayName
            });
            setMessage('Identity updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update identity.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-3 relative group cursor-pointer overflow-hidden shadow-lg">
                    {formData.displayName ? formData.displayName[0].toUpperCase() : <User />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera size={24} />
                    </div>
                </div>
                <p className="text-slate-400 text-sm font-medium">{profile?.identity?.email || user.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User size={16} className="text-[#1A1A1A]" /> Full Name
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                            placeholder="Your Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Phone size={16} className="text-[#1A1A1A]" /> Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <TextAlignLeft size={16} className="text-[#1A1A1A]" /> Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3  border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none resize-none font-medium"
                        placeholder="Tell us a bit about yourself..."
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    {message && (
                        <span className={`text-sm font-bold ${message.includes('Failed') ?'text-[#1A1A1A]' :'text-[#1A1A1A]'}`}>
                            {message}
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-slate-900/10 active:scale-95"
                    >
                        {saving ? <SpinnerGap className="animate-spin" size={18} /> : <><FloppyDisk size={18} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ProfileIdentity;
