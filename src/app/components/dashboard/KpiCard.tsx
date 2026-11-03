import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

/**
 * Shared KPI card used on every dashboard (P-CO4).
 * Format: circular icon chip + short uppercase heading, then the big number, then
 * one bottom row: the descriptor on the left and the action link on the right, on the
 * same line (D-20, 2 Nov). When both don't fit, the row wraps and the link drops to
 * its own line, still right-aligned — they never overlap.
 * The descriptor is plain text on purpose: no status colours, so no card reads as
 * an alarm. Action copy: verb + object, sentence case, says where it goes ("Open reports").
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
      <span className="font-heading font-bold type-micro uppercase tracking-wider text-muted min-w-0 break-words">{heading}</span>
    </div>
    <div className="flex flex-col gap-1 min-w-0">
      <span className="font-heading font-extrabold text-4xl tabular-nums text-strong leading-none">{value}</span>
      {/* descriptor left · link right, same line; wraps (link drops, still right) instead of overlapping */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 min-w-0">
        <span className="font-heading font-bold type-body-sm text-strong leading-tight min-w-0 break-words">{descriptor}</span>
        {/* inline, not flex: when a long link wraps, the arrow follows the last word */}
        <span className="ml-auto text-right max-w-full type-caption font-bold text-link group-hover:underline">
          {action}<ArrowUpRight size={13} className="inline ml-0.5 align-[-2px]" />
        </span>
      </div>
    </div>
  </button>
);
