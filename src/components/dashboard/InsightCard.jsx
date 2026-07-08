import React from'react';
import { motion } from'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from'@phosphor-icons/react';

const InsightCard = ({ label, value, subtext, trend, trendLabel, icon: Icon, color }) => {
    // Trend logic
    let TrendIcon = Minus;
    let trendColor ='text-slate-400';
    let trendBg ='bg-slate-50';

    if (trend ==='up') {
        TrendIcon = ArrowUpRight;
        trendColor ='text-emerald-700';
        trendBg ='bg-emerald-50';
    } else if (trend ==='down') {
        TrendIcon = ArrowDownRight;
        trendColor ='text-amber-600';
        trendBg ='bg-amber-50';
    }

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="card p-6 md:p-7 flex flex-col justify-between h-full relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3.5 rounded-2xl bg-orange-50 text-accent shadow-sm border border-orange-100/70">
                    <Icon size={28} strokeWidth={2} />
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${trendColor} ${trendBg} border border-current border-opacity-10`}>
                        {trendLabel} <TrendIcon size={14} className="ml-1" />
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-500 text-xs uppercase font-black tracking-widest mb-2 opacity-90">{label}</h3>
                <p className="money text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
                {subtext && <p className="text-sm text-slate-400 mt-2 font-bold group-hover:text-slate-500 transition-colors">{subtext}</p>}
            </div>
        </motion.div>
    );
};

export default InsightCard;
