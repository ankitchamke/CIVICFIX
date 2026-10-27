import React from 'react';
import {
  MapPin,
  Building2,
  ThumbsUp,
  Camera,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function ComplaintDetailModal({
  complaint,
  isOpen,
  onClose,
  onUpvote,
  onUpdateStatus,
  hasUpvoted = false,
}) {
  if (!complaint) return null;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const statuses = [
    { id: 'open', label: 'Open', color: 'hover:border-blue-400 text-blue-700' },
    { id: 'in_progress', label: 'In Progress', color: 'hover:border-amber-400 text-amber-700' },
    { id: 'resolved', label: 'Resolved', color: 'hover:border-emerald-400 text-emerald-700' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={complaint.title}
      subtitle={`Ticket Reference: ${complaint.id} • ${complaint.ward}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Badges and Upvote Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <CategoryBadge category={complaint.categoryLabel} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpvote(complaint.id)}
              disabled={hasUpvoted}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                hasUpvoted
                  ? 'bg-teal-50 text-teal-800 border border-teal-300 cursor-default opacity-90'
                  : 'bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-300 cursor-pointer'
              }`}
              title={hasUpvoted ? 'You have already upvoted this complaint in this session' : 'Upvote this complaint'}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-teal-600 text-teal-600' : ''}`} />
              <span>{hasUpvoted ? `Upvoted (${complaint.upvotes})` : `Upvote (${complaint.upvotes})`}</span>
            </button>
          </div>
        </div>

        {/* DEMO STATUS CONTROL */}
        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  Demo Status Control (Demo Mode)
                </span>
              </div>
              <p className="text-[11px] text-teal-800 mt-0.5">
                Simulate work order progress by changing this ticket's status. Updates persist to local storage.
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-white p-1 border border-teal-200 shadow-2xs shrink-0">
              {statuses.map((st) => (
                <button
                  key={st.id}
                  onClick={() => onUpdateStatus && onUpdateStatus(complaint.id, st.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    complaint.status === st.id
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issue Description & Photo Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Citizen Grievance Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                {complaint.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Location & Ward Context
              </h4>
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{complaint.location}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{complaint.ward}</p>
                    {complaint.schematicX !== undefined && (
                      <p className="text-slate-400 font-mono text-[10px] mt-0.5">
                        Nagpur Schematic Map Node: ({complaint.schematicX}, {complaint.schematicY}) · Illustrative Diagram Position
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assigned Authority
              </h4>
              <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs text-slate-700">
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-medium">{complaint.assignedDept}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Photo Proof & Map Mock */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Photo Evidence
              </h4>
              {complaint.hasPhoto && complaint.photoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group aspect-video">
                  <img
                    src={complaint.photoUrl}
                    alt={complaint.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-950/70 text-white rounded text-[10px] font-mono backdrop-blur-xs flex items-center gap-1">
                    <Camera className="w-3 h-3 text-teal-400" />
                    <span>Geo-stamped Photo Evidence</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-300 mb-1" />
                  <span>No photographic evidence attached for this entry</span>
                </div>
              )}
            </div>

            {/* Simulated SLA Badge */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>NMC SLA Target: 24-48 Hours</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Monitored under Nagpur Municipal Corporation (NMC) public service standards.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline of Municipal Actions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Municipal Action Timeline & Work Order Logs
          </h4>
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline && complaint.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-slate-50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {event.action}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{event.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Logged: {formatDate(complaint.dateReported)}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
}
