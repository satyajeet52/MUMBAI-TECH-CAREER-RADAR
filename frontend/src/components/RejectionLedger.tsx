import React from 'react';
import { Job } from '../types';
import { FileX, AlertTriangle, ShieldAlert, MapPin, Building2, ExternalLink } from 'lucide-react';

interface RejectionLedgerProps {
  rejectedJobs: Job[];
}

export const RejectionLedger: React.FC<RejectionLedgerProps> = ({ rejectedJobs }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 border-l-4 border-l-rose-500">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Anti-Hallucination & Filtered Rejection Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Transparent log of all opportunities that were discovered and evaluated by our verification pipeline but strictly rejected from the <span className="text-emerald-400 font-semibold">APPLY NOW</span> section due to rule violations (unpaid internships, sub-₹10k stipends, hybrid outside Mumbai, outstation lacking accommodation, expired dates, or fraud indicators).
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {rejectedJobs.map((job) => (
          <div
            key={job.id}
            className="glass-panel p-4 border border-rose-950/60 hover:border-rose-800/60 transition-all rounded-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  REJECTED
                </span>
                <span className="text-xs font-semibold text-white">
                  {job.title}
                </span>
                <span className="text-xs text-slate-400">
                  at <span className="text-slate-300 font-medium">{job.company}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {job.job_category} • {job.work_arrangement}
              </span>
            </div>

            {/* Rejection Cause Highlight */}
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-rose-200">REJECTION AUDIT VERDICT:</span>
                <span>{job.rejection_reason || 'Failed strict Mumbai Radar verification rules.'}</span>
              </div>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/40 p-2 rounded">
              <div>
                <span className="text-slate-500">Location:</span> {job.work_location}
              </div>
              <div>
                <span className="text-slate-500">Stipend:</span> {job.stipend_text || 'None'}
              </div>
              <div>
                <span className="text-slate-500">Published:</span> {job.original_publication_date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

