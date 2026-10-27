import React from 'react';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function SummaryCards({ complaints = [], activeFilter, onFilterChange }) {
  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  const cards = [
    {
      id: 'all',
      title: 'Total Grievances',
      count: total,
      subtext: 'Logged across Nagpur Municipal Corporation',
      icon: FileText,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      borderColor: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-400',
    },
    {
      id: 'open',
      title: 'Open Issues',
      count: openCount,
      subtext: 'Awaiting triage & work crew',
      icon: AlertCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      activeRing: 'ring-2 ring-blue-500',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      count: inProgressCount,
      subtext: 'Crews active on site',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      borderColor: 'border-amber-100',
      activeRing: 'ring-2 ring-amber-500',
    },
    {
      id: 'resolved',
      title: 'Resolved Cases',
      count: resolvedCount,
      subtext: 'Inspected and verified closed',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onFilterChange(card.id)}
            className={`p-5 rounded-2xl bg-white border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-left relative overflow-hidden group ${
              isSelected ? `${card.activeRing} bg-slate-50/50` : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {card.count}
              </span>
              <span className="text-xs font-medium text-slate-400">cases</span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-1">{card.subtext}</p>

            {isSelected && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-700">
                <span>Active Table Filter</span>
                <span>Click to reset</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
