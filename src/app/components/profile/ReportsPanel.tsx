import React, { useMemo, useState } from 'react';
import { Plus, SlidersHorizontal, Archive, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { SegmentedToggle } from '../PlayersTableKit';
import { GradeChip, GradeLegend } from './GradeChip';
import { GradesPicker, shownGrades, useGradeVisibility } from './GradesPicker';
import { ReportSheet, SheetPlayer, SheetState } from './ReportSheet';
import { FiledReport, ReportList, TEMPLATES, gradeQuestions, seedReports, templateById } from '../../data/profileReports';

type Seg = 'All' | ReportList;
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Reports tab on the player profile (P-CO22, D-19). Same for every account (P-L3).
 * Toolbar: list segments with counts, Show archived, Grades (two-panel picker), New report.
 * One light card per report type; rows grouped by what was watched, then by scout.
 */
export const ReportsPanel = ({ playerId, player }: { playerId: string; player: SheetPlayer }) => {
  const [reports, setReports] = useState<FiledReport[]>(() => seedReports(playerId));
  const [seg, setSeg] = useState<Seg>('All');
  const [showArchived, setShowArchived] = useState(false);
  const [vis, setVis] = useGradeVisibility();
  const [picker, setPicker] = useState<{ type?: string; from: 'toolbar' | string } | null>(null);
  const [sheet, setSheet] = useState<SheetState | null>(null);

  const live = reports.filter(r => showArchived || !r.archived);
  const counts = useMemo(() => {
    const c: Record<Seg, number> = { All: live.length, Long: 0, Short: 0, Target: 0 };
    live.forEach(r => { c[templateById(r.templateId).list]++; });
    return c;
  }, [live]);
  const archivedCount = reports.filter(r => r.archived).length;
  const visible = live.filter(r => seg === 'All' || templateById(r.templateId).list === seg);

  // Sections in template order; hidden types drop out (they can be shown again from the picker).
  const sections = TEMPLATES
    .map(t => ({ tpl: t, rows: visible.filter(r => r.templateId === t.id) }))
    .filter(s => s.rows.length > 0 && !vis.hiddenTypes.includes(s.tpl.id));
  const hiddenWithReports = TEMPLATES.filter(t => vis.hiddenTypes.includes(t.id) && visible.some(r => r.templateId === t.id));
  // The picker always drops from the toolbar (a section chip opens it on that type), so a
  // scrolling list never clips it.
  // Previous / Next in the sheet walks the reports in the order they're shown.
  const order = sections.flatMap(s => s.rows);

  const openReport = (r: FiledReport) => setSheet({ mode: 'view', report: r });
  const pos = sheet && sheet.mode === 'view' ? order.findIndex(r => r.id === sheet.report.id) : -1;

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

  const pickerEl = (cls: string) => picker && (
    <GradesPicker key={picker.from} templates={TEMPLATES} value={vis} onChange={setVis} initialType={picker.type}
      onClose={() => setPicker(null)} className={cls} />
  );

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in">
      {/* Toolbar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <SegmentedToggle<Seg> value={seg} onChange={setSeg}
          options={(['All', 'Long', 'Short', 'Target'] as Seg[]).map(s => ({
            value: s, label: <>{s}<span className="ml-1 opacity-70 tabular-nums">{counts[s]}</span></>,
          }))} />
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowArchived(v => !v)} aria-pressed={showArchived}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-body font-bold text-[14px] border transition-colors ${showArchived ? 'bg-brand-primary/10 border-brand-primary text-strong' : 'bg-surface-card border-default text-body hover:border-brand-primary hover:text-strong'}`}>
            <Archive size={15} /> {showArchived ? 'Hide archived' : 'Show archived'}
            <span className="bg-brand-primary/15 text-strong rounded-full px-2 py-0.5 font-body font-black text-[10px] tabular-nums">{archivedCount}</span>
          </button>
          <div>
            <button data-grades-trigger onClick={() => setPicker(p => p && p.from === 'toolbar' ? null : { from: 'toolbar' })}
              aria-expanded={!!picker && picker.from === 'toolbar'} aria-haspopup="dialog"
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-body font-bold text-[14px] border transition-colors ${picker?.from === 'toolbar' ? 'border-brand-primary text-strong bg-surface-card' : 'bg-surface-card border-default text-body hover:border-brand-primary hover:text-strong'}`}>
              <SlidersHorizontal size={15} /> Grades
            </button>
            {picker && pickerEl('absolute right-0 top-full mt-2 z-50')}
          </div>
          <button onClick={() => setSheet({ mode: 'choose' })}
            className="flex items-center gap-2 bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-5 py-2 font-body font-bold text-[14px] shadow-[var(--shadow-md)] transition-colors">
            <Plus size={16} strokeWidth={3} /> New report
          </button>
        </div>
      </div>

      <GradeLegend />

      {/* Sections */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-2">
        {sections.map(({ tpl, rows }) => {
          const cols = shownGrades(tpl, vis);
          const total = gradeQuestions(tpl).length;
          const groups: { key: string; source: string; date: string; items: FiledReport[] }[] = [];
          rows.forEach(r => {
            const key = r.source + '|' + r.dateLabel;
            const g = groups.find(x => x.key === key);
            if (g) g.items.push(r); else groups.push({ key, source: r.source, date: r.dateLabel, items: [r] });
          });
          return (
            <section key={tpl.id} className="bg-surface-card border border-default rounded-[20px] shadow-[var(--shadow-lg)]" aria-label={tpl.name}>
              <header className="px-5 py-3 border-b border-default flex items-center gap-3">
                <span className="w-9 h-9 rounded-[12px] bg-brand-primary/10 text-strong flex items-center justify-center shrink-0"><FileText size={16} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-bold text-[16px] text-heading flex items-center gap-2 min-w-0">
                    <span className="truncate">{tpl.name}</span>
                    {tpl.archived && <span className="bg-text-body/10 text-body rounded px-1.5 py-[1px] font-body font-bold text-[10px] shrink-0">Archived</span>}
                  </h3>
                  <p className="font-body font-medium text-[12px] text-body">{rows.length} {rows.length === 1 ? 'report' : 'reports'} · {tpl.list} list</p>
                </div>
                <div className="shrink-0">
                  <button data-grades-trigger onClick={() => setPicker(p => p && p.from === tpl.id ? null : { from: tpl.id, type: tpl.id })}
                    aria-haspopup="dialog" aria-expanded={picker?.from === tpl.id}
                    className="flex items-center gap-1.5 bg-surface-card border border-default text-body hover:border-brand-primary hover:text-strong rounded-full px-3 py-1.5 font-body font-bold text-[12px] tabular-nums">
                    <SlidersHorizontal size={13} /> {cols.length} of {total} grades
                  </button>
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-default">
                      <th scope="col" className="text-left px-5 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-muted">Scout</th>
                      {cols.map(q => (
                        <th key={q.id} scope="col" className="px-2 py-2 font-mono font-bold text-[10px] uppercase text-muted text-center whitespace-nowrap">
                          <abbr title={q.label} className="no-underline cursor-help">{q.code}</abbr>
                        </th>
                      ))}
                      {cols.length === 0 && <th className="px-2 py-2 font-body font-medium text-[12px] text-body text-left">All grades hidden</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(g => (
                      <React.Fragment key={g.key}>
                        <tr>
                          <td colSpan={cols.length + 1} className="px-5 pt-3 pb-1 font-body font-bold text-[12px] text-strong">{g.source} · <span className="text-body font-medium">{g.date}</span></td>
                        </tr>
                        {g.items.map(r => (
                          <tr key={r.id} onClick={() => openReport(r)} tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReport(r); } }}
                            className="cursor-pointer hover:bg-surface-accent focus-visible:outline-none focus-visible:bg-surface-accent border-b border-default/60 last:border-0">
                            <td className="px-5 py-2.5 font-body font-bold text-[14px] text-link whitespace-nowrap">
                              {r.scout}{r.archived && <span className="ml-2 bg-text-body/10 text-body rounded px-1.5 py-[1px] font-body font-bold text-[10px]">Archived</span>}
                            </td>
                            {cols.map(q => (
                              <td key={q.id} className="px-2 py-2.5 text-center"><GradeChip value={r.answers[q.id]} nxt={q.kind === 'nxt'} title={`${q.label}: ${r.answers[q.id] ?? '–'}`} /></td>
                            ))}
                            {cols.length === 0 && <td />}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
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
            <button onClick={() => setVis({ ...vis, hiddenTypes: [] })} className="font-bold text-link hover:underline">Show</button>
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
