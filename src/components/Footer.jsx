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
        <footer className="bg-white border-t border-slate-200 mt-auto pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Map className="text-blue-600" size={24} />
                            Tripify
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Your intelligent travel companion. Plan, track, and enjoy your adventures with ease.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><button onClick={() => handleNavigation('dashboard')} className="hover:text-blue-600 transition-colors">Overview</button></li>
                            <li><button onClick={() => handleNavigation('trips')} className="hover:text-blue-600 transition-colors">My Trips</button></li>
                            <li><button onClick={() => handleNavigation('protips')} className="hover:text-blue-600 transition-colors">Pro Tips</button></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li>
                                <a href="mailto:utkarshgupta9759@gmail.com" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                    Contact Support
                                </a>
                            </li>
                            <li>
                                <button onClick={onOpenFeedback} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                    Report a Bug
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li>
                                <button onClick={() => handleNavigation('privacy')} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleNavigation('terms')} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                    Terms of Service
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p>&copy; {currentYear} Tripify App. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Made with ❤️ for travelers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
