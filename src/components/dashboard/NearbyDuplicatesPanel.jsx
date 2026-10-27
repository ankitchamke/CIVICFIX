import React from 'react';
import {
  Navigation,
  MapPin,
  ThumbsUp,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function NearbyDuplicatesPanel({
  complaints = [],
  onSelectComplaint,
  onUpvoteComplaint,
  onOpenReportModal,
  upvotedIds = [],
}) {
  // Filter issues marked as nearby
  const nearbyIssues = complaints.filter((c) => c.isNearby);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-100 bg-linear-to-r from-amber-500/10 via-teal-500/5 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-800">
              <Navigation className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Nearby & Potential Duplicate Issues (Nagpur Demo Mesh)
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              Local Heuristic
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Our transparent local heuristic highlights civic grievances reported in adjacent Nagpur neighborhoods. 
            Before submitting a new report, check if your issue is already listed below and upvote it to increase its NMC priority rank.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenReportModal}
            className="text-xs bg-white text-slate-700 hover:text-teal-700"
          >
            <span>Report Unique Issue</span>
          </Button>
        </div>
      </div>

      {/* Grid of Nearby Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyIssues.map((item) => {
          const hasVoted = upvotedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onSelectComplaint(item)}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500/40 bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-sm flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Distance & Match Confidence Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    {item.distanceMeters ? `~${item.distanceMeters}m nearby (demo)` : 'Nearby Nagpur Area'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    {item.matchConfidence || 85}% Match
                  </span>
                </div>

                {/* Title & Category */}
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors mb-1.5">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <CategoryBadge category={item.categoryLabel} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {/* Footer with Upvote CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 text-[11px]">
                  {item.id}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasVoted) {
                        onUpvoteComplaint(item.id);
                      }
                    }}
                    disabled={hasVoted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                      hasVoted
                        ? 'bg-teal-50 text-teal-800 border-teal-200 cursor-default opacity-90'
                        : 'bg-white hover:bg-teal-50 text-teal-700 border-slate-200 hover:border-teal-300'
                    }`}
                    title={hasVoted ? 'You have upvoted this complaint' : 'Upvote instead of filing duplicate'}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-teal-600 text-teal-600' : ''}`} />
                    <span>{hasVoted ? `Upvoted (${item.upvotes})` : `Upvote (${item.upvotes})`}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advisory Callout */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          Upvoting an existing complaint prevents duplicate work orders and accelerates city crew response.
        </span>
      </div>
    </div>
  );
}
