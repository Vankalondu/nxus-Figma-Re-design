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

type LeadTab = 'overview' | 'pipeline' | 'reports' | 'analytics' | 'target';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';

interface SignedPlayer {
  id: string; name: string; position: string;
  birthYear: number; yearSigned: number; grade: string; color: string;
}
interface GradeColorMap { [grade: string]: string; }
interface Task {
  id: string; text: string; priority: 'High' | 'Medium' | 'Low'; dueDate: string;
  assignedTo: string; allocated?: string; playerName?: string; isTargetTask?: boolean; completed: boolean;
}
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

const TASK_ASSIGNEES = ['Me', 'David (Senior)', 'Nene', 'Mbugua', 'Tom'];
const MOCK_TASKS: Task[] = [
  { id:'t1', text:'Review Kofi Mensah target package', priority:'High',   dueDate:'Jul 23', allocated:'Jul 21', assignedTo:'David (Senior)', playerName:'Kofi Mensah', isTargetTask:true, completed:false },
  { id:'t2', text:'File report on Amadou Sarr',        priority:'High',   dueDate:'Jul 23', allocated:'Jul 22', assignedTo:'Me', completed:false },
  { id:'t3', text:'Cross-check David Conteh stats',    priority:'Medium', dueDate:'Jul 25', allocated:'Jul 20', assignedTo:'David (Senior)', playerName:'David Conteh', isTargetTask:true, completed:false },
  { id:'t4', text:'Submit Combined Top 10 — Ghana cycle', priority:'High', dueDate:'Jul 26', allocated:'Jul 19', assignedTo:'Me', completed:false },
  { id:'t5', text:'Update PLR grades on Short List',   priority:'Low',    dueDate:'Jul 18', allocated:'Jul 12', assignedTo:'Me', completed:true },
  { id:'t6', text:'Shortlist review — Nene batch',     priority:'Medium', dueDate:'Jul 15', allocated:'Jul 10', assignedTo:'Nene', completed:true },
];

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

const PriorityPill = ({ p }: { p: 'High' | 'Medium' | 'Low' }) => (
  <span className="inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-bold bg-primary/15 text-foreground shrink-0">{p}</span>
);

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
// ─── Target Tab ───────────────────────────────────────────────────────────────
// ── Weekly task distribution (mock) — per day [completed, pending, assigned] ──
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEK_TASKS: Record<string, [number, number, number]> = {
  Mon:[3,2,1], Tue:[2,1,2], Wed:[4,2,1], Thu:[3,3,2], Fri:[5,1,1], Sat:[1,1,0], Sun:[0,1,1],
};
const WEEK_HOURS: Record<string, [number, number, number]> = {
  Mon:[4.5,2,1], Tue:[3,1.5,2.5], Wed:[6,2,1], Thu:[5,3,2], Fri:[7,1,1.5], Sat:[1.5,1,0], Sun:[0,1,1],
};
const TASK_STATUS = [
  { key: 'Completed', color: '#061b2e' },
  { key: 'Pending',   color: '#E8A838' },
  { key: 'Assigned',  color: '#b8d4ef' },
];

type TaskInput = string | { text: string; assignedTo?: string; dueDate?: string; priority?: 'High' | 'Medium' | 'Low' };
function TargetTab({ tasks, onToggle, onAdd }: { tasks: any[]; onToggle: (id: any) => void; onAdd: (input: TaskInput) => void }) {
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
          <div className="p-6 border-b border-border flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={18} className="text-foreground" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Tasks</h3>
                <p className="font-body text-[12px] text-muted-foreground font-medium">{activeTasks.length} active · {archivedTasks.length} archived</p>
              </div>
              <button onClick={() => setShowAssign(true)}
                className="shrink-0 inline-flex items-center gap-1.5 bg-transparent border border-primary text-foreground px-4 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
                <Plus size={14} /> Assign task
              </button>
            </div>
            <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full self-start">
              {([['active', `Active (${activeTasks.length})`], ['archived', `Archived (${archivedTasks.length})`]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setArchiveView(id)}
                  className={`font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${archiveView===id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
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

  const KPI_CARD = "flex flex-col justify-between gap-3 p-6 bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] min-h-[190px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full";
  const KPI_LABEL = "font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground";
  const KPI_NUM = "font-heading font-extrabold text-4xl tabular-nums text-foreground leading-none";
  const KPI_LINK = "text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap";
  const KPI_ICON_CHIP = "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors";
  const KPI_DESC = "font-heading font-bold text-sm text-foreground leading-tight self-end pb-0.5";

  return (
    <div className="flex flex-col gap-[var(--gap-grid)]">

      {/* KPI cards — full-width horizontal row (4-up desktop / 2-up mobile); top-right arrow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)]">

        {/* Card 1 — Reports */}
        <button onClick={() => onNavigate('reports')} className={KPI_CARD}>
          <div className="flex items-center gap-3">
            <span className={KPI_ICON_CHIP}><FileText size={18} className="text-primary" /></span>
            <span className={KPI_LABEL}>Reports</span>
          </div>
          <div className="flex items-end justify-between gap-x-2 gap-y-1 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className={KPI_NUM}>27</span>
              <span className={KPI_DESC}>by senior scouts</span>
            </div>
            <span className={KPI_LINK}>Opens Reports</span>
          </div>
        </button>

        {/* Card 2 — Coverage */}
        <button onClick={() => onNavigate('reports')} className={KPI_CARD}>
          <div className="flex items-center gap-3">
            <span className={KPI_ICON_CHIP}><Target size={18} className="text-primary" /></span>
            <span className={KPI_LABEL}>Coverage</span>
          </div>
          <div className="flex items-end justify-between gap-x-2 gap-y-1 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className={KPI_NUM}>8<span className="text-muted-foreground">/14</span></span>
              <span className={KPI_DESC}>shortlist reported</span>
            </div>
            <span className={KPI_LINK}>View Coverage</span>
          </div>
        </button>

        {/* Card 3 — Players */}
        <button onClick={() => goToSection('short-list')} className={KPI_CARD}>
          <div className="flex items-center gap-3">
            <span className={KPI_ICON_CHIP}><Users size={18} className="text-primary" /></span>
            <span className={KPI_LABEL}>Pipeline</span>
          </div>
          <div className="flex items-end justify-between gap-x-2 gap-y-1 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className={KPI_NUM}>20</span>
              <span className={KPI_DESC}>in Target + Short</span>
            </div>
            <span className={KPI_LINK}>Opens Short List</span>
          </div>
        </button>

        {/* Card 4 — A+ Grade */}
        <button onClick={() => navigate('/lead-scout/players?section=short-list&grade=A%2B')} className={KPI_CARD}>
          <div className="flex items-center gap-3">
            <span className={KPI_ICON_CHIP}><Star size={18} className="text-primary" /></span>
            <span className={KPI_LABEL}>Top Grade</span>
          </div>
          <div className="flex items-end justify-between gap-x-2 gap-y-1 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className={KPI_NUM}>33%</span>
              <span className={KPI_DESC}>rated A+</span>
            </div>
            <span className={KPI_LINK}>A+ on Short List</span>
          </div>
        </button>
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

// ─── Reports Tab ──────────────────────────────────────────────────────────────
// ─── Report Champion Podium ───────────────────────────────────────────────────
const CHAMP_KEYFRAMES = `
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
const ChampionPodium = ({ scouts }: { scouts: { name: string; role: string; count: number }[] }) => {
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

const REPORT_GRADE_SCORE: Record<string, number> = { 'A+': 96, 'A': 90, 'B+': 82, 'B': 74, 'C+': 66, 'C': 60 };
const gradeToScore = (g: string) => REPORT_GRADE_SCORE[g] ?? 70;

// Inline filter dropdown for the Reports toolbar. Custom (not a native <select>) so BOTH the
// pill trigger AND the options panel match the app's UI. 'All' shows as `allLabel`; set filter
// highlights in primary; selected option gets a check.
const InlineSel = ({ value, onChange, opts, allLabel }: { value: string; onChange: (v: string) => void; opts: string[]; allLabel: string }) => {
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

const ReportsTab = ({ onAddReport }: { onAddReport: () => void }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [fStatus, setFStatus] = React.useState<'all' | 'unread'>('all');
  const [fScout, setFScout] = React.useState('All');
  const [fGrade, setFGrade] = React.useState('All');
  const [fPos, setFPos] = React.useState('All');
  const [fRecency, setFRecency] = React.useState<'all' | 'month' | 'week'>('all');
  const [viewReport, setViewReport] = React.useState<any>(null);
  const [visibleCount, setVisibleCount] = React.useState(6);

  // status: 'unseen' (blue outline) · 'seen' (default) · 'opened' (faded)
  const [reports, setReports] = React.useState(() => {
    const base = [
      { id:'r1', player:'Kofi Mensah',   initials:'KM', pos:'ST',  plr:'A+', pog:'A',  nxt:'T', date:'Dec 14', daysAgo:3,  scout:'Mbugua', status:'unseen', notes:'' },
      { id:'r2', player:'David Conteh',  initials:'DC', pos:'LW',  plr:'A',  pog:'B',  nxt:'M', date:'Dec 12', daysAgo:5,  scout:'Tom',    status:'seen',   notes:'' },
      { id:'r3', player:'Amadou Sarr',   initials:'AS', pos:'CDM', plr:'B',  pog:'B',  nxt:'M', date:'Dec 10', daysAgo:7,  scout:'Tom',    status:'opened', notes:'' },
      { id:'r4', player:'Kazungu Nesta', initials:'KN', pos:'CM',  plr:'B',  pog:'B',  nxt:'M', date:'Dec 8',  daysAgo:9,  scout:'Nene',   status:'unseen', notes:'' },
      { id:'r5', player:'Francis Gomez', initials:'FG', pos:'RW',  plr:'A',  pog:'A',  nxt:'T', date:'Nov 28', daysAgo:19, scout:'Nene',   status:'opened', notes:'' },
      { id:'r6', player:'Abdul Moro',    initials:'AM', pos:'CM',  plr:'B',  pog:'A',  nxt:'T', date:'Nov 25', daysAgo:22, scout:'Mbugua', status:'seen',   notes:'' },
    ];
    const NAMES = ['Kwame Boateng','Yaw Owusu','Sory Camara','Ismael Toure','Cheikh Diop','Musa Kante','Prince Mensah','Daniel Osei','Emmanuel Adjei','Lamine Cisse','Joseph Njoroge','Wekesa Omondi','Baba Traore','Kofi Annan','Samuel Eto','Riyad Sane','Nabil Fassi','Omar Diallo','Karim Toure','Yusuf Bah'];
    const POS = ['ST','LW','RW','CM','CDM','CB','RB','GK']; const GR = ['A+','A','B+','B','C']; const SC = ['Mbugua','Tom','Nene','Brice','David']; const MO = ['Nov','Oct','Sep','Aug'];
    const gen = Array.from({ length: 651 }, (_, i) => {
      const nm = NAMES[i % NAMES.length];
      return { id:`g${i}`, player: nm, initials: nm.split(' ').map(w => w[0]).join(''), pos: POS[i%POS.length], plr: GR[i%GR.length], pog: GR[(i+2)%GR.length], nxt: i%2 ? 'M' : 'T', date: `${MO[i%MO.length]} ${1+(i%27)}`, daysAgo: 25+i, scout: SC[i%SC.length], status: i%7===0 ? 'unseen' : (i%3===0 ? 'opened' : 'seen'), notes:'' };
    });
    return [...base, ...gen];
  });
  const markOpened = (id: string) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'opened' } : r));
  const openReport = (r: any) => { setViewReport(r); markOpened(r.id); };
  const scoutCounts = [
    { name: 'Mbugua', role: 'Senior Scout', count: 9 },
    { name: 'Tom',    role: 'Lead Scout',   count: 6 },
    { name: 'Nene',   role: 'Head Scout',   count: 4 },
  ];
  const scoutOpts = ['All', ...Array.from(new Set(reports.map(r => r.scout)))];
  const gradeOpts = ['All', ...Array.from(new Set(reports.map(r => r.plr)))];
  const posOpts   = ['All', ...Array.from(new Set(reports.map(r => r.pos)))];

  const unreadCount = reports.filter(r => r.status === 'unseen').length;
  const gradeACount = reports.filter(r => r.plr === 'A' || r.plr === 'A+').length;

  const q = search.trim().toLowerCase();
  const filtered = reports.filter(r =>
    (q === '' || r.player.toLowerCase().includes(q) || r.scout.toLowerCase().includes(q)) &&
    (fStatus === 'all' || r.status === 'unseen') &&
    (fScout === 'All' || r.scout === fScout) &&
    (fGrade === 'All' || r.plr === fGrade) &&
    (fPos === 'All' || r.pos === fPos) &&
    (fRecency === 'all' || (fRecency === 'week' ? r.daysAgo <= 7 : r.daysAgo <= 31))
  );
  const shown = filtered.slice(0, visibleCount);
  const remaining = filtered.length - shown.length;
  const activeFilters = [fStatus !== 'all', fScout !== 'All', fGrade !== 'All', fPos !== 'All', fRecency !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setFStatus('all'); setFScout('All'); setFGrade('All'); setFPos('All'); setFRecency('all'); };

  const summaryStats = [
    { label: 'Total', value: reports.length.toString(), sub: 'All time', icon: FileText },
    { label: 'Unread', value: unreadCount.toString(), sub: 'Need review', icon: Eye },
    { label: 'Grade A/A+', value: gradeACount.toString(), sub: 'Top PLR', icon: Star },
    { label: 'This Month', value: reports.length.toString(), sub: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar },
  ];
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* KPI tiles (one row) + Champion (far right) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:items-stretch">
        {summaryStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="lg:col-span-1 min-w-0 bg-card border border-border rounded-[20px] p-4 h-[135px] shadow-[var(--shadow-lg)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground truncate">{stat.label}</span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Icon size={16} className="text-primary" /></div>
              </div>
              <div className="font-heading font-extrabold text-[32px] text-foreground leading-none">{stat.value}</div>
              <span className="font-body text-[12px] text-muted-foreground font-medium">{stat.sub}</span>
            </div>
          );
        })}
        <div className="col-span-2 min-w-0"><ChampionPodium scouts={scoutCounts} /></div>
      </div>

      {/* Toolbar: search (left) · inline filters · Refresh + Add Report (right) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search — outlined like the filters, wider */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or scout…"
            className="w-full bg-card/60 border border-primary/40 rounded-full pl-9 pr-3 py-2 font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary hover:bg-card transition-colors" />
        </div>

        {/* Inline filters — always in view */}
        <InlineSel value={fStatus === 'all' ? 'All' : 'Unread'} onChange={v => setFStatus(v === 'Unread' ? 'unread' : 'all')} opts={['All', 'Unread']} allLabel="All reports" />
        <InlineSel value={fScout} onChange={setFScout} opts={scoutOpts} allLabel="All scouts" />
        <InlineSel value={fGrade} onChange={setFGrade} opts={gradeOpts} allLabel="All grades" />
        <InlineSel value={fPos} onChange={setFPos} opts={posOpts} allLabel="All positions" />
        <InlineSel value={fRecency === 'all' ? 'All' : fRecency === 'month' ? 'This month' : 'This week'} onChange={v => setFRecency(v === 'This week' ? 'week' : v === 'This month' ? 'month' : 'all')} opts={['All', 'This month', 'This week']} allLabel="All time" />
        {activeFilters > 0 && <button onClick={clearFilters} className="font-body text-[12px] font-bold text-primary hover:underline px-1 shrink-0">Clear</button>}

        <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }}
          className="ml-auto shrink-0 flex items-center gap-2 bg-transparent border border-primary text-foreground px-4 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {/* Report cards */}
      {shown.length === 0 && (
        <div className="bg-card border border-border rounded-[20px] p-10 text-center font-body text-[14px] text-muted-foreground shadow-[var(--shadow-lg)]">
          No reports match your search or filters.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(r => {
          const overall = Math.round((gradeToScore(r.plr) + gradeToScore(r.pog)) / 2);
          return (
          <div key={r.id}
            className={`bg-card rounded-[20px] border p-5 flex flex-col gap-3 hover:shadow-xl transition-all ${r.status === 'unseen' ? 'border-primary ring-2 ring-primary/40 shadow-md' : r.status === 'opened' ? 'border-border shadow-[var(--shadow-lg)] opacity-60' : 'border-border shadow-[var(--shadow-lg)]'}`}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[14px] shrink-0">{r.initials}</div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[15px] text-foreground truncate">{r.player}</div>
                  <div className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground">
                    <span className="font-bold text-foreground">{r.pos}</span>
                    <span>·</span>
                    <User size={11} />{r.scout}
                    <span>·</span>
                    <Calendar size={11} />{r.date}
                  </div>
                </div>
              </div>
            </div>
            {/* Grade strip */}
            <div className="grid grid-cols-3 gap-2">
              {([['PLR', r.plr], ['POG', r.pog], ['NXT', r.nxt]] as const).map(([k, v]) => (
                <div key={k} className="bg-accent/50 rounded-[14px] py-2 text-center">
                  <div className="font-heading font-bold text-[16px] text-foreground leading-none">{v}</div>
                  <div className="font-heading font-bold text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{k}</div>
                </div>
              ))}
            </div>
            {/* Overall score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Overall</span>
                <span className="font-heading font-black text-[13px] text-foreground tabular-nums">{overall}</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${overall}%` }} />
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => openReport(r)} className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full py-2 transition-colors"><Eye size={14} />View</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary rounded-full py-2 transition-colors"><Download size={14} />Export</button>
            </div>
          </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <button onClick={() => setVisibleCount(v => v + 9)} className="mx-auto flex items-center gap-2 bg-transparent border border-primary text-foreground px-6 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
          Load more ({remaining} remaining)
        </button>
      )}

      {viewReport && <EditFormBlueprintModal editTemplate={viewReport} onClose={() => setViewReport(null)} />}
    </div>
  );
};

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const [board, setBoard] = useState<'scouts' | 'players'>('players');
  const [removedScouts, setRemovedScouts] = useState<string[]>([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState('All countries');
  const [hoverPt, setHoverPt] = useState<{ s:number; i:number } | null>(null);
  const COUNTRIES = ['All countries','Ghana','Nigeria','Senegal','Kenya'];

  // ── Talent map (scatter) — reversed age axis: younger → right so top-right = priority ──
  const TALENT = [
    { n:'Sory Traore',    age:17, r:8.6, v:5 },
    { n:'Kofi Mensah',    age:18, r:8.4, v:4 },
    { n:'Yaw Boateng',    age:18, r:8.3, v:3 },
    { n:'Musa Kamara',    age:17, r:8.2, v:4 },
    { n:'Amadou Sarr',    age:19, r:8.1, v:2 },
    { n:'Ibrahim Diallo', age:18, r:8.0, v:2 },
    { n:'Emmanuel Adjei', age:20, r:7.9, v:3 },
    { n:'Lamine Cissé',   age:17, r:7.6, v:1 },
    { n:'Daniel Osei',    age:21, r:7.7, v:3 },
    { n:'Prince Owusu',   age:19, r:7.4, v:2 },
    { n:'Cheick Konaté',  age:16, r:7.2, v:1 },
    { n:'Ousmane Bah',    age:22, r:7.0, v:2 },
    { n:'Joseph Njoroge', age:20, r:6.8, v:1 },
    { n:'Wekesa Omondi',  age:23, r:6.5, v:2 },
  ];
  const AGE_MIN=16, AGE_MAX=23, R_MIN=6, R_MAX=9;
  const W=560, H=300, mL=40, mR=18, mT=16, mB=34;
  const pL=mL, pR=W-mR, pT=mT, pB=H-mB, pW=pR-pL, pH=pB-pT;
  const sx=(age:number)=> pL + ((AGE_MAX-age)/(AGE_MAX-AGE_MIN))*pW; // reversed: younger to the right
  const sy=(rt:number)=> pB - ((rt-R_MIN)/(R_MAX-R_MIN))*pH;
  const rad=(vd:number)=> 4 + vd*1.1;
  const isPriority=(age:number,rt:number)=> age<=19 && rt>=7.8;
  const zoneX=sx(19), zoneY=pT, zoneW=pR-zoneX, zoneH=sy(7.8)-pT;

  // ── Conversion trend — 3 line series, Feb–Jul, driven by country ──
  const convMonths = ['Feb 26','Mar 26','Apr 26','May 26','Jun 26','Jul 26'];
  const CONV_DATA: Record<string, { long:number[]; short:number[]; moved:number[]; stats:{ longAdded:number; shortAdded:number; moved:number; signed:number; longToShort:string; shortToTarget:string } }> = {
    'All countries': { long:[20,45,31,23,29,19], short:[8,12,47,20,15,11], moved:[4,6,5,7,6,8], stats:{ longAdded:187, shortAdded:241, moved:34, signed:1, longToShort:'128.9%', shortToTarget:'14.1%' } },
    Ghana:           { long:[12,28,19,14,17,11], short:[5,7,26,12,9,7],   moved:[2,3,3,4,3,5], stats:{ longAdded:101, shortAdded:66,  moved:20, signed:1, longToShort:'96.4%',  shortToTarget:'18.2%' } },
    Nigeria:         { long:[8,15,11,9,12,7],    short:[3,5,14,8,6,4],     moved:[1,2,2,2,2,3], stats:{ longAdded:62,  shortAdded:40,  moved:12, signed:0, longToShort:'82.5%',  shortToTarget:'15.0%' } },
    Senegal:         { long:[6,11,9,7,8,6],      short:[2,4,10,6,5,3],     moved:[1,1,2,2,1,2], stats:{ longAdded:47,  shortAdded:30,  moved:9,  signed:0, longToShort:'78.7%',  shortToTarget:'13.3%' } },
    Kenya:           { long:[4,8,6,5,6,4],       short:[1,3,7,4,3,2],      moved:[0,1,1,1,1,1], stats:{ longAdded:33,  shortAdded:20,  moved:5,  signed:0, longToShort:'71.4%',  shortToTarget:'10.0%' } },
  };
  const cd = CONV_DATA[country] ?? CONV_DATA['All countries'];
  const convStats: [string,string][] = [
    ['LONG ADDED', String(cd.stats.longAdded)],
    ['SHORT ADDED', String(cd.stats.shortAdded)],
    ['MOVED TO TARGET', String(cd.stats.moved)],
    ['SIGNED', String(cd.stats.signed)],
    ['LONG TO SHORT', cd.stats.longToShort],
    ['SHORT TO TARGET', cd.stats.shortToTarget],
  ];
  const CV_W=600, CV_H=240, cvML=34, cvMR=16, cvMT=16, cvMB=34;
  const cvpL=cvML, cvpR=CV_W-cvMR, cvpT=cvMT, cvpB=CV_H-cvMB;
  const cvPlotW=cvpR-cvpL, cvPlotH=cvpB-cvpT;
  const cvPeak = Math.max(10, ...cd.long, ...cd.short, ...cd.moved);
  const cvMax = Math.ceil(cvPeak/10)*10;
  const cvStep = cvMax/5;
  const cvGrid = [0,1,2,3,4,5].map(i => i*cvStep);
  const cvX=(i:number)=> cvpL + (i/(convMonths.length-1))*cvPlotW;
  const cvY=(v:number)=> cvpB - (v/cvMax)*cvPlotH;
  const cvPath=(arr:number[])=> arr.map((v,i)=>`${i===0?'M':'L'} ${cvX(i).toFixed(1)} ${cvY(v).toFixed(1)}`).join(' ');
  const cvSeries=[
    { label:'Long added',     data:cd.long,  color:'#2563eb' },
    { label:'Short added',    data:cd.short, color:'#E8A838' },
    { label:'Moved to Target',data:cd.moved, color:'#8b5cf6' },
  ];

  // ── Archived by stage — stacked vertical bars, Jan–Jul (mock, Jul dominant) ──
  const archMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  const archived = [
    { long:3,  short:8,   target:1  },
    { long:2,  short:6,   target:0  },
    { long:4,  short:11,  target:1  },
    { long:3,  short:7,   target:0  },
    { long:5,  short:13,  target:2  },
    { long:6,  short:16,  target:1  },
    { long:75, short:341, target:11 },
  ];
  const AR_W=480, AR_H=240, arML=30, arMR=14, arMT=16, arMB=34;
  const arpL=arML, arpR=AR_W-arMR, arpT=arMT, arpB=AR_H-arMB;
  const arPlotW=arpR-arpL, arPlotH=arpB-arpT;
  const arMax=Math.max(...archived.map(a=>a.long+a.short+a.target));
  const arSlot=arPlotW/archived.length;
  const arBarW=arSlot*0.46;
  const arSeg=(v:number)=> (v/arMax)*arPlotH;
  const arGrid=[0,0.25,0.5,0.75,1];

  // ── Leaderboards ──
  const TOP_PLAYERS = [
    { n:'Bisenty Mendy',      c:14 },
    { n:'Daniel Japhet',      c:14 },
    { n:'Luis Narh',          c:12 },
    { n:'FRANCIS SIOLOLO',    c:11 },
    { n:'Jean Michel Briton', c:11 },
    { n:'Kwaku Boahen',       c:10 },
    { n:'Ismael Coulibaly',   c:9  },
    { n:'Peter Etim',         c:9  },
    { n:'Youssouf Sané',      c:8  },
    { n:'Collins Otieno',     c:7  },
  ];
  // Highest shortlist submissions — senior + country + head scouts.
  // Only Senior Scouts can be removed by the lead scout.
  const SCOUT_BOARD = [
    { n:'Kwame Asante',   role:'Country Scout', c:38 },
    { n:'Chidi Obinna',   role:'Country Scout', c:31 },
    { n:'David Mbugua',   role:'Senior Scout',  c:27 },
    { n:'Wekesa Omondi',  role:'Head Scout',    c:24 },
    { n:'Emeka Okafor',   role:'Country Scout', c:22 },
    { n:'Nene',           role:'Senior Scout',  c:19 },
    { n:'Joseph Njoroge', role:'Head Scout',    c:17 },
    { n:'Brice',          role:'Senior Scout',  c:15 },
    { n:'Amara Diallo',   role:'Country Scout', c:13 },
    { n:'Tunde Bakare',   role:'Head Scout',    c:11 },
    { n:'Samuel Kipruto', role:'Country Scout', c:9  },
    { n:'Fatou Ndiaye',   role:'Country Scout', c:8  },
  ].map(s => ({ ...s, removable: s.role === 'Senior Scout' }));
  const scoutLeaders  = SCOUT_BOARD.filter(s => !removedScouts.includes(s.n)).slice(0, 10);
  const playerLeaders = TOP_PLAYERS.slice(0, 10);
  const leaders = board === 'players' ? playerLeaders : scoutLeaders;

  const CARD = 'bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-hidden';

  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Leaderboards + Talent map ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">

        {/* Card 3 — Leaderboards */}
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Trophy size={16} className="text-[#E8A838]" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Leaderboards</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">{board === 'scouts' ? 'Ranked by highest shortlist submissions' : "This cycle's standouts"}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex-1 flex flex-col">
            {/* segmented toggle */}
            <div className="flex items-center bg-card border border-border rounded-full p-1 gap-1 mb-3">
              {([['scouts','Scouts'],['players','Top players']] as const).map(([key,label]) => (
                <button key={key} type="button" onClick={() => setBoard(key)}
                  className={`flex-1 px-3 py-1.5 rounded-full font-body font-bold text-[12px] ${board === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
            {/* ranked list */}
            <div className="flex flex-col">
              {leaders.map((p,i) => (
                <div key={p.n} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-black text-[12px] shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground'}`}>{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-bold text-[14px] text-foreground truncate">{p.n}</div>
                    {board === 'scouts' && <div className="font-body text-[11px] text-muted-foreground truncate">{(p as any).role}</div>}
                  </div>
                  <span className="font-heading font-black text-[14px] text-foreground tabular-nums">{p.c}</span>
                  {board === 'scouts' && (p as any).removable && (
                    <button type="button" onClick={() => setRemovedScouts(prev => [...prev, p.n])}
                      title="Remove senior scout from list" aria-label={`Remove ${p.n}`}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4 — Talent map (scatter) — kept as-is */}
        <div className={`lg:col-span-2 ${CARD}`}>
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-[16px] text-foreground">Talent map</h3>
                <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Derivable</span>
              </div>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Eyeball rating vs age — bubble = video coverage</p>
            </div>
          </div>
          <div className="px-3 sm:px-5 py-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-h-[200px]" preserveAspectRatio="xMidYMid meet">
              {/* priority quadrant tint */}
              <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill="#061b2e" opacity="0.06" rx="8" />
              <rect x={zoneX} y={zoneY} width={zoneW} height={zoneH} fill="none" stroke="#061b2e" strokeOpacity="0.18" strokeDasharray="4 4" rx="8" />
              <text x={pR-6} y={zoneY+16} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="800">PRIORITY</text>
              {/* horizontal gridlines + Y labels (rating) */}
              {[6,7,8,9].map(g => (
                <g key={g}>
                  <line x1={pL} y1={sy(g)} x2={pR} y2={sy(g)} stroke="#d2e7fa" strokeWidth="1" />
                  <text x={pL-8} y={sy(g)+3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g.toFixed(1)}</text>
                </g>
              ))}
              {/* X axis ticks (age) — reversed, younger to the right */}
              {[22,20,18,16].map(a => (
                <text key={a} x={sx(a)} y={pB+16} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{a}</text>
              ))}
              <text x={(pL+pR)/2} y={H-3} textAnchor="middle" fontSize="9" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="800">AGE — younger →</text>
              {/* dots */}
              {TALENT.map(d => {
                const prio = isPriority(d.age, d.r);
                return (
                  <circle key={d.n} cx={sx(d.age)} cy={sy(d.r)} r={rad(d.v)}
                    fill={prio ? '#061b2e' : '#b8d4ef'} fillOpacity={prio ? 0.9 : 0.85}
                    stroke={prio ? '#061b2e' : '#7baac7'} strokeWidth="1.5">
                    <title>{`${d.n} · age ${d.age} · eyeball ${d.r.toFixed(1)} · ${d.v} videos`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Row 2: Conversion trend + Archived by stage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">

        {/* Card 1 — Conversion trend */}
        <div className={`lg:col-span-2 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Conversion trend</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Active pipeline, monthly</p>
            </div>
            {/* Country pill dropdown — drives the chart + stat data */}
            <div className="relative shrink-0">
              <button type="button" onClick={() => setCountryOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border font-body font-bold text-[12px] text-foreground hover:border-primary">
                <Search size={14} />
                <span className="whitespace-nowrap">{country}</span>
                <ChevronDown size={12} />
              </button>
              {countryOpen && (
                <div className="absolute right-0 mt-2 z-20 min-w-[160px] bg-card border border-border rounded-[12px] shadow-[var(--shadow-lg)] overflow-hidden py-1">
                  {COUNTRIES.map(c => (
                    <button key={c} type="button" onClick={() => { setCountry(c); setCountryOpen(false); }}
                      className={`w-full text-left px-3 py-2 font-body font-bold text-[12px] hover:bg-accent ${c === country ? 'text-primary' : 'text-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stat row */}
          <div className="px-5 py-4 border-b border-border flex flex-wrap gap-x-8 gap-y-3">
            {convStats.map(([label,val]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="font-heading font-black text-[16px] text-foreground">{val}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${CV_W} ${CV_H}`} className="w-full" style={{ height:220 }} preserveAspectRatio="xMidYMid meet">
              {/* gridlines */}
              {cvGrid.map(g => (
                <g key={g}>
                  <line x1={cvpL} y1={cvY(g)} x2={cvpR} y2={cvY(g)} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={cvpL-6} y={cvY(g)+3} textAnchor="end" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{g}</text>
                </g>
              ))}
              {/* month labels */}
              {convMonths.map((m,i) => (
                <text key={m} x={cvX(i)} y={cvpB+20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{m}</text>
              ))}
              {/* series */}
              {cvSeries.map((s,si) => (
                <g key={s.label}>
                  <path d={cvPath(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {s.data.map((v,i) => {
                    const isH = hoverPt?.s===si && hoverPt?.i===i;
                    return (
                      <g key={i}>
                        <circle cx={cvX(i)} cy={cvY(v)} r={isH?6:3} fill={s.color} className="transition-all" />
                        {isH && (
                          <text x={cvX(i)} y={cvY(v)-10} textAnchor="middle" fontSize="11" fontWeight="800" fill={s.color} fontFamily="Figtree, sans-serif">{v}</text>
                        )}
                        <circle cx={cvX(i)} cy={cvY(v)} r={11} fill="transparent" className="cursor-pointer"
                          onMouseEnter={()=>setHoverPt({s:si,i})} onMouseLeave={()=>setHoverPt(null)}>
                          <title>{`${convMonths[i]} · ${s.label}: ${v}`}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {cvSeries.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:s.color }} />
                  <span className="font-heading font-bold text-[12px] text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="font-body text-[11px] text-muted-foreground mt-2">Signed dates tracked from deployment onward.</p>
          </div>
        </div>

        {/* Card 2 — Archived by stage */}
        <div className={`lg:col-span-1 ${CARD} flex flex-col`}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Archived by stage</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Archived from the pipeline, monthly</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="px-5 py-4 border-b border-border flex flex-wrap gap-x-8 gap-y-3">
            {[['LONG','98'],['SHORT','402'],['TARGET','17']].map(([label,val]) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="font-heading font-black text-[16px] text-foreground">{val}</span>
              </div>
            ))}
          </div>

          {/* Chart — stacked bars */}
          <div className="px-5 py-4 flex-1 flex flex-col">
            <svg viewBox={`0 0 ${AR_W} ${AR_H}`} className="w-full" style={{ height:220 }} preserveAspectRatio="xMidYMid meet">
              {/* gridlines */}
              {arGrid.map(f => {
                const y = arpB - f*arPlotH;
                return <line key={f} x1={arpL} y1={y} x2={arpR} y2={y} stroke="#d2e7fa" strokeWidth="1" strokeDasharray="4 4" />;
              })}
              {/* bars */}
              {archived.map((a,i) => {
                const cx = arpL + (i+0.5)*arSlot;
                const x = cx - arBarW/2;
                const lh = arSeg(a.long), sh = arSeg(a.short), th = arSeg(a.target);
                const yLong = arpB - lh, yShort = yLong - sh, yTarget = yShort - th;
                return (
                  <g key={i}>
                    <rect x={x} y={yLong}   width={arBarW} height={lh} fill="#2563eb" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Long: ${a.long}`}</title>
                    </rect>
                    <rect x={x} y={yShort}  width={arBarW} height={sh} fill="#E8A838" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Short: ${a.short}`}</title>
                    </rect>
                    <rect x={x} y={yTarget} width={arBarW} height={th} fill="#8b5cf6" className="cursor-pointer transition-opacity hover:opacity-70">
                      <title>{`${archMonths[i]} · Target: ${a.target}`}</title>
                    </rect>
                    <text x={cx} y={arpB+20} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{archMonths[i]}</text>
                  </g>
                );
              })}
            </svg>
            {/* legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              {[['Long','#2563eb'],['Short','#E8A838'],['Target','#8b5cf6']].map(([label,color]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background:color }} />
                  <span className="font-heading font-bold text-[12px] text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
  const addTask = (input: string | { text: string; assignedTo?: string; dueDate?: string; priority?: Task['priority'] }) => {
    const t = typeof input === 'string' ? { text: input } : input;
    const nowLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setTasks(prev => [...prev, {
      id: `t${Date.now()}`, text: t.text,
      priority: t.priority ?? 'Medium', dueDate: t.dueDate || 'This week',
      assignedTo: t.assignedTo || 'Me', allocated: nowLabel, completed: false,
    }]);
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

  const tabs: { id: LeadTab; label: string }[] = [
    { id:'overview',  label:'Overview'  },
    { id:'pipeline',  label:'Pipeline'  },
    { id:'reports',   label:'Reports'   },
    { id:'analytics', label:'Analytics' },
    { id:'target',    label:'Tasks'     },
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
              {activeTab==='target'    && <TargetTab tasks={tasks} onToggle={toggleTask} onAdd={addTask} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}