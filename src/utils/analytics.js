import { CATEGORIES } from '../constants';

export const calculateGlobalStats = (trips = []) => {
    let totalBudget = 0;
    let totalSpent = 0;
    const categoryTotals = {};

    // Initialize categories
    CATEGORIES.forEach(cat => {
        categoryTotals[cat.name] = 0;
    });

    trips.forEach(trip => {
        // Budget
        if (trip.budget) totalBudget += Number(trip.budget);

        // Expenses: Check for efficient flat list first (from GlobalExpenses/PDF), else fall back to nested days (legacy/planner)
        if (trip.expenses && Array.isArray(trip.expenses)) {
            trip.expenses.forEach(item => {
                const amount = Math.max(0, Number(item.cost || item.amount) || 0); // handle both cost (PDF) and amount (original)
                totalSpent += amount;

                const cat = item.category || 'Misc';
                if (categoryTotals[cat] !== undefined) {
                    categoryTotals[cat] += amount;
                } else {
                    if (!categoryTotals['Misc']) categoryTotals['Misc'] = 0;
                    categoryTotals['Misc'] += amount;
                }
            });
        } else if (trip.totalCost !== undefined && trip.totalCost !== null) {
            totalSpent += Number(trip.totalCost) || 0;
        } else if (trip.days && Array.isArray(trip.days)) {
            trip.days.forEach(day => {
                if (day.items && Array.isArray(day.items)) {
                    day.items.forEach(item => {
                        const amount = Math.max(0, Number(item.amount) || 0);
                        totalSpent += amount;

                        // Category Breakdown
                        const cat = item.category || 'Misc';
                        if (categoryTotals[cat] !== undefined) {
                            categoryTotals[cat] += amount;
                        } else {
                            // Fallback for unknown categories
                            if (!categoryTotals['Misc']) categoryTotals['Misc'] = 0;
                            categoryTotals['Misc'] += amount;
                        }
                    });
                }
            });
        }
    });

    return {
        totalBudget,
        totalSpent,
        categoryTotals
    };
};



export const calculateTripStats = (trip) => {
    let budget = Number(trip.budget) || 0;
    let spent = Number(trip.totalCost) || 0;

    return { budget, spent, remaining: budget - spent };
};

export const prepareChartData = (categoryTotals) => {
    return Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0) // Only show categories with spending
        .sort((a, b) => b.value - a.value); // Sort highest first
};
