import React, { useState, useMemo } from 'react';
import {
  Search, Calendar, Plus, Bell, X, FileText,
  Video, TrendingUp, Target, CheckCircle, Clock,
  Eye, EyeOff, Star, Crosshair, Zap, ArrowRight,
  MoreVertical, Edit2, Trash2, LogOut,
  Radio, Play, Check, Trophy, Medal, Download, User, RefreshCw,
  Phone, Route, Users, Film, ChevronDown, Crown, Smile
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { SeniorLeadPlayersPage, HIGHLIGHTS_FEED } from '../components/SeniorLeadPlayersPage';
import { PlayerVideoWorkspace } from '../components/PlayerVideoWorkspace';
import { EditFormBlueprintModal } from '../components/EditFormBlueprintModal';
import { TopNav } from '../components/TopNav';
import { ResponsiveTabs } from '../components/ResponsiveTabs';
import { MatchesView } from './MatchesView';
import { AdminView } from './AdminView';
import { Task, MOCK_TASKS } from '../components/dashboard/shared';
import { KpiCard } from '../components/dashboard/KpiCard';
import { TasksTab } from '../components/dashboard/TasksTab';
import { ReportsTab } from '../components/dashboard/ReportsTab';
import { AnalyticsTab } from '../components/dashboard/AnalyticsTab';

type LeadTab = 'overview' | 'pipeline' | 'reports' | 'analytics' | 'target';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';

interface SignedPlayer {
  id: string; name: string; position: string;
  birthYear: number; yearSigned: number; grade: string; color: string;
}
interface GradeColorMap { [grade: string]: string; }
interface Pkg {
  id: string; playerName: string; initials: string; scout: string;
  list: 'short' | 'target'; clipCount: number; watched: boolean; uploadDate: string;
}
interface MatchItem { id: string; home: string; away: string; date: string; }
interface ResultItem { id: string; home: string; away: string; date: string; hs: number; as: number; }
interface AppNotif {
  id: string; text: string; time: string; read: boolean;
  type: 'task' | 'report' | 'nudge' | 'package';
}

const POSITIONS = ['ST','RW','LW','AM','CM','DM','RB','LB','RCB','LCB','GK'];

const INITIAL_SIGNED: SignedPlayer[] = [
  { id:'s1',  name:'Yamirou Ouorou',    position:'LW',  birthYear:2006, yearSigned:2024, grade:'A',  color:'#E8A838' },
  { id:'s2',  name:'Abdul Moro',        position:'DM',  birthYear:2008, yearSigned:2024, grade:'A+', color:'#061b2e' },
  { id:'s3',  name:'Tape Christ',       position:'LB',  birthYear:2006, yearSigned:2024, grade:'A+', color:'#061b2e' },
  { id:'s4',  name:'Seyi Ogunniyi',     position:'RB',  birthYear:2007, yearSigned:2025, grade:'A',  color:'#E8A838' },
  { id:'s5',  name:'Abdoulaye Gouba',   position:'CM',  birthYear:2007, yearSigned:2025, grade:'A+', color:'#061b2e' },
  { id:'s6',  name:'Ismaila Ceesay',    position:'RW',  birthYear:2008, yearSigned:2026, grade:'A',  color:'#E8A838' },
  { id:'s7',  name:'Kingsley Bimpong',  position:'LW',  birthYear:2007, yearSigned:2026, grade:'A',  color:'#E8A838' },
  { id:'s8',  name:'Arnold Adu',        position:'AM',  birthYear:2008, yearSigned:2026, grade:'A',  color:'#E8A838' },
  { id:'s9',  name:'Alhassan Dedenka',  position:'DM',  birthYear:2008, yearSigned:2026, grade:'A',  color:'#E8A838' },
  { id:'s10', name:'Francis Gomez',     position:'RW',  birthYear:2009, yearSigned:2028, grade:'A+', color:'#061b2e' },
  { id:'s11', name:'Joseph Narbi',      position:'LW',  birthYear:2009, yearSigned:2028, grade:'A',  color:'#E8A838' },
  { id:'s12', name:'Richmondson Ansah', position:'CM',  birthYear:2011, yearSigned:2029, grade:'A+', color:'#061b2e' },
  { id:'s13', name:'Emilio Sadio',      position:'DM',  birthYear:2010, yearSigned:2029, grade:'A+', color:'#061b2e' },
];

const DEFAULT_GRADE_COLORS: GradeColorMap = {
  'A+':'#061b2e','A':'#E8A838','B+':'#061b2e','B':'#7baac7','C+':'#b8d4ef','C':'#d2e7fa',
};

const MOCK_PKGS: Pkg[] = [
  { id:'p1', playerName:'Kofi Mensah',   initials:'KM', scout:'David', list:'target', clipCount:8,  watched:false, uploadDate:'2 days ago' },
  { id:'p2', playerName:'David Conteh',  initials:'DC', scout:'David', list:'target', clipCount:6,  watched:true,  uploadDate:'3 days ago' },
  { id:'p3', playerName:'Kazungu Nesta', initials:'KN', scout:'David', list:'short',  clipCount:9,  watched:false, uploadDate:'5 days ago' },
  { id:'p4', playerName:'Amadou Sarr',   initials:'AS', scout:'Tom',   list:'short',  clipCount:12, watched:true,  uploadDate:'1 week ago' },
  { id:'p5', playerName:'Cheikh Diop',   initials:'CD', scout:'Tom',   list:'short',  clipCount:5,  watched:true,  uploadDate:'2 weeks ago' },
];

const UPCOMING_MATCHES: MatchItem[] = [
  { id:'u1', home:'Gor Mahia',        away:'Tusker FC',        date:'Sat, 25 Jul' },
  { id:'u2', home:'AFC Leopards',     away:'Bandari FC',       date:'Sun, 26 Jul' },
  { id:'u3', home:'Kakamega Homeboyz', away:'Kenya Police FC', date:'Wed, 29 Jul' },
];
const RECENT_RESULTS: ResultItem[] = [
  { id:'r1', home:'Gor Mahia',    away:'Tusker FC',    date:'Sat, 12 Jul', hs:2, as:1 },
  { id:'r2', home:'KCB FC',       away:'AFC Leopards', date:'Sun, 13 Jul', hs:0, as:0 },
  { id:'r3', home:'Ulinzi Stars', away:'Bandari FC',   date:'Wed, 9 Jul',  hs:1, as:3 },
];

const INITIAL_NOTIFS: AppNotif[] = [
  { id:'n1', text:'David uploaded Kofi Mensah package', time:'1h ago',    read:false, type:'package' },
  { id:'n2', text:'New report filed on David Conteh',   time:'3h ago',    read:false, type:'report'  },
  { id:'n3', text:"Wekesa O. hasn't submitted Top 10",  time:'Yesterday', read:true,  type:'nudge'   },
];

// ─── Grade Colour Panel ───────────────────────────────────────────────────────
const GradeColorPanel = ({ colors, onUpdate, onClose }: { colors: GradeColorMap; onUpdate: (g: string, c: string) => void; onClose: () => void }) => (
  <div className="absolute right-0 top-12 z-50 bg-card rounded-[20px] shadow-2xl border border-border p-6 w-64" onClick={e => e.stopPropagation()}>
    <div className="flex items-center justify-between mb-4">
      <span className="font-heading font-black text-[14px] text-foreground">Grade Colours</span>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
    </div>
    <div className="space-y-3">
      {Object.entries(colors).map(([grade, color]) => (
        <div key={grade} className="flex items-center justify-between">
          <span className="font-body font-bold text-[14px] text-foreground w-8">{grade}</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: color }} />
            <input type="color" value={color} onChange={e => onUpdate(grade, e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
          </div>
        </div>
      ))}
    </div>
    <p className="font-body text-[12px] text-muted-foreground font-medium mt-4">Changes apply immediately to all badges</p>
  </div>
);

// ─── Add Signed Player Modal ──────────────────────────────────────────────────
const AddSignedModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Omit<SignedPlayer,'id'|'color'>) => void }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('ST');
  const [birthYear, setBirthYear] = useState(2008);
  const [yearSigned, setYearSigned] = useState(new Date().getFullYear());
  const [grade, setGrade] = useState('A');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 bg-primary rounded-t-[16px] flex items-center justify-between">
          <div>
            <span className="font-heading font-semibold text-[16px] text-white">Add Signed Player</span>
            <p className="font-body text-[12px] text-white/50 mt-1">Record a player officially signed</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
        </div>
        <div className="p-8 space-y-4">
          <div>
            <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Player Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kofi Mensah"
              className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
              <select value={position} onChange={e => setPosition(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Grade</label>
              <div className="flex gap-2 flex-wrap">
                {['A+','A','B+','B'].map(g => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`px-3 py-2 rounded-full font-body text-[12px] font-black border transition-all ${grade===g?'bg-primary text-primary-foreground border-primary':'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>{g}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Birth Year</label>
              <input type="number" value={birthYear} onChange={e => setBirthYear(Number(e.target.value))} min={2000} max={2015}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
            </div>
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Year Signed</label>
              <input type="number" value={yearSigned} onChange={e => setYearSigned(Number(e.target.value))} min={2020} max={2035}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
            </div>
          </div>
          <button onClick={() => { if (name.trim()) { onAdd({ name, position, birthYear, yearSigned, grade }); onClose(); } }} disabled={!name.trim()}
            className="w-full bg-primary border-2 border-primary text-white rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2">
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Report Modal — 6-Step Flow ─────────────────────────────────────────
// ─── Add Report Modal — New 6-Step Flow ───────────────────────────────────────
// Step 1: Player + Date
// Step 2: Full or Short report
// Step 3: Source type — Live / Full Match Video / Highlight
// Step 4: Select or add the specific match/highlight/video
// Step 5a (Short): Performance note + PLR, POG, NXT
// Step 5b (Full): Choose template → fill report
// Step 6: Review + Submit
const AddReportModal = ({ onClose, scoutName = 'Tom' }: { onClose: () => void; scoutName?: string }) => {
  const TOTAL_STEPS = 6;
  type StepNum = 1|2|3|4|5|6;
  const [step, setStep] = useState<StepNum>(1);

  // ── Step 1 ──
  const [playerSearch, setPlayerSearch]   = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [scoutingDate, setScoutingDate]   = useState('');
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [newPos, setNewPos]               = useState('ST');
  const [newAge, setNewAge]               = useState('');
  const MOCK_PLAYERS = ['Kofi Mensah','David Conteh','Kazungu Nesta','Amadou Sarr','Cheikh Diop','Francis Gomez','Abdul Moro'];
  const searchResults = playerSearch.length > 1
    ? MOCK_PLAYERS.filter(p => p.toLowerCase().includes(playerSearch.toLowerCase()))
    : [];

  // ── Step 2 ──
  type ReportLength = 'short'|'full'|'';
  const [reportLength, setReportLength] = useState<ReportLength>('');

  // ── Step 3 ──
  type SourceType = 'live'|'full-video'|'highlight'|'';
  const [sourceType, setSourceType] = useState<SourceType>('');

  // ── Step 4 ──
  const MOCK_FULL_MATCHES = [
    { id:'fm1', label:'Enyimba vs Kano Pillars — Dec 16 (NPFL)' },
    { id:'fm2', label:'Hawks FC vs Fauve Azur — Dec 18 (Liga Rev.)' },
    { id:'fm3', label:'Imperial FC vs ATS — Dec 21 (CAF U20)' },
  ];
  const MOCK_HIGHLIGHTS = [
    { id:'hl1', label:'Kofi Mensah — Dec 2024 highlights (5 clips)' },
    { id:'hl2', label:'Amadou Sarr — Nov 2024 package (8 clips)' },
    { id:'hl3', label:'Mixed forward highlights — Dec 2024' },
  ];
  const MOCK_LIVE = [
    { id:'lv1', label:'Enyimba vs Kano Pillars — Dec 16 (Live)' },
    { id:'lv2', label:'Hawks FC vs Fauve Azur — Dec 18 (Live)' },
  ];
  const [selectedSource, setSelectedSource] = useState('');
  const [addingManually, setAddingManually] = useState(false);
  const [manualHome, setManualHome]     = useState('');
  const [manualAway, setManualAway]     = useState('');
  const [manualComp, setManualComp]     = useState('');
  const [manualDate, setManualDate]     = useState('');
  const [manualTitle, setManualTitle]   = useState('');

  // ── Step 5 ──
  const GRADES   = ['C','B','A','A+'];
  const NXT_VALS = ['T','M','D'];
  const TEMPLATES = ['Standard Scout','Performance Report','Goalkeeping','Set Piece','Injury Return','U17 Development','Loan Review','Custom (Blank)'];
  const [plr, setPlr]               = useState('B');
  const [pog, setPog]               = useState('B');
  const [nxt, setNxt]               = useState('T');
  const [perfNote, setPerfNote]     = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fullNotes, setFullNotes]   = useState('');

  // ── Source options by type ──
  const sourceOptions = sourceType === 'full-video' ? MOCK_FULL_MATCHES
    : sourceType === 'highlight' ? MOCK_HIGHLIGHTS
    : sourceType === 'live'      ? MOCK_LIVE : [];

  const sourceLabel = sourceType === 'full-video' ? 'Full Match Video'
    : sourceType === 'highlight' ? 'Highlight / Package'
    : sourceType === 'live'      ? 'Live Match' : '';

  const selectedSourceLabel = sourceOptions.find(s => s.id === selectedSource)?.label
    || (addingManually ? (sourceType === 'live' || sourceType === 'full-video'
        ? `${manualHome} vs ${manualAway}` : manualTitle) : '');

  const canContinue = (): boolean => {
    if (step === 1) return !!selectedPlayer && !!scoutingDate;
    if (step === 2) return !!reportLength;
    if (step === 3) return !!sourceType;
    if (step === 4) return !!selectedSource || (addingManually && (
      sourceType === 'highlight' ? !!manualTitle : !!manualHome && !!manualAway
    ));
    if (step === 5) return reportLength === 'short' ? perfNote.length > 0 : !!selectedTemplate && fullNotes.length > 0;
    return true;
  };

  const GradeBtn = ({ g, val, set }: { g: string; val: string; set: (v:string)=>void }) => (
    <button onClick={() => set(g)}
      className={`px-3 py-2 rounded-full font-body text-[12px] font-black transition-all border ${
        val === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'
      }`}>{g}</button>
  );

  const OptionCard = ({ id, label, selected, onClick, icon }: {
    id: string; label: string; selected: boolean; onClick: ()=>void; icon?: React.ReactNode;
  }) => (
    <button onClick={onClick}
      className={`w-full px-4 py-3 rounded-[20px] text-left font-body font-bold text-[14px] transition-all border flex items-center gap-3 ${
        selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary/50'
      }`}>
      {icon && <span className={selected ? 'text-white' : 'text-foreground'}>{icon}</span>}
      {label}
    </button>
  );

  const inputCls = 'w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:border-ring transition-all';
  const labelCls = 'font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2';

  // ── Step titles ──
  const STEP_TITLES: Record<StepNum, string> = {
    1: 'Player & Date',
    2: 'Report Type',
    3: 'Source',
    4: `Select ${sourceLabel || 'Source'}`,
    5: reportLength === 'short' ? 'Quick Entry' : 'Fill Report',
    6: 'Review & Submit',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-lg border border-border max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-8 py-5 bg-primary rounded-t-[16px] flex items-center justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <span className="font-heading font-semibold text-[16px] text-white">Add Scouting Report</span>
            <div className="flex items-center gap-2 mt-2">
              {Array.from({length: TOTAL_STEPS}).map((_,i) => (
                <div key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-card' : 'bg-card/20'}`}
                  style={{width: i < step ? 24 : 12}} />
              ))}
              <span className="font-body text-[12px] text-white/40 ml-1">Step {step} of {TOTAL_STEPS}</span>
            </div>
            <p className="font-body text-[12px] text-white/50 mt-1 truncate">{STEP_TITLES[step]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white ml-4 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">

          {/* ══ STEP 1: Player + Date ══ */}
          {step === 1 && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Find Player & Set Date</h3>
              <div>
                <label className={labelCls}>Search Player</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={playerSearch}
                    onChange={e => { setPlayerSearch(e.target.value); setSelectedPlayer(''); setShowNewPlayer(false); }}
                    placeholder="Type player name..."
                    className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
                {/* Search results */}
                {searchResults.length > 0 && !selectedPlayer && (
                  <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                    {searchResults.map(p => (
                      <button key={p} onClick={() => { setSelectedPlayer(p); setPlayerSearch(p); setShowNewPlayer(false); }}
                        className="w-full text-left px-4 py-3 font-body text-[14px] font-bold border-b border-border last:border-0 transition-colors text-foreground hover:bg-accent">
                        {p}
                      </button>
                    ))}
                  </div>
                )}
                {/* Selected confirmation */}
                {selectedPlayer && (
                  <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
                    <Check size={14} className="text-foreground shrink-0" />
                    <span className="font-body font-bold text-[14px] text-foreground">{selectedPlayer}</span>
                  </div>
                )}
                {/* Not found */}
                {playerSearch.length > 2 && searchResults.length === 0 && !selectedPlayer && !showNewPlayer && (
                  <div className="mt-3 p-4 bg-card rounded-xl border border-border">
                    <p className="font-body text-[14px] font-bold text-muted-foreground mb-3">Player not found in database.</p>
                    <button onClick={() => setShowNewPlayer(true)}
                      className="w-full bg-primary text-primary-foreground rounded-full py-2 font-body font-black text-[14px] hover:bg-primary/80 transition-colors">
                      + Create New Player
                    </button>
                  </div>
                )}
                {/* New player form */}
                {showNewPlayer && (
                  <div className="mt-3 p-4 bg-card rounded-xl border border-border space-y-3">
                    <p className="font-heading font-black text-[14px] text-foreground">New Player Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Position</label>
                        <select value={newPos} onChange={e => setNewPos(e.target.value)} className={inputCls + ' appearance-none'}>
                          {['ST','LW','RW','CM','CDM','CAM','FB','CB'].map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Age</label>
                        <input type="number" placeholder="18" value={newAge} onChange={e => setNewAge(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <button onClick={() => { setSelectedPlayer(playerSearch); setShowNewPlayer(false); }}
                      className="w-full bg-primary text-primary-foreground rounded-full py-2 font-body font-black text-[14px] hover:bg-primary/80 transition-colors">
                      Create & Select
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Scout</label>
                  <div className="bg-accent border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground">{scoutName}</div>
                </div>
                <div>
                  <label className={labelCls}>Scouting Date</label>
                  <input type="date" value={scoutingDate} onChange={e => setScoutingDate(e.target.value)}
                    className={inputCls + ' py-2'} />
                </div>
              </div>
            </>
          )}

          {/* ══ STEP 2: Full or Short ══ */}
          {step === 2 && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Report Type</h3>
              <p className="font-body text-[14px] text-muted-foreground font-medium">For: <span className="text-foreground font-bold">{selectedPlayer}</span> · {scoutingDate}</p>
              <div className="space-y-3 pt-1">
                <button onClick={() => setReportLength('full')}
                  className={`w-full px-5 py-4 rounded-[20px] text-left transition-all border ${
                    reportLength === 'full' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}>
                  <div className="font-heading font-black text-[14px]">Full Report</div>
                  <div className={`font-body text-[12px] mt-0.5 ${reportLength === 'full' ? 'text-white/60' : 'text-muted-foreground'}`}>
                    Detailed scouting report using a template. Includes structured sections and performance analysis.
                  </div>
                </button>
                <button onClick={() => setReportLength('short')}
                  className={`w-full px-5 py-4 rounded-[20px] text-left transition-all border ${
                    reportLength === 'short' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}>
                  <div className="font-heading font-black text-[14px]">Short Report</div>
                  <div className={`font-body text-[12px] mt-0.5 ${reportLength === 'short' ? 'text-white/60' : 'text-muted-foreground'}`}>
                    Quick entry. One performance note and PLR, POG, NXT grades. Fast and efficient.
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 3: Source Type ══ */}
          {step === 3 && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Source</h3>
              <p className="font-body text-[14px] text-muted-foreground font-medium">How did you observe this player?</p>
              <div className="space-y-3 pt-1">
                <OptionCard id="live" label="Live Match" selected={sourceType === 'live'}
                  onClick={() => { setSourceType('live'); setSelectedSource(''); setAddingManually(false); }}
                  icon={<Radio size={16} />} />
                <OptionCard id="full-video" label="Full Match Video" selected={sourceType === 'full-video'}
                  onClick={() => { setSourceType('full-video'); setSelectedSource(''); setAddingManually(false); }}
                  icon={<Video size={16} />} />
                <OptionCard id="highlight" label="Highlight / Package" selected={sourceType === 'highlight'}
                  onClick={() => { setSourceType('highlight'); setSelectedSource(''); setAddingManually(false); }}
                  icon={<Play size={16} />} />
              </div>
            </>
          )}

          {/* ══ STEP 4: Select Source ══ */}
          {step === 4 && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Select {sourceLabel}</h3>
              <p className="font-body text-[14px] text-muted-foreground font-medium">Choose from platform or add manually</p>
              <div className="space-y-2">
                {sourceOptions.map(s => (
                  <OptionCard key={s.id} id={s.id} label={s.label}
                    selected={selectedSource === s.id && !addingManually}
                    onClick={() => { setSelectedSource(s.id); setAddingManually(false); }} />
                ))}
                <button onClick={() => { setAddingManually(true); setSelectedSource(''); }}
                  className={`w-full px-4 py-3 rounded-[20px] text-left font-body font-bold text-[14px] transition-all border flex items-center gap-2 ${
                    addingManually ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-dashed border-border hover:border-primary/50'
                  }`}>
                  <Plus size={14} /> Not on platform — add manually
                </button>
              </div>
              {/* Manual entry form */}
              {addingManually && (
                <div className="mt-2 p-4 bg-card border border-border rounded-[20px] space-y-3">
                  {sourceType === 'highlight' ? (
                    <div>
                      <label className={labelCls}>Highlight / Package Title</label>
                      <input type="text" value={manualTitle} onChange={e => setManualTitle(e.target.value)}
                        placeholder="e.g. Kofi Mensah — Dec 2024 highlights" className={inputCls} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Home Team</label>
                        <input type="text" value={manualHome} onChange={e => setManualHome(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Away Team</label>
                        <input type="text" value={manualAway} onChange={e => setManualAway(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Competition</label>
                        <input type="text" value={manualComp} onChange={e => setManualComp(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Date</label>
                        <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ══ STEP 5a: Short Report ══ */}
          {step === 5 && reportLength === 'short' && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Quick Entry</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">
                {selectedPlayer} · {sourceLabel}: <span className="text-foreground font-bold">{selectedSourceLabel}</span>
              </p>
              <div>
                <label className={labelCls}>Performance Note</label>
                <textarea value={perfNote} onChange={e => setPerfNote(e.target.value)} rows={4}
                  placeholder="Quick observation — key moments, standout qualities, concerns..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {([['PLR', plr, setPlr, GRADES],['POG', pog, setPog, GRADES],['NXT', nxt, setNxt, NXT_VALS]] as [string,string,(v:string)=>void,string[]][]).map(([label, val, set, opts]) => (
                  <div key={label}>
                    <label className={labelCls}>{label}</label>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {opts.map(g => <GradeBtn key={g} g={g} val={val} set={set} />)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ STEP 5b: Full Report ══ */}
          {step === 5 && reportLength === 'full' && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Fill Report</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">
                {selectedPlayer} · {sourceLabel}: <span className="text-foreground font-bold">{selectedSourceLabel}</span>
              </p>
              {/* Template selection */}
              {!selectedTemplate ? (
                <>
                  <label className={labelCls}>Choose Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t} onClick={() => setSelectedTemplate(t)}
                        className="px-4 py-3 rounded-[14px] text-left font-body font-bold text-[12px] transition-all border bg-card text-foreground border-border hover:border-primary hover:bg-accent">
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground">Template</span>
                    <span className="font-body font-bold text-[14px] text-foreground">{selectedTemplate}</span>
                    <button onClick={() => setSelectedTemplate('')} className="ml-auto text-[12px] font-bold text-muted-foreground underline hover:text-foreground">Change</button>
                  </div>
                  <div>
                    <label className={labelCls}>Performance Notes</label>
                    <textarea value={fullNotes} onChange={e => setFullNotes(e.target.value)} rows={6}
                      placeholder="Describe the player's performance, key moments, strengths and areas to develop..."
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 font-body text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {([['PLR', plr, setPlr, GRADES],['POG', pog, setPog, GRADES],['NXT', nxt, setNxt, NXT_VALS]] as [string,string,(v:string)=>void,string[]][]).map(([label, val, set, opts]) => (
                      <div key={label}>
                        <label className={labelCls}>{label}</label>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {opts.map(g => <GradeBtn key={g} g={g} val={val} set={set} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ STEP 6: Review & Submit ══ */}
          {step === 6 && (
            <>
              <h3 className="font-heading font-semibold text-[16px] text-foreground">Review & Submit</h3>
              <div className="bg-card rounded-[20px] border border-border overflow-hidden">
                {[
                  ['Player',       selectedPlayer],
                  ['Scout',        scoutName],
                  ['Date',         scoutingDate],
                  ['Report Type',  reportLength === 'short' ? 'Short Report' : 'Full Report'],
                  ['Source',       sourceLabel],
                  ['Match / Video', selectedSourceLabel],
                  ['PLR / POG / NXT', `${plr} / ${pog} / ${nxt}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
                    <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground">{label}</span>
                    <span className="font-body font-bold text-[14px] text-foreground text-right max-w-[55%]">{val || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-[20px] border border-border p-4">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                  {reportLength === 'full' && selectedTemplate ? selectedTemplate + ' — ' : ''}Notes
                </span>
                <p className="font-body text-[14px] font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                  {reportLength === 'short' ? perfNote : fullNotes}
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-5 border-t border-border flex items-center justify-between shrink-0 bg-card rounded-b-[32px]">
          {step > 1
            ? <button onClick={() => setStep(s => (s - 1) as StepNum)}
                className="px-6 py-2 border-2 border-border text-muted-foreground rounded-full font-body font-bold text-[14px] hover:border-primary transition-colors">
                ← Back
              </button>
            : <div />}
          {step < TOTAL_STEPS
            ? <button onClick={() => { if (canContinue()) setStep(s => (s + 1) as StepNum); }}
                disabled={!canContinue()}
                className="px-8 py-2 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0d2a45]">
                Continue →
              </button>
            : <button onClick={onClose}
                className="px-8 py-2 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] hover:bg-[#0d2a45] transition-colors">
                Submit Report ✓
              </button>}
        </div>
      </div>
    </div>
  );
};


const LEAD_SIGNED_DATA: SignedPipelinePlayer[] = [
  { id:'ls10', name:'Moussa Diarra',   pos:'ST',  birthYear:2004, yearSigned:2022, grade:'A'  },
  { id:'ls11', name:'Kwame Mensah',    pos:'RCB', birthYear:2004, yearSigned:2022, grade:'A+' },
  { id:'ls12', name:'Ibrahim Touré',   pos:'CM',  birthYear:2005, yearSigned:2023, grade:'A'  },
  { id:'ls13', name:'Samuel Osei',     pos:'GK',  birthYear:2005, yearSigned:2023, grade:'B+' },
  { id:'ls1',  name:'Yamirou Ouorou',  pos:'LW',  birthYear:2006, yearSigned:2024, grade:'A'  },
  { id:'ls2',  name:'Abdul Moro',      pos:'DM',  birthYear:2008, yearSigned:2024, grade:'A+' },
  { id:'ls3',  name:'Tape Christ',     pos:'LB',  birthYear:2006, yearSigned:2024, grade:'A+' },
  { id:'ls4',  name:'Seyi Ogunniyi',   pos:'RB',  birthYear:2007, yearSigned:2025, grade:'A'  },
  { id:'ls5',  name:'Abdoulaye Gouba', pos:'CM',  birthYear:2007, yearSigned:2025, grade:'A+' },
  { id:'ls6',  name:'Ismaila Ceesay',  pos:'RW',  birthYear:2008, yearSigned:2026, grade:'A'  },
  { id:'ls7',  name:'Kingsley Bimpong', pos:'LW', birthYear:2007, yearSigned:2026, grade:'A'  },
  { id:'ls8',  name:'Arnold Adu',      pos:'AM',  birthYear:2008, yearSigned:2026, grade:'A'  },
  { id:'ls9',  name:'Francis Gomez',   pos:'RW',  birthYear:2009, yearSigned:2026, grade:'A+' },
];
const SIGNED_YEARS = [2022, 2023, 2024, 2025, 2026];
const LEAD_POSITIONS = ['ST','RW','LW','AM','CM','DM','RB','LB','RCB','LCB','GK'];
const LEAD_GRADE_BG: Record<string,string> = { 'A+':'#061b2e','A':'#E8A838','B+':'#061b2e','B':'#7baac7' };

const PipelineTab = () => {
  const [signedPlayers, setSignedPlayers] = React.useState<SignedPipelinePlayer[]>(LEAD_SIGNED_DATA);
  const [showAddSigned, setShowAddSigned] = React.useState(false);
  const [newSigned, setNewSigned] = React.useState<Partial<SignedPipelinePlayer>>({});
  const [hoveredStage, setHoveredStage] = React.useState<number | null>(null);
  const navigate = useNavigate();

  const getSignedAt = (pos: string, year: number) =>
    signedPlayers.filter(p => p.pos === pos && p.yearSigned === year);

  const funnelStages = [
    { label: 'Database',    count: 60,                   color: '#b8d4ef',          path: '/lead-scout/players' },
    { label: 'Long List',   count: 28,                   color: '#E8A838',          path: '/lead-scout/players' },
    { label: 'Short List',  count: 14,                   color: '#7baac7',          path: '/lead-scout/players' },
    { label: 'Target List', count: 6,                    color: '#061b2e',          path: '/lead-scout/players' },
    { label: 'Signed',      count: signedPlayers.length, color: 'var(--scout-green)', path: '/lead-scout/players' },
  ];
  // Donut geometry — r=15.915 gives circumference 100, so dash values ARE percentages.
  const donutTotal = funnelStages.reduce((a, s) => a + s.count, 0) || 1;
  let donutAcc = 0;
  const donutSegments = funnelStages.map(s => {
    const pct = (s.count / donutTotal) * 100;
    const seg = { color: s.color, pct, offset: 25 - donutAcc };
    donutAcc += pct;
    return seg;
  });

  const handleAddSigned = () => {
    if (!newSigned.name) return;
    setSignedPlayers(prev => [...prev, {
      id: `ls${Date.now()}`, name: newSigned.name!, pos: newSigned.pos || 'ST',
      birthYear: newSigned.birthYear || 2008, yearSigned: newSigned.yearSigned || new Date().getFullYear(),
      grade: newSigned.grade || 'A',
    }]);
    setShowAddSigned(false);
    setNewSigned({});
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] portrait-tablet:grid-cols-1 gap-4 lg:items-stretch portrait-tablet:items-stretch">

      {/* ── Pipeline Overview: donut (top) + stage legend (below) ── */}
      <div className="bg-card rounded-[20px] border border-border p-6 shadow-[var(--shadow-lg)] flex flex-col">
        <div className="mb-5 shrink-0">
          <h3 className="font-heading font-bold text-[20px] text-foreground">Pipeline Overview</h3>
          <span className="font-body text-[12px] font-medium text-muted-foreground">Hover a slice for its count · click to open the list</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-8">

          {/* Donut — hover shows the slice's count in the center; click opens the list */}
          <div className="relative w-48 h-48 shrink-0">
            <svg viewBox="0 0 42 42" className="w-full h-full">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--accent)" strokeWidth="5" />
              {donutSegments.map((seg, i) => (
                <circle key={i} cx="21" cy="21" r="15.915" fill="transparent"
                  stroke={seg.color} strokeWidth={hoveredStage === i ? 6.5 : 5}
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`} strokeDashoffset={seg.offset}
                  className={`cursor-pointer transition-all ${hoveredStage !== null && hoveredStage !== i ? 'opacity-30' : 'opacity-100'}`}
                  onMouseEnter={() => setHoveredStage(i)} onMouseLeave={() => setHoveredStage(null)}
                  onClick={() => navigate(funnelStages[i].path)} />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
              <span className="font-heading font-black text-[30px] leading-none text-foreground tabular-nums">{hoveredStage !== null ? funnelStages[hoveredStage].count : funnelStages[0].count}</span>
              <span className="font-body text-[11px] text-muted-foreground font-medium mt-1">{hoveredStage !== null ? funnelStages[hoveredStage].label : 'in pipeline'}</span>
            </div>
          </div>

          {/* Stage legend — what each colour represents */}
          <div className="w-full flex flex-col gap-1.5">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">By stage</span>
            {funnelStages.map((s, i) => (
              <button key={s.label} onClick={() => navigate(s.path)}
                onMouseEnter={() => setHoveredStage(i)} onMouseLeave={() => setHoveredStage(null)}
                className={`flex items-center gap-2.5 group text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors ${hoveredStage === i ? 'bg-accent' : 'hover:bg-accent'}`}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-body font-bold text-[13px] text-foreground flex-1 min-w-0 truncate group-hover:text-primary">{s.label}</span>
                <span className="font-mono font-black text-[13px] text-foreground tabular-nums shrink-0">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section B: Signed Pipeline Grid ── */}
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-[24px] text-foreground">Signed Pipeline</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium mt-1">
              {signedPlayers.length} signed · Columns show the year each player was signed
            </p>
          </div>
          <button onClick={() => setShowAddSigned(true)}
            className="flex items-center gap-2 bg-transparent border-2 border-primary text-foreground hover:bg-primary/10 rounded-full px-4 py-2 font-body font-bold text-[14px] transition-colors">
            <Plus size={13} />Sign Player
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-primary px-3 py-3 text-left w-[56px] border-r border-white/10">
                  <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Pos</span>
                </th>
                {SIGNED_YEARS.map(year => (
                  <th key={year} className="bg-primary px-4 py-3 text-center border-r border-white/10 last:border-r-0 min-w-[120px]">
                    <span className="font-heading font-bold text-[15px] text-chalk tabular-nums">{year}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEAD_POSITIONS.filter(pos => signedPlayers.some(p => p.pos === pos)).map((pos, rowIdx) => (
                <tr key={pos} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-accent'}>
                  <td className={`sticky left-0 z-10 px-3 py-3 border-r border-border border-b border-border ${rowIdx % 2 === 0 ? 'bg-card' : 'bg-accent'}`}>
                    <span className="font-heading font-black text-[14px] text-foreground">{pos}</span>
                  </td>
                  {SIGNED_YEARS.map(year => {
                    const cell = getSignedAt(pos, year);
                    return (
                      <td key={year} className="px-4 py-3 border-r border-border last:border-r-0 border-b border-border align-top min-w-[120px]">
                        {cell.length === 0 ? <div className="h-7" /> : (
                          <div className="flex flex-col gap-2">
                            {cell.map(player => (
                              <div key={player.id} className="flex items-center gap-2">
                                <span title={player.name} className="font-body font-bold text-[14px] text-foreground truncate flex-1 min-w-0">{player.name}</span>
                                <span className="font-mono text-[10px] font-bold text-muted-foreground shrink-0">{player.birthYear}</span>
                                <span className="font-body font-black text-[10px] px-2 py-0.5 rounded-full shrink-0 text-white min-w-[28px] text-center"
                                  style={{ backgroundColor: LEAD_GRADE_BG[player.grade] || '#7baac7' }}>{player.grade}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Add signed player modal */}
      {showAddSigned && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAddSigned(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[16px] flex items-center justify-between">
              <span className="font-heading font-semibold text-[16px] text-white">Sign Player to Pipeline</span>
              <button onClick={() => setShowAddSigned(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-8 space-y-4">
              {[{label:'Player Name',key:'name',type:'text'},{label:'Birth Year',key:'birthYear',type:'number'},{label:'Year Signed',key:'yearSigned',type:'number'}].map(f => (
                <div key={f.key}>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">{f.label}</label>
                  <input type={f.type} value={(newSigned as any)[f.key] || ''} onChange={e => setNewSigned(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
                  <select value={newSigned.pos || 'ST'} onChange={e => setNewSigned(p => ({ ...p, pos: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    {LEAD_POSITIONS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Grade</label>
                  <div className="flex gap-2 flex-wrap">
                    {['A+','A','B+','B'].map(g => (
                      <button key={g} onClick={() => setNewSigned(p => ({ ...p, grade: g }))}
                        className={`px-3 py-2 rounded-full font-body text-[12px] font-black border transition-all ${newSigned.grade === g ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleAddSigned} disabled={!newSigned.name}
                className="w-full bg-primary border-2 border-primary text-white rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Add to Signed Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ tasks, onToggle, onAdd, onNavigate, onNudge }: {
  tasks: Task[]; onToggle: (id: string) => void; onAdd: (text: string) => void;
  onNavigate: (tab: LeadTab) => void; onNudge: (name: string) => void;
}) => {
  const navigate = useNavigate();
  const goToSection = (section: string) => navigate(`/lead-scout/players?section=${section}`);
  const [videoPlayer, setVideoPlayer] = useState<{ id: string; name: string; posAcronym?: string } | null>(null);

  const BY_PATHWAY = [
    { label: 'ACH',     count: 13 },
    { label: 'Feeder',  count: 3  },
    { label: 'AB',      count: 2  },
    { label: 'Partner', count: 2  },
    { label: 'VPS',     count: 1  },
  ];
  const maxPathway = Math.max(...BY_PATHWAY.map(p => p.count));
  const BY_STATUS = [
    { label: 'Reviewing',   count: 4, bar: 'bg-primary' },
    { label: 'Nat Pro',     count: 2, bar: 'bg-primary' },
    { label: 'Negotiating', count: 2, bar: 'bg-primary' },
    { label: 'Scout',       count: 2, bar: 'bg-primary' },
    { label: 'ACH trial',   count: 1, bar: 'bg-primary' },
    { label: 'Paper work',  count: 1, bar: 'bg-primary' },
    { label: 'Signed',      count: 1, bar: '', style: { backgroundColor: 'var(--scout-green)' } as React.CSSProperties },
  ];
  const maxStatus = Math.max(...BY_STATUS.map(s => s.count));

  return (
    <div className="flex flex-col gap-[var(--gap-grid)]">

      {/* KPI cards — full-width horizontal row (4-up desktop / 2-up mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)]">
        <KpiCard icon={FileText} heading="Reports" value="27"
          descriptor="by senior scouts" action="Opens Reports"
          onClick={() => onNavigate('reports')} />
        <KpiCard icon={Target} heading="Coverage"
          value={<>8<span className="text-muted-foreground">/14</span></>}
          descriptor="shortlist reported" action="View Coverage"
          onClick={() => onNavigate('reports')} />
        <KpiCard icon={Users} heading="Pipeline" value="20"
          descriptor="in Target + Short" action="Opens Short List"
          onClick={() => goToSection('short-list')} />
        <KpiCard icon={Star} heading="Top Grade" value="33%"
          descriptor="rated A+" action="View A+ Players"
          onClick={() => navigate('/lead-scout/players?section=short-list&grade=A%2B')} />
      </div>

      {/* Below KPIs — Target breakdown (left) + right column (Latest Videos + combined Matches) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 portrait-tablet:grid-cols-1 gap-[var(--gap-grid)] lg:items-stretch">

        {/* Target breakdown (wide) */}
        <div className="lg:col-span-3 portrait-tablet:col-span-full min-w-0 bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Target breakdown</h3>
            <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Derivable</span>
          </div>
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-8">
            <div>
              <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">By pathway</span>
              <div className="space-y-3 mt-3">
                {BY_PATHWAY.map(p => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="font-body font-bold text-[12px] text-muted-foreground w-20 shrink-0 truncate">{p.label}</span>
                    <div className="flex-1 h-6 bg-accent rounded-full overflow-hidden min-w-0">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max((p.count / maxPathway) * 100, 8)}%` }} />
                    </div>
                    <span className="font-mono font-black text-[12px] text-foreground w-6 text-right shrink-0 tabular-nums">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">By status</span>
              <div className="space-y-3 mt-3">
                {BY_STATUS.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="font-body font-bold text-[12px] text-muted-foreground w-20 shrink-0 truncate">{s.label}</span>
                    <div className="flex-1 h-6 bg-accent rounded-full overflow-hidden min-w-0">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${Math.max((s.count / maxStatus) * 100, 8)}%`, ...(s.style || {}) }} />
                    </div>
                    <span className="font-mono font-black text-[12px] text-foreground w-6 text-right shrink-0 tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Latest Videos (top) + combined Matches (bottom) */}
        <div className="lg:col-span-2 portrait-tablet:col-span-full min-w-0 flex flex-col gap-[var(--gap-grid)]">

          {/* Latest Videos */}
          <div className="min-w-0 bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden shrink-0">
            <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Film size={16} className="text-foreground" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Latest Videos</h3>
                <p className="font-body text-[12px] text-muted-foreground font-medium">Newest videos by player</p>
              </div>
            </div>
            <div className="divide-y divide-border overflow-y-auto max-h-[240px]">
              {HIGHLIGHTS_FEED.map(h => (
                <button key={h.id} onClick={() => setVideoPlayer({ id: h.id, name: h.name, posAcronym: h.posAcronym })}
                  className="w-full px-4 sm:px-6 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left">
                  <div className="w-8 h-8 rounded-xl bg-card text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">{h.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body font-bold text-[14px] text-foreground truncate">{h.name}</span>
                      <span className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-background text-foreground border border-border">{h.list === 'short' ? 'Short' : 'Target'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {h.matchVideos > 0 && <span className="bg-primary/20 text-foreground font-body font-bold px-1.5 py-0.5 rounded text-[11px]">F{h.matchVideos}</span>}
                      {h.highlightVideos > 0 && <span className="bg-primary/10 text-foreground font-body font-bold px-1.5 py-0.5 rounded text-[11px]">H{h.highlightVideos}</span>}
                    </div>
                  </div>
                  <span className="font-body text-[12px] text-muted-foreground font-medium tabular-nums shrink-0">{h.hoursAgo}h ago</span>
                </button>
              ))}
            </div>
          </div>

          {/* Matches — combined: Recent Results | Upcoming (two columns) */}
          <div className="min-w-0 bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden shrink-0">
            <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-foreground" /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Matches</h3>
                <p className="font-body text-[12px] text-muted-foreground font-medium">Results &amp; fixtures</p>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Recent Results */}
              <div className="min-w-0">
                <div className="px-3 sm:px-4 py-2 border-b border-border">
                  <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Recent Results</span>
                </div>
                <div className="divide-y divide-border">
                  {RECENT_RESULTS.map(r => (
                    <button key={r.id} onClick={() => navigate('/lead-scout/matches')}
                      className="w-full px-3 sm:px-4 py-2.5 hover:bg-accent transition-colors text-left block min-w-0">
                      <span className="font-body font-bold text-[12px] text-foreground block truncate">{r.home} <span className="text-primary tabular-nums">{r.hs}–{r.as}</span> {r.away}</span>
                      <span className="font-body text-[11px] text-muted-foreground font-medium block">{r.date}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Upcoming */}
              <div className="min-w-0">
                <div className="px-3 sm:px-4 py-2 border-b border-border">
                  <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Upcoming</span>
                </div>
                <div className="divide-y divide-border">
                  {UPCOMING_MATCHES.map(m => (
                    <button key={m.id} onClick={() => navigate('/lead-scout/matches')}
                      className="w-full px-3 sm:px-4 py-2.5 hover:bg-accent transition-colors text-left block min-w-0">
                      <span className="font-body font-bold text-[12px] text-foreground block truncate">{m.home} vs {m.away}</span>
                      <span className="font-body text-[11px] text-muted-foreground font-medium block">{m.date}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {videoPlayer && (
        <PlayerVideoWorkspace player={videoPlayer} onClose={() => setVideoPlayer(null)} />
      )}
    </div>
  );
};

// ─── Packages Tab ─────────────────────────────────────────────────────────────
const PackagesTab = ({ onNudge }: { onNudge: (name: string) => void }) => {
  const [filter, setFilter] = useState<'all'|'short'|'target'>('all');
  const filtered = filter==='all' ? MOCK_PKGS : MOCK_PKGS.filter(p => p.list===filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end flex-wrap gap-4">
        <div className="flex items-center bg-accent rounded-full p-1 gap-1">
          {([['all','All'],['short','Short List'],['target','Target List']] as const).map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-5 py-2 rounded-full font-body text-[14px] font-bold transition-all ${filter===val?'bg-primary text-primary-foreground shadow-sm':'text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(pkg => (
          <div key={pkg.id} className={`bg-card rounded-[40px] border p-8 shadow-[var(--shadow-lg)] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${pkg.watched?'border-border':'border-primary/20'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[14px] bg-primary text-chalk flex items-center justify-center font-body font-black text-[14px] shrink-0">{pkg.initials}</div>
              <div className="flex-1">
                <div className="font-body font-bold text-[16px] text-foreground">{pkg.playerName}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`font-body text-[12px] font-black px-2 py-0.5 rounded-full ${pkg.list==='target'?'bg-primary/15 text-foreground':'bg-accent text-muted-foreground'}`}>
                    {pkg.list==='target'?'Target':'Short'}
                  </span>
                  <span className="font-body text-[12px] text-muted-foreground font-medium">by {pkg.scout}</span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pkg.watched?'bg-primary/10':'bg-primary/10'}`}>
                {pkg.watched ? <Eye size={16} className="text-foreground" /> : <EyeOff size={16} className="text-foreground" />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[12px] font-black text-muted-foreground">{pkg.clipCount} clips · {pkg.uploadDate}</span>
              {!pkg.watched && (
                <button onClick={() => onNudge(pkg.scout)}
                  className="font-body text-[12px] font-black px-3 py-1 rounded-full border-2 border-primary text-foreground hover:bg-primary/10 transition-colors">
                  Nudge {pkg.scout}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LeadScoutDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  let activePage: ActivePage = 'dashboard';
  if (location.pathname === '/lead-scout/players') activePage = 'players';
  if (location.pathname === '/lead-scout/matches') activePage = 'matches';
  if (location.pathname === '/lead-scout/admin')   activePage = 'admin';

  const [activeTab, setActiveTab] = useState<LeadTab>('overview');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [notifications, setNotifications] = useState<AppNotif[]>(INITIAL_NOTIFS);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showThisWeek, setShowThisWeek] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id===id ? { ...t, completed:!t.completed } : t));
  const setTaskStatus = (id: any, status: any) => setTasks(prev => prev.map(t => t.id===id ? { ...t, status, completed: status==='done' } : t));
  const addTask = (input: any) => {
    const t = typeof input === 'string' ? { text: input } : input;
    const nowLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setTasks(prev => [{
      id: `t${Date.now()}`, text: t.text, description: t.description,
      priority: t.priority ?? 'Medium', dueDate: t.dueDate || 'This week', deadline: t.deadline,
      assignedDate: new Date().toISOString().slice(0, 10), status: 'pending',
      assignedTo: t.assignedTo || 'Me', allocated: nowLabel, completed: false,
    }, ...prev]);
  };
  const addNotif = (text: string, type: AppNotif['type']) =>
    setNotifications(prev => [{ id:`n${Date.now()}`, text, time:'Just now', read:false, type }, ...prev]);
  const handleNudge = (name: string) => addNotif(`You nudged ${name} to watch pending packages`, 'nudge');

  const subtitles = [
    "The next A+ talent is one package away 🎬",
    "Short List doesn't mean short on ambition 🎯",
    "Every Grade A signed is a mission complete ✅",
    "Lead the hunt. Trust the data 📊",
  ];
  const [subtitle] = useState(subtitles[Math.floor(Math.random() * subtitles.length)]);

  const tabs = [
    { id:'overview',  label:'Overview'  },
    { id:'pipeline',  label:'Pipeline'  },
    { id:'reports',   label:'Reports'   },
    { id:'analytics', label:'Analytics' },
    { id:'target',    label:'Tasks', count: tasks.filter(t => !t.completed).length, countTone: 'muted' as const },
  ];

  const FLAG_MAP: Record<string,string> = { "GAM":"gm","CMR":"cm","MLI":"ml","SEN":"sn","BDI":"bi","NGA":"ng","GHA":"gh","CIV":"ci","ENG":"gb-eng" };

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <style dangerouslySetInnerHTML={{__html:`
        ::-webkit-scrollbar{width:6px;height:6px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#b8d4ef;border-radius:4px;}::-webkit-scrollbar-thumb:hover{background:#7baac7;}
        .hide-scrollbar::-webkit-scrollbar{display:none;}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}} />

      {/* ── Modals ── */}
      {showThisWeek && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowThisWeek(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[16px] shrink-0">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-foreground" />
                <span className="font-heading font-semibold text-[16px] text-white">Tasks This Week</span>
              </div>
              <button onClick={() => setShowThisWeek(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <input type="text" placeholder="Add a task..." onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { addTask(e.currentTarget.value.trim()); e.currentTarget.value = ''; } }}
                  className="flex-1 bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0"><Plus size={18} /></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {tasks.filter(t => !t.completed).map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-[20px] hover:bg-accent cursor-pointer group" onClick={() => toggleTask(task.id)}>
                  <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary shrink-0 mt-0.5 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-[14px] text-foreground">{task.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-primary/15 text-foreground' : 'bg-accent text-muted-foreground'}`}>{task.priority}</span>
                      <span className="font-body text-[12px] text-muted-foreground font-medium">{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.completed).length > 0 && (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 h-px bg-secondary" />
                    <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{tasks.filter(t => t.completed).length} completed</span>
                    <div className="flex-1 h-px bg-secondary" />
                  </div>
                  {tasks.filter(t => t.completed).map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-[20px] opacity-50 cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5"><CheckCircle size={12} className="text-white" /></div>
                      <p className="font-body font-bold text-[14px] text-muted-foreground line-through">{task.text}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddReport && <AddReportModal onClose={() => setShowAddReport(false)} scoutName="Tom" />}

      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAddPlayer(false)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[16px] shrink-0">
              <span className="font-heading font-semibold text-[20px] text-white">Add New Player</span>
              <button onClick={() => setShowAddPlayer(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[{label:'Full Name',ph:'e.g. Kofi Mensah',type:'text'},{label:'Date of Birth',ph:'',type:'date'},{label:'Nationality',ph:'e.g. Ghana',type:'text'},{label:'Team',ph:'e.g. Hawks FC',type:'text'}].map(f => (
                  <div key={f.label}>
                    <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">{f.label}</label>
                    <input type={f.type} placeholder={f.ph} className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                  </div>
                ))}
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
                  <select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    {['ST','LW','RW','CM','CDM','CAM','FB','CB'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Preferred Foot</label>
                  <select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    <option>Right</option><option>Left</option><option>Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Add to Pipeline</label>
                <div className="flex gap-3">
                  {['Long List','Short List','Target List'].map(list => (
                    <label key={list} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-[#1e88e5]" />
                      <span className="font-body font-bold text-[14px] text-foreground">{list}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-border bg-card flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowAddPlayer(false)} className="px-6 py-3 bg-transparent border-2 border-border text-muted-foreground rounded-full font-body font-bold text-[14px] hover:border-muted-foreground transition-colors">Cancel</button>
              <button onClick={() => setShowAddPlayer(false)} className="px-6 py-3 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] hover:bg-primary/80 transition-colors">Add Player</button>
            </div>
          </div>
        </div>
      )}

      <Sidebar actions={[
        { label: 'This Week', icon: Calendar, onClick: () => setShowThisWeek(true) },
        { label: 'Add Report', icon: FileText, onClick: () => setShowAddReport(true) },
      ]} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <TopNav
          responsive
          rolePill={(
            <div className="flex items-center gap-2 px-3 md:px-5 h-[44px] bg-accent rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <span className="hidden md:inline font-body text-[14px] font-bold text-foreground whitespace-nowrap">Lead Scout Dashboard</span>
            </div>
          )}
          unreadCount={unreadCount}
          notifOpen={showNotifPanel}
          onNotifToggle={() => setShowNotifPanel(p => !p)}
          notifPanel={(
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-[20px] shadow-2xl border border-border z-50 overflow-hidden">
              <div className="px-6 py-4 bg-primary rounded-t-[16px] flex items-center justify-between">
                <span className="font-heading font-black text-[14px] text-white">Notifications</span>
                <button onClick={() => setShowNotifPanel(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map(n => (
                  <div key={n.id} className={`px-5 py-3 flex items-start gap-3 ${!n.read?'bg-card':''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type==='nudge'?'bg-primary/10':n.type==='package'?'bg-primary/20':'bg-primary/10'}`}>
                      {n.type==='nudge'?<Zap size={12} className="text-foreground" />:n.type==='package'?<Video size={12} className="text-foreground" />:<FileText size={12} className="text-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[14px] font-bold text-foreground leading-snug">{n.text}</p>
                      <p className="font-body text-[12px] text-muted-foreground font-medium mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          onThisWeek={() => setShowThisWeek(true)}
          onAddReport={() => setShowAddReport(true)}
          onAddPlayer={() => setShowAddPlayer(true)}
          avatarImg="https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=faces&q=80"
          profileOpen={showProfileMenu}
          onProfileToggle={() => setShowProfileMenu(p => !p)}
          profileMenu={(
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[20px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-card">
                <img src="https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=faces&q=80" alt="Tom" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">Tom</div>
                  <div className="font-body text-[12px] text-muted-foreground font-medium">Lead Scout</div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { setShowProfileMenu(false); sessionStorage.clear(); navigate('/login'); }} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[20px] transition-colors">
                  <LogOut size={16} className="mr-3" />Log out
                </button>
              </div>
            </div>
          )}
        />

        {/* Page content */}
        <div className="flex-1 px-4 md:px-8 pb-20 md:pb-6">
          {activePage==='players' && <SeniorLeadPlayersPage allPlayersData={[]} loggedInRole="Lead Scout" flagMap={FLAG_MAP} />}
          {activePage==='matches' && <MatchesView />}
          {activePage==='admin'   && <AdminView />}

          {activePage==='dashboard' && (
            <>
              <div className="pt-8 short:pt-2 mb-3 short:mb-1">
                <h1 className="font-heading font-semibold text-[24px] md:text-[32px] tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                    <Star size={28} className="text-chalk" />
                  </span>
                  Tom
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-1 short:hidden">{subtitle}</p>
              </div>

              <ResponsiveTabs className="mt-4 mb-4" tabs={tabs} activeId={activeTab} onSelect={(id) => setActiveTab(id as LeadTab)} />

              {activeTab==='overview'  && <OverviewTab tasks={tasks} onToggle={toggleTask} onAdd={addTask} onNavigate={setActiveTab} onNudge={handleNudge} />}
              {activeTab==='pipeline'  && <PipelineTab />}
              {activeTab==='reports'   && <ReportsTab onAddReport={() => setShowAddReport(true)} />}
              {activeTab==='analytics' && <AnalyticsTab />}
              {activeTab==='target'    && <TasksTab tasks={tasks} onToggle={toggleTask} onSetStatus={setTaskStatus} onAdd={addTask} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}