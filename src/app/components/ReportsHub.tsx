import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  FileText, Search, Archive, Trash2, Edit2, Eye, Send, Download, SlidersHorizontal,
  ChevronDown, ChevronRight, Plus, X, MoreHorizontal,
  Users, Clock, ClipboardList, BarChart2, TrendingUp,
  Star, Calendar, Check, AlertTriangle, UserCircle, CheckSquare
} from 'lucide-react';
import { EditFormBlueprintModal } from './EditFormBlueprintModal';
import { Submission, MOCK_SUBMISSIONS } from '../data/reports';

// ─── Types ───────────────────────────────────────────────────────────────────────
type ReportsSubTab = 'forms' | 'submissions' | 'analytics' | 'review-grades';

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  categories: string[];
  roles: string[];
  questions: number;
  submissions: number;
  estTime: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  formType: string;
  createdVia?: 'scout' | 'imported';
  importSource?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────────
const MOCK_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl-1', title: 'PLR Macro Profiler & NXT Matrix',
    description: 'Standard operational intake form used when scouting a player for the first time to establish their baseline rating and map their platform projection.',
    tags: ['Popular', 'Core'], author: 'Vanessa Lighthouse',
    categories: ['All', 'Long'], roles: ['Senior Scout', 'Lead Scout'],
    questions: 15, submissions: 421, estTime: '8m', archived: false, createdAt: '2025-09-01', updatedAt: '2026-06-28', formType: 'Scouting Report',
  },
  {
    id: 'tpl-2', title: 'POG Live Match Report',
    description: 'Used by ground scouts in-stadium or reviewing match video footage. Evaluates immediate game-specific performances under live pressure.',
    tags: ['Match Day', 'Core'], author: 'Vanessa Lighthouse',
    categories: ['Short', 'Target'], roles: ['Senior Scout', 'Lead Scout', 'Head Scout'],
    questions: 25, submissions: 189, estTime: '15m', archived: false, createdAt: '2025-10-12', updatedAt: '2026-06-15', formType: 'Match Report',
  },
  {
    id: 'tpl-3', title: 'Athletic & Functional Movement Screening',
    description: 'Technical physical assessment form used by sports science staff to log physical output metrics, raw speed windows, and load capacities.',
    tags: ['Physical', 'New'], author: 'Dr. Kwame Asante',
    categories: ['Long'], roles: ['Senior Scout'],
    questions: 12, submissions: 67, estTime: '10m', archived: false, createdAt: '2026-01-15', updatedAt: '2026-05-02', formType: 'Player Evaluation',
  },
  {
    id: 'tpl-4', title: 'Position-Specific Technical Diagnostic',
    description: 'High-intensity deep dive triggered in advanced assessment phases, isolating specialized positional duties for each candidate.',
    tags: ['Legacy Import'], author: 'Tom Okeke',
    categories: ['Short'], roles: ['Lead Scout'],
    questions: 20, submissions: 34, estTime: '12m', archived: true, createdAt: '2024-06-01', updatedAt: '2024-11-20', formType: 'Player Evaluation', createdVia: 'imported', importSource: 'Legacy CSV archive',
  },
];

const TREND_DATA = [
  { month: 'Jan', count: 12 }, { month: 'Feb', count: 19 }, { month: 'Mar', count: 28 },
  { month: 'Apr', count: 22 }, { month: 'May', count: 35 }, { month: 'Jun', count: 41 },
];

const SCOUT_PERF = [
  { name: 'Mbugua', count: 42 }, { name: 'Tom', count: 38 },
  { name: 'Nene', count: 27 }, { name: 'Dr. Kwame', count: 19 }, { name: 'Scott', count: 14 },
];

// ─── Shared Components ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-md)] px-3 py-2">
      <p className="font-heading font-bold text-[12px] text-foreground">{label}</p>
      <p className="font-body text-[12px] text-primary font-bold">{payload[0].value} submissions</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cls = status === 'Completed' ? 'bg-[#22C55E]/10 text-[#22C55E]'
    : status === 'Submitted' ? 'bg-[#22C55E]/10 text-[#22C55E]'
    : 'bg-[#E8A838]/10 text-[#E8A838]';
  return <span className={`inline-flex px-2 py-0.5 rounded-full font-body font-black text-[10px] ${cls}`}>{status}</span>;
};

const MiniDropdown = ({ value, options, onChange, width = 'w-auto' }: { value: string; options: string[]; onChange: (v: string) => void; width?: string }) => (
  <div className={`relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer ${width}`}>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5 w-full">
      {options.map(o => <option key={o} value={o} className="bg-card text-foreground">{o}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
  </div>
);

// ─── Template Card (with interactive category checkboxes) ────────────────────────
const TemplateCard = ({ tpl, onAction }: {
  tpl: FormTemplate;
  onAction: (action: string, tpl: FormTemplate) => void;
}) => {
  const imported = tpl.createdVia === 'imported';
  const [uy, um, ud] = (tpl.updatedAt || '').split('-');
  const updated = uy ? `${parseInt(um, 10)}/${parseInt(ud, 10)}/${uy}` : '—';
  const stats: [string, string | number][] = [['Questions', tpl.questions], ['Submissions', tpl.submissions], ['Updated', updated]];
  return (
    <div className={`bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden flex flex-col transition-all hover:shadow-[var(--shadow-xl)] ${tpl.archived ? 'opacity-50' : ''}`}>
      {tpl.archived && (
        <div className="bg-muted-foreground/80 py-2 px-4 text-center">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-chalk">Archived – Not Visible to Scouts</span>
        </div>
      )}
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header: icon left + icon actions top-right */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><FileText size={18} /></div>
          <div className="flex items-center gap-2">
            <button title="View Submissions" onClick={() => onAction('view-submissions', tpl)} className="w-8 h-8 shrink-0 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
            <button title="Assign" onClick={() => onAction('assign', tpl)} className="w-8 h-8 shrink-0 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Users size={14} /></button>
            <button title={tpl.archived ? 'Restore' : 'Archive'} onClick={() => onAction(tpl.archived ? 'restore' : 'archive', tpl)} className="w-8 h-8 shrink-0 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Archive size={14} /></button>
            <button title="Delete" onClick={() => onAction('delete', tpl)} className="w-8 h-8 shrink-0 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
          </div>
        </div>
        {/* Title + source line */}
        <div>
          <h4 className="font-heading font-semibold text-[20px] text-foreground leading-snug line-clamp-2">{tpl.title}</h4>
          <p className="font-body text-[12px] text-muted-foreground flex items-center gap-2 mt-1">
            {imported ? (<><Download size={11} /> Imported from {tpl.importSource || 'legacy archive'}</>) : (<><UserCircle size={11} /> Created by {tpl.author}</>)}
          </p>
        </div>
        {/* Inset stat panel */}
        <div className="mt-auto grid grid-cols-3 bg-accent/40 rounded-[14px] divide-x divide-border/60">
          {stats.map(([label, val]) => (
            <div key={label} className="py-3 text-center">
              <div className="font-heading font-semibold text-[16px] text-foreground leading-none">{val}</div>
              <div className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer: full-width Edit Form */}
      <div className="border-t border-border px-4 py-3">
        <button onClick={() => onAction('edit', tpl)} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-4 py-2 font-body font-bold text-[14px] transition-colors shadow-[var(--shadow-sm)]">
          <Edit2 size={14} /> Edit Form
        </button>
      </div>
    </div>
  );
};

// ─── Fill Form Modal ─────────────────────────────────────────────────────────────
const ACCORDION_SECTIONS: Record<string, { title: string; fields: { label: string; type: 'rating' | 'dropdown' | 'text' | 'input' | 'toggle3'; options?: string[]; cols?: number }[] }[]> = {
  'tpl-1': [
    { title: '01. Match Day Context', fields: [
      { label: 'Competition', type: 'dropdown', options: ['NPFL','Liga Revelação','CAF U20','Ligue 1'], cols: 2 },
      { label: 'Opponent', type: 'input', cols: 2 },
      { label: 'Playing Surface', type: 'dropdown', options: ['Natural Grass','Artificial','Hybrid'], cols: 2 },
      { label: 'Weather', type: 'dropdown', options: ['Clear','Rain','Hot','Windy'], cols: 2 },
    ]},
    { title: '02. Core Technical Matrix (PLR Grading)', fields: [
      { label: 'First Touch', type: 'rating' }, { label: 'Passing Range', type: 'rating' },
      { label: 'Ball Retention', type: 'rating' }, { label: 'Weak-Foot Utility', type: 'rating' },
    ]},
    { title: '03. Tactical Framework', fields: [
      { label: 'Defensive Work-Rate', type: 'dropdown', options: ['Excellent','Good','Average','Poor'] },
      { label: 'Attacking Transition', type: 'dropdown', options: ['Excellent','Good','Average','Poor'] },
      { label: 'Positional Discipline', type: 'dropdown', options: ['Excellent','Good','Average','Poor'] },
    ]},
    { title: '04. NXT Value Allocation', fields: [
      { label: 'Player Projection', type: 'toggle3', options: ['Target', 'Monitor', 'Discard'] },
    ]},
  ],
  'tpl-2': [
    { title: '01. In-Game Performance Variables', fields: [
      { label: 'Minutes Played', type: 'input', cols: 3 }, { label: 'Position Played', type: 'dropdown', options: ['ST','LW','RW','CAM','CM','CDM','CB','LB','RB','GK'], cols: 3 },
      { label: 'Goals', type: 'input', cols: 3 }, { label: 'Assists', type: 'input', cols: 3 },
      { label: 'Key Passes', type: 'input', cols: 3 }, { label: 'Duels Won', type: 'input', cols: 3 },
    ]},
    { title: '02. Positional Execution (POG Grading)', fields: [
      { label: 'Zone Coverage', type: 'rating' }, { label: 'Aerial Duel Success', type: 'rating' }, { label: 'Final-Third Accuracy', type: 'rating' },
    ]},
    { title: '03. Psychological & Behavioral', fields: [
      { label: 'Leadership Traits', type: 'rating' }, { label: 'Pressing Aggression', type: 'rating' }, { label: 'Composure Under Pressure', type: 'rating' },
    ]},
    { title: '04. Executive Summary', fields: [
      { label: 'Qualitative Notes', type: 'text' }, { label: 'Instructions for Follow-Up', type: 'text' },
    ]},
  ],
  'tpl-3': [
    { title: '01. Biometric Baseline', fields: [
      { label: 'Height (cm)', type: 'input', cols: 3 }, { label: 'Weight (kg)', type: 'input', cols: 3 }, { label: 'Body Fat %', type: 'input', cols: 3 },
    ]},
    { title: '02. Kinetic Explosiveness', fields: [
      { label: '10m Sprint (s)', type: 'input', cols: 3 }, { label: '40m Sprint Max (km/h)', type: 'input', cols: 3 }, { label: 'Vertical Leap (cm)', type: 'input', cols: 3 },
    ]},
    { title: '03. Durability & Medical', fields: [
      { label: 'Joint Hypermobility', type: 'dropdown', options: ['None','Mild','Moderate','Severe'] },
      { label: 'Hamstring Load History', type: 'dropdown', options: ['Clear','Minor Strain','Recurring','Post-Surgery'] },
      { label: 'Muscle Fatigue Alert', type: 'dropdown', options: ['Low','Moderate','High','Critical'] },
    ]},
  ],
};

const RatingToggle = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
      <button key={n} onClick={() => onChange(n)}
        className={`w-8 h-8 rounded-lg font-heading font-bold text-[12px] border transition-all ${
          value === n ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-accent text-foreground border-border hover:border-primary'
        }`}>{n}</button>
    ))}
  </div>
);

const NxtToggle = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex gap-1">
    {['Target', 'Monitor', 'Discard'].map(opt => {
      const cls = value === opt
        ? opt === 'Target' ? 'bg-primary text-primary-foreground border-primary' : opt === 'Monitor' ? 'bg-[#E8A838]/15 text-[#E8A838] border-[#E8A838]' : 'bg-[#E05C4B]/10 text-[#E05C4B] border-[#E05C4B]'
        : 'bg-accent text-muted-foreground border-border';
      return <button key={opt} onClick={() => onChange(opt)} className={`px-4 py-2 rounded-full font-body font-bold text-[12px] border transition-all ${cls}`}>{opt}</button>;
    })}
  </div>
);

const FillFormModal = ({ template, onClose }: { template: FormTemplate; onClose: () => void }) => {
  const sections = ACCORDION_SECTIONS[template.id] || ACCORDION_SECTIONS['tpl-1'];
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [textVals, setTextVals] = useState<Record<string, string>>({});
  const [nxtVal, setNxtVal] = useState('');
  const toggleSection = (i: number) => { const s = new Set(openSections); s.has(i) ? s.delete(i) : s.add(i); setOpenSections(s); };

  return (
    <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-card rounded-[24px] shadow-[var(--shadow-2xl)] w-full max-w-4xl max-h-[90vh] border border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 bg-primary rounded-t-[24px] flex items-center justify-between shrink-0">
          <div>
            <span className="font-heading font-semibold text-[16px] text-chalk block">{template.title}</span>
            <span className="font-body text-[12px] text-chalk/60">{template.questions} questions · {template.estTime} est.</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-chalk/60 hover:text-chalk"><X size={16} /></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {sections.map((sec, si) => (
              <div key={si} className="border border-border rounded-xl overflow-hidden">
                <button onClick={() => toggleSection(si)} className="flex items-center justify-between w-full px-4 py-3 bg-accent hover:bg-accent/80 transition-colors">
                  <span className="font-heading font-bold text-[14px] text-foreground">{sec.title}</span>
                  {openSections.has(si) ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                </button>
                {openSections.has(si) && (
                  <div className="p-4 space-y-4">
                    <div className={`grid gap-4 ${sec.fields.some(f => f.cols === 3) ? 'grid-cols-3' : sec.fields.some(f => f.cols === 2) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {sec.fields.map(f => (
                        <div key={f.label} className={f.type === 'text' || f.type === 'rating' || f.type === 'toggle3' ? 'col-span-full' : ''}>
                          <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">{f.label}</label>
                          {f.type === 'rating' && <RatingToggle value={ratings[f.label] || 0} onChange={v => setRatings(p => ({ ...p, [f.label]: v }))} />}
                          {f.type === 'toggle3' && <NxtToggle value={nxtVal} onChange={setNxtVal} />}
                          {f.type === 'dropdown' && (
                            <div className="relative">
                              <select className="w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all appearance-none cursor-pointer">
                                <option value="">Select…</option>
                                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                          )}
                          {f.type === 'input' && <input className="w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-all" value={textVals[f.label] || ''} onChange={e => setTextVals(p => ({ ...p, [f.label]: e.target.value }))} />}
                          {f.type === 'text' && <textarea rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground transition-all resize-none" value={textVals[f.label] || ''} onChange={e => setTextVals(p => ({ ...p, [f.label]: e.target.value }))} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="w-[240px] border-l border-border p-5 flex flex-col gap-4 bg-accent/30 shrink-0">
            <h4 className="font-heading font-semibold text-[14px] text-foreground">Scout Information</h4>
            <div className="flex flex-col gap-3">
              {[{ label: 'Scout', value: 'Mbugua' }, { label: 'Role', value: 'Senior Scout' }, { label: 'Region', value: 'West Africa' }, { label: 'Scope', value: 'U19 Cycle 2026' }, { label: 'Player', value: '—' }, { label: 'Date', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }].map(f => (
                <div key={f.label}><span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block">{f.label}</span><span className="font-body font-bold text-[14px] text-foreground">{f.value}</span></div>
              ))}
            </div>
            <div className="flex-1" />
            <button className="w-full bg-primary text-primary-foreground rounded-full py-2 font-body font-semibold text-[14px] hover:bg-primary/80 transition-colors shadow-md flex items-center justify-center gap-2"><Send size={12} /> Submit Report</button>
            <button className="w-full bg-card border border-border text-muted-foreground rounded-full py-2 font-body font-bold text-[12px] hover:border-primary hover:text-foreground transition-all">Save as Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination control ─────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  const nums: (number | string)[] = [];
  const push = (n: number | string) => nums.push(n);
  push(1);
  if (page > 3) push('…l');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) push(p);
  if (page < totalPages - 2) push('…r');
  if (totalPages > 1) push(totalPages);
  const pill = 'min-w-9 h-9 px-3 rounded-full font-body font-bold text-[14px] flex items-center justify-center transition-colors';
  return (
    <div className="flex items-center justify-center gap-2 pt-4 shrink-0">
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className={pill + ' bg-card border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed'}>Prev</button>
      {nums.map((n, i) => typeof n === 'string'
        ? <span key={n + i} className="px-1 text-muted-foreground">…</span>
        : <button key={n} onClick={() => onPage(n)} className={pill + (n === page ? ' bg-primary text-white' : ' bg-card border border-border text-foreground hover:border-primary')}>{n}</button>
      )}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={pill + ' bg-card border border-border text-primary hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed'}>Next</button>
    </div>
  );
};

// ─── Submissions Tab ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const SubmissionsTab = ({ statusFilter, dateFilter, extraSubmissions = [] }: { statusFilter: string; dateFilter: string; extraSubmissions?: Submission[] }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(0);
  const [page, setPage] = useState(1);
  useLayoutEffect(() => {
    const measure = () => { if (wrapRef.current) setAvail(Math.max(360, window.innerHeight - wrapRef.current.getBoundingClientRect().top - 24)); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // Reports filed from the Player Video Workspace first, then the expanded
  // mock set so pagination is demonstrable.
  const allSubs = useMemo(() => [
    ...extraSubmissions,
    ...Array.from({ length: 8 }).flatMap((_, b) => MOCK_SUBMISSIONS.map(s => ({ ...s, id: `${s.id}-${b}` }))),
  ], [extraSubmissions]);
  const filtered = useMemo(() => {
    let list = allSubs;
    if (statusFilter !== 'All') list = list.filter(s => s.status === statusFilter);
    if (dateFilter) list = list.filter(s => s.timestamp.startsWith(dateFilter));
    return list;
  }, [allSubs, statusFilter, dateFilter]);
  useEffect(() => { setPage(1); }, [statusFilter, dateFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div ref={wrapRef} style={{ height: avail || undefined }} className="flex flex-col min-h-[360px]">
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr className="bg-primary">
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-left">Form & Type</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-left">Scout</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-left">Player</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-center">Status</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-left">Timestamp</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-center w-[120px]">Progress</th>
                <th className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-primary-foreground/60 text-center w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((s, i) => (
                <tr key={s.id} className={`border-b border-border/40 hover:bg-accent transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-accent/30'}`}>
                  <td className="px-4 py-3"><span className="font-body font-bold text-[14px] text-foreground block">{s.formName}</span><span className="font-body text-[10px] text-muted-foreground">{s.formType}</span></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-primary text-chalk flex items-center justify-center font-body font-black text-[10px] shrink-0">{s.scoutInitials}</div><span className="font-body font-bold text-[12px] text-foreground">{s.scoutName}</span></div></td>
                  <td className="px-4 py-3 font-body font-bold text-[12px] text-foreground">{s.playerName}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 font-mono font-bold text-[12px] text-muted-foreground">{s.timestamp}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.progress === 100 ? 'bg-[#22C55E]' : s.progress > 60 ? 'bg-[#22C55E]/70' : 'bg-[#E8A838]'}`} style={{ width: `${s.progress}%` }} /></div><span className="font-mono font-bold text-[10px] text-muted-foreground w-8 text-right">{s.progress}%</span></div></td>
                  <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><button className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"><Eye size={10} /></button><button className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:bg-[#E05C4B] hover:text-chalk transition-colors"><Trash2 size={10} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
};

// ─── Analytics Tab ───────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (!wrapRef.current) return;
      const top = wrapRef.current.getBoundingClientRect().top;
      setAvail(Math.max(460, window.innerHeight - top - 24));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const statusDist = [
    { name: 'Completed', value: 312, color: '#1E88E5' },
    { name: 'Submitted', value: 156, color: '#69B0EE' },
    { name: 'Draft', value: 89, color: '#B4D7F6' },
  ];

  const kpis = [
    { label: 'Total Reports', value: '557', icon: FileText, trend: '+12%' },
    { label: 'Active Templates', value: '3', icon: ClipboardList },
    { label: 'Avg. Completion', value: '82%', icon: TrendingUp, trend: '+4%' },
    { label: 'Active Scouts', value: '5', icon: Users },
    { label: 'Peak Submission Hour', value: '14:00 – 16:00', icon: Clock },
    { label: 'Most Active Day', value: 'Tuesday', icon: Calendar },
    { label: 'Monthly Avg. Load', value: '26', icon: BarChart2 },
    { label: 'Avg. Time to Complete', value: '11 min', icon: Clock },
  ];

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl shadow-[var(--shadow-md)] px-3 py-2">
        <p className="font-heading font-bold text-[12px] text-foreground">{payload[0].name}</p>
        <p className="font-body text-[12px] text-primary font-bold">{payload[0].value} reports</p>
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={{ height: isDesktop ? avail || undefined : undefined }} className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 w-full items-stretch lg:min-h-[460px]">
      {/* ── Left: KPI grid (4 x 2, airy) ── */}
      <div className="bg-card rounded-[28px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col min-h-0">
        <h4 className="font-heading font-semibold text-[14px] text-foreground shrink-0">Overview</h4>
        <p className="font-body font-medium text-[12px] text-muted-foreground mb-2 shrink-0">Key report metrics</p>
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-0 md:flex-1 md:min-h-0 md:overflow-y-auto md:no-scrollbar">
          {kpis.map(kpi => (
            <div key={kpi.label} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
              <div className="w-8 h-8 rounded-[10px] bg-accent flex items-center justify-center shrink-0"><kpi.icon size={15} className="text-muted-foreground" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-semibold text-[16px] text-foreground leading-none">{kpi.value}</span>
                  {kpi.trend && <span className="font-body font-bold text-[12px] text-[#22C55E]">{kpi.trend}</span>}
                </div>
                <div className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: charts ── */}
      <div className="flex flex-col gap-4 min-h-0">
        {/* Hero: donut + legend */}
        <div className="bg-card rounded-[28px] border border-border shadow-[var(--shadow-lg)] p-6 flex flex-col flex-1 min-h-0">
          <div className="shrink-0">
            <h4 className="font-heading font-semibold text-[16px] text-foreground">Report Status Distribution</h4>
            <p className="font-body font-medium text-[12px] text-muted-foreground mt-0.5">Breakdown of all submitted reports</p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col items-center sm:flex-row sm:items-center gap-6 mt-2">
            <div className="w-40 h-40 shrink-0 min-h-0 min-w-0 sm:w-[42%] lg:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius="62%" outerRadius="82%" paddingAngle={2} dataKey="value" stroke="none">
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-auto flex-1 flex flex-col justify-center gap-4 min-w-0">
              {statusDist.map(s => {
                const total = statusDist.reduce((a, b) => a + b.value, 0);
                const pct = Math.round((s.value / total) * 100);
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-2 font-body font-bold text-[14px] text-foreground"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />{s.name}</span>
                      <span className="font-mono font-bold text-[12px] text-muted-foreground">{s.value} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: pct + '%', background: s.color }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline + Scout performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="bg-card rounded-[28px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col min-h-0">
            <h4 className="font-heading font-semibold text-[14px] text-foreground shrink-0">Submissions Over Time</h4>
            <p className="font-body font-medium text-[12px] text-muted-foreground mb-2 shrink-0">Monthly submission volume</p>
            <div className="h-[200px] sm:h-[280px] lg:h-auto lg:flex-1 lg:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1565c0" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#1565c0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={30} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#1565c0" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#1565c0' }} animationDuration={200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card rounded-[28px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col min-h-0">
            <h4 className="font-heading font-semibold text-[14px] text-foreground shrink-0">Scout Performance</h4>
            <p className="font-body font-medium text-[12px] text-muted-foreground mb-2 shrink-0">Reports filed per scout</p>
            <div className="h-[200px] sm:h-[280px] lg:h-auto lg:flex-1 lg:min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCOUT_PERF} layout="vertical" margin={{ left: -20 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={24} animationDuration={200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Review Grades Tab ───────────────────────────────────────────────────────────
const ALL_SCOUTS_DIRECTORY = [
  { id: 's1', name: 'Mbugua', role: 'Senior Scout' },
  { id: 's2', name: 'Tom Okeke', role: 'Head Scout' },
  { id: 's3', name: 'Nene Balde', role: 'Lead Scout' },
  { id: 's4', name: 'Dr. Kwame Asante', role: 'Country Scout' },
  { id: 's5', name: 'Scott', role: 'Video Scout' },
  { id: 's6', name: 'Vanessa Lighthouse', role: 'Head Scout' }
];

const ReviewGradesTab = ({ search, tierFilter }: { search: string; tierFilter: string }) => {
  const [assignments, setAssignments] = useState<Record<string, { id: string; name: string; role: string }[]>>({
    'Long List': [ ALL_SCOUTS_DIRECTORY[0], ALL_SCOUTS_DIRECTORY[1] ],
    'Short List': [ ALL_SCOUTS_DIRECTORY[2] ],
    'Target List': [ ALL_SCOUTS_DIRECTORY[3], ALL_SCOUTS_DIRECTORY[5] ],
  });

  const handleAdd = (tier: string, scoutId: string) => {
    if (!scoutId) return;
    const scout = ALL_SCOUTS_DIRECTORY.find(s => s.id === scoutId);
    if (scout && !assignments[tier].some(s => s.id === scoutId)) {
      setAssignments(prev => ({ ...prev, [tier]: [...prev[tier], scout] }));
    }
  };

  const handleRemove = (tier: string, scoutId: string) => {
    if (window.confirm("Are you sure you want to remove this scout from this review list?")) {
      setAssignments(prev => ({ ...prev, [tier]: prev[tier].filter(s => s.id !== scoutId) }));
    }
  };

  const handleRemoveAll = (tier: string) => {
    if (window.confirm("Are you sure you want to remove all scouts from this review list?")) {
      setAssignments(prev => ({ ...prev, [tier]: [] }));
    }
  };

  const cols = ['Long List', 'Short List', 'Target List'].filter(t => tierFilter === 'All Tiers' || t === tierFilter);

  return (
    <div className={`grid grid-cols-1 ${cols.length === 3 ? 'lg:grid-cols-3' : cols.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-4 w-full auto-rows-min items-start`}>
      {cols.map(tier => (
        <div key={tier} className="bg-card rounded-[24px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-4">
          {/* Header Line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-semibold text-[20px] text-foreground">{tier}</h3>
              <span className="bg-primary/10 text-primary font-heading font-bold text-[12px] px-2 py-0.5 rounded-full">{assignments[tier].length}</span>
            </div>
            <button onClick={() => handleRemoveAll(tier)} className="font-body font-bold text-[12px] text-primary hover:underline transition-colors">Remove all</button>
          </div>

          {/* Intake Selection Bar */}
          <div className="relative">
            <select
              value=""
              onChange={(e) => handleAdd(tier, e.target.value)}
              className="w-full bg-card border border-border rounded-full px-4 py-2 text-[14px] font-body font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="" disabled>— Add scout to {tier} —</option>
              {ALL_SCOUTS_DIRECTORY.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {/* Scout rows */}
          <div className="flex flex-col">
             {assignments[tier].filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())).map(scout => {
               const initials = scout.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
               return (
               <div key={scout.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-[12px] shrink-0">{initials}</div>
                    <div className="min-w-0">
                      <div className="font-body text-[14px] font-bold text-foreground truncate">{scout.name}</div>
                      <div className="font-body text-[12px] text-muted-foreground font-medium">{scout.role}</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(tier, scout.id)} className="shrink-0 text-muted-foreground/60 hover:text-destructive transition-colors p-2 rounded-full hover:bg-destructive/10">
                    <X size={16} />
                  </button>
               </div>
             ); })}
             {assignments[tier].length === 0 && (
               <div className="py-4 text-center">
                 <span className="font-body text-[14px] text-muted-foreground">No scouts assigned yet.</span>
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Export: Unified Command Capsule ─────────────────────────────────────────


const FilterToggleBtn = ({ open, onClick }: { open: boolean; onClick: () => void }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-[14px] border shrink-0 transition-colors ${open ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
    <SlidersHorizontal size={14} /> Filters
  </button>
);

export const ReportsHub = ({ extraSubmissions }: { extraSubmissions?: Submission[] }) => {
  const [subTab, setSubTab] = useState<ReportsSubTab>('forms');

  // Forms state
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [formSearch, setFormSearch] = useState('');
  const [rhFiltersOpen, setRhFiltersOpen] = useState(false); // toggle the filter dropdowns per sub-tab
  const [formTypeFilter, setFormTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fillTemplate, setFillTemplate] = useState<FormTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<FormTemplate | null>(null);
  const [assignTemplate, setAssignTemplate] = useState<FormTemplate | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importName, setImportName] = useState('');

  // Submissions state
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('All');
  const [subDateFilter, setSubDateFilter] = useState('');

  // Review Grades state
  const [rgSearch, setRgSearch] = useState('');
  const [rgTierFilter, setRgTierFilter] = useState('All Tiers');

  const filtered = useMemo(() => {
    let list = templates;
    if (formSearch) list = list.filter(t => t.title.toLowerCase().includes(formSearch.toLowerCase()));
    if (formTypeFilter !== 'All Types') list = list.filter(t => t.formType === formTypeFilter);
    if (categoryFilter !== 'All Categories') {
      const cat = categoryFilter.replace(' List', '');
      list = list.filter(t => t.categories.includes(cat));
    }
    if (statusFilter === 'Active') list = list.filter(t => !t.archived);
    if (statusFilter === 'Archived') list = list.filter(t => t.archived);
    return list;
  }, [templates, formSearch, formTypeFilter, categoryFilter, statusFilter]);

  const activeTemplates = filtered.filter(t => !t.archived);
  const archivedTemplates = filtered.filter(t => t.archived);

  const handleAction = (action: string, tpl: FormTemplate) => {
    if (action === 'fill') setFillTemplate(tpl);
    if (action === 'edit') setEditTemplate(tpl);
    if (action === 'assign') setAssignTemplate(tpl);
    if (action === 'archive') setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, archived: true } : t));
    if (action === 'restore') setTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, archived: false } : t));
    if (action === 'delete') setTemplates(prev => prev.filter(t => t.id !== tpl.id));
    if (action === 'view-submissions') { setSubTab('submissions'); }
  };

  const handleToggleCategory = (tplId: string, cat: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id !== tplId) return t;
      const has = t.categories.includes(cat);
      return { ...t, categories: has ? t.categories.filter(c => c !== cat) : [...t.categories, cat] };
    }));
  };

  const createBlankForm = () => {
    const nt: FormTemplate = { id: 'tpl-' + Date.now(), title: 'Untitled Form', description: 'New form draft.', tags: [], author: 'You', categories: ['All'], roles: [], questions: 0, submissions: 0, estTime: '—', archived: false, createdAt: '2026-07-08', updatedAt: '2026-07-08', formType: 'Scouting Report', createdVia: 'scout' };
    setTemplates(prev => [nt, ...prev]);
    setShowNewForm(false);
    setEditTemplate(nt);
  };

  const importForm = () => {
    const name = importName.trim() || 'Imported Form';
    const nt: FormTemplate = { id: 'tpl-' + Date.now(), title: name, description: 'Imported form template.', tags: [], author: 'Imported', categories: ['All'], roles: [], questions: 0, submissions: 0, estTime: '—', archived: false, createdAt: '2026-07-08', updatedAt: '2026-07-08', formType: 'Scouting Report', createdVia: 'imported', importSource: 'uploaded file' };
    setTemplates(prev => [nt, ...prev]);
    setImportName('');
    setShowImport(false);
  };

  return (
    <>
    <div className="flex flex-col gap-4">
      {/* ── Secondary sub-tabs (underline, subordinate to the page pills) ── */}
      <div className="flex items-center gap-6 border-b border-border overflow-x-auto hide-scrollbar">
        {([
          { id: 'forms' as const, label: 'Forms', icon: FileText },
          { id: 'submissions' as const, label: 'Submissions', icon: ClipboardList },
          { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
          { id: 'review-grades' as const, label: 'Review grades', icon: CheckSquare },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 pb-2 -mb-px border-b-2 font-body font-bold text-[14px] whitespace-nowrap shrink-0 transition-colors ${
              subTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ── Content toolbar (per sub-tab) ── */}
      {subTab === 'forms' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input value={formSearch} onChange={e => setFormSearch(e.target.value)} placeholder="Search templates…"
                className="w-full pl-11 pr-4 py-2 bg-card border border-border rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-body font-bold shadow-sm placeholder:text-muted-foreground text-foreground" />
            </div>
            <FilterToggleBtn open={rhFiltersOpen} onClick={() => setRhFiltersOpen(o => !o)} />
            <div className="flex items-center gap-2 flex-wrap sm:ml-auto shrink-0">
              <button className="flex items-center gap-2 bg-card text-foreground border border-border hover:border-primary rounded-full px-4 py-2 font-body font-bold text-[14px] shadow-sm whitespace-nowrap transition-colors">Manage Forms</button>
              <button onClick={() => setShowNewForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-4 py-2 font-body font-bold text-[14px] shadow-sm whitespace-nowrap transition-colors"><Plus size={15} strokeWidth={3} /> Add New Template</button>
            </div>
          </div>
          {rhFiltersOpen && (
            <div className="flex items-center gap-3 flex-wrap">
              <MiniDropdown value={formTypeFilter} options={['All Types', 'Scouting Report', 'Player Evaluation', 'Match Report', 'Training Session']} onChange={setFormTypeFilter} />
              <MiniDropdown value={categoryFilter} options={['All Categories', 'Long List', 'Short List', 'Target List']} onChange={setCategoryFilter} />
              <MiniDropdown value={statusFilter} options={['All', 'Active', 'Archived']} onChange={setStatusFilter} />
            </div>
          )}
        </div>
      )}
      {subTab === 'submissions' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input value={subSearch} onChange={e => setSubSearch(e.target.value)} placeholder="Search submissions…"
                className="w-full pl-11 pr-4 py-2 bg-card border border-border rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-body font-bold shadow-sm placeholder:text-muted-foreground text-foreground" />
            </div>
            <FilterToggleBtn open={rhFiltersOpen} onClick={() => setRhFiltersOpen(o => !o)} />
            <button className="flex items-center gap-2 px-4 py-2 sm:ml-auto shrink-0 bg-card text-foreground border border-border hover:border-primary rounded-full font-body font-bold text-[14px] transition-colors shadow-sm"><Download size={14} /> Export CSV</button>
          </div>
          {rhFiltersOpen && (
            <div className="flex items-center gap-3 flex-wrap">
              <MiniDropdown value={subStatusFilter} options={['All', 'Draft', 'Submitted', 'Completed']} onChange={setSubStatusFilter} />
              <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-sm">
                <Calendar size={14} className="text-muted-foreground" />
                <input type="date" value={subDateFilter} onChange={e => setSubDateFilter(e.target.value)} className="bg-transparent font-body text-[14px] font-bold text-foreground focus:outline-none" />
              </div>
            </div>
          )}
        </div>
      )}
      {subTab === 'review-grades' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input value={rgSearch} onChange={e => setRgSearch(e.target.value)} placeholder="Search scouts…"
                className="w-full pl-11 pr-4 py-2 bg-card border border-border rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-body font-bold shadow-sm placeholder:text-muted-foreground text-foreground" />
            </div>
            <FilterToggleBtn open={rhFiltersOpen} onClick={() => setRhFiltersOpen(o => !o)} />
          </div>
          {rhFiltersOpen && (
            <div className="flex items-center gap-3 flex-wrap">
              <MiniDropdown value={rgTierFilter} options={['All Tiers', 'Long List', 'Short List', 'Target List']} onChange={setRgTierFilter} />
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab Content ═══ */}
      {subTab === 'forms' && (
        <>
          {/* Active or filtered grid */}
          {(statusFilter !== 'Archived') && activeTemplates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTemplates.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} onAction={handleAction}/>)}
            </div>
          )}
          {/* Archived section */}
          {statusFilter !== 'Active' && archivedTemplates.length > 0 && (
            <>
              {statusFilter === 'All' && activeTemplates.length > 0 && (
                <div className="flex items-center gap-4 my-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Archived Templates</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedTemplates.map(tpl => <TemplateCard key={tpl.id} tpl={tpl} onAction={handleAction}/>)}
              </div>
            </>
          )}
          {fillTemplate && <FillFormModal template={fillTemplate} onClose={() => setFillTemplate(null)} />}
        </>
      )}

      {subTab === 'submissions' && <SubmissionsTab statusFilter={subStatusFilter} dateFilter={subDateFilter} extraSubmissions={extraSubmissions} />}
      {subTab === 'analytics' && <AnalyticsTab />}
      {subTab === 'review-grades' && <ReviewGradesTab search={rgSearch} tierFilter={rgTierFilter} />}
    </div>

    {/* ═══ Edit Form Blueprint Modal ═══ */}
    {editTemplate && <EditFormBlueprintModal editTemplate={editTemplate} onClose={() => setEditTemplate(null)} />}

    {/* New Form chooser */}
    {showNewForm && (
      <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
        <div className="bg-card w-full max-w-lg rounded-[24px] shadow-[var(--shadow-2xl)] border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-[20px] text-foreground">New Form</h3>
            <button onClick={() => setShowNewForm(false)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button onClick={createBlankForm} className="flex flex-col items-start gap-2 p-5 rounded-[20px] border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center"><Edit2 size={18} className="text-primary" /></div>
              <span className="font-heading font-semibold text-[14px] text-foreground">Create with a scout</span>
              <span className="font-body font-medium text-[12px] text-muted-foreground">Build a new form from scratch in the editor.</span>
            </button>
            <button onClick={() => { setShowNewForm(false); setShowImport(true); }} className="flex flex-col items-start gap-2 p-5 rounded-[20px] border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center"><Download size={18} className="text-primary" /></div>
              <span className="font-heading font-semibold text-[14px] text-foreground">Import a form</span>
              <span className="font-body font-medium text-[12px] text-muted-foreground">Bring in an existing form from a file or another source.</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Import a form */}
    {showImport && (
      <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
        <div className="bg-card w-full max-w-md rounded-[24px] shadow-[var(--shadow-2xl)] border border-border overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-[20px] text-foreground">Import a form</h3>
            <button onClick={() => setShowImport(false)} className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Form name</label>
              <input value={importName} onChange={e => setImportName(e.target.value)} placeholder="e.g. FIFA Talent Report" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring" />
            </div>
            <div className="border-2 border-dashed border-border rounded-xl px-4 py-8 text-center">
              <Download size={22} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body font-medium text-[12px] text-muted-foreground">Drop a file here or paste a form link (coming soon)</p>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
            <button onClick={() => setShowImport(false)} className="px-5 py-2 rounded-full border border-border bg-card text-muted-foreground font-body font-bold text-[14px] hover:border-primary hover:text-foreground transition-all">Cancel</button>
            <button onClick={importForm} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-body font-semibold text-[14px] hover:bg-primary/80 transition-colors shadow-[var(--shadow-md)]">Import</button>
          </div>
        </div>
      </div>
    )}

    {/* ═══ Assignment Settings Modal ═══ */}
    {assignTemplate && (
      <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setAssignTemplate(null)}>
        <div className="bg-card rounded-[24px] shadow-[var(--shadow-2xl)] w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 bg-primary rounded-t-[24px] flex items-center justify-between">
            <div>
              <span className="font-heading font-semibold text-[16px] text-chalk block">Assignment Settings</span>
              <span className="font-body text-[12px] text-chalk/60">{assignTemplate.title}</span>
            </div>
            <button onClick={() => setAssignTemplate(null)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-chalk/60 hover:text-chalk"><X size={16} /></button>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {[
              { label: 'Assign by Tier', placeholder: 'Select tiers…', options: ['Country Scout', 'Head Scout', 'Senior Scout', 'Lead Scout'] },
              { label: 'Assign by Country', placeholder: 'Select countries…', options: ['Ghana', 'Nigeria', 'Senegal', 'Cameroon', 'Mali', 'Kenya'] },
              { label: 'Assign by User', placeholder: 'Search users…', options: ['Mbugua', 'Tom Okeke', 'Nene Balde', 'Dr. Kwame Asante', 'Scott'] },
            ].map(row => (
              <div key={row.label} className="flex flex-col gap-2">
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{row.label}</label>
                <div className="flex flex-wrap gap-2 min-h-[44px] items-center bg-card border border-border rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all">
                  {row.options.slice(0, 2).map(o => (
                    <span key={o} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1 font-body font-bold text-[12px]">
                      {o} <button className="hover:text-destructive transition-colors"><X size={12} /></button>
                    </span>
                  ))}
                  <input placeholder={row.placeholder} className="flex-1 min-w-[120px] bg-transparent font-body text-[14px] font-bold text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
            <button onClick={() => setAssignTemplate(null)} className="px-5 py-2 rounded-full border border-border bg-card text-muted-foreground font-body font-bold text-[12px] hover:border-primary hover:text-foreground transition-all">Cancel</button>
            <button onClick={() => setAssignTemplate(null)} className="px-5 py-2 rounded-full bg-muted-foreground/80 text-chalk font-body font-bold text-[12px] hover:bg-muted-foreground transition-colors">Save Assignment</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ReportsHub;