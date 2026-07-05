import React, { useState } from'react';
import { motion } from'framer-motion';
import { Receipt, Users, ChartBar, FileArrowDown, DeviceMobile, WifiHigh } from'@phosphor-icons/react';
import SEO from'./common/SEO';

const Features = ({ onShowAuth }) => {
    const [activeFeature, setActiveFeature] = useState(null);

    return (
        <div className="bg-[#FAFAF7] min-h-screen">
            <SEO
                title="What TravelCFO does — and why you'll actually use it"
                description="Six features. All aimed at one thing: finishing a trip without the awkward money conversation. Free to use."
                canonical="https://tripify-c49b6.web.app/?view=features"
            />

            {/* ── Header ── */}
            <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">What's inside</p>
                    <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-[0.95] mb-6">
                        Stop losing money to<br />"I'll figure it out later."
                    </h1>
                    <p className="text-lg text-[#6B7280] font-medium max-w-xl leading-relaxed">
                        Six things TravelCFO does. All aimed at one goal: finishing your trip without the awkward money talk.
                    </p>
                </motion.div>
            </div>

            {/* ── Feature 01: Hero full-width row ── */}
            <div className="border-t border-[#E5E7EB] bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, x: -14 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-xs font-black text-[#9CA3AF] tabular-nums">01</span>
                                <Receipt size={16} strokeWidth={1.5} className="text-[#374151]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tight mb-4 leading-[1.05]">
                                Log an expense in 3 taps.
                            </h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed mb-4 text-base">
                                Pick who paid. Choose how to split it. Done. TravelCFO figures out the balances — you don't have to carry the math in your head for the entire trip.
                            </p>
                            <ul className="space-y-2">
                                {['Multi-currency support','Custom split ratios (not just equal)','Categories: food, transport, stays, activities'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280] font-medium">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#E8A317] shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 14 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#1A1A1A] rounded-xl p-6"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Bali Trip · 6 people</span>
                                <span className="text-[#1A1A1A] text-xs font-bold">● Synced</span>
                            </div>
                            {[
                                { name:'Airbnb (5 nights)', payer:'Utkarsh', amount:'₹28,400', cat:'Stay' },
                                { name:'Dinner at Locavore', payer:'Priya', amount:'₹4,800', cat:'Food' },
                                { name:'Scooter rental', payer:'Rahul', amount:'₹2,600', cat:'Transport' },
                                { name:'Temple entry fees', payer:'Utkarsh', amount:'₹900', cat:'Activities' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-[#374151] last:border-0">
                                    <div>
                                        <p className="text-white text-sm font-semibold">{item.name}</p>
                                        <p className="text-[#6B7280] text-xs mt-0.5">{item.payer} paid · <span className="text-[#6B7280]">{item.cat}</span></p>
                                    </div>
                                    <span className="text-white font-black text-sm">{item.amount}</span>
                                </div>
                            ))}
                            <div className="mt-5 pt-4 border-t border-[#374151] flex justify-between items-center">
                                <span className="text-[#9CA3AF] text-xs font-bold uppercase tracking-widest">Your share</span>
                                <span className="text-[#1A1A1A] font-black text-xl">₹12,400</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            {/* ── Signature Moment: Phone Mockup Break ── */}
            <div className="w-full bg-[#FAFAF7] overflow-hidden py-16 md:py-24 flex justify-center border-t border-[#E5E7EB]">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative"
                >
                    {/* The Phone Frame */}
                    <div className="w-[300px] md:w-[340px] h-[600px] md:h-[680px] bg-white rounded-[2.5rem] md:rounded-[3rem] border-[12px] md:border-[14px] border-[#1A1A1A] shadow-[0_45px_70px_-15px_rgba(0,0,0,0.4)] rotate-[-5deg] relative overflow-hidden flex flex-col hover:rotate-[-2deg] hover:scale-105 transition-all duration-700">
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 md:h-7 flex justify-center z-20">
                            <div className="w-24 md:w-28 h-5 md:h-6 bg-[#1A1A1A] rounded-b-[1rem]" />
                        </div>
                        
                        {/* Fake App Content inside phone */}
                        <div className="flex-1 bg-[#FAFAF7] pt-12 md:pt-14 px-4 md:px-5 pb-6 overflow-hidden relative">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] leading-none tracking-tight">Japan 2026</h3>
                                    <p className="text-[11px] md:text-xs text-[#6B7280] font-bold mt-1 uppercase tracking-widest">5 members</p>
                                </div>
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-md">
                                    <span className="text-sm md:text-base font-bold">+</span>
                                </div>
                            </div>
                            
                            {/* Balances Card */}
                            <div className="bg-[#1A1A1A] text-white rounded-2xl md:rounded-[1.25rem] p-4 md:p-5 mb-5 shadow-xl">
                                <p className="text-[9px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">You are owed</p>
                                <h4 className="text-2xl md:text-3xl font-black tracking-tight">¥42,500</h4>
                                <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-white/10 flex justify-between text-[10px] md:text-[11px] font-semibold text-white/80">
                                    <span>From Rahul (¥12k)</span>
                                    <span>From Priya (¥30.5k)</span>
                                </div>
                            </div>

                            {/* Recent Expenses */}
                            <h4 className="text-sm md:text-base font-black text-[#1A1A1A] mb-3 mt-6 tracking-tight">Recent Expenses</h4>
                            <div className="space-y-2 md:space-y-3 relative z-10">
                                {[
                                    { name: 'Shinkansen Tickets', amount: '¥32,000', payer: 'Utkarsh' },
                                    { name: '7-Eleven Snacks', amount: '¥1,450', payer: 'Priya' },
                                    { name: 'Izakaya Dinner', amount: '¥14,800', payer: 'Rahul' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 md:p-3.5 bg-white rounded-xl md:rounded-[1rem] shadow-sm border border-[#E5E7EB]">
                                        <div>
                                            <p className="text-xs md:text-sm font-extrabold text-[#1A1A1A] leading-tight">{item.name}</p>
                                            <p className="text-[9px] md:text-[10px] text-[#6B7280] font-bold mt-1 uppercase tracking-widest">{item.payer} paid</p>
                                        </div>
                                        <span className="text-xs md:text-sm font-black text-[#1A1A1A]">{item.amount}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Glass reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none transform -skew-x-[20deg] translate-x-[-100%] animate-[shimmer_8s_infinite] z-20" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ── Features 02–03: Side by side, unequal width ── */}
            <div className="border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Feature 02: 3/5 */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-3 bg-white border border-[#E5E7EB] rounded-xl p-8"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-xs font-black text-[#9CA3AF] tabular-nums">02</span>
                                <Users size={16} strokeWidth={1.5} className="text-[#374151]" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight mb-3 leading-tight">
                                Everyone adds their own stuff
                            </h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed mb-5">
                                Invite your group. Each person logs from their own phone. No one's chasing screenshots of receipts at midnight.
                            </p>
                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                                <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-3">Active now</p>
                                {['Utkarsh','Priya','Rahul'].map((name, i) => (
                                    <div key={i} className="flex items-center gap-2 mb-2 last:mb-0">
                                        <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-white text-[9px] font-black">{name[0]}</div>
                                        <span className="text-[#374151] text-sm font-medium">{name}</span>
                                        <span className="text-[#1A1A1A] text-[10px] font-bold ml-auto">● online</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Feature 03: 2/5 */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.08 }}
                            className="md:col-span-2 bg-white border border-[#E5E7EB] rounded-xl p-8"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <span className="text-xs font-black text-[#9CA3AF] tabular-nums">03</span>
                                <ChartBar size={16} strokeWidth={1.5} className="text-[#374151]" />
                            </div>
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mb-3 leading-tight">
                                See where it actually went
                            </h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed mb-5">
                                Turns out 40% was food. 18% was"miscellaneous." The chart doesn't lie — and it's weirdly satisfying to look at.
                            </p>
                            {/* Mini fake bar chart */}
                            <div className="space-y-2.5">
                                {[
                                    { label:'Food', pct: 40, color:'bg-slate-800' },
                                    { label:'Stay', pct: 32, color:'bg-slate-600' },
                                    { label:'Transport', pct: 18, color:'bg-slate-400' },
                                    { label:'Activities', pct: 10, color:'bg-slate-300' },
                                ].map((b, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-bold text-[#6B7280] mb-1">
                                            <span>{b.label}</span><span>{b.pct}%</span>
                                        </div>
                                        <div className="h-2  rounded-full overflow-hidden">
                                            <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── Features 04–06: Single column numbered list ── */}
            <div className="border-t border-[#E5E7EB] bg-white">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20">
                    <div className="divide-y divide-[#E5E7EB]">
                        {[
                            {
                                num:'04',
                                icon: <FileArrowDown size={16} strokeWidth={1.5} className="text-[#374151]" />,
                                title:'Nobody argues with a PDF',
                                desc:"Export a clean breakdown of every expense and who owes what. It's shareable, readable, and works offline."
                            },
                            {
                                num:'05',
                                icon: <DeviceMobile size={16} strokeWidth={1.5} className="text-[#374151]" />,
                                title:'Log from anywhere',
                                desc:"Taxi in Bangkok. Night market in Chiang Mai. Airport gate. You don't need your laptop for any of this."
                            },
                            {
                                num:'06',
                                icon: <WifiHigh size={16} strokeWidth={1.5} className="text-[#374151]" />,
                                title:'Works without signal',
                                desc:"Log on the mountain, sync when you're back on WiFi. Nothing disappears. Not even the \"miscellaneous\" entries."
                            }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                className="py-8 flex flex-col md:flex-row gap-5 md:gap-14 md:items-start"
                            >
                                <div className="flex items-center gap-3 md:w-52 shrink-0">
                                    <span className="text-xs font-black text-[#1A1A1A] tabular-nums">{feat.num}</span>
                                    {feat.icon}
                                    <h3 className="font-black text-[#1A1A1A] text-base">{feat.title}</h3>
                                </div>
                                <p className="text-[#6B7280] font-medium leading-relaxed md:max-w-lg">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Dark CTA Strip — Signature Moment ── */}
            <div className="bg-[#1A1A1A]">
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                            Your next trip deserves<br />better than a group chat.
                        </h2>
                        <p className="text-[#6B7280] font-medium">Free. No credit card. Works for real trips.</p>
                    </div>
                    <a
                        href="/"
                        className="shrink-0 px-7 py-3.5 bg-white text-[#1A1A1A] rounded-lg font-black text-base hover: transition-colors w-fit"
                    >
                        Try it — it's free
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Features;
