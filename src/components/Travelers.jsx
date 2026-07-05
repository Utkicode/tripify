import React, { useState } from'react';
import { Trash, User as UserIcon, UserPlus, EnvelopeSimple, Phone, Calendar, UserCircle, ForkKnife, Heart } from'@phosphor-icons/react';
import { motion, AnimatePresence } from'framer-motion';
import Input from'./ui/Input';
import Select from'./ui/Select';
import ConfirmationModal from'./ConfirmationModal';

const Travelers = ({ travelers, setTravelers }) => {
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, idx: null });

    const handleTravelerChange = (idx, field, val) => {
        const newTravelers = [...travelers];
        newTravelers[idx][field] = val;
        setTravelers(newTravelers);
    };

    const addTraveler = () => setTravelers([...travelers, {
        id: Date.now().toString(),
        name:'',
        email:'',
        phone:'',
        age:'',
        gender:'',
        dietaryPreferences:'',
        specialNeeds:''
    }]);

    const confirmDelete = (idx) => {
        setDeleteModal({ isOpen: true, idx });
    };

    const handleDeleteTraveler = () => {
        if (deleteModal.idx === null) return;
        const newTravelers = [...travelers];
        newTravelers.splice(deleteModal.idx, 1);
        setTravelers(newTravelers);
        setDeleteModal({ isOpen: false, idx: null });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence>
                {travelers.map((t, idx) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white/60 relative group hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-300 overflow-hidden"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-[4rem] z-0 pointer-events-none"></div>

                        <button
                            onClick={() => confirmDelete(idx)}
                            className="absolute top-8 right-8 p-3 text-slate-300 hover:text-[#1A1A1A] hover: rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <Trash size={20} />
                        </button>

                        <div className="flex items-center gap-6 mb-8 relative z-10">
                            <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-[#1A1A1A] font-extrabold text-3xl shadow-sm border border-white">
                                {t.name ? t.name[0].toUpperCase() : <UserIcon size={32} strokeWidth={2.5} />}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-2xl tracking-tight">Traveler {idx + 1}</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 /50 px-2 py-1 rounded-md w-fit">Personal Details</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="bg-white/50 p-1 rounded-[1.5rem] border border-white/40 shadow-inner">
                                <Input
                                    label="Full Name"
                                    icon={UserIcon}
                                    value={t.name}
                                    onChange={(e) => handleTravelerChange(idx,'name', e.target.value)}
                                    placeholder="Enter full name"
                                    className="bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:font-normal"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="bg-white/50 p-1 rounded-[1.5rem] border border-white/40 shadow-inner">
                                    <Input
                                        label="Age"
                                        type="number"
                                        value={t.age}
                                        onChange={(e) => handleTravelerChange(idx,'age', e.target.value)}
                                        placeholder="Age"
                                        className="bg-transparent border-none focus:ring-0 font-bold"
                                    />
                                </div>
                                <div className="bg-white/50 p-1 rounded-[1.5rem] border border-white/40 shadow-inner">
                                    <Select
                                        label="Gender"
                                        value={t.gender}
                                        onChange={(e) => handleTravelerChange(idx,'gender', e.target.value)}
                                        options={[
                                            { value:"", label:"Select..." },
                                            { value:"Male", label:"Male" },
                                            { value:"Female", label:"Female" },
                                            { value:"Other", label:"Other" }
                                        ]}
                                        className="bg-transparent border-none focus:ring-0 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="/50 p-1 pl-2 rounded-[1.5rem] border border-orange-100/50 flex items-center gap-2">
                                    <ForkKnife size={18} className="text-[#1A1A1A] ml-3" />
                                    <input
                                        type="text"
                                        value={t.dietaryPreferences}
                                        onChange={(e) => handleTravelerChange(idx,'dietaryPreferences', e.target.value)}
                                        placeholder="Dietary Preferences..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                                <div className="/50 p-1 pl-2 rounded-[1.5rem] border border-rose-100/50 flex items-center gap-2">
                                    <Heart size={18} className="text-[#1A1A1A] ml-3" />
                                    <input
                                        type="text"
                                        value={t.specialNeeds}
                                        onChange={(e) => handleTravelerChange(idx,'specialNeeds', e.target.value)}
                                        placeholder="Medical / Special Needs..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.button
                layout
                whileHover={{ scale: 1.02, backgroundColor:'rgba(255, 255, 255, 0.6)' }}
                whileTap={{ scale: 0.98 }}
                onClick={addTraveler}
                className="bg-white/30 backdrop-blur-md border-2 border-dashed border-slate-300 rounded-[3rem] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-[#1A1A1A] hover:border-blue-400 transition-all min-h-[400px] group shadow-sm hover:shadow-xl"
            >
                <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm flex items-center justify-center mb-6 group-hover:shadow-lg transition-all group-hover:scale-110 group-hover:-rotate-3">
                    <UserPlus size={40} className="text-slate-300 group-hover:text-[#1A1A1A] transition-colors" />
                </div>
                <span className="font-extrabold text-xl text-slate-600 tracking-tight">Add New Traveler</span>
                <span className="text-sm opacity-60 font-bold mt-2">Track details for another person</span>
            </motion.button>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, idx: null })}
                onConfirm={handleDeleteTraveler}
                title="Delete Traveler?"
                message="Are you sure you want to remove this traveler from the trip? This cannot be undone."
                confirmText="Delete Traveler"
            />
        </div>
    );
};

export default Travelers;
