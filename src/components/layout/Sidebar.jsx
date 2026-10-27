import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Map,
  HelpCircle,
  ShieldCheck,
  Radio,
  X,
} from 'lucide-react';

export function Sidebar({
  activeTab,
  onSelectTab,
  onOpenReportModal,
  mobileOpen,
  onCloseMobile,
  complaintCounts = { total: 11, my: 3, nearby: 5 },
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'map',
      label: 'Nagpur Issue Map',
      icon: Map,
      badge: 'Interactive',
    },
    {
      id: 'report',
      label: 'Report an Issue',
      icon: PlusCircle,
      action: onOpenReportModal,
      isPrimaryAction: true,
      badge: 'New',
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      icon: FileText,
      badge: complaintCounts.my,
    },
    {
      id: 'nearby',
      label: 'Nearby Issues',
      icon: MapPin,
      badge: `${complaintCounts.nearby} near`,
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-base tracking-tight">CivicFix</span>
                  <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded border border-teal-500/30">
                    Nagpur
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Public Grievance Portal</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-white md:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ward & Zone Telemetry Badge */}
          <div className="p-3 mx-3 my-3 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-[11px] font-semibold text-slate-200">NMC Central Mesh</p>
                <p className="text-[10px] text-slate-400">Nagpur, MH · 99.4% Uptime</p>
              </div>
            </div>
            <Radio className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.isPrimaryAction) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full mt-2 mb-2 flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[11px] bg-white/20 text-white font-medium px-1.5 py-0.5 rounded">
                      + File
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-teal-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                NMC Citizen Link
              </span>
              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded font-mono">
                Nagpur v3
              </span>
            </div>
            <p className="text-xs text-slate-300">
              City Grievance Mesh active for Nagpur Municipal Corporation.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
