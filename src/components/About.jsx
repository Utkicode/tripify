import React from 'react';
import { motion } from 'framer-motion';
import {
    Monitor, TrendingUp, Users, Cloud, Tag, Sparkles, Rocket,
    Target, Briefcase, GraduationCap, Home
} from 'lucide-react';
import SEO from './common/SEO';

const About = ({ setCurrentView }) => {
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
            className="max-w-7xl mx-auto py-12 px-6"
        >
            <SEO
                title="About Us - TravelCFO"
                description="Learn about TravelCFO's mission to simplify personal finance and travel budgeting with a clean, insight-driven dashboard."
                canonical="https://tripify-c49b6.web.app/?view=about"
            />
            {/* 1. Header Section */}
            <div className="text-center mb-24 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter"
                >
                    Powering <br /> Smarter <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Spending.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 text-2xl md:text-3xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-bold tracking-tight"
                >
                    TravelCFO is built for travelers who want absolute clarity over where their money goes.
                    No clutter. Just clarity.
                </motion.p>
            </div>

            {/* 2. Mission & What We Do (Glass Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/60 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-bl-[10rem] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                    <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-blue-100 rounded-[1.5rem] text-blue-600 shadow-sm"><Target size={32} strokeWidth={2.5} /></div>
                        Our Mission
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium relative z-10">
                        To make expenditure management effortless, insightful, and truly personal.
                        Whether you're budgeting monthly or tracking expenses across continents,
                        TravelCFO empowers you with clean analytics.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/60 backdrop-blur-xl p-12 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-bl-[10rem] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                    <h2 className="text-4xl font-black text-slate-900 mb-8 flex items-center gap-4 relative z-10">
                        <div className="p-4 bg-indigo-100 rounded-[1.5rem] text-indigo-600 shadow-sm"><Monitor size={32} strokeWidth={2.5} /></div>
                        What We Do
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium relative z-10">
                        TravelCFO is a cloud-native expenditure planner that simplifies how you record, monitor, and analyze expenses.
                        We give users a centralized, intuitive dashboard to manage budgets and categorize spendings wisely.
                    </p>
                </motion.div>
            </div>

            {/* 3. USP Grid */}
            <div className="mb-32">
                <h2 className="text-5xl font-black text-slate-900 text-center mb-16 tracking-tight">Why TravelCFO Wins</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {usps.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                {React.cloneElement(item.icon, { size: 32, strokeWidth: 2 })}
                            </div>
                            <h3 className="font-extrabold text-2xl text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 4. Who We Built This For */}
            <div className="mb-32 bg-white/40 backdrop-blur-md rounded-[4rem] p-10 md:p-20 border border-white/50 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
                <h2 className="text-4xl font-black text-slate-900 text-center mb-16 relative z-10">Who We Built This For</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {audiences.map((audience, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className="bg-white/80 backdrop-blur p-8 rounded-[2.5rem] text-center shadow-lg border border-white/60 flex flex-col items-center justify-center h-full group"
                        >
                            <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                {React.cloneElement(audience.icon, { size: 28 })}
                            </div>
                            <p className="text-slate-800 font-bold text-lg leading-snug">{audience.label}</p>
                        </motion.div>
                    ))}
                    <div className="col-span-full mt-12 text-center">
                        <span className="inline-block bg-white/90 backdrop-blur px-8 py-4 rounded-full text-slate-500 font-bold border border-white/60 shadow-md text-lg">
                            ...and anyone who wants a clean, powerful personal finance tool.
                        </span>
                    </div>
                </div>
            </div>

            {/* 5. Vision & CTA */}
            <div className="text-center max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-20"
                >
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 bg-blue-50 px-4 py-2 rounded-full w-fit mx-auto">Our Vision</h3>
                    <p className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                        "To evolve TravelCFO into the smartest personal finance assistant — for travel and beyond."
                    </p>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">Take control <br /> of your spending.</h2>
                        <p className="text-slate-400 text-2xl font-medium mb-12">Start using TravelCFO today.</p>
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="bg-white text-slate-900 px-12 py-5 rounded-full font-black hover:bg-blue-50 transition-all shadow-xl text-xl flex items-center gap-3 mx-auto hover:scale-105 active:scale-95"
                        >
                            Get Started Now <Rocket size={24} />
                        </button>
                    </div>
                    {/* Background decor */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none group-hover:opacity-30 transition-opacity" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none group-hover:opacity-30 transition-opacity" />
                </motion.div>
            </div>
        </motion.div>
    );
};
export default About;
