import React from 'react';
import { Crown, Smile, ChevronDown, Check } from 'lucide-react';

// ─── Shared dashboard types ─────────────────────────────────────────────────
export interface Task {
  id: string; text: string; priority: 'High' | 'Medium' | 'Low'; dueDate: string;
  assignedTo: string; allocated?: string; playerName?: string; isTargetTask?: boolean; completed: boolean;
}
export type TaskInput = string | { text: string; assignedTo?: string; dueDate?: string; priority?: 'High' | 'Medium' | 'Low' };

// ─── Task data + helpers (Tasks tab) ────────────────────────────────────────
export const TASK_ASSIGNEES = ['Me', 'David (Senior)', 'Nene', 'Mbugua', 'Tom'];
export const MOCK_TASKS: Task[] = [
  { id:'t1', text:'Review Kofi Mensah target package', priority:'High',   dueDate:'Jul 23', allocated:'Jul 21', assignedTo:'David (Senior)', playerName:'Kofi Mensah', isTargetTask:true, completed:false },
  { id:'t2', text:'File report on Amadou Sarr',        priority:'High',   dueDate:'Jul 23', allocated:'Jul 22', assignedTo:'Me', completed:false },
  { id:'t3', text:'Cross-check David Conteh stats',    priority:'Medium', dueDate:'Jul 25', allocated:'Jul 20', assignedTo:'David (Senior)', playerName:'David Conteh', isTargetTask:true, completed:false },
  { id:'t4', text:'Submit Combined Top 10 — Ghana cycle', priority:'High', dueDate:'Jul 26', allocated:'Jul 19', assignedTo:'Me', completed:false },
  { id:'t5', text:'Update PLR grades on Short List',   priority:'Low',    dueDate:'Jul 18', allocated:'Jul 12', assignedTo:'Me', completed:true },
  { id:'t6', text:'Shortlist review — Nene batch',     priority:'Medium', dueDate:'Jul 15', allocated:'Jul 10', assignedTo:'Nene', completed:true },
];

export const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const WEEK_TASKS: Record<string, [number, number, number]> = {
  Mon:[3,2,1], Tue:[2,1,2], Wed:[4,2,1], Thu:[3,3,2], Fri:[5,1,1], Sat:[1,1,0], Sun:[0,1,1],
};
export const WEEK_HOURS: Record<string, [number, number, number]> = {
  Mon:[4.5,2,1], Tue:[3,1.5,2.5], Wed:[6,2,1], Thu:[5,3,2], Fri:[7,1,1.5], Sat:[1.5,1,0], Sun:[0,1,1],
};
export const TASK_STATUS = [
  { key: 'Completed', color: '#061b2e' },
  { key: 'Pending',   color: '#E8A838' },
  { key: 'Assigned',  color: '#b8d4ef' },
];

export const PriorityPill = ({ p }: { p: 'High' | 'Medium' | 'Low' }) => (
  <span className="inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-bold bg-primary/15 text-foreground shrink-0">{p}</span>
);

// ─── Report Champion Podium (Reports tab) ───────────────────────────────────
export const CHAMP_KEYFRAMES = `
@keyframes champFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes champGlow{0%,100%{box-shadow:0 0 12px rgba(245,158,11,.35)}50%{box-shadow:0 0 25px rgba(245,158,11,.55)}}
@keyframes champShine{0%{transform:translateX(-160%) skewX(-20deg)}60%,100%{transform:translateX(260%) skewX(-20deg)}}
@keyframes champRise{0%{transform:scaleY(0)}70%{transform:scaleY(1.06)}100%{transform:scaleY(1)}}
.champ-float{animation:champFloat 2.4s ease-in-out infinite}
.champ-glow{animation:champGlow 2.2s ease-in-out infinite}
.champ-rise{transform-origin:bottom;animation:champRise .6s cubic-bezier(.34,1.56,.64,1) both}
.champ-shine{animation:champShine 4s ease-in-out infinite}
.champ-winner{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.champ-winner:hover{transform:scale(1.04)}
`;
export const ChampionPodium = ({ scouts }: { scouts: { name: string; role: string; count: number }[] }) => {
  const sorted = [...scouts].sort((a, b) => b.count - a.count);
  const first = sorted[0]; const second = sorted[1]; const third = sorted[2];
  const lead = first && second ? first.count - second.count : 0;

  const TEAL = '#3fb4c0';
  // Podium — smiley avatars, crown on 1st. 1st=primary blue · 2nd=silver · 3rd=soft teal.
  const Person = ({ scout, rank }: { scout: { name: string; role: string; count: number }; rank: 1 | 2 | 3 }) => {
    const cfg = rank === 1
      ? { ring: 'var(--primary)', badgeBg: 'var(--primary)', badgeText: 'var(--primary-foreground)', label: '1st', av: 'w-12 h-12', smile: 24 }
      : rank === 2
      ? { ring: '#cbd5e1', badgeBg: '#cbd5e1', badgeText: '#334155', label: '2nd', av: 'w-10 h-10', smile: 18 }
      : { ring: TEAL, badgeBg: TEAL, badgeText: '#ffffff', label: '3rd', av: 'w-10 h-10', smile: 18 };
    return (
      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
        <div className="relative mb-1.5">
          {rank === 1 && <Crown size={15} className="champ-float absolute -top-4 left-1/2 -translate-x-1/2 text-primary" fill="currentColor" />}
          <div className={`rounded-full bg-card flex items-center justify-center border-2 shadow-sm ${cfg.av}`} style={{ borderColor: cfg.ring }}>
            <Smile size={cfg.smile} style={{ color: 'var(--scout-green)' }} />
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full font-heading font-bold text-[8px] shadow-sm" style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}>{cfg.label}</span>
        </div>
        <div className="text-center min-w-0 w-full mt-1">
          <p className="font-body text-[11px] text-foreground truncate leading-tight">{scout.name}</p>
          <p className="font-body text-[13px] text-foreground leading-tight">{scout.count}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-h-[135px] rounded-[20px] border-2 border-primary/40 bg-transparent p-4 flex flex-col">
      <style>{CHAMP_KEYFRAMES}</style>
      <h3 className="font-heading font-bold text-[14px] text-foreground text-left shrink-0">Report Champion</h3>
      <div className="flex-1 flex items-end justify-center gap-2 pt-2 pb-2">
        {second && <Person scout={second} rank={2} />}
        {first  && <Person scout={first}  rank={1} />}
        {third  && <Person scout={third}  rank={3} />}
      </div>
    </div>
  );
};

export const REPORT_GRADE_SCORE: Record<string, number> = { 'A+': 96, 'A': 90, 'B+': 82, 'B': 74, 'C+': 66, 'C': 60 };
export const gradeToScore = (g: string) => REPORT_GRADE_SCORE[g] ?? 70;

// Inline filter dropdown for the Reports toolbar. Custom (not a native <select>) so BOTH the
// pill trigger AND the options panel match the app's UI. 'All' shows as `allLabel`; set filter
// highlights in primary; selected option gets a check.
export const InlineSel = ({ value, onChange, opts, allLabel }: { value: string; onChange: (v: string) => void; opts: string[]; allLabel: string }) => {
  const active = value !== 'All';
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc); };
  }, [open]);
  const label = (o: string) => (o === 'All' ? allLabel : o);
  return (
    <div className="relative shrink-0" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border font-body font-bold text-[12px] transition-colors whitespace-nowrap ${active ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card/60 border-primary/40 text-foreground hover:bg-card'}`}>
        {label(value)}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''} ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 left-0 min-w-[150px] bg-card border border-border rounded-[20px] shadow-2xl py-2 flex flex-col max-h-[280px] overflow-y-auto">
          {opts.map(o => {
            const sel = o === value;
            return (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
                className={`flex items-center justify-between gap-3 px-4 py-1.5 font-body font-bold text-[12px] text-left transition-colors ${sel ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent'}`}>
                {label(o)}
                {sel && <Check size={13} className="text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
