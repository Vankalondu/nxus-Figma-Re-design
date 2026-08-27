import React, { useState, useMemo } from 'react';
import {
  Search, Calendar, Plus, Bell, ChevronDown,
  Video, FileText, TrendingUp, Target,
  CheckCircle, Clock, Eye, EyeOff, Star,
  Crosshair, Zap, LayoutGrid, Users, X,
  ArrowRight, Settings, List, BarChart2, Package,
  Moon, Sun, LogOut,
  Radio, Play, Check, Trophy, Medal
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { CardView } from '../components/CardView';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { SeniorLeadPlayersPage } from '../components/SeniorLeadPlayersPage';
import { ResponsiveTabs } from '../components/ResponsiveTabs';

// Remove the inline definition or old CardView inside SeniorLeadPlayersPage logic if applicable.
// Since SeniorScoutDashboard uses SeniorLeadPlayersPage, I must check that component's file.
import { MatchesView } from './MatchesView';
import { AdminView } from './AdminView';
import CountryScoutDashboardPage from './CountryScoutDashboard';
import { MOCK_TASKS as SHARED_MOCK_TASKS, TaskInput } from '../components/dashboard/shared';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ReportsTab } from '../components/dashboard/ReportsTab';
import { AnalyticsTab } from '../components/dashboard/AnalyticsTab';
import { TasksTab } from '../components/dashboard/TasksTab';

// ─── Types ────────────────────────────────────────────────────────────────────
type DashTab = 'overview' | 'reports' | 'packages' | 'analytics' | 'tasks';
type ActivePage = 'dashboard' | 'players' | 'matches' | 'admin';
type TaskGroup = 'today' | 'week' | 'upcoming';

interface Task {
  id: string;
  text: string;
  priority: 'High' | 'Low';
  dueDate: string;
  dueGroup: TaskGroup;
  assignedTo: string;
  assignedBy: string;
  completed: boolean;
  isTargetTask?: boolean;
  playerName?: string;
}

interface HighPriorityPlayer {
  id: string; name: string; initials: string;
  pos: string; avgGrade: string; lastReport: number;
}

interface VideoPackage {
  id: string; playerName: string; initials: string;
  uploadDate: string; clipCount: number; watched: boolean;
  type: 'package' | 'match';
}

interface Report {
  id: string; playerName: string; initials: string;
  pos: string; grade: string; plr: string; por: string;
  date: string; notes: string; scoutingDate: string;
  author: 'tom' | 'me'; viewed: boolean; authorRole?: string;
}

interface AppNotification {
  id: string; text: string; time: string;
  read: boolean; type: 'task' | 'report' | 'nudge' | 'package';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_TASKS: Task[] = [
  { id: 't1', text: 'Watch Kofi Mensah package from Dec 12', priority: 'High', dueDate: 'Today', dueGroup: 'today', assignedTo: 'Me', assignedBy: 'Tom (Lead)', completed: false, isTargetTask: true, playerName: 'Kofi Mensah' },
  { id: 't2', text: 'File scouting report on David Conteh', priority: 'High', dueDate: 'Today', dueGroup: 'today', assignedTo: 'Me', assignedBy: 'Tom (Lead)', completed: false },
  { id: 't3', text: 'Submit Combined Top 10 for Ghana cycle', priority: 'High', dueDate: 'Dec 18', dueGroup: 'week', assignedTo: 'Kwame A. (Head)', assignedBy: 'Me', completed: false },
  { id: 't4', text: 'Review Kazungu Nesta match footage', priority: 'Low', dueDate: 'Dec 20', dueGroup: 'week', assignedTo: 'Me', assignedBy: 'Me', completed: false },
  { id: 't5', text: 'Cross-check Amadou Sarr stats with video', priority: 'High', dueDate: 'Dec 19', dueGroup: 'week', assignedTo: 'Chidi O. (Head)', assignedBy: 'Me', completed: false },
  { id: 't6', text: 'Update PLR grades on Target List', priority: 'Low', dueDate: 'Dec 22', dueGroup: 'upcoming', assignedTo: 'Me', assignedBy: 'Me', completed: true },
  { id: 't7', text: 'Prepare monthly scout summary', priority: 'Low', dueDate: 'Dec 28', dueGroup: 'upcoming', assignedTo: 'Me', assignedBy: 'Me', completed: false },
];

const MOCK_HIGH_PRIORITY: HighPriorityPlayer[] = [
  { id: 'p1', name: 'Kofi Mensah', initials: 'KM', pos: 'ST', avgGrade: 'A', lastReport: 2 },
  { id: 'p2', name: 'David Conteh', initials: 'DC', pos: 'LW', avgGrade: 'A+', lastReport: 5 },
  { id: 'p3', name: 'Kazungu Nesta', initials: 'KN', pos: 'CM', avgGrade: 'B+', lastReport: 8 },
];

const MOCK_PACKAGES: VideoPackage[] = [
  { id: 'pk1', playerName: 'Kofi Mensah', initials: 'KM', uploadDate: '2 days ago', clipCount: 8, watched: false, type: 'package' },
  { id: 'pk2', playerName: 'Amadou Sarr', initials: 'AS', uploadDate: '4 days ago', clipCount: 12, watched: true, type: 'package' },
  { id: 'pk3', playerName: 'David Conteh', initials: 'DC', uploadDate: '1 week ago', clipCount: 6, watched: false, type: 'match' },
  { id: 'pk4', playerName: 'Kazungu Nesta', initials: 'KN', uploadDate: '1 week ago', clipCount: 9, watched: true, type: 'package' },
  { id: 'pk5', playerName: 'Cheikh Diop', initials: 'CD', uploadDate: '2 weeks ago', clipCount: 5, watched: true, type: 'package' },
  { id: 'pk6', playerName: 'Moussa Camara', initials: 'MC', uploadDate: '3 weeks ago', clipCount: 11, watched: true, type: 'match' },
];

const MOCK_REPORTS: Report[] = [
  { id: 'r1', playerName: 'Kofi Mensah', initials: 'KM', pos: 'ST', grade: 'A+', plr: 'A+', por: 'A', date: 'Dec 14', notes: 'Exceptional finishing ability. Kofi showed outstanding movement off the ball and clinical execution in the final third. His positioning in the box is already senior level.', scoutingDate: 'Dec 12, 2025', author: 'tom', viewed: false, authorRole: 'Lead Scout' },
  { id: 'r2', playerName: 'David Conteh', initials: 'DC', pos: 'LW', grade: 'A', plr: 'A', por: 'B+', date: 'Dec 10', notes: 'David continues to impress with his left foot. Dribbling past defenders with ease. Needs to improve final ball delivery but the raw talent is undeniable.', scoutingDate: 'Dec 9, 2025', author: 'tom', viewed: true, authorRole: 'Lead Scout' },
  { id: 'r3', playerName: 'Kazungu Nesta', initials: 'KN', pos: 'CM', grade: 'B+', plr: 'B', por: 'B+', date: 'Dec 8', notes: 'Good vision, passing range excellent. Defensive positioning needs work but offensive contribution is consistent.', scoutingDate: 'Dec 7, 2025', author: 'tom', viewed: false, authorRole: 'Lead Scout' },
  { id: 'r4', playerName: 'Amadou Sarr', initials: 'AS', pos: 'CDM', grade: 'B', plr: 'B', por: 'B', date: 'Dec 5', notes: 'Solid defensive midfielder. Consistent performance over the last 3 matches. Comfortable under pressure.', scoutingDate: 'Dec 4, 2025', author: 'tom', viewed: true, authorRole: 'Lead Scout' },
  { id: 'r5', playerName: 'Kofi Mensah', initials: 'KM', pos: 'ST', grade: 'A', plr: 'A', por: 'A', date: 'Dec 13', notes: 'Kofi was the standout player in the match. Movement was intelligent, finishing was precise. Ready for a higher level.', scoutingDate: 'Dec 11, 2025', author: 'me', viewed: true },
  { id: 'r6', playerName: 'David Conteh', initials: 'DC', pos: 'LW', grade: 'A+', plr: 'A+', por: 'A', date: 'Dec 10', notes: 'Outstanding left foot, exceptional dribbling. One of the best I have seen at this age group. Recommend immediate shortlisting.', scoutingDate: 'Dec 9, 2025', author: 'me', viewed: false },
  { id: 'r7', playerName: 'Kazungu Nesta', initials: 'KN', pos: 'CM', grade: 'B+', plr: 'B+', por: 'B', date: 'Dec 8', notes: 'Good vision and passing range. Needs to improve defensive positioning but offensive contribution is there.', scoutingDate: 'Dec 7, 2025', author: 'me', viewed: true },
  { id: 'r8', playerName: 'Cheikh Diop', initials: 'CD', pos: 'ST', grade: 'B', plr: 'B', por: 'B+', date: 'Dec 3', notes: 'Showed glimpses of quality. Still raw but the potential is visible. Worth monitoring closely.', scoutingDate: 'Dec 2, 2025', author: 'me', viewed: false },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', text: 'Tom nudged you on "Kofi Mensah package"', time: '10m ago', read: false, type: 'nudge' },
  { id: 'n2', text: 'Task assigned: File report on David Conteh', time: '2h ago', read: false, type: 'task' },
  { id: 'n3', text: 'New package uploaded for Amadou Sarr', time: '4h ago', read: true, type: 'package' },
  { id: 'n4', text: 'Tom filed a new report on Kazungu Nesta', time: 'Yesterday', read: true, type: 'report' },
];

const SCOUTS_TO_ASSIGN = ['Tom (Lead)', 'Me', 'Kwame A. (Head)', 'Chidi O. (Head)', 'Wekesa O. (Head)'];

const FLAG_MAP: Record<string, string> = {
  "GAM":"gm","CMR":"cm","MLI":"ml","SEN":"sn","BDI":"bi","NGA":"ng","GHA":"gh","CIV":"ci","ENG":"gb-eng",
  "Senegal":"sn","Cameroon":"cm","Mali":"ml","Burundi":"bi","Nigeria":"ng","The Gambia":"gm","Ghana":"gh","England":"gb-eng"
};

// ─── Colour helpers ───────────────────────────────────────────────────────────
const POS_COLORS: Record<string, string> = {
  ST: 'bg-[#E05C4B]/10 text-[#E05C4B]', LW: 'bg-primary/10 text-foreground',
  RW: 'bg-primary/10 text-foreground', CAM: 'bg-[#E8A838]/10 text-[#E8A838]',
  CM: 'bg-muted-foreground/10 text-muted-foreground', CDM: 'bg-primary/10 text-foreground',
  FB: 'bg-primary/10 text-foreground', CB: 'bg-muted-foreground/20 text-muted-foreground',
};
const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-primary text-primary-foreground', 'A': 'bg-primary/15 text-foreground',
  'B+': 'bg-[#E8A838]/15 text-[#E8A838]', 'B': 'bg-muted-foreground/10 text-muted-foreground',
  'C+': 'bg-accent text-muted-foreground', 'C': 'bg-accent text-muted-foreground',
};
const PosPill = ({ pos }: { pos: string }) => (
  <span className={`inline-block px-2 py-[2px] rounded font-body text-[10px] font-bold ${POS_COLORS[pos] || 'bg-accent text-muted-foreground'}`}>{pos}</span>
);
const GradePill = ({ grade }: { grade: string }) => (
  <span className={`inline-block px-2 py-[2px] rounded font-body text-[12px] font-black ${GRADE_COLORS[grade] || 'bg-accent text-muted-foreground'}`}>{grade}</span>
);
const PriorityPill = ({ priority }: { priority: 'High' | 'Low' }) => (
  <span className={`inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-black ${priority === 'High' ? 'bg-primary/15 text-foreground' : 'bg-muted-foreground/15 text-muted-foreground'}`}>{priority}</span>
);

// ─── Circular Progress Ring ───────────────────────────────────────────────────
const ProgressRing = ({ value, total, size = 40, stroke = 3 }: { value: number; total: number; size?: number; stroke?: number }) => {
  const pct = total === 0 ? 0 : value / total;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#d2e7fa" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#061b2e" strokeWidth={stroke}
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  );
};

// ─── Google Docs style icon ───────────────────────────────────────────────────
// Portrait rectangle with folded top-right corner and text lines inside
const DocIcon = ({ unviewed, isTom }: { unviewed: boolean; isTom: boolean }) => {
  const bg    = unviewed ? '#0a2d4c' : '#d2e7fa';
  const fold  = unviewed ? '#061b2e' : '#d2e7fa';
  const line1 = unviewed ? (isTom ? '#E8A838' : '#061b2e') : '#b4d7f6';
  const line2 = unviewed ? '#061b2e' : '#d2e7fa';
  const border= unviewed ? '#061b2e' : '#d2e7fa';
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main page body */}
      <rect x="1" y="1" width="38" height="50" rx="3" fill={bg} stroke={border} strokeWidth="1.5" />
      {/* Fold triangle — top right corner */}
      <path d="M28 1 L39 12 L28 12 Z" fill={fold} />
      <path d="M28 1 L39 12" stroke={border} strokeWidth="1" />
      {/* Text lines */}
      <rect x="6" y="18" width="20" height="2.5" rx="1" fill={line1} />
      <rect x="6" y="24" width="28" height="2" rx="1" fill={line2} />
      <rect x="6" y="29" width="24" height="2" rx="1" fill={line2} />
      <rect x="6" y="34" width="28" height="2" rx="1" fill={line2} />
      <rect x="6" y="39" width="16" height="2" rx="1" fill={line2} />
    </svg>
  );
};

// ─── Report Side Drawer ───────────────────────────────────────────────────────
const ReportDrawer = ({ report, onClose }: { report: Report; onClose: () => void }) => {
  const isTom = report.author === 'tom';
  return (
    <div className="fixed inset-0 z-[300] flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[440px] bg-card h-full flex flex-col shadow-2xl overflow-y-auto">
        <div className={`px-6 py-5 flex items-start justify-between shrink-0 ${isTom ? 'bg-primary' : 'bg-card border-b border-border'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-heading font-semibold text-[16px] ${isTom ? 'text-chalk' : 'text-foreground'}`}>{report.playerName}</span>
              <PosPill pos={report.pos} />
              <GradePill grade={report.grade} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isTom && <span className="font-body text-[12px] font-black px-2 py-1 rounded-full bg-primary text-white">Lead Scout</span>}
              <span className={`font-body text-[12px] font-medium ${isTom ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {isTom ? 'Tom' : 'David (Me)'} · {report.scoutingDate}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={`mt-0.5 shrink-0 ${isTom ? 'text-white/50 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}><X size={18} /></button>
        </div>
        <div className="px-6 py-4 border-b border-border flex items-center gap-6 bg-card shrink-0">
          {[['Overall', report.grade], ['PLR', report.plr], ['POR', report.por]].map(([label, val]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
              <GradePill grade={val} />
            </div>
          ))}
          <div className="ml-auto flex flex-col gap-1">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Filed</span>
            <span className="font-body text-[14px] font-bold text-foreground">{report.date}</span>
          </div>
        </div>
        <div className="px-6 py-5 flex-1">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-3">Scouting Notes</span>
          <p className="font-body text-[15px] font-medium text-foreground leading-relaxed">{report.notes}</p>
        </div>
      </div>
    </div>
  );
};

// ─── This Week Modal — Google Notes style ─────────────────────────────────────
const ThisWeekModal = ({
  tasks, onClose, onToggle, onAdd,
}: {
  tasks: Task[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
}) => {
  const [newText, setNewText] = useState('');
  const incomplete = tasks.filter(t => !t.completed);
  const complete   = tasks.filter(t => t.completed);

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-md border border-border flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[32px] shrink-0">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-foreground" />
            <span className="font-heading font-semibold text-[16px] text-white">Tasks This Week</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Add task input */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Add a task..."
              className="flex-1 bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            />
            <button onClick={handleAdd}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors shrink-0">
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {incomplete.map(task => (
            <div key={task.id}
              className="flex items-start gap-3 p-3 rounded-[16px] hover:bg-accent transition-colors group cursor-pointer"
              onClick={() => onToggle(task.id)}>
              <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary shrink-0 mt-0.5 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-[14px] text-foreground">{task.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <PriorityPill priority={task.priority} />
                  <span className="font-body text-[12px] text-muted-foreground font-medium">{task.dueDate}</span>
                  {task.assignedBy !== 'Me' && <span className="font-body text-[12px] text-muted-foreground font-medium">from {task.assignedBy}</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Completed section */}
          {complete.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px bg-secondary" />
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{complete.length} completed</span>
                <div className="flex-1 h-px bg-secondary" />
              </div>
              {complete.map(task => (
                <div key={task.id}
                  className="flex items-start gap-3 p-3 rounded-[16px] hover:bg-accent transition-colors group cursor-pointer opacity-50"
                  onClick={() => onToggle(task.id)}>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <p className="font-body font-bold text-[14px] text-muted-foreground line-through">{task.text}</p>
                </div>
              ))}
            </>
          )}
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
const AddReportModal = ({ onClose, scoutName = 'David' }: { onClose: () => void; scoutName?: string }) => {
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
                className="px-8 py-2 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0a2d4c]">
                Continue →
              </button>
            : <button onClick={onClose}
                className="px-8 py-2 bg-primary border-2 border-primary text-white rounded-full font-body font-bold text-[14px] hover:bg-[#0a2d4c] transition-colors">
                Submit Report ✓
              </button>}
        </div>
      </div>
    </div>
  );
};



// ─── OverviewTab — task list + at-a-glance stats ─────────────────────────────────
const OverviewTab = ({ tasks, onToggleTask, onAddTask, onNavigate, onOpenPlayers }: {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (t: Omit<Task, 'id' | 'completed'>) => void;
  onNavigate: (tab: DashTab) => void;
  onOpenPlayers: (section: 'short-list' | 'target') => void;
}) => {
  const [newTask, setNewTask] = useState('');
  const incomplete = tasks.filter(t => !t.completed);
  const complete   = tasks.filter(t => t.completed);

  // Clean KPI card style — matches the Lead Scout Overview cards
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* ── 4 KPI cards — shared KpiCard ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={FileText} heading="Reports"
          value={MOCK_REPORTS.filter(r => r.author === 'tom').length}
          descriptor="made by Tom" action="Opens Reports"
          onClick={() => onNavigate('reports')} />
        <KpiCard icon={Users} heading="Short List" value={14}
          descriptor="on the short list" action="Opens Short List"
          onClick={() => onOpenPlayers('short-list')} />
        <KpiCard icon={Video} heading="Packages" value={MOCK_PACKAGES.length}
          descriptor="recently uploaded" action="View Packages"
          onClick={() => onNavigate('packages')} />
        <KpiCard icon={Target} heading="Target List" value={6}
          descriptor="on the target list" action="Opens Target List"
          onClick={() => onOpenPlayers('target')} />
      </div>

      {/* ── Below KPIs: 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6">

        {/* Left column — My Tasks (spans 2) */}
        <div className="lg:col-span-2 portrait-tablet:col-span-full bg-card rounded-[40px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[16px] bg-primary flex items-center justify-center shrink-0"><CheckCircle size={20} className="text-chalk" /></div>
              <div>
                <h2 className="font-heading font-semibold text-[24px] text-foreground">My Tasks</h2>
                <p className="font-body text-[12px] text-muted-foreground font-medium">{complete.length}/{tasks.length} completed</p>
              </div>
            </div>
          </div>
          <div className="px-8 py-3 border-b border-border flex items-center gap-4">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a task..."
              onKeyDown={e => { if (e.key === 'Enter' && newTask.trim()) { onAddTask({ text: newTask, priority: 'Low', dueDate: 'This Week', dueGroup: 'week', assignedTo: 'Me', assignedBy: 'Me' }); setNewTask(''); }}}
              className="flex-1 bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:border-ring" />
            <button onClick={() => { if (newTask.trim()) { onAddTask({ text: newTask, priority: 'Low', dueDate: 'This Week', dueGroup: 'week', assignedTo: 'Me', assignedBy: 'Me' }); setNewTask(''); }}}
              className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shrink-0"><Plus size={14} /></button>
          </div>
          <div className="flex-1 overflow-y-auto pb-4 divide-y divide-border" style={{ maxHeight: 380 }}>
            {incomplete.map(t => (
              <div key={t.id} className="px-8 py-4 flex items-start gap-4 group transition-colors hover:bg-accent">
                <button onClick={() => onToggleTask(t.id)} className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-body text-[14px] font-bold text-foreground">{t.text}</p>
                    {t.priority === 'High' && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E05C4B]/10 text-[#E05C4B]">HIGH</span>}
                  </div>
                  <p className="font-body text-[12px] text-muted-foreground mt-0.5">{t.assignedBy} • Due {t.dueDate}</p>
                </div>
              </div>
            ))}
            {complete.length > 0 && complete.slice(0, 3).map(t => (
              <div key={t.id} className="px-8 py-4 flex items-start gap-4 opacity-40">
                <button onClick={() => onToggleTask(t.id)} className="shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={11} className="text-white" /></div>
                </button>
                <p className="font-body text-[14px] font-bold text-muted-foreground line-through">{t.text}</p>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="py-8 text-center font-body text-[14px] text-muted-foreground">No tasks yet — add one above.</div>
            )}
          </div>
        </div>

        {/* Right column — stacked sidebar */}
        <div className="flex flex-col gap-6">

          {/* Recent Reports — bg-card */}
          <div className="bg-card rounded-[40px] border border-border shadow-[var(--shadow-lg)] flex flex-col overflow-hidden flex-1">
            <div className="px-6 py-5 border-b border-border flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-accent flex items-center justify-center shrink-0"><FileText size={16} className="text-muted-foreground" /></div>
              <div>
                <h3 className="font-heading font-semibold text-[16px] text-foreground">Recent Reports</h3>
                <p className="font-body text-[12px] text-muted-foreground font-medium">From Lead & Head Scouts</p>
              </div>
            </div>
            <div className="flex-1 divide-y divide-border">
              {[
                { name: 'Mbugua', role: 'Senior Scout', count: 3, unread: 2 },
                { name: 'Tom', role: 'Lead Scout', count: 2, unread: 1 },
                { name: 'Nene', role: 'Head Scout', count: 2, unread: 0 },
              ].map(scout => (
                <div key={scout.name} className="px-6 py-4 flex items-center gap-3 hover:bg-accent transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-primary text-chalk flex items-center justify-center font-body font-black text-[12px] shrink-0">{scout.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <span className="font-body font-bold text-[14px] text-foreground">{scout.name}</span>
                    <p className="font-body text-[12px] text-muted-foreground">{scout.role} · {scout.count} reports</p>
                  </div>
                  {scout.unread > 0 && (
                    <span className="font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E05C4B]/10 text-[#E05C4B]">{scout.unread} unread</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Packages — accent card (bg-primary) */}
          <div className="bg-primary rounded-[40px] flex flex-col overflow-hidden flex-1">
            <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center shrink-0"><Package size={16} className="text-chalk" /></div>
              <div>
                <h3 className="font-heading font-semibold text-[16px] text-chalk">Upcoming Packages</h3>
                <p className="font-body text-[12px] text-chalk/60 font-medium">Awaiting review</p>
              </div>
            </div>
            <div className="flex-1 divide-y divide-white/5">
              {[
                { name: 'Kofi Mensah', list: 'Target', clips: 8 },
                { name: 'David Conteh', list: 'Short', clips: 6 },
                { name: 'Amadou Sarr', list: 'Target', clips: 5 },
              ].map(pkg => (
                <div key={pkg.name} className="px-6 py-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-chalk flex items-center justify-center font-body font-black text-[12px] shrink-0">{pkg.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div className="flex-1 min-w-0">
                    <span className="font-body font-bold text-[14px] text-chalk">{pkg.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-body text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-chalk/80">{pkg.list}</span>
                      <span className="font-body text-[10px] text-chalk/60 font-medium">{pkg.clips} clips</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PackagesTab — video packages awaiting review ────────────────────────────────
const PackagesTab = () => {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <p className="font-body text-[14px] font-medium text-muted-foreground">{MOCK_PACKAGES.length} packages</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PACKAGES.map(pkg => (
          <div key={pkg.id}
            className={`bg-card rounded-[20px] border p-5 hover:shadow-md transition-all ${pkg.watched ? 'border-border opacity-60' : 'border-primary shadow-sm'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-accent text-foreground flex items-center justify-center font-black text-[12px]">{pkg.initials}</div>
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">{pkg.playerName}</div>
                  <div className="font-body text-[12px] text-muted-foreground">{pkg.uploadDate}</div>
                </div>
              </div>
              {pkg.watched ? <CheckCircle size={14} className="text-[#3A8C6A]" /> : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8A838]/15 text-[#E8A838]">NEW</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-body text-[12px] font-bold text-muted-foreground">
                <Video size={12} className="inline -mt-0.5 mr-1" />{pkg.clipCount} clips
              </span>
              <button className="flex items-center gap-2 text-[12px] font-bold text-foreground hover:underline">
                <Play size={12} />Watch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default function SeniorScoutDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Role state — Senior Scout is default, can toggle to Head Scout
  const [activeRole, setActiveRole] = useState<'Senior Scout' | 'Head Scout'>('Senior Scout');

  // Page routing — mirrors CountryScoutDashboard pattern
  let activePage: ActivePage = 'dashboard';
  if (location.pathname === '/senior-scout/players') activePage = 'players';
  if (location.pathname === '/senior-scout/matches') activePage = 'matches';
  if (location.pathname === '/senior-scout/admin')   activePage = 'admin';

  // Dashboard tab state
  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  // Shared task state — used by both This Week modal and Tasks tile
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => setTasks(prev => [...prev, { ...task, id: `t${Date.now()}`, completed: false }]);
  const addTaskFromModal = (text: string) => addTask({ text, priority: 'High', dueDate: 'This Week', dueGroup: 'week', assignedTo: 'Me', assignedBy: 'Me' });

  // Lead-style task store — feeds the shared Tasks tab (distinct from the Overview task list above)
  const [leadTasks, setLeadTasks] = useState<any[]>(SHARED_MOCK_TASKS);
  const toggleLeadTask = (id: any) => setLeadTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const setLeadTaskStatus = (id: any, status: any) => setLeadTasks(prev => prev.map(t => t.id === id ? { ...t, status, completed: status === 'done' } : t));
  const addLeadTask = (input: any) => {
    const base = typeof input === 'string' ? { text: input } : input;
    setLeadTasks(prev => [{
      id: `lt${Date.now()}`,
      text: base.text, description: base.description,
      priority: base.priority || 'Medium',
      dueDate: base.dueDate || 'This week', deadline: base.deadline,
      assignedDate: new Date().toISOString().slice(0, 10), status: 'pending',
      assignedTo: base.assignedTo || 'Me',
      allocated: 'Today', completed: false,
    }, ...prev]);
  };

  // Deep-link to the players page section (short list / target list)
  const goToPlayers = (section: 'short-list' | 'target') => navigate(`/senior-scout/players?section=${section}`);

  // Reports state
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [activeDrawer, setActiveDrawer] = useState<Report | null>(null);
  const openReport = (report: Report) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, viewed: true } : r));
    setActiveDrawer({ ...report, viewed: true });
  };

  // Modals
  const [showThisWeek, setShowThisWeek]     = useState(false);
  const [showAddReport, setShowAddReport]   = useState(false);
  const [showAddPlayer, setShowAddPlayer]   = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (text: string, type: AppNotification['type']) => {
    const notif: AppNotification = { id: `n${Date.now()}`, text, time: 'Just now', read: false, type };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleNudge = (scoutName: string) => {
    addNotification(`You nudged ${scoutName} to submit their Top 10 list`, 'nudge');
  };

  const funSubtitles = [
    "Let's find the next wonderkid before they cost €100M 💸",
    "Ready to scout the next Ballon d'Or winner? 🏆",
    "The coffee is hot and the talent is waiting ☕",
    "Time to discover the hidden gems 💎",
    "Another day, another generational talent 🌟",
  ];
  const [subtitle] = useState(funSubtitles[Math.floor(Math.random() * funSubtitles.length)]);

  const tabs = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'reports',   label: 'Reports'   },
    { id: 'packages',  label: 'Packages'  },
    { id: 'analytics', label: 'Analytics' },
    { id: 'tasks',     label: 'Tasks', count: leadTasks.filter(t => !t.completed).length, countTone: 'muted' as const },
  ];

  // Head Scout mode — write role to sessionStorage so CountryScoutDashboard
  // reads it and shows its own built-in toggle for switching back.
  if (activeRole === 'Head Scout') {
    sessionStorage.setItem('userRole', 'Head Scout');
    sessionStorage.setItem('loginRole', 'Senior Scout');
    return <CountryScoutDashboardPage />;
  }

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#b4d7f6;border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:#7baac7;}
        .hide-scrollbar::-webkit-scrollbar{display:none;}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}} />

      {/* Modals */}
      {showThisWeek  && <ThisWeekModal tasks={tasks} onClose={() => setShowThisWeek(false)} onToggle={toggleTask} onAdd={addTaskFromModal} />}
      {showAddReport && <AddReportModal onClose={() => setShowAddReport(false)} />}
      {activeDrawer  && <ReportDrawer report={activeDrawer} onClose={() => setActiveDrawer(null)} />}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAddPlayer(false)}>
          <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-primary rounded-t-[32px] shrink-0">
              <span className="font-heading font-semibold text-[20px] text-white">Add New Player</span>
              <button onClick={() => setShowAddPlayer(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Full Name</label>
                  <input type="text" placeholder="e.g. Kofi Mensah" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Date of Birth</label>
                  <input type="date" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Nationality</label>
                  <input type="text" placeholder="e.g. Ghana" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
                  <select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    {['ST','LW','RW','CM','CDM','CAM','FB','CB'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Team</label>
                  <input type="text" placeholder="e.g. Hawks FC" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
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
                      <input type="checkbox" className="w-4 h-4 rounded border-2 border-border checked:bg-primary checked:border-primary accent-[#1e88e5]" />
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

      {/* Real Sidebar */}
      <Sidebar actions={[
        { label: 'This Week', icon: Calendar, onClick: () => setShowThisWeek(true) },
        { label: 'Add Report', icon: FileText, onClick: () => setShowAddReport(true) },
      ]} />

      <main className="flex-1 flex flex-col min-w-0">

        {/* ── Top Navigation — matches existing dashboard exactly ── */}
        <TopNav
          responsive
          rolePill={(
            <div className="hidden md:flex items-center bg-accent rounded-full p-1 h-[44px] relative shrink-0">
              <div className={`absolute inset-y-1 w-[114px] bg-primary rounded-full shadow-sm transition-all duration-300 z-0 ${activeRole === 'Head Scout' ? 'left-[118px]' : 'left-1'}`} />
              <button onClick={() => { sessionStorage.removeItem('userRole'); sessionStorage.setItem('loginRole', 'Senior Scout'); setActiveRole('Senior Scout'); }}
                className={`relative z-10 w-[114px] h-full flex items-center justify-center font-body text-[14px] font-bold rounded-full transition-colors ${activeRole === 'Senior Scout' ? 'text-chalk' : 'text-muted-foreground hover:text-foreground'}`}>
                Senior Scout
              </button>
              <button onClick={() => { sessionStorage.setItem('userRole', 'Head Scout'); setActiveRole('Head Scout'); }}
                className={`relative z-10 w-[114px] h-full flex items-center justify-center font-body text-[14px] font-bold rounded-full transition-colors ${activeRole === 'Head Scout' ? 'text-chalk' : 'text-muted-foreground hover:text-foreground'}`}>
                Head Scout
              </button>
            </div>
          )}
          unreadCount={unreadCount}
          notifOpen={showNotifPanel}
          onNotifToggle={() => setShowNotifPanel(p => !p)}
          notifPanel={(
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-[24px] shadow-2xl border border-border z-50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary rounded-t-[24px]">
                <span className="font-heading font-black text-[14px] text-white">Notifications</span>
                <button onClick={() => setShowNotifPanel(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {notifications.map(n => (
                  <div key={n.id} className={`px-5 py-3 flex items-start gap-3 ${!n.read ? 'bg-card' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type === 'nudge' ? 'bg-primary/10' : n.type === 'task' ? 'bg-primary/10' : n.type === 'package' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      {n.type === 'nudge' ? <Zap size={12} className="text-foreground" /> : n.type === 'task' ? <CheckCircle size={12} className="text-foreground" /> : n.type === 'package' ? <Video size={12} className="text-foreground" /> : <FileText size={12} className="text-foreground" />}
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
          avatarImg="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
          profileOpen={showProfileMenu}
          onProfileToggle={() => setShowProfileMenu(p => !p)}
          profileMenu={(
            <div className="absolute right-0 mt-3 w-64 bg-card rounded-[24px] shadow-xl border border-border z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-card">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80" alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">David</div>
                  <div className="font-body text-[12px] text-muted-foreground font-medium">Senior Scout</div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={() => setShowProfileMenu(false)} className="w-full flex items-center px-4 py-3 font-body text-[14px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors">
                  <LogOut size={16} className="mr-3" />Log out
                </button>
              </div>
            </div>
          )}
        />

        {/* ── Page content ── */}
        <div className="flex-1 px-[var(--pad-page)] pb-20 md:pb-12">

          {/* ── PLAYERS page — SeniorLeadPlayersPage ── */}
          {activePage === 'players' && (
            <SeniorLeadPlayersPage allPlayersData={[]} loggedInRole="Senior Scout" flagMap={FLAG_MAP} />
          )}

          {/* ── MATCHES page ── */}
          {activePage === 'matches' && <MatchesView />}

          {/* ── ADMIN page ── */}
          {activePage === 'admin' && <AdminView />}

          {/* ── DASHBOARD ── */}
          {activePage === 'dashboard' && (
            <>
              {/* Page header — Qaza signature format per Section 5 */}
              <div className="pt-6 mb-3">
                <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
                  Welcome
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                    <Target size={28} className="text-chalk" />
                  </span>
                  David
                </h1>
                <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">{subtitle}</p>
              </div>

              {/* Tab row */}
              <ResponsiveTabs className="mt-4 mb-6" tabs={tabs} activeId={activeTab} onSelect={(id) => setActiveTab(id as DashTab)} />

              {/* Tab content */}
              {activeTab === 'overview'  && <OverviewTab tasks={tasks} onToggleTask={toggleTask} onAddTask={addTask} onNavigate={setActiveTab} onOpenPlayers={goToPlayers} />}
              {activeTab === 'reports'   && <ReportsTab onAddReport={() => setShowAddReport(true)} />}
              {activeTab === 'packages'  && <PackagesTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'tasks'     && <TasksTab tasks={leadTasks} onToggle={toggleLeadTask} onSetStatus={setLeadTaskStatus} onAdd={addLeadTask} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}