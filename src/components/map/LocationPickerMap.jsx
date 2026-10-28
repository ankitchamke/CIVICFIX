import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

const NAGPUR_CENTER = [21.1458, 79.0882];

// Pin icon for location picker
const pickerIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="
        width: 24px;
        height: 24px;
        background-color: #0f766e;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="
        position: absolute;
        bottom: 0px;
        width: 4px;
        height: 4px;
        background-color: #0f766e;
        border-radius: 50%;
      "></div>
    </div>
  `,
  className: 'location-picker-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 28],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  className = '',
}) {
  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const markerPos = hasCoords ? [latitude, longitude] : NAGPUR_CENTER;

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 ${className}`}>
      <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-xs border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
        <Navigation className="w-3 h-3 text-teal-600" />
        <span>Click anywhere on the map to pin exact issue spot</span>
      </div>

      <div className="h-44 w-full">
        <MapContainer
          center={hasCoords ? [latitude, longitude] : NAGPUR_CENTER}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationSelect={onLocationSelect} />

          {hasCoords && (
            <Marker position={markerPos} icon={pickerIcon} />
          )}
        </MapContainer>
      </div>

      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
        {hasCoords ? (
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>
              GPS Pinned: {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
            </span>
          </span>
        ) : (
          <span className="text-slate-500">No exact GPS coordinates chosen yet</span>
        )}

        {hasCoords && (
          <button
            type="button"
            onClick={() => onLocationSelect(null, null)}
            className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Clear Pin
          </button>
        )}
      </div>
    </div>
  );
}
