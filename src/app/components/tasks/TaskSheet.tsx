import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check } from 'lucide-react';
import { meFor, initials } from '../../data/people';
import { NewTask, Priority, SeedPlayer, TASK_TYPES, TaskType, assigneesFor, canRequest, isoDay } from '../../state/taskStore';

/** "Lead and Senior scouts" from the routing table, for the assignee label. */
const rolesLabel = (type: TaskType, base: string) => {
  const names = [...new Set(assigneesFor(type, base).map(p => p.role.replace(' Scout', '')))];
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} scouts` : `${names[0]}${names[0]?.endsWith('Manager') ? '' : ' scouts'}`;
};

const REPORT_TYPES = ['Scout report', 'Short report', 'Long report', 'Target report'];
const LABEL = 'font-heading font-bold type-micro uppercase tracking-widest text-muted block mb-2';
const FIELD = 'w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body type-body-sm font-medium text-body placeholder:text-placeholder outline-none focus:border-brand-primary focus:ring-2 focus:ring-border-focus/20 transition-colors';

export interface TaskPrefill {
  type?: TaskType;
  players?: SeedPlayer[];
  reportType?: string;
}

/**
 * New task — a right-side panel like the report panel (P-CO26, D-26). Several people make one
 * task each; nobody picked means it's for you. Which types this account can create, and who
 * each can go to, come from REQUEST_ROUTING (D-27).
 */
export const TaskSheet = ({ base, players, prefill, onCreate, onClose }: {
  base: string;
  /** Players to attach; searched by name. */
  players: SeedPlayer[];
  prefill?: TaskPrefill;
  onCreate: (tasks: NewTask[]) => void;
  onClose: () => void;
}) => {
  const me = meFor(base).name;
  const allowedTypes = TASK_TYPES.filter(t => canRequest(t.id, base));
  const [type, setType] = useState<TaskType>(prefill?.type && canRequest(prefill.type, base) ? prefill.type : 'general');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState(isoDay(7));
  const [priority, setPriority] = useState<Priority>('Medium');
  const [reportType, setReportType] = useState(prefill?.reportType ?? REPORT_TYPES[0]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [peopleQ, setPeopleQ] = useState('');
  const [attached, setAttached] = useState<SeedPlayer[]>(prefill?.players ?? []);
  const [playerQ, setPlayerQ] = useState('');
  const [match, setMatch] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isReport = type === 'report-request';
  // Requests (report, weekly report) must name who does them; a video request defaults to the Video Manager.
  const needsAssignee = type === 'report-request' || type === 'weekly-report';
  const people = assigneesFor(type, base);
  // Switching type drops anyone the new type can't go to.
  useEffect(() => { setAssignees(a => a.filter(n => people.some(p => p.name === n))); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps
  const shownPeople = people.filter(p => p.name.toLowerCase().includes(peopleQ.trim().toLowerCase()));
  const matches = useMemo(() => {
    const q = playerQ.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set(attached.map(p => p.id));
    return players.filter(p => !seen.has(p.id) && p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [playerQ, players, attached]);

  const first = attached[0];
  const autoTitle = isReport && first ? `Report: ${first.name} (${reportType})`
    : type === 'video-request' && first ? `Video request: ${first.name}` : '';
  const finalTitle = title.trim() || autoTitle;
  const canSave = !!finalTitle && (!isReport || !!first) && (!needsAssignee || assignees.length > 0);
  const blocker = !finalTitle ? 'Give the task a title' : isReport && !first ? 'Pick the player to report on' : needsAssignee && assignees.length === 0 ? 'Pick who files the report' : '';

  const submit = () => {
    if (!canSave) return;
    const to = assignees.length ? assignees : type === 'video-request' && people[0] ? [people[0].name] : [me];
    onCreate(to.map(a => ({
      title: finalTitle, notes: notes.trim() || (isReport && first ? `File a ${reportType.toLowerCase()} for ${first.name}.` : undefined),
      type, priority, createdBy: me, assignee: a, due,
      playerId: first?.id, playerName: first?.name, match: match.trim() || undefined,
      reportType: isReport ? reportType : undefined,
    })));
  };

  const toggle = (name: string) => setAssignees(a => (a.includes(name) ? a.filter(x => x !== name) : [...a, name]));

  return createPortal(
    <div className="fixed inset-0 z-[250] flex justify-end" role="presentation">
      <div className="absolute inset-0 bg-ink-midnight/40" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={isReport ? 'Request report' : 'New task'}
        className="relative h-full w-full sm:w-[520px] bg-surface-card border-l border-default shadow-[var(--shadow-2xl)] flex flex-col animate-slide-in-right">
        <div className="px-6 py-4 border-b border-default flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="font-heading font-semibold type-h6 text-heading leading-tight">{isReport ? 'Request report' : 'New task'}</h2>
            <p className="font-body font-medium type-caption text-body mt-1">{isReport ? 'Goes on the scout\'s Tasks board and yours.' : 'Several people make one task each. Nobody picked means it\'s for you.'}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-surface-accent text-body hover:text-strong flex items-center justify-center shrink-0"><X size={17} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <label className={LABEL} htmlFor="task-type">Type</label>
            <select id="task-type" value={type} onChange={e => setType(e.target.value as TaskType)} className={FIELD + ' cursor-pointer'}>
              {allowedTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            {allowedTypes.length < TASK_TYPES.length && (
              <p className="font-body font-medium type-caption text-muted mt-1.5">
                {meFor(base).role}s can't request {TASK_TYPES.filter(t => !canRequest(t.id, base)).map(t => t.label.toLowerCase()).join(' or ')}s.
              </p>
            )}
          </div>

          {isReport && (
            <div>
              <span className={LABEL}>Report type</span>
              <div role="radiogroup" aria-label="Report type" className="flex flex-wrap gap-2">
                {REPORT_TYPES.map(r => (
                  <button key={r} role="radio" aria-checked={reportType === r} onClick={() => setReportType(r)}
                    className={`px-3 py-1.5 rounded-full font-body font-bold type-caption border transition-colors ${reportType === r ? 'bg-brand-primary text-on-brand border-brand-primary' : 'bg-surface-card text-body border-default hover:border-brand-primary'}`}>{r}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="task-players">Player{isReport ? '' : 's'}</label>
            {attached.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attached.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-strong rounded-full pl-1 pr-2 py-0.5 font-body font-bold type-caption">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-on-brand flex items-center justify-center type-micro">{initials(p.name)}</span>
                    {p.name}
                    <button onClick={() => setAttached(a => a.filter(x => x.id !== p.id))} aria-label={`Remove ${p.name}`} className="text-body hover:text-strong"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
            {(!isReport || attached.length === 0) && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
                <input id="task-players" value={playerQ} onChange={e => setPlayerQ(e.target.value)} placeholder="Search players to attach" className={FIELD + ' pl-9'} />
                {matches.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-surface-card border border-default rounded-[16px] shadow-2xl py-1">
                    {matches.map(p => (
                      <button key={p.id} onClick={() => { setAttached(a => (isReport ? [p] : [...a, p])); setPlayerQ(''); }}
                        className="w-full text-left px-4 py-1.5 font-body font-bold type-caption text-strong hover:bg-surface-accent">{p.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={LABEL} htmlFor="task-title">Title</label>
            <input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder={autoTitle || 'Watch Samuel Obudu, Creative Championship'} className={FIELD} />
          </div>
          <div>
            <label className={LABEL} htmlFor="task-notes">Description</label>
            <textarea id="task-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Optional notes" className={FIELD + ' resize-y'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL} htmlFor="task-due">Due date</label>
              <input id="task-due" type="date" value={due} min={isoDay(0)} onChange={e => setDue(e.target.value || isoDay(7))} className={FIELD} />
            </div>
            <div>
              <span className={LABEL}>Priority</span>
              <div role="radiogroup" aria-label="Priority" className="flex gap-1.5">
                {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                  <button key={p} role="radio" aria-checked={priority === p} onClick={() => setPriority(p)}
                    className={`flex-1 px-2 py-2 rounded-full font-body font-bold type-caption border transition-colors ${priority === p ? 'bg-brand-primary text-on-brand border-brand-primary' : 'bg-surface-card text-body border-default hover:border-brand-primary'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className={LABEL}>{needsAssignee ? `Who files it (${rolesLabel(type, base)})` : type === 'video-request' ? 'Assign to (Video Manager)' : 'Assign to'}</span>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
              <input value={peopleQ} onChange={e => setPeopleQ(e.target.value)} placeholder="Filter people" aria-label="Filter people" className={FIELD + ' pl-9'} />
            </div>
            <div role="group" aria-label="Assign to" className="border border-default rounded-[16px] max-h-[200px] overflow-y-auto py-1">
              {shownPeople.map(p => {
                const on = assignees.includes(p.name);
                return (
                  <label key={p.name} className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-surface-accent">
                    <input type="checkbox" checked={on} onChange={() => toggle(p.name)} className="sr-only peer" />
                    <span className={`w-4 h-4 rounded-[5px] border-2 flex items-center justify-center shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-border-focus ${on ? 'bg-brand-primary border-brand-primary' : 'border-default'}`}>{on && <Check size={11} strokeWidth={3} className="text-on-brand" />}</span>
                    <span className="font-body font-bold type-body-sm text-strong">{p.name === me ? `Me (${me})` : p.name}</span>
                    <span className="ml-auto font-body font-medium type-caption text-muted">{p.role}</span>
                  </label>
                );
              })}
              {shownPeople.length === 0 && <p className="px-3 py-2 font-body type-caption text-muted">No one matches.</p>}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="task-match">Match</label>
            <input id="task-match" value={match} onChange={e => setMatch(e.target.value)} placeholder="Or type a match label" className={FIELD} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-default flex items-center justify-end gap-3 shrink-0">
          {!canSave && <span className="mr-auto font-body font-medium type-caption text-muted">{blocker}</span>}
          <button onClick={onClose} className="px-5 py-2 rounded-full font-body font-bold type-body-sm text-body hover:text-strong">Cancel</button>
          <button onClick={submit} disabled={!canSave}
            className="bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-6 py-2 font-body font-bold type-body-sm shadow-[var(--shadow-md)] disabled:opacity-40 disabled:cursor-not-allowed">
            {isReport ? 'Send request' : assignees.length > 1 ? `Create ${assignees.length} tasks` : 'Create task'}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
};
