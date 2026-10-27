import React from 'react';
import {
  MapPin,
  Calendar,
  ThumbsUp,
  ChevronRight,
  Camera,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { CATEGORIES } from '../../data/mockData';

export function ComplaintsList({
  complaints = [],
  onSelectComplaint,
  onUpvoteComplaint,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchChange,
  upvotedIds = [],
}) {
  // Filter complaints
  const filtered = complaints.filter((c) => {
    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'all' && c.category !== categoryFilter) {
      return false;
    }
    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesId = (c.id || '').toLowerCase().includes(q);
      const matchesTitle = (c.title || '').toLowerCase().includes(q);
      const matchesLocation = (c.location || '').toLowerCase().includes(q);
      const matchesDept = (c.assignedDept || '').toLowerCase().includes(q);
      if (!matchesId && !matchesTitle && !matchesLocation && !matchesDept) {
        return false;
      }
    }
    return true;
  });

  const isFiltered = statusFilter !== 'all' || categoryFilter !== 'all' || Boolean(searchQuery && searchQuery.trim());

  const handleResetFilters = () => {
    onStatusFilterChange('all');
    onCategoryFilterChange('all');
    if (onSearchChange) onSearchChange('');
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header and Filter Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Live Grievance Registry
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filtered.length} of {complaints.length} shown
            </span>
            {isFiltered && (
              <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Filtered
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Public citizen complaints filed and triaged across Nagpur Municipal Corporation (NMC) jurisdiction.
          </p>
        </div>

        {/* Filter Badges & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status quick select */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => onStatusFilterChange(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'in_progress' ? 'In Progress' : st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Table or Empty */}
      {filtered.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No complaints match your criteria"
            description="Clear your search terms or change the status filter to see other civic grievance filings."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Complaint ID</th>
                <th className="py-3.5 px-4">Issue & Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Filed</th>
                <th className="py-3.5 px-4 text-center">Citizen Upvotes</th>
                <th className="py-3.5 px-4 text-right sm:pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((item) => {
                const hasVoted = upvotedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectComplaint(item)}
                    className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.id}
                      </span>
                      {item.hasPhoto && (
                        <span className="ml-1.5 inline-flex items-center text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/60" title="Photo attached">
                          <Camera className="w-2.5 h-2.5 mr-0.5" />
                          Pic
                        </span>
                      )}
                    </td>

                    {/* Title & Location */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={item.categoryLabel} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(item.dateReported)}</span>
                      </div>
                    </td>

                    {/* Upvotes */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!hasVoted) {
                            onUpvoteComplaint(item.id);
                          }
                        }}
                        disabled={hasVoted}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer group/up ${
                          hasVoted
                            ? 'bg-teal-50 text-teal-800 border-teal-200 cursor-default opacity-90'
                            : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border-slate-200/70'
                        }`}
                        title={hasVoted ? 'You have upvoted this complaint' : 'Support this civic grievance'}
                      >
                        <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-teal-600 text-teal-600' : 'group-hover/up:scale-110 transition-transform'}`} />
                        <span>{item.upvotes}</span>
                      </button>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 sm:pr-6 whitespace-nowrap text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item);
                        }}
                        className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer with Live Telemetry Info */}
      <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Municipal synchronization active — persistent local storage layer</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any complaint row to inspect audit trail & update demo status
        </span>
      </div>
    </div>
  );
}
