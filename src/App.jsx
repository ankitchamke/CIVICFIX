import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { CivicOverviewPanel } from './components/dashboard/CivicOverviewPanel';
import { ComplaintsList } from './components/dashboard/ComplaintsList';
import { NearbyDuplicatesPanel } from './components/dashboard/NearbyDuplicatesPanel';
import { ComplaintDetailModal } from './components/complaints/ComplaintDetailModal';
import { ReportIssueModal } from './components/report/ReportIssueModal';
import { RealNagpurMap } from './components/map/RealNagpurMap';
import { PublicHomepage } from './components/home/PublicHomepage';
import { HelpSupportView } from './components/views/HelpSupportView';
import {
  MOCK_NOTIFICATIONS,
  DEMO_USER,
} from './data/mockData';
import {
  loadStoredComplaints,
  loadUpvotedIds,
  recordUpvoteId,
} from './utils/storage';
import {
  getComplaints,
  addComplaint,
  updateComplaintStatus as repoUpdateStatus,
  incrementComplaintUpvotes as repoIncrementUpvotes,
  resetComplaints,
  subscribeToComplaints,
} from './services/complaintsRepository';
import { useAppAuth } from './lib/useAppAuth';
import { PlusCircle, MapPin, Map, FileText, CheckCircle, Info } from 'lucide-react';
import { Button } from './components/ui/Button';

export default function App() {
  const auth = useAppAuth();

  // Persistent Complaint State
  const [complaints, setComplaints] = useState(() => loadStoredComplaints());
  const [upvotedIds, setUpvotedIds] = useState(() => loadUpvotedIds());

  // UI State: 'home' is the default public entry point
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['home', 'overview', 'map', 'my-complaints', 'nearby', 'help'].includes(hash)
      ? hash
      : 'home';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Show auto-dismissing toast
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync hash routing so browser back/forward and direct links work
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'overview', 'map', 'my-complaints', 'nearby', 'help'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab === 'home' ? '' : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shared Data synchronization: Initial load, Realtime stream, and fallback polling
  useEffect(() => {
    let isMounted = true;

    const refreshData = () => {
      getComplaints().then((res) => {
        if (isMounted && res.complaints && res.complaints.length > 0) {
          setComplaints(res.complaints);
        }
      });
    };

    // Initial load
    refreshData();

    // Subscribe to live database changes across all user sessions
    const unsubscribe = subscribeToComplaints((payload) => {
      console.log('Realtime change from Supabase:', payload);
      refreshData();
    });

    // Multi-browser poll every 20 seconds to guarantee fresh shared data
    const pollInterval = setInterval(() => {
      refreshData();
    }, 20000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  // Upvote handler with session protection and database sync
  const handleUpvote = async (complaintId) => {
    if (upvotedIds.includes(complaintId)) {
      showToast('You have already endorsed this complaint in this session.', 'info');
      return;
    }

    const updatedVotes = recordUpvoteId(complaintId);
    setUpvotedIds(updatedVotes);

    let nextCount = 1;
    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === complaintId) {
          nextCount = (item.upvotes || 0) + 1;
          return { ...item, upvotes: nextCount };
        }
        return item;
      })
    );

    setSelectedComplaint((prev) => {
      if (prev && prev.id === complaintId) {
        return { ...prev, upvotes: (prev.upvotes || 0) + 1 };
      }
      return prev;
    });

    showToast('Endorsement recorded! Municipal priority incremented.');

    try {
      await repoIncrementUpvotes(complaintId, nextCount);
    } catch (err) {
      console.warn('Failed to sync upvote to database:', err);
    }
  };

  // Submit new complaint from modal
  const handleAddComplaint = async (newComplaint, authorName) => {
    // 1. Attempt database write first (will throw if remote write fails!)
    await addComplaint(newComplaint, authorName || auth.displayName || DEMO_USER.name);

    // 2. On confirmed write: record creator's upvote and update local state
    const updatedVotes = recordUpvoteId(newComplaint.id);
    setUpvotedIds(updatedVotes);

    setComplaints((prev) => [newComplaint, ...prev.filter((c) => c.id !== newComplaint.id)]);
    showToast(`Complaint registered in Nagpur database: ${newComplaint.id}`);
  };

  // Upvote from duplicate check
  const handleUpvoteExisting = (existingId) => {
    handleUpvote(existingId);
  };

  // Status Change Control
  const handleUpdateStatus = async (complaintId, newStatus) => {
    const statusLabels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
    };

    const timeStr = new Date().toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const actor = auth.displayName || DEMO_USER.name;
    const timelineEntry = {
      date: timeStr,
      action: `Status Updated to ${statusLabels[newStatus] || newStatus}`,
      note: `Updated by ${actor} (Verified Resident).`,
    };

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === complaintId) {
          const currentTimeline = item.timeline || [];
          return {
            ...item,
            status: newStatus,
            timeline: [timelineEntry, ...currentTimeline],
          };
        }
        return item;
      })
    );

    setSelectedComplaint((prev) => {
      if (prev && prev.id === complaintId) {
        const currentTimeline = prev.timeline || [];
        return {
          ...prev,
          status: newStatus,
          timeline: [timelineEntry, ...currentTimeline],
        };
      }
      return prev;
    });

    showToast(`Complaint #${complaintId} status changed to ${statusLabels[newStatus] || newStatus}`);

    await repoUpdateStatus(complaintId, newStatus, timelineEntry);
  };

  // Reset demo data
  const handleResetDemoData = () => {
    const freshData = resetComplaints();
    setComplaints(freshData);
    setUpvotedIds([]);
    setSelectedComplaint(null);
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    showToast('Nagpur demo data reset to initial baseline.');
  };

  // Derived user reports
  const myComplaints = complaints.filter(
    (c) =>
      (auth.isSignedIn && auth.user && c.reporterId === auth.user.id) ||
      (!auth.isSignedIn && (c.id?.startsWith('CV-2026-9') || c.reporterId === 'demo_user'))
  );
  const nearbyComplaints = complaints.filter((c) => c.isNearby);

  // If on the Public Homepage at '/' or '#home', render the clean public homepage
  if (activeTab === 'home') {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
            {toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.message}</span>
          </div>
        )}

        <PublicHomepage
          complaints={complaints}
          onNavigate={handleSelectTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
          onUpvoteComplaint={handleUpvote}
          upvotedIds={upvotedIds}
          onResetDemoData={handleResetDemoData}
        />

        {/* Modals */}
        <ReportIssueModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmitComplaint={handleAddComplaint}
          onUpvoteExisting={handleUpvoteExisting}
          existingComplaints={complaints}
        />

        <ComplaintDetailModal
          complaint={selectedComplaint}
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={handleUpvote}
          onUpdateStatus={handleUpdateStatus}
          hasUpvoted={selectedComplaint ? upvotedIds.includes(selectedComplaint.id) : false}
        />
      </>
    );
  }

  // Dashboard / App Navigation Layout (when navigating to Explore Map, Overview, My Reports, Help)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-white relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          {toastMessage.type === 'info' ? (
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-medium">{toastMessage.message}</span>
        </div>
      )}

      {/* Top Disclaimer Banner */}
      <DisclaimerBanner onResetDemoData={handleResetDemoData} />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          complaintCounts={{
            total: complaints.length,
            my: myComplaints.length,
            nearby: nearbyComplaints.length,
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <Topbar
            onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            notifications={MOCK_NOTIFICATIONS}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onResetDemoData={handleResetDemoData}
          />

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* View: Overview & Registry */}
            {activeTab === 'overview' && (
              <>
                <CivicOverviewPanel
                  complaints={complaints}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />

                {/* Map Shortcut Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 border border-slate-700/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Geographic Nagpur Civic Map
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.2 rounded-full border border-teal-500/30">
                          {complaints.filter((c) => c.latitude).length} GPS-Pinned
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Interactive OpenStreetMap view centered on Nagpur (Sitabuldi, Dharampeth, Sadar, Futala, Wardha Road).
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Map}
                    onClick={() => handleSelectTab('map')}
                    className="shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                  >
                    Launch Full Map
                  </Button>
                </div>

                <SummaryCards
                  complaints={complaints}
                  activeFilter={statusFilter}
                  onFilterChange={(newFilter) => setStatusFilter(newFilter)}
                />

                <NearbyDuplicatesPanel
                  complaints={complaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  upvotedIds={upvotedIds}
                />

                <ComplaintsList
                  complaints={complaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  upvotedIds={upvotedIds}
                />
              </>
            )}

            {/* View: Dedicated Real Leaflet Nagpur Issue Map */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Map className="w-5 h-5 text-teal-600" />
                      Nagpur Civic Issue Map
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real geographic mapping powered by OpenStreetMap · Nagpur, Maharashtra, India
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectTab('home')}
                    >
                      ← Back to Home
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={PlusCircle}
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      Report Issue Here
                    </Button>
                  </div>
                </div>

                <RealNagpurMap
                  complaints={complaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  upvotedIds={upvotedIds}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  isCompactPreview={false}
                />
              </div>
            )}

            {/* View: My Complaints */}
            {activeTab === 'my-complaints' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
                        <FileText className="w-5 h-5" />
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        My Grievance Submissions
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Tracking tickets submitted by {auth.displayName || DEMO_USER.name} across Nagpur.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={PlusCircle}
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    Report Another Issue
                  </Button>
                </div>

                <ComplaintsList
                  complaints={myComplaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  upvotedIds={upvotedIds}
                />
              </div>
            )}

            {/* View: Nearby Issues */}
            {activeTab === 'nearby' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-amber-50 text-amber-700">
                        <MapPin className="w-5 h-5" />
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        Spatial Geo-Mesh & Nearby Issues
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Civic issues located in adjacent Nagpur neighborhoods.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      icon={Map}
                      onClick={() => handleSelectTab('map')}
                    >
                      Open in Map
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      icon={PlusCircle}
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      File New Grievance
                    </Button>
                  </div>
                </div>

                <NearbyDuplicatesPanel
                  complaints={complaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  upvotedIds={upvotedIds}
                />

                <ComplaintsList
                  complaints={nearbyComplaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  upvotedIds={upvotedIds}
                />
              </div>
            )}

            {/* View: Help & Support */}
            {activeTab === 'help' && (
              <HelpSupportView
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitComplaint={handleAddComplaint}
        onUpvoteExisting={handleUpvoteExisting}
        existingComplaints={complaints}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        onUpvote={handleUpvote}
        onUpdateStatus={handleUpdateStatus}
        hasUpvoted={selectedComplaint ? upvotedIds.includes(selectedComplaint.id) : false}
      />
    </div>
  );
}
