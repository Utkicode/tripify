import React from 'react';
import { Mail, Map, Shield, FileText, Bug } from 'lucide-react';

const Footer = ({ setCurrentView, onOpenFeedback }) => {
    const currentYear = new Date().getFullYear();

    const handleNavigation = (view) => {
        setCurrentView(view);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="relative mt-auto pb-24 md:pb-8 pt-10 px-4 md:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-transparent to-white/50 pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto bg-white/60 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-xl shadow-slate-200/50 p-10 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900">
                            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                                <Map size={24} strokeWidth={2.5} />
                            </div>
                            TravelCFO
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
                            Your intelligent travel companion. Plan, track, and enjoy your adventures with ease.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-extrabold text-slate-900 mb-6 uppercase tracking-widest text-xs">Product</h4>
                        <ul className="space-y-4 text-slate-600 font-medium">
                            <li><button onClick={() => handleNavigation('dashboard')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300">Overview</button></li>
                            <li><button onClick={() => handleNavigation('trips')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300">My Trips</button></li>
                            <li><button onClick={() => handleNavigation('protips')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300">Pro Tips</button></li>
                            <li><button onClick={() => handleNavigation('about')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300">About Us</button></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-extrabold text-slate-900 mb-6 uppercase tracking-widest text-xs">Support</h4>
                        <ul className="space-y-4 text-slate-600 font-medium">
                            <li>
                                <a href="mailto:utkarshgupta9759@gmail.com" className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group">
                                    <Mail size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> Contact Support
                                </a>
                            </li>
                            <li>
                                <button onClick={onOpenFeedback} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group">
                                    <Bug size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> Report a Bug
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-extrabold text-slate-900 mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4 text-slate-600 font-medium">
                            <li>
                                <button onClick={() => handleNavigation('privacy')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group">
                                    <Shield size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('terms')} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group">
                                    <FileText size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" /> Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold text-slate-400 relative z-10">
                    <p>&copy; {currentYear} TravelCFO. All rights reserved.</p>
                    <div className="flex gap-8">
                        <span className="flex items-center gap-2">Made with <div className="text-red-500 animate-pulse">❤️</div> for travelers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
