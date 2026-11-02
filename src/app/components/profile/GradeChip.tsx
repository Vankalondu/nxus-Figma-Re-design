import React from 'react';
import { NXT_OPTIONS } from '../../data/profileReports';

// P-CO15 grade and NXT pills — the colour is the grade, so it is the same everywhere.
const GRADE: Record<string, string> = {
  'A+': 'bg-brand-primary text-on-brand',
  A: 'bg-brand-primary/12 text-strong',
  B: 'bg-text-body/10 text-body',
  C: 'bg-surface-accent text-body',
};
const NXT: Record<string, string> = {
  T: 'bg-brand-primary text-on-brand',
  M: 'bg-status-warning/15 text-status-warning-fg',
  D: 'bg-status-error/10 text-status-error-fg',
};

export const GradeChip = ({ value, nxt = false, title }: { value?: string; nxt?: boolean; title?: string }) => {
  if (!value) return <span className="inline-block min-w-8 text-center font-body text-[12px] font-bold text-muted">–</span>;
  const cls = (nxt ? NXT[value] : GRADE[value]) || 'bg-surface-accent text-body';
  const label = nxt ? NXT_OPTIONS.find(o => o.value === value)?.label : undefined;
  return (
    <span title={title ?? label} className={`inline-flex items-center justify-center min-w-8 px-2 py-[2px] rounded font-body text-[12px] font-black tabular-nums ${cls}`}>{value}</span>
  );
};

/** One-line key for the chips, shown once per Reports tab. */
export const GradeLegend = () => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body font-medium text-[12px] text-body">
    <span className="flex items-center gap-1">Grades {['A+', 'A', 'B', 'C'].map(g => <GradeChip key={g} value={g} />)}</span>
    <span className="flex items-center gap-1">Next step {NXT_OPTIONS.map(o => (
      <span key={o.value} className="flex items-center gap-1"><GradeChip value={o.value} nxt />{o.label}</span>
    ))}</span>
  </div>
);
