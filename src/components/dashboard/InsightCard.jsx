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
            whileHover={{ y: -4 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full"
        >
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={20} className={color.replace('bg-', 'text-')} />
                </div>
                {trend && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendColor} ${trendBg}`}>
                        {trendLabel} <TrendIcon size={12} className="ml-1" />
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{label}</h3>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
                {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
            </div>
        </motion.div>
    );
};

export default InsightCard;
