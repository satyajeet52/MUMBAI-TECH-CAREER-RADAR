import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { SectionTabs } from './components/SectionTabs';
import { FilterBar } from './components/FilterBar';
import { JobCard } from './components/JobCard';
import { EvidenceModal } from './components/EvidenceModal';
import { TrackerView } from './components/TrackerView';
import { RejectionLedger } from './components/RejectionLedger';
import { AICareerModal } from './components/AICareerModal';
import { LiveIngestionModal } from './components/LiveIngestionModal';
import { Job, Application, ApplicationStatus, DashboardStats } from './types';
import { ShieldCheck, Radar, AlertTriangle, Layers, Info } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & State
  const [activeSection, setActiveSection] = useState<string>('apply_now');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [rejectedJobs, setRejectedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Filtering & Search
  const [search, setSearch] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [workArrangement, setWorkArrangement] = useState<string>('');
  const [jobType, setJobType] = useState<string>('');
  const [techCategory, setTechCategory] = useState<string>('');
  const [minStipend, setMinStipend] = useState<number | undefined>(undefined);
  const [ppoOnly, setPpoOnly] = useState<boolean>(false);
  const [accommodationOnly, setAccommodationOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals & Sub-systems
  const [inspectingJob, setInspectingJob] = useState<Job | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiTargetJob, setAiTargetJob] = useState<Job | null>(null);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('14-Nov-2026 08:20 IST');

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Load tracked applications
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/tracker');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch tracker:', err);
    }
  };

  // Load jobs based on filters and active section
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      params.append('section', activeSection);
      if (search) params.append('search', search);
      if (locationFilter) params.append('location_filter', locationFilter);
      if (workArrangement) params.append('work_arrangement', workArrangement);
      if (jobType) params.append('job_type', jobType);
      if (techCategory) params.append('tech_category', techCategory);
      if (minStipend) params.append('min_stipend', minStipend.toString());
      if (ppoOnly) params.append('ppo_only', 'true');
      if (accommodationOnly) params.append('accommodation_only', 'true');
      if (sortBy) params.append('sort_by', sortBy);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSection, search, locationFilter, workArrangement, jobType, techCategory, minStipend, ppoOnly, accommodationOnly, sortBy]);

  // Load rejected jobs for the ledger view
  const fetchRejectedJobs = async () => {
    try {
      const res = await fetch('/api/jobs?section=rejected_log');
      if (res.ok) {
        const data = await res.json();
        setRejectedJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch rejected jobs:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchApplications();
    fetchRejectedJobs();
  }, []);

  useEffect(() => {
    if (activeSection === 'tracker') {
      fetchApplications();
    } else if (activeSection === 'rejected_log') {
      fetchRejectedJobs();
    } else {
      fetchJobs();
    }
  }, [activeSection, fetchJobs]);

  // Handle Manual Deep Scan / Refresh
  const handleDeepRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLastRefreshTime(data.verified_timestamp);
        await Promise.all([fetchStats(), fetchJobs(), fetchRejectedJobs(), fetchApplications()]);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add / Track Job
  const handleTrackJob = async (job: Job) => {
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          status: 'Applied',
          notes: `Added to tracker from Radar. Direct ATS URL: ${job.direct_application_url}`,
          priority: 'High'
        })
      });
      if (res.ok) {
        await Promise.all([fetchApplications(), fetchStats()]);
      }
    } catch (err) {
      console.error('Failed to track job:', err);
    }
  };

  // Update Tracked Application
  const handleUpdateTracker = async (id: number, status: ApplicationStatus, notes: string) => {
    try {
      const res = await fetch(`/api/tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        await Promise.all([fetchApplications(), fetchStats()]);
      }
    } catch (err) {
      console.error('Failed to update tracker:', err);
    }
  };

  // Delete Tracked Application
  const handleDeleteTracker = async (id: number) => {
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await Promise.all([fetchApplications(), fetchStats()]);
      }
    } catch (err) {
      console.error('Failed to delete tracker:', err);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setLocationFilter('');
    setWorkArrangement('');
    setJobType('');
    setTechCategory('');
    setMinStipend(undefined);
    setPpoOnly(false);
    setAccommodationOnly(false);
    setSortBy('newest');
  };

  const handleOpenAIMatch = (job?: Job) => {
    setAiTargetJob(job || null);
    setIsAIModalOpen(true);
  };

  const trackedJobIds = new Set(applications.map((a) => a.job_id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        onRefresh={handleDeepRefresh}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
        onOpenAIModal={() => handleOpenAIMatch()}
        onOpenIngestionModal={() => setIsIngestionModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Metric Badges */}
        <MetricsBar
          stats={stats}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Section Tabs */}
        <SectionTabs
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Dynamic Section Content */}
        {activeSection === 'tracker' ? (
          <TrackerView
            applications={applications}
            onUpdateStatus={handleUpdateTracker}
            onDeleteApplication={handleDeleteTracker}
            onRefreshTracker={fetchApplications}
          />
        ) : activeSection === 'rejected_log' ? (
          <RejectionLedger rejectedJobs={rejectedJobs} />
        ) : (
          <>
            {/* Filter Controls */}
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              locationFilter={locationFilter}
              onLocationFilterChange={setLocationFilter}
              workArrangement={workArrangement}
              onWorkArrangementChange={setWorkArrangement}
              jobType={jobType}
              onJobTypeChange={setJobType}
              techCategory={techCategory}
              onTechCategoryChange={setTechCategory}
              minStipend={minStipend}
              onMinStipendChange={setMinStipend}
              ppoOnly={ppoOnly}
              onPpoOnlyChange={setPpoOnly}
              accommodationOnly={accommodationOnly}
              onAccommodationOnlyChange={setAccommodationOnly}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              onResetFilters={handleResetFilters}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  Showing {jobs.length} Verified {jobs.length === 1 ? 'Opportunity' : 'Opportunities'}
                </span>
                {activeSection === 'apply_now' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    100% GREEN APPROVED
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Freshness: Last 7 Days (Strict MMR Location & Stipend Rules)
              </div>
            </div>

            {/* Jobs List Grid */}
            {isLoading ? (
              <div className="glass-panel p-16 text-center">
                <Radar className="w-10 h-10 mx-auto text-emerald-400 animate-spin mb-3" />
                <p className="text-sm text-slate-300 font-medium">Scanning live verified opportunities...</p>
                <p className="text-xs text-slate-500 mt-1">Checking MCA, RoC, direct ATS endpoints, and MMR office addresses</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="glass-panel p-16 text-center text-slate-400">
                <ShieldCheck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">
                  Zero Opportunities Match Your Selected Filter Criteria
                </h3>
                <p className="text-xs max-w-md mx-auto mb-4">
                  Under strict anti-hallucination rules, we never invent fake listings. Try resetting your filters to view all verified Mumbai roles.
                </p>
                <button onClick={handleResetFilters} className="btn-secondary text-xs">
                  Reset Filter Parameters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onInspectEvidence={setInspectingJob}
                    onTrackJob={handleTrackJob}
                    onOpenAIModal={handleOpenAIMatch}
                    isAlreadyTracked={trackedJobIds.has(job.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MUMBAI TECH CAREER RADAR • Real-Time Software Recruitment Verification Platform</p>
          <p className="text-emerald-500/80">Anti-Hallucination Certified • Zero Unpaid Internships • Direct ATS Routing</p>
        </div>
      </footer>

      {/* Full Verification Evidence Dossier Modal */}
      <EvidenceModal
        job={inspectingJob}
        onClose={() => setInspectingJob(null)}
      />

      {/* AI Resume Matcher & Interview Prep Copilot */}
      <AICareerModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiTargetJob(null);
        }}
        selectedJob={aiTargetJob}
        allJobs={jobs}
      />

      {/* Live Ingestion Controller Modal */}
      <LiveIngestionModal
        isOpen={isIngestionModalOpen}
        onClose={() => setIsIngestionModalOpen(false)}
        onIngestionComplete={async () => {
          await Promise.all([fetchStats(), fetchJobs(), fetchRejectedJobs()]);
        }}
      />
    </div>
  );
};

export default App;
