import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Film, Video, Users, Calendar, ArrowRight, TrendingUp, Trophy,
  Clock, Upload, CheckCircle, X, LogOut, Play, AlertTriangle
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { ResponsiveTabs } from '../components/ResponsiveTabs';
import { SeniorLeadPlayersPage } from '../components/SeniorLeadPlayersPage';
import { MatchesView } from './MatchesView';
import { AdminView } from './AdminView';
import { KpiCard } from '../components/dashboard/KpiCard';
import { TasksTab } from '../components/dashboard/TasksTab';
import { MOCK_TASKS, TaskInput } from '../components/dashboard/shared';

type VmTab = 'overview' | 'highlights' | 'full-matches' | 'analytics' | 'tasks';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';

const FLAG_MAP: Record<string, string> = {
  "GAM":"gm","CMR":"cm","MLI":"ml","SEN":"sn","BDI":"bi","NGA":"ng","GHA":"gh","CIV":"ci","ENG":"gb-eng",
  "Senegal":"sn","Cameroon":"cm","Mali":"ml","Burundi":"bi","Nigeria":"ng","The Gambia":"gm","Ghana":"gh","England":"gb-eng"
};

// ─── Mock data (all provisional — pre-meeting draft) ──────────────────────────
interface VPlayer {
  id: string; name: string; pos: string; country: string;
  highlights: boolean; fullMatch: boolean; raisedH: boolean; raisedF: boolean;
  lastH: string; lastF: string; requestedBy: string;
}
const VIDEO_PLAYERS: VPlayer[] = [
  { id:'v1',  name:'Kofi Mensah',    pos:'ST',  country:'GHA', highlights:true,  fullMatch:false, raisedH:false, raisedF:true,  lastH:'Jul 20', lastF:'—',      requestedBy:'Tom (Lead)' },
  { id:'v2',  name:'David Conteh',   pos:'LW',  country:'SEN', highlights:false, fullMatch:false, raisedH:true,  raisedF:true,  lastH:'—',      lastF:'—',      requestedBy:'Tom (Lead)' },
  { id:'v3',  name:'Amadou Sarr',    pos:'CDM', country:'SEN', highlights:true,  fullMatch:true,  raisedH:false, raisedF:false, lastH:'Jul 18', lastF:'Jul 12', requestedBy:'—' },
  { id:'v4',  name:'Kazungu Nesta',  pos:'CM',  country:'NGA', highlights:false, fullMatch:true,  raisedH:true,  raisedF:false, lastH:'—',      lastF:'Jul 09', requestedBy:'Tom (Lead)' },
  { id:'v5',  name:'Ibrahim Diallo', pos:'RW',  country:'MLI', highlights:true,  fullMatch:true,  raisedH:false, raisedF:false, lastH:'Jul 22', lastF:'Jul 15', requestedBy:'—' },
  { id:'v6',  name:'Francis Gomez',  pos:'RW',  country:'GAM', highlights:false, fullMatch:false, raisedH:true,  raisedF:false, lastH:'—',      lastF:'—',      requestedBy:'Nene (Head)' },
  { id:'v7',  name:'Abdul Moro',     pos:'DM',  country:'GHA', highlights:true,  fullMatch:false, raisedH:false, raisedF:true,  lastH:'Jul 11', lastF:'—',      requestedBy:'Tom (Lead)' },
  { id:'v8',  name:'Cheikh Diop',    pos:'CB',  country:'SEN', highlights:true,  fullMatch:true,  raisedH:false, raisedF:false, lastH:'Jul 08', lastF:'Jul 02', requestedBy:'—' },
  { id:'v9',  name:'Musa Kamara',    pos:'ST',  country:'CIV', highlights:false, fullMatch:true,  raisedH:true,  raisedF:false, lastH:'—',      lastF:'Jul 06', requestedBy:'Tom (Lead)' },
  { id:'v10', name:'Yaw Boateng',    pos:'AM',  country:'GHA', highlights:true,  fullMatch:false, raisedH:false, raisedF:true,  lastH:'Jul 19', lastF:'—',      requestedBy:'Nene (Head)' },
  { id:'v11', name:'Emmanuel Adjei',  pos:'LB', country:'GHA', highlights:true,  fullMatch:true,  raisedH:false, raisedF:false, lastH:'Jul 05', lastF:'Jun 28', requestedBy:'—' },
  { id:'v12', name:'Lamine Cissé',    pos:'GK', country:'SEN', highlights:false, fullMatch:false, raisedH:false, raisedF:false, lastH:'—',      lastF:'—',      requestedBy:'—' },
  { id:'v13', name:'Prince Owusu',    pos:'RB', country:'GHA', highlights:true,  fullMatch:true,  raisedH:false, raisedF:false, lastH:'Jul 21', lastF:'Jul 14', requestedBy:'—' },
  { id:'v14', name:'Ousmane Bah',     pos:'CB', country:'MLI', highlights:false, fullMatch:true,  raisedH:true,  raisedF:false, lastH:'—',      lastF:'Jul 01', requestedBy:'Tom (Lead)' },
];

interface RaisedReq { id: string; player: string; pos: string; type: 'Highlights' | 'Full Match'; raisedBy: string; daysOpen: number; status: string; }
const RAISED_REQUESTS: RaisedReq[] = [
  { id:'rq1', player:'David Conteh',  pos:'LW',  type:'Full Match', raisedBy:'Tom (Lead)',  daysOpen:6, status:'Unassigned' },
  { id:'rq2', player:'Francis Gomez', pos:'RW',  type:'Highlights', raisedBy:'Nene (Head)', daysOpen:5, status:'Assigned · Kwesi' },
  { id:'rq3', player:'David Conteh',  pos:'LW',  type:'Highlights', raisedBy:'Tom (Lead)',  daysOpen:4, status:'In progress' },
  { id:'rq4', player:'Musa Kamara',   pos:'ST',  type:'Highlights', raisedBy:'Tom (Lead)',  daysOpen:3, status:'Unassigned' },
  { id:'rq5', player:'Kofi Mensah',   pos:'ST',  type:'Full Match', raisedBy:'Tom (Lead)',  daysOpen:2, status:'Assigned · Ama' },
  { id:'rq6', player:'Ousmane Bah',   pos:'CB',  type:'Highlights', raisedBy:'Tom (Lead)',  daysOpen:1, status:'Unassigned' },
];

const UPCOMING_MATCHES = [
  { id:'m1', home:'Gor Mahia',         away:'Tusker FC',      date:'Sat, 25 Jul', note:'2 pipeline players — full match needed' },
  { id:'m2', home:'AFC Leopards',      away:'Bandari FC',     date:'Sun, 26 Jul', note:'Kofi Mensah playing' },
  { id:'m3', home:'Kakamega Homeboyz', away:'Kenya Police',   date:'Wed, 29 Jul', note:'' },
];

interface TeamMember { name: string; role: 'Editor' | 'Uploader'; submitted: number; current: string; }
const TEAM: TeamMember[] = [
  { name:'Kwesi Owusu',  role:'Editor',   submitted:14, current:'Editing Francis Gomez reel' },
  { name:'Ama Serwaa',   role:'Uploader', submitted:11, current:'Uploading Gor Mahia full match' },
  { name:'Brian Otieno', role:'Editor',   submitted:9,  current:'Idle' },
  { name:'Zawadi Juma',  role:'Uploader', submitted:7,  current:'Ingesting Tusker footage' },
];

const RECENT_UPLOADS_H = [
  { player:'Ibrahim Diallo', by:'Kwesi', when:'2h ago', dur:'3:12' },
  { player:'Prince Owusu',   by:'Brian', when:'5h ago', dur:'2:48' },
  { player:'Yaw Boateng',    by:'Kwesi', when:'1d ago', dur:'4:01' },
];
const RECENT_UPLOADS_F = [
  { player:'Ibrahim Diallo', by:'Ama',    when:'4h ago', dur:'94:00' },
  { player:'Prince Owusu',   by:'Zawadi', when:'1d ago', dur:'90:00' },
  { player:'Cheikh Diop',    by:'Ama',    when:'2d ago', dur:'96:00' },
];

const total = VIDEO_PLAYERS.length;
const withH = VIDEO_PLAYERS.filter(p => p.highlights).length;
const withF = VIDEO_PLAYERS.filter(p => p.fullMatch).length;
const hCoverage = Math.round((withH / total) * 100);
const fCoverage = Math.round((withF / total) * 100);
const missingHRaised = VIDEO_PLAYERS.filter(p => p.raisedH && !p.highlights).length;
const missingFRaised = VIDEO_PLAYERS.filter(p => p.raisedF && !p.fullMatch).length;
const HIGHLIGHTS_UPLOADED = 41;
const FULL_UPLOADED = 18;

const CARD = 'bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden';

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ onNavigate }: { onNavigate: (t: VmTab) => void }) => (
  <div className="flex flex-col gap-6 pb-8">
    {/* KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard icon={Film}  heading="Missing Highlights" value={missingHRaised}
        descriptor={<>raised · {hCoverage}% covered</>} action="Review Highlights"
        onClick={() => onNavigate('highlights')} />
      <KpiCard icon={Video} heading="Missing Full Matches" value={missingFRaised}
        descriptor={<>raised · {fCoverage}% covered</>} action="Review Full Matches"
        onClick={() => onNavigate('full-matches')} />
      <KpiCard icon={Film}  heading="Highlights" value={HIGHLIGHTS_UPLOADED}
        descriptor="uploaded this week" action="View Highlights"
        onClick={() => onNavigate('highlights')} />
      <KpiCard icon={Video} heading="Full Matches" value={FULL_UPLOADED}
        descriptor="uploaded this week" action="View Full Matches"
        onClick={() => onNavigate('full-matches')} />
    </div>

    {/* Raised Requests (main) + right column */}
    <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
      {/* Raised Requests queue */}
      <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-foreground" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Raised requests</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium">Video the scouts are waiting on — oldest first</p>
          </div>
          <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2 py-0.5">{RAISED_REQUESTS.length} open</span>
        </div>
        <div className="divide-y divide-border">
          {RAISED_REQUESTS.map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[12px] shrink-0">{r.player.split(' ').map(w => w[0]).join('')}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-body font-bold text-[14px] text-foreground truncate">{r.player}</span>
                  <span className="font-body text-[11px] font-bold text-foreground">{r.pos}</span>
                  <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${r.type === 'Highlights' ? 'bg-primary/15 text-foreground' : 'bg-accent text-muted-foreground'}`}>{r.type}</span>
                </div>
                <p className="font-body text-[12px] text-muted-foreground mt-0.5">{r.raisedBy} · {r.daysOpen}d open · {r.status}</p>
              </div>
              <button className="shrink-0 inline-flex items-center gap-1 bg-transparent border border-primary text-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:bg-primary/10 transition-colors">Assign</button>
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Upcoming matches */}
        <div className={`${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Upcoming matches</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Capture opportunities</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {UPCOMING_MATCHES.map(m => (
              <button key={m.id} onClick={() => {}} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-accent transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="font-body font-bold text-[14px] text-foreground truncate">{m.home} <span className="text-muted-foreground font-medium">vs</span> {m.away}</div>
                  <p className="font-body text-[12px] text-muted-foreground mt-0.5">{m.date}{m.note ? ` · ${m.note}` : ''}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Team activity */}
        <div className={`${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Users size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Team activity</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Editors &amp; uploaders this week</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {TEAM.map(t => (
              <div key={t.name} className="px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent text-foreground flex items-center justify-center font-heading font-black text-[12px] shrink-0">{t.name.split(' ').map(w => w[0]).join('')}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-bold text-[14px] text-foreground truncate">{t.name}</span>
                    <span className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-foreground">{t.role}</span>
                  </div>
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

// ─── Coverage tab (shared by Highlights & Full Matches) ───────────────────────
const CoverageTab = ({ type }: { type: 'highlights' | 'full' }) => {
  const isH = type === 'highlights';
  const coverage = isH ? hCoverage : fCoverage;
  const has = (p: VPlayer) => (isH ? p.highlights : p.fullMatch);
  const raised = (p: VPlayer) => (isH ? p.raisedH : p.raisedF);
  const lastOf = (p: VPlayer) => (isH ? p.lastH : p.lastF);
  const pending = VIDEO_PLAYERS.filter(p => raised(p) && !has(p)).length;
  const uploaded = isH ? HIGHLIGHTS_UPLOADED : FULL_UPLOADED;
  const recent = isH ? RECENT_UPLOADS_H : RECENT_UPLOADS_F;
  // raised-and-missing first, then missing, then covered
  const sorted = [...VIDEO_PLAYERS].sort((a, b) => {
    const rank = (p: VPlayer) => (raised(p) && !has(p) ? 0 : !has(p) ? 1 : 2);
    return rank(a) - rank(b);
  });

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* stat strip */}
      <div className="grid grid-cols-3 gap-6">
        {[['Coverage', `${coverage}%`], ['Raised & pending', String(pending)], ['Uploaded this week', String(uploaded)]].map(([label, val]) => (
          <div key={label} className={`${CARD} p-5`}>
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
            <div className="font-heading font-extrabold text-[32px] text-foreground leading-none mt-2">{val}</div>
          </div>
        ))}
      </div>

      {/* coverage table */}
      <div className={CARD}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0">{isH ? <Film size={16} className="text-foreground" /> : <Video size={16} className="text-foreground" />}</div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-[16px] text-foreground">{isH ? 'Highlights' : 'Full match'} coverage</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium">Every pipeline player · raised-and-missing first</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="bg-accent/40">
                {['Player', 'Pos', 'Country', 'Status', 'Last upload', ''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-accent transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-body font-bold text-[14px] text-foreground truncate">{p.name}</span>
                      {raised(p) && !has(p) && <span className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/15 text-foreground shrink-0">RAISED</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body font-bold text-[13px] text-foreground">{p.pos}</td>
                  <td className="px-4 py-3 font-body text-[13px] text-muted-foreground">{p.country}</td>
                  <td className="px-4 py-3">
                    {has(p)
                      ? <span className="inline-flex items-center gap-1 font-body text-[12px] font-bold text-foreground"><CheckCircle size={13} className="text-primary" /> Has video</span>
                      : <span className="inline-flex items-center gap-1 font-body text-[12px] font-bold text-muted-foreground"><X size={13} /> Missing</span>}
                  </td>
                  <td className="px-4 py-3 font-body text-[13px] text-muted-foreground tabular-nums">{lastOf(p)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 bg-transparent border border-primary text-foreground px-3 py-1.5 rounded-full font-body font-bold text-[12px] hover:bg-primary/10 transition-colors">
                      {has(p) ? <><Play size={12} /> View</> : <><Upload size={12} /> Assign</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* recent uploads */}
      <div className={CARD}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Upload size={16} className="text-foreground" /></div>
          <h3 className="font-heading font-bold text-[16px] text-foreground">Recent uploads</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {recent.map((u, i) => (
            <div key={i} className="rounded-[16px] border border-border p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Play size={16} className="text-primary" /></div>
              <div className="min-w-0">
                <div className="font-body font-bold text-[14px] text-foreground truncate">{u.player}</div>
                <p className="font-body text-[12px] text-muted-foreground">{u.dur} · {u.by} · {u.when}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Analytics tab ────────────────────────────────────────────────────────────
const VmAnalyticsTab = () => {
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const hSeries = [48, 55, 61, 66, 70, hCoverage];
  const fSeries = [30, 34, 39, 45, 50, fCoverage];
  const W = 600, H = 240, mL = 34, mR = 16, mT = 16, mB = 34;
  const pL = mL, pR = W - mR, pT = mT, pB = H - mB;
  const plotW = pR - pL, plotH = pB - pT;
  const X = (i: number) => pL + (i / (months.length - 1)) * plotW;
  const Y = (v: number) => pB - (v / 100) * plotH;
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const series = [
    { label: 'Highlights %', data: hSeries, color: '#2563eb' },
    { label: 'Full Matches %', data: fSeries, color: '#E8A838' },
  ];

  const editors = [...TEAM].filter(t => t.role === 'Editor').sort((a, b) => b.submitted - a.submitted);
  const uploaders = [...TEAM].filter(t => t.role === 'Uploader').sort((a, b) => b.submitted - a.submitted);
  const maxEd = Math.max(...editors.map(e => e.submitted), 1);
  const maxUp = Math.max(...uploaders.map(u => u.submitted), 1);

  const demand = [
    { label: 'Highlights requested', v: 24, color: '#2563eb' },
    { label: 'Full matches requested', v: 15, color: '#E8A838' },
  ];
  const maxDemand = Math.max(...demand.map(d => d.v));

  const Board = ({ title, rows, max }: { title: string; rows: TeamMember[]; max: number }) => (
    <div className="flex-1 min-w-0">
      <h4 className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground mb-3">{title}</h4>
      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-black text-[12px] shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="font-body font-bold text-[13px] text-foreground truncate">{r.name}</div>
              <div className="h-2 bg-accent rounded-full overflow-hidden mt-1"><div className="h-full bg-primary rounded-full" style={{ width: `${(r.submitted / max) * 100}%` }} /></div>
            </div>
            <span className="font-heading font-black text-[14px] text-foreground tabular-nums shrink-0">{r.submitted}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Row 1: coverage over time + turnaround */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Coverage over time</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">% of pipeline players with video, monthly</p>
            </div>
          </div>
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }} preserveAspectRatio="xMidYMid meet">
              {[0, 25, 50, 75, 100].map(g => (
                <g key={g}>
                  <line x1={pL} y1={Y(g)} x2={pR} y2={Y(g)} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={pL - 6} y={Y(g) + 3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g}</text>
                </g>
              ))}
              {months.map((m, i) => (
                <text key={m} x={X(i)} y={pB + 20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{m}</text>
              ))}
              {series.map(s => (
                <g key={s.label}>
                  <path d={path(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {s.data.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r={3} fill={s.color} />)}
                </g>
              ))}
            </svg>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {series.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="font-heading font-bold text-[12px] text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Clock size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Request turnaround</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Raised → fulfilled</p>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-5">
            <div>
              <div className="font-heading font-extrabold text-[40px] text-foreground leading-none">2.8<span className="text-[18px] text-muted-foreground"> days</span></div>
              <span className="font-body text-[12px] text-muted-foreground font-medium">median this month</span>
            </div>
            <div className="flex items-center justify-between rounded-[16px] border border-border p-4">
              <span className="font-body text-[13px] font-bold text-foreground">Open &gt; 7 days</span>
              <span className="font-heading font-black text-[20px] text-foreground tabular-nums">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: leaderboard + demand */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Trophy size={16} className="text-[#E8A838]" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Team output</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Videos submitted this week</p>
            </div>
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-8">
            <Board title="Editors · highlights" rows={editors} max={maxEd} />
            <Board title="Uploaders · full matches" rows={uploaders} max={maxUp} />
          </div>
        </div>

        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Film size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Demand profile</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">What scouts are asking for</p>
            </div>
          </div>
          <div className="p-5 flex flex-col justify-center gap-5 flex-1">
            {demand.map(d => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-[13px] font-bold text-foreground">{d.label}</span>
                  <span className="font-heading font-black text-[14px] text-foreground tabular-nums">{d.v}</span>
                </div>
                <div className="h-3 bg-accent rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(d.v / maxDemand) * 100}%`, backgroundColor: d.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main shell ───────────────────────────────────────────────────────────────
export default function VideoManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  let activePage: ActivePage = 'dashboard';
  if (location.pathname === '/video-manager/players') activePage = 'players';
  if (location.pathname === '/video-manager/matches') activePage = 'matches';
  if (location.pathname === '/video-manager/admin')   activePage = 'admin';

  const [activeTab, setActiveTab] = useState<VmTab>('overview');
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // Tasks store (Lead-style, feeds the shared Tasks tab)
  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const toggleTask = (id: any) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const addTask = (input: TaskInput) => {
    const base = typeof input === 'string' ? { text: input } : input;
    setTasks(prev => [...prev, {
      id: `vt${prev.length + 1}`,
      text: base.text,
      priority: (typeof input === 'string' ? 'Low' : base.priority) || 'Low',
      dueDate: (typeof input === 'string' ? '' : base.dueDate) || 'This week',
      assignedTo: (typeof input === 'string' ? 'Me' : base.assignedTo) || 'Me',
      allocated: 'Today',
      completed: false,
    }]);
  };

  const goToPlayers = (section: 'short-list' | 'target') => navigate(`/video-manager/players?section=${section}`);

  const tabs: { id: VmTab; label: string }[] = [
    { id: 'overview',     label: 'Overview'     },
    { id: 'highlights',   label: 'Highlights'   },
    { id: 'full-matches', label: 'Full Matches' },
    { id: 'analytics',    label: 'Analytics'    },
    { id: 'tasks',        label: 'Tasks'        },
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
          unreadCount={0}
          notifOpen={showNotif}
          onNotifToggle={() => setShowNotif(p => !p)}
          notifPanel={(
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-[24px] shadow-2xl border border-border z-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary rounded-t-[24px]">
                <span className="font-heading font-black text-[14px] text-white">Notifications</span>
                <button onClick={() => setShowNotif(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
              </div>
              <div className="px-5 py-8 text-center font-body text-[13px] text-muted-foreground">You're all caught up.</div>
            </div>
          )}
          onAddPlayer={() => setShowAddPlayer(true)}
          avatarImg={avatar}
          profileOpen={showProfile}
          onProfileToggle={() => setShowProfile(p => !p)}
          profileMenu={(
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">Marcus</div>
                  <div className="font-body text-[12px] text-muted-foreground font-medium">Video Manager</div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => setShowProfile(false)} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors">
                  <LogOut size={16} className="mr-3" />Log out
                </button>
              </div>
            </div>
          )}
        />

        <div className="flex-1 px-[var(--pad-page)] pb-20 md:pb-12">
          {activePage === 'players' && (
            <SeniorLeadPlayersPage allPlayersData={[]} loggedInRole="Video Manager" flagMap={FLAG_MAP} />
          )}
          {activePage === 'matches' && <MatchesView />}
          {activePage === 'admin' && <AdminView />}

          {activePage === 'dashboard' && (
            <>
              <div className="pt-6 mb-3">
                <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                    <Video size={26} className="text-chalk" />
                  </span>
                  Marcus
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">Every player, a video for the scouts 🎬</p>
              </div>

              <ResponsiveTabs className="mt-4 mb-6" tabs={tabs} activeId={activeTab} onSelect={(id) => setActiveTab(id as VmTab)} />

              {activeTab === 'overview'     && <OverviewTab onNavigate={setActiveTab} />}
              {activeTab === 'highlights'   && <CoverageTab type="highlights" />}
              {activeTab === 'full-matches' && <CoverageTab type="full" />}
              {activeTab === 'analytics'    && <VmAnalyticsTab />}
              {activeTab === 'tasks'        && <TasksTab tasks={tasks} onToggle={toggleTask} onAdd={addTask} />}
            </>
          )}
        </div>
      </main>

      {/* Add Player modal (mock, mirrors the other dashboards) */}
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
                <input autoFocus type="text" placeholder="e.g. Kofi Mensah"
                  className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Team</label>
                  <input type="text" placeholder="Club"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
                  <input type="text" placeholder="e.g. ST"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
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
