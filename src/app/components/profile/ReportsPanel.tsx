import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Archive, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { SegmentedToggle } from '../PlayersTableKit';
import { FILTER_PILL, FILTER_PILL_ACTIVE, CARD_TEXT_BUTTON } from '../controlStyles';
import { GradeChip } from './GradeChip';
import { GradesPicker, shownGrades, useGradeVisibility } from './GradesPicker';
import { ReportSheet, SheetPlayer, SheetState } from './ReportSheet';
import { FiledReport, ReportList, TEMPLATES, gradeQuestions, seedReports, templateById } from '../../data/profileReports';

type Seg = 'All' | ReportList;
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
/** "Jul 6, 2025" → "6 Jul 2025" (falls back to the label as given). */
const dayFirst = (label: string) => {
  const m = label.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  return m ? `${m[2]} ${m[1]} ${m[3]}` : label;
};

/**
 * Reports tab on the player profile (P-CO22, D-19, D-20). Same for every account (P-L3).
 * Toolbar (filter colour): list segments with counts, Show archived, Grades (two-panel
 * picker). New reports come from the top-nav "Add Report" (`newReportRequest`).
 * One light card per report type: "Short report (2)" with its grades control and Hide
 * report on the same line; each row leads with the scout, then what was watched and when,
 * then the grades in a grid of up to five.
 */
export const ReportsPanel = ({ playerId, player, newReportRequest = 0 }: {
  playerId: string; player: SheetPlayer;
  /** Bump to open the new-report flow (the top-nav Add Report does this on the profile). */
  newReportRequest?: number;
}) => {
  const [reports, setReports] = useState<FiledReport[]>(() => seedReports(playerId));
  const [seg, setSeg] = useState<Seg>('All');
  const [showArchived, setShowArchived] = useState(false);
  const [vis, setVis] = useGradeVisibility();
  const [picker, setPicker] = useState<{ type?: string; from: 'toolbar' | string } | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);

  useEffect(() => { if (newReportRequest > 0) setSheet({ mode: 'choose' }); }, [newReportRequest]);

  const live = reports.filter(r => showArchived || !r.archived);
  const counts = useMemo(() => {
    const c: Record<Seg, number> = { All: live.length, Long: 0, Short: 0, Target: 0 };
    live.forEach(r => { c[templateById(r.templateId).list]++; });
    return c;
  }, [live]);
  const archivedCount = reports.filter(r => r.archived).length;
  const visible = live.filter(r => seg === 'All' || templateById(r.templateId).list === seg);

  // Sections in template order; hidden types drop out (they come back from the Grades picker).
  const sections = TEMPLATES
    .map(t => ({ tpl: t, rows: visible.filter(r => r.templateId === t.id) }))
    .filter(s => s.rows.length > 0 && !vis.hiddenTypes.includes(s.tpl.id));
  const hiddenWithReports = TEMPLATES.filter(t => vis.hiddenTypes.includes(t.id) && visible.some(r => r.templateId === t.id));
  // Previous / Next in the sheet walks the reports in the order they're shown.
  const order = sections.flatMap(s => s.rows);

  const openReport = (r: FiledReport) => setSheet({ mode: 'view', report: r });
  const pos = sheet && sheet.mode === 'view' ? order.findIndex(r => r.id === sheet.report.id) : -1;

  const hideType = (id: string, name: string) => {
    const before = vis;
    setVis({ ...vis, hiddenTypes: [...vis.hiddenTypes, id] });
    toast(`${name} hidden. Show it again from Grades.`, { duration: 5000, action: { label: 'Undo', onClick: () => setVis(before) } });
  };

  const save = (r: FiledReport, isNew: boolean) => {
    setReports(prev => isNew ? [r, ...prev] : prev.map(x => x.id === r.id ? r : x));
    if (isNew) {
      const list = templateById(r.templateId).list;
      if (seg !== 'All' && seg !== list) setSeg('All');
      if (vis.hiddenTypes.includes(r.templateId)) setVis({ ...vis, hiddenTypes: vis.hiddenTypes.filter(x => x !== r.templateId) });
    }
    setSheet({ mode: 'view', report: r });
    toast.success(isNew ? 'Report saved' : 'Report updated');
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Toolbar — filter colour (P-CO23) */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="overflow-x-auto hide-scrollbar max-w-full">
          <SegmentedToggle<Seg> tone="filter" value={seg} onChange={setSeg}
            options={(['All', 'Long', 'Short', 'Target'] as Seg[]).map(s => ({
              value: s, label: <>{s}<span className="ml-1 opacity-70 tabular-nums">{counts[s]}</span></>,
            }))} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowArchived(v => !v)} aria-pressed={showArchived}
            className={showArchived ? FILTER_PILL_ACTIVE : FILTER_PILL}>
            <Archive size={14} /> {showArchived ? 'Hide archived' : 'Show archived'}
            <span className={`rounded-full px-2 py-0.5 font-body font-black text-[10px] tabular-nums ${showArchived ? 'bg-surface-card/20' : 'bg-brand-primary/15'}`}>{archivedCount}</span>
          </button>
          <div className="relative">
            <button data-grades-trigger onClick={() => setPicker(p => p && p.from === 'toolbar' ? null : { from: 'toolbar' })}
              aria-expanded={!!picker && picker.from === 'toolbar'} aria-haspopup="dialog"
              className={FILTER_PILL + (picker ? ' ring-2 ring-brand-primary/30' : '')}>
              <GraduationCap size={15} /> Grades
              {vis.hiddenTypes.length > 0 && <span className="bg-brand-primary/15 rounded-full px-2 py-0.5 font-body font-black text-[10px] tabular-nums" title="Hidden reports">{vis.hiddenTypes.length} hidden</span>}
            </button>
            {picker && (
              <GradesPicker key={picker.from} templates={TEMPLATES} value={vis} onChange={setVis} initialType={picker.type}
                onClose={() => setPicker(null)} className="absolute right-0 top-full mt-2 z-50" />
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-2">
        {sections.map(({ tpl, rows }) => {
          const cols = shownGrades(tpl, vis);
          const total = gradeQuestions(tpl).length;
          return (
            <section key={tpl.id} className="bg-surface-card border border-default rounded-[20px] shadow-[var(--shadow-lg)]" aria-label={tpl.name}>
              <header className="px-5 py-3 border-b border-default flex flex-wrap items-center gap-x-4 gap-y-1">
                <h3 className="font-heading font-bold text-[16px] text-heading flex items-center gap-2 min-w-0 flex-1">
                  <span className="truncate">{tpl.name} <span className="tabular-nums">({rows.length})</span></span>
                  {tpl.archived && <span className="bg-text-body/10 text-body rounded px-1.5 py-[1px] font-body font-bold text-[10px] shrink-0">Archived</span>}
                </h3>
                <div className="flex items-center gap-4 shrink-0">
                  <button data-grades-trigger onClick={() => setPicker(p => p && p.from === tpl.id ? null : { from: tpl.id, type: tpl.id })}
                    aria-haspopup="dialog" aria-expanded={picker?.from === tpl.id} className={CARD_TEXT_BUTTON + ' tabular-nums'}>
                    {cols.length} of {total} grades <ChevronDown size={13} className={picker?.from === tpl.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  <button onClick={() => hideType(tpl.id, tpl.name)} className={CARD_TEXT_BUTTON + ' underline underline-offset-2'}>Hide report</button>
                </div>
              </header>
              <ul>
                {rows.map(r => (
                  <li key={r.id} onClick={() => openReport(r)} tabIndex={0} aria-label={`${tpl.name} by ${r.scout}`}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReport(r); } }}
                    className="cursor-pointer px-5 py-3 flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-6 hover:bg-surface-accent focus-visible:outline-none focus-visible:bg-surface-accent border-b border-default/60 last:border-0 last:rounded-b-[20px]">
                    {/* The scout is the focus; what was watched + when sits under it, smaller and lighter */}
                    <div className="lg:w-[220px] lg:shrink-0 min-w-0">
                      <div className="font-body font-bold text-[14px] text-strong flex items-center gap-2 min-w-0">
                        <span className="truncate">{r.scout}</span>
                        {r.archived && <span className="bg-text-body/10 text-body rounded px-1.5 py-[1px] font-body font-bold text-[10px] shrink-0">Archived</span>}
                      </div>
                      <div className="font-body font-medium text-[12px] text-muted mt-0.5">{r.source} · {dayFirst(r.dateLabel)}</div>
                    </div>
                    {cols.length > 0 ? (
                      <dl className="grid grid-cols-5 gap-x-3 gap-y-2 flex-1 min-w-0 max-w-[480px]">
                        {cols.map(q => (
                          <div key={q.id} className="flex flex-col items-start gap-1 min-w-0">
                            <dt className="font-mono font-bold text-[10px] uppercase text-muted truncate max-w-full">
                              <abbr title={q.label} className="no-underline cursor-help">{q.code}</abbr>
                            </dt>
                            <dd><GradeChip value={r.answers[q.id]} nxt={q.kind === 'nxt'} title={`${q.label}: ${r.answers[q.id] ?? '–'}`} /></dd>
                          </div>
                        ))}
                      </dl>
                    ) : <p className="font-body font-medium text-[12px] text-body">All grades hidden</p>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-default rounded-[20px] px-6 py-10">
            <p className="font-body font-medium text-[14px] text-body">
              {visible.length === 0 ? `No ${seg === 'All' ? '' : seg.toLowerCase() + ' list '}reports yet.` : 'Every report type with reports here is hidden.'}
            </p>
            {visible.length === 0
              ? <button onClick={() => setSheet({ mode: 'choose' })} className="font-body font-bold text-[14px] text-link hover:underline">File the first report</button>
              : <button onClick={() => setVis({ ...vis, hiddenTypes: [] })} className="font-body font-bold text-[14px] text-link hover:underline">Show all report types</button>}
          </div>
        )}
        {sections.length > 0 && hiddenWithReports.length > 0 && (
          <p className="font-body font-medium text-[12px] text-body">
            Hidden: {hiddenWithReports.map(t => t.name).join(', ')} ·{' '}
            <button data-grades-trigger onClick={() => setPicker({ from: 'toolbar', type: hiddenWithReports[0].id })} className="font-bold text-link hover:underline">Show from Grades</button>
          </p>
        )}
      </div>

      {sheet && (
        <ReportSheet state={sheet} templates={TEMPLATES} player={player}
          position={pos >= 0 ? { index: pos, total: order.length } : undefined}
          onPrev={pos > 0 ? () => openReport(order[pos - 1]) : undefined}
          onNext={pos >= 0 && pos < order.length - 1 ? () => openReport(order[pos + 1]) : undefined}
          onEdit={() => sheet.mode === 'view' && setSheet({ mode: 'edit', report: sheet.report, isNew: false })}
          onChoose={tid => setSheet({ mode: 'edit', isNew: true, report: {
            id: `${playerId}-new${Date.now()}`, templateId: tid, scout: 'You', source: 'Profile', dateLabel: today(), submitted: today(), answers: {},
          } })}
          onSave={save}
          onCancelEdit={() => sheet.mode === 'edit' && (sheet.isNew ? setSheet({ mode: 'choose' }) : setSheet({ mode: 'view', report: sheet.report }))}
          onClose={() => setSheet(null)} />
      )}
    </div>
  );
};
