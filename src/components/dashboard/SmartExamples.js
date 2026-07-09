export const SMART_TIPS = [
    {
        id: 'tip_1',
        category: 'Savings',
        icon: '💰',
        text: 'Organizing your expenses by category helps you save up to 15% on travel costs.',
        action: 'view_expenses'
    },
    {
        id: 'tip_2',
        category: 'Packing',
        icon: '🧳',
        text: 'Rolling clothes instead of folding them can save up to 30% of space in your luggage.',
        action: 'open_checklist'
    },
    {
        id: 'tip_3',
        category: 'Planning',
        icon: '🗺️',
        text: 'Leaving one afternoon free allows for spontaneous discoveries and reduces travel stress.',
        action: 'view_itinerary'
    },
    {
        id: 'tip_4',
        category: 'Documents',
        icon: '📄',
        text: 'Always save offline copies of your tickets and ID on your phone.',
        action: 'view_files'
    },
    {
        id: 'tip_5',
        category: 'Local',
        icon: '🍽️',
        text: 'Ask locals for restaurant recommendations to find authentic food at better prices.',
        action: 'none'
    }
];

export const EMPTY_STATE_MESSAGES = {
    no_trips: {
        headline: "Ready for your next adventure?",
        subhead: "The world is waiting. Create your first trip to start planning.",
        cta: "Plan a Trip"
    },
    no_expenses: {
        headline: " Stay on budget",
        subhead: "Track flights, hotels, and food to know exactly what you're spending.",
        cta: "Add Expense"
    }
};
