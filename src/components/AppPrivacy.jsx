import React from'react';
import { Shield } from'@phosphor-icons/react';

const AppPrivacy = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="mb-16 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 0/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>
                <div className="inline-block p-4 bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-blue-500/20 mb-6 border border-white/60 relative z-10">
                    <Shield size={48} className="text-[#1A1A1A]" strokeWidth={1.5} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 relative z-10">
                    Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Policy</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium relative z-10">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 /50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                <div className="space-y-12 text-slate-600 leading-relaxed relative z-10">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full  text-[#1A1A1A] text-sm font-bold">1</span>
                            Information We Collect
                        </h2>
                        <p className="text-lg font-medium">
                            We collect information you provide directly to us when you create an account, plan a trip, or communicate with us.
                            This includes your name, email address, and trip details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full  text-[#1A1A1A] text-sm font-bold">2</span>
                            How We Use Your Information
                        </h2>
                        <p className="text-lg font-medium">
                            We use the information we collect to operate, maintain, and improve our services, including personalization of your
                            travel experience and sending you technical notices and support messages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full  text-[#1A1A1A] text-sm font-bold">3</span>
                            Data Security
                        </h2>
                        <p className="text-lg font-medium">
                            We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure.
                            However, no internet transmission is completely secure, and we cannot guarantee the security of your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full  text-[#1A1A1A] text-sm font-bold">4</span>
                            Cookies
                        </h2>
                        <p className="text-lg font-medium">
                            We may use cookies and similar technologies to collect information about your interactions with our service and to maintain
                            your session personalization.
                        </p>
                    </section>

                    <section className="/80 backdrop-blur rounded-[2rem] p-8 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Contact Us</h2>
                        <p className="text-lg font-medium mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <a href="mailto:support@travelcfo.app" className="inline-flex items-center gap-2 text-[#1A1A1A] font-bold hover:underline text-xl">
                            support@travelcfo.app
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AppPrivacy;
