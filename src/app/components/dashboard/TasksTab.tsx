import { useState, useEffect } from 'react';
import { TrendingUp, Target, Plus, Check, X, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PriorityPill, WEEK_DAYS, WEEK_TASKS, TASK_STATUS, TASK_ASSIGNEES, TaskInput,
  TaskStatus, taskStatus, isOverdue, fmtDate, TASK_STATE_META,
} from './shared';

const MONTH_WEEKS: Record<string, [number, number, number]> = {
  'Wk 1': [14, 6, 4], 'Wk 2': [18, 5, 6], 'Wk 3': [21, 7, 5], 'Wk 4': [16, 8, 7],
};
const MONTH_LABELS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
const PRIO_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const PAGE_SIZE = 6;
type TaskFilter = 'all' | 'pending' | 'in-progress' | 'done' | 'overdue' | 'archived';
type TaskStatusKey = 'pending' | 'in-progress' | 'done' | 'overdue' | 'archived';
const STATUS_OPTIONS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' }, { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' }, { id: 'overdue', label: 'Overdue' }, { id: 'archived', label: 'Archived' },
];

export function TasksTab({ tasks, onToggle, onAdd, onSetStatus, showDistribution = true }: {
  tasks: any[]; onToggle: (id: any) => void; onAdd: (input: TaskInput) => void;
  onSetStatus?: (id: any, status: TaskStatus) => void; showDistribution?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<TaskFilter>('all');
  const [prio, setPrio] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [statusOpen, setStatusOpen] = useState<{ id: string; top: number; left: number } | null>(null);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ text: '', description: '', assignedTo: 'Me', deadline: '', priority: 'Medium' as 'High' | 'Medium' | 'Low' });

  // ── status filter membership ──
  const inView = (t: any): boolean => {
    const st = taskStatus(t), od = isOverdue(t);
    if (statusFilter === 'all') return true;                 // every task (archived is a future state — none yet)
    if (statusFilter === 'archived') return false;           // placeholder — future auto-archive
    if (statusFilter === 'overdue') return od;               // past deadline & not done
    if (statusFilter === 'done') return st === 'done';
    return st === statusFilter && !od;                       // pending / in-progress exclude overdue
  };
  const counts: Record<TaskStatusKey, number> = { pending: 0, 'in-progress': 0, done: 0, overdue: 0, archived: 0 };
  tasks.forEach(t => { const st = taskStatus(t), od = isOverdue(t); if (st !== 'done' && od) counts.overdue++; else if (st === 'done') counts.done++; else counts[st]++; });

  const q = search.trim().toLowerCase();
  const filtered = tasks.filter(inView)
    .filter(t => prio === 'All' || t.priority === prio)
    .filter(t => q === '' || t.text.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
    .sort((a, b) => (PRIO_RANK[a.priority] ?? 3) - (PRIO_RANK[b.priority] ?? 3));
  useEffect(() => { setPage(0); }, [statusFilter, prio, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // ── chart ──
  const buckets = chartView === 'weekly' ? WEEK_DAYS.map(d => ({ label: d, vals: WEEK_TASKS[d] })) : MONTH_LABELS.map(w => ({ label: w, vals: MONTH_WEEKS[w] }));
  const maxTotal = Math.max(...buckets.map(b => b.vals[0] + b.vals[1] + b.vals[2]), 1);
  const [COMPLETED, PENDING, ASSIGNED] = [TASK_STATUS[0].color, TASK_STATUS[1].color, TASK_STATUS[2].color];

  const setStatus = (id: any, s: TaskStatus) => { onSetStatus ? onSetStatus(id, s) : onToggle(id); setStatusOpen(null); };
  const toggleDone = (t: any) => { const done = taskStatus(t) === 'done'; onSetStatus ? onSetStatus(t.id, done ? 'pending' : 'done') : onToggle(t.id); };

  const submitAssign = () => {
    if (!form.text.trim()) return;
    onAdd({ text: form.text.trim(), description: form.description.trim(), assignedTo: form.assignedTo, dueDate: fmtDate(form.deadline) || 'This week', deadline: form.deadline || undefined, priority: form.priority });
    setForm({ text: '', description: '', assignedTo: 'Me', deadline: '', priority: 'Medium' });
    setShowAssign(false);
  };
  const seg = (active: boolean) => `font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`;

  const Pager = () => pageCount <= 1 ? null : (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={15} /></button>
      {Array.from({ length: pageCount }).slice(0, 6).map((_, i) => (
        <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-full font-body font-bold text-[12px] transition-colors ${page === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>{i + 1}</button>
      ))}
      {pageCount > 6 && <span className="px-1 text-muted-foreground">…</span>}
      <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} className="ml-1 inline-flex items-center gap-1 px-3 h-8 rounded-full border border-border font-body font-bold text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">Next <ChevronRight size={13} /></button>
    </div>
  );

  const taskCard = (
    <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={18} className="text-foreground" /></div>
        <div className="flex-1 min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Tasks</h3><p className="font-body text-[12px] text-muted-foreground font-medium">{counts.pending + counts['in-progress'] + counts.overdue} open · {counts.done} done</p></div>
        <button onClick={() => setShowAssign(true)} className="shrink-0 inline-flex items-center gap-1.5 bg-transparent border border-primary text-foreground px-4 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors"><Plus size={14} /> Assign task</button>
      </div>

      {/* search · status filter · priority filter */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
            className="w-full bg-card/60 border border-primary/40 rounded-full pl-9 pr-3 py-2 font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary hover:bg-card transition-colors" />
        </div>
        {/* status dropdown filter */}
        <div className="relative shrink-0">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as TaskFilter)}
            className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2 font-body font-bold text-[12px] text-foreground cursor-pointer outline-none focus:border-primary hover:border-primary transition-colors">
            {STATUS_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.id === 'all' ? o.label : `${o.label} (${counts[o.id as TaskStatusKey]})`}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">
          {(['All', 'High', 'Medium', 'Low'] as const).map(f => (<button key={f} onClick={() => setPrio(f)} className={seg(prio === f)}>{f}</button>))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-x-auto border-t border-border">
        {filtered.length === 0 ? (
          <div className="py-12 text-center font-body text-[14px] text-muted-foreground">{statusFilter === 'archived' ? 'Archiving is automatic — nothing here yet.' : 'No tasks in this view.'}</div>
        ) : (
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="bg-accent/40">
                {['Task', 'Priority', 'Description', 'Assignee', 'Assigned', 'Deadline', 'Status', ''].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(t => {
                const st = taskStatus(t); const od = isOverdue(t);
                const meta = od ? TASK_STATE_META.overdue : TASK_STATE_META[st];
                return (
                  <tr key={t.id} className={`border-t border-border/70 hover:bg-accent/50 transition-colors ${st === 'done' ? 'opacity-70' : ''}`}>
                    <td className="px-3 py-3 min-w-0 max-w-[220px]"><div className={`font-body font-bold text-[13px] truncate ${st === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{t.text}</div>{t.playerName && <div className="font-body text-[11px] text-muted-foreground truncate">{t.playerName}</div>}</td>
                    <td className="px-3 py-3"><PriorityPill p={t.priority} /></td>
                    <td className="px-3 py-3 max-w-[220px] hidden lg:table-cell"><span className="font-body text-[12px] text-muted-foreground line-clamp-1">{t.description || '—'}</span></td>
                    <td className="px-3 py-3 hidden md:table-cell"><span className="font-body text-[12px] text-muted-foreground whitespace-nowrap">{t.assignedTo}</span></td>
                    <td className="px-3 py-3 hidden xl:table-cell"><span className="font-body text-[12px] text-muted-foreground whitespace-nowrap tabular-nums">{fmtDate(t.assignedDate)}</span></td>
                    <td className="px-3 py-3"><span className={`font-body text-[12px] whitespace-nowrap tabular-nums ${od ? 'text-scout-red font-bold' : 'text-muted-foreground'}`}>{fmtDate(t.deadline)}</span></td>
                    <td className="px-3 py-3">
                      <button onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setStatusOpen(statusOpen?.id === t.id ? null : { id: t.id, top: r.bottom + 4, left: r.left }); }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-body font-black text-[11px] ${meta.cls}`}>{meta.label}<ChevronDown size={11} /></button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button onClick={() => toggleDone(t)} role="checkbox" aria-checked={st === 'done'} aria-label="Mark task done" title={st === 'done' ? 'Mark not done' : 'Mark done'} className={`w-5 h-5 rounded-[6px] shrink-0 transition-colors inline-flex items-center justify-center ${st === 'done' ? 'bg-scout-green border-2 border-scout-green' : 'bg-card border-2 border-border hover:border-primary'}`}>{st === 'done' && <Check size={13} strokeWidth={3} className="text-white" />}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="border-t border-border"><Pager /></div>
    </div>
  );

  const chartCard = (
    <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
        <div className="min-w-0 flex-1"><h3 className="font-heading font-bold text-[16px] text-foreground">Task distribution</h3><p className="font-body text-[12px] text-muted-foreground font-medium">{chartView === 'weekly' ? 'This week · by status' : 'This month · by status'}</p></div>
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">{(['weekly', 'monthly'] as const).map(v => (<button key={v} onClick={() => setChartView(v)} className={seg(chartView === v)}>{v === 'weekly' ? 'Weekly' : 'Monthly'}</button>))}</div>
      </div>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex-1 flex items-end justify-between gap-2 sm:gap-3 min-h-[200px]">
          {buckets.map(b => {
            const [done, pending, assigned] = b.vals; const total = done + pending + assigned; const hPct = (total / maxTotal) * 100;
            return (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-2 min-w-0 h-full justify-end">
                <span className="font-mono font-black text-[11px] text-foreground tabular-nums">{total}</span>
                <div className="w-full max-w-[42px] flex flex-col justify-end" style={{ height: '100%' }}>
                  <div className="w-full rounded-t-[6px] overflow-hidden flex flex-col" style={{ height: `${hPct}%` }}>
                    <div style={{ flexGrow: pending, backgroundColor: PENDING }} title={`Pending: ${pending}`} />
                    <div style={{ flexGrow: assigned, backgroundColor: ASSIGNED }} title={`Assigned: ${assigned}`} />
                    <div style={{ flexGrow: done, backgroundColor: COMPLETED }} title={`Completed: ${done}`} />
                  </div>
                </div>
                <span className="font-body text-[11px] font-bold text-muted-foreground truncate w-full text-center">{b.label}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-5 flex-wrap border-t border-border pt-4">{TASK_STATUS.map(s => (<span key={s.key} className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /><span className="font-body text-[12px] font-bold text-muted-foreground">{s.key}</span></span>))}</div>
      </div>
    </div>
  );

  return (
    <>
      <div className={showDistribution ? 'grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] portrait-tablet:grid-cols-1 gap-4' : ''}>
        {taskCard}
        {showDistribution && chartCard}
      </div>

      {/* Status dropdown — fixed-positioned so it isn't clipped by the table's scroll */}
      {statusOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setStatusOpen(null)} />
          <div style={{ position: 'fixed', top: statusOpen.top, left: statusOpen.left }} className="z-[100] w-40 bg-card border border-border rounded-[12px] shadow-2xl py-1">
            {(['pending', 'in-progress', 'done'] as TaskStatus[]).map(s => (
              <button key={s} onClick={() => setStatus(statusOpen.id, s)} className="w-full flex items-center gap-2 px-3 py-1.5 font-body font-bold text-[12px] text-left text-foreground hover:bg-accent">
                <span className={`w-2 h-2 rounded-full ${TASK_STATE_META[s].cls.split(' ')[0].replace('/15', '')}`} />{TASK_STATE_META[s].label}
              </button>
            ))}
          </div>
        </>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[16px] flex items-center justify-between"><span className="font-heading font-semibold text-[16px] text-white">Assign a Task</span><button onClick={() => setShowAssign(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button></div>
            <div className="p-8 space-y-4">
              <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Task name</label><input autoFocus type="text" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What needs doing?" onKeyDown={e => { if (e.key === 'Enter') submitAssign(); }} className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
              <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Description</label><input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional details" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Assignee</label><select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none cursor-pointer">{TASK_ASSIGNEES.map(a => <option key={a}>{a}</option>)}</select></div>
                <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Deadline</label><input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
              </div>
              <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Priority</label><div className="flex gap-2">{(['High', 'Medium', 'Low'] as const).map(pp => (<button key={pp} onClick={() => setForm(f => ({ ...f, priority: pp }))} className={`px-4 py-2 rounded-full font-body text-[12px] font-black border transition-all ${form.priority === pp ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'}`}>{pp}</button>))}</div></div>
              <button onClick={submitAssign} disabled={!form.text.trim()} className="w-full bg-primary border-2 border-primary text-white rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Assign Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
