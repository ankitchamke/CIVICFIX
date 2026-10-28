import React from 'react';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  LogIn,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge, CategoryBadge } from '../ui/Badge';
import { RealNagpurMap } from '../map/RealNagpurMap';
import { useAppAuth } from '../../lib/useAppAuth';
import { isClerkConfigured } from '../../lib/clerkConfig';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { AuthProfileMenu } from '../layout/AuthProfileMenu';

export function PublicHomepage({
  complaints = [],
  onNavigate,
  onOpenReportModal,
  onSelectComplaint,
  onUpvoteComplaint,
  upvotedIds = [],
  onResetDemoData,
}) {
  const auth = useAppAuth();
  const hasClerk = isClerkConfigured();

  // Recent complaints (latest 4)
  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Civic<span className="text-teal-600">Fix</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Nagpur
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                Municipal Grievance Platform
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg text-teal-700 bg-teal-50 font-bold cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Issues Map
            </button>
            <button
              onClick={() => onNavigate('overview')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              All Reports ({complaints.length})
            </button>
            <button
              onClick={() => onNavigate('help')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Help & Support
            </button>
          </nav>

          {/* Right Action Controls: Auth & Report Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenReportModal}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Report an Issue</span>
            </Button>

            {/* Clerk Sign In / Sign Up or User Button */}
            {auth.isSignedIn ? (
              <AuthProfileMenu
                onOpenReportModal={onOpenReportModal}
                onResetDemoData={onResetDemoData}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                {hasClerk ? (
                  <>
                    <SignInButton mode="modal">
                      <button className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/80 rounded-lg transition-colors cursor-pointer border border-teal-200">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </>
                ) : (
                  <AuthProfileMenu
                    onOpenReportModal={onOpenReportModal}
                    onResetDemoData={onResetDemoData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Compact Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Nagpur Municipal Public Grievance Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Report local issues.{' '}
            <span className="text-teal-600">Track real progress.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A direct civic platform for Nagpur residents to report potholes, broken streetlights,
            garbage overflow, and water pipeline leaks. All reports are mapped geographically and
            monitored transparently through municipal resolution.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onOpenReportModal}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Report an Issue</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => onNavigate('map')}
              className="border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold"
            >
              <MapPin className="w-4 h-4 mr-2 text-teal-600" />
              <span>Explore Issues & Map</span>
            </Button>

            {!auth.isSignedIn && hasClerk && (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  <span>Citizen Sign In</span>
                </Button>
              </SignInButton>
            )}
          </div>
        </section>

        {/* Compact Real Leaflet Map Preview */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Live Nagpur Issue Map
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OpenStreetMap GPS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Centrally focused on Nagpur, Maharashtra · Click any marker to view report status
              </p>
            </div>

            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RealNagpurMap
            complaints={complaints}
            onSelectComplaint={onSelectComplaint}
            onUpvoteComplaint={onUpvoteComplaint}
            upvotedIds={upvotedIds}
            onOpenReportModal={onOpenReportModal}
            isCompactPreview={true}
          />
        </section>

        {/* 3-Step Simple Resident Flow */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Pin & Describe the Problem
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select an issue category (Roads, Lighting, Waste, Water) and place your exact pin on the Nagpur map with optional photos.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Shared Database & Triage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every submission is saved to the shared database. Nearby residents can endorse and upvote to elevate priority.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Track to Verified Resolution
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Follow ticket progress in real-time as municipal work crews inspect, dispatch, and resolve the grievance.
            </p>
          </div>
        </section>

        {/* Recent Public Reports */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Public Grievances
              </h2>
              <p className="text-xs text-slate-500">
                Shared reports recorded across Nagpur wards
              </p>
            </div>

            <button
              onClick={() => onNavigate('overview')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentComplaints.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectComplaint(item)}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <StatusBadge status={item.status} size="sm" />
                    <CategoryBadge category={item.category} size="sm" />
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {item.location}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                  <div className="flex items-center gap-1 text-teal-700 font-semibold">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{item.upvotes || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Small Clean Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-slate-800 text-sm">CivicFix Nagpur</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                Nagpur, Maharashtra, India
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              NMC Citizen Grievance Helpline: 1800-233-3764 · OCW Water Emergency: 1800-266-9899
            </p>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400 space-y-0.5">
            <p>Demonstration environment for Nagpur civic issue reporting.</p>
            <p>Seeded initial records are clearly labeled as demo data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
