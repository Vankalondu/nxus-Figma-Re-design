import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, Search, X, Check } from 'lucide-react';
import { ReportTemplate, gradeQuestions } from '../../data/profileReports';

// ── Which report types and grades are shown — saved per user ─────────────────────
export interface GradeVisibility { hiddenTypes: string[]; hiddenGrades: Record<string, string[]> }
const KEY = 'nxus:report-grades:v1';
const EMPTY: GradeVisibility = { hiddenTypes: [], hiddenGrades: {} };

export function useGradeVisibility() {
  const [vis, setVis] = useState<GradeVisibility>(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return { ...EMPTY, ...JSON.parse(raw) }; } catch { /* blocked */ }
    return EMPTY;
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(vis)); } catch { /* blocked */ } }, [vis]);
  return [vis, setVis] as const;
}

export const shownGrades = (tpl: ReportTemplate, vis: GradeVisibility) =>
  gradeQuestions(tpl).filter(q => !(vis.hiddenGrades[tpl.id] ?? []).includes(q.id));

const Box = ({ on }: { on: boolean }) => (
  <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${on ? 'bg-brand-primary border-brand-primary text-on-brand' : 'bg-surface-card border-default'}`}>
    {on && <Check size={11} strokeWidth={3.5} />}
  </span>
);

/**
 * Two-panel grade picker (P-CO21, "Option A"): report types on the left, the selected
 * type's grades on the right — one report's grades at a time, so no long scroll. Search
 * covers both. The single grades control: the toolbar button and each report section's
 * "5 of 5 grades" chip open this same picker.
 */
export const GradesPicker = ({ templates, value, onChange, initialType, onClose, className = '' }: {
  templates: ReportTemplate[]; value: GradeVisibility; onChange: (v: GradeVisibility) => void;
  initialType?: string; onClose: () => void; className?: string;
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialType ?? templates[0]?.id);
  const ref = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  useEffect(() => {
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('[data-grades-trigger]')) onClose(); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [onClose]);

  // A type matches when its name or any of its grades match.
  const types = useMemo(() => templates.filter(t => !q || t.name.toLowerCase().includes(q)
    || gradeQuestions(t).some(g => g.label.toLowerCase().includes(q) || g.code?.toLowerCase().includes(q))), [templates, q]);
  useEffect(() => { if (types.length && !types.some(t => t.id === selected)) setSelected(types[0].id); }, [types, selected]);

  const tpl = templates.find(t => t.id === selected);
  const typeHidden = (id: string) => value.hiddenTypes.includes(id);
  const hiddenIn = (id: string) => value.hiddenGrades[id] ?? [];
  const grades = tpl ? gradeQuestions(tpl).filter(g => !q || tpl.name.toLowerCase().includes(q)
    || g.label.toLowerCase().includes(q) || g.code?.toLowerCase().includes(q)) : [];

  const toggleType = (id: string) => onChange({ ...value, hiddenTypes: typeHidden(id) ? value.hiddenTypes.filter(x => x !== id) : [...value.hiddenTypes, id] });
  const toggleGrade = (tid: string, gid: string) => {
    const cur = hiddenIn(tid);
    onChange({ ...value, hiddenGrades: { ...value.hiddenGrades, [tid]: cur.includes(gid) ? cur.filter(x => x !== gid) : [...cur, gid] } });
  };
  const setAll = (tid: string, on: boolean) => {
    const t = templates.find(x => x.id === tid)!;
    onChange({ ...value, hiddenGrades: { ...value.hiddenGrades, [tid]: on ? [] : gradeQuestions(t).map(g => g.id) } });
  };
  const isDefault = value.hiddenTypes.length === 0 && Object.values(value.hiddenGrades).every(a => a.length === 0);

  return (
    <div ref={ref} role="dialog" aria-label="Grades to show"
      className={`bg-surface-card border border-default rounded-[20px] shadow-[var(--shadow-2xl)] flex flex-col overflow-hidden w-[min(640px,calc(100vw-32px))] ${className}`}>
      <div className="px-4 pt-4 pb-3 border-b border-default flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading font-semibold type-body text-heading">Grades to show</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => onChange(EMPTY)} disabled={isDefault} className="font-body font-bold type-caption text-link hover:underline disabled:text-muted disabled:no-underline">Show all</button>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-surface-accent text-body hover:text-strong flex items-center justify-center"><X size={15} /></button>
          </div>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reports or grades" aria-label="Search reports or grades"
            className="w-full bg-surface-card border border-default rounded-xl pl-9 pr-4 py-2 font-body font-bold type-body-sm text-strong placeholder:text-body focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-focus" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] max-h-[min(400px,60vh)] min-h-0">
        {/* Left: report types */}
        <ul className="border-b sm:border-b-0 sm:border-r border-default overflow-y-auto p-2 max-sm:max-h-[160px]" aria-label="Report types">
          {types.map(t => {
            const total = gradeQuestions(t).length;
            const on = total - hiddenIn(t.id).length;
            const active = t.id === selected;
            return (
              <li key={t.id} className={`flex items-center gap-1 rounded-xl ${active ? 'bg-brand-primary/10' : 'hover:bg-surface-accent'}`}>
                <button onClick={() => setSelected(t.id)} aria-current={active ? 'true' : undefined}
                  className={`flex-1 min-w-0 text-left px-3 py-2 ${typeHidden(t.id) ? 'opacity-50' : ''}`}>
                  <span className="flex flex-wrap items-center gap-x-1.5 min-w-0">
                    <span className="font-body font-bold type-body-sm text-strong">{t.name}</span>
                    {t.archived && <span className="shrink-0 bg-text-body/10 text-body rounded px-1.5 py-[1px] font-body font-bold type-micro">Archived</span>}
                  </span>
                  <span className="font-body font-medium type-caption text-body tabular-nums">{typeHidden(t.id) ? 'Hidden' : `${on} of ${total} grades`}</span>
                </button>
                <button onClick={() => toggleType(t.id)} aria-label={(typeHidden(t.id) ? 'Show ' : 'Hide ') + t.name} aria-pressed={!typeHidden(t.id)}
                  title={typeHidden(t.id) ? 'Hidden — show this report' : 'Hide this report'}
                  className={`w-8 h-8 mr-1 rounded-full flex items-center justify-center shrink-0 ${typeHidden(t.id) ? 'bg-brand-primary/10 text-link' : 'text-body hover:text-strong hover:bg-surface-card'}`}>
                  {typeHidden(t.id) ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </li>
            );
          })}
          {types.length === 0 && <li className="px-3 py-4 font-body font-medium type-caption text-body">No report or grade matches “{query}”.</li>}
        </ul>

        {/* Right: grades of the selected type */}
        <div className="flex flex-col min-h-0">
          {tpl && types.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-default">
                <span className="font-heading font-bold type-micro uppercase tracking-widest text-muted truncate">{tpl.name}</span>
                <span className="flex items-center gap-3 shrink-0">
                  <button onClick={() => setAll(tpl.id, true)} className="font-body font-bold type-caption text-link hover:underline">All</button>
                  <button onClick={() => setAll(tpl.id, false)} className="font-body font-bold type-caption text-link hover:underline">None</button>
                </span>
              </div>
              <ul className="overflow-y-auto p-2" aria-label={`${tpl.name} grades`}>
                {grades.map(gq => {
                  const on = !hiddenIn(tpl.id).includes(gq.id);
                  return (
                    <li key={gq.id}>
                      <button role="checkbox" aria-checked={on} onClick={() => toggleGrade(tpl.id, gq.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-accent text-left">
                        <Box on={on} />
                        <span className="flex-1 min-w-0 font-body font-bold type-body-sm text-strong truncate">{gq.label}</span>
                        <span title={gq.autoCode ? 'Short code made by NXUS' : undefined}
                          className="shrink-0 bg-brand-primary/10 text-strong rounded px-1.5 py-[1px] font-mono font-bold type-micro">{gq.code}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      <p className="px-4 py-2.5 border-t border-default font-body font-medium type-caption text-body">
        Hidden reports stay here — tap the eye to show them again. <span className="text-muted">Saved in this browser.</span>
      </p>
    </div>
  );
};
