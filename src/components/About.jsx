import React from 'react';
import { motion } from 'framer-motion';
import SEO from './common/SEO';

const About = ({ setCurrentView }) => {

    const usps = [
        {
            num: '01',
            title: "It's clean. No clutter.",
            desc: "You see your expenses, your balances, your trip. That's it. Nothing else fighting for your attention."
        },
        {
            num: '02',
            title: "Charts that actually tell you something",
            desc: "Not just a pie chart. Breakdowns by category, by day, by person. You'll know exactly who overspent on food. (It's always food.)"
        },
        {
            num: '03',
            title: "Built for groups from the start",
            desc: "Invite your friends. They log their own stuff. Balances calculate automatically. You don't email anyone a spreadsheet."
        },
        {
            num: '04',
            title: "Phone, laptop — it doesn't matter",
            desc: "Log from your phone at the restaurant. Check the totals on your laptop later. Always in sync."
        },
        {
            num: '05',
            title: "Categories that fit actual travel",
            desc: "Food, transport, stays, activities. Not \"accounts receivable.\" Real categories for real trips."
        },
        {
            num: '06',
            title: "AI recommendations (coming soon)",
            desc: "We're building smart nudges — like when you're 80% through your food budget on day 3 of a 7-day trip."
        },
        {
            num: '07',
            title: "First expense in under 30 seconds",
            desc: "Sign up. Create a trip. Add an expense. There's no onboarding wizard. No tutorial. Just go."
        }
    ];

    const scenarios = [
        {
            group: "The friend group",
            story: "Six people. Four dinners, two Ubers, one Airbnb, and one very expensive boat thing. Nobody can remember who paid for what. TravelCFO does."
        },
        {
            group: "The couple",
            story: "'Wait, didn't we already go over budget?' Yes. Now you'll know before it happens, not on the flight home."
        },
        {
            group: "The solo traveler",
            story: "Your Notes app has 31 entries that say '€12.' That's not tracking. That's wishful thinking."
        },
        {
            group: "The family",
            story: "One villa. Four adults. Two sets of in-laws. Someone's keeping a mental tally. It might as well be TravelCFO."
        }
    ];

    return (
        <div className="bg-[#FAFAF7] min-h-screen">
            <SEO
                title="About TravelCFO — why we built it and who it's actually for"
                description="TravelCFO started as a shared Google Sheet after a Goa trip. Now it's an app. Here's the real story."
                canonical="https://tripify-c49b6.web.app/?view=about"
            />

            {/* ── Header ── */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">The story</p>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1A1A1A] tracking-tighter leading-[0.93] mb-6">
                        We got tired of<br />post-trip spreadsheet debt.
                    </h1>
                    <p className="text-lg text-[#6B7280] font-medium max-w-xl leading-relaxed">
                        TravelCFO started as a shared Google Sheet after a Goa trip. The settling-up took three days. Now it's a real app. Built by someone who kept losing friends to post-trip money arguments.
                    </p>
                </motion.div>
            </div>

            {/* ── Mission + Origin — two honest cards ── */}
            <div className="border-t border-[#E5E7EB] bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="border border-[#E5E7EB] rounded-xl p-8 md:p-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-5">Mission</p>
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-4">
                                Make the money part disappear.
                            </h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed">
                                Whether it's a two-week Europe trip or splitting one dinner bill — TravelCFO should handle the math so thoroughly that you forget there is any math.
                            </p>
                        </div>
                        <div className="border border-[#E5E7EB] rounded-xl p-8 md:p-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-5">Origin</p>
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-4">
                                A Goa trip that took 3 days to settle.
                            </h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed">
                                After a trip where the post-trip money stuff lasted longer than the trip itself, Utkarsh built the first version in a weekend. It was rough. It worked. Now it doesn't look rough.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Why TravelCFO — numbered timeline list ── */}
            <div className="border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-12">
                        Why it's worth trying.
                    </h2>
                    <div className="divide-y divide-[#E5E7EB]">
                        {usps.map((usp, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="py-7 flex flex-col md:flex-row gap-4 md:gap-14 md:items-start"
                            >
                                <div className="flex items-center gap-4 md:w-56 shrink-0">
                                    <span className="text-xl font-black text-slate-200 tabular-nums">{usp.num}</span>
                                    <h3 className="font-black text-[#1A1A1A] text-base">{usp.title}</h3>
                                </div>
                                <p className="text-[#6B7280] font-medium leading-relaxed md:max-w-lg">{usp.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Real Scenarios ── */}
            <div className="border-t border-[#E5E7EB] bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-4">
                        Who we actually built it for.
                    </h2>
                    <p className="text-[#6B7280] font-medium mb-12 max-w-xl">
                        Not "every type of traveler." These four specific types of people.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {scenarios.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="border border-[#E5E7EB] rounded-xl p-7"
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-[#E8A317] mb-3">{s.group}</p>
                                <p className="text-[#374151] font-medium leading-relaxed">{s.story}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Founder Dark Section — Signature Moment ── */}
            <div className="bg-[#1A1A1A]">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
                    <p className="text-[#6B7280] text-xs font-black uppercase tracking-widest mb-8">From the founder</p>
                    
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                        <div className="flex-1">
                            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug tracking-tight mb-8 max-w-3xl">
                                "I built TravelCFO after a trip to Japan where 5 friends spent 2 weeks arguing about who paid for what. There had to be a better way.<br /><br />
                                I wanted to build something that felt fast, human, and completely eliminated the post-trip spreadsheet handoff."
                            </blockquote>
                            <div className="flex items-center gap-5 mb-10 md:mb-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#E8A317] to-orange-500 flex items-center justify-center text-white font-black text-2xl rounded-full shadow-[0_0_20px_rgba(232,163,23,0.3)] border border-[#1A1A1A] ring-2 ring-white/10 shrink-0">
                                    U
                                </div>
                                <div>
                                    <p className="text-white font-extrabold text-lg">Utkarsh</p>
                                    <p className="text-[#9CA3AF] text-sm font-semibold mt-0.5">
                                        Founder · <a href="mailto:utkarshgupta9759@gmail.com" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20">utkarshgupta9759@gmail.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex items-end h-full mt-4 md:mt-auto">
                            <button
                                onClick={() => setCurrentView('dashboard')}
                                className="px-8 py-4 bg-white text-[#1A1A1A] rounded-xl font-black text-base hover:bg-gray-100 transition-transform hover:scale-105 active:scale-95 shadow-xl"
                            >
                                Try it — it's free
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
