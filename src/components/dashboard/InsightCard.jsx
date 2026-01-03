import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const InsightCard = ({ label, value, subtext, trend, trendLabel, icon: Icon, color }) => {
    // Trend logic
    let TrendIcon = Minus;
    let trendColor = 'text-slate-400';
    let trendBg = 'bg-slate-50';

    if (trend === 'up') {
        TrendIcon = ArrowUpRight;
        trendColor = 'text-emerald-600';
        trendBg = 'bg-emerald-50';
    } else if (trend === 'down') {
        TrendIcon = ArrowDownRight;
        trendColor = 'text-amber-600';
        trendBg = 'bg-amber-50';
    }

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)' }}
            className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-lg transition-all flex flex-col justify-between h-full relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('bg-', 'bg-')} bg-opacity-10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-[1.5rem] ${color.replace('bg-', 'bg-opacity-10 text-')} bg-opacity-10 text-opacity-100 shadow-sm border border-white/50 backdrop-blur-md`}>
                    <Icon size={28} className={color.replace('bg-', 'text-')} strokeWidth={2} />
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${trendColor} ${trendBg} border border-current border-opacity-10`}>
                        {trendLabel} <TrendIcon size={14} className="ml-1" />
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-500 text-xs uppercase font-black tracking-widest mb-2 opacity-90">{label}</h3>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                {subtext && <p className="text-sm text-slate-400 mt-2 font-bold group-hover:text-slate-500 transition-colors">{subtext}</p>}
            </div>
        </motion.div>
    );
};

export default InsightCard;
