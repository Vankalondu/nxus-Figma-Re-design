import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Archive, ArchiveRestore, ArrowRight, MoveRight, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { FILTER_PILL, FILTER_PILL_ACTIVE, FILTER_INPUT, SECONDARY_BUTTON } from '../controlStyles';
import { FiltersButton, LLSelect, MobileFiltersButton, MobileFilterSheet, MobileTabMenu } from '../PlayersTableKit';
import { PriorityPill } from '../dashboard/shared';
import { ALL_GENERATED_PLAYERS } from '../SeniorLeadPlayersPage';
import { currentBase, directoryFor, initials, meFor } from '../../data/people';
import {
  BoardTask, COLUMNS, TaskColumn, TaskState, TASK_TYPES, addTasks, canMove, columnLabel, columnOf,
  dayLabel, daysFromToday, registerTaskPlayers, setTaskArchived, setTaskStatus, taskTarget, typeLabel, useTasks,
} from '../../state/taskStore';
import { TaskPrefill, TaskSheet } from './TaskSheet';

registerTaskPlayers(ALL_GENERATED_PLAYERS.map(p => ({ id: p.id, name: p.name })));
export const TASK_PLAYERS = ALL_GENERATED_PLAYERS.map(p => ({ id: p.id, name: p.name }));

const PAGE = 20;
const MOVABLE: TaskState[] = ['todo', 'in-progress', 'completed'];
const PAIRS: TaskColumn[][] = [['overdue', 'todo'], ['in-progress', 'completed']];

type Screen = 'mobile' | 'tablet' | 'desktop';
const screenNow = (): Screen => typeof window === 'undefined' ? 'desktop'
  : window.matchMedia('(max-width: 767px)').matches ? 'mobile'
  : window.matchMedia('(max-width: 1023px)').matches ? 'tablet' : 'desktop';
function useScreen(): Screen {
  const [s, setS] = useState<Screen>(screenNow);
  useEffect(() => {
    const on = () => setS(screenNow());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

/** Newest-relevant first: late work by how late, open work by due date, done work by when it was done. */
const sortFor = (col: TaskColumn) => (a: BoardTask, b: BoardTask) =>
  col === 'completed' ? (b.completedAt ?? b.due).localeCompare(a.completedAt ?? a.due) : a.due.localeCompare(b.due);

const Avatar = ({ name }: { name: string }) => (
  <span aria-hidden className="w-5 h-5 rounded-full bg-brand-primary/15 text-link font-body font-black type-micro flex items-center justify-center shrink-0">{initials(name)}</span>
);

const DueLabel = ({ t }: { t: BoardTask }) => {
  if (t.status === 'completed') return <span className="font-body font-medium type-caption text-muted tabular-nums whitespace-nowrap">Done {dayLabel(t.completedAt ?? t.due)}</span>;
  const d = daysFromToday(t.due);
  if (d < 0) return <span className="font-body font-bold type-caption text-status-error tabular-nums whitespace-nowrap">{dayLabel(t.due)} · {-d}d late</span>;
  return <span className="font-body font-medium type-caption text-body tabular-nums whitespace-nowrap">{d === 0 ? 'Due today' : `Due ${dayLabel(t.due)}`}</span>;
};

/**
 * One task (P-CO26): name + archive, who assigned it → who it's for, priority + due. Opens the
 * place where the work happens. Only the assigner or the assignee can drag it, or (on a phone)
 * use "Move to…".
 */
export const TaskCard = ({ t, me, onOpen, onMove, onArchive, onDragStart, onDragEnd }: {
  t: BoardTask; me: string;
  onOpen: (t: BoardTask) => void; onMove: (t: BoardTask, to: TaskState) => void; onArchive: (t: BoardTask) => void;
  onDragStart?: (t: BoardTask) => void; onDragEnd?: () => void;
}) => {
  const movable = canMove(t, me);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const off = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [menu]);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <li draggable={movable} tabIndex={0} aria-label={t.title} data-movable={movable || undefined}
      onDragStart={e => { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; onDragStart?.(t); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(t)}
      onKeyDown={e => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onOpen(t); } }}
      title={movable ? undefined : `Only ${t.createdBy} or ${t.assignee} can move this task`}
      className={`group/task relative rounded-[12px] border border-default bg-surface-card px-3 py-2 flex flex-col gap-1.5 hover:border-brand-primary/60 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-[border-color,box-shadow] ${movable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${t.archived ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-2 min-w-0">
        <p className="flex-1 min-w-0 font-body font-bold type-body-sm text-strong truncate" title={t.title}>{t.title}</p>
        <button onClick={e => { stop(e); onArchive(t); }} onKeyDown={stop} draggable={false}
          aria-label={t.archived ? `Restore ${t.title}` : `Archive ${t.title}`} title={t.archived ? 'Restore task' : 'Archive task'}
          className="shrink-0 -mr-1 w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-strong hover:bg-surface-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
          {t.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
        </button>
      </div>
      <div className="flex items-center gap-1.5 min-w-0 font-body font-medium type-caption text-body">
        <Avatar name={t.createdBy} /><span className="truncate min-w-0 max-w-[45%]">{t.createdBy === me ? 'You' : t.createdBy}</span>
        <ArrowRight size={12} aria-label="to" className="shrink-0 text-muted" />
        <Avatar name={t.assignee} /><span className="truncate min-w-0">{t.assignee === me ? 'You' : t.assignee}</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <PriorityPill p={t.priority} />
        <span className="font-body font-medium type-micro text-muted truncate min-w-0">{typeLabel(t.type)}</span>
        <span className="ml-auto flex items-center gap-1 shrink-0">
          <DueLabel t={t} />
          {movable && (
            <div ref={menuRef} className="relative">
              <button onClick={e => { stop(e); setMenu(m => !m); }} onKeyDown={stop} draggable={false}
                aria-label={`Move ${t.title} to…`} aria-haspopup="menu" aria-expanded={menu} title="Move to…"
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-strong hover:bg-surface-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus md:opacity-0 md:group-hover/task:opacity-100 md:group-focus-within/task:opacity-100 md:focus-visible:opacity-100">
                <MoveRight size={14} />
              </button>
              {menu && (
                <div role="menu" onClick={stop} className="absolute right-0 top-full mt-1 z-40 min-w-[150px] bg-surface-card border border-default rounded-[16px] shadow-2xl py-1">
                  <p className="px-3 pt-1 pb-1 font-heading font-bold type-micro uppercase tracking-widest text-muted">Move to</p>
                  {MOVABLE.filter(s => s !== t.status).map(s => (
                    <button key={s} role="menuitem" onClick={() => { setMenu(false); onMove(t, s); }}
                      className="w-full text-left px-3 py-1.5 font-body font-bold type-caption text-strong hover:bg-surface-accent">{columnLabel(s)}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </span>
      </div>
    </li>
  );
};

/** A board column: sticky header with the count, its own scroll, 20 more as you reach the end. */
const Column = ({ col, tasks, me, dragging, onDropTask, ...card }: {
  col: TaskColumn; tasks: BoardTask[]; me: string; dragging: BoardTask | null; onDropTask: (id: string, to: TaskState) => void;
  onOpen: (t: BoardTask) => void; onMove: (t: BoardTask, to: TaskState) => void; onArchive: (t: BoardTask) => void;
  onDragStart: (t: BoardTask) => void; onDragEnd: () => void;
}) => {
  const [limit, setLimit] = useState(PAGE);
  const [over, setOver] = useState(false);
  const accepts = !!dragging && col !== 'overdue' && canMove(dragging, me) && dragging.status !== col;
  const shown = tasks.slice(0, limit);
  return (
    <section aria-label={columnLabel(col)} data-column={col}
      onDragOver={e => { if (accepts) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); } }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false); }}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (accepts && id) onDropTask(id, col as TaskState); }}
      className={`min-w-0 flex flex-col bg-surface-card/60 border rounded-[20px] h-[calc(100dvh-280px)] min-h-[420px] overflow-hidden transition-colors ${over ? 'border-brand-primary bg-brand-primary/5' : accepts ? 'border-brand-primary/50 border-dashed' : 'border-default'}`}>
      <header className="px-4 py-3 flex items-center justify-between gap-2 border-b border-default bg-surface-card shrink-0">
        <h3 className={`font-heading font-extrabold type-body ${col === 'overdue' ? 'text-status-error' : 'text-heading'}`}>{columnLabel(col)}</h3>
        <span className={`font-body font-black type-caption tabular-nums rounded-full px-2 py-0.5 ${col === 'overdue' ? 'bg-status-error/15 text-status-error-fg' : 'bg-brand-primary/15 text-strong'}`}>{tasks.length}</span>
      </header>
      <ul className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-2"
        onScroll={e => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight > el.scrollHeight - 120 && limit < tasks.length) setLimit(l => l + PAGE); }}>
        {shown.map(t => <TaskCard key={t.id} t={t} me={me} {...card} />)}
        {tasks.length === 0 && <li className="px-2 py-6 text-center font-body font-medium type-caption text-muted">{col === 'overdue' ? 'Nothing late.' : 'No tasks here.'}</li>}
        {limit < tasks.length && <li className="py-2 text-center font-body font-medium type-caption text-muted">Scroll for more · {tasks.length - limit} left</li>}
      </ul>
    </section>
  );
};

const FIELD_LABEL = 'font-heading font-bold type-micro uppercase tracking-wider text-muted px-1';
const SMALL_INPUT = 'px-3 py-2 rounded-full bg-surface-card border border-default font-body font-bold type-caption text-body placeholder:text-placeholder outline-none focus:border-brand-primary transition-colors';

/**
 * The dashboard Tasks tab (P-CO26, D-26): one Kanban board, no list view. Same structure on
 * every dashboard; the tasks differ by account. Desktop shows all four columns; a tablet shows
 * two at a time and a phone one, picked from the status dropdown.
 */
export function TasksBoard() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = currentBase(pathname);
  const me = meFor(base).name;
  const all = useTasks(base);
  const screen = useScreen();

  const [mine, setMine] = useState<{ to: boolean; by: boolean }>({ to: false, by: false });
  const [showFilters, setShowFilters] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [prio, setPrio] = useState('All');
  const [type, setType] = useState('All');
  const [assignee, setAssignee] = useState('All');
  const [creator, setCreator] = useState('All');
  const [scope, setScope] = useState('Active only');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [player, setPlayer] = useState('');
  const [mobileCol, setMobileCol] = useState<TaskColumn>('todo');
  const [pair, setPair] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState<BoardTask | null>(null);
  const [mobileFilters, setMobileFilters] = useState(false);

  const people = directoryFor(base).map(p => p.name);
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase(), pq = player.trim().toLowerCase();
    return all.filter(t =>
      (scope === 'All' || (scope === 'Archived' ? t.archived : !t.archived)) &&
      (!(mine.to || mine.by) || (mine.to && t.assignee === me) || (mine.by && t.createdBy === me)) &&
      (!qq || t.title.toLowerCase().includes(qq) || (t.notes ?? '').toLowerCase().includes(qq)) &&
      (prio === 'All' || t.priority === prio) &&
      (type === 'All' || typeLabel(t.type) === type) &&
      (assignee === 'All' || t.assignee === assignee) &&
      (creator === 'All' || t.createdBy === creator) &&
      (!from || t.due >= from) && (!to || t.due <= to) &&
      (!pq || (t.playerName ?? '').toLowerCase().includes(pq)));
  }, [all, scope, mine, me, q, prio, type, assignee, creator, from, to, player]);

  const byCol = useMemo(() => {
    const m = Object.fromEntries(COLUMNS.map(c => [c.id, [] as BoardTask[]])) as Record<TaskColumn, BoardTask[]>;
    filtered.forEach(t => m[columnOf(t)].push(t));
    COLUMNS.forEach(c => m[c.id].sort(sortFor(c.id)));
    return m;
  }, [filtered]);

  const live = all.filter(t => !t.archived);
  const openCount = live.filter(t => t.status !== 'completed').length;
  const mineCount = live.filter(t => t.status !== 'completed' && t.assignee === me).length;
  const lateCount = live.filter(t => columnOf(t) === 'overdue').length;
  const activeFilters = [q, player, from, to].filter(Boolean).length + [prio, type, assignee, creator].filter(v => v !== 'All').length + (scope !== 'Active only' ? 1 : 0);

  const move = (t: BoardTask, toState: TaskState) => {
    if (!canMove(t, me) || t.status === toState) return;
    const prev = t.status;
    setTaskStatus(base, t.id, toState);
    const stillLate = toState !== 'completed' && daysFromToday(t.due) < 0;
    toast(`Moved to ${columnLabel(toState)}`, {
      description: stillLate ? `Still in Overdue: it was due ${dayLabel(t.due)}.` : t.title,
      action: { label: 'Undo', onClick: () => setTaskStatus(base, t.id, prev) },
    });
  };
  const archive = (t: BoardTask) => {
    const next = !t.archived;
    setTaskArchived(base, t.id, next);
    toast(next ? 'Task archived' : 'Task restored', {
      description: t.title,
      action: { label: 'Undo', onClick: () => setTaskArchived(base, t.id, !next) },
    });
  };
  const open = (t: BoardTask) => navigate(taskTarget(t, base), { state: { trail: [{ label: 'Tasks', path: `${pathname}?tab=tasks` }] } });
  const dropTask = (id: string, toState: TaskState) => { const t = all.find(x => x.id === id); if (t) move(t, toState); };

  const visible: TaskColumn[] = screen === 'desktop' ? COLUMNS.map(c => c.id) : screen === 'tablet' ? PAIRS[pair] : [mobileCol];
  const pairLabel = (p: TaskColumn[]) => p.map(c => `${columnLabel(c)} ${byCol[c].length}`).join(' · ');

  const filterFields = (
    <>
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={FIELD_LABEL}>Search</span>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Title or notes" aria-label="Search tasks" className={FILTER_INPUT + ' md:w-[200px]'} />
        </div>
      </div>
      <LLSelect label="Priority" value={prio} setValue={setPrio} options={['High', 'Medium', 'Low']} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Type" value={type} setValue={setType} options={TASK_TYPES.map(t => t.label)} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Assignee" value={assignee} setValue={setAssignee} options={people} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Creator" value={creator} setValue={setCreator} options={people} openKey={openKey} setOpenKey={setOpenKey} />
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={FIELD_LABEL}>Due from – to</span>
        <div className="flex items-center gap-1">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} aria-label="Due from" className={SMALL_INPUT} />
          <span className="text-muted type-caption">–</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} aria-label="Due to" className={SMALL_INPUT} />
        </div>
      </div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={FIELD_LABEL}>Player</span>
        <input value={player} onChange={e => setPlayer(e.target.value)} placeholder="Filter by player" aria-label="Filter by player" className={SMALL_INPUT + ' md:w-[150px]'} />
      </div>
      <LLSelect label="Show" value={scope} setValue={setScope} options={['Active only', 'Archived']} openKey={openKey} setOpenKey={setOpenKey} />
      {activeFilters > 0 && (
        <button onClick={() => { setQ(''); setPlayer(''); setFrom(''); setTo(''); setPrio('All'); setType('All'); setAssignee('All'); setCreator('All'); setScope('Active only'); }}
          className="self-end mb-2 font-body font-bold type-caption text-link hover:underline">Clear filters</button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-3" data-testid="tasks-board">
      {/* Toolbar: quick toggles · summary · Filters · New task */}
      <div className="flex flex-wrap items-center gap-2">
        <button aria-pressed={mine.to} onClick={() => setMine(m => ({ ...m, to: !m.to }))} className={mine.to ? FILTER_PILL_ACTIVE : FILTER_PILL}>Assigned to me</button>
        <button aria-pressed={mine.by} onClick={() => setMine(m => ({ ...m, by: !m.by }))} className={mine.by ? FILTER_PILL_ACTIVE : FILTER_PILL}>Assigned by me</button>
        <p className="hidden xl:block font-body font-medium type-caption text-body ml-2 tabular-nums">{openCount} open · {mineCount} assigned to you · {lateCount} overdue</p>
        <div className="flex-1" />
        <FiltersButton active={showFilters} onClick={() => setShowFilters(s => !s)} />
        <MobileFiltersButton onClick={() => setMobileFilters(true)} />
        <button onClick={() => setSheetOpen(true)} className={SECONDARY_BUTTON.replace('px-6 py-3', 'px-4 py-2')}><Plus size={15} strokeWidth={2.5} /> New task</button>
      </div>

      {showFilters && (
        <div className="hidden md:flex flex-wrap items-end gap-3 bg-surface-card/60 border border-brand-primary/40 rounded-[20px] px-4 py-3" data-testid="task-filters">
          {filterFields}
        </div>
      )}
      <MobileFilterSheet open={mobileFilters} onClose={() => setMobileFilters(false)}>
        <div className="flex flex-col gap-3">{filterFields}</div>
      </MobileFilterSheet>

      {/* Tablet: pick a pair of columns · phone: pick one */}
      {screen !== 'desktop' && (
        <MobileTabMenu className="lg:hidden self-start" open={menuOpen} onToggle={() => setMenuOpen(o => !o)}
          label={screen === 'tablet' ? pairLabel(PAIRS[pair]) : `${columnLabel(mobileCol)} (${byCol[mobileCol].length})`}>
          {screen === 'tablet'
            ? PAIRS.map((p, i) => (
              <div key={i} className="px-2">
                <button onClick={() => { setPair(i); setMenuOpen(false); }}
                  className={`w-full text-left px-2 py-2 rounded-lg font-body font-bold type-body-sm ${pair === i ? 'text-link bg-brand-primary/10' : 'text-body hover:bg-surface-accent'}`}>{pairLabel(p)}</button>
              </div>
            ))
            : COLUMNS.map(c => (
              <div key={c.id} className="px-2">
                <button onClick={() => { setMobileCol(c.id); setMenuOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg font-body font-bold type-body-sm ${mobileCol === c.id ? 'text-link bg-brand-primary/10' : 'text-body hover:bg-surface-accent'}`}>
                  {c.label}<span className="font-body type-micro font-black px-2 py-0.5 rounded-full bg-brand-primary/15 text-body tabular-nums">{byCol[c.id].length}</span>
                </button>
              </div>
            ))}
        </MobileTabMenu>
      )}

      <div className={`grid gap-3 items-start ${visible.length === 4 ? 'grid-cols-4' : visible.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {visible.map(c => (
          <Column key={c} col={c} tasks={byCol[c]} me={me} dragging={dragging} onDropTask={dropTask}
            onOpen={open} onMove={move} onArchive={archive}
            onDragStart={setDragging} onDragEnd={() => setDragging(null)} />
        ))}
      </div>

      {sheetOpen && (
        <TaskSheet base={base} players={TASK_PLAYERS} onClose={() => setSheetOpen(false)}
          onCreate={made => {
            addTasks(base, made);
            setSheetOpen(false);
            toast.success(made.length > 1 ? `${made.length} tasks created` : 'Task created', { description: made[0].title });
          }} />
      )}
    </div>
  );
}

/** Opens the New task panel already filled in — used by the profile's Request report (D-26). */
export function RequestReportSheet({ player, onClose }: { player: { id: string; name: string }; onClose: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = currentBase(pathname);
  const prefill: TaskPrefill = { type: 'report-request', players: [player] };
  return (
    <TaskSheet base={base} players={TASK_PLAYERS} prefill={prefill} onClose={onClose}
      onCreate={made => {
        addTasks(base, made);
        onClose();
        toast.success(`Report requested from ${made.map(m => m.assignee).join(', ')}`, {
          description: 'It\'s on the Tasks board.',
          action: { label: 'Open tasks', onClick: () => navigate(`${base || '/country-scout'}?tab=tasks`) },
        });
      }} />
  );
}
