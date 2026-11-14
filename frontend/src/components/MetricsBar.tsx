import React from 'react';
import { DashboardStats } from '../types';
import { CheckCircle2, AlertCircle, AlertOctagon, Filter, MapPin, BookmarkCheck } from 'lucide-react';

interface MetricsBarProps {
  stats: DashboardStats | null;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats, activeSection, onSelectSection }) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'apply_now',
      label: 'Apply Now',
      badge: 'VERIFIED',
      value: stats.approved_green,
      sublabel: '100% verified & active',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      activeRing: 'ring-emerald-500/40 border-emerald-500/50 bg-emerald-950/20'
    },
    {
      id: 'yellow',
      label: 'Needs Verification',
      badge: 'PENDING',
      value: stats.needs_verification_yellow,
      sublabel: 'Unconfirmed details',
      icon: AlertCircle,
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      activeRing: 'ring-amber-500/40 border-amber-500/50 bg-amber-950/20'
    },
    {
      id: 'red',
      label: 'Suspicious / Flagged',
      badge: 'ALERT',
      value: stats.suspicious_red,
      sublabel: 'Payment/fee red flags',
      icon: AlertOctagon,
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      activeRing: 'ring-rose-500/40 border-rose-500/50 bg-rose-950/20'
    },
    {
      id: 'rejected_log',
      label: 'Rejection Ledger',
      badge: 'FILTERED',
      value: stats.rejected_ledger,
      sublabel: 'Unpaid, stale, non-MMR',
      icon: Filter,
      color: 'text-slate-400',
      badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
      activeRing: 'ring-slate-500/40 border-slate-500/50 bg-slate-900/60'
    },
    {
      id: 'mumbai_internships',
      label: 'Mumbai Region',
      badge: 'LOCAL',
      value: stats.mumbai_internships,
      sublabel: 'Powai, BKC, Thane, etc.',
      icon: MapPin,
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      activeRing: 'ring-cyan-500/40 border-cyan-500/50 bg-cyan-950/20'
    },
    {
      id: 'tracker',
      label: 'My Tracker',
      badge: 'PERSONAL',
      value: stats.my_tracked_applications,
      sublabel: 'Active applications',
      icon: BookmarkCheck,
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      activeRing: 'ring-indigo-500/40 border-indigo-500/50 bg-indigo-950/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeSection === card.id;
        return (
          <button
            key={card.id}
            onClick={() => onSelectSection(card.id)}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isActive
                ? `${card.activeRing} ring-2 shadow-lg`
                : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${card.badgeBg}`}>
                {card.badge}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>
            
            <div className="text-2xl font-bold font-mono tracking-tight text-white mb-0.5">
              {card.value}
            </div>

            <div className="text-xs font-semibold text-slate-200 truncate">
              {card.label}
            </div>
            
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {card.sublabel}
            </p>
          </button>
        );
      })}
    </div>
  );
};
