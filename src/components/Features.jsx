import React from 'react';
import { motion } from 'framer-motion';
import {
    Wallet, Users, Smartphone, FileText, Globe,
    PieChart, Bell, ShieldCheck
} from 'lucide-react';
import SEO from './common/SEO';

const Features = () => {
    const features = [
        {
            icon: <Wallet className="text-blue-500" size={32} />,
            title: "Smart Expense Tracking",
            desc: "Log expenses in seconds with smart categories. We automatically calculate who owes who, supporting multiple currencies."
        },
        {
            icon: <Users className="text-indigo-500" size={32} />,
            title: "Real-time Collaboration",
            desc: "Invite friends to your trip. Everyone adds their own expenses, and changes sync instantly across all devices."
        },
        {
            icon: <PieChart className="text-purple-500" size={32} />,
            title: "Visual Insights",
            desc: "See exactly where your money goes. Beautiful charts breakdown spending by category, day, or traveler."
        },
        {
            icon: <FileText className="text-pink-500" size={32} />,
            title: "PDF Reports",
            desc: "Need to settle up offline? Export a professional PDF summary of all trip expenses and debts."
        },
        {
            icon: <Smartphone className="text-green-500" size={32} />,
            title: "Mobile First Design",
            desc: "Built for life on the go. The app works perfectly on your phone, whether you're in a taxi or on a mountain."
        },
        {
            icon: <Globe className="text-cyan-500" size={32} />,
            title: "Offline Capable",
            desc: "Don't let spotty internet stop you. View your itinerary and vital info even when you're offline."
        }
    ];

    return (
        <div className="py-20 px-6">
            <SEO
                title="Features - TravelCFO"
                description="Explore the tools that make TravelCFO the best free travel expense tracker. Split costs, sync real-time, and analyze spending."
                canonical="https://tripify-c49b6.web.app/?view=features"
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
                    >
                        Everything you need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">travel stress-free.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-500 font-medium leading-relaxed"
                    >
                        From planning the itinerary to settling the final bill, TravelCFO gives you a suite of powerful tools to manage every detail.
                    </motion.p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                {feat.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">{feat.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready to upgrade your travel game?</h2>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-12 py-5 bg-white text-slate-900 rounded-full font-black text-lg hover:bg-blue-50 transition-colors shadow-2xl"
                        >
                            Get Started for Fee
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Features;
