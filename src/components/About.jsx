import React from 'react';
import { motion } from 'framer-motion';
import {
    Monitor, TrendingUp, Users, Cloud, Tag, Sparkles, Rocket,
    Target, Briefcase, GraduationCap, Home
} from 'lucide-react';

const About = () => {
    const usps = [
        {
            icon: <Monitor className="text-blue-500" size={24} />,
            title: "Ultra-Clean, Modern UI",
            desc: "Designed with a focus on simplicity and premium usability. No clutter. Just clarity."
        },
        {
            icon: <TrendingUp className="text-green-500" size={24} />,
            title: "Intelligent Insights",
            desc: "Smart analytics that highlight spending patterns, overspending alerts, and category-based breakdowns."
        },
        {
            icon: <Users className="text-purple-500" size={24} />,
            title: "Multi-User Ready",
            desc: "Perfect for shared flats, couples, or teams. Invite users and track shared expenses transparently."
        },
        {
            icon: <Cloud className="text-cyan-500" size={24} />,
            title: "Cloud-Synced",
            desc: "Your data is securely synced and available across all your devices. No local storage headaches."
        },
        {
            icon: <Tag className="text-amber-500" size={24} />,
            title: "Category-Smart",
            desc: "Granular categorization, tags, and filters to segment your finances precisely."
        },
        {
            icon: <Sparkles className="text-indigo-500" size={24} />,
            title: "AI-Driven Recommendations",
            desc: "Future-ready: Proactive suggestions on optimizing budgeting and spotting financial trends."
        },
        {
            icon: <Rocket className="text-red-500" size={24} />,
            title: "Simple Onboarding",
            desc: "Quick login/signup. No complex setup. Users get to their data instantly."
        }
    ];

    const audiences = [
        { icon: <Briefcase size={20} />, label: "Working professionals tracking monthly budgets" },
        { icon: <GraduationCap size={20} />, label: "Students managing shared apartment expenses" },
        { icon: <Monitor size={20} />, label: "Freelancers monitoring project-based spending" },
        { icon: <Home size={20} />, label: "Families planning households" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto py-10 px-4"
        >
            {/* 1. Header Section */}
            <div className="text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
                >
                    Powering Smarter Spending. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">One User at a Time.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed"
                >
                    Tripify is built for individuals and teams who want absolute clarity over where their money goes.
                    No clutter, no noise — just intelligent expense tracking designed for real-world use.
                </motion.p>
            </div>

            {/* 2. Mission & What We Do */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="prose prose-lg"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="text-blue-500" /> Our Mission
                    </h2>
                    <p className="text-slate-600">
                        To make expenditure management effortless, insightful, and truly personal.
                        Whether you're budgeting monthly, tracking shared expenses, or monitoring spending trends,
                        Tripify empowers you with clean analytics and frictionless planning.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="prose prose-lg"
                >
                    <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Monitor className="text-indigo-500" /> What We Do
                    </h2>
                    <p className="text-slate-600">
                        Tripify is a cloud-native expenditure planner and tracker that simplifies the way users record, monitor, and analyze expenses.
                        We give users a centralized, intuitive dashboard to manage budgets, categorize spendings, and make informed financial decisions.
                    </p>
                </motion.div>
            </div>

            {/* 3. USP Grid */}
            <div className="mb-24">
                <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">Why Tripify Wins</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {usps.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 4. Who We Built This For */}
            <div className="mb-24 bg-slate-50 rounded-3xl p-8 md:p-12">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Who We Built This For</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {audiences.map((audience, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-xl text-center shadow-sm"
                        >
                            <div className="mx-auto w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                {audience.icon}
                            </div>
                            <p className="text-slate-700 font-medium text-sm">{audience.label}</p>
                        </motion.div>
                    ))}
                    <div className="col-span-full mt-4 text-center">
                        <span className="inline-block bg-white px-6 py-2 rounded-full text-slate-500 text-sm font-medium border border-slate-100 shadow-sm">
                            ...and anyone who wants a clean, powerful personal finance tool.
                        </span>
                    </div>
                </div>
            </div>

            {/* 5. Vision & CTA */}
            <div className="text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-12"
                >
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Our Vision</h3>
                    <p className="text-2xl font-medium text-slate-900 leading-snug">
                        "To evolve Tripify into the smartest personal finance assistant — one that not only tracks your expenses, but also guides your financial decisions with precision and intelligence."
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white shadow-xl"
                >
                    <h2 className="text-3xl font-bold mb-4">Take control of your spending.</h2>
                    <p className="text-blue-100 text-lg mb-8">Start using Tripify today.</p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg text-lg">
                        Get Started Now
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default About;
