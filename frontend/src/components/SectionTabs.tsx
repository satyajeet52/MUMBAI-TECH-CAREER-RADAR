import React from 'react';

interface SectionTabsProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({ activeSection, onSelectSection }) => {
  const tabs = [
    { id: 'apply_now', label: 'All Verified (Apply Now)' },
    { id: 'mumbai_internships', label: 'Mumbai On-Site' },
    { id: 'mumbai_hybrid_internships', label: 'Mumbai Hybrid' },
    { id: 'remote_internships', label: 'Remote Roles' },
    { id: 'mumbai_ai_jobs', label: 'AI & GenAI' },
    { id: 'mumbai_fresher_jobs', label: 'Fresher Jobs' },
    { id: 'mumbai_drives', label: 'Off-Campus Drives' },
    { id: 'outside_companies_mumbai_drives', label: 'Non-Mumbai HQ Drives' },
    { id: 'outstation_with_accommodation', label: 'Outstation w/ Stay' },
    { id: 'internship_ppo', label: 'PPO Opportunities' },
    { id: 'tracker', label: 'My Applications' },
    { id: 'yellow', label: 'Needs Verification' },
    { id: 'red', label: 'Suspicious Watchlist' },
    { id: 'rejected_log', label: 'Rejection Ledger' }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSection(tab.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
