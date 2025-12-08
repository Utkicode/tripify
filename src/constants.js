export const CATEGORIES = [
    { name: 'Transport', color: '#3b82f6', icon: 'Plane' },
    { name: 'Stay', color: '#8b5cf6', icon: 'Hotel' },
    { name: 'Food', color: '#10b981', icon: 'Utensils' },
    { name: 'Activity', color: '#f59e0b', icon: 'Ticket' },
    { name: 'Misc', color: '#64748b', icon: 'ShoppingBag' }
];

export const createInitialDays = () => [
    {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        dayName: 'Day 1',
        items: []
    }
];


export const createInitialTravelers = () => [
    { id: 't1', name: 'Me', email: '', phone: '', age: '', gender: '' }
];

// Shared App ID for Firestore paths
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'tripify-web';
export const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_');
