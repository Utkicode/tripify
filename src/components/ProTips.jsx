import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, IndianRupee, Map, Shield, Camera, Coffee } from 'lucide-react';

const ProTips = () => {
    const tips = [
        {
            id: 1,
            title: "Budget Like a Pro",
            content: "Organizing your expenses by category helps you save up to 15% on travel costs. Tracking every small purchase gives you better visibility.",
            icon: IndianRupee,
            color: "bg-green-500"
        },
        {
            id: 2,
            title: "Offline Maps",
            content: "Always download offline maps for your destination before you leave. You never know when you might lose signal!",
            icon: Map,
            color: "bg-blue-500"
        },
        {
            id: 3,
            title: "Travel Insurance",
            content: "It might seem like an extra cost, but travel insurance can save you thousands if flights get cancelled or baggage gets lost.",
            icon: Shield,
            color: "bg-red-500"
        },
        {
            id: 4,
            title: "Golden Hour",
            content: "For the best travel photos, wake up early! The light during 'Golden Hour' (just after sunrise) is magical and crowds are smaller.",
            icon: Camera,
            color: "bg-purple-500"
        },
        {
            id: 5,
            title: "Local Vibes",
            content: "Eat where the locals eat. Avoid restaurants with pictures on the menu or waiters standing outside.",
            icon: Coffee,
            color: "bg-amber-500"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-left mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                    <Lightbulb className="text-yellow-500" size={32} />
                    Travel Pro Tips
                </h1>
                <p className="text-slate-500 text-lg">Level up your travel game with these expert collected insights.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tips.map((tip, index) => (
                    <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4"
                    >
                        <div className={`p-3 rounded-xl ${tip.color} bg-opacity-10 text-opacity-100 shrink-0 h-fit`}>
                            <tip.icon size={24} className={tip.color.replace('bg-', 'text-')} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800 mb-2 text-lg">{tip.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{tip.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProTips;
