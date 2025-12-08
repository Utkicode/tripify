import React from 'react';
import { motion } from 'framer-motion';
import { Map, Shield, DollarSign, Award } from 'lucide-react';

const About = () => {
    const features = [
        { icon: <Map className="text-blue-500" size={24} />, title: "Smart Itineraries", desc: "Plan day-by-day schedules with ease." },
        { icon: <DollarSign className="text-green-500" size={24} />, title: "Budget Tracking", desc: "Monitor expenses across categories in real-time." },
        { icon: <Shield className="text-purple-500" size={24} />, title: "Secure Cloud Sync", desc: "Your data is safe and accessible everywhere." },
        { icon: <Award className="text-amber-500" size={24} />, title: "Premium Insights", desc: "Visualize spending habits with beautiful charts." },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto py-8"
        >
            {/* Hero Section */}
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
                >
                    Travel Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Not Harder</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                >
                    Tripify is built for explorers who want to focus on the experience, not the spreadsheet. We simplify travel planning so you can enjoy the journey.
                </motion.p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
                    >
                        <div className="p-3 bg-slate-50 rounded-xl">{feature.icon}</div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{feature.title}</h3>
                            <p className="text-slate-500 text-sm">{feature.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Image / Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="relative rounded-3xl overflow-hidden shadow-xl h-64 md:h-80 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-white"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 text-center px-4">
                    <h2 className="text-3xl font-bold mb-4">Ready to start your next adventure?</h2>
                    <p className="text-blue-100 mb-0">Join thousands of happy travelers using Tripify today.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default About;
