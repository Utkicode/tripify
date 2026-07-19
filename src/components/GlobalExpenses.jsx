import { useMemo, useState, useEffect } from'react';
import { useProfile } from'../context/ProfileContext';
import { getCurrencySymbol } from'../utils/currency';
import { calculateGlobalStats, prepareChartData } from'../utils/analytics';
import ExpenseAnalytics from'./dashboard/ExpenseAnalytics';
import AddExpenseModal from'./AddExpenseModal';
import { FileArrowDown, SpinnerGap, Wallet, MapPin, Tag, CalendarBlank } from'@phosphor-icons/react';
import { CATEGORIES } from '../constants';
import { generateExpenseReport, fetchAllExpenses } from'../utils/pdfGenerator';
import { LoadingSkeleton } from'./common/LoadingSkeleton';

const GlobalExpenses = ({ tripsList }) => {
    const { profile, user } = useProfile();
    const [isGenerating, setIsGenerating] = useState(false);
    const [enrichedTrips, setEnrichedTrips] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [expenseModalConfig, setExpenseModalConfig] = useState({ isOpen: false, tripId: null });
    const [showTripSelector, setShowTripSelector] = useState(false);

    const currencyCode = profile?.behavior?.defaultCurrency ||'INR';
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

    const allTransactions = useMemo(() => {
        const txs = [];
        enrichedTrips.forEach(trip => {
            if (trip.expenses) {
                txs.push(...trip.expenses);
            }
        });
        // Sort descending by date
        return txs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [enrichedTrips]);

    const dailySpend = useMemo(() => {
        const days = {};
        allTransactions.forEach(tx => {
            const d = tx.date;
            if (d) {
                if (!days[d]) days[d] = 0;
                days[d] += Number(tx.cost || tx.amount) || 0;
            }
        });
        return Object.entries(days)
            .map(([date, value]) => ({ date, value }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [allTransactions]);

    const handleAddExpenseClick = () => {
        if (!tripsList || tripsList.length === 0) return;
        if (tripsList.length === 1) {
            setExpenseModalConfig({ isOpen: true, tripId: tripsList[0].id });
        } else {
            setShowTripSelector(true);
        }
    };

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
                    dailySpend={dailySpend}
                    onAddExpense={handleAddExpenseClick}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Per-Trip Breakdown */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-xl font-black text-slate-800">Per-Trip Breakdown</h3>
                    <div className="space-y-4">
                        {enrichedTrips.map(trip => (
                            <div key={trip.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#FF6B35]">
                                        <MapPin size={20} weight="fill" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 line-clamp-1">{trip.tripName || trip.destination || 'Untitled Trip'}</p>
                                        <p className="text-xs text-slate-500 font-medium">{trip.expenses?.length || 0} transactions</p>
                                    </div>
                                </div>
                                <p className="font-black text-slate-900">{currencySymbol}{(trip.totalActualSpend || 0).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black text-slate-800">Recent Transactions</h3>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        {allTransactions.length > 0 ? (
                            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {allTransactions.map(tx => {
                                    const catDef = CATEGORIES.find(c => c.name === tx.category) || { color: '#94a3b8' };
                                    return (
                                        <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div 
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                                                    style={{ backgroundColor: catDef.color }}
                                                >
                                                    <Tag size={20} weight="fill" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{tx.activityName || tx.description || 'Expense'}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1"><CalendarBlank size={12} /> {tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}</span>
                                                        <span>•</span>
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{tx.category || 'Other'}</span>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[100px]">{tx.tripName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-900 shrink-0">{currencySymbol}{(tx.cost || 0).toLocaleString()}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500 font-medium">
                                No transactions found across your trips.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals for Add Expense */}
            <AddExpenseModal
                isOpen={expenseModalConfig.isOpen}
                onClose={() => setExpenseModalConfig({ isOpen: false, tripId: null })}
                user={user}
                tripId={expenseModalConfig.tripId}
            />

            {showTripSelector && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-100">
                        <h3 className="text-xl font-black text-slate-800 mb-4 px-2">Select a Trip</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar px-2">
                            {tripsList.map(trip => (
                                <button
                                    key={trip.id}
                                    onClick={() => {
                                        setShowTripSelector(false);
                                        setExpenseModalConfig({ isOpen: true, tripId: trip.id });
                                    }}
                                    className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-[#FF6B35]/30 hover:bg-orange-50 transition-colors group flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-slate-400 group-hover:text-[#FF6B35] transition-colors">
                                        <Wallet size={20} weight="fill" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-700 group-hover:text-slate-900 truncate">{trip.tripName || trip.destination || 'Untitled Trip'}</p>
                                        <p className="text-xs text-slate-500">{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="pt-4 mt-2 px-2">
                            <button 
                                onClick={() => setShowTripSelector(false)} 
                                className="w-full p-3 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalExpenses;
