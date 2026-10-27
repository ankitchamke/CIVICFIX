import React from 'react';

export function StatusBadge({ status, className = '' }) {
  const configs = {
    open: {
      label: 'Open',
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dot: 'bg-blue-500',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500 animate-pulse',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-600',
    },
  };

  const config = configs[status] || configs.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, className = '' }) {
  const configs = {
    high: {
      label: 'High Priority',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    low: {
      label: 'Standard',
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const config = configs[priority] || configs.medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider border ${config.bg} ${className}`}
    >
      {config.label}
    </span>
  );
}

export function CategoryBadge({ category, className = '' }) {
  const colors = {
    roads: 'bg-amber-100/70 text-amber-900 border-amber-200',
    lighting: 'bg-yellow-100/70 text-yellow-900 border-yellow-200',
    sanitation: 'bg-emerald-100/70 text-emerald-900 border-emerald-200',
    water: 'bg-sky-100/70 text-sky-900 border-sky-200',
    parks: 'bg-teal-100/70 text-teal-900 border-teal-200',
    traffic: 'bg-indigo-100/70 text-indigo-900 border-indigo-200',
  };

  const colorClass = colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${colorClass} ${className}`}
    >
      {category}
    </span>
  );
}
