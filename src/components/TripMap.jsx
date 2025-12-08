import React from 'react';
import { MapPin, Navigation, Layers } from 'lucide-react';

const TripMap = () => {
    return (
        <div className="relative w-full h-[600px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            {/* Map Placeholder UI */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#e5e7eb] pattern-grid-lg text-slate-400/50">
                {/* This would be the Google Maps / Leaflet Container */}
                <div className="text-center">
                    <div className="inline-block p-4 rounded-full bg-white/50 backdrop-blur-sm mb-4">
                        <MapPin size={48} className="text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-500">Map Integration</p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Interactive map view requires a Maps API Key. Currently in development.</p>
                </div>
            </div>

            {/* UI Overlay Mockups */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50">
                    <Navigation size={20} className="text-blue-600" />
                </div>
                <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50">
                    <Layers size={20} className="text-slate-600" />
                </div>
            </div>

            <div className="absolute bottom-6 right-6 flex gap-2">
                <button className="bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm text-slate-700 hover:bg-slate-50 border border-slate-100">
                    Open in Google Maps
                </button>
            </div>
        </div>
    );
};

export default TripMap;
