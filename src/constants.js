export const SITE_URL = 'https://travelcfo.app';

export const CATEGORIES = [
    { name: 'Transport', color: '#2563eb', icon: 'Plane' },
    { name: 'Stay', color: '#059669', icon: 'Hotel' },
    { name: 'Food', color: '#ff6b35', icon: 'Utensils' },
    { name: 'Activity', color: '#f59e0b', icon: 'Ticket' },
    { name: 'Misc', color: '#64748b', icon: 'ShoppingBag' }
];

export const createInitialDays = () => [
    {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        dayName: 'Day 1',
        items: []
    }
];


export const createInitialTravelers = () => [
    { id: 'self', name: 'Me', email: '', phone: '', age: '', gender: '' }
];

// Shared App ID for Firestore paths
const rawAppId = typeof __app_id !== 'undefined' && typeof __app_id === 'string' ? __app_id : 'tripify-web';
export const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_');
