import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RotateCcw,
  ThumbsUp,
  MapPin,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { createCivicMarkerIcon } from './mapIcons';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { CATEGORIES } from '../../data/mockData';

// Center of Nagpur, Maharashtra (Zero Mile / Sitabuldi Interchange)
const NAGPUR_CENTER = [21.1458, 79.0882];
const DEFAULT_ZOOM = 13;

// Helper component to reset map center
function MapResetController({ center, zoom, trigger }) {
  const map = useMap();
  React.useEffect(() => {
    if (trigger > 0) {
      map.setView(center, zoom, { animate: true });
    }
  }, [trigger, center, zoom, map]);
  return null;
}

export function RealNagpurMap({
  complaints = [],
  onSelectComplaint,
  onUpvoteComplaint,
  upvotedIds = [],
  onOpenReportModal,
  isCompactPreview = false,
  className = '',
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDemoRecords, setShowDemoRecords] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  // Filter complaints based on status, category, demo status, and valid coordinates
  const { geocodedComplaints, unverifiedComplaints } = useMemo(() => {
    const geocoded = [];
    const unverified = [];

    complaints.forEach((c) => {
      // Demo filter
      if (!showDemoRecords && c.isDemo) return;

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return;

      // Category filter
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return;

      // Check valid numeric lat/lng within plausible Nagpur/Vidarbha boundary (lat: 20.8-21.5, lng: 78.7-79.4)
      const hasValidCoords =
        typeof c.latitude === 'number' &&
        typeof c.longitude === 'number' &&
        !isNaN(c.latitude) &&
        !isNaN(c.longitude) &&
        c.latitude > 20 &&
        c.latitude < 22 &&
        c.longitude > 78 &&
        c.longitude < 80;

      if (hasValidCoords) {
        geocoded.push(c);
      } else {
        unverified.push(c);
      }
    });

    return { geocodedComplaints: geocoded, unverifiedComplaints: unverified };
  }, [complaints, statusFilter, categoryFilter, showDemoRecords]);

  const handleResetMap = () => {
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${
        isCompactPreview ? 'h-[420px]' : 'h-[680px]'
      } ${className}`}
    >
      {/* Controls Header (Filter Bar) - Simplified in compact preview */}
      <div className="p-3 sm:p-4 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-none">
                Nagpur Civic Map
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800 border border-teal-200">
                {geocodedComplaints.length} Pinned
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live geographic issue tracking across Nagpur Municipal Corporation (NMC)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Filter by issue status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          {!isCompactPreview && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Filter by civic category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          )}

          {/* Toggle Demo Data */}
          <button
            onClick={() => setShowDemoRecords(!showDemoRecords)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showDemoRecords
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle inclusion of initial demonstration records"
          >
            {showDemoRecords ? (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Demo Included</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Real Only</span>
              </>
            )}
          </button>

          {/* Reset Zoom / Center Button */}
          <button
            onClick={handleResetMap}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Center Map on Nagpur (Sitabuldi Zero Mile)"
            aria-label="Center Map on Nagpur"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full min-h-0 z-0">
        <MapContainer
          center={NAGPUR_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={!isCompactPreview}
          className="w-full h-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapResetController
            center={NAGPUR_CENTER}
            zoom={DEFAULT_ZOOM}
            trigger={resetTrigger}
          />

          {/* Render Markers for Geocoded Complaints */}
          {geocodedComplaints.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={createCivicMarkerIcon(
                item.category,
                item.status,
                selectedMarkerId === item.id
              )}
              eventHandlers={{
                click: () => setSelectedMarkerId(item.id),
              }}
            >
              <Popup className="civic-leaflet-popup" maxWidth={320}>
                <div className="p-1 text-slate-900 font-sans">
                  {/* Header badges */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <StatusBadge status={item.status} size="sm" />
                    <CategoryBadge category={item.category} size="sm" />
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>

                  {/* Metadata: Location & Date */}
                  <div className="text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-1.5 mb-2">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400">{item.id}</span>
                      {item.isDemo && (
                        <span className="text-[9px] font-bold px-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Demo Record
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onUpvoteComplaint && onUpvoteComplaint(item.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        upvotedIds.includes(item.id)
                          ? 'bg-teal-50 text-teal-700 font-bold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3 text-teal-600" />
                      <span>{item.upvotes || 0}</span>
                    </button>

                    <button
                      onClick={() => onSelectComplaint && onSelectComplaint(item)}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Full Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Empty State Overlay if 0 markers */}
        {geocodedComplaints.length === 0 && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              No Issues Matching Current Filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Try adjusting your category/status filters or toggling the Demo records filter.
            </p>
          </div>
        )}
      </div>

      {/* Footer Bar: Real Geotagged vs Unverified summary */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{geocodedComplaints.length} GPS-Pinned</span>
          </div>
          {unverifiedComplaints.length > 0 && (
            <div
              className="flex items-center gap-1 text-amber-700"
              title="Reports with typed street address but no GPS coordinates assigned"
            >
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>{unverifiedComplaints.length} Address-Only (Unverified GPS)</span>
            </div>
          )}
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="text-teal-700 font-semibold hover:text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Report Issue Here</span>
          </button>
        )}
      </div>
    </div>
  );
}
