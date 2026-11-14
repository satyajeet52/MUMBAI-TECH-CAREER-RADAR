import React, { useState } from 'react';
import { Radar, RefreshCw, ShieldCheck, CheckCircle2, Clock, Sparkles, Radio, Brain } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  lastRefreshTime: string;
  onOpenAIModal?: () => void;
  onOpenIngestionModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  isRefreshing, 
  lastRefreshTime,
  onOpenAIModal,
  onOpenIngestionModal
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefreshClick = async () => {
    try {
      await onRefresh();
      setToastMessage("Radar scan complete: All opportunities re-verified against live standards!");
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setToastMessage("Verification cycle encountered an error.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shrink-0">
              <Radar className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="absolute -top-1 -right-1 radar-live-dot" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  MUMBAI TECH CAREER RADAR
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.0 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Real-Time Verified Software Internships, Fresher Roles & Recruitment Drives
              </p>
            </div>
          </div>

          {/* Right Controls: Ingestion, AI, Clock & Deep Scan */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenIngestionModal && (
              <button
                onClick={onOpenIngestionModal}
                className="btn-apply-secondary text-xs flex items-center gap-1.5 border-cyan-500/30 hover:border-cyan-400 text-cyan-300"
                title="Manage Live Greenhouse, Ashby & Remote Feed Ingestion"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Live Feeds</span>
              </button>
            )}

            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="btn-apply-secondary text-xs flex items-center gap-1.5 border-purple-500/30 hover:border-purple-400 text-purple-300"
                title="Open AI Resume Matcher & Interview Prep Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Copilot</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>14-Nov-2026 • 08:20 IST</span>
            </div>

            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className={`btn-apply-primary text-xs ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Re-verify All'}</span>
            </button>
          </div>
        </div>

        {/* Verification Guarantee Strip */}
        <div className="mt-3 pt-2.5 border-t border-slate-900/90 flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-xs text-slate-400">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Companies
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> ≥ ₹10k/mo Stipend Floor
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Direct ATS Applications
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Real-Time Live Feeds
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden lg:inline-block">
            Strict Anti-Hallucination Pipeline • Zero Fabricated Listings
          </span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
