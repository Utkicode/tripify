import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor, TrendingUp, Users, Cloud, Tag, Sparkles, Rocket,
    Target, CheckCircle, ArrowRight, Menu, X
} from 'lucide-react';
import SEO from './common/SEO';
import Auth from './Auth';

const LandingPage = () => {
    const [showAuth, setShowAuth] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // [NEW] Mobile menu state

    const features = [
        // ... (previous features array) ...
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-x-hidden font-sans text-slate-900">
            <SEO
                title="TravelCFO - Trip Planner & Expense Tracker"
                description="TravelCFO is the smartest way to plan trips, track expenses, and manage travel budgets. Free, private, and secure."
                canonical="https://tripify-c49b6.web.app/"
            />

            {/* Navbar */}
            <nav className="absolute top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <span className="font-black text-xl tracking-tighter">T</span>
                    </div>
                    <span className="font-black text-xl tracking-tight text-slate-900 hidden md:block">TravelCFO</span>
                    {/* Mobile Brand Name (Show on mobile since usually hidden) */}
                    <span className="font-black text-xl tracking-tight text-slate-900 md:hidden">TravelCFO</span>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex gap-8 items-center bg-white/50 backdrop-blur-md px-8 py-3 rounded-full border border-white/50 shadow-sm">
                    <a href="/?view=features" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                    <a href="/?view=about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">About</a>
                    <a href="/?view=protips" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Pro Tips</a>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAuth(true)}
                        className="hidden md:block px-6 py-2.5 bg-slate-900 text-white border border-transparent rounded-full font-bold hover:bg-black hover:shadow-lg transition-all text-sm"
                    >
                        Sign In
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-slate-900 bg-white/50 p-2 rounded-xl backdrop-blur-md border border-slate-200"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-4 right-4 z-40 bg-white rounded-[2rem] shadow-2xl p-6 md:hidden border border-slate-100"
                    >
                        <div className="flex flex-col gap-4">
                            <a href="/?view=features" className="text-lg font-bold text-slate-600 py-2 border-b border-slate-100">Features</a>
                            <a href="/?view=about" className="text-lg font-bold text-slate-600 py-2 border-b border-slate-100">About</a>
                            <a href="/?view=protips" className="text-lg font-bold text-slate-600 py-2 border-b border-slate-100">Pro Tips</a>
                            <button
                                onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                                className="w-full py-4 mt-2 bg-slate-900 text-white rounded-xl font-bold"
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
                        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs tracking-widest uppercase mb-8">
                                The Modern Way to Travel
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
                                Plan Smarter. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Spend in Control.
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                                The all-in-one workspace for your trips. Manage itineraries, track shared expenses, and travel without the financial stress.
                            </p>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => setShowAuth(true)}
                                    className="px-10 py-5 bg-slate-900 text-white rounded-full font-black text-lg hover:bg-black hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-3 group"
                                >
                                    Start Planning Free
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-24 bg-white relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {features.map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                                        {feat.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social Proof / Trust */}
                <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-black text-slate-900 mb-12">Built for every type of traveler</h2>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                            {['Solo Backpackers', 'Couples', 'Friend Groups', 'Families'].map((tag, idx) => (
                                <span key={idx} className="px-6 py-3 bg-white rounded-full border border-slate-200 text-slate-600 font-bold shadow-sm">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-12 text-center text-slate-500 font-medium text-sm flex flex-col gap-4">
                <div className="flex justify-center gap-6">
                    <a href="/?view=about" className="hover:text-slate-600">About</a>
                    <a href="/?view=features" className="hover:text-slate-600">Features</a>
                    <a href="/?view=privacy" className="hover:text-slate-600">Privacy</a>
                </div>
                <p>&copy; {new Date().getFullYear()} TravelCFO. All rights reserved.</p>
            </footer>

            {/* Auth Modal */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setShowAuth(false)}
                    >
                        <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[450px]">
                            {/* Close Button placed outside or top-right of the modal content if needed, 
                                but Auth component might handle its own styling. 
                                We'll pass a prop to Auth to let it know it's in a modal. 
                            */}
                            <Auth isModal={true} onClose={() => setShowAuth(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
