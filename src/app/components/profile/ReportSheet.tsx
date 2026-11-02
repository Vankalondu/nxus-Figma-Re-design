import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Video, Edit2, ChevronLeft, ChevronRight, FileText, ChevronRight as Go } from 'lucide-react';
import { toast } from 'sonner';
import { GradeChip } from './GradeChip';
import {
  FiledReport, GRADE_OPTIONS, NXT_OPTIONS, ReportTemplate, gradeQuestions,
} from '../../data/profileReports';

export interface SheetPlayer { name: string; initials: string; positions: string; team: string; age?: number; nationality?: string }

type SheetState =
  | { mode: 'view'; report: FiledReport }
  | { mode: 'edit'; report: FiledReport; isNew: boolean }
  | { mode: 'choose' };

/**
 * Right-side report panel (P-CO22). Replaces the centred modal so the reports table stays
 * in view. View mode is compact — question on the left, grade on the right — so a report
 * fits on one screen; Edit turns each grade into one row of buttons (A+ A B C).
 * "New report" opens it on the type chooser, then in edit mode with the player filled in.
 */
export const ReportSheet = ({ state, templates, player, position, onPrev, onNext, onEdit, onChoose, onSave, onCancelEdit, onClose }: {
  state: SheetState; templates: ReportTemplate[]; player: SheetPlayer;
  position?: { index: number; total: number };
  onPrev?: () => void; onNext?: () => void; onEdit?: () => void;
  onChoose: (templateId: string) => void;
  onSave: (report: FiledReport, isNew: boolean) => void;
  onCancelEdit: () => void; onClose: () => void;
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const report = state.mode === 'choose' ? null : state.report;
  const tpl = report ? templates.find(t => t.id === report.templateId)! : null;
  const [draft, setDraft] = useState<Record<string, string>>(report?.answers ?? {});
  useEffect(() => { setDraft(report?.answers ?? {}); }, [report?.id, state.mode]);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const editing = state.mode === 'edit';
  const grades = tpl ? gradeQuestions(tpl) : [];
  const answered = grades.filter(q => draft[q.id]).length;
  const canSave = answered === grades.length;

  const title = state.mode === 'choose' ? 'New report' : tpl!.name;
  const sub = state.mode === 'choose' ? `For ${player.name}`
    : state.mode === 'edit' && state.isNew ? `For ${player.name} · not saved yet`
    : `Submitted ${report!.submitted} · ${report!.scout}`;

  const seg = (on: boolean) => `min-w-11 h-9 px-3 rounded-full font-body font-bold text-[14px] border transition-colors ${on ? 'bg-brand-primary border-brand-primary text-on-brand shadow-sm' : 'bg-surface-card border-default text-body hover:border-brand-primary hover:text-strong'}`;

  // Portalled to <body>: an animated (transformed) ancestor would otherwise trap a fixed panel.
  return createPortal(
    <div className="fixed inset-0 z-[250] flex justify-end" role="presentation">
      <div className="absolute inset-0 bg-ink-midnight/40" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title}
        className="relative h-full w-full sm:w-[520px] bg-surface-card border-l border-default shadow-[var(--shadow-2xl)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-default flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-[20px] text-heading leading-tight truncate">{title}</h2>
            <p className="font-body font-medium text-[12px] text-body mt-1">{sub}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {state.mode === 'view' && (
              <>
                {report!.archived && <span className="bg-text-body/10 text-body rounded-full px-2 py-1 font-body font-bold text-[10px]">Archived</span>}
                <button onClick={() => toast('Opens the clip this report was filed on')} className="flex items-center gap-1.5 bg-surface-card border border-default text-body hover:border-brand-primary hover:text-strong rounded-full px-3 py-1.5 font-body font-bold text-[12px]"><Video size={14} /> Video</button>
                <button onClick={onEdit} className="flex items-center gap-1.5 bg-surface-card border border-default text-body hover:border-brand-primary hover:text-strong rounded-full px-3 py-1.5 font-body font-bold text-[12px]"><Edit2 size={13} /> Edit</button>
              </>
            )}
            <button ref={closeRef} onClick={onClose} aria-label="Close report" className="w-9 h-9 rounded-full bg-surface-accent text-body hover:text-strong flex items-center justify-center"><X size={17} /></button>
          </div>
        </div>

        {/* Player strip */}
        <div className="px-6 py-3 border-b border-default flex items-center gap-3 shrink-0 bg-surface-accent/40">
          <span className="w-10 h-10 rounded-full bg-brand-primary text-on-brand flex items-center justify-center font-heading font-bold text-[14px] shrink-0">{player.initials}</span>
          <div className="min-w-0">
            <div className="font-body font-bold text-[14px] text-strong truncate">{player.name}</div>
            <div className="font-body font-medium text-[12px] text-body">
              {[player.positions, player.team, player.age ? `Age ${player.age}` : '', player.nationality].filter(Boolean).join(' · ')}
            </div>
          </div>
          {report && <div className="ml-auto text-right shrink-0">
            <div className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted">Watched</div>
            <div className="font-body font-bold text-[12px] text-strong">{report.source} · {report.dateLabel}</div>
          </div>}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {state.mode === 'choose' && (
            <div className="flex flex-col gap-2">
              <p className="font-body font-medium text-[14px] text-body mb-2">Which report are you filing?</p>
              {templates.filter(t => !t.archived).map(t => (
                <button key={t.id} onClick={() => onChoose(t.id)}
                  className="flex items-center gap-3 text-left bg-surface-card border border-default hover:border-brand-primary rounded-[20px] px-4 py-3 transition-colors group">
                  <span className="w-10 h-10 rounded-[12px] bg-brand-primary/10 text-link flex items-center justify-center shrink-0"><FileText size={16} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-body font-bold text-[14px] text-strong">{t.name}</span>
                    <span className="block font-body font-medium text-[12px] text-body">{t.list} list · {gradeQuestions(t).length} grades, {t.questions.length - gradeQuestions(t).length} written</span>
                  </span>
                  <Go size={16} className="text-body group-hover:text-link" />
                </button>
              ))}
            </div>
          )}

          {tpl && (
            <ol className="flex flex-col divide-y divide-border-default">
              {tpl.questions.map((q, i) => (
                <li key={q.id} className="py-3">
                  {q.kind === 'text' ? (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-body font-bold text-[12px] text-muted tabular-nums w-5 shrink-0">{i + 1}</span>
                        <span className="font-body font-bold text-[14px] text-strong">{q.label}</span>
                      </div>
                      {editing ? (
                        <textarea value={draft[q.id] ?? ''} onChange={e => setDraft(d => ({ ...d, [q.id]: e.target.value }))} rows={3}
                          aria-label={q.label} placeholder="Write your notes"
                          className="mt-2 ml-7 w-[calc(100%-1.75rem)] bg-surface-card border border-default rounded-xl px-3 py-2 font-body font-medium text-[14px] text-strong placeholder:text-body focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-focus resize-none" />
                      ) : (
                        <p className="mt-1 ml-7 font-body font-medium text-[14px] text-body leading-relaxed">{report!.answers[q.id] || '—'}</p>
                      )}
                    </div>
                  ) : (
                    <div className={editing ? 'flex flex-col gap-2' : 'flex items-center justify-between gap-3'}>
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-body font-bold text-[12px] text-muted tabular-nums w-5 shrink-0">{i + 1}</span>
                        <span className="font-body font-bold text-[14px] text-strong">{q.label}</span>
                        <span className="font-mono font-bold text-[10px] text-muted">{q.code}</span>
                      </div>
                      {editing ? (
                        <div role="radiogroup" aria-label={q.label} className="flex flex-wrap gap-2 ml-7">
                          {(q.kind === 'nxt' ? NXT_OPTIONS.map(o => ({ v: o.value as string, l: `${o.value} · ${o.label}` })) : GRADE_OPTIONS.map(v => ({ v: v as string, l: v as string }))).map(o => (
                            <button key={o.v} role="radio" aria-checked={draft[q.id] === o.v} onClick={() => setDraft(d => ({ ...d, [q.id]: o.v }))} className={seg(draft[q.id] === o.v)}>{o.l}</button>
                          ))}
                        </div>
                      ) : (
                        <GradeChip value={report!.answers[q.id]} nxt={q.kind === 'nxt'} />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-default flex items-center justify-between gap-3 shrink-0">
          {editing ? (
            <>
              <span className="font-body font-medium text-[12px] text-body tabular-nums" aria-live="polite">{answered} of {grades.length} grades given</span>
              <div className="flex items-center gap-2">
                <button onClick={onCancelEdit} className="bg-surface-card text-body border border-default hover:border-brand-primary hover:text-strong rounded-full px-5 py-2 font-body font-bold text-[14px]">Cancel</button>
                <button disabled={!canSave} onClick={() => onSave({ ...report!, answers: draft }, state.mode === 'edit' && state.isNew)}
                  title={canSave ? undefined : 'Give every grade to save'}
                  className="bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-6 py-2 font-body font-bold text-[14px] shadow-[var(--shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed">Save report</button>
              </div>
            </>
          ) : state.mode === 'view' && position ? (
            <>
              <button onClick={onPrev} disabled={!onPrev} className="flex items-center gap-1 bg-surface-card border border-default text-body hover:text-strong rounded-full px-4 py-2 font-body font-bold text-[14px] disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
              <span className="font-body font-medium text-[12px] text-body tabular-nums">{position.index + 1} of {position.total}</span>
              <button onClick={onNext} disabled={!onNext} className="flex items-center gap-1 bg-surface-card border border-default text-link hover:bg-surface-accent rounded-full px-4 py-2 font-body font-bold text-[14px] disabled:opacity-40">Next <ChevronRight size={15} /></button>
            </>
          ) : (
            <button onClick={onClose} className="ml-auto bg-surface-card text-body border border-default hover:border-brand-primary hover:text-strong rounded-full px-5 py-2 font-body font-bold text-[14px]">Cancel</button>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export type { SheetState };
