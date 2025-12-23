import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LONDON_COORDS = [51.505, -0.09];

// Helper to fit bounds
const MapController = ({ locations, selectedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLocation) {
            map.flyTo([selectedLocation.lat, selectedLocation.lon], 14);
        } else if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lon]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, selectedLocation, map]);

    return null;
};

const TripMap = ({ days = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Extract valid locations from planner
    const plannerLocations = days.flatMap(day =>
        day.items
            .filter(item => item.location && item.location.lat && item.location.lon)
            .map(item => ({
                ...item.location,
                itemName: item.name,
                dayName: day.dayName,
                time: item.time,
                id: item.id
            }))
    );

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                setSelectedLocation({
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                    name: result.display_name
                });
            }
        } catch (error) {
            console.error("Map search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="relative w-full h-[600px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 z-0">
            <MapContainer center={LONDON_COORDS} zoom={13} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Planner Markers */}
                {plannerLocations.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lon]}>
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <p className="font-bold text-slate-800 text-sm">{loc.itemName || 'Activity'}</p>
                                <p className="text-xs text-slate-500 mb-1">{loc.dayName} • {loc.time}</p>
                                <p className="text-xs text-blue-600 font-medium truncate">{loc.name}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Search Marker if active */}
                {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
                        <Popup offset={[0, -20]}>
                            <div className="text-center font-bold">Search Result</div>
                        </Popup>
                    </Marker>
                )}

                <MapController locations={plannerLocations} selectedLocation={selectedLocation} />
            </MapContainer>

            {/* Search Overlay */}
            <div className="absolute top-4 right-4 z-[1000] w-full max-w-xs">
                <form onSubmit={handleSearch} className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search places..."
                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-1"
                    />
                    <button type="submit" disabled={isSearching} className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors">
                        {isSearching ? <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : <MapPin size={16} />}
                    </button>
                </form>
                <div className="mt-2 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
                    Showing {plannerLocations.length} activities from itinerary.
                </div>
            </div>
        </div>
    );
};

export default TripMap;
