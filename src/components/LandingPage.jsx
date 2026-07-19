import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, List, X, Receipt, Users, ChartBar, FileArrowDown, WifiHigh, DeviceMobile, ListDashes } from '@phosphor-icons/react';
import SEO from'./common/SEO';
import Auth from'./Auth';
import { SITE_URL } from '../constants';

const LandingPage = ({ currentView }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [budgetPercent, setBudgetPercent] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [canTilt, setCanTilt] = useState(false);

    // Fire hero entrance once per page load — survives re-renders, resets on hard reload
    const heroHasFired = useRef(false);
    const heroAnimate = !heroHasFired.current;
    if (!heroHasFired.current) heroHasFired.current = true;

    // Shared cubic-bezier for headline entrance
    const heroBezier = [0.2, 0.7, 0.2, 1];

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
        const pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');

        const updateMotionPreference = () => {
            const prefersReducedMotion = motionMedia.matches;
            setReducedMotion(prefersReducedMotion);
            setCanTilt(pointerMedia.matches && !prefersReducedMotion);
        };

        updateMotionPreference();

        if (motionMedia.addEventListener) {
            motionMedia.addEventListener('change', updateMotionPreference);
            pointerMedia.addEventListener('change', updateMotionPreference);
        } else {
            motionMedia.addListener(updateMotionPreference);
            pointerMedia.addListener(updateMotionPreference);
        }

        const timer = window.setTimeout(() => {
            setBudgetPercent(74);
        }, reducedMotion ? 0 : 1100);

        return () => {
            window.clearTimeout(timer);
            if (motionMedia.removeEventListener) {
                motionMedia.removeEventListener('change', updateMotionPreference);
                pointerMedia.removeEventListener('change', updateMotionPreference);
            } else {
                motionMedia.removeListener(updateMotionPreference);
                pointerMedia.removeListener(updateMotionPreference);
            }
        };
    }, [reducedMotion]);

    const handleCardMove = (event) => {
        if (!canTilt || reducedMotion) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;
        const offsetX = (x / bounds.width) - 0.5;
        const offsetY = (y / bounds.height) - 0.5;

        setCardTilt({
            rotateX: -(offsetY * 10),
            rotateY: offsetX * 10
        });
    };

    const handleCardLeave = () => {
        if (!canTilt || reducedMotion) return;
        setCardTilt({ rotateX: 0, rotateY: 0 });
    };

    // --- Dynamic Content Strategy ---
    const defaultContent = {
        eyebrow: null,
        title:"Stop texting\n'who owes\nwhat' after\nevery trip.",
        desc:"Stop texting 'who owes what' and chasing receipts. Plan itineraries, log expenses, and settle splits automatically."
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
        title:"Plan the trip. Track the bill. Actually enjoy the vacation.",
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
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#e8553d] rounded-lg flex items-center justify-center text-white shadow-sm border border-white/10">
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
                        className="hidden md:block btn-primary px-5 py-2 rounded-lg text-sm"
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
                                className="w-full btn-primary py-3 mt-2 rounded-lg"
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
                <section className="relative isolate overflow-hidden bg-[#0B1016] text-white">
                    <div className="absolute inset-0" aria-hidden="true">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.24),_transparent_34%),radial-gradient(circle_at_82%_18%,_rgba(255,255,255,0.12),_transparent_32%)]" />
                        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 44px), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 44px)' }} />
                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.08), transparent 46%)' }} />
                    </div>

                    <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 md:px-10 lg:grid lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:py-28">
                        <motion.div
                            initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 26, filter: 'blur(10px)' } : false}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: reducedMotion ? 0 : 0.7, ease: heroBezier, delay: 0 }}
                            className="max-w-xl"
                        >
                            <motion.span
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 16, filter: 'blur(8px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.55, ease: heroBezier, delay: 0.04 }}
                                className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/35 bg-[#FF6B35]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFB38A]"
                            >
                                <span className={`h-2.5 w-2.5 rounded-full bg-[#FF6B35] ${reducedMotion ? '' : 'animate-pulse'}`} />
                                Public Beta
                            </motion.span>

                            <motion.h1
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 24, filter: 'blur(10px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.7, ease: heroBezier, delay: 0.18 }}
                                className="mt-6 text-4xl font-black leading-[0.92] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl"
                            >
                                Build the trip
                                <br />
                                before the chaos <span className="text-[#FF6B35]">starts.</span>
                            </motion.h1>

                            <motion.p
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 20, filter: 'blur(8px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.6, ease: heroBezier, delay: 0.18 + 0.7 + 0.25 }}
                                className="mt-6 max-w-[460px] text-base leading-7 text-white/70 sm:text-lg"
                            >
                                Keep every plan, receipt, and shared expense in one calm place so your group can travel lighter and settle up faster.
                            </motion.p>

                            <motion.div
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 18, filter: 'blur(8px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.55, ease: heroBezier, delay: 0.18 + 0.7 + 0.25 + 0.6 + 0.2 }}
                                className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
                            >
                                <motion.button
                                    onClick={() => setShowAuth(true)}
                                    className="btn-primary rounded-xl px-7 py-3.5 text-base font-extrabold shadow-[0_20px_50px_rgba(255,107,53,0.24)]"
                                    whileHover={reducedMotion ? undefined : { scale: 1.03, transition: { duration: 0.16, ease: 'easeOut' } }}
                                    whileTap={reducedMotion ? undefined : { scale: 0.98, transition: { duration: 0.1 } }}
                                >
                                    Start for free
                                </motion.button>
                                <p className="text-sm font-medium text-white/60">
                                    Trusted by 2,400+ travelers. No credit card required.
                                </p>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 24, rotateX: 6, rotateY: -8, filter: 'blur(6px)' } : false}
                            animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' }}
                            transition={{ duration: reducedMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                            className="relative w-full max-w-[480px] self-center justify-self-center"
                            onMouseMove={handleCardMove}
                            onMouseLeave={handleCardLeave}
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: `perspective(1200px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                                transition: reducedMotion ? 'none' : 'transform 250ms ease-out'
                            }}
                        >
                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,32,0.95),rgba(7,12,20,0.9))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.2),_transparent_40%)]" />
                                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.16), transparent 32%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 25%)' }} />

                                <div className="relative">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">Airline</p>
                                            <p className="mt-1 text-xl font-semibold text-white">Air India</p>
                                            <p className="mt-1 text-sm text-white/55">Flight AI 816</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                                            <span className={`h-2.5 w-2.5 rounded-full bg-emerald-400 ${reducedMotion ? '' : 'animate-pulse'}`} />
                                            On time
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-[22px] border border-white/10 bg-[#0F1721]/80 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Route</p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    <span className="text-3xl font-semibold tracking-[0.08em] text-white">DEL</span>
                                                    <div className="relative h-5 w-28 sm:w-32">
                                                        <div className="absolute inset-y-0 left-0 right-0 my-auto h-px border-t border-dashed border-white/25" />
                                                        <motion.span
                                                            className="absolute top-1/2 -translate-y-1/2 text-lg"
                                                            animate={reducedMotion ? { x: 0 } : { x: ['0%', '100%', '0%'] }}
                                                            transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity }}
                                                        >
                                                            ✈
                                                        </motion.span>
                                                    </div>
                                                    <span className="text-3xl font-semibold tracking-[0.08em] text-white">GOI</span>
                                                </div>
                                            </div>
                                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/75">
                                                1h 45m
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between text-sm text-white/65">
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Date</p>
                                                <p className="mt-1 font-semibold text-white/90">Aug 14</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Departure</p>
                                                <p className="mt-1 font-semibold text-white/90">06:40</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">Gate</p>
                                                <p className="mt-1 font-semibold text-white/90">B12</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <p className="font-semibold text-white/70">Trip Budget Utilized</p>
                                            <p className="font-semibold text-white">{budgetPercent}%</p>
                                        </div>
                                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB38A]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${budgetPercent}%` }}
                                                transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.2 }}
                                            />
                                        </div>
                                        <p className="mt-3 text-sm text-white/55">
                                            Illustrative preview · replace with real trip data for signed-in views.
                                        </p>
                                    </div>
                                </div>
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
                                <div className="w-11 h-11 bg-[#374151] flex items-center justify-center rounded text-white font-black text-sm">
                                    TC
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base">A message from founder</p>
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
