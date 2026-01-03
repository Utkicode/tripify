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
        <div className="relative w-full h-[600px] bg-slate-100 rounded-[3rem] overflow-hidden border border-white/60 shadow-xl shadow-slate-200/50 z-0">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] z-[500] rounded-[3rem]"></div>

            <MapContainer center={LONDON_COORDS} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Render Planner Markers */}
                {plannerLocations.map((loc) => (
                    <Marker key={loc.id} position={[loc.lat, loc.lon]}>
                        <Popup className="oneui-popup">
                            <div className="p-2 min-w-[160px] text-center">
                                <p className="font-black text-slate-800 text-sm mb-1">{loc.itemName || 'Activity'}</p>
                                <div className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-full inline-block mb-1">{loc.dayName}</div>
                                <p className="text-xs text-blue-600 font-bold truncate">{loc.name}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Search Marker if active */}
                {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
                        <Popup offset={[0, -20]} className="oneui-popup">
                            <div className="text-center font-bold px-2 py-1">📍 Search Result</div>
                        </Popup>
                    </Marker>
                )}

                <MapController locations={plannerLocations} selectedLocation={selectedLocation} />
            </MapContainer>

            {/* Search Overlay */}
            <div className="absolute top-6 right-6 z-[800] w-full max-w-sm">
                <form onSubmit={handleSearch} className="bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] shadow-xl border border-white/60 flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for places..."
                        className="flex-1 bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 px-4 placeholder:font-normal placeholder:text-slate-400"
                    />
                    <button type="submit" disabled={isSearching} className="bg-slate-900 hover:bg-blue-600 text-white p-3 rounded-full transition-all shadow-lg shadow-slate-900/20">
                        {isSearching ? <span className="animate-spin block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : <MapPin size={18} />}
                    </button>
                </form>
                <div className="mt-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center w-fit ml-auto">
                    {plannerLocations.length} Locations Pinned
                </div>
            </div>
        </div>
    );
};

export default TripMap;
