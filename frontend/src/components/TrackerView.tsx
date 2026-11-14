import React, { useState } from 'react';
import { Application, ApplicationStatus } from '../types';
import { 
  BookmarkCheck, ExternalLink, Trash2, Edit3, Save, Calendar, 
  Clock, MapPin, Building2, CheckCircle2, AlertCircle, PlusCircle, Download
} from 'lucide-react';

interface TrackerViewProps {
  applications: Application[];
  onUpdateStatus: (id: number, status: ApplicationStatus, notes: string) => Promise<void>;
  onDeleteApplication: (id: number) => Promise<void>;
  onRefreshTracker: () => Promise<void>;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Discovered',
  'Verification Pending',
  'Verified',
  'Applied',
  'Assessment Pending',
  'Interview Scheduled',
  'Interview Completed',
  'Rejected',
  'Selected',
  'Offer Received',
  'Expired'
];

export const TrackerView: React.FC<TrackerViewProps> = ({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onRefreshTracker
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedStatus, setEditedStatus] = useState<ApplicationStatus>('Applied');
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (app: Application) => {
    setEditingId(app.id);
    setEditedStatus(app.status);
    setEditedNotes(app.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async (id: number) => {
    setIsSaving(true);
    try {
      await onUpdateStatus(id, editedStatus, editedNotes);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Selected':
      case 'Offer Received':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Interview Scheduled':
      case 'Interview Completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Assessment Pending':
      case 'Applied':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'Verified':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Rejected':
      case 'Expired':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 glass-panel">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            Persistent Application Tracker
          </h2>
          <p className="text-xs text-slate-400">
            Track interview rounds, assessments, direct ATS URLs, and personal notes across your verified Mumbai opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/tracker/export/csv"
            download="mumbai_tech_career_applications.csv"
            className="btn-apply-secondary text-xs flex items-center gap-1.5"
            title="Download CSV of all tracked job applications"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </a>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
            Total Tracked: {applications.length}
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No applications tracked yet</h3>
          <p className="text-xs max-w-md mx-auto mb-4">
            Click "Track Application" on any verified job opportunity card to monitor your application timeline and interview stages.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => {
            const isEditing = editingId === app.id;
            return (
              <div
                key={app.id}
                className="glass-panel p-5 border border-slate-800 hover:border-slate-700 transition-all rounded-xl"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Role, Company & Status */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {app.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      {app.priority && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                          Priority: {app.priority}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {app.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {app.work_location} ({app.work_arrangement})
                      </span>
                      {app.stipend_text && (
                        <span className="font-mono text-emerald-300">
                          {app.stipend_text}
                        </span>
                      )}
                      {app.applied_date && (
                        <span className="font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Applied: {app.applied_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & ATS Button */}
                  <div className="flex items-center gap-2 self-start lg:self-center">
                    {app.direct_application_url && (
                      <a
                        href={app.direct_application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cyber-outline text-xs"
                      >
                        <span>Open ATS Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(app)}
                        className="btn-secondary text-xs"
                        title="Edit status and notes"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Update</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSave(app.id)}
                          disabled={isSaving}
                          className="btn-primary text-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="btn-secondary text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition-colors"
                      title="Untrack application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit Controls Mode */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-lg">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Application Status Stage:
                      </label>
                      <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value as ApplicationStatus)}
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Personal Notes & Assessment Details:
                      </label>
                      <input
                        type="text"
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="e.g. Cleared round 1 coding test; system design interview on Nov 20..."
                        className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Notes Display */}
                {!isEditing && app.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-400 font-semibold font-mono text-[11px] shrink-0">Notes:</span>
                    <span className="italic text-slate-400">{app.notes}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

