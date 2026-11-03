import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { SegmentedToggle } from '../PlayersTableKit';
import { FILTER_PILL, FILTER_PILL_ACTIVE } from '../controlStyles';
import { GradesPicker, shownGrades, useGradeVisibility } from './GradesPicker';
import { ReportSheet, SheetPlayer, SheetState } from './ReportSheet';
import { KANBAN_GRID, KanbanColumn, groupByScout } from './ReportsKanban';
import { FiledReport, ReportList, TEMPLATES, gradeQuestions, seedReports, templateById } from '../../data/profileReports';

type Seg = 'All' | ReportList;
const today = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Reports tab on the player profile (P-CO22, D-19, D-20, D-23). Same for every account (P-L3).
 * Toolbar (filter colour): list segments with counts — the list the player was on when the
 * report was filed — Show archived, Grades (two-panel picker). New reports come from the
 * top-nav "Add Report" (`newReportRequest`).
 * Kanban layout: one column per report type, wrapping into rows of up to five; inside each,
 * reports grouped by scout with the code above every grade chip. Not draggable — a report's
 * type can't change.
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
  // All / Long / Short / Target filter by the list the player was on, not by report type (D-23).
  const counts = useMemo(() => {
    const c: Record<Seg, number> = { All: live.length, Long: 0, Short: 0, Target: 0 };
    live.forEach(r => { c[r.list]++; });
    return c;
  }, [live]);
  const archivedCount = reports.filter(r => r.archived).length;
  const visible = live.filter(r => seg === 'All' || r.list === seg);

  // One column per report type, in template order. A type with nothing under the current
  // list stays as an empty column; archived types only appear with Show archived; hidden
  // types drop out (they come back from the Grades picker).
  const columns = TEMPLATES
    .filter(t => !vis.hiddenTypes.includes(t.id) && (!t.archived || showArchived))
    .map(t => ({ tpl: t, rows: visible.filter(r => r.templateId === t.id) }));
  const hiddenTypes = TEMPLATES.filter(t => vis.hiddenTypes.includes(t.id) && (!t.archived || showArchived));
  // Previous / Next in the sheet walks the reports in the order they're shown.
  const order = columns.flatMap(c => groupByScout(c.rows).flatMap(gp => gp.reports));

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
      if (seg !== 'All' && seg !== r.list) setSeg('All');
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
            <span className={`rounded-full px-2 py-0.5 font-body font-black type-micro tabular-nums ${showArchived ? 'bg-surface-card/20' : 'bg-brand-primary/15'}`}>{archivedCount}</span>
          </button>
          <div className="relative">
            <button data-grades-trigger onClick={() => setPicker(p => p && p.from === 'toolbar' ? null : { from: 'toolbar' })}
              aria-expanded={!!picker && picker.from === 'toolbar'} aria-haspopup="dialog"
              className={FILTER_PILL + (picker ? ' ring-2 ring-brand-primary/30' : '')}>
              <GraduationCap size={15} /> Grades
              {vis.hiddenTypes.length > 0 && <span className="bg-brand-primary/15 rounded-full px-2 py-0.5 font-body font-black type-micro tabular-nums" title="Hidden reports">{vis.hiddenTypes.length} hidden</span>}
            </button>
            {picker && (
              <GradesPicker key={picker.from} templates={TEMPLATES} value={vis} onChange={setVis} initialType={picker.type}
                onClose={() => setPicker(null)} className="absolute right-0 top-full mt-2 z-50" />
            )}
          </div>
        </div>
      </div>

      {/* Kanban: one column per report type, wrapping into rows of up to five (D-23) */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-2">
        {columns.length > 0 && (
          <div className={KANBAN_GRID} data-testid="reports-kanban">
            {columns.map(({ tpl, rows }) => (
              <KanbanColumn key={tpl.id} tpl={tpl} reports={rows} grades={shownGrades(tpl, vis)} totalGrades={gradeQuestions(tpl).length}
                pickerOpen={picker?.from === tpl.id}
                onGrades={() => setPicker(p => p && p.from === tpl.id ? null : { from: tpl.id, type: tpl.id })}
                onHide={() => hideType(tpl.id, tpl.name)} onOpen={openReport} />
            ))}
          </div>
        )}

        {columns.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-default rounded-[20px] px-6 py-10">
            <p className="type-body-sm font-body font-medium text-body">Every report type is hidden.</p>
            <button onClick={() => setVis({ ...vis, hiddenTypes: [] })} className="type-body-sm font-body font-bold text-link hover:underline">Show all report types</button>
          </div>
        )}
        {columns.length > 0 && hiddenTypes.length > 0 && (
          <p className="type-caption font-body font-medium text-body">
            Hidden: {hiddenTypes.map(t => t.name).join(", ")} ·{" "}
            <button data-grades-trigger onClick={() => setPicker({ from: "toolbar", type: hiddenTypes[0].id })} className="font-bold text-link hover:underline">Show from Grades</button>
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
            id: `${playerId}-new${Date.now()}`, templateId: tid, list: templateById(tid).list, scout: 'You', source: 'Profile', dateLabel: today(), submitted: today(), answers: {},
          } })}
          onSave={save}
          onCancelEdit={() => sheet.mode === 'edit' && (sheet.isNew ? setSheet({ mode: 'choose' }) : setSheet({ mode: 'view', report: sheet.report }))}
          onClose={() => setSheet(null)} />
      )}
    </div>
  );
};
