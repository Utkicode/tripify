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

    const hasDays = (trip.dayCount !== undefined ? trip.dayCount > 0 : (trip.days && trip.days.length > 0));
    if (hasDays) score += 15;
    else missing.push('Dates');

    // 2. Itinerary Depth (30%)
    const totalDays = trip.dayCount !== undefined ? trip.dayCount : (trip.days?.length || 0);
    let daysWithActivities = 0;

    if (totalDays > 0) {
        if (trip.daysWithActivitiesCount !== undefined) {
            daysWithActivities = trip.daysWithActivitiesCount;
        } else if (trip.days) {
            trip.days.forEach(day => {
                if (day.items && day.items.length > 0) daysWithActivities++;
            });
        }
        const itineraryCompleteness = (daysWithActivities / totalDays);
        score += Math.floor(itineraryCompleteness * 30);

        if (itineraryCompleteness < 0.5) missing.push('Itinerary Details');
    }

    // 3. Logistics & Budget (30%)
    const hasTravelers = (trip.travelerCount !== undefined ? trip.travelerCount > 0 : (trip.travelers && trip.travelers.length > 0));
    if (hasTravelers) score += 10;
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

    // Sort trips by proximity (soonest first), excluding completed ones
    const upcomingTrips = trips
        .filter(t => !t.isArchived && !t.isCompleted)
        .sort((a, b) => (a.startDate || 0) - (b.startDate || 0)); // simplistic date sort

    if (upcomingTrips.length === 0) {
        const hasCompletedTrips = trips.some(t => t.isCompleted);
        if (hasCompletedTrips) {
            actions.push({
                id: 'plan_next_trip',
                type: 'primary',
                priority: 100,
                title: 'Plan your next adventure',
                message: 'Your previous journey is completed. Time to start planning your next getaway!',
                cta: 'Plan Next Trip',
                action: 'create_trip'
            });
        } else {
            actions.push({
                id: 'create_first_trip',
                type: 'primary',
                priority: 100,
                title: 'Start your first adventure',
                message: 'Create a new trip to start planning your next getaway.',
                cta: 'Create Trip',
                action: 'create_trip'
            });
        }
        return actions;
    }

    const nearestTrip = upcomingTrips[0];
    const readiness = calculateTripReadiness(nearestTrip);
    let daysUntil = 30;
    if (nearestTrip.startDate) {
        const startDate = new Date(nearestTrip.startDate);
        daysUntil = isNaN(startDate.getTime()) ? 30 : differenceInDays(startDate, new Date());
    }

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

/**
 * Maps a category from the API response (or activity details) into the application's category taxonomy:
 * 'Food', 'Transport', 'Stay', 'Activity', 'Misc'.
 * Falls back to keyword-based category matching on the activity name.
 */
export const mapCategoryAndFallback = (name, originalCategory) => {
    // 1. Map originalCategory if provided (from API response)
    if (originalCategory) {
        const cat = String(originalCategory).toLowerCase().trim();
        if (cat.includes('food') || cat.includes('restaurant') || cat.includes('dining') || cat.includes('cafe') || cat.includes('meal') || cat.includes('breakfast') || cat.includes('lunch') || cat.includes('dinner') || cat.includes('drink') || cat.includes('bar') || cat.includes('beverage') || cat.includes('pub') || cat.includes('gastronomy') || cat.includes('eat')) {
            return 'Food';
        }
        if (cat.includes('transport') || cat.includes('flight') || cat.includes('taxi') || cat.includes('cab') || cat.includes('bus') || cat.includes('train') || cat.includes('drive') || cat.includes('transit') || cat.includes('car') || cat.includes('rental') || cat.includes('shuttle') || cat.includes('transfer') || cat.includes('uber') || cat.includes('lyft') || cat.includes('metro') || cat.includes('subway') || cat.includes('plane') || cat.includes('travel') || cat.includes('journey')) {
            return 'Transport';
        }
        if (cat.includes('stay') || cat.includes('hotel') || cat.includes('hostel') || cat.includes('airbnb') || cat.includes('accommodation') || cat.includes('lodging') || cat.includes('resort') || cat.includes('motel') || cat.includes('villa') || cat.includes('room')) {
            return 'Stay';
        }
        if (cat.includes('activity') || cat.includes('sightseeing') || cat.includes('tour') || cat.includes('museum') || cat.includes('attraction') || cat.includes('visit') || cat.includes('experience') || cat.includes('show') || cat.includes('park') || cat.includes('event') || cat.includes('hike') || cat.includes('excursion') || cat.includes('ticket') || cat.includes('monument') || cat.includes('temple') || cat.includes('beach') || cat.includes('concert') || cat.includes('gallery') || cat.includes('theater') || cat.includes('landmark') || cat.includes('history') || cat.includes('heritage') || cat.includes('relax') || cat.includes('nightlife')) {
            return 'Activity';
        }
    }

    // 2. Fallback to name-based keyword mapping
    if (name) {
        const nameLower = String(name).toLowerCase();
        
        // Food keywords
        if (/\b(food|eat|restaurant|lunch|dinner|breakfast|cafe|dining|brunch|meal|bar|pub|coffee|bistro|bakery|snacks|supper|tea|drinks|boba|gelato|ice cream|pizza|burger|sushi|ramen|pasta)\b/.test(nameLower)) {
            return 'Food';
        }
        // Transport keywords
        if (/\b(flight|taxi|cab|bus|train|drive|transit|car|rental|shuttle|uber|lyft|metro|subway|plane|travel|transfer|ferry|boat|cruise|station|airport|ride)\b/.test(nameLower)) {
            return 'Transport';
        }
        // Stay keywords
        if (/\b(hotel|hostel|airbnb|stay|accommodation|lodging|resort|motel|villa|guesthouse|homestay|check-in|checkin|checkout|check-out|lodge|inn)\b/.test(nameLower)) {
            return 'Stay';
        }
        // Activity keywords
        if (/\b(sightseeing|tour|museum|attraction|visit|experience|show|park|event|hike|excursion|ticket|monument|temple|beach|concert|gallery|theater|palace|castle|zoo|aquarium|festival|climb|walk|trek|safari|surf|snorkeling|dive|exhibit|explore)\b/.test(nameLower)) {
            return 'Activity';
        }
    }

    return 'Misc';
};

