import React, { useState } from 'react';
import { Menu, X, Instagram, Twitter, Linkedin } from 'lucide-react';
import Auth from '../Auth';

const PublicLayout = ({ children, setCurrentView, currentView }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { id: 'features', label: 'Features' },
        { id: 'about', label: 'About Us' },
        { id: 'protips', label: 'Pro Tips' },
    ];

    const handleNav = (viewId) => {
        setCurrentView(viewId);
        setMobileMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    {/* Brand */}
                    <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <span className="font-black text-xl tracking-tighter">T</span>
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-900">TravelCFO</span>
                    </button>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <button
                                key={link.id}
                                onClick={() => handleNav(link.id)}
                                className={`text-sm font-bold transition-colors ${currentView === link.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowAuth(true)}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-black hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Nav Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-6 py-8 space-y-4">
                        {navLinks.map(link => (
                            <button
                                key={link.id}
                                onClick={() => handleNav(link.id)}
                                className="block w-full text-left text-lg font-bold text-slate-600 py-2"
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                            className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold"
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-16 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                <span className="font-black text-lg">T</span>
                            </div>
                            <span className="font-black text-lg text-slate-900">TravelCFO</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            The smartest way to plan trips and manage travel expenses. Built for modern explorers.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <button
                                    key={i}
                                    aria-label={`Visit our ${i === 0 ? 'Twitter' : i === 1 ? 'Instagram' : 'LinkedIn'} page`}
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                    <Icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6">Product</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><button onClick={() => handleNav('features')} className="hover:text-blue-600">Features</button></li>
                            <li><button onClick={() => handleNav('protips')} className="hover:text-blue-600">Pro Tips</button></li>
                            <li><button onClick={() => setShowAuth(true)} className="hover:text-blue-600">Login</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6">Company</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><button onClick={() => handleNav('about')} className="hover:text-blue-600">About Us</button></li>
                            <li><a href="mailto:contact@travelcfo.app" className="hover:text-blue-600">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><button onClick={() => handleNav('privacy')} className="hover:text-blue-600">Privacy Policy</button></li>
                            <li><button onClick={() => handleNav('terms')} className="hover:text-blue-600">Terms of Service</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-500">
                    <p>&copy; {new Date().getFullYear()} TravelCFO. All rights reserved.</p>
                    <p>Made with ❤️ for travelers.</p>
                </div>
            </footer>

            {/* Auth Modal Triggered from Nav */}
            {showAuth && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setShowAuth(false)}
                >
                    <div onClick={e => e.stopPropagation()} className="relative w-full max-w-[450px]">
                        <Auth isModal={true} onClose={() => setShowAuth(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicLayout;
