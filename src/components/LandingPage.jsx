import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, List, X, Receipt, Users, ChartBar, FileArrowDown, WifiHigh, DeviceMobile, ListDashes } from '@phosphor-icons/react';
import SEO from './common/SEO';
import Auth from './Auth';
import { SITE_URL } from '../constants';

const LandingPage = ({ currentView, setCurrentView }) => {
    // MARKETING_ILLUSTRATIVE_PLACEHOLDER: These values are static illustrative placeholders for the public landing page.
    // In a signed-in preview or dashboard view, these would be fetched from database records.
    const ILLUSTRATIVE_TRIP_TITLE = "Bihar Exploration";
    const ILLUSTRATIVE_TRIP_DATE = "Day 1 - Oct 15, 2026";
    const ILLUSTRATIVE_TRIP_STATUS = "ACTIVE";
    const ILLUSTRATIVE_TRIP_BUDGET_LEFT = "₹13,800 LEFT";
    const ILLUSTRATIVE_TRIP_WALLET = "₹1,200 / ₹15,000";
    const ILLUSTRATIVE_BUDGET_PERCENT = 8; // (₹1,200 is 8% of ₹15,000)
    
    // Today's Flow details
    const ILLUSTRATIVE_FLOW_1_TIME = "13:00";
    const ILLUSTRATIVE_FLOW_1_TITLE = "Hotel Check-in";
    const ILLUSTRATIVE_FLOW_1_DESC = "Hotel Bihar Residency";
    const ILLUSTRATIVE_FLOW_2_TIME = "17:07";
    const ILLUSTRATIVE_FLOW_2_TITLE = "Local Dinner";
    const ILLUSTRATIVE_FLOW_2_DESC = "Street food tour";
    const ILLUSTRATIVE_FLOW_2_AMOUNT = "-₹1,200";

    const [showAuth, setShowAuth] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
    const [budgetPercent, setBudgetPercent] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [canTilt, setCanTilt] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            setBudgetPercent(ILLUSTRATIVE_BUDGET_PERCENT);
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
        title: "Stop texting\n'who owes\nwhat' after\nevery trip.",
        desc: "Stop texting 'who owes what' and chasing receipts. Plan itineraries, log expenses, and settle splits automatically."
    };

    const contentMap = {
        'travel-expense-tracker': {
            eyebrow: "Free Expense Tracker",
            title: "Log it now.\nSettle it later.",
            desc: "Tap, pick who paid, done. No more mental math at the restaurant."
        }, 'group-trip-planner': {
            eyebrow: "Group Trip Planning",
            title: "Plan together.\nFight about\nnothing.",
            desc: "Everyone logs their own expenses. Balances update automatically. No spreadsheet handoffs."
        }, 'vacation-budget-app': {
            eyebrow: "Vacation Budget",
            title: "Know what\nyou spent\nbefore you land.",
            desc: "See exactly where the money went — food, transport, accommodation — in real time."
        }, 'itinerary-builder': {
            eyebrow: "Itinerary Builder",
            title: "Your trip,\nnot a Notes app\ndump.",
            desc: "Day-by-day plans, tickets, maps. One place. Works offline too."
        }
    };

    const content = contentMap[currentView] || defaultContent;

    // Features for the asymmetric layout
    const heroFeature = {
        icon: <Receipt size={20} strokeWidth={1.5} className="text-[#374151]" />,
        title: "Plan the trip. Track the bill. Actually enjoy the vacation.",
        desc: "Pick who paid. Choose how to split it. Done. TravelCFO does the math so you don't have to hold it all in your head during the trip.",
        detail: "Multi-currency. Syncs instantly to everyone's phone."
    };

    const otherFeatures = [
        {
            icon: <Users size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title: "Everyone adds their own stuff",
            desc: "Invite your group. Each person logs their own expenses. No one's chasing receipts at midnight."
        },
        {
            icon: <ChartBar size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title: "See where it actually went",
            desc: "Turns out 40% was food. 18% was \"miscellaneous.\" The chart doesn't lie."
        },
        {
            icon: <FileArrowDown size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title: "Export a clean PDF",
            desc: "When it's time to settle up, export the full breakdown. Nobody argues with a PDF."
        },
        {
            icon: <DeviceMobile size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title: "Log from anywhere",
            desc: "Taxi in Bangkok. Night market in Chiang Mai. You don't need a laptop for this."
        },
        {
            icon: <WifiHigh size={18} strokeWidth={1.5} className="text-[#374151]" />,
            title: "Works without signal",
            desc: "Log offline on the mountain. It syncs when you're back on WiFi. Nothing disappears."
        }
    ];

    const scenarios = [
        {
            label: "The friend group",
            desc: "Six people. Four dinners, two Ubers, one Airbnb, and nobody can remember who paid for the boat thing. TravelCFO remembers."
        },
        {
            label: "The couple",
            desc: "'Wait, didn't we already go over budget on the hotel?' You did. You'll know in real time now — not on the flight home."
        },
        {
            label: "The solo traveler",
            desc: "Your Notes app has 31 entries that just say'€12.' TravelCFO gives those receipts an actual home."
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
            <nav className={`w-full px-6 md:px-10 py-4 flex justify-between items-center fixed top-0 left-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-[#0B1016]/95 border-b border-white/10 backdrop-blur-md shadow-lg text-white' 
                    : 'bg-transparent border-b border-white/5 text-white'
            }`}>
                <button onClick={() => setCurrentView && setCurrentView('dashboard')} className="flex items-center gap-2 text-left focus:outline-none">
                    <span className="font-extrabold text-xl tracking-tight">
                        Travel<span className="text-[#FFB338]">CFO</span>
                    </span>
                </button>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-7 items-center">
                    <button 
                        onClick={() => setCurrentView && setCurrentView('features')} 
                        className={`text-sm font-semibold hover:text-[#FFB338] transition-colors focus:outline-none ${scrolled ? 'text-white/80' : 'text-white/90'}`}
                    >
                        Features
                    </button>
                    <button 
                        onClick={() => setCurrentView && setCurrentView('about')} 
                        className={`text-sm font-semibold hover:text-[#FFB338] transition-colors focus:outline-none ${scrolled ? 'text-white/80' : 'text-white/90'}`}
                    >
                        About
                    </button>
                    <button 
                        onClick={() => setCurrentView && setCurrentView('protips')} 
                        className={`text-sm font-semibold hover:text-[#FFB338] transition-colors focus:outline-none ${scrolled ? 'text-white/80' : 'text-white/90'}`}
                    >
                        Pro Tips
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAuth(true)}
                        className="hidden md:block px-5 py-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold transition-all text-sm backdrop-blur-sm focus:outline-none"
                    >
                        Get Early Access →
                    </button>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden text-white p-2 focus:outline-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X size={22} className="text-white" /> : <ListDashes size={22} className="text-white" />}
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
                            <button
                                onClick={() => { setCurrentView && setCurrentView('features'); setMobileMenuOpen(false); }}
                                className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB] text-left w-full focus:outline-none"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => { setCurrentView && setCurrentView('about'); setMobileMenuOpen(false); }}
                                className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB] text-left w-full focus:outline-none"
                            >
                                About
                            </button>
                            <button
                                onClick={() => { setCurrentView && setCurrentView('protips'); setMobileMenuOpen(false); }}
                                className="text-base font-semibold text-[#374151] py-1.5 border-b border-[#E5E7EB] text-left w-full focus:outline-none"
                            >
                                Pro Tips
                            </button>
                            <button
                                onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                                className="w-full btn-primary py-3 mt-2 rounded-lg"
                            >
                                Get Early Access
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main Content ── */}
            <main>

                {/* ── Hero ── */}
                <section className="relative isolate overflow-hidden min-h-screen flex items-center bg-[#0B1016] text-white">
                    {/* Background Sunset Image and Overlays */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/sunset-hero.jpg" 
                            alt="Sunset Background" 
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Dark gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/65 md:bg-gradient-to-r md:from-black/80 md:via-black/35 md:to-black/55" />
                        
                        {/* Glow and Grid Overlay carry forward */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,56,0.18),_transparent_40%),radial-gradient(circle_at_82%_18%,_rgba(255,255,255,0.06),_transparent_35%)]" />
                        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 44px), repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 44px)' }} />
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05), transparent 50%)' }} />
                    </div>

                    <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 md:px-10 lg:grid lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:py-28 w-full">
                        {/* Left Column */}
                        <motion.div
                            initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 26, filter: 'blur(10px)' } : false}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: reducedMotion ? 0 : 0.7, ease: heroBezier, delay: 0 }}
                            className="max-w-xl z-10"
                        >
                            <motion.h1
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 24, filter: 'blur(10px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.7, ease: heroBezier, delay: 0.12 }}
                                className="text-5xl font-black leading-[1.0] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl"
                            >
                                Chase the
                                <br />
                                <span className="text-[#FFB338]">Sunset.</span>
                            </motion.h1>

                            <motion.p
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 20, filter: 'blur(8px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.6, ease: heroBezier, delay: 0.12 + 0.5 + 0.2 }}
                                className="mt-6 max-w-[460px] text-base leading-relaxed text-white/80 sm:text-lg font-medium"
                            >
                                Let your finances handle themselves in the background. Real-time budget tracking, so you can actually enjoy the golden hour.
                            </motion.p>

                            <motion.div
                                initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 18, filter: 'blur(8px)' } : false}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: reducedMotion ? 0 : 0.55, ease: heroBezier, delay: 0.12 + 0.5 + 0.2 + 0.5 + 0.25 }}
                                className="mt-8"
                            >
                                <motion.button
                                    onClick={() => setShowAuth(true)}
                                    className="px-8 py-3.5 bg-[#FFB338] text-black rounded-full font-black uppercase tracking-wider text-sm shadow-[0_15px_40px_rgba(255,179,56,0.3)] hover:bg-[#ffa924] transition-all"
                                    whileHover={reducedMotion ? undefined : { scale: 1.04, transition: { duration: 0.16, ease: 'easeOut' } }}
                                    whileTap={reducedMotion ? undefined : { scale: 0.97, transition: { duration: 0.1 } }}
                                >
                                    START EXPLORING
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Right Column */}
                        <motion.div
                            initial={heroAnimate && !reducedMotion ? { opacity: 0, y: 40, rotateY: -12, filter: 'blur(6px)' } : false}
                            animate={{ opacity: 1, y: 0, rotateY: 0, filter: 'blur(0px)' }}
                            transition={{ duration: reducedMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                            className="relative w-full max-w-[480px] self-center justify-self-center z-10"
                            onMouseMove={handleCardMove}
                            onMouseLeave={handleCardLeave}
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: reducedMotion ? 'none' : `perspective(1200px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                                transition: reducedMotion ? 'none' : 'transform 200ms ease-out'
                            }}
                        >
                            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/45 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,179,56,0.12),_transparent_40%)]" />
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.04), transparent 25%)' }} />

                                <div className="relative">
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-white tracking-tight">{ILLUSTRATIVE_TRIP_TITLE}</h3>
                                            <p className="text-xs font-semibold text-white/50 mt-1">{ILLUSTRATIVE_TRIP_DATE}</p>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                            <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${reducedMotion ? '' : 'animate-pulse'}`} />
                                            {ILLUSTRATIVE_TRIP_STATUS}
                                        </div>
                                    </div>

                                    {/* Trip Wallet Section */}
                                    <div className="mt-8">
                                        <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-white/40">
                                            <span>TRIP WALLET</span>
                                            <span className="text-emerald-400 font-bold">{ILLUSTRATIVE_TRIP_BUDGET_LEFT}</span>
                                        </div>
                                        <div className="mt-2.5 flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">₹1,200</span>
                                            <span className="text-white/40 text-sm font-semibold">/ ₹15,000</span>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-white/10">
                                            <motion.div
                                                className="h-full rounded-full bg-[#FFB338] shadow-[0_0_10px_rgba(255,179,56,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${budgetPercent}%` }}
                                                transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.2 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Today's Flow Section */}
                                    <div className="mt-8 border-t border-white/5 pt-6">
                                        <h4 className="text-[10px] font-black tracking-widest text-white/40 mb-4">TODAY'S FLOW</h4>
                                        <div className="space-y-4">
                                            {/* Flow Item 1 */}
                                            <div className="flex items-start gap-4">
                                                <span className="text-sm font-bold text-[#FFB338] w-12 shrink-0">{ILLUSTRATIVE_FLOW_1_TIME}</span>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{ILLUSTRATIVE_FLOW_1_TITLE}</p>
                                                    <p className="text-xs text-white/50 mt-0.5">{ILLUSTRATIVE_FLOW_1_DESC}</p>
                                                </div>
                                            </div>

                                            {/* Flow Item 2 */}
                                            <div className="flex items-start gap-4">
                                                <span className="text-sm font-bold text-[#FFB338] w-12 shrink-0">{ILLUSTRATIVE_FLOW_2_TIME}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-white">{ILLUSTRATIVE_FLOW_2_TITLE}</p>
                                                    <p className="text-xs text-white/50 mt-0.5">{ILLUSTRATIVE_FLOW_2_DESC}</p>
                                                </div>
                                                <span className="text-sm font-bold text-[#FFB338]">{ILLUSTRATIVE_FLOW_2_AMOUNT}</span>
                                            </div>
                                        </div>
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
                                { name: 'Airbnb Ubud (5 nights)', payer: 'Utkarsh', amount: '₹28,400', split: '3 people' },
                                { name: 'Airport taxi', payer: 'Priya', amount: '₹1,200', split: '3 people' },
                                { name: 'Dinner at Locavore', payer: 'Rahul', amount: '₹4,800', split: '3 people' },
                                { name: 'Scooter rental (2 days)', payer: 'Utkarsh', amount: '₹2,600', split: '2 people' },
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
                                    className={`p-8 bg-white ${i < scenarios.length - 1 ? 'md:border-r border-b md:border-b-0 border-[#E5E7EB]' : ''}`}
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
                        <button onClick={() => { setCurrentView && setCurrentView('about'); window.scrollTo(0, 0); }} className="hover:text-[#374151] transition-colors font-medium focus:outline-none">About</button>
                        <button onClick={() => { setCurrentView && setCurrentView('features'); window.scrollTo(0, 0); }} className="hover:text-[#374151] transition-colors font-medium focus:outline-none">Features</button>
                        <button onClick={() => { setCurrentView && setCurrentView('privacy'); window.scrollTo(0, 0); }} className="hover:text-[#374151] transition-colors font-medium focus:outline-none">Privacy</button>
                        <button onClick={() => { setCurrentView && setCurrentView('terms'); window.scrollTo(0, 0); }} className="hover:text-[#374151] transition-colors font-medium focus:outline-none">Terms</button>
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
