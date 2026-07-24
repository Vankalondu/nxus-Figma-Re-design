import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Calendar, Plus, Bell, LogOut, ChevronDown,
  LayoutGrid, List, Video, Archive, Moon, Sun,
  TrendingUp, ShieldCheck, ArrowUpRight, Users, X, Star, Bookmark, Trash2, Columns3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from 'next-themes';
import { CardView } from '../components/CardView';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { MatchesView } from './MatchesView';
import { AdminView } from './AdminView';
import { useDynamicColumns, ColumnDef } from '../components/TableColumns';
import { EditColumnsModal } from '../components/EditColumnsModal';
import { PLAYER_COLUMNS, DEFAULT_VISIBLE_IDS, type PlayerColumn } from '../components/playerColumns';
import { StatsCards, HeadScoutStatsCards } from '../components/DashboardWidgets';
import { SeniorLeadPlayersPage } from '../components/SeniorLeadPlayersPage';
import { ResponsiveTabs } from '../components/ResponsiveTabs';

const FlagCircle = ({ code, label }: { code: string; label: string }) => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-border bg-accent shrink-0 mx-auto">
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={label} className="w-full h-full object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  </div>
);

const getBaseColumns = (navigate: any, flagMap: Record<string, string>): ColumnDef[] => [
  {
    id: 'details', group: 'PLAYER IDENTIFICATION', label: 'Player Details',
    isSticky: 'left-[160px]', minWidth: 'min-w-[240px]', borderRight: true,
    renderCell: (p) => (
      <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}>
        <div className="w-8 h-8 rounded-xl bg-input-background text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">{p.initials}</div>
        <div className="flex flex-col">
          <span className="font-body font-bold text-foreground text-[14px] hover:underline">{p.name}</span>
          <span className="font-body text-muted-foreground text-[12px]">Age {p.age}</span>
        </div>
      </div>
    )
  },
  { id: 'dob', group: 'BIO DATA', label: 'DOB', renderCell: (p) => <span className="font-body font-medium text-muted-foreground text-[14px]">{p.dob}</span> },
  { id: 'nat', group: 'BIO DATA', label: 'Nat', align: 'center', renderCell: (p) => <FlagCircle code={flagMap[p.nationality] || 'un'} label={p.nationality} /> },
  { id: 'country', group: 'BIO DATA', label: 'Ctry', align: 'center', renderCell: (p) => <FlagCircle code={flagMap[p.country] || 'un'} label={p.country} /> },
  { id: 'pos', group: 'BIO DATA', label: 'Pos', renderCell: (p) => <span className="font-body font-bold text-foreground text-[14px]">{p.pos}</span> },
  { id: 'pteam', group: 'BIO DATA', label: 'P.Team', renderCell: (p) => <span className="font-body font-medium text-muted-foreground text-[14px]">{p.pTeam}</span> },
  { id: 'lvl', group: 'BIO DATA', label: 'Lvl', renderCell: (p) => <span className="font-body font-medium text-muted-foreground text-[14px]">{p.pCountry}</span> },
  { id: 'match', group: 'BIO DATA', label: 'Match', borderRight: true, renderCell: (p) => <span className="font-body font-medium text-muted-foreground text-[14px]">{p.cTeam}</span> },
  { id: 'mins',  group: 'GAME STATS', label: 'Mins',  bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.app}</span> },
  { id: 'gls',   group: 'GAME STATS', label: 'Gls',   fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.starts}</span> },
  { id: 'ast',   group: 'GAME STATS', label: 'Ast',   bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-bold text-foreground text-[14px]">{p.goals}</span> },
  { id: 'xg',    group: 'GAME STATS', label: 'xG',    fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.ass}</span> },
  { id: 'xa',    group: 'GAME STATS', label: 'xA',    bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.pens}</span> },
  { id: 'shots', group: 'GAME STATS', label: 'Shots', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.gcMins}</span> },
  { id: 'sot',   group: 'GAME STATS', label: 'SOT',   bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.m90}</span> },
  { id: 'pass',  group: 'GAME STATS', label: 'Pass%', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.g90}</span> },
  { id: 'tckl',  group: 'GAME STATS', label: 'Tckl',  bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.a90}</span> },
  { id: 'int',   group: 'GAME STATS', label: 'Int',   fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.gc90}</span> },
  { id: 'clr',   group: 'GAME STATS', label: 'Clr',   bgHeader: 'bg-card', bgCell: 'bg-accent/30 group-hover:bg-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-muted-foreground text-[14px]">{p.mpg}</span> },
  { id: 'aer',   group: 'GAME STATS', label: 'Aer',   fontMono: true, borderRight: true, align: 'center', renderCell: (p) => <span className="font-mono font-bold text-foreground text-[14px]">{p.potMins}</span> },
  { id: 'match_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center space-x-1"><Video size={14} /><span>Match</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (<div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}><span className="bg-primary/20 text-foreground font-body font-bold px-2 py-0.5 rounded text-[12px]">F{p.matchVideos}</span></div>) },
  { id: 'high_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center space-x-1"><Video size={14} /><span>High</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (<div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}><span className="bg-primary/10 text-foreground font-body font-bold px-2 py-0.5 rounded text-[12px]">H{p.highlightVideos}</span></div>) },
];

let seed = 123;
function random() { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); }

const generatePlayers = (count: number) => {
  const names = ["David Conteh","Sundze Zunedu","Sekou O Maiga","Mourana Camara","Ousman Touray","Kazungu Nesta","Abdulkareem Bashir","Marcus Rashford Jr.","Amadou Sarr","Ismaila Saidykhan","Cheikh Diop","Moses Simon","Kwame Mensah","Tariq Lamptey","Koffi Annan"];
  const nats = ["GAM","CMR","MLI","SEN","BDI","NGA","GHA","CIV","ENG"];
  const countries = ["Senegal","Cameroon","Mali","Burundi","Nigeria","The Gambia","Ghana","England"];
  const teams = ["Hawks","Fauve Azur","ATS","United Acad","Gunjur Utd","AC Wembo","Imperial FC"];
  const positions = ["Strikers","Wingers","Midfielders","Full Backs","Centre Backs"];
  return Array.from({ length: count }, (_, i) => {
    const baseName = names[i % names.length];
    const age = 16 + Math.floor(random() * 8);
    return {
      id: `player-${i}`, name: baseName, initials: baseName.split(' ').map(n => n[0]).join('').substring(0, 2),
      dotColor: random() > 0.6 ? 'bg-green-500' : random() > 0.3 ? 'bg-accent0' : 'bg-yellow-500',
      age, dob: `${Math.floor(1+random()*28)}/${Math.floor(1+random()*12)}/${2026-age}`,
      nationality: nats[i%nats.length], country: countries[i%countries.length],
      pos: positions[i%positions.length], pTeam: teams[i%teams.length],
      pCountry: countries[i%countries.length], cTeam: teams[(i+1)%teams.length],
      app: Math.floor(random()*30), starts: Math.floor(random()*25), goals: Math.floor(random()*15),
      ass: Math.floor(random()*10), pens: Math.floor(random()*3), gcMins: Math.floor(random()*2000),
      m90: (random()*90).toFixed(1), g90: (random()*1.5).toFixed(2), a90: (random()*1.0).toFixed(2),
      gc90: (random()*90).toFixed(1), mpg: Math.floor(30+random()*60),
      matchVideos: Math.floor(random()*8), highlightVideos: Math.floor(random()*12),
      potMins: Math.floor(20+random()*80)+'%', notesCount: random()>0.6?Math.floor(random()*5)+1:0,
    };
  });
};


interface ActionItem { label: string; action: () => void; danger?: boolean; icon: React.ReactNode; }

const ActionDropdown = ({ playerId, items, openId, setOpenId }: {
  playerId: string; items: ActionItem[];
  openId: string | null; setOpenId: (id: string | null) => void;
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const safeIdx = Math.min(selectedIdx, items.length - 1);
  const primaryItem = items[safeIdx >= 0 ? safeIdx : 0];
  const restItems = items.filter((_, i) => i !== safeIdx);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const isOpen = openId === playerId;
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const portal = document.getElementById(`adp-${playerId}`);
      if (!chevronRef.current?.contains(e.target as Node) && !portal?.contains(e.target as Node)) setOpenId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, setOpenId, playerId]);

  useEffect(() => {
    if (!isOpen) return;
    const h = () => setOpenId(null);
    document.addEventListener('scroll', h, true);
    return () => document.removeEventListener('scroll', h, true);
  }, [isOpen, setOpenId]);

  const handleChevron = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) { setOpenId(null); return; }
    if (chevronRef.current) {
      const r = chevronRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 4, left: r.left });
    }
    setOpenId(playerId);
  };

  const portal = isOpen && restItems.length > 0 ? createPortal(
    <div id={`adp-${playerId}`}
      style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
      className="bg-card rounded-[12px] overflow-hidden min-w-[160px] border border-border">
      {restItems.map((item, i) => {
        const fullIdx = items.indexOf(item);
        return (
          <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedIdx(fullIdx); setOpenId(null); }}
            className={`w-full text-left px-3 py-2 font-body text-[12px] font-bold flex items-center gap-2 transition-colors
              ${item.danger ? 'text-destructive hover:bg-destructive/15' : 'text-foreground hover:bg-accent'}`}>
            {item.icon}{item.label}
          </button>
        );
      })}
    </div>, document.body) : null;

  if (!primaryItem) return null;

  return (
    <div className="flex items-center gap-0">
      <button onClick={(e) => { e.stopPropagation(); primaryItem.action(); }} title={primaryItem.label}
        className={`w-7 h-7 rounded-l-lg flex items-center justify-center transition-all border border-r-0 ${
          primaryItem.danger
            ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20'
            : 'bg-accent text-foreground hover:bg-primary/80 hover:text-primary-foreground border-border'
        }`}>
        {primaryItem.icon}
      </button>
      {restItems.length > 0 && (
        <>
          <button ref={chevronRef} onClick={handleChevron}
            className="w-5 h-7 rounded-r-lg bg-accent border border-border text-foreground hover:bg-primary/80 hover:text-primary-foreground flex items-center justify-center transition-all">
            <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {portal}
        </>
      )}
    </div>
  );
};

export default function CountryScoutDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedRole = sessionStorage.getItem('userRole');
  const storedLoginRole = sessionStorage.getItem('loginRole');
  let defaultRole = 'Country Scout';
  if (storedRole) defaultRole = storedRole;
  else if (location.pathname === '/head-scout') defaultRole = 'Head Scout';
  else if (location.pathname === '/lead-scout') defaultRole = 'Lead Scout';
  else if (location.pathname === '/senior-scout') defaultRole = 'Senior Scout';
  const userRole = defaultRole;
  const loggedInRole = storedLoginRole || userRole;

  const { theme, setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Review Nigeria U17 footage", completed: false },
    { id: 2, text: "Follow up on Amadou Sarr", completed: false },
    { id: 3, text: "Finalize monthly scout report", completed: true }
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  let activePage = 'dashboard';
  if (location.pathname === '/players' || location.pathname === '/country-scout/players' || location.pathname === '/head-scout/players') activePage = 'players';
  if (location.pathname === '/matches' || location.pathname === '/country-scout/matches' || location.pathname === '/head-scout/matches') activePage = 'matches';
  if (location.pathname === '/admin'   || location.pathname === '/country-scout/admin'   || location.pathname === '/head-scout/admin')   activePage = 'admin';

  const [funSubtitle] = useState(() => {
    const greetings = [
      "Ready to scout the next Ballon d'Or winner? 🏆",
      "The coffee is hot and the talent is waiting. ☕",
      "Let's find the next wonderkid before they cost €100M! 💸",
      "Time to discover the hidden gems before everyone else does 💎",
      "Grab your notebook, there's magic on the pitch today! ✍️",
      "Get your binoculars ready, we've got top prospects to watch! 🔭",
      "Another day, another generational talent to discover! 🌟"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const [activeTab, setActiveTab] = useState<'players-in-scope'|'top-10'|'reserve-list'|'combined-top-10'>('players-in-scope');
  const [viewMode, setViewMode] = useState<'table'|'card'>('table');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveViewMode: 'table'|'card' = isMobile ? 'card' : viewMode;
  const [collapsedPositions, setCollapsedPositions] = useState<Record<string, boolean>>({});
  const togglePosition = (pos: string) => setCollapsedPositions(prev => ({ ...prev, [pos]: !prev[pos] }));
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [showFilter, setShowFilter] = useState<string>('All players');
  const [statFilter, setStatFilter] = useState<string>('All Stats');
  const [perfCount, setPerfCount] = useState(0);
  const [prospectCount, setProspectCount] = useState(0);

  const [userRoleState, setUserRoleState] = useState(userRole);
  const handleSeniorViewSwitch = (newView: string) => {
    if (newView === userRoleState) return;
    sessionStorage.setItem('userRole', newView);
    if (newView === 'Senior Scout') {
      navigate('/senior-scout');
      return;
    }
    setUserRoleState(newView);
  };

  const [allPlayersData] = useState<ReturnType<typeof generatePlayers>>(() => { seed = 123; return generatePlayers(60); });
  const [scopePlayerIds, setScopePlayerIds] = useState<string[]>(() => allPlayersData.map(p => p.id));
  const [top10PlayerIds, setTop10PlayerIds] = useState<string[]>([]);
  const [reservePlayerIds, setReservePlayerIds] = useState<string[]>([]);
  const [raisedPlayerIds, setRaisedPlayerIds] = useState<Set<string>>(new Set());
  const [raiseNotifications, setRaiseNotifications] = useState<Array<{id:string;name:string;time:string}>>(() => JSON.parse(sessionStorage.getItem('qazaRaiseNotifs') || '[]'));
  const [raiseToast, setRaiseToast] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleRaise = (id: string, name: string) => {
    if (raisedPlayerIds.has(id)) return;
    const newNotif = { id, name, time: new Date().toISOString() };
    setRaisedPlayerIds(prev => new Set([...prev, id]));
    setRaiseNotifications(prev => [newNotif, ...prev]);
    setRaiseToast(name);
    setTimeout(() => setRaiseToast(null), 4000);
    const stored = JSON.parse(sessionStorage.getItem('qazaRaiseNotifs') || '[]');
    stored.unshift(newNotif);
    sessionStorage.setItem('qazaRaiseNotifs', JSON.stringify(stored));
  };

  const handleScopeToReserve = (id:string) => { setScopePlayerIds(p=>p.filter(x=>x!==id)); setReservePlayerIds(p=>[...p,id]); };
  const handleScopeToTop10   = (id:string) => { setScopePlayerIds(p=>p.filter(x=>x!==id)); setTop10PlayerIds(p=>[...p,id]); };
  const handleTop10ToReserve = (id:string) => { setTop10PlayerIds(p=>p.filter(x=>x!==id)); setReservePlayerIds(p=>[...p,id]); };
  const handleTop10ToScope   = (id:string) => { setTop10PlayerIds(p=>p.filter(x=>x!==id)); setScopePlayerIds(p=>[...p,id]); };
  const handleReserveToTop10 = (id:string) => { setReservePlayerIds(p=>p.filter(x=>x!==id)); setTop10PlayerIds(p=>[...p,id]); };
  const handleReserveToScope = (id:string) => { setReservePlayerIds(p=>p.filter(x=>x!==id)); setScopePlayerIds(p=>[...p,id]); };

  const handleTabChange = (tab: typeof activeTab) => { setActiveTab(tab); if (tab !== 'players-in-scope') setPositionFilter('All'); };

  const currentPlayersData = useMemo(() => {
    const ids = activeTab==='players-in-scope'?scopePlayerIds:activeTab==='top-10'?top10PlayerIds:activeTab==='reserve-list'?reservePlayerIds:[];
    const playerMap = new Map(allPlayersData.map(p=>[p.id,p]));
    return ids.map(id=>playerMap.get(id)).filter(Boolean).filter(p=>positionFilter==='All'||p!.pos===positionFilter) as typeof allPlayersData;
  }, [activeTab, scopePlayerIds, top10PlayerIds, reservePlayerIds, positionFilter, allPlayersData]);

  const flagMap: Record<string,string> = {
    "GAM":"gm","CMR":"cm","MLI":"ml","SEN":"sn","BDI":"bi","NGA":"ng","GHA":"gh","CIV":"ci","ENG":"gb-eng",
    "Senegal":"sn","Cameroon":"cm","Mali":"ml","Burundi":"bi","Nigeria":"ng","The Gambia":"gm","Ghana":"gh","England":"gb-eng"
  };

  const { columns, customData, handleCellChange, handleContextMenu, renderContextMenu, editingColumn, finishEditColumn } =
    useDynamicColumns(getBaseColumns(navigate, flagMap));

  const [colsModalOpen, setColsModalOpen] = useState(false);
  const [visibleColIds, setVisibleColIds] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_IDS));
  const extraCols = useMemo(() => PLAYER_COLUMNS.filter(c => visibleColIds.has(c.id)), [visibleColIds]);

  const groupHeaders = useMemo(() => {
    const groups = columns.reduce((acc,col) => {
      const last = acc[acc.length-1];
      if (last && last.group===col.group) last.count+=1;
      else acc.push({ group: col.group as string, count: 1 });
      return acc;
    }, [] as {group:string;count:number}[]);
    if (groups.length>0 && groups[0].group==='PLAYER IDENTIFICATION') groups[0]={...groups[0],count:groups[0].count+1};
    else groups.unshift({group:'PLAYER IDENTIFICATION',count:1});
    return groups;
  }, [columns]);

  const handleLogout = () => navigate('/');
  const [dashTab, setDashTab] = useState('Overview');
  const isSeniorOrLead = loggedInRole==='Senior Scout'||loggedInRole==='Lead Scout';
  const tabLabel: Record<typeof activeTab,string> = {
    'players-in-scope':'Players in Scope','top-10':'Top 10',
    'reserve-list':'Reserve List','combined-top-10':'Combined Top 10',
  };

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <style dangerouslySetInnerHTML={{__html:`
        ::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#b8d4ef;border-radius:4px;border:2px solid #d2e7fa;}
        ::-webkit-scrollbar-thumb:hover{background:#7baac7;}.hide-scrollbar::-webkit-scrollbar{display:none;}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}} />

      <Sidebar actions={[
        { label: 'This Week', icon: Calendar, onClick: () => setIsTaskModalOpen(true) },
      ]} />

      <main className="flex-1 flex flex-col relative w-full min-w-0 items-center">
        <div className="w-full flex flex-col h-full max-w-none">

          {/* Top Navigation */}
          <TopNav
            responsive
            rolePill={loggedInRole==='Senior Scout' ? (
              <div className="hidden md:flex p-1 bg-accent rounded-[32px] relative items-center h-[44px] min-w-[240px]">
                <div className={`absolute inset-y-1 w-[114px] bg-primary rounded-[32px] shadow-sm transition-all duration-300 z-0 ${userRoleState==='Head Scout'?'left-[122px]':'left-1'}`} />
                <button onClick={()=>handleSeniorViewSwitch('Senior Scout')} className={`relative z-10 w-[114px] h-full flex items-center justify-center font-body text-[14px] font-bold rounded-full transition-colors ${userRoleState!=='Head Scout'?'text-chalk':'text-muted-foreground hover:text-foreground'}`}>Senior Scout</button>
                <button onClick={()=>handleSeniorViewSwitch('Head Scout')} className={`relative z-10 w-[114px] h-full flex items-center justify-center font-body text-[14px] font-bold rounded-full transition-colors ${userRoleState==='Head Scout'?'text-chalk':'text-muted-foreground hover:text-foreground'}`}>Head Scout</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 md:px-5 h-[44px] bg-accent rounded-[32px]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                <span className="hidden md:inline font-body text-[14px] font-bold text-foreground whitespace-nowrap">{loggedInRole} Dashboard</span>
              </div>
            )}
            unreadCount={raiseNotifications.length}
            notifOpen={showNotifPanel}
            onNotifToggle={()=>setShowNotifPanel(p=>!p)}
            notifPanel={(
              <div className="absolute right-0 mt-3 w-80 bg-card rounded-[20px] shadow-2xl border border-border z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-primary">
                  <span className="font-heading font-black text-[14px] text-white">Raised to Long List</span>
                  <button onClick={()=>setShowNotifPanel(false)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {raiseNotifications.length===0
                    ? <div className="px-5 py-8 text-center font-body text-muted-foreground text-[14px] font-medium">No raised players yet</div>
                    : raiseNotifications.map((n,i)=>(
                      <div key={i} className="px-5 py-3 border-b border-border last:border-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><ArrowUpRight size={14} className="text-foreground" /></div>
                        <div><div className="font-body font-bold text-[14px] text-foreground">{n.name}</div><div className="font-body text-[12px] text-muted-foreground font-medium">Raised to Long List</div></div>
                      </div>
                    ))}
                </div>
                {raiseNotifications.length>0 && (
                  <div className="px-5 py-3 border-t border-border">
                    <button onClick={()=>{setRaiseNotifications([]);sessionStorage.removeItem('qazaRaiseNotifs');setShowNotifPanel(false);}} className="font-body text-[12px] font-bold text-[#E05C4B] hover:text-[#E05C4B]/80 transition-colors">Clear all</button>
                  </div>
                )}
              </div>
            )}
            onThisWeek={()=>setIsTaskModalOpen(true)}
            onAddPlayer={()=>setIsAddPlayerModalOpen(true)}
            avatarImg="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
            profileOpen={isProfileOpen}
            onProfileToggle={()=>setIsProfileOpen(!isProfileOpen)}
            profileMenu={(
              <div className="absolute right-0 mt-3 w-64 bg-card text-foreground rounded-[24px] shadow-xl overflow-visible z-50 border border-border font-body">
                <div className="p-4 border-b border-border flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-chalk flex items-center justify-center font-body font-bold text-[14px] shadow-sm">V</div>
                  <div>
                    <div className="font-body font-bold text-[14px] leading-tight">Vanessa Kalondu</div>
                    <div className="font-body text-[12px] text-muted-foreground font-medium">{loggedInRole}</div>
                  </div>
                </div>
                <div className="border-t border-border p-2 mt-2">
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 font-body text-[14px] text-[#E05C4B] font-bold hover:bg-[#E05C4B]/5 rounded-[16px] transition-colors">
                    <LogOut size={16} className="mr-3" /><span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          />

          {/* Content */}
          <div className="pb-12 md:pb-6 px-[var(--pad-page)]">

            {/* DASHBOARD */}
            {activePage==='dashboard' && (
              <div className="flex flex-col w-full">
                <div className="pt-6 mb-3 flex flex-col justify-center shrink-0">
                  <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4">
                    Welcome
                    <span className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
                      <Sun size={28} className="text-chalk" />
                    </span>
                    Oluniyi
                  </h1>
                  <p className="font-body text-muted-foreground text-body mt-2 font-medium max-w-xl short:hidden">{funSubtitle}</p>
                  <ResponsiveTabs className="mt-4" activeId={dashTab} onSelect={setDashTab}
                    tabs={['Overview','Active Players','Pending Reports','Analytics','Reports'].map(t=>({id:t,label:t}))} />
                </div>
                <div className="md:contents">{userRoleState==='Head Scout'?<HeadScoutStatsCards/>:<StatsCards/>}</div>
                <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-[var(--gap-grid)] w-full mt-4 pb-4">
                  <div className="lg:col-span-2 portrait-tablet:col-span-full bg-accent border border-border rounded-[40px] p-[var(--pad-card)] shadow-[0_4px_24px_rgba(6,27,46,0.12),0_1px_4px_rgba(6,27,46,0.10)] h-[550px] flex flex-col">
                    <div className="flex items-center gap-4 mb-6 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-foreground"><Users size={20} /></div>
                      <h2 className="font-heading font-bold text-h5 text-foreground flex items-center">
                        Scout Leaderboard
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-card text-foreground border border-border rounded-full text-[14px] font-bold shadow-sm ml-4">Ghana 🇬🇭</span>
                      </h2>
                    </div>
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="grid grid-cols-12 px-2 py-4 font-heading font-bold text-micro uppercase tracking-widest text-muted-foreground border-b border-border shrink-0">
                        <div className="col-span-6">Scout Name</div><div className="col-span-3">Total Grade A</div><div className="col-span-3 text-right">Country</div>
                      </div>
                      <div className="flex-1 overflow-y-auto hide-scrollbar">
                        {[{name:'Kwame Asante',init:'KA',val:'38 players',country:'Ghana 🇬🇭',color:'bg-primary text-primary-foreground'},{name:'Chidi Obinna',init:'CO',val:'24 players',country:'Nigeria 🇳🇬',color:'bg-primary text-primary-foreground'},{name:'Wekesa Omondi',init:'WO',val:'18 players',country:'Kenya 🇰🇪',color:'bg-primary text-primary-foreground'},{name:'Emeka Okafor',init:'EO',val:'14 players',country:'Nigeria 🇳🇬',color:'bg-primary text-primary-foreground'},{name:'Joseph Njoroge',init:'JN',val:'11 players',country:'Kenya 🇰🇪',color:'bg-primary text-primary-foreground'},{name:'Amani Mushi',init:'AM',val:'8 players',country:'Tanzania 🇹🇿',color:'bg-primary text-primary-foreground'}].map((scout,i)=>(
                          <div key={i} className="grid grid-cols-12 px-2 py-5 items-center border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="col-span-6 flex items-center space-x-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${scout.color}`}>{scout.init}</div><span className="font-body font-bold text-foreground text-[14px]">{scout.name}</span></div>
                            <div className="col-span-3 font-body text-[14px] font-medium text-muted-foreground">{scout.val}</div>
                            <div className="col-span-3 text-right font-bold text-foreground text-[14px]">{scout.country}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1 flex flex-col gap-[var(--gap-grid)] h-[550px]">
                    <div className="bg-card border border-border rounded-[40px] p-[var(--pad-card)] shadow-[var(--shadow-lg)] flex flex-col flex-1 relative overflow-hidden group cursor-pointer h-1/2">
                      <div className="w-12 h-12 rounded-full bg-card/10 flex items-center justify-center text-foreground mb-auto shrink-0 border border-white/5"><TrendingUp size={18} strokeWidth={2.5} /></div>
                      <div className="mt-8"><h4 className="font-heading font-bold text-body text-foreground mb-1">Top Prospect</h4><p className="font-body text-caption text-muted-foreground font-medium mb-3">Based on scout rating</p><div className="font-heading font-bold text-h5 tracking-tight text-foreground leading-tight">Kofi Mensah</div></div>
                    </div>
                    <div className="bg-primary rounded-[40px] p-[var(--pad-card)] shadow-sm flex flex-col flex-1 relative overflow-hidden group h-1/2">
                      <div className="w-12 h-12 rounded-full bg-card/20 flex items-center justify-center text-chalk mb-auto shrink-0"><Calendar size={18} strokeWidth={2.5} /></div>
                      <div className="mt-6 flex flex-col">
                        <h4 className="font-heading font-bold text-body text-chalk mb-1">Upcoming Matches</h4>
                        <div className="space-y-3 mb-6 flex-1">
                          {['Gor Mahia vs Kariobangi','Enyimba FC vs Kano Pillars'].map((m,i)=>(
                            <div key={i} className="flex justify-between items-center font-body text-[14px] font-bold text-chalk bg-card/20 px-3 py-2 rounded-[16px]">
                              <span className="truncate pr-4">{m}</span>
                              <span className="shrink-0 bg-card/50 px-2 py-1 rounded-full font-body text-[12px] font-bold uppercase text-foreground">Dec {15+i}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={()=>navigate('/matches')} className="bg-primary text-primary-foreground hover:bg-black w-fit font-bold text-[14px] px-6 py-3 rounded-full transition-colors mt-auto">View Matches</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SENIOR/LEAD PLAYERS */}
            {activePage==='players' && isSeniorOrLead && (
              <div className="flex flex-col w-full min-w-0 pt-4">
                <SeniorLeadPlayersPage allPlayersData={allPlayersData} loggedInRole={loggedInRole} flagMap={flagMap} />
              </div>
            )}

            {/* COUNTRY/HEAD PLAYERS — no left sidebar, full width */}
            {activePage==='players' && !isSeniorOrLead && (
              <div className="flex flex-col w-full mt-4">

                {/* Page title */}
                <div className="mb-6 flex flex-wrap gap-4 justify-between items-end">
                  <div>
                    <h1 className="font-heading font-semibold text-[24px] md:text-[32px] tracking-tight text-foreground flex items-center gap-4 leading-[1]">
                      NXUS
                      <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0"><Users size={28} className="text-white" /></span>
                      Players
                    </h1>
                    <p className="font-body text-muted-foreground text-[16px] mt-4 font-medium">
                      {activeTab==='players-in-scope'?'All players within your active scouting scope.':activeTab==='top-10'?'Your current top ten performance and prospect selections.':activeTab==='reserve-list'?'Players held in reserve for future consideration.':'Track regional scout submissions and pipeline status.'}
                    </p>
                  </div>
                  {activeTab!=='combined-top-10' && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={()=>setColsModalOpen(true)} aria-label="Columns"
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-[14px] border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground shrink-0 transition-colors">
                        <Columns3 size={14} /> <span className="hidden sm:inline">Columns</span>
                      </button>
                      <div className="hidden md:flex items-center space-x-1 bg-card border border-border p-2 rounded-full shadow-sm shrink-0">
                        <button onClick={()=>setViewMode('table')} className={`p-2 rounded-full flex items-center transition-all ${viewMode==='table'?'bg-primary text-primary-foreground shadow-sm':'text-muted-foreground hover:text-foreground hover:bg-accent'}`} title="Table View"><List size={16} /></button>
                        <button onClick={()=>setViewMode('card')} className={`p-2 rounded-full flex items-center transition-all ${viewMode==='card'?'bg-primary text-primary-foreground shadow-sm':'text-muted-foreground hover:text-foreground hover:bg-accent'}`} title="Card View"><LayoutGrid size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
                <EditColumnsModal open={colsModalOpen} columns={PLAYER_COLUMNS} visible={visibleColIds} onApply={setVisibleColIds} onClose={() => setColsModalOpen(false)} />

                {/* Tab row */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar flex-nowrap">
                  {([{id:'players-in-scope',label:'Players in Scope'},{id:'top-10',label:'Top 10'},{id:'reserve-list',label:'Reserve List'},{id:'combined-top-10',label:'Combined Top 10'}] as {id:typeof activeTab;label:string}[]).map(tab=>(
                    <button key={tab.id} onClick={()=>handleTabChange(tab.id)}
                      className={`relative shrink-0 px-6 py-2 rounded-full font-body font-bold text-[14px] transition-all flex items-center gap-2 border ${activeTab===tab.id?'bg-primary text-primary-foreground border-primary shadow-sm':'bg-card text-muted-foreground border-white hover:border-primary hover:text-foreground'}`}>
                      <span>{tab.label}</span>
                      {tab.id==='top-10'&&top10PlayerIds.length>0&&<span className={`text-[12px] font-black px-2 py-0.5 rounded-full ${activeTab==='top-10'?'bg-card/20 text-white':'bg-primary/15 text-foreground'}`}>{top10PlayerIds.length}</span>}
                      {tab.id==='reserve-list'&&reservePlayerIds.length>0&&<span className={`text-[12px] font-black px-2 py-0.5 rounded-full ${activeTab==='reserve-list'?'bg-card/20 text-white':'bg-accent text-foreground'}`}>{reservePlayerIds.length}</span>}
                    </button>
                  ))}
                </div>

                {/* Dark filter bar — BIO + TECH + SHOW + STATS + Active/Audit + Apply */}
                {activeTab!=='combined-top-10' && (
                  <>
                    {/* Desktop */}
                    <div className="hidden md:flex bg-primary rounded-[24px] px-6 py-4 items-center gap-4 flex-wrap mb-4">
                      {/* BIO */}
                      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">BIO</span>
                      {[{label:'Foot',opts:['Any','Right','Left','Both']},{label:'Ht',opts:['Any','<170','170–180','180–190','>190']},{label:'Age',opts:['Any','U18','U21','U23','U25','25+']}].map(f=>(
                        <div key={f.label} className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer">
                          <span className="font-body text-[14px] font-bold text-muted-foreground">{f.label}:</span>
                          <select className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5">
                            {f.opts.map(o=><option key={o} className="text-black">{o}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
                        </div>
                      ))}
                      <div className="w-px h-6 bg-card/10 mx-1 shrink-0" />
                      {/* TECH */}
                      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">TECH</span>
                      {[{label:'Pos',opts:['All','ST','LW','RW','CM','FB','CB'],state:positionFilter,set:setPositionFilter},{label:'Profile',opts:['All','Wonderkid','Prospect','Performance','Journeyman'],state:'All',set:()=>{}},{label:'Scout',opts:['All','Scouted','Unscouted'],state:'All',set:()=>{}}].map(f=>(
                        <div key={f.label} className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer">
                          <span className="font-body text-[14px] font-bold text-muted-foreground">{f.label}:</span>
                          <select value={f.state} onChange={e=>f.set(e.target.value)} className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5">
                            {f.opts.map(o=><option key={o} className="text-black">{o}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
                        </div>
                      ))}
                      <div className="w-px h-6 bg-card/10 mx-1 shrink-0" />
                      {/* SHOW */}
                      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Show</span>
                      <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer">
                        <select className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5" value={showFilter} onChange={e=>setShowFilter(e.target.value)}>
                          <option value="All players" className="text-black">All Players</option>
                          <option value="Raised" className="text-black">Raised</option>
                          <option value="Can add" className="text-black">Can add</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="w-px h-6 bg-card/10 mx-1 shrink-0" />
                      {/* STATS */}
                      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Stats</span>
                      <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer">
                        <select className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5" value={statFilter} onChange={e=>setStatFilter(e.target.value)}>
                          {['All Stats','Goals','Assists','Mins','xG','xA','Shots','SOT','Pass%','Tackles','Interceptions','Clearances','Starts'].map(s=><option key={s} className="text-black">{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {/* Active/Audit + Apply */}
                      <div className="ml-auto flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-card/5 border border-white/10 rounded-full p-1">
                          {['Active','Audit'].map((mode,i)=>(
                            <button key={mode} className={`px-4 py-2 rounded-full font-body text-[14px] font-bold transition-all ${i===0?'bg-primary text-primary-foreground':'text-muted-foreground hover:text-primary-foreground'}`}>{mode}</button>
                          ))}
                        </div>
                        <button className="px-6 py-2 bg-primary border-2 border-primary text-white hover:bg-primary/80 rounded-full font-body text-[14px] font-bold transition-colors">Apply</button>
                      </div>
                    </div>
                    {/* Mobile filter bar */}
                    <div className="flex md:hidden items-center gap-3 mb-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-body text-[14px] font-bold"><ChevronDown size={14} />Filters</button>
                      <div className="flex items-center bg-card border border-border rounded-full p-1 ml-auto">
                        {['Active','Audit'].map((mode,i)=>(
                          <button key={mode} className={`px-4 py-2 rounded-full font-body text-[14px] font-bold transition-all ${i===0?'bg-primary text-primary-foreground':'text-muted-foreground hover:text-foreground'}`}>{mode}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Top 10 submit counter */}
                {activeTab==='top-10' && (
                  <div className="flex items-center gap-6 mb-4 px-4 py-3 bg-card border border-border rounded-[16px] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Performance</span>
                        <span className="font-heading font-semibold text-[16px] text-foreground leading-none">{perfCount}/10</span>
                      </div>
                      <div className="w-px h-8 bg-secondary" />
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Prospects</span>
                        <span className="font-heading font-semibold text-[16px] text-foreground leading-none">{prospectCount}/10</span>
                      </div>
                    </div>
                    <button className="ml-auto bg-primary text-primary-foreground px-6 py-2 rounded-full font-body font-black text-[14px] hover:bg-primary/80 transition-colors shadow-sm"
                      onClick={()=>{if(perfCount<10)setPerfCount(p=>p+1);else if(prospectCount<10)setProspectCount(p=>p+1);}}>
                      Submit Shortlist
                    </button>
                  </div>
                )}

                {/* Reserve List info bar */}
                {activeTab==='reserve-list' && (
                  <div className="mb-4 px-4 py-3 bg-accent border border-border rounded-[16px]">
                    <p className="font-body text-[14px] text-muted-foreground font-semibold">Players in Reserve can be promoted to Top 10 or returned to Players in Scope.</p>
                  </div>
                )}

                {/* COMBINED TOP 10 */}
                {activeTab==='combined-top-10' && (
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 portrait-tablet:grid-cols-1 gap-8 h-full min-h-[500px]">
                      <div className="bg-card border border-border rounded-[40px] p-8 shadow-[var(--shadow-lg)] flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center text-foreground"><ShieldCheck size={24} strokeWidth={2.5} /></div>
                            <div><h3 className="font-heading font-bold text-[24px] text-foreground">Submitted</h3><p className="font-body font-bold text-[14px] text-foreground">Action Required: None</p></div>
                          </div>
                          <div className="font-heading font-black text-[44px] tracking-tight text-foreground">12</div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                          {[{name:'Kofi Mensah',role:'Country Scout',region:'Ghana',date:'Today, 10:45 AM'},{name:'Ngozi Eze',role:'Country Scout',region:'Nigeria',date:'Yesterday, 4:20 PM'},{name:'Pape Sarr',role:'Country Scout',region:'Senegal',date:'Yesterday, 1:15 PM'},{name:'Emeka Okafor',role:'Country Scout',region:'Nigeria',date:'Monday, 9:00 AM'}].map((scout,i)=>(
                            <div key={i} className="bg-card border border-border rounded-[24px] p-5 flex items-center justify-between hover:bg-accent transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-card shadow-sm border border-border flex items-center justify-center font-body font-bold text-[12px] text-foreground">{scout.name.split(' ').map(n=>n[0]).join('')}</div>
                                <div><div className="font-body font-bold text-[14px] text-foreground">{scout.name}</div><div className="font-body text-[12px] font-medium text-muted-foreground">{scout.region} • {scout.role}</div></div>
                              </div>
                              <div className="text-right">
                                <div className="text-foreground bg-primary/10 px-3 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">Complete</div>
                                <div className="font-body text-[12px] font-medium text-muted-foreground block">{scout.date}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-card border border-border rounded-[40px] p-8 shadow-[var(--shadow-lg)] flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#E05C4B]" />
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[16px] bg-[#E05C4B]/10 flex items-center justify-center text-[#E05C4B]"><TrendingUp size={24} strokeWidth={2.5} /></div>
                            <div><h3 className="font-heading font-bold text-[24px] text-foreground">Not Submitted</h3><p className="font-body font-bold text-[14px] text-[#E05C4B]">Action Required: Follow up</p></div>
                          </div>
                          <div className="font-heading font-black text-[44px] tracking-tight text-[#E05C4B]">4</div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                          {[{name:'Fatou Mensah',role:'Country Scout',region:'Ghana',status:'7/10 Profiles'},{name:'Aliou Cisse',role:'Country Scout',region:'Senegal',status:'2/10 Profiles'},{name:'Kwame Asante',role:'Head Scout',region:'Ghana',status:'Reviewing'},{name:'Moussa Sow',role:'Head Scout',region:'Senegal',status:'Reviewing'}].map((scout,i)=>(
                            <div key={i} className="bg-[#E05C4B]/5 border border-[#E05C4B]/10 rounded-[24px] p-5 flex items-center justify-between hover:bg-[#E05C4B]/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-card shadow-sm border border-border flex items-center justify-center font-body font-bold text-[12px] text-foreground">{scout.name.split(' ').map(n=>n[0]).join('')}</div>
                                <div><div className="font-body font-bold text-[14px] text-foreground">{scout.name}</div><div className="font-body text-[12px] font-medium text-muted-foreground">{scout.region} • {scout.role}</div></div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="font-body font-bold text-[14px] text-[#E05C4B]">{scout.status}</div>
                                <button className="font-body text-[10px] font-black tracking-wider uppercase text-[#E05C4B] bg-[#E05C4B]/20 px-3 py-1 rounded-md hover:bg-[#E05C4B]/30 transition-colors">Nudge</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TABLE VIEW */}
                {activeTab!=='combined-top-10' && effectiveViewMode==='table' && (
                  <div className="bg-card rounded-[32px] shadow-[var(--shadow-lg)] border border-border flex-1 overflow-hidden flex flex-col relative">
                    {renderContextMenu()}
                    {currentPlayersData.length===0 && (
                      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4"><Users size={28} className="text-muted-foreground" /></div>
                        <div className="font-heading font-semibold text-[16px] text-foreground mb-2">No players here</div>
                        <div className="font-body text-[14px] text-muted-foreground font-medium max-w-xs">
                          {activeTab==='top-10'&&'Move players from Players in Scope using the Top Ten button.'}
                          {activeTab==='reserve-list'&&'Move players from Players in Scope or Top 10 using the Reserve button.'}
                          {activeTab==='players-in-scope'&&'No players match the current filters.'}
                        </div>
                      </div>
                    )}
                    {currentPlayersData.length>0 && (
                      <div className="flex-1 overflow-auto hide-scrollbar rounded-[32px]">
                        <table className="w-full text-left whitespace-nowrap border-separate border-spacing-0 min-w-max">
                          <thead className="sticky top-0 z-[50]">
                            <tr>
                              {groupHeaders.map((grp,idx)=>(
                                <th key={idx} colSpan={grp.count}
                                  className={`px-4 py-3 text-center font-heading font-bold text-[10px] text-chalk uppercase tracking-widest bg-primary border-b border-white/10 ${grp.group==='PLAYER IDENTIFICATION'?'sticky left-0 z-[60] bg-primary':''} ${grp.group==='GAME STATS'||grp.group==='VIDEOS'?'text-foreground':'text-chalk/60'}`}>
                                  {grp.group}
                                </th>
                              ))}
                              {extraCols.length>0 && (
                                <th colSpan={extraCols.length} className="px-4 py-3 text-center font-heading font-bold text-[10px] text-chalk/60 uppercase tracking-widest bg-primary border-b border-white/10 border-l border-l-white/10">
                                  CUSTOM
                                </th>
                              )}
                            </tr>
                            <tr className="font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-wider border-b-2 border-border bg-card">
                              <th className="sticky left-0 z-[60] bg-card px-4 py-4 w-40 text-left">Actions</th>
                              {columns.map((col,idx)=>(
                                <th key={col.id} className={`px-4 py-4 ${col.isSticky?`sticky ${col.isSticky} z-[60] bg-card shadow-right`:''} ${col.width||''} ${col.minWidth||''} ${col.borderRight?'border-r border-border':''} ${col.bgHeader||'bg-card'} ${col.align==='center'?'text-center':'text-left'} cursor-context-menu hover:bg-secondary`}
                                  onContextMenu={e=>handleContextMenu(e,idx,col.group)}>
                                  {editingColumn?.index===idx
                                    ? <input autoFocus type="text" defaultValue={editingColumn.label} onBlur={e=>finishEditColumn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&finishEditColumn(e.currentTarget.value)} className="bg-accent px-2 py-1 rounded text-foreground font-bold text-[12px] outline-none w-full" />
                                    : col.label}
                                </th>
                              ))}
                              {extraCols.map(c=>(
                                <th key={c.id} className="px-4 py-4 bg-card text-center whitespace-nowrap border-l border-border">{c.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-card font-body">
                            {['Strikers','Wingers','Midfielders','Full Backs','Centre Backs'].map(posGroup=>{
                              const posPlayers = currentPlayersData.filter(p=>p.pos===posGroup);
                              if (!posPlayers.length) return null;
                              return (
                                <Fragment key={posGroup}>
                                  <tr className="bg-primary border-b border-[#061b2e] sticky top-[87px] z-[40] cursor-pointer hover:bg-[#0d2a45] transition-colors" onClick={()=>togglePosition(posGroup)}>
                                    <td colSpan={columns.length+1+extraCols.length} className="bg-primary p-0">
                                      <div className="sticky left-0 z-[40] px-6 py-3 font-heading font-bold text-[10px] text-chalk uppercase tracking-widest flex items-center gap-2 w-max bg-primary">
                                        <ChevronDown size={16} className={`transition-transform ${collapsedPositions[posGroup]?'-rotate-90':''}`} />
                                        {posGroup} <span className="text-muted-foreground">({posPlayers.length})</span>
                                      </div>
                                    </td>
                                  </tr>
                                  {!collapsedPositions[posGroup] && posPlayers.map((player,rowIndex)=>(
                                    <tr key={player.id} className={`border-b border-border hover:bg-accent transition-colors group ${raisedPlayerIds.has(player.id)?'bg-primary/5':''}`}>
                                      <td className="px-3 py-3 sticky left-0 z-[20] bg-card group-hover:bg-accent w-40">
                                        {raisedPlayerIds.has(player.id)&&activeTab==='players-in-scope'&&<div className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                                        {activeTab==='players-in-scope' && (
                                          <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                            items={[
                                              { label: 'Add to Top 10', action: () => handleScopeToTop10(player.id), icon: <Star size={12} /> },
                                              { label: 'Add to Reserve', action: () => handleScopeToReserve(player.id), icon: <Bookmark size={12} /> },
                                              { label: 'Raise to Pipeline', action: () => handleRaise(player.id, player.name), icon: <ArrowUpRight size={12} /> },
                                            ]} />
                                        )}
                                        {activeTab==='top-10' && (
                                          <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                            items={[
                                              { label: 'Raise to Pipeline', action: () => handleRaise(player.id, player.name), icon: <ArrowUpRight size={12} /> },
                                              { label: 'Move to Reserve', action: () => handleTop10ToReserve(player.id), icon: <Bookmark size={12} /> },
                                              { label: 'Remove', action: () => handleTop10ToScope(player.id), icon: <Trash2 size={12} />, danger: true },
                                            ]} />
                                        )}
                                        {activeTab==='reserve-list' && (
                                          <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                            items={[
                                              { label: 'Move to Top 10', action: () => handleReserveToTop10(player.id), icon: <Star size={12} /> },
                                              { label: 'Remove', action: () => handleReserveToScope(player.id), icon: <Trash2 size={12} />, danger: true },
                                            ]} />
                                        )}
                                      </td>
                                      {columns.map(col=>{
                                        const customVal = customData?.[player.id]?.[col.id]||'';
                                        return (
                                          <td key={col.id} className={`px-4 py-3 ${col.isSticky?`sticky ${col.isSticky} z-[20] bg-card group-hover:bg-accent shadow-right`:''} ${col.borderRight?'border-r border-border':''} ${col.bgCell||''} ${col.fontMono?'font-mono text-[14px]':''} ${col.align==='center'?'text-center':''}`}>
                                            {col.renderCell?col.renderCell(player,rowIndex,customVal,(val:string)=>handleCellChange(player.id,col.id,val)):(player as any)[col.id]}
                                          </td>
                                        );
                                      })}
                                      {extraCols.map(c=>(
                                        <td key={c.id} className="px-4 py-3 text-center border-l border-border">
                                          <span className={`text-[14px] font-medium text-muted-foreground whitespace-nowrap ${c.mono?'font-mono':'font-body'}`}>{c.value(player,rowIndex)}</span>
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* CARD VIEW */}
                {activeTab!=='combined-top-10' && effectiveViewMode==='card' && (
                  <div className="flex-1 overflow-auto">
                    {currentPlayersData.length===0 && (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4"><Users size={28} className="text-muted-foreground" /></div>
                        <div className="font-heading font-semibold text-[16px] text-foreground mb-2">No players here</div>
                        <div className="font-body text-[14px] text-muted-foreground font-medium">Move players from Players in Scope to see them here.</div>
                      </div>
                    )}
                    <div className="flex flex-col gap-0 pb-10">
                      {['Strikers','Wingers','Midfielders','Full Backs','Centre Backs'].map(posGroup => {
                        const posPlayers = currentPlayersData.filter(p => p.pos === posGroup);
                        if (!posPlayers.length) return null;
                        
                        // Group by YOB within the position group
                        const yobs = Array.from(new Set(posPlayers.map(p => 2026 - p.age))).sort((a,b) => b-a);
                        
                        return (
                          <div key={posGroup} className="flex flex-col">
                            {/* Primary Header (Position) */}
                            <div className="sticky top-0 z-20 bg-background py-6">
                              <div className="flex items-center w-full">
                                <div className="flex-1 h-px bg-border" />
                                <div className="px-6 py-2 rounded-full border border-border bg-card shadow-sm">
                                  <span className="font-heading font-black text-[12px] uppercase tracking-[0.2em] text-primary">
                                    {posGroup}
                                  </span>
                                </div>
                                <div className="flex-1 h-px bg-border" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-8 px-4 md:px-0">
                              {yobs.map(yob => {
                                const yobPlayers = posPlayers.filter(p => (2026 - p.age) === yob);
                                const groupKey = `${posGroup}-${yob}`;
                                const isCollapsed = collapsedPositions[groupKey];

                                return (
                                  <div key={yob} className="flex flex-col gap-4">
                                    {/* Secondary Header (YOB) */}
                                    <div className="flex flex-col gap-1 w-full">
                                      <button 
                                        onClick={() => togglePosition(groupKey)}
                                        className="flex items-center gap-2 w-fit hover:opacity-70 transition-opacity group"
                                      >
                                        <ChevronDown size={16} className={`text-[#061b2e] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                        <span className="font-heading font-bold text-[14px] text-[#061b2e]">
                                          {yob}
                                        </span>
                                      </button>
                                      <div className="h-px bg-border/40 w-full" />
                                    </div>

                                    {!isCollapsed && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-fade-in">
                                        {yobPlayers.map(player => {
                                          const natCode = flagMap[player.nationality] || "un";
                                          const isRaised = raisedPlayerIds.has(player.id);
                                          
                                          return (
                                            <div key={player.id} className={`bg-[#f4faff] relative rounded-[32px] overflow-hidden border border-[#b4d7f6] shadow-[0px_8px_30px_0px_rgba(6,27,46,0.08)] transition-all hover:shadow-xl group w-full max-w-[380px] ${isRaised ? 'border-primary/40' : ''}`}>
                                              {isRaised && <div className="absolute top-0 left-0 w-full h-1 bg-primary z-10" />}
                                              <div className="p-[24.8px] flex flex-col gap-[16px]">
                                                {/* Top Row */}
                                                <div className="flex items-start justify-between">
                                                  <div className="flex items-center gap-[12px]">
                                                    {/* Avatar */}
                                                    <div className="bg-[#f0f7fd] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center size-[56px] rounded-full shrink-0 border border-[#b4d7f6] relative">
                                                      <p className="font-heading font-bold text-[#061b2e] text-[14px]">{player.initials}</p>
                                                    </div>
                                                    {/* Name and Tags */}
                                                    <div className="flex flex-col gap-[6px]">
                                                      <h3 onClick={() => navigate(`/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, dob: player.dob, nationality: player.nationality, primaryPos: player.pos, currentTeam: player.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })} className="font-heading font-bold text-[#061b2e] text-[16px] hover:underline cursor-pointer truncate max-w-[140px] leading-tight">{player.name}</h3>
                                                      <div className="flex gap-[6px]">
                                                        <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                                          <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">{player.age}</p>
                                                        </div>
                                                        <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                                          <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">F{player.matchVideos + player.highlightVideos}</p>
                                                        </div>
                                                        <div className={`w-2 h-2 rounded-full mt-2 self-start ${player.dotColor}`} />
                                                      </div>
                                                    </div>
                                                  </div>
                                                  {/* Actions */}
                                                  <div className="flex items-center">
                                                    {activeTab === 'players-in-scope' && (
                                                      <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                                        items={[
                                                          { label: 'Add to Top 10', action: () => handleScopeToTop10(player.id), icon: <Star size={12} /> },
                                                          { label: 'Add to Reserve', action: () => handleScopeToReserve(player.id), icon: <Bookmark size={12} /> },
                                                          { label: 'Raise to Pipeline', action: () => handleRaise(player.id, player.name), icon: <ArrowUpRight size={12} /> },
                                                        ]} />
                                                    )}
                                                    {activeTab === 'top-10' && (
                                                      <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                                        items={[
                                                          { label: 'Raise to Pipeline', action: () => handleRaise(player.id, player.name), icon: <ArrowUpRight size={12} /> },
                                                          { label: 'Move to Reserve', action: () => handleTop10ToReserve(player.id), icon: <Bookmark size={12} /> },
                                                          { label: 'Remove', action: () => handleTop10ToScope(player.id), icon: <Trash2 size={12} />, danger: true },
                                                        ]} />
                                                    )}
                                                    {activeTab === 'reserve-list' && (
                                                      <ActionDropdown playerId={player.id} openId={openDropdownId} setOpenId={setOpenDropdownId}
                                                        items={[
                                                          { label: 'Move to Top 10', action: () => handleReserveToTop10(player.id), icon: <Star size={12} /> },
                                                          { label: 'Remove', action: () => handleReserveToScope(player.id), icon: <Trash2 size={12} />, danger: true },
                                                        ]} />
                                                    )}
                                                  </div>
                                                </div>
                                                {/* Bottom Row */}
                                                <div className="relative h-[81.6px] w-full">
                                                  {/* Team */}
                                                  <div className="absolute left-0 top-0 bg-[#f4faff] border border-[#b4d7f6] rounded-[16px] p-[12.8px] w-[138.2px] h-[65.6px] flex flex-col items-start">
                                                    <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[4px]">Team</p>
                                                    <p className="font-heading font-bold text-[#061b2e] text-[14px] truncate leading-tight w-full">{player.pTeam}</p>
                                                  </div>
                                                  {/* Flag */}
                                                  <div className="absolute left-[97.2px] top-[31px] size-[20px] rounded-full pointer-events-none z-10 overflow-hidden border border-[#b4d7f6]">
                                                    <img src={`https://flagcdn.com/w40/${natCode}.png`} alt={player.nationality} className="absolute inset-0 size-full object-cover" />
                                                  </div>
                                                  {/* Stats */}
                                                  <div className="absolute left-[149.2px] top-[12.2px] flex items-start gap-[20px]">
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">APP</p>
                                                      <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.app}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">G</p>
                                                      <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.goals}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">A</p>
                                                      <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.ass}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                      <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">SCOUTS</p>
                                                      <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">1</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activePage==='matches'&&<MatchesView/>}
            {activePage==='admin'&&<AdminView/>}
          </div>
        </div>
      </main>

      {/* Raise Toast */}
      {raiseToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-primary text-white px-6 py-4 rounded-[24px] shadow-2xl border border-white/10 flex items-center gap-4 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm"><ArrowUpRight size={18} className="text-white" /></div>
          <div><div className="font-heading font-black text-[14px]">{raiseToast}</div><div className="font-body text-[12px] text-white/70 font-medium mt-0.5">Raised to Long List · Senior & Lead Scouts notified</div></div>
          <button onClick={()=>setRaiseToast(null)} className="ml-2 text-white/40 hover:text-white/80 transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={()=>setIsTaskModalOpen(false)}>
          <div className="bg-card border border-border w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-border flex justify-between items-center bg-accent/50 shrink-0">
              <h2 className="font-heading font-extrabold text-2xl text-foreground flex items-center gap-3"><Calendar className="text-foreground" size={24} />Tasks for This Week</h2>
              <button onClick={()=>setIsTaskModalOpen(false)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"><X size={16} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <input type="text" placeholder="Add a new task..." value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&newTaskText.trim()){setTasks([...tasks,{id:Date.now(),text:newTaskText,completed:false}]);setNewTaskText('');}}}
                  className="flex-1 bg-card border border-border rounded-xl px-4 py-3 font-body text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                <button onClick={()=>{if(newTaskText.trim()){setTasks([...tasks,{id:Date.now(),text:newTaskText,completed:false}]);setNewTaskText('');}}} className="bg-primary text-chalk p-3 rounded-xl hover:bg-primary/80 transition-colors shadow-sm shrink-0"><Plus size={20} /></button>
              </div>
              <div className="space-y-3">
                {tasks.map(task=>(
                  <div key={task.id} className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-border bg-card transition-all shadow-sm">
                    <button onClick={()=>setTasks(tasks.map(t=>t.id===task.id?{...t,completed:!t.completed}:t))} className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${task.completed?'bg-primary text-primary-foreground border-primary':'border-2 border-border hover:border-primary'}`}>
                      {task.completed&&<ShieldCheck size={14} strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 font-body text-[14px] font-medium leading-relaxed ${task.completed?'text-muted-foreground line-through':'text-foreground'}`}>{task.text}</span>
                    <button onClick={()=>setTasks(tasks.filter(t=>t.id!==task.id))} className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0"><Archive size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-border bg-accent/50 flex justify-between items-center shrink-0">
              <span className="font-body text-[14px] font-bold text-muted-foreground">{tasks.filter(t=>t.completed).length}/{tasks.length} completed</span>
              <button onClick={()=>setIsTaskModalOpen(false)} className="px-6 py-2 bg-secondary text-foreground hover:bg-secondary rounded-full font-body font-bold text-[14px] transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-card border border-border w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-card shrink-0">
              <h2 className="font-heading font-black text-2xl text-foreground">Add New Player</h2>
              <button onClick={()=>setIsAddPlayerModalOpen(false)} className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-[#E05C4B] hover:bg-red-50 shadow-sm transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 bg-card flex items-center justify-center text-muted-foreground hover:bg-primary/5 cursor-pointer transition-colors group"><Plus size={24} className="group-hover:scale-110 transition-transform" /></div>
                <span className="font-heading font-bold text-[10px] text-muted-foreground mt-3 uppercase tracking-widest">Upload Photo</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 portrait-tablet:grid-cols-1 gap-8">
                <div className="space-y-5">
                  <h3 className="font-heading font-black text-[10px] uppercase tracking-widest text-foreground pb-2 border-b border-border">Bio Data</h3>
                  <div className="space-y-4">
                    <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Full Name</label><input type="text" placeholder="e.g. John Doe" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Parent Team</label><select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Team</option><option>Manchester United</option><option>Right to Dream</option></select></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Current Team</label><select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Team</option><option>U21</option><option>Senior</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Date of Birth</label><input type="date" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all" /></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Nationality</label><input type="text" placeholder="e.g. Ghana" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <h3 className="font-heading font-black text-[10px] uppercase tracking-widests text-foreground pb-2 border-b border-border">Technical Data</h3>
                  <div className="space-y-4">
                    <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Positions</label><div className="flex space-x-2">{['Primary','Secondary','Tertiary'].map(p=><select key={p} className="flex-1 bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all appearance-none cursor-pointer text-center"><option>{p}</option><option>ST</option><option>LW</option><option>RW</option><option>CM</option></select>)}</div></div>
                    <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Preferred Foot</label><select className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Foot</option><option>Right</option><option>Left</option><option>Both</option></select></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Height (cm)</label><input type="number" placeholder="185" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all" /></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Weight (kg)</label><input type="number" placeholder="78" className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none transition-all" /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-heading font-black text-[10px] uppercase tracking-widest text-foreground pb-2 border-b border-border">Pipeline Action</h3>
                <div className="flex flex-wrap items-center gap-6">
                  {['Reserve List','Top 10','Raise'].map(action=>(
                    <label key={action} className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-muted-foreground rounded bg-transparent checked:bg-primary checked:border-primary transition-colors cursor-pointer" />
                        <svg className="absolute w-3.5 h-3.5 text-chalk pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none"><path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" /></svg>
                      </div>
                      <span className="font-body text-[14px] font-bold text-foreground group-hover:text-muted-foreground transition-colors">Add to {action}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-border bg-card shrink-0 flex justify-end">
              <button onClick={()=>setIsAddPlayerModalOpen(false)} className="px-8 py-3 bg-primary hover:bg-primary text-primary-foreground rounded-full font-body font-bold text-[14px] shadow-sm transition-all uppercase tracking-wide">Add Player</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

// ─── Action Dropdown — icon-only, remembers last selection ──────────────────

}