import React, { useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getCurrencySymbol } from '../utils/currency';
import { calculateGlobalStats, prepareChartData } from '../utils/analytics';
import ExpenseAnalytics from './dashboard/ExpenseAnalytics';
import { ArrowLeft } from 'lucide-react';

const GlobalExpenses = ({ tripsList, setCurrentView }) => {
    const { profile } = useProfile();
    const currencyCode = profile?.behavior?.defaultCurrency || 'USD';
    const currencySymbol = getCurrencySymbol(currencyCode);

    // Calculate Stats
    const { totalBudget, totalSpent, categoryTotals } = useMemo(() => calculateGlobalStats(tripsList), [tripsList]);
    const chartData = useMemo(() => prepareChartData(categoryTotals), [categoryTotals]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 h-16 flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-800">Global Expenses</h1>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Financial Overview</h2>
                    <p className="text-slate-500">
                        Aggregate spending across all your {tripsList.length} trips.
                    </p>
                </div>

                <ExpenseAnalytics
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    chartData={chartData}
                    currencySymbol={currencySymbol}
                />
            </div>
        </div>
    );
};

export default GlobalExpenses;
