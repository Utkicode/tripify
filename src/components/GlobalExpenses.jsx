import { useMemo, useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getCurrencySymbol } from '../utils/currency';
import { calculateGlobalStats, prepareChartData } from '../utils/analytics';
import ExpenseAnalytics from './dashboard/ExpenseAnalytics';
import { FileDown, Loader2 } from 'lucide-react';
import { generateExpenseReport, fetchAllExpenses } from '../utils/pdfGenerator';
import { LoadingSkeleton } from './common/LoadingSkeleton';

const GlobalExpenses = ({ tripsList, setCurrentView }) => {
    const { profile, user } = useProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [enrichedTrips, setEnrichedTrips] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const currencyCode = profile?.behavior?.defaultCurrency || 'USD';
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
            // Use enrichedTrips directly to save a re-fetch, causing less reads
            await generateExpenseReport(user, profile, tripsList);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <LoadingSkeleton count={3} height="h-32" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 h-16 flex items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-slate-800">Global Expenses</h1>
                <button
                    onClick={handleExport}
                    disabled={isGenerating || tripsList.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {isGenerating ? 'Generating...' : 'Export PDF'}
                </button>
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
