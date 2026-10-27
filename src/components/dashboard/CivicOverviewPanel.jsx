import React from 'react';
import {
  PlusCircle,
  ShieldCheck,
  Layers,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function CivicOverviewPanel({ onOpenReportModal, complaints = [] }) {
  // Compute category distributions
  const total = complaints.length || 1;
  const categories = [
    { label: 'Roads & Potholes', count: complaints.filter(c => c.category === 'roads').length, color: 'bg-amber-500' },
    { label: 'Waste & Sanitation', count: complaints.filter(c => c.category === 'sanitation').length, color: 'bg-emerald-500' },
    { label: 'Water & Drainage', count: complaints.filter(c => c.category === 'water').length, color: 'bg-sky-500' },
    { label: 'Street Lighting', count: complaints.filter(c => c.category === 'lighting').length, color: 'bg-yellow-500' },
    { label: 'Parks & Trees', count: complaints.filter(c => c.category === 'parks').length, color: 'bg-teal-500' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-700/60 shadow-lg relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header Row with Welcoming Title & Primary Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700/70">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Nagpur Municipal Corporation (NMC) Mesh Online
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Nagpur Grievance Resolution & Infrastructure Portal
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Report road craters, water pipeline leaks, dark streetlights, or waste overflow across Sitabuldi, Dharampeth, Civil Lines, and Wardha Road. Track work crews to verified photo completion.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={PlusCircle}
              onClick={onOpenReportModal}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md hover:shadow-teal-500/20 text-sm sm:text-base py-3 px-6"
            >
              Report an Issue Now
            </Button>
          </div>
        </div>

        {/* Middle Stats & Metric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Column 1: Live Telemetry & SLA */}
          <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/50 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Response SLA
                </span>
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">28.4 hrs</span>
                <span className="text-xs text-emerald-400 font-medium">↓ 14% vs last week</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Average citizen ticket acknowledgement to work order dispatch.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">High-Priority Turnaround:</span>
              <span className="text-white font-semibold">&lt; 4 hours</span>
            </div>
          </div>

          {/* Column 2: Department Category Breakdown */}
          <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/50 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Issue Categories
                </span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>

              {/* Progress stack */}
              <div className="h-3 w-full bg-slate-700/60 rounded-full overflow-hidden flex my-2">
                {categories.map((cat, idx) => {
                  const pct = Math.round((cat.count / total) * 100);
                  if (pct === 0) return null;
                  return (
                    <div
                      key={idx}
                      className={`${cat.color} h-full`}
                      style={{ width: `${pct}%` }}
                      title={`${cat.label}: ${cat.count}`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
                {categories.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-slate-300 truncate">{cat.label}</span>
                    <span className="text-slate-400 font-mono text-[11px] ml-auto">({cat.count})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
              <span>Local Similarity Check:</span>
              <span className="text-teal-300 font-medium">Active (Nagpur Mesh)</span>
            </div>
          </div>

          {/* Column 3: Community Verification & Public Transparency */}
          <div className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/50 backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resolution Accuracy
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">96.8%</span>
                <span className="text-xs text-teal-400 font-medium">Verified by Citizens</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Resolved tickets require photo audit proof before archival.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">Nagpur Civic Health:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Optimal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
