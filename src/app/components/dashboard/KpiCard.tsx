import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

/**
 * Shared KPI card used on every dashboard (P-CO4).
 * Format: circular icon chip + short uppercase heading, then the big number, the
 * descriptor on its own line under it, and the action link on its own line under
 * that, left-aligned. The rows always stack — never side by side — so the card
 * looks the same whatever the text length or column width (28 Oct: Country Scout
 * cards are the reference). The descriptor is plain text on purpose: no status
 * colours, so no card reads as an alarm.
 */
export const KpiCard = ({ icon: Icon, heading, value, descriptor, action, onClick }: {
  icon: LucideIcon;
  heading: string;
  value: React.ReactNode;
  descriptor: string;
  action: string;
  onClick: () => void;
}) => (
  <button onClick={onClick}
    className="flex flex-col justify-between gap-3 p-6 bg-surface-card rounded-[32px] border border-default shadow-[var(--shadow-lg)] min-h-[190px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full min-w-0">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary/15 transition-colors">
        <Icon size={18} className="text-link" />
      </span>
      <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted min-w-0 break-words">{heading}</span>
    </div>
    <div className="flex flex-col items-start gap-1 min-w-0">
      <span className="font-heading font-extrabold text-4xl tabular-nums text-strong leading-none">{value}</span>
      <span className="font-heading font-bold text-sm text-strong leading-tight min-w-0 break-words">{descriptor}</span>
      {/* inline, not flex: when a long link wraps, the arrow follows the last word */}
      <span className="mt-1 text-xs font-semibold text-link group-hover:underline">
        {action}<ArrowUpRight size={13} className="inline ml-0.5 align-[-2px]" />
      </span>
    </div>
  </button>
);
