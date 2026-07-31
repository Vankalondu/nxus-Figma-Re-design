import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

/**
 * Shared KPI card used across the Lead, Senior and Video Manager dashboards.
 * Format: circular icon chip + short uppercase heading, then a big number with a
 * short descriptor beside it, and an actionable link (with an up-right arrow).
 * One source of truth so the three dashboards can never visually drift.
 */
export const KpiCard = ({ icon: Icon, heading, value, descriptor, action, onClick }: {
  icon: LucideIcon;
  heading: string;
  value: React.ReactNode;
  descriptor: React.ReactNode;
  action: string;
  onClick: () => void;
}) => (
  <button onClick={onClick}
    className="flex flex-col justify-between gap-3 p-6 bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] min-h-[190px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
        <Icon size={18} className="text-primary" />
      </span>
      <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{heading}</span>
    </div>
    <div className="flex items-end justify-between gap-2">
      <div className="flex items-end gap-2 min-w-0">
        <span className="font-heading font-extrabold text-4xl tabular-nums text-foreground leading-none shrink-0">{value}</span>
        <span className="font-heading font-bold text-sm text-foreground leading-tight self-end pb-0.5 min-w-0">{descriptor}</span>
      </div>
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap self-end pb-0.5">
        {action}<ArrowUpRight size={13} className="shrink-0" />
      </span>
    </div>
  </button>
);
