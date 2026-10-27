import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export function DisclaimerBanner({ onResetDemoData }) {
  return (
    <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-1.5 text-xs text-amber-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold text-amber-950">Nagpur Demo Build:</span>
          <span className="text-amber-800 hidden md:inline">
            Nagpur, Maharashtra, India · All complaints & NMC dispatches are simulated for competition evaluation.
          </span>
          <span className="text-amber-800 md:hidden">
            Nagpur, Maharashtra, India · Simulated demo.
          </span>
        </div>

        {onResetDemoData && (
          <button
            onClick={() => {
              if (window.confirm('Reset all complaints, upvotes, and map markers back to default Nagpur demo data?')) {
                onResetDemoData();
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 transition-colors cursor-pointer shrink-0"
            title="Reset localStorage to Nagpur original state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        )}
      </div>
    </div>
  );
}
