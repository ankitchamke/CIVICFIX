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
import { NagpurIssueMap } from './components/map/NagpurIssueMap';
import { HelpSupportView } from './components/views/HelpSupportView';
import {
  MOCK_NOTIFICATIONS,
  DEMO_USER,
} from './data/mockData';
import {
  loadStoredComplaints,
  saveComplaintsToStorage,
  resetDemoData,
  loadUpvotedIds,
  recordUpvoteId,
} from './utils/storage';
import { PlusCircle, MapPin, Map, FileText, CheckCircle, Info } from 'lucide-react';
import { Button } from './components/ui/Button';

export default function App() {
  // Persistent Complaint State
  const [complaints, setComplaints] = useState(() => loadStoredComplaints());
  const [upvotedIds, setUpvotedIds] = useState(() => loadUpvotedIds());

  // UI State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'map' | 'my-complaints' | 'nearby' | 'help'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Sync complaints to localStorage on change
  useEffect(() => {
    saveComplaintsToStorage(complaints);
  }, [complaints]);

  // Show auto-dismissing toast
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upvote handler with session/identity duplicate protection
  const handleUpvote = (complaintId) => {
    if (upvotedIds.includes(complaintId)) {
      showToast('You have already upvoted this complaint in this session.', 'info');
      return;
    }

    // Record vote in persistent storage
    const updatedVotes = recordUpvoteId(complaintId);
    setUpvotedIds(updatedVotes);

    setComplaints((prev) =>
      prev.map((item) => {
        if (item.id === complaintId) {
          return { ...item, upvotes: (item.upvotes || 0) + 1 };
        }
        return item;
      })
    );

    // Also update selectedComplaint if open
    setSelectedComplaint((prev) => {
      if (prev && prev.id === complaintId) {
        return { ...prev, upvotes: (prev.upvotes || 0) + 1 };
      }
      return prev;
    });

    showToast('Endorsement recorded! Municipal priority incremented.');
  };

  // Submit new complaint from modal
  const handleAddComplaint = (newComplaint) => {
    // Record creator's automatic vote
    const updatedVotes = recordUpvoteId(newComplaint.id);
    setUpvotedIds(updatedVotes);

    setComplaints((prev) => [newComplaint, ...prev]);
    showToast(`Complaint registered in Nagpur registry: ${newComplaint.id}`);
  };

  // Upvote from duplicate check
  const handleUpvoteExisting = (existingId) => {
    handleUpvote(existingId);
  };

  // Demo Status Change Control
  const handleUpdateStatus = (complaintId, newStatus) => {
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

    const timelineEntry = {
      date: timeStr,
      action: `Status Updated to ${statusLabels[newStatus] || newStatus}`,
      note: `Updated in Demo Mode by ${DEMO_USER.name} (Verified Resident).`,
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
  };

  // Reset to clean demo data
  const handleResetDemoData = () => {
    const freshData = resetDemoData();
    setComplaints(freshData);
    setUpvotedIds([]);
    setSelectedComplaint(null);
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    showToast('Nagpur demo data and local storage reset to initial baseline.');
  };

  // Filter for "My Complaints"
  // Displays user complaints (first 3 demo complaints or user-created complaints)
  const myComplaints = complaints.filter(
    (c, idx) => idx < 3 || (c.id && c.id.startsWith('CV-2026-9'))
  );
  const nearbyComplaints = complaints.filter((c) => c.isNearby);

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

      {/* Top Disclaimer Banner with Reset Action */}
      <DisclaimerBanner onResetDemoData={handleResetDemoData} />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
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
            {/* View: Overview */}
            {activeTab === 'overview' && (
              <>
                {/* Hero / Overview Banner */}
                <CivicOverviewPanel
                  complaints={complaints}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                />

                {/* Map Quick Shortcut Banner */}
                <div className="bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-4 sm:p-5 border border-slate-700/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                      <Map className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Interactive Nagpur Civic Issue Map
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.2 rounded-full border border-teal-500/30">
                          {complaints.length} Local Grievances Plotted
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Inspect spatial issue concentrations across Sitabuldi, Dharampeth, Sadar, Futala, and Wardha Road.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Map}
                    onClick={() => setActiveTab('map')}
                    className="shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                  >
                    Launch Nagpur Map
                  </Button>
                </div>

                {/* Summary Metrics */}
                <SummaryCards
                  complaints={complaints}
                  activeFilter={statusFilter}
                  onFilterChange={(newFilter) => setStatusFilter(newFilter)}
                />

                {/* Nearby Duplicates Alert & Detection Section */}
                <NearbyDuplicatesPanel
                  complaints={complaints}
                  onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                  onUpvoteComplaint={handleUpvote}
                  onOpenReportModal={() => setIsReportModalOpen(true)}
                  upvotedIds={upvotedIds}
                />

                {/* Grievance Registry / Complaints List */}
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

            {/* View: Dedicated Nagpur Issue Map */}
            {activeTab === 'map' && (
              <NagpurIssueMap
                complaints={complaints}
                onSelectComplaint={(complaint) => setSelectedComplaint(complaint)}
                onUpvoteComplaint={handleUpvote}
                upvotedIds={upvotedIds}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
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
                      Tracking tickets submitted by {DEMO_USER.name} across Nagpur Municipal Corporation (NMC).
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
                      Civic issues located in adjacent Nagpur neighborhoods (Sitabuldi, Dharampeth, Civil Lines, Sadar, Wardha Road).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      icon={Map}
                      onClick={() => setActiveTab('map')}
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

      {/* Report an Issue Modal with Nagpur Suggestions & Heuristic Duplicate Checking */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitComplaint={handleAddComplaint}
        onUpvoteExisting={handleUpvoteExisting}
        existingComplaints={complaints}
      />

      {/* Complaint Inspector Modal with Demo Status Controls */}
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
