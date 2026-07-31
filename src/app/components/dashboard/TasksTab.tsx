import { useState } from 'react';
import { TrendingUp, Target, Plus, CheckCircle, Calendar, RefreshCw, Clock, X } from 'lucide-react';
import { PriorityPill, WEEK_DAYS, WEEK_TASKS, TASK_STATUS, TASK_ASSIGNEES, TaskInput } from './shared';

export function TasksTab({ tasks, onToggle, onAdd }: { tasks: any[]; onToggle: (id: any) => void; onAdd: (input: TaskInput) => void }) {
  const activeTasks = tasks.filter(t => !t.completed);
  const archivedTasks = tasks.filter(t => t.completed);
  const [archiveView, setArchiveView] = useState<'active' | 'archived'>('active');
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState<{ text: string; assignedTo: string; dueDate: string; priority: 'High' | 'Medium' | 'Low' }>({ text: '', assignedTo: 'Me', dueDate: '', priority: 'Medium' });

  const dataset = WEEK_TASKS;
  const maxTotal = Math.max(...WEEK_DAYS.map(d => dataset[d][0] + dataset[d][1] + dataset[d][2]), 1);
  const shown = archiveView === 'active' ? activeTasks : archivedTasks;

  const submitAssign = () => {
    if (!form.text.trim()) return;
    onAdd({ text: form.text.trim(), assignedTo: form.assignedTo, dueDate: form.dueDate.trim() || 'This week', priority: form.priority });
    setForm({ text: '', assignedTo: 'Me', dueDate: '', priority: 'Medium' });
    setShowAssign(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 portrait-tablet:grid-cols-1 gap-4 lg:items-stretch">

        {/* LEFT — Weekly task distribution */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Task distribution</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">This week · by status</p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between p-6">
            <div className="flex-1 flex flex-col justify-center gap-3">
              {WEEK_DAYS.map(day => {
                const [done, pending, assigned] = dataset[day];
                const total = done + pending + assigned;
                const seg = (v: number) => total > 0 ? `${(v / total) * 100}%` : '0%';
                return (
                  <div key={day} className="flex items-center gap-3">
                    <span className="font-body text-[11px] font-bold text-muted-foreground w-9 shrink-0">{day}</span>
                    <div className="flex-1 h-5 bg-accent rounded-full overflow-hidden min-w-0">
                      {total > 0 && (
                        <div className="h-full flex" style={{ width: `${(total / maxTotal) * 100}%` }}>
                          <div style={{ width: seg(done), backgroundColor: '#061b2e' }} title={`Completed: ${done}`} />
                          <div style={{ width: seg(pending), backgroundColor: '#E8A838' }} title={`Pending: ${pending}`} />
                          <div style={{ width: seg(assigned), backgroundColor: '#b8d4ef' }} title={`Assigned: ${assigned}`} />
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-black text-[12px] text-foreground w-4 text-right shrink-0 tabular-nums">{total}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              {TASK_STATUS.map(s => (
                <span key={s.key} className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-body text-[12px] font-bold text-muted-foreground">{s.key}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Task manager */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={18} className="text-foreground" /></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Tasks</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">{activeTasks.length} active · {archivedTasks.length} archived</p>
            </div>
            {/* Active/Archived toggle — sits next to the Assign task button */}
            <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">
              {([['active', `Active (${activeTasks.length})`], ['archived', `Archived (${archivedTasks.length})`]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setArchiveView(id)}
                  className={`font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${archiveView===id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(true)}
              className="shrink-0 inline-flex items-center gap-1.5 bg-transparent border border-primary text-foreground px-4 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
              <Plus size={14} /> Assign task
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[440px] p-4 flex flex-col gap-3">
            {shown.length === 0 && (
              <div className="py-10 text-center font-body text-[14px] text-muted-foreground">
                {archiveView === 'active' ? 'No active tasks. Assign one to get started.' : 'No archived tasks yet.'}
              </div>
            )}
            {shown.map(task => (
              <div key={task.id}
                className={`rounded-[16px] border border-border p-3 ${task.isTargetTask ? 'border-l-[3px] border-l-primary' : ''} ${task.completed ? 'opacity-70' : ''}`}>
                {/* top: name + priority (left) · assignee (right) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {archiveView === 'active' ? (
                      <button onClick={() => onToggle(task.id)} className="w-5 h-5 rounded-full border-2 border-border hover:border-primary shrink-0 transition-colors" aria-label="Complete task" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0"><CheckCircle size={12} className="text-white" /></div>
                    )}
                    <span className={`font-body font-bold text-[14px] truncate ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.text}</span>
                    <PriorityPill p={task.priority} />
                  </div>
                  <span className="font-body text-[11px] text-foreground font-medium shrink-0">{task.assignedTo}</span>
                </div>
                {/* bottom: due (left) · allocated / restore (right) */}
                <div className="flex items-center justify-between gap-2 mt-2 pl-7">
                  <span className="inline-flex items-center gap-1 font-body text-[11px] text-muted-foreground font-medium"><Calendar size={11} /> Due {task.dueDate}</span>
                  {archiveView === 'archived' ? (
                    <button onClick={() => onToggle(task.id)} className="inline-flex items-center gap-1.5 bg-transparent border border-primary text-foreground font-body text-[12px] font-bold px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
                      <RefreshCw size={12} /> Restore
                    </button>
                  ) : (
                    task.allocated && <span className="inline-flex items-center gap-1 font-body text-[11px] text-muted-foreground font-medium"><Clock size={11} /> Allocated {task.allocated}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign task modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[16px] flex items-center justify-between">
              <span className="font-heading font-semibold text-[16px] text-white">Assign a Task</span>
              <button onClick={() => setShowAssign(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Description</label>
                <input autoFocus type="text" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What needs doing?"
                  onKeyDown={e => { if (e.key === 'Enter') submitAssign(); }}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Assignee</label>
                  <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none cursor-pointer">
                    {TASK_ASSIGNEES.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Due date</label>
                  <input type="text" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} placeholder="e.g. Jul 25"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
              </div>
              <div>
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Priority</label>
                <div className="flex gap-2">
                  {(['High','Medium','Low'] as const).map(p => (
                    <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                      className={`px-4 py-2 rounded-full font-body text-[12px] font-black border transition-all ${form.priority === p ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <button onClick={submitAssign} disabled={!form.text.trim()}
                className="w-full bg-primary border-2 border-primary text-white rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
