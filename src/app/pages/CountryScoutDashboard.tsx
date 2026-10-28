import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Calendar, Plus, Bell, LogOut, ChevronDown,
  Video, Archive, Moon, Sun,
  TrendingUp, ShieldCheck, ArrowUpRight, ArrowRight, ClipboardCheck, FileText, Crown, Users, X, Star, Bookmark, Trash2
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
import { KpiCard } from '../components/dashboard/KpiCard';
import { SeniorLeadPlayersPage } from '../components/SeniorLeadPlayersPage';
import { ResponsiveTabs } from '../components/ResponsiveTabs';
import {
  PlayersPageTitle, useFocusMode, PlayersCard, PlayersCardHeader, PlayersCardZone, TabPill, MobileTabMenu,
  ViewModeToggle, FiltersButton, MobileFiltersButton, ColumnsButton, LLSelect, RangePair, SegmentedToggle,
  PlayerSearchBox, MobileFilterSheet, PosHeader, YobHeader, FlagBadge, PlayerAvatar, ActionButtons,
  useShowBackToTop, BackToTopButton,
} from '../components/PlayersTableKit';

const FlagCircle = ({ code, label }: { code: string; label: string }) => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-default bg-surface-accent shrink-0 mx-auto">
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={label} className="w-full h-full object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  </div>
);

const getBaseColumns = (navigate: any, flagMap: Record<string, string>): ColumnDef[] => [
  {
    id: 'details', group: 'PLAYER IDENTIFICATION', label: 'Player Details',
    // Sticky; its `left` offset is set inline to the Actions column width (it varies per tab).
    isSticky: 'true', width: 'w-[200px]', borderRight: true,
    // Same identity cell as the Lead/Senior tables: avatar · linked name · age + flag
    renderCell: (p) => (
      <div className="flex items-center gap-2 min-w-[190px]">
        <PlayerAvatar initials={p.initials} />
        <div className="flex flex-col items-start min-w-0">
          <span onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}
            className="font-body font-bold text-link text-[14px] leading-tight whitespace-nowrap hover:underline cursor-pointer">{p.name}</span>
          <div className="flex items-center gap-2">
            <span className="font-body text-[12px] text-muted shrink-0">{p.age}</span>
            <FlagBadge code={flagMap[p.nationality] || 'un'} label={p.nationality} />
          </div>
        </div>
      </div>
    )
  },
  { id: 'dob', group: 'BIO DATA', label: 'DOB', align: 'center', renderCell: (p) => <span className="font-body text-[12px] text-muted">{p.dob}</span> },
  { id: 'nat', group: 'BIO DATA', label: 'Nat', align: 'center', renderCell: (p) => <FlagCircle code={flagMap[p.nationality] || 'un'} label={p.nationality} /> },
  { id: 'country', group: 'BIO DATA', label: 'Ctry', align: 'center', renderCell: (p) => <FlagCircle code={flagMap[p.country] || 'un'} label={p.country} /> },
  { id: 'pos', group: 'BIO DATA', label: 'Pos', renderCell: (p) => <span className="font-body text-[12px] font-bold text-body">{p.pos}</span> },
  { id: 'pteam', group: 'BIO DATA', label: 'P.Team', renderCell: (p) => <span className="font-body text-[12px] text-muted">{p.pTeam}</span> },
  { id: 'lvl', group: 'BIO DATA', label: 'Lvl', renderCell: (p) => <span className="font-body text-[12px] text-muted">{p.pCountry}</span> },
  { id: 'match', group: 'BIO DATA', label: 'Match', borderRight: true, renderCell: (p) => <span className="font-body text-[12px] text-muted">{p.cTeam}</span> },
  { id: 'mins',  group: 'GAME STATS', label: 'Mins',  bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.app}</span> },
  { id: 'gls',   group: 'GAME STATS', label: 'Gls',   fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.starts}</span> },
  { id: 'ast',   group: 'GAME STATS', label: 'Ast',   bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-bold text-strong text-[14px]">{p.goals}</span> },
  { id: 'xg',    group: 'GAME STATS', label: 'xG',    fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.ass}</span> },
  { id: 'xa',    group: 'GAME STATS', label: 'xA',    bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.pens}</span> },
  { id: 'shots', group: 'GAME STATS', label: 'Shots', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.gcMins}</span> },
  { id: 'sot',   group: 'GAME STATS', label: 'SOT',   bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.m90}</span> },
  { id: 'pass',  group: 'GAME STATS', label: 'Pass%', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.g90}</span> },
  { id: 'tckl',  group: 'GAME STATS', label: 'Tckl',  bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.a90}</span> },
  { id: 'int',   group: 'GAME STATS', label: 'Int',   fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.gc90}</span> },
  { id: 'clr',   group: 'GAME STATS', label: 'Clr',   bgHeader: 'bg-surface-card', bgCell: 'bg-surface-accent/30 group-hover:bg-surface-accent', fontMono: true, align: 'center', renderCell: (p) => <span className="font-mono font-medium text-body text-[14px]">{p.mpg}</span> },
  { id: 'aer',   group: 'GAME STATS', label: 'Aer',   fontMono: true, borderRight: true, align: 'center', renderCell: (p) => <span className="font-mono font-bold text-strong text-[14px]">{p.potMins}</span> },
  { id: 'match_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center gap-1"><Video size={10} /><span>Match</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (<div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}><span className="bg-brand-primary/20 text-body font-body font-bold px-2 py-0.5 rounded text-[12px]">F{p.matchVideos}</span></div>) },
  { id: 'high_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center gap-1"><Video size={10} /><span>High</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (<div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(`/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, dob: p.dob, nationality: p.nationality, primaryPos: p.pos, currentTeam: p.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })}><span className="bg-brand-primary/10 text-body font-body font-bold px-2 py-0.5 rounded text-[12px]">H{p.highlightVideos}</span></div>) },
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
      dotColor: random() > 0.6 ? 'bg-status-success' : random() > 0.3 ? 'bg-text-body/40' : 'bg-status-warning',
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
      // Filter fields — derived from the index, not random(), so the seeded values above stay the same
      foot: (['Right','Left','Right','Both','Right','Left'] as const)[i%6],
      height: 165 + (i*37)%30,
      profile: (['Wonderkid','Prospect','Performance','Journeyman'] as const)[(i*3)%4],
      scouted: (i*5)%7 < 4,
      archived: i%11 === 5,
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
      className="bg-surface-card rounded-[12px] overflow-hidden min-w-[160px] border border-default">
      {restItems.map((item, i) => {
        const fullIdx = items.indexOf(item);
        return (
          <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedIdx(fullIdx); setOpenId(null); }}
            className={`w-full text-left px-3 py-2 font-body text-[12px] font-bold flex items-center gap-2 transition-colors
              ${item.danger ? 'text-status-error hover:bg-status-error/15' : 'text-strong hover:bg-surface-accent'}`}>
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
            ? 'bg-status-error/10 text-status-error hover:bg-status-error hover:text-on-brand border-status-error/20'
            : 'bg-surface-accent text-strong hover:bg-brand-primary/80 hover:text-inverse border-default'
        }`}>
        {primaryItem.icon}
      </button>
      {restItems.length > 0 && (
        <>
          <button ref={chevronRef} onClick={handleChevron}
            className="w-5 h-7 rounded-r-lg bg-surface-accent border border-default text-strong hover:bg-brand-primary/80 hover:text-inverse flex items-center justify-center transition-all">
            <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {portal}
        </>
      )}
    </div>
  );
};

const CARD = 'bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] overflow-hidden';

// ─── Country/Head Players page ──────────────────────────────────────────────────
type CountryTab = 'players-in-scope'|'top-10'|'reserve-list'|'combined-top-10';
const COUNTRY_TABS: { id: CountryTab; label: string }[] = [
  { id: 'players-in-scope', label: 'Players in Scope' },
  { id: 'top-10',           label: 'Top 10' },
  { id: 'reserve-list',     label: 'Reserve List' },
  { id: 'combined-top-10',  label: 'Combined Top 10' },
];
const TAB_SUBTITLE: Record<CountryTab, string> = {
  'players-in-scope': 'All players within your active scouting scope.',
  'top-10':           'Your current top ten performance and prospect selections.',
  'reserve-list':     'Players held in reserve for future consideration.',
  'combined-top-10':  'Track regional scout submissions and pipeline status.',
};
const POS_GROUPS = ['Strikers','Wingers','Midfielders','Full Backs','Centre Backs'];
// Stats filter sorts high → low by the column the table shows under that name
const STAT_SORT: Record<string, keyof ReturnType<typeof generatePlayers>[number]> = {
  Goals: 'starts', Assists: 'goals', Mins: 'app', xG: 'ass', xA: 'pens', Shots: 'gcMins', SOT: 'm90',
  'Pass%': 'g90', Tackles: 'a90', Interceptions: 'gc90', Clearances: 'mpg',
};
// Table header cells — same classes as the Lead/Senior tables (SeniorLeadPlayersPage)
const GROUP_TH = 'font-heading font-bold text-[10px] uppercase tracking-widest text-on-brand text-center border-b border-text-on-brand/15';
const GROUP_DIVIDER = 'border-l border-l-text-on-brand/15';
const SUB_TH = 'font-heading font-bold text-[12px] text-muted uppercase tracking-widest';

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

  const [activeTab, setActiveTab] = useState<CountryTab>('players-in-scope');
  // Deep-link: dashboard KPI cards open /players?tab=<tab id>
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && COUNTRY_TABS.some(t => t.id === tab)) setActiveTab(tab as CountryTab);
  }, [location.search]);
  // Opens on cards at every width (Vanessa, 28 Oct); the Table/Card toggle switches to the table.
  const [viewMode, setViewMode] = useState<'table'|'card'>('card');
  const [collapsedPositions, setCollapsedPositions] = useState<Record<string, boolean>>({});
  const togglePosition = (pos: string) => setCollapsedPositions(prev => ({ ...prev, [pos]: !prev[pos] }));
  // Filters — same light, label-above toolbar as the Lead/Senior tables
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [showFilter, setShowFilter] = useState<string>('All');
  const [statFilter, setStatFilter] = useState<string>('All');
  const [footFilter, setFootFilter] = useState('All');
  const [profileFilter, setProfileFilter] = useState('All');
  const [scoutFilter, setScoutFilter] = useState('All');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [htMin, setHtMin] = useState('');
  const [htMax, setHtMax] = useState('');
  const [search, setSearch] = useState('');
  const [listView, setListView] = useState<'active'|'audit'>('active');
  const [filterOpenKey, setFilterOpenKey] = useState<string | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest?.('[data-filter-root]')) setFilterOpenKey(null); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [tabsMenuOpen, setTabsMenuOpen] = useState(false);
  const isListTab = activeTab !== 'combined-top-10';
  const { focused, onScroll: onCardScroll } = useFocusMode([activeTab, viewMode]);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
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
    let list = ids.map(id=>playerMap.get(id)).filter(Boolean) as typeof allPlayersData;
    list = list.filter(p=>listView==='audit' ? p.archived : !p.archived);
    if (positionFilter!=='All') list = list.filter(p=>p.pos===positionFilter);
    if (footFilter!=='All') list = list.filter(p=>p.foot===footFilter);
    if (profileFilter!=='All') list = list.filter(p=>p.profile===profileFilter);
    if (scoutFilter!=='All') list = list.filter(p=>scoutFilter==='Scouted' ? p.scouted : !p.scouted);
    if (htMin) list = list.filter(p=>p.height>=parseInt(htMin));
    if (htMax) list = list.filter(p=>p.height<=parseInt(htMax));
    if (ageMin) list = list.filter(p=>p.age>=parseInt(ageMin));
    if (ageMax) list = list.filter(p=>p.age<=parseInt(ageMax));
    if (showFilter==='Raised') list = list.filter(p=>raisedPlayerIds.has(p.id));
    else if (showFilter==='Can add') list = list.filter(p=>!raisedPlayerIds.has(p.id));
    if (search.trim()) list = list.filter(p=>p.name.toLowerCase().includes(search.trim().toLowerCase()));
    const statKey = STAT_SORT[statFilter];
    if (statKey) list = [...list].sort((a,b)=>parseFloat(String(b[statKey]))-parseFloat(String(a[statKey])));
    return list;
  }, [activeTab, scopePlayerIds, top10PlayerIds, reservePlayerIds, listView, positionFilter, footFilter, profileFilter, scoutFilter, htMin, htMax, ageMin, ageMax, showFilter, statFilter, raisedPlayerIds, search, allPlayersData]);
  const showTop = useShowBackToTop(scrollBoxRef, currentPlayersData.length);
  const tabCounts: Record<CountryTab, number | null> = {
    'players-in-scope': scopePlayerIds.length, 'top-10': top10PlayerIds.length,
    'reserve-list': reservePlayerIds.length, 'combined-top-10': null,
  };

  // Row actions per tab — shown inline as one icon pill (ActionButtons), like the Lead/Senior tables
  const rowActions = (id: string, name: string): ActionItem[] =>
    activeTab==='players-in-scope' ? [
      { label: 'Add to Top 10', action: () => handleScopeToTop10(id), icon: <Star size={12} /> },
      { label: 'Add to Reserve', action: () => handleScopeToReserve(id), icon: <Bookmark size={12} /> },
      { label: 'Raise to Pipeline', action: () => handleRaise(id, name), icon: <ArrowUpRight size={12} /> },
    ] : activeTab==='top-10' ? [
      { label: 'Raise to Pipeline', action: () => handleRaise(id, name), icon: <ArrowUpRight size={12} /> },
      { label: 'Move to Reserve', action: () => handleTop10ToReserve(id), icon: <Bookmark size={12} /> },
      { label: 'Remove', action: () => handleTop10ToScope(id), icon: <Trash2 size={12} />, danger: true },
    ] : activeTab==='reserve-list' ? [
      { label: 'Move to Top 10', action: () => handleReserveToTop10(id), icon: <Star size={12} /> },
      { label: 'Remove', action: () => handleReserveToScope(id), icon: <Trash2 size={12} />, danger: true },
    ] : [];
  // Frozen Actions column: pill width (24px per icon + dividers + border) + cell padding
  const actW = activeTab==='reserve-list' ? 64 : 88;

  // Filter toolbar — rendered inline on desktop and inside the mobile bottom-sheet
  const renderFilterToolbar = () => (
    <div data-filter-root className="flex items-end gap-4 flex-wrap w-full">
      <SegmentedToggle<'active'|'audit'> value={listView} onChange={setListView}
        options={[{ value: 'active', label: 'Active' }, { value: 'audit', label: 'Archive' }]} />
      <LLSelect label="Foot" value={footFilter} setValue={setFootFilter} options={['Right','Left','Both']} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <RangePair label="Age" minV={ageMin} setMin={setAgeMin} maxV={ageMax} setMax={setAgeMax} />
      <RangePair label="Height" minV={htMin} setMin={setHtMin} maxV={htMax} setMax={setHtMax} />
      <LLSelect label="Position" value={positionFilter} setValue={setPositionFilter} options={POS_GROUPS} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <LLSelect label="Profile" value={profileFilter} setValue={setProfileFilter} options={['Wonderkid','Prospect','Performance','Journeyman']} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <LLSelect label="Scout" value={scoutFilter} setValue={setScoutFilter} options={['Scouted','Unscouted']} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <LLSelect label="Show" value={showFilter} setValue={setShowFilter} options={['Raised','Can add']} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <LLSelect label="Stats" value={statFilter} setValue={setStatFilter} options={Object.keys(STAT_SORT)} openKey={filterOpenKey} setOpenKey={setFilterOpenKey} />
      <div className="ml-auto shrink-0"><PlayerSearchBox value={search} onChange={setSearch} /></div>
    </div>
  );

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
  const totalCols = columns.length + 1 + extraCols.length;

  return (
    <div className="flex min-h-screen bg-surface-page font-body text-strong">
      <style dangerouslySetInnerHTML={{__html:`
        ::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--blue-100);border-radius:4px;border:2px solid #d2e7fa;}
        ::-webkit-scrollbar-thumb:hover{background:var(--blue-200);}.hide-scrollbar::-webkit-scrollbar{display:none;}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
      `}} />

      <Sidebar actions={[
        { label: 'This Week', icon: Calendar, onClick: () => setIsTaskModalOpen(true) },
      ]} />

      <main className="flex-1 flex flex-col relative w-full min-w-0 items-center">
        <div className="w-full flex flex-col h-full max-w-none">

          {/* Top Navigation */}
          <TopNav
            responsive
            profile={{
              name: 'Vanessa Kalondu', role: loggedInRole,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80',
              ...(loggedInRole === 'Senior Scout' ? { viewSwitch: { options: ['Senior Scout', 'Head Scout'], value: userRoleState, onChange: handleSeniorViewSwitch } } : {}),
            }}
            unreadCount={raiseNotifications.length}
            notifOpen={showNotifPanel}
            onNotifToggle={()=>setShowNotifPanel(p=>!p)}
            notifPanel={(
              <div className="absolute right-0 mt-3 w-80 bg-surface-card rounded-[20px] shadow-2xl border border-default z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-default flex items-center justify-between bg-brand-primary">
                  <span className="font-heading font-black text-[14px] text-on-brand">Raised to Long List</span>
                  <button onClick={()=>setShowNotifPanel(false)} className="text-on-brand/60 hover:text-on-brand"><X size={16} /></button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {raiseNotifications.length===0
                    ? <div className="px-5 py-8 text-center font-body text-body text-[14px] font-medium">No raised players yet</div>
                    : raiseNotifications.map((n,i)=>(
                      <div key={i} className="px-5 py-3 border-b border-default last:border-0 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0"><ArrowUpRight size={14} className="text-strong" /></div>
                        <div><div className="font-body font-bold text-[14px] text-body">{n.name}</div><div className="font-body text-[12px] text-muted font-medium">Raised to Long List</div></div>
                      </div>
                    ))}
                </div>
                {raiseNotifications.length>0 && (
                  <div className="px-5 py-3 border-t border-default">
                    <button onClick={()=>{setRaiseNotifications([]);sessionStorage.removeItem('qazaRaiseNotifs');setShowNotifPanel(false);}} className="font-body text-[12px] font-bold text-status-error hover:text-status-error/80 transition-colors">Clear all</button>
                  </div>
                )}
              </div>
            )}
            onThisWeek={()=>setIsTaskModalOpen(true)}
            onAddPlayer={()=>setIsAddPlayerModalOpen(true)}
          />

          {/* Content */}
          <div className="flex-1 px-[var(--pad-page)] pb-20 md:pb-12">

            {/* DASHBOARD — same shell, KPI and card patterns as the Lead / Video dashboards */}
            {activePage==='dashboard' && (
              <>
                <div className="pt-6 mb-3">
                  <h1 className="font-heading font-semibold type-h3 tracking-tight text-heading flex items-center gap-4 leading-none">
                    Welcome
                    <span className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-sm shrink-0">
                      <Sun size={26} className="text-on-brand" />
                    </span>
                    Oluniyi
                  </h1>
                  <p className="font-body font-medium text-[15px] text-body mt-2 short:hidden">{funSubtitle}</p>
                </div>

                <ResponsiveTabs className="mt-4 mb-6" activeId={dashTab} onSelect={setDashTab}
                  tabs={['Overview','Active Players','Pending Reports','Analytics','Reports'].map(t=>({id:t,label:t}))} />

                <div className="flex flex-col gap-6 pb-8">
                  {/* KPI cards — shared KpiCard (P-CO4) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {userRoleState==='Head Scout' ? (
                      <>
                        <KpiCard icon={ClipboardCheck} heading="Shortlists" value={<>6<span className="text-body">/10</span></>}
                          descriptor="submitted for review" action="Review" onClick={()=>navigate('/players?tab=review')} />
                        <KpiCard icon={FileText} heading="Reports ready" value={<>18<span className="text-body">/26</span></>}
                          descriptor="ready for review" action="Review" onClick={()=>navigate('/players?tab=review')} />
                        <KpiCard icon={TrendingUp} heading="Top Ten" value={10}
                          descriptor="pending prospects" action="Open Top 10" onClick={()=>navigate('/players?tab=combined-top-10')} />
                        <KpiCard icon={Crown} heading="Grade A raised" value="37%"
                          descriptor="+8% raised" action="View Grade A" onClick={()=>navigate('/players?tab=target&filter=Grade+A+players')} />
                      </>
                    ) : (
                      <>
                        <KpiCard icon={Video} heading="Missing Videos" value={<>29<span className="text-body">/35</span></>}
                          descriptor="players · 82%" action="View Players" onClick={()=>navigate('/players?tab=players-in-scope&filter=Missing+Video')} />
                        <KpiCard icon={Calendar} heading="Missing Match Data" value={<>18<span className="text-body">/26</span></>}
                          descriptor="matches · 68%" action="Open Matches" onClick={()=>navigate('/matches?filter=Incomplete+Match+Data')} />
                        <KpiCard icon={FileText} heading="Ready Reports" value={14}
                          descriptor="for review" action="Review" onClick={()=>navigate('/players?tab=combined-top-10')} />
                        <KpiCard icon={Crown} heading="Grade A" value="46%"
                          descriptor="down of players" action="View Grade A" onClick={()=>navigate('/players?tab=target&filter=Grade+A+players')} />
                      </>
                    )}
                  </div>

                  {/* Below KPIs — leaderboard (wide) + stacked cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 portrait-tablet:grid-cols-1 gap-6 lg:items-stretch">
                    <div className={`${CARD} lg:col-span-2 portrait-tablet:col-span-full flex flex-col`}>
                      <div className="px-5 py-4 border-b border-default flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-brand-primary/10 flex items-center justify-center shrink-0"><Users size={16} className="text-strong" /></div>
                        <div className="min-w-0 flex-1"><h3 className="font-heading font-bold text-[16px] text-heading">Scout Leaderboard</h3><p className="font-body text-[12px] text-body font-medium">Total grade A players by scout</p></div>
                        <span className="font-body font-bold text-[12px] px-3 py-1 rounded-full bg-surface-accent text-strong shrink-0">Ghana 🇬🇭</span>
                      </div>
                      <div className="divide-y divide-border-default">
                        {[{name:'Kwame Asante',init:'KA',val:'38 players',country:'Ghana 🇬🇭'},{name:'Chidi Obinna',init:'CO',val:'24 players',country:'Nigeria 🇳🇬'},{name:'Wekesa Omondi',init:'WO',val:'18 players',country:'Kenya 🇰🇪'},{name:'Emeka Okafor',init:'EO',val:'14 players',country:'Nigeria 🇳🇬'},{name:'Joseph Njoroge',init:'JN',val:'11 players',country:'Kenya 🇰🇪'},{name:'Amani Mushi',init:'AM',val:'8 players',country:'Tanzania 🇹🇿'}].map(scout=>(
                          <div key={scout.name} className="px-5 py-3 flex items-center gap-3 hover:bg-surface-accent transition-colors cursor-pointer">
                            <span className="w-8 h-8 rounded-xl bg-brand-primary/10 text-link flex items-center justify-center font-body font-bold text-[12px] shrink-0">{scout.init}</span>
                            <div className="flex-1 min-w-0">
                              <span className="font-body font-bold text-[14px] text-body truncate block">{scout.name}</span>
                              <p className="sm:hidden font-body text-[12px] text-body tabular-nums mt-0.5">{scout.val}</p>
                            </div>
                            <span className="hidden sm:block font-body text-[13px] font-medium text-body tabular-nums shrink-0 w-24">{scout.val}</span>
                            <span className="font-body font-bold text-[13px] text-strong shrink-0 w-24 sm:w-28 text-right">{scout.country}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="portrait-tablet:col-span-full flex flex-col gap-6 min-w-0">
                      <div className={`${CARD} flex flex-col`}>
                        <div className="px-5 py-4 border-b border-default flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-brand-primary/10 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-strong" /></div>
                          <div className="min-w-0"><h3 className="font-heading font-bold text-[16px] text-heading">Top Prospect</h3><p className="font-body text-[12px] text-body font-medium">Based on scout rating</p></div>
                        </div>
                        <div className="px-5 py-4 font-heading font-bold type-h5 tracking-tight text-heading">Kofi Mensah</div>
                      </div>

                      <div className={`${CARD} flex flex-col`}>
                        <div className="px-5 py-4 border-b border-default flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[12px] bg-brand-primary/10 flex items-center justify-center shrink-0"><Calendar size={16} className="text-strong" /></div>
                          <div className="min-w-0 flex-1"><h3 className="font-heading font-bold text-[16px] text-heading">Upcoming Matches</h3><p className="font-body text-[12px] text-body font-medium">Capture opportunities</p></div>
                          <button onClick={()=>navigate('/matches')} className="font-body font-bold text-[12px] text-link hover:underline shrink-0">View Matches</button>
                        </div>
                        <div className="divide-y divide-border-default">
                          {[{m:'Gor Mahia vs Kariobangi',d:'Dec 15'},{m:'Enyimba FC vs Kano Pillars',d:'Dec 16'}].map(x=>(
                            <button key={x.m} onClick={()=>navigate('/matches')} className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-surface-accent transition-colors">
                              <div className="min-w-0 flex-1"><div className="font-body font-bold text-[14px] text-body truncate">{x.m}</div><p className="font-body text-[12px] text-body mt-0.5">{x.d}</p></div>
                              <ArrowRight size={14} className="text-body shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SENIOR/LEAD PLAYERS */}
            {activePage==='players' && isSeniorOrLead && (
              <div className="flex flex-col w-full min-w-0">
                <SeniorLeadPlayersPage allPlayersData={allPlayersData} loggedInRole={loggedInRole} flagMap={flagMap} />
              </div>
            )}

            {/* COUNTRY/HEAD PLAYERS — same page shell, card, toolbar and table kit as Lead/Senior (PlayersTableKit) */}
            {activePage==='players' && !isSeniorOrLead && (
              <div className="flex flex-col w-full min-w-0">
                <EditColumnsModal open={colsModalOpen} columns={PLAYER_COLUMNS} visible={visibleColIds} onApply={setVisibleColIds} onClose={() => setColsModalOpen(false)} />

                <PlayersPageTitle first="NXUS" icon={<Users size={28} className="text-on-brand" />} rest="Players"
                  subtitle={TAB_SUBTITLE[activeTab]} folded={focused && isListTab} />

                <PlayersCard bounded={isListTab} focused={focused} onScrollCapture={onCardScroll}>
                  <PlayersCardHeader>
                    {/* Tabs — desktop: all inline */}
                    <div className="hidden md:flex items-center gap-1 flex-wrap">
                      {COUNTRY_TABS.map(tab => (
                        <TabPill key={tab.id} active={activeTab===tab.id} count={tabCounts[tab.id]} onClick={()=>handleTabChange(tab.id)}>
                          {tab.label}
                        </TabPill>
                      ))}
                    </div>
                    {/* Tabs — mobile: active label + dropdown */}
                    <MobileTabMenu label={tabLabel[activeTab]} open={tabsMenuOpen} onToggle={()=>setTabsMenuOpen(o=>!o)}>
                      {COUNTRY_TABS.map(tab => {
                        const count = tabCounts[tab.id];
                        const isActive = activeTab===tab.id;
                        return (
                          <div key={tab.id} className="flex items-center gap-1 px-2">
                            <button onClick={()=>{handleTabChange(tab.id);setTabsMenuOpen(false);}}
                              className={`flex-1 flex items-center justify-between gap-2 px-2 py-2 rounded-lg font-body font-bold type-body-sm ${isActive?'text-link bg-brand-primary/10':'text-body hover:bg-surface-accent'}`}>
                              {tab.label}
                              {count!=null && count>0 && <span className="font-body type-micro font-black px-2 py-0.5 rounded-full bg-brand-primary/15 text-body">{count}</span>}
                            </button>
                          </div>
                        );
                      })}
                    </MobileTabMenu>
                    <div className="flex-1" />
                    {isListTab && (
                      <>
                        <ViewModeToggle value={viewMode} onChange={setViewMode} />
                        <FiltersButton active={showFilters} onClick={()=>setShowFilters(s=>!s)} />
                        <MobileFiltersButton onClick={()=>setMobileFiltersOpen(true)} />
                        <ColumnsButton onClick={()=>setColsModalOpen(true)} />
                      </>
                    )}
                  </PlayersCardHeader>

                  {/* Desktop: inline filter toolbar, toggled by the Filters button (visible by default) */}
                  {isListTab && showFilters && (
                    <PlayersCardZone className="hidden md:block">{renderFilterToolbar()}</PlayersCardZone>
                  )}
                  {/* Mobile: the same filters in a bottom-sheet */}
                  <MobileFilterSheet open={isListTab && mobileFiltersOpen} onClose={()=>setMobileFiltersOpen(false)}>
                    {renderFilterToolbar()}
                  </MobileFilterSheet>

                  {/* Top 10 submit counter */}
                  {activeTab==='top-10' && (
                    <PlayersCardZone>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted">Performance</span>
                            <span className="font-heading font-semibold text-[16px] text-strong leading-none">{perfCount}/10</span>
                          </div>
                          <div className="w-px h-8 bg-surface-canvas" />
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted">Prospects</span>
                            <span className="font-heading font-semibold text-[16px] text-strong leading-none">{prospectCount}/10</span>
                          </div>
                        </div>
                        <button className="ml-auto bg-brand-primary text-on-brand px-6 py-2 rounded-full font-body font-black text-[14px] hover:bg-brand-primary/80 transition-colors shadow-sm"
                          onClick={()=>{if(perfCount<10)setPerfCount(p=>p+1);else if(prospectCount<10)setProspectCount(p=>p+1);}}>
                          Submit Shortlist
                        </button>
                      </div>
                    </PlayersCardZone>
                  )}

                  {/* Reserve List info bar */}
                  {activeTab==='reserve-list' && (
                    <PlayersCardZone className="bg-surface-accent">
                      <p className="font-body text-[14px] text-body font-semibold">Players in Reserve can be promoted to Top 10 or returned to Players in Scope.</p>
                    </PlayersCardZone>
                  )}

                  {/* COMBINED TOP 10 */}
                  {activeTab==='combined-top-10' && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 portrait-tablet:grid-cols-1 gap-8 h-full min-h-[500px]">
                        <div className="bg-surface-card border border-default rounded-[20px] p-8 shadow-[var(--shadow-lg)] flex flex-col h-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[16px] bg-brand-primary/10 flex items-center justify-center text-strong"><ShieldCheck size={24} strokeWidth={2.5} /></div>
                              <div><h3 className="font-heading font-bold text-[24px] text-heading">Submitted</h3><p className="font-body font-bold text-[14px] text-body">Action Required: None</p></div>
                            </div>
                            <div className="font-heading font-black text-[44px] tracking-tight text-strong">12</div>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                            {[{name:'Kofi Mensah',role:'Country Scout',region:'Ghana',date:'Today, 10:45 AM'},{name:'Ngozi Eze',role:'Country Scout',region:'Nigeria',date:'Yesterday, 4:20 PM'},{name:'Pape Sarr',role:'Country Scout',region:'Senegal',date:'Yesterday, 1:15 PM'},{name:'Emeka Okafor',role:'Country Scout',region:'Nigeria',date:'Monday, 9:00 AM'}].map((scout,i)=>(
                              <div key={i} className="bg-surface-card border border-default rounded-[12px] p-5 flex items-center justify-between hover:bg-surface-accent transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-surface-card shadow-sm border border-default flex items-center justify-center font-body font-bold text-[12px] text-body">{scout.name.split(' ').map(n=>n[0]).join('')}</div>
                                  <div><div className="font-body font-bold text-[14px] text-body">{scout.name}</div><div className="font-body text-[12px] font-medium text-muted">{scout.region} • {scout.role}</div></div>
                                </div>
                                <div className="text-right">
                                  <div className="text-muted bg-brand-primary/10 px-3 py-1 rounded-full font-body text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">Complete</div>
                                  <div className="font-body text-[12px] font-medium text-muted block">{scout.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-surface-card border border-default rounded-[20px] p-8 shadow-[var(--shadow-lg)] flex flex-col h-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-2 h-full bg-status-error" />
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-[16px] bg-status-error/10 flex items-center justify-center text-status-error"><TrendingUp size={24} strokeWidth={2.5} /></div>
                              <div><h3 className="font-heading font-bold text-[24px] text-heading">Not Submitted</h3><p className="font-body font-bold text-[14px] text-status-error">Action Required: Follow up</p></div>
                            </div>
                            <div className="font-heading font-black text-[44px] tracking-tight text-status-error">4</div>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                            {[{name:'Fatou Mensah',role:'Country Scout',region:'Ghana',status:'7/10 Profiles'},{name:'Aliou Cisse',role:'Country Scout',region:'Senegal',status:'2/10 Profiles'},{name:'Kwame Asante',role:'Head Scout',region:'Ghana',status:'Reviewing'},{name:'Moussa Sow',role:'Head Scout',region:'Senegal',status:'Reviewing'}].map((scout,i)=>(
                              <div key={i} className="bg-status-error/5 border border-status-error/10 rounded-[12px] p-5 flex items-center justify-between hover:bg-status-error/10 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-surface-card shadow-sm border border-default flex items-center justify-center font-body font-bold text-[12px] text-body">{scout.name.split(' ').map(n=>n[0]).join('')}</div>
                                  <div><div className="font-body font-bold text-[14px] text-body">{scout.name}</div><div className="font-body text-[12px] font-medium text-muted">{scout.region} • {scout.role}</div></div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="font-body font-bold text-[14px] text-status-error">{scout.status}</div>
                                  <button className="font-body text-[10px] font-black tracking-wider uppercase text-status-error bg-status-error/20 px-3 py-1 rounded-md hover:bg-status-error/30 transition-colors">Nudge</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TABLE VIEW — compact `rtable`, bounded inner scroll, sticky thead + frozen Actions/Player columns */}
                  {isListTab && viewMode==='table' && (
                    <div className="w-full flex-1 min-h-0 flex flex-col relative">
                      {renderContextMenu()}
                      {currentPlayersData.length===0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-10 h-10 rounded-full bg-surface-accent flex items-center justify-center mb-3"><Users size={16} className="text-body" /></div>
                          <div className="font-heading font-semibold text-[16px] text-strong mt-4">No players here</div>
                          <p className="font-body text-[12px] text-body font-medium max-w-xs">
                            {activeTab==='top-10'&&'Move players from Players in Scope using the Top Ten button.'}
                            {activeTab==='reserve-list'&&'Move players from Players in Scope or Top 10 using the Reserve button.'}
                            {activeTab==='players-in-scope'&&'No players match the current filters.'}
                          </p>
                        </div>
                      ) : (
                        <div ref={scrollBoxRef} className="overflow-auto w-full flex-1 min-h-0 hide-scrollbar rounded-b-[24px]">
                          <table className="rtable w-full text-left whitespace-nowrap border-separate border-spacing-0">
                            <thead className="sticky top-0 z-30">
                              {/* Group header row — blue band, group names */}
                              <tr className="bg-brand-primary">
                                {groupHeaders.map((grp,idx)=>(
                                  <th key={idx} colSpan={grp.count}
                                    className={`${GROUP_TH} ${idx===0?'sticky left-0 z-40 bg-brand-primary':GROUP_DIVIDER}`}>
                                    {grp.group}
                                  </th>
                                ))}
                                {extraCols.length>0 && (
                                  <th colSpan={extraCols.length} className={`${GROUP_TH} ${GROUP_DIVIDER}`}>Custom</th>
                                )}
                              </tr>
                              {/* Column sub-header row — light, muted labels; right-click a label to rename/insert/remove */}
                              <tr className="bg-surface-card border-b-2 border-default">
                                <th className={`${SUB_TH} sticky left-0 z-40 bg-surface-card text-center`} style={{ width: actW, minWidth: actW }}></th>
                                {columns.map((col,idx)=>(
                                  <th key={col.id} style={col.isSticky ? { left: actW } : undefined}
                                    className={`${SUB_TH} ${col.isSticky?'sticky z-40':''} ${col.width||''} ${col.minWidth||''} ${col.borderRight?'border-r-2 border-default':''} ${col.bgHeader||'bg-surface-card'} ${col.align==='center'?'text-center':'text-left'} cursor-context-menu`}
                                    onContextMenu={e=>handleContextMenu(e,idx,col.group)}>
                                    {editingColumn?.index===idx
                                      ? <input autoFocus type="text" defaultValue={editingColumn.label} onBlur={e=>finishEditColumn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&finishEditColumn(e.currentTarget.value)} className="bg-surface-accent px-2 py-1 rounded text-strong font-bold text-[12px] outline-none w-full" />
                                      : col.label}
                                  </th>
                                ))}
                                {extraCols.map(c=>(
                                  <th key={c.id} className={`${SUB_TH} text-center w-[64px]`}>{c.label}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {POS_GROUPS.map(posGroup=>{
                                const posPlayers = currentPlayersData.filter(p=>p.pos===posGroup);
                                if (!posPlayers.length) return null;
                                const collapsed = !!collapsedPositions[posGroup];
                                const yobs = Array.from(new Set(posPlayers.map(p=>2026-p.age))).sort((a,b)=>b-a);
                                return (
                                  <Fragment key={posGroup}>
                                    <PosHeader pos={posGroup} count={posPlayers.length} colSpan={totalCols} collapsed={collapsed} onToggle={()=>togglePosition(posGroup)} />
                                    {!collapsed && yobs.map(yob=>(
                                      <Fragment key={yob}>
                                        <YobHeader yob={yob} colSpan={totalCols} />
                                        {posPlayers.filter(p=>2026-p.age===yob).map((player,rowIndex)=>{
                                          const isRaised = raisedPlayerIds.has(player.id);
                                          return (
                                            <tr key={player.id} id={`row-${player.id}`} className={`group transition-colors hover:bg-surface-accent ${isRaised?'bg-brand-primary/5':''}`}>
                                              <td className="sticky left-0 z-20 bg-surface-card group-hover:bg-surface-accent text-center" style={{ width: actW, minWidth: actW }}>
                                                {isRaised&&activeTab==='players-in-scope'&&<div className="absolute left-0 top-0 h-full w-1 bg-brand-primary" />}
                                                <ActionButtons items={rowActions(player.id, player.name)} />
                                              </td>
                                              {columns.map(col=>{
                                                const customVal = customData?.[player.id]?.[col.id]||'';
                                                return (
                                                  <td key={col.id} style={col.isSticky ? { left: actW } : undefined}
                                                    className={`${col.isSticky?'sticky z-20 bg-surface-card group-hover:bg-surface-accent':''} ${col.borderRight?'border-r-2 border-default':''} ${col.bgCell||''} ${col.align==='center'?'text-center':''}`}>
                                                    {col.renderCell?col.renderCell(player,rowIndex,customVal,(val:string)=>handleCellChange(player.id,col.id,val)):(player as any)[col.id]}
                                                  </td>
                                                );
                                              })}
                                              {extraCols.map(c=>(
                                                <td key={c.id} className="text-center w-[64px]">
                                                  <span className={`text-[12px] font-medium text-muted whitespace-nowrap ${c.mono?'font-mono':'font-body'}`}>{c.value(player,rowIndex)}</span>
                                                </td>
                                              ))}
                                            </tr>
                                          );
                                        })}
                                      </Fragment>
                                    ))}
                                  </Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <BackToTopButton show={showTop} onClick={()=>scrollBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} />
                    </div>
                  )}

                  {/* CARD VIEW */}
                  {isListTab && viewMode==='card' && (
                    <div className="w-full flex-1 min-h-0 overflow-auto hide-scrollbar px-4 pb-4">
                      {currentPlayersData.length===0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-10 h-10 rounded-full bg-surface-accent flex items-center justify-center mb-3"><Users size={16} className="text-body" /></div>
                          <div className="font-heading font-semibold text-[16px] text-strong mt-4">No players here</div>
                          <p className="font-body text-[12px] text-body font-medium">Move players from Players in Scope to see them here.</p>
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
                            <div className="sticky top-0 z-20 bg-surface-card py-6">
                              <div className="flex items-center w-full">
                                <div className="flex-1 h-px bg-border-default" />
                                <div className="px-6 py-2 rounded-full border border-default bg-surface-card shadow-sm">
                                  <span className="font-heading font-black text-[12px] uppercase tracking-[0.2em] text-link">
                                    {posGroup}
                                  </span>
                                </div>
                                <div className="flex-1 h-px bg-border-default" />
                              </div>
                            </div>

                            <div className="flex flex-col gap-8">
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
                                        <ChevronDown size={16} className={`text-[var(--blue-950)] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                        <span className="font-heading font-bold text-[14px] text-[var(--blue-950)]">
                                          {yob}
                                        </span>
                                      </button>
                                      <div className="h-px bg-border-default/40 w-full" />
                                    </div>

                                    {!isCollapsed && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-fade-in">
                                        {yobPlayers.map(player => {
                                          const natCode = flagMap[player.nationality] || "un";
                                          const isRaised = raisedPlayerIds.has(player.id);
                                          
                                          return (
                                            <div key={player.id} className={`bg-[var(--light-50)] relative rounded-[32px] overflow-hidden border border-default shadow-[0px_8px_30px_0px_rgba(6,27,46,0.08)] transition-all hover:shadow-xl group w-full max-w-[380px] ${isRaised ? 'border-brand-primary/40' : ''}`}>
                                              {isRaised && <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary z-10" />}
                                              <div className="p-[24.8px] flex flex-col gap-[16px]">
                                                {/* Top Row */}
                                                <div className="flex items-start justify-between">
                                                  <div className="flex items-center gap-[12px]">
                                                    {/* Avatar */}
                                                    <div className="bg-surface-input drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center size-[56px] rounded-full shrink-0 border border-default relative">
                                                      <p className="font-heading font-bold text-[var(--blue-950)] text-[14px]">{player.initials}</p>
                                                    </div>
                                                    {/* Name and Tags */}
                                                    <div className="flex flex-col gap-[6px]">
                                                      <h3 onClick={() => navigate(`/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, dob: player.dob, nationality: player.nationality, primaryPos: player.pos, currentTeam: player.cTeam }, trail: [{ label: 'Players', path: window.location.pathname }] } })} className="font-heading font-bold text-[var(--blue-950)] text-[16px] hover:underline cursor-pointer truncate max-w-[140px] leading-tight">{player.name}</h3>
                                                      <div className="flex gap-[6px]">
                                                        <div className="bg-[var(--blue-50)] px-[8px] py-[2px] rounded-[4px]">
                                                          <p className="font-heading font-bold text-[var(--navy-400)] text-[12px] whitespace-nowrap">{player.age}</p>
                                                        </div>
                                                        <div className="bg-[var(--blue-50)] px-[8px] py-[2px] rounded-[4px]">
                                                          <p className="font-heading font-bold text-[var(--navy-400)] text-[12px] whitespace-nowrap">F{player.matchVideos + player.highlightVideos}</p>
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
                                                  <div className="absolute left-0 top-0 bg-[var(--light-50)] border border-default rounded-[16px] p-[12.8px] w-[138.2px] h-[65.6px] flex flex-col items-start">
                                                    <p className="font-heading font-bold text-[var(--navy-400)] text-[10px] tracking-[0.5px] uppercase mb-[4px]">Team</p>
                                                    <p className="font-heading font-bold text-[var(--blue-950)] text-[14px] truncate leading-tight w-full">{player.pTeam}</p>
                                                  </div>
                                                  {/* Flag */}
                                                  <div className="absolute left-[97.2px] top-[31px] size-[20px] rounded-full pointer-events-none z-10 overflow-hidden border border-default">
                                                    <img src={`https://flagcdn.com/w40/${natCode}.png`} alt={player.nationality} className="absolute inset-0 size-full object-cover" />
                                                  </div>
                                                  {/* Stats */}
                                                  <div className="absolute left-[149.2px] top-[12.2px] flex items-start gap-[20px]">
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[var(--navy-400)] text-[10px] tracking-[0.5px] uppercase mb-[2px]">APP</p>
                                                      <p className="font-mono font-bold text-[var(--blue-950)] text-[16px] leading-[24px]">{player.app}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[var(--navy-400)] text-[10px] tracking-[0.5px] uppercase mb-[2px]">G</p>
                                                      <p className="font-mono font-bold text-[var(--blue-950)] text-[16px] leading-[24px]">{player.goals}</p>
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <p className="font-heading font-bold text-[var(--navy-400)] text-[10px] tracking-[0.5px] uppercase mb-[2px]">A</p>
                                                      <p className="font-mono font-bold text-[var(--blue-950)] text-[16px] leading-[24px]">{player.ass}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                      <p className="font-heading font-bold text-[var(--navy-400)] text-[10px] tracking-[0.5px] uppercase mb-[2px]">SCOUTS</p>
                                                      <p className="font-mono font-bold text-[var(--blue-950)] text-[16px] leading-[24px]">1</p>
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
                </PlayersCard>
              </div>
            )}

            {activePage==='matches'&&<MatchesView/>}
            {activePage==='admin'&&<AdminView/>}
          </div>
        </div>
      </main>

      {/* Raise Toast */}
      {raiseToast && (
        <div className="fixed bottom-6 right-6 z-[200] bg-brand-primary text-on-brand px-6 py-4 rounded-[24px] shadow-2xl border border-text-on-brand/10 flex items-center gap-4 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shrink-0 shadow-sm"><ArrowUpRight size={18} className="text-on-brand" /></div>
          <div><div className="font-heading font-black text-[14px]">{raiseToast}</div><div className="font-body text-[12px] text-on-brand/70 font-medium mt-0.5">Raised to Long List · Senior & Lead Scouts notified</div></div>
          <button onClick={()=>setRaiseToast(null)} className="ml-2 text-on-brand/40 hover:text-on-brand/80 transition-colors"><X size={16} /></button>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-ink-midnight/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={()=>setIsTaskModalOpen(false)}>
          <div className="bg-surface-card border border-default w-full max-w-md rounded-[32px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-default flex justify-between items-center bg-surface-accent/50 shrink-0">
              <h2 className="font-heading font-extrabold text-2xl text-heading flex items-center gap-3"><Calendar className="text-strong" size={24} />Tasks for This Week</h2>
              <button onClick={()=>setIsTaskModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-card border border-default flex items-center justify-center text-body hover:text-status-error hover:bg-status-error/10 transition-colors shadow-sm"><X size={16} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <input type="text" placeholder="Add a new task..." value={newTaskText} onChange={e=>setNewTaskText(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&newTaskText.trim()){setTasks([...tasks,{id:Date.now(),text:newTaskText,completed:false}]);setNewTaskText('');}}}
                  className="flex-1 bg-surface-card border border-default rounded-xl px-4 py-3 font-body text-[14px] font-medium text-body focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-focus transition-all" />
                <button onClick={()=>{if(newTaskText.trim()){setTasks([...tasks,{id:Date.now(),text:newTaskText,completed:false}]);setNewTaskText('');}}} className="bg-brand-primary text-on-brand p-3 rounded-xl hover:bg-brand-primary/80 transition-colors shadow-sm shrink-0"><Plus size={20} /></button>
              </div>
              <div className="space-y-3">
                {tasks.map(task=>(
                  <div key={task.id} className="group flex items-start gap-4 p-4 rounded-xl border border-default hover:border-default bg-surface-card transition-all shadow-sm">
                    <button onClick={()=>setTasks(tasks.map(t=>t.id===task.id?{...t,completed:!t.completed}:t))} className={`mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${task.completed?'bg-brand-primary text-on-brand border-brand-primary':'border-2 border-default hover:border-brand-primary'}`}>
                      {task.completed&&<ShieldCheck size={14} strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 font-body text-[14px] font-medium leading-relaxed ${task.completed?'text-body line-through':'text-strong'}`}>{task.text}</span>
                    <button onClick={()=>setTasks(tasks.filter(t=>t.id!==task.id))} className="opacity-0 group-hover:opacity-100 p-2 text-body hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all shrink-0"><Archive size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-default bg-surface-accent/50 flex justify-between items-center shrink-0">
              <span className="font-body text-[14px] font-bold text-body">{tasks.filter(t=>t.completed).length}/{tasks.length} completed</span>
              <button onClick={()=>setIsTaskModalOpen(false)} className="px-6 py-2 bg-surface-canvas text-body hover:bg-surface-canvas rounded-full font-body font-bold text-[14px] transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 bg-ink-midnight/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-surface-card border border-default w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-default flex justify-between items-center bg-surface-card shrink-0">
              <h2 className="font-heading font-black text-2xl text-heading">Add New Player</h2>
              <button onClick={()=>setIsAddPlayerModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-card border border-default flex items-center justify-center text-body hover:text-status-error hover:bg-status-error/10 shadow-sm transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-brand-primary/30 bg-surface-card flex items-center justify-center text-body hover:bg-brand-primary/5 cursor-pointer transition-colors group"><Plus size={24} className="group-hover:scale-110 transition-transform" /></div>
                <span className="font-heading font-bold text-[10px] text-muted mt-3 uppercase tracking-widest">Upload Photo</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 portrait-tablet:grid-cols-1 gap-8">
                <div className="space-y-5">
                  <h3 className="font-heading font-black text-[10px] uppercase tracking-widest text-heading pb-2 border-b border-default">Bio Data</h3>
                  <div className="space-y-4">
                    <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Full Name</label><input type="text" placeholder="e.g. John Doe" className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-focus transition-all" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Parent Team</label><select className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Team</option><option>Manchester United</option><option>Right to Dream</option></select></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Current Team</label><select className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Team</option><option>U21</option><option>Senior</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Date of Birth</label><input type="date" className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all" /></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Nationality</label><input type="text" placeholder="e.g. Ghana" className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all" /></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <h3 className="font-heading font-black text-[10px] uppercase tracking-widests text-heading pb-2 border-b border-default">Technical Data</h3>
                  <div className="space-y-4">
                    <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Positions</label><div className="flex space-x-2">{['Primary','Secondary','Tertiary'].map(p=><select key={p} className="flex-1 bg-surface-card border border-default rounded-xl px-3 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all appearance-none cursor-pointer text-center"><option>{p}</option><option>ST</option><option>LW</option><option>RW</option><option>CM</option></select>)}</div></div>
                    <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Preferred Foot</label><select className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all appearance-none cursor-pointer"><option>Select Foot</option><option>Right</option><option>Left</option><option>Both</option></select></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Height (cm)</label><input type="number" placeholder="185" className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all" /></div>
                      <div><label className="block font-heading font-bold text-[10px] text-muted mb-2 uppercase tracking-widest">Weight (kg)</label><input type="number" placeholder="78" className="w-full bg-surface-card border border-default rounded-xl px-4 py-2 font-body text-[14px] font-bold text-body focus:outline-none transition-all" /></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-default">
                <h3 className="font-heading font-black text-[10px] uppercase tracking-widest text-heading pb-2 border-b border-default">Pipeline Action</h3>
                <div className="flex flex-wrap items-center gap-6">
                  {['Reserve List','Top 10','Raise'].map(action=>(
                    <label key={action} className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-text-body rounded bg-transparent checked:bg-brand-primary checked:border-brand-primary transition-colors cursor-pointer" />
                        <svg className="absolute w-3.5 h-3.5 text-on-brand pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 14 14" fill="none"><path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" /></svg>
                      </div>
                      <span className="font-body text-[14px] font-bold text-body group-hover:text-body transition-colors">Add to {action}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-default bg-surface-card shrink-0 flex justify-end">
              <button onClick={()=>setIsAddPlayerModalOpen(false)} className="px-8 py-3 bg-brand-primary hover:bg-brand-primary text-on-brand rounded-full font-body font-bold text-[14px] shadow-sm transition-all uppercase tracking-wide">Add Player</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

// ─── Action Dropdown — icon-only, remembers last selection ──────────────────

}