import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Film, Video, Users, Calendar, ArrowRight, TrendingUp, Trophy,
  Clock, Upload, CheckCircle, Check, X, LogOut, Play, AlertTriangle,
  ClipboardCheck, ListChecks, RotateCcw, Search, Bell, Send, Clapperboard, Grid3x3,
  ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';
import { VideoTrackerGrid } from '../components/VideoTrackerGrid';
import { toast } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { ResponsiveTabs, TabItem } from '../components/ResponsiveTabs';
import { SeniorLeadPlayersPage, ALL_GENERATED_PLAYERS } from '../components/SeniorLeadPlayersPage';
import { MatchesView, findMatchIdByTeams } from './MatchesView';
import { AdminView } from './AdminView';
import { KpiCard } from '../components/dashboard/KpiCard';
import { UploadVideoModal } from '../components/UploadVideoModal';
import { TasksTab } from '../components/dashboard/TasksTab';
import { MOCK_TASKS, TaskInput } from '../components/dashboard/shared';
import { useTierMap, PipelineTier } from '../state/playerStore';
import {
  useVideoState, coverageStatus, assignVideo, approveVideo, redoVideo,
  VideoType, CoverageStatus, ApprovalItem,
} from '../state/videoStore';

type VmTab = 'overview' | 'packages' | 'full-matches' | 'approval' | 'analytics' | 'tasks';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';

const FLAG_MAP: Record<string, string> = {
  GAM: 'gm', NGA: 'ng', GHA: 'gh', CMR: 'cm', SEN: 'sn', CIV: 'ci', MLI: 'ml', BDI: 'bi',
};
const Flag = ({ nat, country }: { nat: string; country: string }) => {
  const code = FLAG_MAP[nat];
  if (!code) return null;
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={country} className="w-4 h-3 rounded-[2px] object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
};

const CARD = 'bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden';

// ── semantic status pill ──
const STATUS_META: Record<CoverageStatus, { label: string; cls: string }> = {
  'unassigned':    { label: 'Unassigned',    cls: 'bg-scout-red/15 text-scout-red' },
  'assigned':      { label: 'Assigned',      cls: 'bg-primary/15 text-primary' },
  'in-progress':   { label: 'In progress',   cls: 'bg-scout-amber/15 text-scout-amber' },
  'has-video':     { label: 'Has video',     cls: 'bg-scout-green/15 text-scout-green' },
  'not-available': { label: 'Not available', cls: 'bg-accent text-muted-foreground' },
};
const StatusPill = ({ s }: { s: CoverageStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-body font-black text-[11px] ${STATUS_META[s].cls}`}>{STATUS_META[s].label}</span>
);

const EDITORS = ['Kwesi Owusu', 'Brian Otieno'];
const UPCOMING_MATCHES = [
  { id: 'm1', home: 'Gor Mahia', away: 'Enyimba FC', date: 'Sat, 16 Aug', note: '2 pipeline players — full match needed' },
  { id: 'm2', home: 'Tusker FC', away: 'Rivers United', date: 'Sun, 14 Sep', note: 'Kofi Mensah playing' },
  { id: 'm3', home: 'ASEC Mimosas', away: 'Gor Mahia', date: 'Sat, 13 Sep', note: '' },
];
interface TeamMember { name: string; role: 'Editor' | 'Uploader'; submitted: number; current: string; }
const TEAM: TeamMember[] = [
  { name: 'Kwesi Owusu', role: 'Editor', submitted: 14, current: 'Editing Francis Gomez reel' },
  { name: 'Ama Serwaa', role: 'Uploader', submitted: 11, current: 'Uploading Gor Mahia full match' },
  { name: 'Brian Otieno', role: 'Editor', submitted: 9, current: 'Idle' },
  { name: 'Zawadi Juma', role: 'Uploader', submitted: 7, current: 'Ingesting Tusker footage' },
];

const TIERS: { id: PipelineTier; label: string }[] = [
  { id: 'target-list', label: 'Target' },
  { id: 'short-list', label: 'Short' },
  { id: 'long-list', label: 'Long' },
];

// ── coverage helpers over the real tiered player pool ──
function playersInTier(tierMap: Map<string, PipelineTier>, tier: PipelineTier) {
  return ALL_GENERATED_PLAYERS.filter(p => tierMap.get(p.id) === tier);
}
function missingCount(tierMap: Map<string, PipelineTier>, vstate: ReturnType<typeof useVideoState>, tier: PipelineTier, type: VideoType) {
  return playersInTier(tierMap, tier).filter(p => {
    const s = coverageStatus(vstate, p.id, type);
    return s !== 'has-video' && s !== 'not-available';
  }).length;
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ onNavigate, onMissing, onTracker, onOpenMatch, activeTasksCount, overdueCount }: {
  onNavigate: (t: VmTab) => void;
  onMissing: (type: VideoType) => void;
  onTracker: () => void;
  onOpenMatch: (home: string, away: string) => void;
  activeTasksCount: number;
  overdueCount: number;
}) => {
  const tierMap = useTierMap();
  const vstate = useVideoState();
  const pending = vstate.approvals.length;
  const missPkg = missingCount(tierMap, vstate, 'target-list', 'package') + missingCount(tierMap, vstate, 'short-list', 'package');
  const missFull = missingCount(tierMap, vstate, 'target-list', 'full-match') + missingCount(tierMap, vstate, 'short-list', 'full-match');
  // Distinct players in Target + Short still missing at least one video (package OR full match).
  const needTracker = (['target-list', 'short-list'] as PipelineTier[]).reduce((acc, t) =>
    acc + playersInTier(tierMap, t).filter(p => {
      const pk = coverageStatus(vstate, p.id, 'package');
      const fm = coverageStatus(vstate, p.id, 'full-match');
      return pk !== 'has-video' || (fm !== 'has-video' && fm !== 'not-available');
    }).length, 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={ClipboardCheck} heading="Approvals" value={pending}
          descriptor={pending > 0 ? <span className="text-scout-red font-black">awaiting your review</span> : 'all clear'}
          action="Open Approvals" onClick={() => onNavigate('approval')} />
        <KpiCard icon={ListChecks} heading="Tasks" value={activeTasksCount}
          descriptor={overdueCount > 0 ? <><span className="text-scout-red font-black">{overdueCount} overdue</span> · open</> : 'open · none overdue'}
          action="Open Tasks" onClick={() => onNavigate('tasks')} />
        <KpiCard icon={Film} heading="Missing Packages" value={missPkg}
          descriptor="across Target + Short" action="Review Packages" onClick={() => onMissing('package')} />
        <KpiCard icon={Video} heading="Missing Full Matches" value={missFull}
          descriptor="across Target + Short" action="Review Full Matches" onClick={() => onMissing('full-match')} />
        <KpiCard icon={Grid3x3} heading="Video Tracker" value={needTracker}
          descriptor="players need video" action="Open Tracker" onClick={onTracker} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
        {/* Raised requests */}
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-foreground" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Raised requests</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Video the scouts are waiting on — oldest first</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {vstate.approvals.length === 0 && <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">Queue is clear.</div>}
            {[...vstate.approvals].sort((a, b) => b.daysAgo - a.daysAgo).slice(0, 6).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[12px] shrink-0">{(r.playerName || r.videoName).split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-bold text-[14px] text-foreground truncate">{r.playerName || r.videoName}</span>
                    <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${r.type === 'package' ? 'bg-primary/15 text-foreground' : 'bg-accent text-muted-foreground'}`}>{r.type === 'package' ? 'Package' : 'Full match'}</span>
                  </div>
                  <p className="font-body text-[12px] text-muted-foreground mt-0.5">{r.uploader} · {r.dateLabel}</p>
                </div>
                <button onClick={() => onNavigate('approval')} className="shrink-0 inline-flex items-center gap-1 bg-transparent border border-primary text-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:bg-primary/10 transition-colors">Review</button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className={`${CARD} flex flex-col`}>
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-foreground" /></div>
              <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Upcoming matches</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Capture opportunities</p></div>
            </div>
            <div className="divide-y divide-border">
              {UPCOMING_MATCHES.map(m => (
                <button key={m.id} onClick={() => onOpenMatch(m.home, m.away)} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="font-body font-bold text-[14px] text-foreground truncate">{m.home} <span className="text-muted-foreground font-medium">vs</span> {m.away}</div>
                    <p className="font-body text-[12px] text-muted-foreground mt-0.5">{m.date}{m.note ? ` · ${m.note}` : ''}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
          <div className={`${CARD} flex flex-col`}>
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Users size={16} className="text-foreground" /></div>
              <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Team activity</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Editors &amp; uploaders this week</p></div>
            </div>
            <div className="divide-y divide-border">
              {TEAM.map(t => (
                <div key={t.name} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent text-foreground flex items-center justify-center font-heading font-black text-[12px] shrink-0">{t.name.split(' ').map(w => w[0]).join('')}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="font-body font-bold text-[14px] text-foreground truncate">{t.name}</span><span className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-foreground">{t.role}</span></div>
                    <p className="font-body text-[12px] text-muted-foreground mt-0.5 truncate">{t.current}</p>
                  </div>
                  <span className="font-heading font-black text-[14px] text-foreground tabular-nums shrink-0">{t.submitted}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Coverage tab (Packages | Full Matches) ───────────────────────────────────
const KpiTile = ({ icon: Icon, label, value, sub, onClick }: { icon: any; label: string; value: React.ReactNode; sub: string; onClick?: () => void }) => (
  <button onClick={onClick} disabled={!onClick}
    className={`min-w-0 bg-card border border-border rounded-[20px] p-4 h-[135px] shadow-[var(--shadow-lg)] flex flex-col justify-between transition-all text-left ${onClick ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : 'cursor-default'}`}>
    <div className="flex items-center justify-between gap-2">
      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground truncate">{label}</span>
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Icon size={16} className="text-primary" /></div>
    </div>
    <div className="font-heading font-extrabold text-[32px] text-foreground leading-none">{value}</div>
    <span className="font-body text-[12px] text-muted-foreground font-medium">{sub}</span>
  </button>
);

type StatusFilter = 'all' | 'needs' | CoverageStatus;
const CoverageTab = ({ type, startNeeds, onView }: { type: VideoType; startNeeds?: boolean; onView: (p: any) => void }) => {
  const tierMap = useTierMap();
  const vstate = useVideoState();
  const label = type === 'package' ? 'Packages' : 'Full matches';
  const [tier, setTier] = useState<PipelineTier>('target-list');
  const [filter, setFilter] = useState<StatusFilter>(startNeeds ? 'needs' : 'all');
  const [search, setSearch] = useState('');

  const pool = playersInTier(tierMap, tier);
  const withStatus = pool.map(p => ({ p, status: coverageStatus(vstate, p.id, type) }));
  const statusCounts = { unassigned: 0, assigned: 0, 'in-progress': 0, 'has-video': 0 } as Record<CoverageStatus, number>;
  withStatus.forEach(x => { statusCounts[x.status]++; });
  const q = search.trim().toLowerCase();
  const rows = withStatus
    .filter(x => filter === 'all' ? true : filter === 'needs' ? x.status !== 'has-video' : x.status === filter)
    .filter(x => q === '' || x.p.name.toLowerCase().includes(q) || x.p.team.toLowerCase().includes(q))
    .sort((a, b) => (a.status === 'unassigned' ? -1 : 0) - (b.status === 'unassigned' ? -1 : 0));

  // Paginate so the whole table + pager fit on screen without scrolling.
  const PAGE = 5;
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [tier, filter, search]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE));
  const pageRows = rows.slice(page * PAGE, (page + 1) * PAGE);

  const shortMissing = missingCount(tierMap, vstate, 'short-list', type);
  const targetMissing = missingCount(tierMap, vstate, 'target-list', type);
  const uploaded = vstate.approvals.filter(a => a.type === type).length + vstate.reviewed.filter(r => r.type === type).length;

  const chips: { id: StatusFilter; label: string; n?: number }[] = [
    { id: 'all', label: 'All', n: pool.length },
    { id: 'needs', label: 'Needs work', n: statusCounts.unassigned + statusCounts.assigned + statusCounts['in-progress'] },
    { id: 'unassigned', label: 'Unassigned', n: statusCounts.unassigned },
    { id: 'assigned', label: 'Assigned', n: statusCounts.assigned },
    { id: 'in-progress', label: 'In progress', n: statusCounts['in-progress'] },
    { id: 'has-video', label: 'Has video', n: statusCounts['has-video'] },
  ];

  const doAssign = (p: any) => { assignVideo(p.id, type, EDITORS[0]); toast.success(`Assigned ${p.name} to ${EDITORS[0]}`); };
  const doNudge = (p: any) => toast(`Nudged the editor on ${p.name}`);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* KPI tiles — reports style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTile icon={Upload} label="Uploaded this week" value={uploaded} sub={label} />
        <KpiTile icon={Film} label="Short List missing" value={shortMissing} sub={`${label} not yet covered`} onClick={() => { setTier('short-list'); setFilter('needs'); }} />
        <KpiTile icon={Video} label="Target List missing" value={targetMissing} sub={`${label} not yet covered`} onClick={() => { setTier('target-list'); setFilter('needs'); }} />
      </div>

      {/* Table card */}
      <div className={CARD}>
        {/* toolbar — tier · search · status dropdown */}
        <div className="px-4 sm:px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">
            {TIERS.map(t => (
              <button key={t.id} onClick={() => setTier(t.id)} className={`font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${tier === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t.label}</button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or team…"
              className="w-full bg-card/60 border border-primary/40 rounded-full pl-9 pr-3 py-2 font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary hover:bg-card transition-colors" />
          </div>
          {/* status dropdown filter */}
          <div className="relative shrink-0">
            <select value={filter} onChange={e => setFilter(e.target.value as StatusFilter)}
              className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2 font-body font-bold text-[12px] text-foreground cursor-pointer outline-none focus:border-primary hover:border-primary transition-colors">
              {chips.map(c => (
                <option key={c.id} value={c.id}>{c.label}{c.n != null ? ` (${c.n})` : ''}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="bg-accent/40">
                {['Player', 'Pos', 'Team', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center font-body text-[14px] text-muted-foreground">No players match.</td></tr>}
              {pageRows.map(({ p, status }) => (
                <tr key={p.id} className="border-t border-border hover:bg-accent transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Flag nat={p.nationality} country={p.country} />
                      <span className="font-body font-bold text-[14px] text-foreground truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body font-bold text-[13px] text-foreground">{p.posAcronym}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-muted-foreground truncate max-w-[140px]">{p.team}</td>
                  <td className="px-4 py-3"><StatusPill s={status} /></td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {status === 'unassigned' && (
                        <button onClick={() => doAssign(p)} className="inline-flex items-center gap-1 bg-transparent border border-primary text-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:bg-primary/10 transition-colors"><Upload size={12} /> Assign</button>
                      )}
                      <button onClick={() => onView(p)} className="inline-flex items-center gap-1 bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:border-primary hover:text-foreground transition-colors"><Play size={12} /> View</button>
                      <button onClick={() => doNudge(p)} disabled={status !== 'assigned' && status !== 'in-progress'}
                        className="inline-flex items-center gap-1 bg-transparent border border-border text-muted-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:border-primary hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Send size={12} /> Nudge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && (
          <div className="border-t border-border flex items-center justify-center gap-1 px-4 py-3">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={15} /></button>
            {Array.from({ length: pageCount }).slice(0, 6).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-full font-body font-bold text-[12px] transition-colors ${page === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>{i + 1}</button>
            ))}
            {pageCount > 6 && <span className="px-1 text-muted-foreground">…</span>}
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} className="ml-1 inline-flex items-center gap-1 px-3 h-8 rounded-full border border-border font-body font-bold text-[12px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">Next <ChevronRight size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Approval tab ─────────────────────────────────────────────────────────────
const REDO_CHIPS = ['Wrong clips', 'Quality', 'Wrong player', 'Missing moments'];
const RedoPanel = ({ onConfirm, onCancel }: { onConfirm: (reason: string) => void; onCancel: () => void }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="bg-card border border-border rounded-[16px] shadow-2xl p-3 w-72" onClick={e => e.stopPropagation()}>
      <div className="font-heading font-bold text-[12px] text-foreground mb-2">Send back for redo</div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {REDO_CHIPS.map(c => (
          <button key={c} onClick={() => setReason(r => r ? r : c)} className="px-2.5 py-1 rounded-full bg-accent text-muted-foreground hover:text-foreground font-body font-bold text-[11px]">{c}</button>
        ))}
      </div>
      <textarea autoFocus value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Reason (required)…"
        className="w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-[13px] text-foreground focus:outline-none focus:border-ring resize-none" />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="font-body font-bold text-[12px] text-muted-foreground hover:text-foreground px-2">Cancel</button>
        <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim()}
          className="inline-flex items-center gap-1 bg-scout-red/15 text-scout-red border border-scout-red/30 font-body font-black text-[12px] px-3 py-1.5 rounded-full disabled:opacity-40"><RotateCcw size={12} /> Send back</button>
      </div>
    </div>
  );
};

const ApprovalTab = ({ onApprove, onRedo }: { onApprove: (i: ApprovalItem) => void; onRedo: (i: ApprovalItem, reason: string) => void }) => {
  const vstate = useVideoState();
  const [typeFilter, setTypeFilter] = useState<'all' | VideoType>('all');
  const [redoFor, setRedoFor] = useState<string | null>(null);
  const [playing, setPlaying] = useState<ApprovalItem | null>(null);
  const [showReviewed, setShowReviewed] = useState(false);

  const queue = [...vstate.approvals].sort((a, b) => b.daysAgo - a.daysAgo)
    .filter(a => typeFilter === 'all' ? true : a.type === typeFilter);
  const counts = { all: vstate.approvals.length, package: vstate.approvals.filter(a => a.type === 'package').length, 'full-match': vstate.approvals.filter(a => a.type === 'full-match').length };

  const approve = (i: ApprovalItem) => { onApprove(i); setPlaying(null); };
  const redo = (i: ApprovalItem, reason: string) => { onRedo(i, reason); setRedoFor(null); setPlaying(null); };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className={CARD}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><ClipboardCheck size={18} className="text-foreground" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Approval queue</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium">Review before it enters the system · oldest first</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">
            {([['all', 'All'], ['package', 'Packages'], ['full-match', 'Full Matches']] as const).map(([id, l]) => (
              <button key={id} onClick={() => setTypeFilter(id)} className={`font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${typeFilter === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{l}<span className="ml-1 tabular-nums opacity-80">{counts[id]}</span></button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {queue.length === 0 && <div className="px-5 py-12 text-center font-body text-[14px] text-muted-foreground">Queue is clear — nothing to review. 🎬</div>}
          {queue.map(item => (
            <div key={item.id} className="px-5 py-4 flex items-center gap-4">
              {/* thumbnail + play */}
              <button onClick={() => setPlaying(item)} className="relative w-24 h-14 rounded-[12px] bg-gradient-to-br from-[#B4D7F6]/70 to-accent flex items-center justify-center shrink-0 group">
                <span className="w-8 h-8 rounded-full bg-card/90 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Play size={14} className="text-primary ml-0.5" /></span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-body font-bold text-[14px] text-foreground truncate">{item.videoName}</span>
                  <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${item.type === 'package' ? 'bg-primary/15 text-foreground' : 'bg-accent text-muted-foreground'}`}>{item.type === 'package' ? 'Package' : 'Full match'}</span>
                </div>
                <div className="flex items-center gap-2 font-body text-[12px] text-muted-foreground mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Users size={11} /> {item.uploader} · {item.uploaderRole}</span>
                  <span>·</span>
                  {item.playerId ? <span>{item.playerName}</span> : <span className="inline-flex items-center gap-1 text-scout-amber font-bold"><AlertTriangle size={11} /> No player linked</span>}
                  <span>·</span>
                  <span>{item.dateLabel}</span>
                </div>
              </div>
              <div className="relative flex items-center gap-1.5 shrink-0">
                <button onClick={() => approve(item)} className="inline-flex items-center gap-1 bg-scout-green/15 text-scout-green border border-scout-green/30 font-body font-black text-[12px] px-3 py-1.5 rounded-full hover:bg-scout-green/25 transition-colors"><Check size={13} /> Approve</button>
                <button onClick={() => setRedoFor(redoFor === item.id ? null : item.id)} className="inline-flex items-center gap-1 bg-transparent border border-border text-muted-foreground font-body font-bold text-[12px] px-3 py-1.5 rounded-full hover:border-scout-red hover:text-scout-red transition-colors"><RotateCcw size={12} /> Redo</button>
                {redoFor === item.id && (
                  <div className="absolute right-0 top-full mt-2 z-30"><RedoPanel onConfirm={r => redo(item, r)} onCancel={() => setRedoFor(null)} /></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently reviewed */}
      {vstate.reviewed.length > 0 && (
        <div className={CARD}>
          <button onClick={() => setShowReviewed(s => !s)} className="w-full px-5 py-4 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-[12px] bg-accent flex items-center justify-center shrink-0"><Clock size={16} className="text-muted-foreground" /></div>
            <div className="flex-1"><h3 className="font-heading font-bold text-[16px] text-foreground">Recently reviewed</h3><p className="font-body text-[12px] text-muted-foreground font-medium">{vstate.reviewed.length} decisions</p></div>
            <span className="font-body font-bold text-[12px] text-primary">{showReviewed ? 'Hide' : 'Show'}</span>
          </button>
          {showReviewed && (
            <div className="divide-y divide-border border-t border-border">
              {vstate.reviewed.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${r.outcome === 'approved' ? 'bg-scout-green/15 text-scout-green' : 'bg-scout-red/15 text-scout-red'}`}>{r.outcome === 'approved' ? <Check size={13} /> : <RotateCcw size={12} />}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-body font-bold text-[13px] text-foreground">{r.videoName}</span>
                    <p className="font-body text-[12px] text-muted-foreground">{r.outcome === 'approved' ? 'Approved' : `Sent back — ${r.reason}`} · {r.uploader}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Play modal */}
      {playing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={() => { setPlaying(null); setRedoFor(null); }}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-2xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video bg-gradient-to-br from-[#061b2e] to-[#0a2d4c] flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-card/90 flex items-center justify-center shadow-lg"><Play size={28} className="text-primary ml-1" /></span>
              <button onClick={() => { setPlaying(null); setRedoFor(null); }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-card/20 text-white flex items-center justify-center hover:bg-card/40"><X size={18} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-bold text-[18px] text-foreground">{playing.videoName}</h3>
                <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${playing.type === 'package' ? 'bg-primary/15 text-foreground' : 'bg-accent text-muted-foreground'}`}>{playing.type === 'package' ? 'Package' : 'Full match'}</span>
              </div>
              <p className="font-body text-[13px] text-muted-foreground">{playing.uploader} · {playing.uploaderRole} · {playing.dateLabel} · {playing.playerId ? playing.playerName : 'No player linked'}</p>
              <div className="flex items-center gap-2 mt-5 relative">
                <button onClick={() => approve(playing)} className="inline-flex items-center gap-1.5 bg-scout-green/15 text-scout-green border border-scout-green/30 font-body font-black text-[13px] px-5 py-2.5 rounded-full hover:bg-scout-green/25 transition-colors"><Check size={15} /> Approve</button>
                <button onClick={() => setRedoFor(redoFor === playing.id ? null : playing.id)} className="inline-flex items-center gap-1.5 bg-transparent border border-border text-muted-foreground font-body font-bold text-[13px] px-5 py-2.5 rounded-full hover:border-scout-red hover:text-scout-red transition-colors"><RotateCcw size={14} /> Redo</button>
                {redoFor === playing.id && <div className="absolute left-0 bottom-full mb-2 z-30"><RedoPanel onConfirm={r => redo(playing, r)} onCancel={() => setRedoFor(null)} /></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Analytics tab (kept, colors updated) ─────────────────────────────────────
const VmAnalyticsTab = () => {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const hSeries = [48, 55, 61, 66, 70, 73];
  const fSeries = [30, 34, 39, 45, 50, 57];
  const W = 600, H = 240, mL = 34, mR = 16, mT = 16, mB = 34;
  const pL = mL, pR = W - mR, pT = mT, pB = H - mB, plotW = pR - pL, plotH = pB - pT;
  const X = (i: number) => pL + (i / (months.length - 1)) * plotW;
  const Y = (v: number) => pB - (v / 100) * plotH;
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const series = [{ label: 'Packages %', data: hSeries, color: '#2563eb' }, { label: 'Full Matches %', data: fSeries, color: '#E8A838' }];
  const editors = TEAM.filter(t => t.role === 'Editor').sort((a, b) => b.submitted - a.submitted);
  const uploaders = TEAM.filter(t => t.role === 'Uploader').sort((a, b) => b.submitted - a.submitted);
  const maxEd = Math.max(...editors.map(e => e.submitted), 1), maxUp = Math.max(...uploaders.map(u => u.submitted), 1);
  const demand = [{ label: 'Packages requested', v: 24, color: '#2563eb' }, { label: 'Full matches requested', v: 15, color: '#E8A838' }];
  const maxDemand = Math.max(...demand.map(d => d.v));
  const Board = ({ title, rows, max }: { title: string; rows: TeamMember[]; max: number }) => (
    <div className="flex-1 min-w-0">
      <h4 className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-3">{title}</h4>
      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-black text-[12px] shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0"><div className="font-body font-bold text-[13px] text-foreground truncate">{r.name}</div><div className="h-2 bg-accent rounded-full overflow-hidden mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${(r.submitted / max) * 100}%` }} /></div></div>
            <span className="font-heading font-black text-[14px] text-foreground tabular-nums shrink-0">{r.submitted}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Coverage over time</h3><p className="font-body text-[12px] text-muted-foreground font-medium">% of pipeline players with video, monthly</p></div>
          </div>
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }} preserveAspectRatio="xMidYMid meet">
              {[0, 25, 50, 75, 100].map(g => (<g key={g}><line x1={pL} y1={Y(g)} x2={pR} y2={Y(g)} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" /><text x={pL - 6} y={Y(g) + 3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g}</text></g>))}
              {months.map((m, i) => (<text key={m} x={X(i)} y={pB + 20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{m}</text>))}
              {series.map(s => (<g key={s.label}><path d={path(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{s.data.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r={3} fill={s.color} />)}</g>))}
            </svg>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">{series.map(s => (<div key={s.label} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="font-heading font-bold text-[12px] text-foreground">{s.label}</span></div>))}</div>
          </div>
        </div>
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Clock size={16} className="text-foreground" /></div><div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Request turnaround</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Raised → fulfilled</p></div></div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-5">
            <div><div className="font-heading font-extrabold text-[40px] text-foreground leading-none">2.8<span className="text-[18px] text-muted-foreground"> days</span></div><span className="font-body text-[12px] text-muted-foreground font-medium">median this month</span></div>
            <div className="flex items-center justify-between rounded-[16px] border border-border p-4"><span className="font-body text-[13px] font-bold text-foreground">Open &gt; 7 days</span><span className="font-heading font-black text-[20px] text-foreground tabular-nums">2</span></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Trophy size={16} className="text-[#E8A838]" /></div><div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Team output</h3><p className="font-body text-[12px] text-muted-foreground font-medium">Videos submitted this week</p></div></div>
          <div className="p-5 flex flex-col sm:flex-row gap-8"><Board title="Editors · packages" rows={editors} max={maxEd} /><Board title="Uploaders · full matches" rows={uploaders} max={maxUp} /></div>
        </div>
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Film size={16} className="text-foreground" /></div><div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-foreground">Demand profile</h3><p className="font-body text-[12px] text-muted-foreground font-medium">What scouts are asking for</p></div></div>
          <div className="p-5 flex flex-col justify-center gap-5 flex-1">{demand.map(d => (<div key={d.label}><div className="flex items-center justify-between mb-1"><span className="font-body text-[13px] font-bold text-foreground">{d.label}</span><span className="font-heading font-black text-[14px] text-foreground tabular-nums">{d.v}</span></div><div className="h-3 bg-accent rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(d.v / maxDemand) * 100}%`, backgroundColor: d.color }} /></div></div>))}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function VideoManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const vstate = useVideoState();

  let activePage: ActivePage = 'dashboard';
  if (location.pathname === '/video-manager/players') activePage = 'players';
  if (location.pathname === '/video-manager/matches') activePage = 'matches';
  if (location.pathname === '/video-manager/admin') activePage = 'admin';

  const [activeTab, setActiveTab] = useState<VmTab>('overview');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pkgFocus, setPkgFocus] = useState(0);
  const [fmFocus, setFmFocus] = useState(0);

  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const toggleTask = (id: any) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const setTaskStatus = (id: any, status: any) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completed: status === 'done' } : t));
  const addTask = (input: any) => {
    const base = typeof input === 'string' ? { text: input } : input;
    setTasks(prev => [{
      id: `vt${Date.now()}`,
      text: base.text, description: base.description,
      priority: base.priority || 'Medium',
      dueDate: base.dueDate || 'This week', deadline: base.deadline,
      assignedDate: new Date().toISOString().slice(0, 10), status: 'pending',
      assignedTo: base.assignedTo || 'Me',
      allocated: 'Today', completed: false,
    }, ...prev]);
  };
  const activeTasks = tasks.filter(t => !t.completed);
  const overdueCount = activeTasks.filter(t => t.priority === 'High').length;

  const viewPlayer = (p: any) => navigate(`/video-manager/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, nationality: p.nationality, primaryPos: p.posAcronym, currentTeam: p.team } } });
  const onMissing = (type: VideoType) => { if (type === 'package') { setActiveTab('packages'); setPkgFocus(x => x + 1); } else { setActiveTab('full-matches'); setFmFocus(x => x + 1); } };
  const onApprove = (i: ApprovalItem) => { approveVideo(i.id); toast.success(`Approved · ${i.videoName}`); };
  const onRedo = (i: ApprovalItem, reason: string) => { const r = redoVideo(i.id, reason); if (r) addTask({ text: `Redo: ${i.videoName} — ${reason}`, assignedTo: i.uploader, priority: 'High', dueDate: 'This week' }); toast(`Sent back to ${i.uploader}`); };

  const pendingApprovals = vstate.approvals.length;
  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'packages', label: 'Packages' },
    { id: 'full-matches', label: 'Full Matches' },
    { id: 'approval', label: 'Approval', count: pendingApprovals, countTone: 'red' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'tasks', label: 'Tasks', count: activeTasks.length, countTone: 'muted' },
  ];

  const avatar = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop&crop=faces&q=80';

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar actions={[]} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopNav
          responsive
          rolePill={(
            <div className="flex items-center gap-2 px-3 md:px-5 h-[44px] bg-accent rounded-[32px]">
              <span className="w-2 h-2 rounded-full shrink-0 bg-primary" />
              <span className="hidden md:inline font-body text-[14px] font-bold text-foreground whitespace-nowrap">Video Manager Dashboard</span>
            </div>
          )}
          unreadCount={pendingApprovals}
          notifOpen={showNotif}
          onNotifToggle={() => setShowNotif(p => !p)}
          notifPanel={(
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-[24px] shadow-2xl border border-border z-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary rounded-t-[24px]">
                <span className="font-heading font-black text-[14px] text-white">Notifications</span>
                <button onClick={() => setShowNotif(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {vstate.approvals.length === 0 && <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">You're all caught up.</div>}
                {[...vstate.approvals].sort((a, b) => b.daysAgo - a.daysAgo).map(a => (
                  <button key={a.id} onClick={() => { setActiveTab('approval'); setShowNotif(false); }} className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-accent transition-colors">
                    <span className="w-8 h-8 rounded-full bg-scout-red/15 text-scout-red flex items-center justify-center shrink-0 mt-0.5"><ClipboardCheck size={13} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[13px] font-bold text-foreground leading-snug">{a.uploader} uploaded “{a.videoName}” — needs approval</p>
                      <p className="font-body text-[12px] text-muted-foreground mt-0.5">{a.dateLabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          onAddPlayer={() => setShowAddPlayer(true)}
          onUploadVideo={() => setShowUpload(true)}
          uploadVideoVariant="secondary"
          avatarImg={avatar}
          profileOpen={showProfile}
          onProfileToggle={() => setShowProfile(p => !p)}
          profileMenu={(
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div><div className="font-body font-bold text-[14px] text-foreground">Marcus</div><div className="font-body text-[12px] text-muted-foreground font-medium">Video Manager</div></div>
              </div>
              <div className="p-2"><button onClick={() => setShowProfile(false)} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors"><LogOut size={16} className="mr-3" />Log out</button></div>
            </div>
          )}
        />

        <div className="flex-1 px-[var(--pad-page)] pb-20 md:pb-12">
          {activePage === 'players' && <SeniorLeadPlayersPage allPlayersData={[]} loggedInRole="Video Manager" flagMap={FLAG_MAP} />}
          {activePage === 'matches' && <MatchesView />}
          {activePage === 'admin' && <AdminView />}

          {activePage === 'dashboard' && (
            <>
              <div className="pt-6 mb-3">
                <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0"><Video size={26} className="text-chalk" /></span>
                  Marcus
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">Every player, a video for the scouts 🎬</p>
              </div>

              <ResponsiveTabs className="mt-4 mb-6" tabs={tabs} activeId={activeTab} onSelect={(id) => setActiveTab(id as VmTab)} />

              {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} onMissing={onMissing} onTracker={() => navigate('/video-manager/players?section=video-tracker')} onOpenMatch={(home, away) => { const id = findMatchIdByTeams(home, away); navigate(id ? `/video-manager/matches?match=${id}` : '/video-manager/matches'); }} activeTasksCount={activeTasks.length} overdueCount={overdueCount} />}
              {activeTab === 'packages' && <CoverageTab key={`pkg-${pkgFocus}`} type="package" startNeeds={pkgFocus > 0} onView={viewPlayer} />}
              {activeTab === 'full-matches' && <CoverageTab key={`fm-${fmFocus}`} type="full-match" startNeeds={fmFocus > 0} onView={viewPlayer} />}
              {activeTab === 'approval' && <ApprovalTab onApprove={onApprove} onRedo={onRedo} />}
              {activeTab === 'analytics' && <VmAnalyticsTab />}
              {activeTab === 'tasks' && <TasksTab tasks={tasks} onToggle={toggleTask} onSetStatus={setTaskStatus} onAdd={addTask} />}
            </>
          )}
        </div>
      </main>

      {showUpload && <UploadVideoModal uploaderName="Marcus" onClose={() => setShowUpload(false)} />}

      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAddPlayer(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[16px] flex items-center justify-between">
              <span className="font-heading font-semibold text-[16px] text-white">Add a Player</span>
              <button onClick={() => setShowAddPlayer(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Player name</label>
                <input autoFocus type="text" placeholder="e.g. Kofi Mensah" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Team</label><input type="text" placeholder="Club" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
                <div><label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label><input type="text" placeholder="e.g. ST" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddPlayer(false)} className="flex-1 px-6 py-3 bg-transparent border-2 border-border text-muted-foreground rounded-full font-body font-bold text-[14px] hover:border-muted-foreground transition-colors">Cancel</button>
                <button onClick={() => setShowAddPlayer(false)} className="flex-1 px-6 py-3 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] hover:bg-primary/80 transition-colors">Add Player</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
