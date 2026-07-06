import { useMemo, useState, useEffect } from'react';
import { useProfile } from'../context/ProfileContext';
import { getCurrencySymbol } from'../utils/currency';
import { calculateGlobalStats, prepareChartData } from'../utils/analytics';
import ExpenseAnalytics from'./dashboard/ExpenseAnalytics';
import { FileArrowDown, SpinnerGap, Wallet } from'@phosphor-icons/react';
import { generateExpenseReport, fetchAllExpenses } from'../utils/pdfGenerator';
import { LoadingSkeleton } from'./common/LoadingSkeleton';

const GlobalExpenses = ({ tripsList }) => {
    const { profile, user } = useProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [enrichedTrips, setEnrichedTrips] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const currencyCode = profile?.behavior?.defaultCurrency ||'USD';
    const currencySymbol = getCurrencySymbol(currencyCode);

    // Fetch deep data (expenses) for all trips
    useEffect(() => {
        const loadExpenses = async () => {
            if (!tripsList || tripsList.length === 0) {
                setEnrichedTrips([]);
                setIsLoadingData(false);
                return;
            }

            setIsLoadingData(true);
            try {
                const data = await fetchAllExpenses(tripsList);
                setEnrichedTrips(data);
            } catch (error) {
                console.error("Failed to load global expenses:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadExpenses();
    }, [tripsList]);

    // Calculate Stats using Enriched Data
    const { totalBudget, totalSpent, categoryTotals } = useMemo(() => calculateGlobalStats(enrichedTrips), [enrichedTrips]);
    const chartData = useMemo(() => prepareChartData(categoryTotals), [categoryTotals]);

    const handleExport = async () => {
        setIsGenerating(true);
        try {
            await generateExpenseReport(user, profile, tripsList, profile?.behavior?.defaultCurrency);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="w-full">
                <LoadingSkeleton count={3} height="h-32" />
            </div>
        );
    }

    if (!tripsList || tripsList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-4">
                <div className="w-16 h-16  rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Wallet size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No Expenses Yet</h3>
                <p className="text-slate-500 max-w-sm">
                    Create a trip and log some expenses to see your global financial overview here.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-12">
            {/* 1. Header with Atmospheric Blob */}
            <div className="relative mb-12 text-center md:text-left">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 0/20 blur-[80px] rounded-full -z-10 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
                            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Expenses</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-bold tracking-tight max-w-2xl">
                            A unified view of your financial footprint across all <span className="text-slate-900 mx-1">{tripsList.length}</span> active trips.
                        </p>
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isGenerating}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 text-lg font-bold group"
                    >
                        {isGenerating ? <SpinnerGap size={24} className="animate-spin" /> : <FileArrowDown size={24} className="group-hover:translate-y-1 transition-transform" />}
                        {isGenerating ?'Generating...' :'Export Global Report'}
                    </button>
                </div>
            </div>

            {/* Analytics Dashboard - Styled via Child or Wrapper */}
            <div className="bg-white/40 backdrop-blur-3xl rounded-[3.5rem] p-8 md:p-12 border border-white/50 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 /50 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <ExpenseAnalytics
                    totalBudget={totalBudget}
                    totalSpent={totalSpent}
                    chartData={chartData}
                    currencySymbol={currencySymbol}
                    oneUi={true}
                />
            </div>
        </div>
    );
};

export default GlobalExpenses;
