import React, { useState, useMemo } from 'react';
import {
  Search, Calendar, Plus, Bell, X, FileText,
  Video, TrendingUp, Target, CheckCircle, Clock,
  Eye, EyeOff, Star, Crosshair, Zap, ArrowRight,
  MoreVertical, Edit2, Trash2, LogOut,
  Radio, Play, Check, Trophy, Medal, Download, User, RefreshCw,
  Phone, Route, ArrowUpRight, Film
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { SeniorLeadPlayersPage, HIGHLIGHTS_FEED } from '../components/SeniorLeadPlayersPage';
import { PlayerVideoWorkspace } from '../components/PlayerVideoWorkspace';
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
  id: string; text: string; priority: 'High' | 'Low'; dueDate: string;
  assignedTo: string; playerName?: string; isTargetTask?: boolean; completed: boolean;
}
interface Pkg {
  id: string; playerName: string; initials: string; scout: string;
  list: 'short' | 'target'; clipCount: number; watched: boolean; uploadDate: string;
}
interface MatchItem {
  id: string; home: string; away: string; date: string;
  competition: string; targetPlayers: string[];
}
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

const MOCK_TASKS: Task[] = [
  { id:'t1', text:'Review Kofi Mensah target package', priority:'High', dueDate:'Today', assignedTo:'David (Senior)', playerName:'Kofi Mensah', isTargetTask:true, completed:false },
  { id:'t2', text:'File report on Amadou Sarr', priority:'High', dueDate:'Today', assignedTo:'Me', completed:false },
  { id:'t3', text:'Cross-check David Conteh stats', priority:'Low', dueDate:'Dec 18', assignedTo:'David (Senior)', playerName:'David Conteh', isTargetTask:true, completed:false },
  { id:'t4', text:'Submit Combined Top 10 — Ghana cycle', priority:'High', dueDate:'Dec 19', assignedTo:'Me', completed:false },
  { id:'t5', text:'Update PLR grades on Short List', priority:'Low', dueDate:'Dec 22', assignedTo:'Me', completed:true },
];

const MOCK_PKGS: Pkg[] = [
  { id:'p1', playerName:'Kofi Mensah',   initials:'KM', scout:'David', list:'target', clipCount:8,  watched:false, uploadDate:'2 days ago' },
  { id:'p2', playerName:'David Conteh',  initials:'DC', scout:'David', list:'target', clipCount:6,  watched:true,  uploadDate:'3 days ago' },
  { id:'p3', playerName:'Kazungu Nesta', initials:'KN', scout:'David', list:'short',  clipCount:9,  watched:false, uploadDate:'5 days ago' },
  { id:'p4', playerName:'Amadou Sarr',   initials:'AS', scout:'Tom',   list:'short',  clipCount:12, watched:true,  uploadDate:'1 week ago' },
  { id:'p5', playerName:'Cheikh Diop',   initials:'CD', scout:'Tom',   list:'short',  clipCount:5,  watched:true,  uploadDate:'2 weeks ago' },
];

const MOCK_MATCHES: MatchItem[] = [
  { id:'m1', home:'Enyimba FC',   away:'Kano Pillars', date:'Dec 16', competition:'NPFL',           targetPlayers:['Kofi Mensah'] },
  { id:'m2', home:'Hawks FC',     away:'Fauve Azur',   date:'Dec 18', competition:'Liga Revelação', targetPlayers:['David Conteh','Kazungu Nesta'] },
  { id:'m3', home:'Imperial FC',  away:'ATS',          date:'Dec 21', competition:'CAF U20',        targetPlayers:['Amadou Sarr'] },
];

const INITIAL_NOTIFS: AppNotif[] = [
  { id:'n1', text:'David uploaded Kofi Mensah package', time:'1h ago',    read:false, type:'package' },
  { id:'n2', text:'New report filed on David Conteh',   time:'3h ago',    read:false, type:'report'  },
  { id:'n3', text:"Wekesa O. hasn't submitted Top 10",  time:'Yesterday', read:true,  type:'nudge'   },
];

const PriorityPill = ({ p }: { p: 'High' | 'Low' }) => (
  <span className={`inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-black border ${p==='High'?'bg-background text-foreground border-border':'bg-muted-foreground/10 text-muted-foreground border-transparent'}`}>{p}</span>
);

// ─── Grade Colour Panel ───────────────────────────────────────────────────────
const GradeColorPanel = ({ colors, onUpdate, onClose }: { colors: GradeColorMap; onUpdate: (g: string, c: string) => void; onClose: () => void }) => (
  <div className="absolute right-0 top-12 z-50 bg-card rounded-[24px] shadow-2xl border border-border p-6 w-64" onClick={e => e.stopPropagation()}>
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
      <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 bg-primary rounded-t-[32px] flex items-center justify-between">
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
      className={`w-full px-4 py-3 rounded-[16px] text-left font-body font-bold text-[14px] transition-all border flex items-center gap-3 ${
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
      <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-lg border border-border max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="px-8 py-5 bg-primary rounded-t-[32px] flex items-center justify-between shrink-0">
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
                  className={`w-full px-4 py-3 rounded-[16px] text-left font-body font-bold text-[14px] transition-all border flex items-center gap-2 ${
                    addingManually ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-foreground border-dashed border-border hover:border-primary/50'
                  }`}>
                  <Plus size={14} /> Not on platform — add manually
                </button>
              </div>
              {/* Manual entry form */}
              {addingManually && (
                <div className="mt-2 p-4 bg-card border border-border rounded-[16px] space-y-3">
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
              <div className="bg-card rounded-[16px] border border-border p-4">
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
  { id:'ls1', name:'Yamirou Ouorou',   pos:'LW', birthYear:2006, yearSigned:2024, grade:'A'  },
  { id:'ls2', name:'Abdul Moro',       pos:'DM', birthYear:2008, yearSigned:2024, grade:'A+' },
  { id:'ls3', name:'Tape Christ',      pos:'LB', birthYear:2006, yearSigned:2024, grade:'A+' },
  { id:'ls4', name:'Seyi Ogunniyi',    pos:'RB', birthYear:2007, yearSigned:2025, grade:'A'  },
  { id:'ls5', name:'Abdoulaye Gouba',  pos:'CM', birthYear:2007, yearSigned:2025, grade:'A+' },
  { id:'ls6', name:'Ismaila Ceesay',   pos:'RW', birthYear:2008, yearSigned:2026, grade:'A'  },
  { id:'ls7', name:'Kingsley Bimpong', pos:'LW', birthYear:2007, yearSigned:2026, grade:'A'  },
  { id:'ls8', name:'Arnold Adu',       pos:'AM', birthYear:2008, yearSigned:2026, grade:'A'  },
  { id:'ls9', name:'Francis Gomez',    pos:'RW', birthYear:2009, yearSigned:2028, grade:'A+' },
];
const LEAD_POSITIONS = ['ST','RW','LW','AM','CM','DM','RB','LB','RCB','LCB','GK'];
const LEAD_GRADE_BG: Record<string,string> = { 'A+':'#061b2e','A':'#E8A838','B+':'#061b2e','B':'#7baac7' };

const PipelineTab = () => {
  const [signedPlayers, setSignedPlayers] = React.useState<SignedPipelinePlayer[]>(LEAD_SIGNED_DATA);
  const [showAddSigned, setShowAddSigned] = React.useState(false);
  const [newSigned, setNewSigned] = React.useState<Partial<SignedPipelinePlayer>>({});
  const navigate = useNavigate();

  const signedYears = React.useMemo(() => {
    const ys = [...new Set(signedPlayers.map(p => p.yearSigned))].sort();
    return ys.length === 0 ? [new Date().getFullYear()] : ys;
  }, [signedPlayers]);

  const getSignedAt = (pos: string, year: number) =>
    signedPlayers.filter(p => p.pos === pos && p.yearSigned === year);

  const funnelStages = [
    { label: 'Database',    count: 60, path: '/lead-scout/players', color: '#d2e7fa', textColor: 'text-muted-foreground' },
    { label: 'Long List',   count: 28, path: '/lead-scout/players', color: '#E8A838', textColor: 'text-white' },
    { label: 'Short List',  count: 14, path: '/lead-scout/players', color: '#061b2e', textColor: 'text-white' },
    { label: 'Target List', count: 6,  path: '/lead-scout/players', color: '#061b2e', textColor: 'text-foreground' },
    { label: 'Signed',      count: signedPlayers.length, path: '/lead-scout/players', color: '#061b2e', textColor: 'text-white' },
  ];
  const maxCount = Math.max(...funnelStages.map(s => s.count));

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
    <div className="flex flex-col gap-4">

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4 xl:items-start">

      {/* ── Section A: Funnel Graph ── */}
      <div className="bg-card rounded-[32px] border border-border p-6 shadow-[var(--shadow-lg)]">
        <div className="mb-4">
          <h3 className="font-heading font-bold text-[20px] text-foreground">Pipeline Overview</h3>
          <span className="font-body text-[12px] font-medium text-muted-foreground">Click a stage to open that list</span>
        </div>
        <div className="space-y-3">
          {funnelStages.map((s) => (
            <div key={s.label} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(s.path)}>
              <span className="font-body text-[13px] font-bold text-muted-foreground w-20 shrink-0">{s.label}</span>
              <div className="flex-1 h-10 bg-accent rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-full rounded-xl flex items-center px-4 transition-all duration-700 group-hover:opacity-90"
                  style={{ width: `${Math.max((s.count / maxCount) * 100, 8)}%`, backgroundColor: s.color }}>
                  <span className={`font-mono font-black text-[14px] ${s.textColor}`}>{s.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section B: Signed Pipeline Grid ── */}
      <div className="bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-[24px] text-foreground">Signed Pipeline</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium mt-1">
              {signedPlayers.length} signed · Year column = age 18 (eligible to play)
            </p>
          </div>
          <button onClick={() => setShowAddSigned(true)}
            className="flex items-center gap-2 bg-transparent border-2 border-primary text-foreground hover:bg-primary/10 rounded-full px-4 py-2 font-body font-bold text-[14px] transition-colors">
            <Plus size={13} />Sign Player
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-primary px-5 py-3 text-left w-12 border-r border-white/10">
                  <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Pos</span>
                </th>
                {signedYears.map(year => (
                  <th key={year} className="bg-primary px-6 py-3 text-center border-r border-white/10 min-w-[180px]">
                    <span className="font-heading font-bold text-[14px] text-chalk">{year + 18}</span>
                    <span className="font-body text-[10px] text-muted-foreground block">({year})</span>
                  </th>
                ))}
                <th className="bg-primary px-4 py-3 text-center min-w-[80px]">
                  <span className="font-body text-[12px] text-white/20 font-medium">+ future</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {LEAD_POSITIONS.filter(pos => signedPlayers.some(p => p.pos === pos)).map((pos, rowIdx) => (
                <tr key={pos} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-accent'}>
                  <td className={`sticky left-0 z-10 px-5 py-3 border-r border-border border-b border-border ${rowIdx % 2 === 0 ? 'bg-card' : 'bg-accent'}`}>
                    <span className="font-heading font-black text-[14px] text-foreground">{pos}</span>
                  </td>
                  {signedYears.map(year => {
                    const cell = getSignedAt(pos, year);
                    return (
                      <td key={year} className="px-4 py-3 border-r border-border border-b border-border align-top min-w-[180px]">
                        {cell.length === 0 ? <div className="h-7" /> : (
                          <div className="flex flex-col gap-2">
                            {cell.map(player => (
                              <div key={player.id} className="flex items-center gap-2">
                                <span className="font-body font-bold text-[14px] text-foreground truncate flex-1 min-w-0">{player.name}</span>
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
                  <td className="px-3 py-3 border-b border-border" />
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
          <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[32px] flex items-center justify-between">
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
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
// ─── Target Tab ───────────────────────────────────────────────────────────────
function TargetTab({ tasks, onToggle, onAdd }: { tasks: any[]; onToggle: (id: any) => void; onAdd: (label: string) => void }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const open = total - completed;
  const openTasks = tasks.filter(t => !t.completed);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border">
          <div className="w-12 h-12 rounded-[16px] bg-primary flex items-center justify-center shrink-0">
            <Target size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-black text-[24px] text-foreground leading-none">Target Tasks</h3>
            <p className="font-body text-[12px] text-muted-foreground font-medium mt-1">{completed}/{total} done · {open} remaining</p>
          </div>
          <button onClick={() => onAdd('New assigned task')}
            className="shrink-0 font-body text-[13px] font-black px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            ＋ Assign
          </button>
        </div>

        {/* Body */}
        <div className="divide-y divide-border">
          {openTasks.length === 0 && (
            <div className="px-6 py-8 text-center font-body text-[14px] text-muted-foreground">No open tasks.</div>
          )}
          {openTasks.map(task => (
            <div key={task.id}
              className={`flex items-center gap-3 px-6 py-4 flex-wrap ${task.isTargetTask ? 'border-l-[3px] border-primary' : ''}`}>
              <button onClick={() => onToggle(task.id)}
                className="w-5 h-5 rounded-full border-2 border-border hover:border-primary shrink-0 transition-colors"
                aria-label="Mark task complete" />
              <span className="flex-1 min-w-0 font-body font-bold text-[14px] text-foreground">{task.text}</span>
              {task.isTargetTask && (
                <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full font-body text-[10px] font-black bg-primary/15 text-foreground border border-primary/20">
                  <Crosshair size={10} /> Target
                </span>
              )}
              <PriorityPill p={task.priority} />
              <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full font-body text-[10px] font-black bg-accent text-muted-foreground">
                <Clock size={10} /> {task.dueDate}
              </span>
              <span className="font-body text-[12px] text-muted-foreground font-medium">→ {task.assignedTo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    { label: 'Partner', count: 10 },
    { label: 'Feeder',  count: 15 },
    { label: 'AB',      count: 8  },
  ];
  const maxPathway = Math.max(...BY_PATHWAY.map(p => p.count));
  const BY_STATUS = [
    { label: 'Trialing', count: 21, bar: 'bg-primary'    },
    { label: 'Offer',    count: 11, bar: 'bg-primary/60' },
    { label: 'Signed',   count: 4,  bar: '',             style: { backgroundColor: 'var(--scout-green)' } as React.CSSProperties },
  ];
  const maxStatus = Math.max(...BY_STATUS.map(s => s.count));

  return (
    <div className="flex flex-col gap-[var(--gap-grid)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--gap-grid)] lg:items-start">

        {/* LEFT COLUMN — KPI row + Target breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-[var(--gap-grid)]">

          {/* KPI cards — single horizontal row (4-up desktop / 2-up mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[var(--gap-grid)]">

        {/* Card 1 — Reports */}
        <button onClick={() => onNavigate('reports')} className="flex flex-col justify-between p-6 bg-card rounded-[36px] border border-border shadow-[var(--shadow-lg)] min-h-[204px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Reports by senior scouts</span>
            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="flex items-end justify-between gap-2 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className="font-heading font-extrabold text-3xl tabular-nums text-foreground leading-none">27</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: 'color-mix(in srgb, var(--scout-green) 15%, transparent)', color: 'var(--scout-green)' }}>+4 today</span>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap">Opens Reports</span>
          </div>
        </button>

        {/* Card 2 — Coverage */}
        <button onClick={() => onNavigate('reports')} className="flex flex-col justify-between p-6 bg-card rounded-[36px] border border-border shadow-[var(--shadow-lg)] min-h-[204px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Shortlist report coverage</span>
            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="flex items-end justify-between gap-2 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className="font-heading font-extrabold text-3xl tabular-nums text-foreground leading-none">8<span className="text-muted-foreground">/14</span></span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: 'color-mix(in srgb, var(--scout-amber) 15%, transparent)', color: 'var(--scout-amber)' }}>6 Pending</span>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap">View Coverage</span>
          </div>
        </button>

        {/* Card 3 — Players */}
        <button onClick={() => goToSection('short-list')} className="flex flex-col justify-between p-6 bg-card rounded-[36px] border border-border shadow-[var(--shadow-lg)] min-h-[204px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Players in Target + Short</span>
            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="flex items-end justify-between gap-2 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className="font-heading font-extrabold text-3xl tabular-nums text-foreground leading-none">20</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-accent text-muted-foreground font-semibold">14 Short</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-accent text-muted-foreground font-semibold">6 Target</span>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap">Opens Short List</span>
          </div>
        </button>

        {/* Card 4 — A+ Grade */}
        <button onClick={() => navigate('/lead-scout/players?section=short-list&grade=A%2B')} className="flex flex-col justify-between p-6 bg-card rounded-[36px] border border-border shadow-[var(--shadow-lg)] min-h-[204px] hover:-translate-y-1 hover:shadow-xl transition-all group text-left w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground">A+ in reports</span>
            <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
          <div className="flex items-end justify-between gap-2 flex-wrap">
            <div className="flex items-end gap-2 min-w-0">
              <span className="font-heading font-extrabold text-3xl tabular-nums text-foreground leading-none">33%</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-primary/10 text-primary">Elite Tier</span>
            </div>
            <span className="text-xs font-semibold text-primary group-hover:underline shrink-0 whitespace-nowrap">A+ on Short List</span>
          </div>
          </button>
          </div>

          {/* Target breakdown — grows to fill remaining height */}
          <div className="bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
              <h3 className="font-heading font-black text-[16px] text-foreground">Target breakdown</h3>
              <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Derivable</span>
            </div>
            <div className="p-4 sm:p-6 space-y-5">
            <div>
              <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">By pathway</span>
              <div className="space-y-2 mt-2">
                {BY_PATHWAY.map(p => (
                  <div key={p.label} className="flex items-center gap-2">
                    <span className="font-body font-bold text-[12px] text-muted-foreground w-14 shrink-0 truncate">{p.label}</span>
                    <div className="flex-1 h-4 bg-accent rounded-full overflow-hidden min-w-0">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max((p.count / maxPathway) * 100, 8)}%` }} />
                    </div>
                    <span className="font-mono font-black text-[12px] text-foreground w-6 text-right shrink-0 tabular-nums">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">By status</span>
              <div className="space-y-2 mt-2">
                {BY_STATUS.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="font-body font-bold text-[12px] text-muted-foreground w-14 shrink-0 truncate">{s.label}</span>
                    <div className="flex-1 h-4 bg-accent rounded-full overflow-hidden min-w-0">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${Math.max((s.count / maxStatus) * 100, 8)}%`, ...(s.style || {}) }} />
                    </div>
                    <span className="font-mono font-black text-[12px] text-foreground w-6 text-right shrink-0 tabular-nums">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Latest Highlights + Upcoming Matches (unchanged) */}
        <div className="lg:col-span-1 flex flex-col gap-[var(--gap-grid)]">

          {/* Latest Videos */}
          <div className="bg-card rounded-[24px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Film size={16} className="text-foreground" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-[16px] text-foreground">Latest Videos</h3>
                  <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Live</span>
                </div>
                <p className="font-body text-[12px] text-muted-foreground font-medium">Newest videos by player</p>
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground shrink-0" />
            </div>
            <div className="divide-y divide-border max-h-[200px] lg:max-h-[220px] overflow-y-auto">
              {HIGHLIGHTS_FEED.map(h => (
                <button key={h.id} onClick={() => setVideoPlayer({ id: h.id, name: h.name, posAcronym: h.posAcronym })}
                  className="w-full px-4 sm:px-6 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-primary text-chalk flex items-center justify-center font-body font-black text-[12px] shrink-0">{h.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body font-bold text-[14px] text-foreground truncate">{h.name}</span>
                      <span className={`font-body text-[10px] font-black px-2 py-0.5 rounded-full ${h.list === 'short' ? 'bg-primary/15 text-primary' : 'bg-accent text-foreground'}`}>
                        {h.list === 'short' ? 'Short' : 'Target'}
                      </span>
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

          {/* Upcoming Matches */}
          <div className="bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-foreground" /></div>
                <div>
                  <h3 className="font-heading font-semibold text-[16px] text-foreground">Upcoming Matches</h3>
                  <p className="font-body text-[12px] text-muted-foreground font-medium">Target List players</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {MOCK_MATCHES.map(match => (
                <div key={match.id} className="px-6 py-4 hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body font-bold text-[14px] text-foreground">{match.home} vs {match.away}</span>
                    <span className="font-body text-[12px] font-black text-foreground">{match.date}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-[10px] font-medium text-muted-foreground">{match.competition}</span>
                    {match.targetPlayers.map(name => (
                      <span key={name} className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-background text-foreground border border-border">{name}</span>
                    ))}
                  </div>
                </div>
              ))}
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
const ChampionPodium = ({ scouts }: { scouts: { name: string; role: string; count: number }[] }) => {
  const sorted = [...scouts].sort((a, b) => b.count - a.count);
  const first = sorted[0]; const second = sorted[1]; const third = sorted[2];
  const PodiumPerson = ({ scout, rank, height }: { scout: { name: string; role: string; count: number }; rank: 1|2|3; height: string }) => {
    const c = rank === 1 ? { bg: 'bg-primary', text: 'text-chalk', border: 'border-primary' }
            : rank === 2 ? { bg: 'bg-accent', text: 'text-foreground', border: 'border-border' }
            : { bg: 'bg-card', text: 'text-muted-foreground', border: 'border-border' };
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-heading font-semibold text-[16px] border-2 ${c.bg} ${c.text} ${c.border}`}>
            {scout.name[0]}
          </div>
          {rank === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Trophy size={16} className="text-[#E8A838]" /></div>}
          {rank === 2 && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2"><Medal size={13} className="text-muted-foreground" /></div>}
          {rank === 3 && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2"><Medal size={13} className="text-[#CD7F32]" /></div>}
        </div>
        <div className="text-center">
          <p className="font-heading font-black text-[14px] text-foreground">{scout.name}</p>
          <p className="font-body text-[10px] text-muted-foreground">{scout.role}</p>
        </div>
        <div className={`flex flex-col items-center justify-end rounded-t-[8px] w-[72px] ${c.bg}`} style={{ height }}>
          <span className={`font-heading font-black text-[20px] mb-2 ${c.text}`}>{scout.count}</span>
          <span className={`font-body text-[10px] font-bold mb-2 uppercase tracking-wide ${rank === 1 ? 'text-chalk/60' : 'text-muted-foreground/70'}`}>reports</span>
        </div>
      </div>
    );
  };
  return (
    <div className="bg-card rounded-[28px] border border-border p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-[#E8A838]" />
        <h3 className="font-heading font-black text-[15px] text-foreground">Report Champion</h3>
        <span className="font-body text-[12px] text-muted-foreground ml-1">This cycle</span>
      </div>
      <div className="flex items-end justify-center gap-3 pt-4">
        {second && <PodiumPerson scout={second} rank={2} height="64px" />}
        {first  && <PodiumPerson scout={first}  rank={1} height="88px" />}
        {third  && <PodiumPerson scout={third}  rank={3} height="48px" />}
      </div>
    </div>
  );
};

const REPORT_GRADE_SCORE: Record<string, number> = { 'A+': 96, 'A': 90, 'B+': 82, 'B': 74, 'C+': 66, 'C': 60 };
const gradeToScore = (g: string) => REPORT_GRADE_SCORE[g] ?? 70;

const ReportsTab = ({ onAddReport }: { onAddReport: () => void }) => {
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const reports = [
    { id:'r1', player:'Kofi Mensah',   initials:'KM', pos:'ST',  plr:'A+', pog:'A',  nxt:'T', date:'Dec 14', scout:'Mbugua', viewed:false, notes:'Exceptional finishing ability. Outstanding movement off the ball.' },
    { id:'r2', player:'David Conteh',  initials:'DC', pos:'LW',  plr:'A',  pog:'B',  nxt:'M', date:'Dec 12', scout:'Tom',    viewed:true,  notes:'Impressive left foot. Dribbling past defenders with ease.' },
    { id:'r3', player:'Amadou Sarr',   initials:'AS', pos:'CDM', plr:'B',  pog:'B',  nxt:'M', date:'Dec 10', scout:'Tom',    viewed:true,  notes:'Solid defensive midfielder. Consistent performance.' },
    { id:'r4', player:'Kazungu Nesta', initials:'KN', pos:'CM',  plr:'B',  pog:'B',  nxt:'M', date:'Dec 8',  scout:'Nene',   viewed:false, notes:'Good vision, passing range excellent.' },
    { id:'r5', player:'Francis Gomez', initials:'FG', pos:'RW',  plr:'A',  pog:'A',  nxt:'T', date:'Nov 28', scout:'Nene',   viewed:true,  notes:'Outstanding on the right flank. Ready for the next level.' },
    { id:'r6', player:'Abdul Moro',    initials:'AM', pos:'CM',  plr:'B',  pog:'A',  nxt:'T', date:'Nov 25', scout:'Mbugua', viewed:true,  notes:'Very composed on the ball. Reads the game well.' },
  ];
  const scoutCounts = [
    { name: 'Mbugua', role: 'Senior Scout', count: 2 },
    { name: 'Tom',    role: 'Lead Scout',   count: 2 },
    { name: 'Nene',   role: 'Head Scout',   count: 2 },
  ];
  const unreadCount = reports.filter(r => !r.viewed).length;
  const gradeACount = reports.filter(r => r.plr === 'A' || r.plr === 'A+').length;
  const shown = filter === 'unread' ? reports.filter(r => !r.viewed) : reports;
  const summaryStats = [
    { label: 'Total', value: reports.length.toString(), sub: 'All time', icon: FileText },
    { label: 'Unread', value: unreadCount.toString(), sub: 'Need review', icon: Eye },
    { label: 'Grade A/A+', value: gradeACount.toString(), sub: 'Top PLR', icon: Star },
    { label: 'This Month', value: reports.length.toString(), sub: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar },
  ];
  const champion = [...scoutCounts].sort((a, b) => b.count - a.count)[0];
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Stat tiles + champion (elevated, no wrapper card) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-[24px] p-5 shadow-[var(--shadow-lg)] flex flex-col gap-2 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Icon size={16} className="text-primary" /></div>
              </div>
              <div className="font-heading font-extrabold text-[36px] text-foreground leading-none">{stat.value}</div>
              <span className="font-body text-[12px] text-muted-foreground font-medium">{stat.sub}</span>
            </div>
          );
        })}
        {/* Champion — winner (not a card) */}
        <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center gap-2 py-2">
          <style>{`@keyframes champBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.champ-bob{animation:champBob 2.4s ease-in-out infinite}`}</style>
          <Trophy size={44} strokeWidth={1.5} className="text-[#E8A838] champ-bob" />
          <div className="text-center">
            <div className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Champion</div>
            <div className="font-heading font-black text-[16px] text-foreground leading-tight">{champion.name}</div>
            <div className="font-body text-[11px] text-muted-foreground">{champion.count} reports</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-body font-bold text-[14px] border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
              {f === 'all' ? `All (${reports.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }}
            className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2 rounded-full font-body font-bold text-[14px] hover:border-primary hover:text-primary transition-colors">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
          </button>
          <button onClick={onAddReport} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full font-body font-bold text-[14px] hover:bg-primary/80 shadow-md">
            <Plus size={14} />Add Report
          </button>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(r => {
          const overall = Math.round((gradeToScore(r.plr) + gradeToScore(r.pog)) / 2);
          return (
          <div key={r.id}
            className={`bg-card rounded-[24px] border p-5 flex flex-col gap-3 hover:shadow-xl transition-all ${r.viewed ? 'border-border shadow-[var(--shadow-lg)]' : 'border-primary shadow-md'}`}>
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
              {!r.viewed && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />}
            </div>
            {/* Notes */}
            <p className="font-body text-[13px] text-muted-foreground line-clamp-2">{r.notes}</p>
            {/* Grade strip */}
            <div className="grid grid-cols-3 gap-2">
              {([['PLR', r.plr], ['POG', r.pog], ['NXT', r.nxt]] as const).map(([k, v]) => (
                <div key={k} className="bg-accent/50 rounded-[14px] py-2 text-center">
                  <div className="font-heading font-black text-[16px] text-foreground leading-none">{v}</div>
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
            <div className="flex items-center gap-2 pt-3 border-t border-border/60">
              <button className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full py-2 transition-colors"><Eye size={14} />View</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary rounded-full py-2 transition-colors"><Download size={14} />Export</button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const AnalyticsTab = () => {
  const navigate = useNavigate();
  const goToSection = (section: string) => navigate(`/lead-scout/players?section=${section}`);
  const [board, setBoard] = useState<'scouts' | 'players'>('scouts');

  const months = ['Aug','Sep','Oct','Nov','Dec','Jan'];
  const data = [8,11,14,12,18,14];
  const maxVal = Math.max(...data);
  const spW=300; const spH=80;
  const pts = data.map((v,i) => ({ x:(i/(data.length-1))*spW, y:spH-(v/maxVal)*(spH-10) }));
  const linePath = pts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${spH} L 0 ${spH} Z`;

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

  // ── Leaderboards ──
  const TOP_SCOUTS = [
    { name:'Kwame Asante',  value:38 },
    { name:'Chidi Obinna',  value:24 },
    { name:'Wekesa Omondi', value:18 },
    { name:'Emeka Okafor',  value:14 },
    { name:'Joseph Njoroge',value:11 },
  ];
  const TOP_PLAYERS = [
    { name:'Sory Traore', value:'8.6' },
    { name:'Kofi Mensah', value:'8.4' },
    { name:'Yaw Boateng', value:'8.3' },
    { name:'Musa Kamara', value:'8.2' },
    { name:'Amadou Sarr', value:'8.1' },
  ];
  const rankStyle = (rank:number): React.CSSProperties =>
    rank===1 ? { backgroundColor:'#E8A838', color:'#fff' }
    : rank===2 ? { backgroundColor:'#b8d4ef', color:'#061b2e' }
    : rank===3 ? { backgroundColor:'#CD7F32', color:'#fff' }
    : {};

  // ── Short→Target hit-rate trend ──
  const convMonths = ['Aug','Sep','Oct','Nov','Dec','Jan'];
  const convData = [22,28,31,35,38,41];
  const convMax = 50;
  const cW=300, cH=80;
  const cPts = convData.map((v,i) => ({ x:(i/(convData.length-1))*cW, y:cH-(v/convMax)*(cH-10) }));
  const cLine = cPts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  const cArea = `${cLine} L ${cPts[cPts.length-1].x} ${cH} L 0 ${cH} Z`;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Talent map + Leaderboards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">

        {/* Talent map — scatter */}
        <div className="lg:col-span-2 bg-card rounded-[24px] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Target size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-[16px] text-foreground">Talent map</h3>
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

        {/* Leaderboards */}
        <div className="bg-card rounded-[24px] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><Trophy size={16} className="text-[#E8A838]" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-[16px] text-foreground">Leaderboards</h3>
                <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Live</span>
              </div>
              <p className="font-body text-[12px] text-muted-foreground font-medium">This cycle's standouts</p>
            </div>
          </div>
          <div className="px-4 sm:px-5 py-4">
            {/* toggle */}
            <div className="flex items-center gap-1 p-1 bg-accent rounded-full mb-3">
              {([['scouts','Top scouts'],['players','Top players']] as const).map(([id,label]) => (
                <button key={id} onClick={() => setBoard(id)}
                  className={`flex-1 font-heading font-black text-[11px] py-1.5 rounded-full transition-colors ${board===id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {board==='scouts'
                ? TOP_SCOUTS.map((s,i) => (
                    <div key={s.name} className="flex items-center gap-3 px-2 py-2 rounded-[12px]">
                      <span className="w-6 h-6 rounded-full bg-accent text-muted-foreground flex items-center justify-center font-heading font-black text-[11px] shrink-0" style={rankStyle(i+1)}>{i+1}</span>
                      <span className="flex-1 min-w-0 font-body font-bold text-[14px] text-foreground truncate">{s.name}</span>
                      <span className="font-heading font-black text-[14px] tabular-nums text-foreground">{s.value}</span>
                    </div>
                  ))
                : TOP_PLAYERS.map((p,i) => (
                    <button key={p.name} onClick={() => goToSection('short-list')}
                      className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-accent transition-colors text-left">
                      <span className="w-6 h-6 rounded-full bg-accent text-muted-foreground flex items-center justify-center font-heading font-black text-[11px] shrink-0" style={rankStyle(i+1)}>{i+1}</span>
                      <span className="flex-1 min-w-0 font-body font-bold text-[14px] text-foreground truncate">{p.name}</span>
                      <span className="font-heading font-black text-[14px] tabular-nums text-foreground flex items-center gap-1"><Eye size={11} className="text-muted-foreground" />{p.value}</span>
                    </button>
                  ))
              }
            </div>
            <p className="font-body text-[11px] text-muted-foreground font-medium mt-3 px-2">
              {board==='scouts' ? 'Grade-A players found this season' : 'Highest eyeball rating on Short List'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Short→Target conversion trend ── */}
      <div className="bg-card rounded-[24px] border border-border shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-foreground" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-[16px] text-foreground">Conversion trend</h3>
                <span className="font-heading font-bold text-micro bg-accent text-muted-foreground rounded-full px-2">Derivable</span>
              </div>
              <p className="font-body text-[12px] text-muted-foreground font-medium">Short → Target hit-rate · last 6 months</p>
            </div>
          </div>
          <div className="text-left sm:text-right pl-13 sm:pl-0">
            <span className="font-heading font-extrabold text-h2 text-foreground leading-none tabular-nums">41%</span>
            <p className="font-body text-[12px] text-foreground font-bold mt-0.5">+19 pts since Aug</p>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-4">
          <svg viewBox={`0 0 ${cW} ${cH+24}`} className="w-full" style={{ height:110 }}>
            <defs>
              <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#061b2e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#061b2e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={cArea} fill="url(#convGrad)" />
            <path d={cLine} fill="none" stroke="#061b2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {cPts.map((p,i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={i===cPts.length-1?4:3} fill={i===cPts.length-1?'#061b2e':'#fff'} stroke="#061b2e" strokeWidth="2" />
                <text x={p.x} y={cH+18} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{convMonths[i]}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* ── Existing: Short List Tracked + Grade Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-[40px] border border-border shadow-[var(--shadow-lg)] p-[var(--pad-card)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="font-heading font-semibold text-h5 text-foreground">Short List Tracked</h3>
              <p className="font-body text-[12px] text-muted-foreground font-medium mt-1">Lead Scout · last 6 months</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="font-heading font-extrabold text-h2 text-foreground leading-none">+27%</span>
              <p className="font-body text-[12px] text-foreground font-bold mt-0.5">vs last period</p>
            </div>
          </div>
          <svg viewBox={`0 0 ${spW} ${spH+24}`} className="w-full mt-4" style={{ height:110 }}>
            <defs>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#061b2e" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#061b2e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#leadGrad)" />
            <path d={linePath} fill="none" stroke="#061b2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p,i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={i===pts.length-1?4:3} fill={i===pts.length-1?'#061b2e':'#fff'} stroke="#061b2e" strokeWidth="2" />
                <text x={p.x} y={spH+18} textAnchor="middle" fontSize="10" fill="#7baac7" fontFamily="Figtree, sans-serif" fontWeight="700">{months[i]}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="bg-primary rounded-[40px] p-[var(--pad-card)] flex flex-col gap-4">
          <h3 className="font-heading font-semibold text-h5 text-chalk">Grade Breakdown</h3>
          {[{g:'A+',n:4,w:80},{g:'A',n:6,w:60},{g:'B+',n:3,w:40},{g:'B',n:2,w:20}].map(({g,n,w}) => (
            <div key={g} className="flex items-center gap-3">
              <span className="font-body font-black text-[14px] text-chalk w-6">{g}</span>
              <div className="flex-1 h-3 bg-card/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width:`${w}%` }} />
              </div>
              <span className="font-mono font-bold text-[14px] text-muted-foreground w-4">{n}</span>
            </div>
          ))}
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
  const addTask = (text: string) => setTasks(prev => [...prev, { id:`t${Date.now()}`, text, priority:'High', dueDate:'This Week', assignedTo:'Me', completed:false }]);
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
          <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-md border border-border flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[32px] shrink-0">
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
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-[16px] hover:bg-accent cursor-pointer group" onClick={() => toggleTask(task.id)}>
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
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-[16px] opacity-50 cursor-pointer" onClick={() => toggleTask(task.id)}>
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
          <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[32px] shrink-0">
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
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-[24px] shadow-2xl border border-border z-50 overflow-hidden">
              <div className="px-6 py-4 bg-primary rounded-t-[24px] flex items-center justify-between">
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
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-card">
                <img src="https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=faces&q=80" alt="Tom" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">Tom</div>
                  <div className="font-body text-[12px] text-muted-foreground font-medium">Lead Scout</div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => { setShowProfileMenu(false); sessionStorage.clear(); navigate('/login'); }} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors">
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
              <div className="pt-8 mb-3">
                <h1 className="font-heading font-semibold text-[24px] md:text-[32px] tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                    <Star size={28} className="text-chalk" />
                  </span>
                  Tom
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-1">{subtitle}</p>
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