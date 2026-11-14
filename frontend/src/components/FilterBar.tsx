import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  locationFilter: string;
  onLocationFilterChange: (val: string) => void;
  workArrangement: string;
  onWorkArrangementChange: (val: string) => void;
  jobType: string;
  onJobTypeChange: (val: string) => void;
  techCategory: string;
  onTechCategoryChange: (val: string) => void;
  minStipend: number | undefined;
  onMinStipendChange: (val: number | undefined) => void;
  ppoOnly: boolean;
  onPpoOnlyChange: (val: boolean) => void;
  accommodationOnly: boolean;
  onAccommodationOnlyChange: (val: boolean) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  locationFilter,
  onLocationFilterChange,
  workArrangement,
  onWorkArrangementChange,
  jobType,
  onJobTypeChange,
  techCategory,
  onTechCategoryChange,
  minStipend,
  onMinStipendChange,
  ppoOnly,
  onPpoOnlyChange,
  accommodationOnly,
  onAccommodationOnlyChange,
  sortBy,
  onSortByChange,
  onResetFilters
}) => {
  const hasActiveFilters = Boolean(
    search || locationFilter || workArrangement || jobType || techCategory || minStipend || ppoOnly || accommodationOnly || sortBy !== 'newest'
  );

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-md">
      
      {/* Search & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by company, title, technology (e.g. Python, Java, React, LLM), or MMR locality..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">Newest First</option>
            <option value="stipend_high">Highest Stipend (₹/mo)</option>
            <option value="ctc_high">Full-time CTC</option>
          </select>
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/80">
        
        {/* Location */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Location
          </label>
          <select
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Locations</option>
            <option value="mumbai">Mumbai City & Suburbs</option>
            <option value="navi mumbai">Navi Mumbai (RCP/Airoli)</option>
            <option value="thane">Thane / MMR</option>
            <option value="remote">Completely Remote</option>
            <option value="outstation">Outstation w/ Stay</option>
          </select>
        </div>

        {/* Arrangement */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Work Arrangement
          </label>
          <select
            value={workArrangement}
            onChange={(e) => onWorkArrangementChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Arrangements</option>
            <option value="On-site">On-site Only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Opportunity Type
          </label>
          <select
            value={jobType}
            onChange={(e) => onJobTypeChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time Job</option>
          </select>
        </div>

        {/* Technical Domain */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Technical Domain
          </label>
          <select
            value={techCategory}
            onChange={(e) => onTechCategoryChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Domains</option>
            <option value="Software Development">Software Engineering</option>
            <option value="AI">AI & ML</option>
            <option value="Generative AI">Generative AI & LLMs</option>
            <option value="Agentic AI">Agentic AI</option>
            <option value="Backend">Backend / Systems</option>
            <option value="Frontend">Frontend / Web</option>
            <option value="Full Stack">Full Stack</option>
          </select>
        </div>

        {/* Minimum Stipend */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Min Stipend
          </label>
          <select
            value={minStipend || ''}
            onChange={(e) => onMinStipendChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="">≥ ₹10,000 / mo</option>
            <option value="15000">≥ ₹15,000 / mo</option>
            <option value="25000">≥ ₹25,000 / mo</option>
            <option value="40000">≥ ₹40,000 / mo</option>
            <option value="60000">≥ ₹60,000 / mo</option>
          </select>
        </div>
      </div>

      {/* Row 3: Checkbox Chips & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ppoOnly}
              onChange={(e) => onPpoOnlyChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
            />
            <span>PPO Conversion Offered</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accommodationOnly}
              onChange={(e) => onAccommodationOnlyChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
            />
            <span>Accommodation Provided</span>
          </label>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
