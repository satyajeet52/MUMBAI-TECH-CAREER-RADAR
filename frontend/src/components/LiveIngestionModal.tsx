import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, Radio, CheckCircle2, AlertTriangle, 
  ExternalLink, Database, Activity, Clock, ShieldCheck
} from 'lucide-react';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestionComplete: () => Promise<void>;
}

export const LiveIngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  onIngestionComplete
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const resp = await fetch('/api/ingestion/history');
      const data = await resp.json();
      setHistory(data);
    } catch (e) {
      console.error("Error fetching ingestion logs:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunIngestion = async () => {
    setIsRunning(true);
    setResultMessage(null);
    try {
      const resp = await fetch('/api/ingest', { method: 'POST' });
      const data = await resp.json();
      setResultMessage(data.message || "Ingestion cycle executed successfully.");
      await onIngestionComplete();
      await fetchHistory();
    } catch (err) {
      setResultMessage("Failed to run live ingestion. Check network connectivity.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Live ATS Job Ingestion Control
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  REAL-TIME PIPELINE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated multi-source connector ingestion directly from verified career boards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* Active Connector Grid */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-cyan-400" />
              Connected ATS & Public Job Providers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Greenhouse ATS API
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">MongoDB, Elastic, Stripe, GitLab</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 inline-block">Direct JSON Endpoints</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Ashby Job Board API
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Linear, Replit, Ramp, Developer Unicorns</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 inline-block">Verified Posting API</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Remotive Tech Feed
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verified Software Engineering Feed</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 inline-block">Worldwide Remote Access</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    RemoteOK Developer API
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Global Full-Stack & AI Roles</p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 inline-block">Verified Compensation Tags</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Trigger Ingestion Action Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-950/60 to-slate-900 border border-cyan-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Execute On-Demand Ingestion Cycle
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Polls connected APIs, dedupes against existing records, and runs each opportunity through the MMR location & ₹10,000 stipend rule engine.
                </p>
              </div>
              <button
                onClick={handleRunIngestion}
                disabled={isRunning}
                className="btn-apply-primary self-start sm:self-center shrink-0 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>{isRunning ? 'Ingesting Feeds...' : 'Fetch Live Feeds'}</span>
              </button>
            </div>

            {resultMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{resultMessage}</span>
              </div>
            )}
          </div>

          {/* Recent Ingestion History */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              Recent Ingestion Logs
            </h3>
            <div className="space-y-2">
              {history.length > 0 ? (
                history.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{log.source_name}</span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Fetched: <strong className="text-cyan-400">{log.fetched_count}</strong> • New: <strong className="text-emerald-400">{log.inserted_count}</strong> • Updated: <strong className="text-purple-400">{log.updated_count}</strong>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{log.created_at}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No previous runs logged yet. Click "Fetch Live Feeds" to initiate.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

