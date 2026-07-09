import React from 'react';
import { motion } from 'framer-motion';

const ProTips = () => {
    const tips = [
        {
            id: 1,
            num: '01',
            category: 'Money',
            title: "Log it while the waiter's still at the table.",
            content: "The #1 reason expense tracking fails: people wait until the end of the day and forget half of it. Pull out your phone right now. It takes 8 seconds. You'll thank yourself at checkout."
        },
        {
            id: 2,
            num: '02',
            category: 'Navigation',
            title: "Download offline maps before you leave the hotel.",
            content: "Google Maps lets you save entire cities for offline use. Do it on hotel WiFi. The moment at the airport when you realize you didn't — that's a bad moment."
        },
        {
            id: 3,
            num: '03',
            category: 'Safety',
            title: "Get travel insurance. No, seriously.",
            content: "One cancelled flight, one hospital visit, one lost bag. That's when you'll wish you had it. Basic policies start around ₹800 for a week. Just get it."
        },
        {
            id: 4,
            num: '04',
            category: 'Photography',
            title: "Wake up an hour early. Just once.",
            content: "Golden hour — the 45 minutes after sunrise — gives you light that no filter can replicate and crowds that haven't shown up yet. Do it once and you'll keep doing it."
        },
        {
            id: 5,
            num: '05',
            category: 'Food',
            title: "If the menu has photos, keep walking.",
            content: "Picture menus, waiters waving you in, laminated English translations — all signs you're about to pay tourist prices for mediocre food. One street over is almost always better."
        }
    ];

    // Featured tip (larger) + remaining 4
    const [featured, ...rest] = tips;

    return (
        <div className="bg-[#FAFAF7] min-h-screen">
            {/* ── Header ── */}
            <div className="max-w-5xl mx-auto px-6 md:px-10 pt-14 pb-14">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <p className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">Practical advice</p>
                    <h1 className="text-5xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter leading-[0.93] mb-5">
                        Stuff we wish someone<br />
                        <em className="not-italic text-[#9CA3AF]">told us first.</em>
                    </h1>
                    <p className="text-lg text-[#6B7280] font-medium max-w-lg leading-relaxed">
                        No "pack light" advice. These are things that actually changed how we travel.
                    </p>
                </motion.div>
            </div>

            {/* ── Staggered layout: featured card full-width, then 2×2 ── */}
            <div className="border-t border-[#E5E7EB] bg-white">
                <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 md:py-20 space-y-5">

                    {/* Featured tip — spans full width, left-border accent */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="border-l-4 border-slate-900 pl-7 pr-7 py-8 bg-white border border-l-slate-900 border-[#E5E7EB] rounded-r-xl"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-black text-slate-300 tabular-nums">{featured.num}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#E8A317]">{featured.category}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tight mb-3">
                            {featured.title}
                        </h2>
                        <p className="text-[#6B7280] font-medium leading-relaxed max-w-2xl">{featured.content}</p>
                    </motion.div>

                    {/* 2×2 grid for remaining tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {rest.map((tip, index) => (
                            <motion.div
                                key={tip.id}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.07 }}
                                className="border border-[#E5E7EB] rounded-xl p-7 bg-white hover:border-[#E5E7EB] transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-black text-slate-300 tabular-nums">{tip.num}</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">{tip.category}</span>
                                </div>
                                <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight mb-2">{tip.title}</h3>
                                <p className="text-[#6B7280] font-medium leading-relaxed text-sm">{tip.content}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Honest footer note ── */}
            <div className="border-t border-[#E5E7EB]">
                <div className="max-w-5xl mx-auto px-6 md:px-10 py-10">
                    <p className="text-[#9CA3AF] text-sm font-medium">
                        Got a tip that actually helped?{' '}
                        <a
                            href="mailto:support@travelcfo.app"
                            className="text-[#374151] font-semibold underline underline-offset-2 hover:text-[#1A1A1A] transition-colors"
                        >
                            Send it our way.
                        </a>
                        {' '}The good ones end up on this page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProTips;
