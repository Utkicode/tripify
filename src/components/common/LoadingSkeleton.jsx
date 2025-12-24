import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            <div className="w-20 h-6 bg-slate-200 rounded-md" />
        </div>
        <div className="w-1/2 h-8 bg-slate-200 rounded-md" />
        <div className="w-3/4 h-4 bg-slate-200 rounded-md" />
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <div className="w-64 h-10 bg-slate-200 rounded-xl" />
                <div className="w-48 h-5 bg-slate-200 rounded-md" />
            </div>
            <div className="w-32 h-12 bg-slate-200 rounded-xl" />
        </div>

        {/* Hero Widget */}
        <div className="w-full h-48 bg-slate-200 rounded-2xl" />

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
        </div>

        {/* Trip Stories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
    </div>
);

export const AppLoadingSkeleton = () => (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 bg-blue-200 rounded-full" />
            <div className="w-32 h-6 bg-slate-200 rounded-lg" />
        </div>
    </div>
);

export const LoadingSkeleton = ({ count = 1, height = 'h-24', width = 'w-full', className = '' }) => (
    <div className={`space-y-4 animate-pulse ${className}`}>
        {[...Array(count)].map((_, i) => (
            <div key={i} className={`bg-slate-200 rounded-xl ${height} ${width}`} />
        ))}
    </div>
);
