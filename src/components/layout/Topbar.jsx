import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Clock,
} from 'lucide-react';
import { AuthProfileMenu } from './AuthProfileMenu';
import { isSupabaseConfigured } from '../../lib/supabase';

export function Topbar({
  onToggleMobile,
  searchQuery,
  onSearchChange,
  notifications = [],
  onOpenReportModal,
  onResetDemoData,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState(notifications);

  const notifRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const hasDb = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Civic Overview & Grievance Tracking
              <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Nagpur NMC Portal
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Monitoring public issue dispatches, citizen resolutions, and telemetry across Nagpur, Maharashtra.
            </p>
          </div>
        </div>

        {/* Right: Search, Database Telemetry, Notifications, User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Database Persistence Status Indicator */}
          {hasDb ? (
            <div
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold"
              title="Supabase PostgreSQL database configured"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Sync</span>
            </div>
          ) : (
            <div
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold"
              title="Operating with local browser storage cache"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Local Storage Mesh</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative hidden xl:block w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by ID, title, street..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                ×
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200/80 text-slate-500 px-1 py-0.5 rounded font-mono">
                /
              </span>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      Municipal Telemetry Updates
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifs.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                        item.unread ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-mono text-slate-400">
                          Ref: {item.complaintId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                  <span className="text-[10px] text-slate-500">
                    Live updates via City Works Message Bus
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Menu */}
          <AuthProfileMenu
            onOpenReportModal={onOpenReportModal}
            onResetDemoData={onResetDemoData}
          />
        </div>
      </div>
    </header>
  );
}
