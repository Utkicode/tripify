import React, { useState } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { ArrowRight, List, X, Receipt, Users, ChartBar, FileArrowDown, WifiHigh, DeviceMobile, ListDashes } from'@phosphor-icons/react';
import SEO from'./common/SEO';
import Auth from'./Auth';
import { SITE_URL } from '../constants';

const LandingPage = ({ currentView }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // --- Dynamic Content Strategy ---
    const defaultContent = {
        eyebrow: null,
        title:"Stop texting\n'who owes\nwhat' after\nevery trip.",
        desc:"Plan the trip. Track the bill. Actually enjoy the vacation."
    };

    const contentMap = {'travel-expense-tracker': {
            eyebrow:"Free Expense Tracker",
            title:"Log it now.\nSettle it later.",
            desc:"Tap, pick who paid, done. No more mental math at the restaurant."
        },'group-trip-planner': {
            eyebrow:"Group Trip Planning",
            title:"Plan together.\nFight about\nnothing.",
            desc:"Everyone logs their own expenses. Balances update automatically. No spreadsheet handoffs."
        },'vacation-budget-app': {
            eyebrow:"Vacation Budget",
            title:"Know what\nyou spent\nbefore you land.",
            desc:"See exactly where the money went — food, transport, accommodation — in real time."
        },'itinerary-builder': {
            eyebrow:"Itinerary Builder",
            title:"Your trip,\nnot a Notes app\ndump.",
            desc:"Day-by-day plans, tickets, maps. One place. Works offline too."
        }
    };

    const content = contentMap[currentView] || defaultContent;

    // Features for the asymmetric layout
    const heroFeature = {
        icon: <Receipt size={20} strokeWidth={1.5} className="text-[#374151]" />,
        title:"Log an expense in 3 taps.",
        desc:"Pick who paid. Choose how to split it. Done. TravelCFO does the math so you don't have to hold it all in your head during the trip.",
        detail:"Multi-currency. Syncs instantly to everyone's phone."
    };

    const otherFeatures = [
        {
            icon: <Users size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title:"Everyone adds their own stuff",
            desc:"Invite your group. Each person logs their own expenses. No one's chasing receipts at midnight."
        },
        {
            icon: <ChartBar size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title:"See where it actually went",
            desc:"Turns out 40% was food. 18% was \"miscellaneous.\" The chart doesn't lie."
        },
        {
            icon: <FileArrowDown size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title:"Export a clean PDF",
            desc:"When it's time to settle up, export the full breakdown. Nobody argues with a PDF."
        },
        {
            icon: <DeviceMobile size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title:"Log from anywhere",
            desc:"Taxi in Bangkok. Night market in Chiang Mai. You don't need a laptop for this."
        },
        {
            icon: <WifiHigh size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title:"Works without signal",
            desc:"Log offline on the mountain. It syncs when you're back on WiFi. Nothing disappears."
        }
    ];

    const scenarios = [
        {
            label:"The friend group",
            desc:"Six people. Four dinners, two Ubers, one Airbnb, and nobody can remember who paid for the boat thing. TravelCFO remembers."
        },
        {
            label:"The couple",
            desc:"'Wait, didn't we already go over budget on the hotel?' You did. You'll know in real time now — not on the flight home."
        },
        {
            label:"The solo traveler",
            desc:"Your Notes app has 31 entries that just say'€12.' TravelCFO gives those receipts an actual home."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAF7] overflow-x-hidden font-sans text-[#1A1A1A]">
            <SEO
                title="TravelCFO — Split trip costs without the awkward spreadsheet"
                description="Create a trip, invite your friends, log expenses as you go. When it's over, everyone knows exactly who owes what. Free."
                canonical={`${SITE_URL}/`}
            />

            {/* ── Navbar ── */}
            <nav className="w-full px-6 md:px-10 py-5 flex justify-between items-center border-b border-[#E5E7EB] bg-[#FAFAF7] sticky top-0 z-50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center text-white">
                        <span className="font-black text-sm tracking-tighter">T</span>
                    </div>
                    <span className="font-black text-lg tracking-tight text-[#1A1A1A]">TravelCFO</span>
                    <span className="hidden md:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-bold  text-[#6B7280] border border-[#E5E7EB] rounded">
                        BETA
                    </span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-7 items-center">
                    <a href="/?view=features" className="text-sm font-semibold text-[#6B7280] hover:text-[#1A1A1A] transition-colors">Features</a>
                    <a href="/?view=about" className="text-sm font-semibold text-[#6B7280] hover:text-[#1A1A1A] transition-colors">About</a>
                    <a href="/?view=protips" className="text-sm font-semibold text-[#6B7280] hover:text-[#1A1A1A] transition-colors">Pro Tips</a>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAuth(true)}
                        className="hidden md:block px-5 py-2 border border-[#1A1A1A] text-[#1A1A1A] rounded-lg font-semibold hover:bg-[#1A1A1A] hover:text-white transition-all text-sm"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setShowAuth(true)}
                        className="hidden md:block px-5 py-2 bg-[#1A1A1A] text-white rounded-lg font-semibold hover:bg-black transition-all text-sm"
                    >
                        Get Started Free
                    </button>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden text-[#1A1A1A] p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X size={22} /> : <ListDashes size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="fixed top-[61px] left-0 right-0 z-40 bg-[#FAFAF7] border-b border-[#E5E7EB] px-6 py-5 md:hidden"
                    >
                        <div className="flex flex-col gap-4">
                            <a href="/?view=features" className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB]">Features</a>
                            <a href="/?view=about" className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB]">About</a>
                            <a href="/?view=protips" className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB]">Pro Tips</a>
                            <button
                                onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                                className="w-full py-3 mt-2 bg-[#1A1A1A] text-white rounded-lg font-bold"
                            >
                                Get Started Free
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Content ── */}
            <main>

                {/* ── Hero ── */}
                <section className="w-full bg-[#1A1A1A] text-white">
                    <div className="px-6 md:px-10 pt-24 pb-32 md:pt-32 md:pb-40 max-w-6xl mx-auto flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full max-w-4xl"
                        >
                            {content.eyebrow && (
                                <span className="inline-block mb-6 text-sm font-bold uppercase tracking-widest text-[#E8A317] border-b-2 border-[#E8A317] pb-1">
                                    {content.eyebrow}
                                </span>
                            )}
                            
                            <h1 className="text-7xl md:text-[100px] font-black leading-[0.85] tracking-tighter mb-4 text-white">
                                Plan Smarter.
                            </h1>
                            <h2 className="text-5xl md:text-[70px] font-extrabold leading-[0.9] tracking-tight text-white/40 mb-10">
                                Spend in Control.
                            </h2>
                            
                            <p className="text-lg md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                                {content.desc}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => setShowAuth(true)}
                                    className="px-8 py-4 bg-white text-[#1A1A1A] rounded-xl font-extrabold text-lg hover:bg-gray-100 transition-all flex items-center gap-2 group shadow-2xl"
                                >
                                    Start for free
                                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                                </button>
                                <span className="text-sm text-white/50 font-bold">
                                    No credit card. No catch.
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Divider ── */}
                <div className="border-t border-[#E5E7EB] max-w-6xl mx-auto" />

                {/* ── Hero Feature Block ── */}
                <section className="px-6 md:px-10 py-16 md:py-24 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                        {/* Text side */}
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                {heroFeature.icon}
                                <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">How it works</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-4 leading-[1.05]">
                                {heroFeature.title}
                            </h2>
                            <p className="text-[#6B7280] text-lg leading-relaxed mb-3 font-medium">
                                {heroFeature.desc}
                            </p>
                            <p className="text-[#9CA3AF] text-sm font-medium">{heroFeature.detail}</p>
                        </motion.div>

                        {/* Product mockup panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45 }}
                            className="bg-[#1A1A1A] rounded-xl p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Bali Trip · Aug 2025</span>
                                <span className="text-[#1A1A1A] text-xs font-bold">● Live</span>
                            </div>
                            {/* Fake expense rows */}
                            {[
                                { name:'Airbnb Ubud (5 nights)', payer:'Utkarsh', amount:'₹28,400', split:'3 people' },
                                { name:'Airport taxi', payer:'Priya', amount:'₹1,200', split:'3 people' },
                                { name:'Dinner at Locavore', payer:'Rahul', amount:'₹4,800', split:'3 people' },
                                { name:'Scooter rental (2 days)', payer:'Utkarsh', amount:'₹2,600', split:'2 people' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-[#374151] last:border-0">
                                    <div>
                                        <p className="text-white text-sm font-semibold">{item.name}</p>
                                        <p className="text-[#6B7280] text-xs mt-0.5">{item.payer} paid · {item.split}</p>
                                    </div>
                                    <span className="text-white font-black text-sm">{item.amount}</span>
                                </div>
                            ))}
                            <div className="mt-5 pt-4 border-t border-[#374151] flex items-center justify-between">
                                <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Your share</span>
                                <span className="text-[#1A1A1A] font-black text-xl">₹12,400</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Other Features — alternating list ── */}
                <section className="border-t border-[#E5E7EB] bg-white">
                    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
                        <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-14">
                            Stop losing money to"I'll figure it out later."
                        </h2>
                        <div className="divide-y divide-[#E5E7EB]">
                            {otherFeatures.map((feat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.06 }}
                                    className="py-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-16"
                                >
                                    <div className="flex items-center gap-3 md:w-56 shrink-0">
                                        {feat.icon}
                                        <h3 className="font-bold text-[#1A1A1A] text-base">{feat.title}</h3>
                                    </div>
                                    <p className="text-[#6B7280] font-medium leading-relaxed md:max-w-xl">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Real Scenarios (replaces"Built for every type of traveler") ── */}
                <section className="border-t border-[#E5E7EB] bg-[#FAFAF7]">
                    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-6">Sound familiar?</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-12 max-w-lg leading-tight">
                            Every trip has that one moment where money gets weird.
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#E5E7EB] rounded-xl overflow-hidden">
                            {scenarios.map((s, i) => (
                                <div
                                    key={i}
                                    className={`p-8 bg-white ${i < scenarios.length - 1 ?'md:border-r border-b md:border-b-0 border-[#E5E7EB]' :''}`}
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-[#E8A317] mb-3">{s.label}</p>
                                    <p className="text-[#374151] font-medium leading-relaxed text-base">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Founder / Credibility — Signature Dark Section ── */}
                <section className="bg-[#1A1A1A]">
                    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
                        <div className="max-w-3xl">
                            <p className="text-[#6B7280] text-sm font-bold uppercase tracking-widest mb-8">Why this exists</p>
                            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-10">"I built this because after every trip, the settling-up process took longer than the trip itself. There had to be a better way."
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-[#374151] flex items-center justify-center rounded text-white font-black text-lg">
                                    U
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">Utkarsh</p>
                                    <p className="text-[#6B7280] text-sm font-medium">Founder · <a href="mailto:support@travelcfo.app" className="hover:text-slate-300 transition-colors underline underline-offset-2">support@travelcfo.app</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ── */}
                <section className="border-t border-[#E5E7EB] bg-[#FAFAF7]">
                    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight mb-2">
                                Your next trip deserves<br />better than a group chat.
                            </h2>
                            <p className="text-[#6B7280] font-medium">Free to use. No credit card. No catch.</p>
                        </div>
                        <button
                            onClick={() => setShowAuth(true)}
                            className="shrink-0 px-8 py-4 bg-[#1A1A1A] text-white rounded-lg font-black text-base hover:bg-black transition-all flex items-center gap-2 group w-fit"
                        >
                            Try it — it's free
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </section>

            </main>

            {/* ── Minimal Footer ── */}
            <footer className="border-t border-[#E5E7EB] px-6 md:px-10 py-8 bg-[#FAFAF7]">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-[#9CA3AF] font-medium">
                    <p>© {new Date().getFullYear()} TravelCFO</p>
                    <div className="flex gap-6">
                        <a href="/?view=about" className="hover:text-[#374151] transition-colors">About</a>
                        <a href="/?view=features" className="hover:text-[#374151] transition-colors">Features</a>
                        <a href="/?view=privacy" className="hover:text-[#374151] transition-colors">Privacy</a>
                        <a href="/?view=terms" className="hover:text-[#374151] transition-colors">Terms</a>
                    </div>
                </div>
            </footer>

            {/* ── Auth Modal ── */}
            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A1A]/50 backdrop-blur-sm"
                        onClick={() => setShowAuth(false)}
                    >
                        <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[420px]">
                            <Auth isModal={true} onClose={() => setShowAuth(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;
