import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CARD_TEXT_BUTTON } from '../controlStyles';
import { GradeChip } from './GradeChip';
import { FiledReport, ReportTemplate, TemplateQuestion } from '../../data/profileReports';

/** "Jul 6, 2025" → "6 Jul 2025" (falls back to the label as given). */
export const dayFirst = (label: string) => {
  const m = label.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  return m ? `${m[2]} ${m[1]} ${m[3]}` : label;
};
const when = (r: FiledReport) => { const t = Date.parse(r.dateLabel); return Number.isNaN(t) ? 0 : t; };

export interface ScoutGroup { scout: string; reports: FiledReport[] }

/**
 * Reports of one type grouped by scout (D-23): the scout with the most recent report comes
 * first, and each scout's reports run newest first.
 */
export function groupByScout(reports: FiledReport[]): ScoutGroup[] {
  const by = new Map<string, FiledReport[]>();
  [...reports].sort((a, b) => when(b) - when(a)).forEach(r => {
    by.set(r.scout, [...(by.get(r.scout) ?? []), r]);
  });
  return [...by.entries()].map(([scout, rs]) => ({ scout, reports: rs }));
}

/**
 * The column grid (P-CO22, D-24): four boards per row on a desktop, two on a tablet, one on a
 * phone — never sideways scrolling. A fifth report type would wrap into a new row below.
 */
export const KANBAN_GRID =
  'grid gap-3 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(max(176px,calc((100%_-_36px)/4)),1fr))]';

/**
 * One report (D-24): what was reported on and the date on ONE line under the scout name,
 * outside the card; the card holds only the grades, code above each chip.
 */
export const KanbanReportCard = ({ report, typeName, grades, onOpen }: {
  report: FiledReport; typeName: string; grades: TemplateQuestion[]; onOpen: (r: FiledReport) => void;
}) => (
  <li onClick={() => onOpen(report)} tabIndex={0} aria-label={`${typeName} by ${report.scout}, ${report.source}`}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(report); } }}
    className="group/report cursor-pointer flex flex-col gap-1 rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
    <p className="px-1 type-caption font-body font-medium text-muted flex items-center gap-1 min-w-0 whitespace-nowrap">
      <span className="truncate min-w-0" title={report.source}>{report.source}</span><span aria-hidden>·</span><span className="shrink-0">{dayFirst(report.dateLabel)}</span>
      {report.archived && <span className="shrink-0 type-micro bg-text-body/10 text-body rounded px-1 font-body font-bold">Archived</span>}
    </p>
    <div className="rounded-[12px] border border-default bg-surface-card px-2 py-2 group-hover/report:bg-surface-accent transition-colors">
    {grades.length > 0 ? (
      <dl className="grid gap-x-1 gap-y-2 grid-cols-[repeat(auto-fill,minmax(max(32px,calc((100%_-_16px)/5)),1fr))]">
        {grades.map(q => (
          <div key={q.id} className="flex flex-col items-center gap-1 min-w-0">
            <dt className="type-micro font-mono font-bold uppercase text-muted truncate max-w-full">
              <abbr title={q.label} className="no-underline cursor-help">{q.code}</abbr>
            </dt>
            <dd><GradeChip value={report.answers[q.id]} nxt={q.kind === 'nxt'} title={`${q.label}: ${report.answers[q.id] ?? '–'}`} /></dd>
          </div>
        ))}
      </dl>
    ) : <p className="type-caption font-body font-medium text-body">All grades hidden</p>}
    </div>
  </li>
);

/**
 * One report type as a column (P-CO22, D-24). Header: the type name (no count) with the quiet
 * grades control and an underlined Hide report — both text buttons, because they sit inside
 * a card. Body: reports grouped by scout, the scout's name as the group heading. A type with
 * no reports under the current list filter stays as a slim "No reports yet" column.
 */
export const KanbanColumn = ({ tpl, reports, grades, totalGrades, pickerOpen, onGrades, onHide, onOpen }: {
  tpl: ReportTemplate; reports: FiledReport[]; grades: TemplateQuestion[]; totalGrades: number;
  pickerOpen?: boolean; onGrades: () => void; onHide: () => void; onOpen: (r: FiledReport) => void;
}) => {
  const groups = groupByScout(reports);
  return (
    <section aria-label={tpl.name}
      className="bg-surface-card border border-default rounded-[20px] shadow-[var(--shadow-lg)] min-w-0 flex flex-col">
      <header className="px-3 pt-3 pb-2 border-b border-default flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="type-body-sm font-heading font-semibold text-heading flex-1 min-w-[120px] flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{tpl.name}</span>
          {tpl.archived && <span className="type-micro bg-text-body/10 text-body rounded px-1 font-body font-bold">Archived</span>}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button data-grades-trigger onClick={onGrades} aria-haspopup="dialog" aria-expanded={!!pickerOpen}
            className={CARD_TEXT_BUTTON + ' tabular-nums'}>
            {grades.length} of {totalGrades} grades <ChevronDown size={13} className={pickerOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button onClick={onHide} className={CARD_TEXT_BUTTON + ' underline underline-offset-2'}>Hide report</button>
        </div>
      </header>
      {groups.length === 0 ? (
        <p className="px-3 py-3 type-caption font-body font-medium text-muted">No reports yet</p>
      ) : (
        <div className="p-2 flex flex-col gap-3">
          {groups.map(gp => (
            <div key={gp.scout} role="group" aria-label={gp.scout} className="flex flex-col gap-1">
              <h4 className="px-1 type-body-sm font-body font-bold text-strong truncate">{gp.scout}</h4>
              <ul className="flex flex-col gap-3">
                {gp.reports.map(r => <KanbanReportCard key={r.id} report={r} typeName={tpl.name} grades={grades} onOpen={onOpen} />)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
