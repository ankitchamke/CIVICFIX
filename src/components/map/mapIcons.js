import L from 'leaflet';

// Colors for civic categories
const CATEGORY_COLORS = {
  roads: { bg: '#d97706', ring: '#f59e0b', text: 'Road' }, // Amber
  lighting: { bg: '#ca8a04', ring: '#eab308', text: 'Light' }, // Yellow
  sanitation: { bg: '#059669', ring: '#10b981', text: 'Waste' }, // Emerald
  water: { bg: '#0284c7', ring: '#38bdf8', text: 'Water' }, // Sky
  parks: { bg: '#16a34a', ring: '#22c55e', text: 'Park' }, // Green
  other: { bg: '#64748b', ring: '#94a3b8', text: 'Other' }, // Slate
};

// Status indicator border colors
const STATUS_INDICATORS = {
  open: '#ef4444', // Red
  in_progress: '#f59e0b', // Amber
  resolved: '#10b981', // Emerald
};

/**
 * Creates an elegant HTML/SVG divIcon for Leaflet markers.
 * Avoids any missing PNG asset issues in bundled environments.
 */
export function createCivicMarkerIcon(category, status, isSelected = false) {
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const statusColor = STATUS_INDICATORS[status] || STATUS_INDICATORS.open;
  const size = isSelected ? 36 : 28;
  const pulse = status === 'open' ? 'animate-pulse' : '';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        inset: 0;
        background-color: ${catColor.bg};
        border: 2px solid ${statusColor};
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '11px' : '9px'};
        font-family: sans-serif;
      ">
        ${catColor.text[0]}
      </div>
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background-color: ${statusColor};
        border: 1.5px solid white;
        border-radius: 50%;
      " class="${pulse}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'civic-marker-custom',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}
