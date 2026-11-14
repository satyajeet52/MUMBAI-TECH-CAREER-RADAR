import React from 'react';
import { Job } from '../types';
import { 
  Building2, MapPin, Clock, ShieldCheck, 
  ExternalLink, BookmarkPlus, Home, Info, AlertTriangle, Sparkles, Database
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onInspectEvidence: (job: Job) => void;
  onTrackJob: (job: Job) => void;
  onOpenAIModal?: (job: Job) => void;
  isAlreadyTracked?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onInspectEvidence,
  onTrackJob,
  onOpenAIModal,
  isAlreadyTracked = false
}) => {
  // Freshness calculation relative to 2026-11-14
  const calculateDaysAgo = (dateStr?: string) => {
    if (!dateStr || dateStr.includes('UNKNOWN') || dateStr.includes('Unknown')) {
      return 'Date Unverified';
    }
    try {
      const parts = dateStr.split('-');
      if (parts.length < 3) return 'Date Unverified';
      const pub = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const ref = new Date(2026, 10, 14);
      const diffTime = ref.getTime() - pub.getTime();
      if (diffTime < 0) return 'Published Today';
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Published Today';
      if (diffDays === 1) return 'Published Yesterday';
      return `Published ${diffDays}d ago`;
    } catch {
      return 'Recently Published';
    }
  };

  const getHRBadge = (quality: string) => {
    switch (quality) {
      case 'EXCELLENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">HR: EXCELLENT</span>;
      case 'GOOD':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">HR: GOOD</span>;
      case 'MIXED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">HR: MIXED</span>;
      case 'POOR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">HR: POOR</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">HR: UNKNOWN</span>;
    }
  };

  const isInternship = job.job_category === 'Internship';
  const isGreen = job.trust_classification === 'GREEN';

  // Company avatar letter
  const avatarLetter = (job.company || 'C').charAt(0).toUpperCase();

  return (
    <div className={`ui-card p-5 flex flex-col justify-between ${
      !isGreen ? (job.trust_classification === 'RED' ? 'ui-card-danger' : 'border-amber-500/30') : ''
    }`}>
      
      {/* Top Header: Company Avatar, Name, Trust Badge & Freshness */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {/* Company Avatar Letter */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold font-mono text-emerald-400 text-base shadow-sm shrink-0">
              {avatarLetter}
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-white tracking-tight">
                  {job.company}
                </span>
                {isGreen && (
                  <span className="inline-flex items-center text-emerald-400" title="100% Verified Corporate Entity">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
                {job.legal_name && (
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px] hidden sm:inline-block">
                    • {job.legal_name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                {job.mca_status ? (
                  <span className="text-slate-400">MCA: {job.mca_status}</span>
                ) : (
                  <span>HQ: {job.company_hq || 'Verified Entity'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Freshness Badge & Source Platform */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              <Clock className="w-3 h-3" />
              <span>{calculateDaysAgo(job.original_publication_date)}</span>
            </div>
            {job.source_platform && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                {job.source_platform}
              </span>
            )}
          </div>
        </div>

        {/* Role Title */}
        <h3 className="text-base font-bold text-white tracking-tight mb-2.5 hover:text-emerald-300 transition-colors">
          {job.title}
        </h3>

        {/* Categorization Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {/* Trust Badge */}
          {isGreen ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Green
            </span>
          ) : job.trust_classification === 'RED' ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Suspicious
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Needs Verification
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80">
            {job.job_category}
          </span>

          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            job.work_arrangement === 'On-site'
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
              : job.work_arrangement === 'Hybrid'
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
              : 'bg-teal-500/10 text-teal-300 border-teal-500/20'
          }`}>
            {job.work_arrangement}
          </span>

          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-800/80 text-cyan-300 border border-slate-700/80">
            {job.tech_category}
          </span>
        </div>

        {/* Location Box */}
        <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-medium text-slate-200 block truncate">
              {job.work_location}
            </span>
            {job.recruitment_drive_location && (
              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                Drive Location: <span className="text-cyan-300">{job.recruitment_drive_location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Compensation & Conversion Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          
          {/* Stipend / CTC */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
              {isInternship ? 'Monthly Stipend' : 'Annual CTC'}
            </span>
            <div className="text-sm font-bold font-mono text-emerald-300 flex items-center gap-1.5 flex-wrap">
              <span>{isInternship ? (job.stipend_text || 'STIPEND NOT VERIFIED') : (job.salary_ctc || 'Disclosed in Offer')}</span>
              {isInternship && job.stipend_amount && job.stipend_amount >= 10000 && (
                <span className="text-[9px] font-sans font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ≥ ₹10k Floor
                </span>
              )}
            </div>
            {isInternship && job.internship_duration && (
              <div className="text-[11px] text-slate-400 mt-1">
                Duration: <span className="text-slate-300 font-medium">{job.internship_duration}</span>
              </div>
            )}
          </div>

          {/* PPO or Accommodation Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
              {job.accommodation_provided ? 'Stay & Allowance' : 'Conversion (PPO)'}
            </span>
            {job.accommodation_provided ? (
              <div>
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1 truncate">
                  <Home className="w-3 h-3 text-cyan-400 shrink-0" />
                  {job.accommodation_type || 'Provided'}
                </span>
                {job.living_allowance_text && (
                  <span className="text-[11px] text-slate-400 block truncate mt-1">
                    {job.living_allowance_text}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-indigo-300 block truncate">
                  {job.ppo_offered ? 'PPO Conversion' : 'Direct Full-Time'}
                </span>
                <span className="text-[11px] text-slate-400 block truncate mt-1">
                  {job.ppo_details || 'Standard evaluation'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tech Stack Pills */}
        {Array.isArray(job.tech_stack) && job.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {job.tech_stack.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* HR Quality & Feedback */}
        <div className="pt-2.5 border-t border-slate-800/70 mb-3.5 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getHRBadge(job.hr_quality)}
              {job.recruiter_name && (
                <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  Recruiter: <span className="text-slate-300">{job.recruiter_name}</span>
                </span>
              )}
            </div>
            {job.application_deadline && (
              <span className="text-[10px] font-mono text-slate-400">
                Deadline: <span className="text-amber-400">{job.application_deadline}</span>
              </span>
            )}
          </div>
          {job.hr_feedback_summary && (
            <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
              "{job.hr_feedback_summary}"
            </p>
          )}
        </div>

        {/* Rejection Cause Alert if Not Approved */}
        {job.is_approved_apply_now === 0 && job.rejection_reason && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-rose-200">REJECTION AUDIT:</span>
              <span>{job.rejection_reason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onInspectEvidence(job)}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Evidence</span>
          </button>

          {onOpenAIModal && (
            <button
              onClick={() => onOpenAIModal(job)}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTrackJob(job)}
            className={`btn-ghost-action ${isAlreadyTracked ? 'text-indigo-400 border-indigo-500/30' : ''}`}
            title="Track application stages and notes"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{isAlreadyTracked ? 'Tracked' : 'Track'}</span>
          </button>

          {job.direct_application_url && job.direct_application_url !== 'APPLICATION LINK UNAVAILABLE' ? (
            <a
              href={job.direct_application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-apply-primary"
            >
              <span>APPLY DIRECTLY</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs cursor-not-allowed"
            >
              Link Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
