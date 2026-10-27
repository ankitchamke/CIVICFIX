// Unified Auth & Profile Menu
// Automatically handles Clerk authentication when configured,
// and gracefully provides the unauthenticated Ankit Chamke demo identity.

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  UserCheck,
  Sparkles,
  RotateCcw,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { isClerkConfigured } from '../../lib/clerkConfig';
import { useAppAuth } from '../../lib/useAppAuth';
import { SignInButton } from '@clerk/clerk-react';

export function AuthProfileMenu({ onOpenReportModal, onResetDemoData }) {
  const { isLoaded, isSignedIn, displayName, displayEmail, displayAvatar, signOut } = useAppAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const clerkActive = isClerkConfigured();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded) {
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;
  }

  // Live Authenticated User Profile
  if (isSignedIn) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1 rounded-full border border-teal-200 hover:border-teal-300 bg-teal-50/60 hover:bg-teal-50 transition-all cursor-pointer"
        >
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-teal-500"
          />
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {displayName}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800 px-1 py-0.2 rounded border border-teal-300">
                Live Auth
              </span>
            </div>
            <p className="text-[10px] text-teal-700 leading-tight">
              Signed in via Clerk
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95">
            <div className="px-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-teal-500"
                />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                  )}
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Citizen Identity
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 text-xs bg-teal-50/50 m-3 rounded-lg border border-teal-200/60 text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-teal-900 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Clerk Session Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your submitted grievances and upvotes will record your authenticated resident credentials.
              </p>
            </div>

            <div className="px-2 pt-1 space-y-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenReportModal();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Report an Issue in Nagpur</span>
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Sign Out</span>
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated Demo Mode Profile (Ankit Chamke)
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2.5 p-1 sm:pl-2 sm:pr-3 sm:py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer"
      >
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-500/30"
        />
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {displayName}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider bg-amber-100 text-amber-800 px-1 py-0.2 rounded border border-amber-300">
              Demo
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Resident Contributor (Demo)
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95">
          <div className="px-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500">Resident Contributor (Demo)</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Demo Resident Profile
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 text-xs bg-slate-50/80 m-3 rounded-lg border border-slate-200/70 text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Demo Mode Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {clerkActive
                ? 'Operating as demo resident Ankit Chamke. Sign in with Clerk to record your verified citizen account.'
                : 'Operating in verified demo resident mode. All changes persist across refreshes via localStorage.'}
            </p>
          </div>

          <div className="px-2 pt-1 space-y-1">
            {clerkActive && (
              <SignInButton mode="modal">
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-md transition-colors flex items-center justify-between cursor-pointer border border-teal-200/60"
                >
                  <span>Sign In with Clerk</span>
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                </button>
              </SignInButton>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                onOpenReportModal();
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>File a test complaint</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            </button>

            {onResetDemoData && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (window.confirm('Reset all complaints back to the original Nagpur demo data?')) {
                    onResetDemoData();
                  }
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Reset Local Demo Data</span>
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
