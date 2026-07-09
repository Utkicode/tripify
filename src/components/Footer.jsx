import React from'react';
import { EnvelopeSimple, Shield, FileText, Bug } from'@phosphor-icons/react';

const Footer = ({ setCurrentView, onOpenFeedback }) => {
    const currentYear = new Date().getFullYear();

    const handleNavigation = (view) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior:'smooth' });
    };

    return (
        <footer className="border-t border-[#E5E7EB] bg-[#FAFAF7] pt-14 pb-24 md:pb-14 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">

                    {/* Brand */}
                    <div className="space-y-4 md:col-span-1">
                        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-[#1A1A1A]">
                            <div className="w-7 h-7 bg-[#1A1A1A] flex items-center justify-center text-white text-sm font-black">
                                T
                            </div>
                            TravelCFO
                        </div>
                        <p className="text-[#6B7280] font-medium leading-relaxed text-sm max-w-xs">
                            A no-nonsense tool for tracking travel expenses and splitting costs with friends.
                        </p>
                        <p className="text-[#9CA3AF] text-sm font-medium">
                            Questions?{''}
                            <a href="mailto:support@travelcfo.app" className="text-[#6B7280] underline underline-offset-2 hover:text-[#1A1A1A] transition-colors font-semibold">
                                Email us directly.
                            </a>
                        </p>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block" />

                    {/* Product */}
                    <div>
                        <h4 className="font-black text-[#1A1A1A] mb-5 text-xs uppercase tracking-widest">Product</h4>
                        <ul className="space-y-3 text-[#6B7280] font-medium text-sm">
                            <li>
                                <button onClick={() => handleNavigation('dashboard')} className="hover:text-[#1A1A1A] transition-colors">
                                    Overview
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('features')} className="hover:text-[#1A1A1A] transition-colors">
                                    Features
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('protips')} className="hover:text-[#1A1A1A] transition-colors">
                                    Pro Tips
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('about')} className="hover:text-[#1A1A1A] transition-colors">
                                    About
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Support + Legal */}
                    <div>
                        <h4 className="font-black text-[#1A1A1A] mb-5 text-xs uppercase tracking-widest">Support & Legal</h4>
                        <ul className="space-y-3 text-[#6B7280] font-medium text-sm">
                            <li>
                                <a href="mailto:support@travelcfo.app" className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5">
                                    <EnvelopeSimple size={13} className="text-[#9CA3AF]" />
                                    Contact
                                </a>
                            </li>
                            <li>
                                <button onClick={onOpenFeedback} className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5">
                                    <Bug size={13} className="text-[#9CA3AF]" />
                                    Report a bug
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('privacy')} className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5">
                                    <Shield size={13} className="text-[#9CA3AF]" />
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('terms')} className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5">
                                    <FileText size={13} className="text-[#9CA3AF]" />
                                    Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar — plain, no animation */}
                <div className="pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-sm text-[#9CA3AF] font-medium">
                    <p>© {currentYear} TravelCFO. All rights reserved.</p>
                    <p className="text-[#374151]">Built by someone who hated post-trip spreadsheets.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
