import React from 'react';
import { Trash2, User as UserIcon, UserPlus, Mail, Phone, Calendar, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from './ui/Input';
import Select from './ui/Select';

const Travelers = ({ travelers, setTravelers }) => {
    const handleTravelerChange = (idx, field, val) => {
        const newTravelers = [...travelers];
        newTravelers[idx][field] = val;
        setTravelers(newTravelers);
    };

    const addTraveler = () => setTravelers([...travelers, { id: Date.now().toString(), name: '', email: '', phone: '', age: '', gender: '' }]);

    const removeTraveler = (idx) => {
        const newTravelers = [...travelers];
        newTravelers.splice(idx, 1);
        setTravelers(newTravelers);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
                {travelers.map((t, idx) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group"
                    >
                        <button
                            onClick={() => removeTraveler(idx)}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">
                                {t.name ? t.name[0].toUpperCase() : <UserIcon size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">Traveler {idx + 1}</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Personal Details</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                icon={UserIcon}
                                value={t.name}
                                onChange={(e) => handleTravelerChange(idx, 'name', e.target.value)}
                                placeholder="Enter name"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Age"
                                    type="number"
                                    value={t.age}
                                    onChange={(e) => handleTravelerChange(idx, 'age', e.target.value)}
                                    placeholder="Age"
                                />
                                <Select
                                    label="Gender"
                                    value={t.gender}
                                    onChange={(e) => handleTravelerChange(idx, 'gender', e.target.value)}
                                    options={[
                                        { value: "", label: "Select..." },
                                        { value: "Male", label: "Male" },
                                        { value: "Female", label: "Female" },
                                        { value: "Other", label: "Other" }
                                    ]}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <motion.button
                layout
                whileHover={{ scale: 1.02, backgroundColor: '#f8fafc', borderColor: '#60a5fa' }}
                whileTap={{ scale: 0.98 }}
                onClick={addTraveler}
                className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all min-h-[300px] group"
            >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:shadow-md transition-shadow">
                    <UserPlus size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <span className="font-bold text-lg">Add New Traveler</span>
                <span className="text-sm opacity-70">Track details for another person</span>
            </motion.button>
        </div>
    );
};

export default Travelers;
