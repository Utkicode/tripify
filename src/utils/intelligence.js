import { differenceInDays } from 'date-fns';

/**
 * Calculates a 'Readiness Score' (0-100) for a given trip.
 * Penalizes missing critical info as the trip gets closer.
 * 
 * @param {Object} trip - The trip object
 * @returns {Object} { score: number, level: string, missing: string[] }
 */
export const calculateTripReadiness = (trip) => {
    let score = 0;
    const missing = [];
    const totalWeight = 100;

    // 1. Basic Structure (40%)
    if (trip.tripName && trip.tripName !== 'My Trip') score += 10;
    else missing.push('Trip Name');

    if (trip.destination) score += 15;
    else missing.push('Destination');

    if (trip.days && trip.days.length > 0) score += 15;
    else missing.push('Dates');

    // 2. Itinerary Depth (30%)
    const totalDays = trip.days?.length || 0;
    let daysWithActivities = 0;

    if (totalDays > 0) {
        trip.days.forEach(day => {
            if (day.items && day.items.length > 0) daysWithActivities++;
        });
        const itineraryCompleteness = (daysWithActivities / totalDays);
        score += Math.floor(itineraryCompleteness * 30);

        if (itineraryCompleteness < 0.5) missing.push('Itinerary Details');
    }

    // 3. Logistics & Budget (30%)
    if (trip.travelers && trip.travelers.length > 0) score += 10;
    // Assuming budget is part of trip object or calculated from preferences (mocked for now as checked)
    if (trip.totalCost > 0) score += 10;
    else missing.push('Budget/Expenses');

    // Penalties based on proximity (Time Decay)
    // If trip is < 7 days away and score is low, apply penalty to urgency
    // Note: We don't reduce the *score* usually, but we might cap it or flag it.
    // For this simple version, we'll keep the raw score but use proximity to drive the 'Action' priority.

    let level = 'Low';
    if (score >= 80) level = 'High';
    else if (score >= 50) level = 'Medium';

    return { score, level, missing };
};


/**
 * Deterministic Rules Engine for Next Best Actions
 * 
 * @param {Array} trips - List of trip objects
 * @param {Object} user - User object
 * @returns {Array} Ordered list of action objects
 */
export const getNextBestActions = (trips, user) => {
    const actions = [];

    // Sort trips by proximity (soonest first)
    const upcomingTrips = trips
        .filter(t => !t.isArchived) // Assuming archived flag or date check
        .sort((a, b) => (a.startDate || 0) - (b.startDate || 0)); // simplistic date sort

    if (upcomingTrips.length === 0) {
        actions.push({
            id: 'create_first_trip',
            type: 'primary',
            priority: 100,
            title: 'Start your first adventure',
            message: 'Create a new trip to start planning your next getaway.',
            cta: 'Create Trip',
            action: 'create_trip'
        });
        return actions;
    }

    const nearestTrip = upcomingTrips[0];
    const readiness = calculateTripReadiness(nearestTrip);
    const daysUntil = nearestTrip.startDate ? differenceInDays(new Date(nearestTrip.startDate), new Date()) : 30; // default to far out if no date

    // Rule 1: High Urgency - Trip soon, low readiness
    if (daysUntil < 7 && daysUntil >= 0 && readiness.score < 80) {
        actions.push({
            id: `urgent_finish_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'critical',
            priority: 95,
            title: `Finalize ${nearestTrip.destination || 'your trip'}`,
            message: `You leave in ${daysUntil} days! You're missing ${readiness.missing[0] || 'details'}.`,
            cta: 'Finish Planning',
            action: 'view_trip'
        });
    }

    // Rule 2: Missing Destination (Fundamental)
    if (!nearestTrip.destination) {
        actions.push({
            id: `add_dest_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'high',
            priority: 90,
            title: 'Where are you going?',
            message: 'Add a destination to unlock local recommendations.',
            cta: 'Add Destination',
            action: 'view_trip'
        });
    }

    // Rule 3: Empty Itinerary (Engagement)
    // Check if readiness indicates missing itinerary details
    if (readiness.missing.includes('Itinerary Details')) {
        actions.push({
            id: `plan_days_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'medium',
            priority: 80,
            title: 'Build your itinerary',
            message: 'Your days look empty. Add some activities!',
            cta: 'Plan Days',
            action: 'view_trip_itinerary'
        });
    }

    // Rule 4: Budget Alerts
    const pctUsed = nearestTrip.budget > 0 ? (nearestTrip.totalCost / nearestTrip.budget) : 0;

    // Critical Overrun
    if (nearestTrip.budget > 0 && pctUsed > 1.0) {
        actions.push({
            id: `budget_over_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'critical',
            priority: 98, // Very High Priority
            title: 'Budget Exceeded',
            message: `You've spent ${(pctUsed * 100).toFixed(0)}% of your budget! Adjust your plans?`,
            cta: 'Check Wallet',
            action: 'view_trip_expenses'
        });
    }
    // High Usage Warning
    else if (nearestTrip.budget > 0 && pctUsed > 0.8) {
        actions.push({
            id: `budget_warn_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'high',
            priority: 85,
            title: 'Approaching Budget Limit',
            message: `You've used ${(pctUsed * 100).toFixed(0)}% of your budget.`,
            cta: 'View Expenses',
            action: 'view_trip_expenses'
        });
    }
    // No expenses yet
    else if (nearestTrip.totalCost === 0 && readiness.score > 40) {
        actions.push({
            id: `add_budget_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'medium',
            priority: 70,
            title: 'Track your expenses',
            message: 'Start adding estimated costs to stay within budget.',
            cta: 'Add Expenses',
            action: 'view_trip_expenses'
        });
    }

    // Default: Generic "Keep Planning" if no critical blocks
    if (actions.length === 0) {
        actions.push({
            id: `review_${nearestTrip.id}`,
            tripId: nearestTrip.id,
            type: 'info',
            priority: 50,
            title: 'Review your trip',
            message: `Everything looks good for ${nearestTrip.destination || 'your trip'}. Take a final look?`,
            cta: 'Review',
            action: 'view_trip'
        });
    }

    return actions.sort((a, b) => b.priority - a.priority).slice(0, 3);
};
