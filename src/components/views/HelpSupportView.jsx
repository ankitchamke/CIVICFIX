import React from 'react';
import {
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  FileQuestion,
  Building,
} from 'lucide-react';
import { Button } from '../ui/Button';

export function HelpSupportView({ onOpenReportModal }) {
  const faqs = [
    {
      q: 'How does CivicFix route complaints to Nagpur municipal departments?',
      a: 'CivicFix automatically categorizes incoming reports, assigns schematic coordinates on the Nagpur city map, and pushes dispatches to the corresponding Nagpur Municipal Corporation (NMC) zonal offices (Dharampeth, Dhantoli, Mangalwari, Laxmi Nagar, or Hanuman Nagar).',
    },
    {
      q: 'What is duplicate detection and why should I upvote existing Nagpur issues?',
      a: 'If a neighbor in Sitabuldi, Sadar, or Dharampeth has already reported the same pothole or dark lamp, upvoting their complaint increases the ticket priority on the municipal roster and avoids creating duplicate work orders for NMC field crews.',
    },
    {
      q: 'How can I track my complaint after submission?',
      a: 'Every complaint receives a tracking reference (e.g. CV-2026-8841). You can inspect real-time progress, crew dispatch timestamps, and photographic verification directly from the dashboard or the Nagpur Issue Map.',
    },
    {
      q: 'What are the municipal SLA commitments for Nagpur?',
      a: 'Critical safety hazards (e.g. fallen electrical lines, main water line bursts) are triaged within 4 hours. General road repairs, open manhole covers, and street lighting issues are targeted within 24 to 48 hours.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Nagpur CivicFix Support & NMC Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Frequently asked questions, grievance escalation procedures, and simulated contact channels for Nagpur Municipal Corporation (NMC) authorities.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={onOpenReportModal}>
          File New Grievance
        </Button>
      </div>

      {/* Emergency & Municipal Helplines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <PhoneCall className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Immediate Hazard Line</h4>
          <p className="text-xs text-slate-500 mb-3">
            For live electrical sparks, gas leaks, road subsidence, or fallen trees blocking emergency hospital corridors.
          </p>
          <div className="text-xs font-mono font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
            Emergency Dispatch: 112 / 101
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Building className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">NMC Headquarters</h4>
          <p className="text-xs text-slate-500 mb-3">
            Mahanagar Palika Central Office, Civil Lines, Nagpur 440001. Open weekdays 10:00 AM to 5:30 PM.
          </p>
          <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
            Tel: 0712-2567035 / Toll Free 1800-233-3764
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">NMC Public Grievance Cell</h4>
          <p className="text-xs text-slate-500 mb-3">
            If a complaint remains unaddressed beyond 48 hours, file a direct supervisory escalation.
          </p>
          <div className="text-xs font-mono text-blue-700 bg-blue-50 p-2 rounded-lg border border-blue-200">
            complaints@nmc.nagpur.gov.in
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-teal-600" />
          Nagpur Citizen FAQs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <h4 className="text-xs font-bold text-slate-900 mb-1.5">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
