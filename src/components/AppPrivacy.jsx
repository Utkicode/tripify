import React from 'react';
import { Shield } from 'lucide-react';

const AppPrivacy = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                    <Shield size={24} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                <p className="text-slate-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8 text-slate-600 leading-relaxed">
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us when you create an account, plan a trip, or communicate with us.
                        This includes your name, email address, and trip details.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to operate, maintain, and improve our services, including personalization of your
                        travel experience and sending you technical notices and support messages.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Security</h2>
                    <p>
                        We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure.
                        However, no internet transmission is completely secure, and we cannot guarantee the security of your data.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">4. Cookies</h2>
                    <p>
                        We may use cookies and similar technologies to collect information about your interactions with our service and to maintain
                        your session personalization.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                        <br />
                        <a href="mailto:support@tripify.app" className="text-blue-600 font-medium hover:underline">support@tripify.app</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AppPrivacy;
