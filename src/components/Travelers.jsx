import React from 'react';
import { Trash, User as UserIcon, UserPlus, ForkKnife, Heart, WhatsappLogo } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from './ui/Input';
import Select from './ui/Select';
import { useConfirm } from '../context/ConfirmContext';

const SITE_URL = 'https://travelcfo.app';

const Travelers = ({ travelers, setTravelers, isCompleted = false, tripId }) => {
    const confirm = useConfirm();

    const handleTravelerChange = (idx, field, val) => {
        const newTravelers = [...travelers];
        newTravelers[idx][field] = val;
        setTravelers(newTravelers);
    };

    const addTraveler = () => setTravelers([...travelers, {
        id: crypto.randomUUID(),
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        dietaryPreferences: '',
        specialNeeds: ''
    }]);

    const confirmDelete = (idx) => {
        confirm({
            title: 'Delete Traveler?',
            message: 'Are you sure you want to remove this traveler from the trip? This cannot be undone.',
            confirmLabel: 'Delete Traveler',
            isDestructive: true,
            onConfirm: () => {
                const newTravelers = [...travelers];
                newTravelers.splice(idx, 1);
                setTravelers(newTravelers);
            }
        });
    };

    const handleWhatsAppInvite = () => {
        const tripLink = tripId ? `${SITE_URL}/?trip=${tripId}` : SITE_URL;
        const message = `Hey! I'm planning a trip on Tripify and I'd love for you to join. Click the link to see the itinerary and collaborate: ${tripLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-8">
            {/* Header with actions */}
            {!isCompleted && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Travelers</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            {travelers.length} traveler{travelers.length !== 1 ? 's' : ''} on this trip
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* WhatsApp Invite */}
                        <button
                            onClick={handleWhatsAppInvite}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-md shadow-[#25D366]/30 hover:bg-[#1ebe57] active:scale-95 transition-all"
                        >
                            <WhatsappLogo size={18} weight="fill" />
                            <span className="hidden sm:inline">Invite via WhatsApp</span>
                            <span className="sm:hidden">Invite</span>
                        </button>

                        {/* Add Traveler */}
                        <button
                            onClick={addTraveler}
                            className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"
                        >
                            <UserPlus size={18} strokeWidth={2.5} />
                            <span className="hidden sm:inline">Add Traveler</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Traveler Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {travelers.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-lg shadow-slate-200/40 border border-white/60 relative group hover:shadow-xl hover:shadow-orange-100/30 transition-all duration-300 overflow-hidden"
                            style={{ isolation: 'isolate' }}
                        >
                            {/* Decorative Blob — orange, not blue */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] z-0 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at top right, rgba(255,107,53,0.10), transparent 70%)' }}
                            />

                            {/* Delete button */}
                            {!isCompleted && (
                                <button
                                    onClick={() => confirmDelete(idx)}
                                    className="absolute top-6 right-6 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-10"
                                    title="Remove traveler"
                                >
                                    <Trash size={18} />
                                </button>
                            )}

                            {/* Avatar + header */}
                            <div className="flex items-center gap-5 mb-7 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200/60 flex items-center justify-center font-black text-2xl text-[#FF6B35] shadow-sm shrink-0">
                                    {t.name ? t.name[0].toUpperCase() : <UserIcon size={28} strokeWidth={2.5} className="text-[#FF6B35]" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight">
                                        {t.name || `Traveler ${idx + 1}`}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        Personal Details
                                    </p>
                                </div>
                            </div>

                            {/* Form fields */}
                            <div className="space-y-4 relative z-10">
                                {/* Name */}
                                <div className="bg-white/60 rounded-2xl border border-slate-100 overflow-hidden">
                                    <Input
                                        label="Full Name"
                                        icon={UserIcon}
                                        value={t.name}
                                        onChange={(e) => handleTravelerChange(idx, 'name', e.target.value)}
                                        disabled={isCompleted}
                                        placeholder="Enter full name"
                                        className={`bg-transparent border-none focus:ring-0 text-base font-bold ${isCompleted ? 'cursor-default' : ''}`}
                                    />
                                </div>

                                {/* Age + Gender */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/60 rounded-2xl border border-slate-100 overflow-hidden">
                                        <Input
                                            label="Age"
                                            type="number"
                                            value={t.age}
                                            onChange={(e) => handleTravelerChange(idx, 'age', e.target.value)}
                                            disabled={isCompleted}
                                            placeholder="Age"
                                            className={`bg-transparent border-none focus:ring-0 font-bold ${isCompleted ? 'cursor-default' : ''}`}
                                        />
                                    </div>
                                    <div className="bg-white/60 rounded-2xl border border-slate-100 overflow-hidden">
                                        <Select
                                            label="Gender"
                                            value={t.gender}
                                            onChange={(e) => handleTravelerChange(idx, 'gender', e.target.value)}
                                            disabled={isCompleted}
                                            options={[
                                                { value: "", label: "Select..." },
                                                { value: "Male", label: "Male" },
                                                { value: "Female", label: "Female" },
                                                { value: "Other", label: "Other" }
                                            ]}
                                            className={`bg-transparent border-none focus:ring-0 font-bold ${isCompleted ? 'cursor-default' : ''}`}
                                        />
                                    </div>
                                </div>

                                {/* Dietary Preferences */}
                                <div className="bg-orange-50/60 border border-orange-100/70 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <ForkKnife size={16} className="text-[#FF6B35] shrink-0" />
                                    <input
                                        type="text"
                                        value={t.dietaryPreferences}
                                        onChange={(e) => handleTravelerChange(idx, 'dietaryPreferences', e.target.value)}
                                        disabled={isCompleted}
                                        placeholder="Dietary preferences (e.g. Vegan, Gluten-Free)"
                                        className={`w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none ${isCompleted ? 'cursor-default' : ''}`}
                                    />
                                </div>

                                {/* Special Needs */}
                                <div className="bg-rose-50/40 border border-rose-100/50 rounded-2xl px-4 py-3 flex items-center gap-3">
                                    <Heart size={16} className="text-rose-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={t.specialNeeds}
                                        onChange={(e) => handleTravelerChange(idx, 'specialNeeds', e.target.value)}
                                        disabled={isCompleted}
                                        placeholder="Medical / Special needs"
                                        className={`w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none ${isCompleted ? 'cursor-default' : ''}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Compact Add Traveler Card */}
                {!isCompleted && (
                    <motion.button
                        layout
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addTraveler}
                        className="bg-white/50 backdrop-blur-md border-2 border-dashed border-slate-200 hover:border-[#FF6B35]/50 hover:bg-orange-50/30 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-[#FF6B35] transition-all min-h-[160px] group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-all duration-200">
                            <UserPlus size={22} strokeWidth={2} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-sm">Add New Traveler</p>
                            <p className="text-xs text-slate-400 mt-0.5 group-hover:text-orange-400 transition-colors">Track details for another person</p>
                        </div>
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default Travelers;
