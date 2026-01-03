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
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>
                <div className="relative z-10 inline-block mb-4 p-4 rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/60 shadow-lg shadow-yellow-500/20">
                    <Lightbulb className="text-yellow-500 fill-yellow-500/20" size={48} strokeWidth={1.5} />
                </div>
                <h1 className="relative z-10 text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">Pro Tips</span>
                </h1>
                <p className="relative z-10 text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                    Level up your travel game with expert insights curated by our community of seasoned travelers.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {tips.map((tip, index) => (
                    <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-300 group relative overflow-hidden"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 ${tip.color} opacity-10 blur-[40px] rounded-full transition-all group-hover:scale-150`}></div>

                        <div className={`w-16 h-16 rounded-[1.5rem] ${tip.color} bg-opacity-10 flex items-center justify-center mb-6 shadow-sm border border-white/50 relative z-10 group-hover:scale-110 transition-transform`}>
                            <tip.icon size={32} className={`${tip.color.replace('bg-', 'text-')} stroke-[2]`} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-extrabold text-slate-900 mb-3 text-2xl tracking-tight">{tip.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">{tip.content}</p>
                        </div>

                        {/* Hover Highlight */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/50 rounded-[2.5rem] transition-colors pointer-events-none"></div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProTips;
