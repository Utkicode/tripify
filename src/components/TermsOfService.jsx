import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                    <FileText size={24} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
                <p className="text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Tripify, you agree to be bound by these Terms of Service. If you strictly disagree with any part of the terms,
                        you may not access the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">2. Use of Service</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all
                        activities that occur under your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">3. User Content</h2>
                    <p>
                        Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material.
                        You are responsible for the legality, reliability, and appropriateness of your content.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">4. Termination</h2>
                    <p>
                        We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without
                        limitation if you breach the Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">5. Changes</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice
                        prior to any new terms taking effect.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">6. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:
                        <br />
                        <a href="mailto:support@tripify.app" className="text-blue-600 font-medium hover:underline">support@tripify.app</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
