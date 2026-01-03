import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="mb-16 text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>
                <div className="inline-block p-4 bg-white/50 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-indigo-500/20 mb-6 border border-white/60 relative z-10">
                    <FileText size={48} className="text-indigo-600" strokeWidth={1.5} />
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 relative z-10">
                    Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Service</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium relative z-10">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                <div className="space-y-12 text-slate-600 leading-relaxed relative z-10">
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">1</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-lg font-medium">
                            By accessing or using TravelCFO, you agree to be bound by these Terms of Service. If you strictly disagree with any part of the terms,
                            you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                            Use of Service
                        </h2>
                        <p className="text-lg font-medium">
                            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all
                            activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">3</span>
                            User Content
                        </h2>
                        <p className="text-lg font-medium">
                            Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.
                            You are responsible for the legality, reliability, and appropriateness of your content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-bold">4</span>
                            Termination
                        </h2>
                        <p className="text-lg font-medium">
                            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without
                            limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 text-sm font-bold">5</span>
                            Changes
                        </h2>
                        <p className="text-lg font-medium">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice
                            prior to any new terms taking effect.
                        </p>
                    </section>

                    <section className="bg-slate-50/80 backdrop-blur rounded-[2rem] p-8 border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Contact Us</h2>
                        <p className="text-lg font-medium mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <a href="mailto:support@travelcfo.app" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline text-xl">
                            support@travelcfo.app
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
