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

        // Expenses form Days -> Items
        if (trip.days && Array.isArray(trip.days)) {
            trip.days.forEach(day => {
                if (day.items && Array.isArray(day.items)) {
                    day.items.forEach(item => {
                        const amount = Number(item.amount) || 0;
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
    let spent = 0;

    if (trip.days && Array.isArray(trip.days)) {
        trip.days.forEach(day => {
            if (day.items && Array.isArray(day.items)) {
                day.items.forEach(item => {
                    spent += Number(item.amount) || 0;
                });
            }
        });
    }

    return { budget, spent, remaining: budget - spent };
};

export const prepareChartData = (categoryTotals) => {
    return Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0) // Only show categories with spending
        .sort((a, b) => b.value - a.value); // Sort highest first
};
