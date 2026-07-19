import { doc, updateDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { appId } from "../constants";
import { mapCategoryAndFallback } from "../utils/intelligence";

// In dev, Vite proxies /api/planner → https://planner-api-174168932168.asia-south1.run.app
// In production, we call the real URL directly (CORS headers are set by the API host)
const API_URL = import.meta.env.DEV
  ? '/api/planner/plan'
  : 'https://planner-api-174168932168.asia-south1.run.app/plan';


// Helpers for caching
const getCacheKey = ({ destination, start_date, end_date, budget, traveler_count }) => {
    return `plan_cache_${String(destination).trim().toLowerCase()}_${start_date}_${end_date}_${budget}_${traveler_count}`;
};

const getCachedItinerary = (params) => {
    try {
        const key = getCacheKey(params);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        console.error("Error reading from itinerary cache:", e);
        return null;
    }
};

const setCachedItinerary = (params, data) => {
    try {
        const key = getCacheKey(params);
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Error writing to itinerary cache:", e);
    }
};

/**
 * Fallback cost table — only used when the API block has no cost field.
 * These are rough estimates; all items are flagged isEstimate: true.
 */
const FALLBACK_COST = {
    Food: 500,
    Transport: 250,
    Stay: 1500,
    Activity: 600,
    Misc: 200
};

/**
 * Derives a short day theme from the first 2 activity titles.
 * e.g. ["Visit Qutub Minar", "Lunch at Lodhi Garden Café"] → "Qutub Minar & Lodhi Garden"
 */
const deriveDayTheme = (blocks) => {
    if (!blocks || blocks.length === 0) return null;

    // Common filler prefixes to strip so the theme reads cleanly
    const STRIP_PREFIXES = [
        /^visit\s+/i, /^explore\s+/i, /^tour\s+/i, /^see\s+/i,
        /^stop\s+at\s+/i, /^head\s+to\s+/i, /^go\s+to\s+/i,
        /^lunch\s+at\s+/i, /^dinner\s+at\s+/i, /^breakfast\s+at\s+/i,
        /^check\s+in\s+at\s+/i, /^check\s+out\s+of\s+/i,
    ];

    const clean = (title) => {
        if (!title) return '';
        let t = title.trim();
        // Strip colon-separated suffixes (e.g. "Taj Mahal: Entry ₹50" → "Taj Mahal")
        t = t.split(':')[0].trim();
        // Strip filler prefixes
        for (const re of STRIP_PREFIXES) t = t.replace(re, '');
        return t.trim();
    };

    const first = clean(blocks[0]?.title);
    const second = blocks[1] ? clean(blocks[1]?.title) : null;

    if (first && second && second !== first) return `${first} & ${second}`;
    if (first) return first;
    return null;
};

/**
 * Splits a long AI-generated title into a shorter title and extended notes.
 */
const processTitleAndNotes = (rawTitle, rawNotes) => {
    let name = (rawTitle || '').trim();
    let notes = (rawNotes || '').trim();
    
    // If name is longer than 8 words, split it intelligently
    const words = name.split(/\s+/);
    if (words.length > 8) {
        // Try splitting by the first sentence or punctuation mark
        const splitMatch = name.match(/^([^.:;?!]+[:;?!]?)(.*)$/);
        if (splitMatch && splitMatch[1].split(/\s+/).length <= 8) {
            name = splitMatch[1].trim();
            const remainder = splitMatch[2].trim();
            if (remainder) notes = notes ? `${remainder}\n\n${notes}` : remainder;
        } else {
            // Fallback: Hard cut after 6 words
            name = words.slice(0, 6).join(' ') + '...';
            const remainder = words.slice(6).join(' ');
            if (remainder) notes = notes ? `${remainder}\n\n${notes}` : remainder;
        }
    }
    return { name, notes };
};

export const plannerService = {
    /**
     * Calls the /plan API and generates the itinerary, or returns cached copy.
     */
    generateItinerary: async ({ destination, start_date, end_date, budget, traveler_count }) => {
        const params = { destination, start_date, end_date, budget, traveler_count };
        
        // 1. Check local storage cache
        const cached = getCachedItinerary(params);
        if (cached) {
            console.log("Serving itinerary from cache...");
            return cached;
        }

        console.log("Calling itinerary planner API...");
        
        // 2. Prepare payload for API
        const payload = {
            origin: "", // Default required field
            destination: destination,
            startDate: start_date,
            endDate: end_date,
            budget: Number(budget) || 1000,
            travelerCount: Number(traveler_count) || 1
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.detail?.[0]?.msg || errData.message || "Failed to generate itinerary from API";
            throw new Error(errMsg);
        }

        const data = await response.json();
        
        // 3. Log a sample block in dev to confirm cost field names
        if (import.meta.env.DEV && data?.draft?.days?.[0]?.blocks?.[0]) {
            console.log("[plannerService] Sample API block:", data.draft.days[0].blocks[0]);
        }

        // 4. Cache response
        setCachedItinerary(params, data);
        
        return data;
    },

    /**
     * Persists the generated itinerary into Firestore trip and sub-collections.
     */
    persistItinerary: async (tripId, destination, startDate, endDate, budget, draft) => {
        const tripRef = doc(db, 'artifacts', appId, 'trips', tripId);
        
        // 1. Clear existing days from sub-collection first
        const daysColRef = collection(db, 'artifacts', appId, 'trips', tripId, 'days');
        const existingDaysSnap = await getDocs(daysColRef);
        
        if (!existingDaysSnap.empty) {
            const deleteBatch = writeBatch(db);
            existingDaysSnap.docs.forEach((dayDoc) => {
                deleteBatch.delete(dayDoc.ref);
            });
            await deleteBatch.commit();
        }

        // 2. Populate new days in batch
        const baseTime = Date.now();
        const batch = writeBatch(db);

        draft.days.forEach((day, index) => {
            const dayId = baseTime + index;
            const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));

            // Derive a human-readable theme from the first 2 activity titles
            const theme = deriveDayTheme(day.blocks);
            
            const dayObj = {
                id: dayId,
                date: day.date || '',
                dayName: theme || `Day ${index + 1}`,
                items: (day.blocks || []).map((block) => {
                    const mappedCategory = mapCategoryAndFallback(block.title, block.tag);

                    // Bug fix: read per-block cost from API if present; only fall back to table
                    // The API may return cost as: block.cost, block.estimated_cost, block.price, block.estimatedCost
                    const apiCost = block.cost ?? block.estimated_cost ?? block.price ?? block.estimatedCost;
                    const resolvedCost = (apiCost !== null && apiCost !== undefined && !isNaN(Number(apiCost)))
                        ? Number(apiCost)
                        : (FALLBACK_COST[mappedCategory] ?? 0);

                    // Only create a location object if the API supplies distinct lat/lng AND
                    // a location name that is meaningfully different from the activity title.
                    // This prevents the "duplicate title/location pill" bug.
                    let locationObj = null;
                    if (block.lat && block.lng) {
                        const rawLocName = (block.location || block.place || '').trim();
                        const titleBase = (block.title || '').split(':')[0].trim();
                        const locName = rawLocName || titleBase;

                        // Only set location if the name is genuinely distinct from the activity title
                        const isDifferent = locName.toLowerCase() !== titleBase.toLowerCase();
                        if (isDifferent && rawLocName) {
                            locationObj = {
                                name: rawLocName,
                                address: block.address || rawLocName,
                                lat: parseFloat(block.lat),
                                lon: parseFloat(block.lng)
                            };
                        }
                    }

                    const { name: shortName, notes: extendedNotes } = processTitleAndNotes(block.title, block.notes);

                    return {
                        id: crypto.randomUUID(),
                        name: shortName,
                        amount: String(resolvedCost),
                        isEstimate: true,       // Flag all AI-generated costs as estimates
                        category: mappedCategory,
                        time: block.time || '12:00',
                        notes: extendedNotes,
                        location: locationObj
                    };
                })
            };

            batch.set(dayRef, dayObj);
        });

        // 3. Commit day sub-collection documents
        await batch.commit();

        // 4. Update the main trip document details
        const tripTitle = draft.city || destination || "My Trip";
        const dayCount = draft.days.length;

        await updateDoc(tripRef, {
            destination: destination,
            startDate: startDate || null,
            endDate: endDate || null,
            budget: Number(budget) || 0,
            dayCount: dayCount,
            tripName: tripTitle,
            updatedAt: Date.now()
        });
    },

    /**
     * Regenerates a single day without touching other days.
     * Calls the full /plan API but only writes back the matching day index.
     * Token cost: same API call, but Firestore write = 1 day only.
     */
    regenerateSingleDay: async (tripId, dayId, dayIndex, destination, startDate, endDate, budget, travelerCount) => {
        // 1. Fetch fresh itinerary (cached if available — bust cache by invalidating key)
        // We force a fresh call by clearing the cache key for this trip first
        const cacheKey = `plan_cache_${String(destination).trim().toLowerCase()}_${startDate}_${endDate}_${budget}_${travelerCount}`;
        localStorage.removeItem(cacheKey);

        const data = await plannerService.generateItinerary({
            destination,
            start_date: startDate,
            end_date: endDate,
            budget,
            traveler_count: travelerCount
        });

        const draft = data?.draft;
        if (!draft || !draft.days) throw new Error("Invalid API response for single-day regeneration");

        // 2. Find the matching day by index in the API response
        const newDayData = draft.days[dayIndex];
        if (!newDayData) throw new Error(`Day ${dayIndex + 1} not found in API response`);

        // 3. Rebuild items for this day only
        const theme = deriveDayTheme(newDayData.blocks);
        const newItems = (newDayData.blocks || []).map((block) => {
            const mappedCategory = mapCategoryAndFallback(block.title, block.tag);

            const apiCost = block.cost ?? block.estimated_cost ?? block.price ?? block.estimatedCost;
            const resolvedCost = (apiCost !== null && apiCost !== undefined && !isNaN(Number(apiCost)))
                ? Number(apiCost)
                : (FALLBACK_COST[mappedCategory] ?? 0);

            let locationObj = null;
            if (block.lat && block.lng) {
                const rawLocName = (block.location || block.place || '').trim();
                const titleBase = (block.title || '').split(':')[0].trim();
                const locName = rawLocName || titleBase;
                const isDifferent = locName.toLowerCase() !== titleBase.toLowerCase();
                if (isDifferent && rawLocName) {
                    locationObj = {
                        name: rawLocName,
                        address: block.address || rawLocName,
                        lat: parseFloat(block.lat),
                        lon: parseFloat(block.lng)
                    };
                }
            }

            const { name: shortName, notes: extendedNotes } = processTitleAndNotes(block.title, block.notes);

            return {
                id: crypto.randomUUID(),
                name: shortName,
                amount: String(resolvedCost),
                isEstimate: true,
                category: mappedCategory,
                time: block.time || '12:00',
                notes: extendedNotes,
                location: locationObj
            };
        });

        // 4. Update only this day's document in Firestore
        const dayRef = doc(db, 'artifacts', appId, 'trips', tripId, 'days', String(dayId));
        await updateDoc(dayRef, {
            items: newItems,
            dayName: theme || `Day ${dayIndex + 1}`
        });
    }
};
