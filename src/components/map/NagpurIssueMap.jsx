import React, { useState, useMemo } from 'react';
import {
  MapPin,
  RotateCcw,
  ThumbsUp,
  AlertCircle,
  Camera,
  Compass,
  Maximize2,
  Info,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CATEGORIES, NAGPUR_ZONES } from '../../data/mockData';

export function NagpurIssueMap({
  complaints = [],
  onSelectComplaint,
  onUpvoteComplaint,
  upvotedIds = [],
  onOpenReportModal,
}) {
  const [selectedPinId, setSelectedPinId] = useState(complaints[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1); // 1 | 1.25

  // Filter complaints for the map
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Must have schematic coordinates to appear on map
      if (c.schematicX === undefined || c.schematicY === undefined) {
        return false;
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && c.category !== categoryFilter) {
        return false;
      }
      if (selectedZone !== 'all') {
        const zoneObj = NAGPUR_ZONES.find((z) => z.id === selectedZone);
        if (zoneObj) {
          const matchArea = zoneObj.areas.some(
            (area) =>
              (c.location || '').toLowerCase().includes(area.toLowerCase()) ||
              (c.ward || '').toLowerCase().includes(area.toLowerCase())
          );
          if (!matchArea) return false;
        }
      }
      return true;
    });
  }, [complaints, statusFilter, categoryFilter, selectedZone]);

  const selectedComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedPinId) || filteredComplaints[0] || null;
  }, [complaints, selectedPinId, filteredComplaints]);

  const isFiltered = statusFilter !== 'all' || categoryFilter !== 'all' || selectedZone !== 'all';

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSelectedZone('all');
  };

  // Color mappings for markers
  const getCategoryColor = (category) => {
    switch (category) {
      case 'roads':
        return '#f59e0b'; // amber
      case 'lighting':
        return '#eab308'; // yellow
      case 'sanitation':
        return '#10b981'; // emerald
      case 'water':
        return '#0284c7'; // sky / blue
      case 'parks':
        return '#0d9488'; // teal
      case 'traffic':
        return '#6366f1'; // indigo
      default:
        return '#64748b'; // slate
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'resolved':
        return '#059669'; // emerald
      case 'in_progress':
        return '#d97706'; // amber
      default:
        return '#2563eb'; // blue
    }
  };

  return (
    <div className="space-y-5">
      {/* Map Header & Context Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Nagpur Civic Issue Map
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              Nagpur, Maharashtra, India · Demo Environment
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Schematic and illustrative spatial view of public grievances across Sitabuldi, Dharampeth, Civil Lines, Sadar, Wardha Road, and Medical Square.
            <span className="text-slate-400 block mt-0.5">
              * Note: Stylized municipal diagram for local evaluation; coordinates represent schematic neighborhood positions, not live GIS telemetry.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={MapPin}
            onClick={onOpenReportModal}
            className="text-xs sm:text-sm font-semibold"
          >
            Report Issue at Location
          </Button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
            Status:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Zone Filter Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Category:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              Nagpur Zone:
            </span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">All Nagpur Zones</option>
              {NAGPUR_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors font-medium cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setZoomLevel((z) => (z === 1 ? 1.2 : 1))}
            className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title={zoomLevel === 1 ? 'Magnify diagram view' : 'Fit to normal'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Layout: Canvas on Left, Selected Issue Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Schematic SVG Map Canvas */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-3 sm:p-4 text-white overflow-hidden relative min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
          {/* Top Canvas Label & Marker Counts */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                Nagpur City Grievance Mesh
              </span>
              <span className="text-[11px] bg-slate-800 text-teal-300 px-2 py-0.5 rounded-full border border-slate-700">
                {filteredComplaints.length} markers active
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Scale: Schematic Diagram (800×550)
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-auto py-2">
            {filteredComplaints.length === 0 ? (
              <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-slate-800/40 rounded-xl border border-dashed border-slate-700">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  No Nagpur complaints match this criteria
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Adjust status or category filters to view issues in other areas of Nagpur.
                </p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
                  Reset Map Filters
                </Button>
              </div>
            ) : (
              <svg
                viewBox="0 0 800 550"
                className="w-full h-auto max-h-[500px] select-none transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <defs>
                  {/* Subtle Grid Pattern */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                  </pattern>

                  {/* Water Gradient */}
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.25" />
                  </linearGradient>

                  {/* Pin Drop Shadow */}
                  <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Background Grid */}
                <rect width="800" height="550" fill="#0f172a" rx="16" />
                <rect width="800" height="550" fill="url(#grid)" rx="16" />

                {/* Outer Ring Road Arc */}
                <ellipse
                  cx="400"
                  cy="290"
                  rx="340"
                  ry="230"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.6"
                />
                <text x="710" y="295" fill="#475569" fontSize="9" fontFamily="sans-serif">
                  Nagpur Outer Ring Road
                </text>

                {/* Natural Feature: Nag River Schematic Line */}
                <path
                  d="M 190,340 C 240,310 270,250 330,240 C 390,230 420,270 480,260 C 530,250 590,210 650,220"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                />
                <text x="610" y="210" fill="#0284c7" fontSize="8" opacity="0.6" fontStyle="italic">
                  ~ Nag River Corridor ~
                </text>

                {/* Major Arterial Roads */}
                {/* 1. Amravati Road (West to Variety Square) */}
                <path
                  d="M 60,190 L 410,270"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="90" y="180" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Amravati Road (NH-53)
                </text>

                {/* 2. Wardha Road (Sitabuldi South to Airport) */}
                <path
                  d="M 435,220 L 425,510"
                  stroke="#475569"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <text x="440" y="500" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Wardha Road (NH-44) ↓ Airport
                </text>

                {/* 3. Central Avenue (CA Road - East toward Itwari/Mahal) */}
                <path
                  d="M 440,250 L 740,250"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="620" y="242" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  Central Avenue (CA Road)
                </text>

                {/* 4. West High Court Road (WHC Road - Dharampeth) */}
                <path
                  d="M 280,120 L 270,350"
                  stroke="#334155"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="220" y="125" fill="#64748b" fontSize="9">
                  WHC Road (Dharampeth)
                </text>

                {/* 5. Hingna Road (South-West Branch) */}
                <path
                  d="M 320,380 L 120,460"
                  stroke="#334155"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text x="140" y="475" fill="#64748b" fontSize="9">
                  Hingna Road (MIDC)
                </text>

                {/* 6. Sadar / Residency Road (North Link) */}
                <path
                  d="M 430,220 L 440,70"
                  stroke="#334155"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="448" y="85" fill="#64748b" fontSize="9">
                  Residency Rd (Sadar)
                </text>

                {/* Nagpur Metro Corridor Schematic Line */}
                <path
                  d="M 440,80 L 440,250 L 430,500"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d="M 170,180 L 440,250 L 700,250"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  fill="none"
                  opacity="0.8"
                />

                {/* Water Body 1: Futala Lake */}
                <g>
                  <ellipse cx="175" cy="155" rx="42" ry="26" fill="url(#waterGrad)" stroke="#0284c7" strokeWidth="1.2" />
                  <text x="150" y="158" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    Futala Lake
                  </text>
                  <text x="148" y="170" fill="#7dd3fc" fontSize="8">
                    Promenade Track
                  </text>
                </g>

                {/* Water Body 2: Ambazari Lake */}
                <g>
                  <path
                    d="M 180,300 C 230,290 260,320 250,350 C 230,370 170,360 160,330 Z"
                    fill="url(#waterGrad)"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                  />
                  <text x="175" y="335" fill="#38bdf8" fontSize="10" fontWeight="bold">
                    Ambazari Lake
                  </text>
                  <text x="180" y="347" fill="#7dd3fc" fontSize="8">
                    & Garden
                  </text>
                </g>

                {/* Key Landmark Nodes */}
                {/* Zero Mile Stone (Geographic Center of India) */}
                <g>
                  <circle cx="430" cy="210" r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
                  <text x="442" y="214" fill="#fbbf24" fontSize="9" fontWeight="bold">
                    Zero Mile Stone
                  </text>
                </g>

                {/* Sitabuldi Fort & Metro Interchange */}
                <g>
                  <rect x="425" y="238" width="28" height="20" rx="4" fill="#1e293b" stroke="#0d9488" strokeWidth="1.5" />
                  <text x="430" y="252" fill="#2dd4bf" fontSize="8" fontWeight="bold">
                    METRO
                  </text>
                  <text x="460" y="260" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                    Sitabuldi Interchange
                  </text>
                </g>

                {/* Civil Lines / High Court */}
                <g>
                  <rect x="340" y="155" width="22" height="15" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                  <text x="310" y="150" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                    Civil Lines
                  </text>
                  <text x="300" y="162" fill="#94a3b8" fontSize="8">
                    (High Court)
                  </text>
                </g>

                {/* Medical Square (GMC) */}
                <g>
                  <circle cx="550" cy="310" r="6" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="548" y="313" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">
                    +
                  </text>
                  <text x="562" y="314" fill="#fca5a5" fontSize="9" fontWeight="bold">
                    Medical Square (GMC)
                  </text>
                </g>

                {/* VNIT Campus */}
                <g>
                  <text x="250" y="305" fill="#94a3b8" fontSize="8" fontStyle="italic">
                    VNIT Campus
                  </text>
                </g>

                {/* Chhatrapati Square (Wardha Road) */}
                <g>
                  <circle cx="423" cy="390" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <text x="435" y="393" fill="#cbd5e1" fontSize="8">
                    Chhatrapati Sq Flyover
                  </text>
                </g>

                {/* Manish Nagar Underpass */}
                <g>
                  <circle cx="480" cy="460" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <text x="492" y="464" fill="#cbd5e1" fontSize="8">
                    Manish Nagar
                  </text>
                </g>

                {/* Pratap Nagar */}
                <g>
                  <circle cx="320" cy="390" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                  <text x="328" y="388" fill="#cbd5e1" fontSize="8">
                    Pratap Nagar
                  </text>
                </g>

                {/* ================= COMPLAINT MARKERS ================= */}
                {filteredComplaints.map((item) => {
                  const isSelected = selectedPinId === item.id;
                  const catColor = getCategoryColor(item.category);
                  const statusBorder = getStatusBorder(item.status);
                  const x = item.schematicX || 400;
                  const y = item.schematicY || 275;

                  return (
                    <g
                      key={item.id}
                      onClick={() => setSelectedPinId(item.id)}
                      className="cursor-pointer group"
                      transform={`translate(${x}, ${y})`}
                    >
                      {/* Pulse Ring for Selected Marker */}
                      {isSelected && (
                        <circle
                          cx="0"
                          cy="0"
                          r="18"
                          fill="none"
                          stroke={catColor}
                          strokeWidth="2.5"
                          opacity="0.8"
                          className="animate-ping"
                        />
                      )}

                      {/* Drop Pin Head */}
                      <circle
                        cx="0"
                        cy="0"
                        r={isSelected ? '12' : '9'}
                        fill={catColor}
                        stroke={statusBorder}
                        strokeWidth={isSelected ? '3' : '2'}
                        filter="url(#pinShadow)"
                        className="transition-all duration-200 group-hover:scale-125"
                      />

                      {/* Inner Dot for Status */}
                      <circle
                        cx="0"
                        cy="0"
                        r={isSelected ? '4' : '3'}
                        fill="#ffffff"
                      />

                      {/* Pin Label Tag */}
                      <g
                        transform="translate(0, -16)"
                        className={`transition-opacity duration-200 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <rect
                          x="-35"
                          y="-14"
                          width="70"
                          height="16"
                          rx="4"
                          fill="#0f172a"
                          stroke={statusBorder}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-3"
                          fill="#ffffff"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {item.id}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Map Footer & Visual Legend */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 z-10 relative">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-300">Status Rings:</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-slate-800" />
                <span>Open</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-slate-800" />
                <span>In Progress</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-slate-800" />
                <span>Resolved</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Nagpur Municipal Corporation (NMC) Demo Mesh</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Issue Inspector & Quick Action Card */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          {selectedComplaint ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between flex-1">
              <div>
                {/* Header Strip with ID & Close/Reset */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedComplaint.id}
                    </span>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                  {selectedComplaint.title}
                </h3>

                {/* Nagpur Location & Ward */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 space-y-1.5">
                  <div className="flex items-start gap-1.5 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedComplaint.location}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedComplaint.ward}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {selectedComplaint.description}
                </p>

                {/* Photo Evidence Thumbnail if available */}
                {selectedComplaint.hasPhoto && selectedComplaint.photoUrl && (
                  <div className="mb-4 relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900">
                    <img
                      src={selectedComplaint.photoUrl}
                      alt={selectedComplaint.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 text-white rounded text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                      <Camera className="w-3 h-3 text-teal-400" />
                      <span>Nagpur On-Site Proof</span>
                    </div>
                  </div>
                )}

                {/* Metadata Chips */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                  <CategoryBadge category={selectedComplaint.categoryLabel} />
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedComplaint.dateReported).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  {/* Upvote Button */}
                  <button
                    onClick={() => onUpvoteComplaint(selectedComplaint.id)}
                    disabled={upvotedIds.includes(selectedComplaint.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                      upvotedIds.includes(selectedComplaint.id)
                        ? 'bg-teal-50 text-teal-800 border-teal-200 cursor-default opacity-90'
                        : 'bg-white hover:bg-teal-50 text-teal-700 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${
                        upvotedIds.includes(selectedComplaint.id)
                          ? 'fill-teal-600 text-teal-600'
                          : ''
                      }`}
                    />
                    <span>
                      {upvotedIds.includes(selectedComplaint.id)
                        ? `Upvoted (${selectedComplaint.upvotes})`
                        : `Upvote (${selectedComplaint.upvotes})`}
                    </span>
                  </button>

                  {/* Open Detail Modal */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectComplaint(selectedComplaint)}
                    className="text-xs"
                  >
                    <span>Full Audit Trail</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No issue selected</p>
              <p className="text-xs text-slate-400 mt-1">
                Click any pin on the Nagpur map to view grievance details and municipal work logs.
              </p>
            </div>
          )}

          {/* Quick Stats Mini-Card */}
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-xs text-teal-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Nagpur Municipal Corporation (NMC) SLA</span>
            </div>
            <p className="text-[11px] text-teal-900 leading-relaxed">
              Wardha Road, Sitabuldi, and Medical Square corridors are prioritized for emergency monsoon response and patch works.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
