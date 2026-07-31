import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown, Video, Archive, ArrowRight,
  Check, Save, Shield, Info, TrendingUp,
  List, LayoutGrid, GripVertical, ToggleLeft,
  ArrowUpRight, RotateCcw, Database, Star, Crosshair, Plus, X,
  Edit2, Trash2, UserCircle, AlertTriangle, MoreHorizontal,
  Send, FileText, StickyNote, Link, Trophy, Medal,
  ArrowLeft, EyeOff, Eye, GripHorizontal, Play, SlidersHorizontal, Columns3, Search, UserRoundCheck, ArrowUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router';
import { ReportsHub } from './ReportsHub';
import { CardView } from './CardView';
import { EditColumnsModal } from './EditColumnsModal';
import { PLAYER_COLUMNS, DEFAULT_VISIBLE_IDS, type PlayerColumn } from './playerColumns';
import { PlayerVideoWorkspace } from './PlayerVideoWorkspace';
import { Submission } from '../data/reports';
import { useTierMap, setTier, seedTiers } from '../state/playerStore';

// ─── Types ───────────────────────────────────────────────────────────────────────
type SeniorTab = 'settings' | 'reports' | 'database' | 'long-list' | 'short-list' | 'target-list' | 'signed-list';
type PipelineTier = 'long-list' | 'short-list' | 'target-list';
type ArchiveView = 'active' | 'audit';
type ViewMode = 'table' | 'card';

interface ExtPlayer {
  id: string; name: string; initials: string; age: number;
  nationality: string; country: string; pos: string; posAcronym: string;
  foot: 'Left' | 'Right' | 'Both'; height: number;
  profile: 'Wonderkid' | 'Prospect' | 'Performance';
  scout: string; goals: number; ass: number; app: number; pens: number;
  matchVideos: number; highlightVideos: number; scouted: boolean; yob: number;
  submissionDate: string; dob: string; team: string; monitor: boolean;
  transfer: string; form: string; week: string;
}

interface TargetData {
  rpt: string; plr: string; por: string; nxt: string;
  h1: string; h2: string;
  fm1: string; fm2: string;
  season: string; comp: string; mins: string; cost: string; fee: string; pct: string;
  rank: string; profile: string; lead: string;
}
interface PlayerNote { id: string; author: string; text: string; date: string; }
interface PlayerTask { id: string; text: string; dueDate: string; done: boolean; }

interface ProfileType { id: string; name: string; color: string; }
interface Props { allPlayersData: any[]; loggedInRole: string; flagMap: Record<string, string>; }

// ─── Constants ───────────────────────────────────────────────────────────────────
const POS_COLORS: Record<string, string> = {
  ST: 'bg-[#E05C4B]/10 text-[#E05C4B]', LW: 'bg-primary/10 text-foreground',
  RW: 'bg-primary/10 text-foreground', CAM: 'bg-[#E8A838]/10 text-[#E8A838]',
  CM: 'bg-muted-foreground/10 text-muted-foreground', CDM: 'bg-primary/10 text-foreground',
  FB: 'bg-primary/10 text-foreground', CB: 'bg-muted-foreground/20 text-muted-foreground',
};
const POS_ORDER = ['Strikers', 'Wingers', 'Midfielders', 'Full Backs', 'Centre Backs'];
const TABS: { id: SeniorTab; label: string }[] = [
  { id: 'target-list', label: 'Target List' },
  { id: 'short-list',  label: 'Short List'  },
  { id: 'long-list',   label: 'Long List'   },
  { id: 'database',    label: 'Database'    },
  { id: 'signed-list', label: 'Signed List' },
  { id: 'reports',     label: 'Reports'     },
  { id: 'settings',    label: 'Settings'    },
];
// ─── User-arrangeable tab order (persisted per role) ───────────────────────────
// No backend/per-email identity exists (login role lives in sessionStorage), so a
// user's chosen order is saved to localStorage keyed by their role — persists across
// sessions until they reorder again or reset.
const DEFAULT_TAB_ORDER: SeniorTab[] = TABS.map(t => t.id);
const tabOrderKey = (role?: string) => `nxus:playerTabOrder:${(role || 'default').toLowerCase().replace(/\s+/g, '-')}`;
const loadTabOrder = (role?: string): SeniorTab[] => {
  try {
    const raw = window.localStorage.getItem(tabOrderKey(role));
    if (!raw) return DEFAULT_TAB_ORDER;
    const saved = JSON.parse(raw) as string[];
    // Keep only ids we still know, then append any tabs added since the order was saved.
    const known = saved.filter((id): id is SeniorTab => (DEFAULT_TAB_ORDER as string[]).includes(id));
    const missing = DEFAULT_TAB_ORDER.filter(id => !known.includes(id));
    return known.length ? [...known, ...missing] : DEFAULT_TAB_ORDER;
  } catch { return DEFAULT_TAB_ORDER; }
};
const PAGE_TITLES: Record<SeniorTab, { first: string; rest: string }> = {
  'settings':    { first: 'Scope',   rest: 'Settings' },
  'reports':     { first: 'Scouting', rest: 'Reports' },
  'database':    { first: 'Players', rest: 'Database' },
  'long-list':   { first: 'Long',    rest: 'List'     },
  'short-list':  { first: 'Short',   rest: 'List'     },
  'target-list': { first: 'Target',  rest: 'List'     },
  'signed-list': { first: 'Signed',  rest: 'List'     },
};
const PAGE_ICON_NODES: Record<SeniorTab, React.ReactNode> = {
  'settings':    <Crosshair size={28} className="text-chalk" />,
  'reports':     <FileText  size={28} className="text-chalk" />,
  'database':    <Database  size={28} className="text-chalk" />,
  'long-list':   <List      size={28} className="text-chalk" />,
  'short-list':  <Star      size={28} className="text-chalk" />,
  'target-list': <Crosshair size={28} className="text-chalk" />,
  'signed-list': <TrendingUp size={28} className="text-chalk" />,
};
const TAB_SUBTITLES: Record<SeniorTab, string> = {
  'settings':    'Configure the parameters that define your active scouting scope.',
  'reports':     'Scouting reports filed by the team.',
  'database':    'All players within your active scouting scope.',
  'long-list':   'Players flagged for closer evaluation.',
  'short-list':  'Prioritised candidates for your current cycle.',
  'target-list': 'Players actively being pursued for acquisition.',
  'signed-list': 'Players officially signed and in the development pipeline.',
};
const SCOUTS   = ['Kwame A.', 'Chidi O.', 'Wekesa O.', 'Emeka E.', 'Pape S.'];
const HEIGHTS  = [165, 170, 172, 175, 177, 180, 182, 185, 188, 190];
const FEET: Array<'Left' | 'Right' | 'Both'> = ['Left', 'Right', 'Right', 'Right', 'Both'];
const PROFILES: Array<'Wonderkid' | 'Prospect' | 'Performance'> = ['Wonderkid', 'Prospect', 'Prospect', 'Performance', 'Performance'];
const POS_ACRONYM_MAP: Record<string, string[]> = {
  Strikers: ['ST'], Wingers: ['LW', 'RW'], Midfielders: ['CM', 'CDM', 'CAM'],
  'Full Backs': ['FB'], 'Centre Backs': ['CB'],
};
const POSITION_LIST = [
  { pos: 'ST', name: 'Striker' }, { pos: 'LW', name: 'Left Winger' },
  { pos: 'RW', name: 'Right Winger' }, { pos: 'CAM', name: 'Attacking Mid' },
  { pos: 'CM', name: 'Central Mid' }, { pos: 'CDM', name: 'Defensive Mid' },
  { pos: 'FB', name: 'Full Back' }, { pos: 'CB', name: 'Centre Back' },
];
const STATUS_DESCRIPTIONS: Record<string, string> = {
  active: 'Scouts can view and submit players',
  paused: 'Submissions frozen, data preserved',
  archived: 'Scope closed and locked for review only',
};
const DEFAULT_TARGET: TargetData = {
  rpt: '2', plr: 'B', por: 'B', nxt: 'T',
  h1: 'https://example.com/hl1', h2: 'https://example.com/hl2',
  fm1: 'https://example.com/fm1', fm2: 'https://example.com/fm2',
  season: '24/25', comp: '', mins: '', cost: '', fee: '', pct: '',
  rank: '', profile: '', lead: '',
};
const GRADE_OPTS = ['', 'A+', 'A', 'B', 'C'];
const NXT_OPTS   = ['', 'T', 'M', 'D'];
const PATHWAY_OPTS = ['', 'ACH', 'Partner'];

// Deterministic per-player grade (grade is not on the player model).
// Stable string hash → one of four grades, constant across renders.
const GRADE_FILTER_OPTS = ['All', 'A+', 'A', 'B', 'C'];
const PLAYER_GRADES = ['A+', 'A', 'B', 'C'];
const hashStr = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const playerGrade = (p: ExtPlayer) => PLAYER_GRADES[hashStr(p.id) % PLAYER_GRADES.length];

// ─── Atoms ───────────────────────────────────────────────────────────────────────
const FlagCircle = ({ code, label }: { code: string; label: string }) => (
  <div className="w-5 h-5 rounded-full overflow-hidden border border-border bg-accent shrink-0 mx-auto">
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={label} className="w-full h-full object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  </div>
);

// Small inline flag shown next to the scouted/video status in the Player ID cell
const FlagBadge = ({ code, label }: { code: string; label: string }) => (
  <span className="w-4 h-4 rounded-full overflow-hidden border border-border bg-accent shrink-0">
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={label} className="w-full h-full object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  </span>
);

// Ladder method icon — lucide has no clean stairs glyph
const StairsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10" />
  </svg>
);

const PosPill = ({ pos }: { pos: string }) => (
  <span className={`inline-block px-2 py-[2px] rounded font-body text-[10px] font-bold ${POS_COLORS[pos] || 'bg-accent text-muted-foreground'}`}>{pos}</span>
);

const TCell = ({ value, onChange, type = 'text', opts, placeholder = '' }:
  { value: string; onChange: (v: string) => void; type?: string; opts?: string[]; placeholder?: string }) => {
  if (opts) return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-transparent font-body text-[12px] font-bold text-foreground focus:outline-none cursor-pointer text-center appearance-none">
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-transparent font-body text-[12px] font-bold text-foreground focus:outline-none placeholder:text-muted-foreground min-w-0 text-center" />
  );
};


// ─── Editable Column Header ────────────────────────────────────────────────────
const EditableColHeader = ({ label, onRename, onRemove }: {
  label: string;
  onRename: (newLabel: string) => void;
  onRemove: () => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(label);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-1 group">
      {editing ? (
        <input autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onRename(draft); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Enter') { onRename(draft); setEditing(false); }}}
          className="bg-transparent border-b border-white/50 text-chalk font-heading font-bold text-[10px] uppercase tracking-widest w-[80px] focus:outline-none" />
      ) : (
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest">{label}</span>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/40 hover:text-white/80 ml-0.5">
        <ChevronDown size={8} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-[500] bg-card border border-border rounded-[10px] shadow-2xl min-w-[140px] overflow-hidden">
          <button onClick={() => { setEditing(true); setOpen(false); }}
            className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-foreground hover:bg-card/10 flex items-center gap-2">
            <Edit2 size={11} />Rename
          </button>
          <button onClick={() => { onRemove(); setOpen(false); }}
            className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/10 flex items-center gap-2">
            <X size={11} />Remove column
          </button>
        </div>
      )}
    </div>
  );
};


// ─── Editable Column Header (LIGHT — for white sub-header rows) ──────────────
const EditableColHeaderLight = ({ label, onRename, onRemove, onHide, onMove }: {
  label: string;
  onRename: (newLabel: string) => void;
  onRemove: () => void;
  onHide?: () => void;
  onMove?: () => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(label);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center gap-0.5 group">
      {editing ? (
        <input autoFocus value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onRename(draft); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Enter') { onRename(draft); setEditing(false); }}}
          className="bg-transparent border-b border-primary/50 text-foreground font-heading font-bold text-[12px] uppercase tracking-widest w-[60px] focus:outline-none" />
      ) : (
        <span>{label}</span>
      )}
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-muted-foreground hover:text-foreground">
        <ChevronDown size={8} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-[500] bg-card border border-border rounded-[10px] shadow-2xl min-w-[140px] overflow-hidden">
          <button onClick={(e) => { e.stopPropagation(); setEditing(true); setOpen(false); }}
            className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-foreground hover:bg-card/10 flex items-center gap-2">
            <Edit2 size={11} />Rename
          </button>
          {onHide && (
            <button onClick={(e) => { e.stopPropagation(); onHide(); setOpen(false); }}
              className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-foreground hover:bg-card/10 flex items-center gap-2">
              <EyeOff size={11} />Hide column
            </button>
          )}
          {onMove && (
            <button onClick={(e) => { e.stopPropagation(); onMove(); setOpen(false); }}
              className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-foreground hover:bg-card/10 flex items-center gap-2">
              <GripHorizontal size={11} />Reorder
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onRemove(); setOpen(false); }}
            className="w-full text-left px-3 py-2 font-body text-[12px] font-bold text-[#E05C4B] hover:bg-[#E05C4B]/10 flex items-center gap-2">
            <Trash2 size={11} />Delete column
          </button>
        </div>
      )}
    </div>
  );
};


// ─── Action Dropdown — icon-only ──────────────────────────────────────────────────
interface ActionItem { label: string; action: () => void; danger?: boolean; icon: React.ReactNode; }

const ActionDropdown = ({ playerId, items, openId, setOpenId, primaryIcon }: {
  playerId: string; items: ActionItem[];
  openId: string | null; setOpenId: (id: string | null) => void;
  primaryIcon?: React.ReactNode;
}) => {
  // Track selected primary per dropdown — primary icon = last selected action
  const [selectedIdx, setSelectedIdx] = useState(0);
  const safeIdx = Math.min(selectedIdx, items.length - 1);
  const primaryItem = items[safeIdx >= 0 ? safeIdx : 0];
  const restItems   = items.filter((_, i) => i !== safeIdx);
  const chevronRef  = useRef<HTMLButtonElement>(null);
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
              ${item.danger ? 'text-[#E05C4B] hover:bg-[#E05C4B]/15' : 'text-foreground hover:bg-card/10'}`}>
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
            ? 'bg-[#E05C4B]/10 text-[#E05C4B] hover:bg-[#E05C4B] hover:text-white border-[#E05C4B]/20'
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

// Inline action icons — every action shown as its own round button (no dropdown)
const ActionButtons = ({ items }: { items: ActionItem[] }) => {
  if (!items.length) return null;
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-accent border border-border p-0.5">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="w-px h-4 bg-border/70 self-center shrink-0" />}
          <button onClick={(e) => { e.stopPropagation(); item.action(); }} title={item.label}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              item.label === 'Restore'
                ? 'text-emerald-600 hover:bg-emerald-500 hover:text-white'
                : 'text-foreground hover:bg-primary hover:text-primary-foreground'
            }`}>
            {item.icon}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Muted tint — any non-palette colour renders as a soft tonal chip ──────────────
// System rule: fill = hue@~13% (#hex22), text = full hue, border = hue@~30% (#hex55).
// Never a solid saturated fill; keeps semantic colours blended with the palette.
const tintStyle = (hex?: string): React.CSSProperties => {
  const h = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#1E88E5';
  return { backgroundColor: `${h}22`, color: h, borderColor: `${h}55` };
};
const RANK_TINT: Record<string, string> = { '1': '#22C55E', '2': '#E8A838', '3': '#E05C4B' };

// ─── Cell Select — on-brand dropdown for table cells (portalled so it isn't clipped) ─
const CellSelect = ({ value, options, onChange, placeholder = '–', renderValue, menuWidth = 140, triggerClass = '' }: {
  value: string; options: string[]; onChange: (v: string) => void;
  placeholder?: string; renderValue?: (v: string) => React.ReactNode;
  menuWidth?: number; triggerClass?: string;
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const uid = React.useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: menuWidth });
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const menu = document.getElementById(`cs-${uid}`);
      if (!btnRef.current?.contains(e.target as Node) && !menu?.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('scroll', onScroll, true);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('scroll', onScroll, true); };
  }, [open, uid]);
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const w = Math.max(menuWidth, r.width);
      const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
      setPos({ top: r.bottom + 4, left, width: w });
    }
    setOpen(true);
  };
  const menu = open ? createPortal(
    <div id={`cs-${uid}`}
      style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999, boxShadow: '0 8px 24px rgba(6,27,46,0.18)' }}
      className="bg-card rounded-[12px] overflow-hidden border border-border py-1 max-h-[240px] overflow-y-auto">
      {options.map(opt => {
        const selected = opt === value;
        return (
          <button key={opt || '__blank'} type="button" onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }}
            className={`w-full text-left px-3 py-2 font-body text-[12px] font-bold flex items-center gap-2 transition-colors ${selected ? 'bg-accent text-primary' : 'text-foreground hover:bg-accent'}`}>
            {renderValue ? renderValue(opt) : <span>{opt || placeholder}</span>}
          </button>
        );
      })}
    </div>, document.body) : null;
  return (
    <>
      <button ref={btnRef} type="button" onClick={toggle}
        className={`inline-flex items-center justify-center gap-1 cursor-pointer focus:outline-none ${triggerClass}`}>
        {renderValue ? renderValue(value) : <span className="font-body text-[12px] font-bold text-foreground">{value || placeholder}</span>}
        <ChevronDown size={10} className={`text-muted-foreground pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {menu}
    </>
  );
};

// ─── Notes + Tasks Popup ──────────────────────────────────────────────────────────
const NotesTasksPopup = ({ playerId, playerName, onClose }: { playerId: string; playerName: string; onClose: () => void; }) => {
  const [notes, setNotes] = useState<PlayerNote[]>([
    { id: 'n1', author: 'Nene', text: 'Strong left foot. Works hard off the ball.', date: 'Dec 10' },
    { id: 'n2', author: 'Tom', text: 'Needs improvement in aerial duels. Promising vision.', date: 'Dec 14' },
  ]);
  const [tasks, setTasks] = useState<PlayerTask[]>([
    { id: 't1', text: 'Watch highlight package Dec 2024', dueDate: 'Dec 20', done: false },
    { id: 't2', text: 'File full report after next match', dueDate: 'Dec 22', done: true },
  ]);
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newDue, setNewDue] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={onClose}>
      <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-md border border-border max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 bg-primary rounded-t-[28px] flex items-center justify-between shrink-0">
          <div>
            <span className="font-heading font-semibold text-[16px] text-white">Notes & Tasks</span>
            <p className="font-body text-[12px] text-white/40 mt-0.5">{playerName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={14} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Tasks */}
          <div>
            <h4 className="font-heading font-black text-[14px] text-foreground mb-3 flex items-center gap-2">
              <FileText size={13} /> Tasks
            </h4>
            <div className="space-y-2 mb-3">
              {tasks.map(t => (
                <div key={t.id} className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${t.done ? 'opacity-50 bg-accent border-border' : 'bg-card border-border'}`}>
                  <button onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                    className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${t.done ? 'bg-primary border-primary' : 'border-border'}`}>
                    {t.done && <Check size={9} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-[12px] font-bold ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Due {t.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="New task..."
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 font-body text-[12px] font-bold text-foreground focus:outline-none focus:border-ring" />
              <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                className="w-28 bg-card border border-border rounded-xl px-2 py-2 font-body text-[12px] font-bold text-foreground focus:outline-none" />
              <button onClick={() => { if (newTask.trim()) { setTasks(p => [...p, { id: `t${Date.now()}`, text: newTask, dueDate: newDue || 'TBD', done: false }]); setNewTask(''); setNewDue(''); }}}
                className="w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/80"><Plus size={14} /></button>
            </div>
          </div>
          <div className="h-px bg-border" />
          {/* Notes */}
          <div>
            <h4 className="font-heading font-black text-[14px] text-foreground mb-3 flex items-center gap-2">
              <StickyNote size={13} /> Scout Notes
            </h4>
            <div className="space-y-2 mb-3">
              {notes.map(n => (
                <div key={n.id} className="px-3 py-2 bg-card border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-black text-[12px] text-foreground">{n.author}</span>
                    <span className="font-body text-[10px] text-muted-foreground">{n.date}</span>
                  </div>
                  <p className="font-body text-[12px] text-muted-foreground">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..."
                className="flex-1 bg-card border border-border rounded-xl px-3 py-2 font-body text-[12px] font-bold text-foreground focus:outline-none focus:border-ring" />
              <button onClick={() => { if (newNote.trim()) { setNotes(p => [...p, { id: `n${Date.now()}`, author: 'You', text: newNote, date: 'Now' }]); setNewNote(''); }}}
                className="w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/80"><Plus size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const buildActionItems = (
  currentTab: Exclude<SeniorTab, 'settings'>,
  onSendForward: () => void, onSendBackward: () => void, onArchive: () => void,
  onRestore?: () => void, isArchived?: boolean,
): ActionItem[] => {
  if (isArchived && onRestore) return [
    { label: 'Restore', action: onRestore, icon: <RotateCcw size={12} className="text-emerald-400" /> },
  ];
  if (currentTab === 'database') return [
    { label: 'Send Forward', action: onSendForward, icon: <ArrowRight size={12} /> },
  ];
  if (currentTab === 'long-list') return [
    { label: 'Send Forward', action: onSendForward, icon: <ArrowRight size={12} /> },
    { label: 'Archive',      action: onArchive,     icon: <Archive    size={12} />, danger: true },
  ];
  if (currentTab === 'short-list') return [
    { label: 'Send Forward', action: onSendForward,  icon: <ArrowRight size={12} /> },
    { label: 'Send Back',    action: onSendBackward, icon: <ArrowLeft  size={12} /> },
    { label: 'Archive',      action: onArchive,      icon: <Archive    size={12} />, danger: true },
  ];
  if (currentTab === 'target-list') return [
    { label: 'Send Back', action: onSendBackward, icon: <ArrowLeft size={12} /> },
    { label: 'Archive',   action: onArchive,      icon: <Archive   size={12} />, danger: true },
  ];
  return [];
};

// ─── Filter Bar — improved spacing and text size to match Country/Head ────────────
const FilterBar = ({
  filterFoot, setFilterFoot, filterHeightMin, setFilterHeightMin,
  filterHeightMax, setFilterHeightMax, filterAgeMin, setFilterAgeMin,
  filterAgeMax, setFilterAgeMax, filterPos, setFilterPos,
  filterProfile, setFilterProfile, filterScout, setFilterScout,
  filterGrade, setFilterGrade,
  archiveView, setArchiveView,
}: {
  filterFoot: string; setFilterFoot: (v: string) => void;
  filterHeightMin: string; setFilterHeightMin: (v: string) => void;
  filterHeightMax: string; setFilterHeightMax: (v: string) => void;
  filterAgeMin: string; setFilterAgeMin: (v: string) => void;
  filterAgeMax: string; setFilterAgeMax: (v: string) => void;
  filterPos: string; setFilterPos: (v: string) => void;
  filterProfile: string; setFilterProfile: (v: string) => void;
  filterScout: string; setFilterScout: (v: string) => void;
  filterGrade: string; setFilterGrade: (v: string) => void;
  archiveView: ArchiveView; setArchiveView: (v: ArchiveView) => void;
}) => {
  // ── Sel: same visual as Country/Head filter dropdowns ──
  const Sel = ({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: string[] }) => (
    <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors shadow-sm cursor-pointer">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5">
        {opts.map(o => <option key={o} value={o} className="bg-card text-foreground">{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
    </div>
  );

  // ── NumIn: sized to match ──
  const NumIn = ({ value, onChange, ph }: { value: string; onChange: (v: string) => void; ph: string }) => (
    <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={ph}
      className="w-14 bg-card border border-border rounded-full px-3 py-2 text-foreground font-body text-[14px] font-bold focus:outline-none placeholder:text-muted-foreground" />
  );

  return (
    <div className="bg-primary rounded-[24px] px-[var(--pad-card)] py-4 flex flex-col md:flex-row md:items-center md:flex-wrap gap-3 md:gap-4 border border-white/5 w-full">
      {/* BIO section */}
      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">BIO</span>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Foot:</span>
        <Sel value={filterFoot} onChange={setFilterFoot} opts={['All','Left','Right','Both']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Ht:</span>
        <NumIn value={filterHeightMin} onChange={setFilterHeightMin} ph="min" />
        <span className="text-white/20 font-body text-[14px]">–</span>
        <NumIn value={filterHeightMax} onChange={setFilterHeightMax} ph="max" />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Age:</span>
        <NumIn value={filterAgeMin} onChange={setFilterAgeMin} ph="min" />
        <span className="text-white/20 font-body text-[14px]">–</span>
        <NumIn value={filterAgeMax} onChange={setFilterAgeMax} ph="max" />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-card/10 mx-1 shrink-0" />

      {/* TECH section */}
      <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">TECH</span>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Pos:</span>
        <Sel value={filterPos} onChange={setFilterPos} opts={['All','ST','LW','RW','CM','CDM','CAM','FB','CB']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Profile:</span>
        <Sel value={filterProfile} onChange={setFilterProfile} opts={['All','Performance','Prospect','Wonderkid']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Scout:</span>
        <Sel value={filterScout} onChange={setFilterScout} opts={['All', ...SCOUTS]} />
      </div>
      <div className="flex items-center gap-2">
        <span className="font-body text-[14px] font-bold text-muted-foreground">Grade:</span>
        <Sel value={filterGrade} onChange={setFilterGrade} opts={GRADE_FILTER_OPTS} />
      </div>

      {/* Active/Audit toggle — right-aligned */}
      <div className="ml-auto flex items-center shrink-0">
        <div className="flex items-center bg-card/5 border border-white/10 rounded-full p-1">
          <button onClick={() => setArchiveView('active')}
            className={`px-4 py-2 rounded-full font-body text-[14px] font-bold transition-all ${archiveView === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-white/40 hover:text-white'}`}>
            Active
          </button>
          <button onClick={() => setArchiveView('audit')}
            className={`px-4 py-2 rounded-full font-body text-[14px] font-bold transition-all ${archiveView === 'audit' ? 'bg-primary text-chalk shadow-sm' : 'text-white/40 hover:text-white'}`}>
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Group Header Rows ────────────────────────────────────────────────────────────
const PosHeader = ({ pos, count, colSpan }: { pos: string; count: number; colSpan: number }) => (
  <tr className="bg-primary">
    <td colSpan={colSpan} className="py-2 px-4 sticky top-[58px] md:top-[70px] lg:top-[82px] z-30 bg-primary">
      <span className="inline-flex items-center gap-2">
        <span className="font-heading font-bold text-[11px] tracking-widest uppercase text-white">{pos}</span>
        <span className="inline-flex items-center justify-center bg-white/20 rounded-full px-[6px] py-[2px] font-heading font-bold text-[10px] leading-none text-white">{count}</span>
      </span>
    </td>
  </tr>
);

const YobHeader = ({ yob, colSpan }: { yob: number; colSpan: number }) => (
  <tr className="border-t border-border">
    <td colSpan={colSpan} className="py-2 px-4 bg-accent sticky top-[95px] md:top-[113px] lg:top-[131px] z-30">
      <span className="font-heading font-bold text-[11px] tracking-widest uppercase text-primary">{yob}</span>
    </td>
  </tr>
);

// ─── Standard Player Table ────────────────────────────────────────────────────────
const PlayerTable = ({
  players, archivedSet, archiveView, currentTab, flagMap,
  openDropdownId, setOpenDropdownId,
  onReserve, onShort, onSendForward, onArchive, onRestore,
  raisedPlayerIds, loggedInRole, profileTypes, extraCols = [],
  visibleStats = new Set(['app', 'gls', 'pen', 'ast']),
  highlightId = null,
  onOpenVideos,
}: {
  players: ExtPlayer[]; archivedSet: Set<string>; archiveView: ArchiveView;
  currentTab: Exclude<SeniorTab, 'settings'>; flagMap: Record<string, string>;
  openDropdownId: string | null; setOpenDropdownId: (id: string | null) => void;
  onReserve: (id: string) => void; onShort: (id: string) => void;
  onSendForward: (id: string) => void; onArchive: (id: string) => void; onRestore: (id: string) => void;
  raisedPlayerIds?: Set<string>; loggedInRole?: string;
  profileTypes?: ProfileType[]; extraCols?: PlayerColumn[];
  visibleStats?: Set<string>;
  highlightId?: string | null;
  onOpenVideos?: (player: ExtPlayer) => void;
}) => {
  const navigate = useNavigate();
  const displayPlayers = useMemo(() => {
    if (archiveView === 'audit') return players.filter(p => archivedSet.has(p.id));
    return [...players.filter(p => !archivedSet.has(p.id)), ...players.filter(p => archivedSet.has(p.id))];
  }, [players, archivedSet, archiveView]);

  const grouped = useMemo(() => {
    const result: { pos: string; yob: number; players: ExtPlayer[]; isArchiveGroup?: boolean }[] = [];
    // Active players grouped by pos + yob as normal
    const active = archiveView === 'audit' ? displayPlayers : displayPlayers.filter(p => !archivedSet.has(p.id));
    for (const pos of POS_ORDER) {
      const posPlayers = active.filter(p => p.pos === pos);
      if (!posPlayers.length) continue;
      const yobMap = new Map<number, ExtPlayer[]>();
      for (const p of posPlayers) { if (!yobMap.has(p.yob)) yobMap.set(p.yob, []); yobMap.get(p.yob)!.push(p); }
      [...yobMap.keys()].sort((a, b) => b - a).forEach(yob => result.push({ pos, yob, players: yobMap.get(yob)! }));
    }
    // Archived players appended as a single flat group at bottom (active view only)
    if (archiveView === 'active') {
      const archived = displayPlayers.filter(p => archivedSet.has(p.id));
      if (archived.length > 0) {
        result.push({ pos: '— Archived —', yob: 0, players: archived, isArchiveGroup: true });
      }
    }
    return result;
  }, [displayPlayers, archivedSet, archiveView]);

  const TOTAL_COLS = (currentTab === 'long-list' ? 14 : 16) + extraCols.length;
  const showDirectLadder = loggedInRole === 'Senior Scout' || loggedInRole === 'Lead Scout';
  // Action column width depends on how many inline action buttons the tab shows (DB=1, Long=2).
  const actWCls = currentTab === 'long-list' ? 'w-[76px]' : 'w-[44px]';
  const idLeftCls = currentTab === 'long-list' ? 'left-[76px]' : 'left-[44px]';

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;
    const onScroll = () => setShowTop(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [displayPlayers.length]);

  if (displayPlayers.length === 0) return (
    <div className="bg-card rounded-[20px] border border-border flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3"><Archive size={16} className="text-muted-foreground" /></div>
      <div className="font-heading font-semibold text-[16px] text-foreground mt-4">{archiveView === 'audit' ? 'No archived players' : 'No players here yet'}</div>
      <p className="font-body text-[12px] text-muted-foreground font-medium">{currentTab === 'database' ? 'All players matching Scope Settings appear here.' : 'Move players forward from the previous list.'}</p>
    </div>
  );

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div ref={scrollBoxRef} id="ll-scroll-box" className="overflow-auto w-full flex-1 min-h-0 hide-scrollbar rounded-b-[24px]">
        <table className="rtable w-full text-left whitespace-nowrap border-separate border-spacing-0">
          <thead className="sticky top-0 z-30">

            {/* ── GROUP HEADER ROW — navy background, group names ── */}
            <tr className="bg-primary">
              <th colSpan={2}
                className="sticky left-0 z-40 bg-primary px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15">
                Player ID
              </th>
              <th colSpan={3} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">Bio</th>
              {currentTab === 'long-list'
                ? <th className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                    Status
                  </th>
                : <th colSpan={3}
                    className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                    Videos
                  </th>}
              <th colSpan={2}
                className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                Bio Data
              </th>
              <th colSpan={1}
                className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                Scout
              </th>
              <th colSpan={currentTab === 'database' ? Math.max(1, ['app','gls','pen','ast'].filter(k => visibleStats.has(k)).length) : 4}
                className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                Game Stats
              </th>
              {extraCols.length > 0 && (
                <th colSpan={extraCols.length}
                  className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                  Custom
                </th>
              )}
            </tr>

            {/* ── COLUMN SUB-HEADER ROW — light grey background, dark text ── */}
            <tr className="bg-card border-b-2 border-border">
              <th className={`sticky left-0 z-40 bg-card px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center ${actWCls}`}></th>
              {/* Player — vertical divider after (end of Player ID group) */}
              <th className={`sticky z-40 bg-card pl-3 pr-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[200px] border-r-2 border-border ${idLeftCls}`}><EditableColHeaderLight label="Player" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[92px]">DOB</th>
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[56px]">POS</th>
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[120px] border-r-2 border-border">Team</th>
              {currentTab === 'long-list'
                ? <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[120px] border-r-2 border-border">Status</th>
                : <>
                    <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widests text-center w-[52px]">
                      <div className="flex justify-center items-center gap-1"><Video size={10} /><span>Match</span></div>
                    </th>
                    <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[52px]">
                      <div className="flex justify-center items-center gap-1"><Video size={10} /><span>High</span></div>
                    </th>
                    <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[80px] border-r-2 border-border"><EditableColHeaderLight label="Added" onRename={()=>{}} onRemove={()=>{}} /></th>
                  </>}
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[52px]"><EditableColHeaderLight label="Ft" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Ht — vertical divider after (end of Bio Data group) */}
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[52px] border-r-2 border-border"><EditableColHeaderLight label="Ht" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Scout — vertical divider after (end of Scout group) */}
              <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[110px] border-r-2 border-border"><EditableColHeaderLight label="Scout" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Game Stats — alternating shaded sub-headers */}
              {(currentTab !== 'database' || visibleStats.has('app')) && (
                <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[60px] bg-card"><EditableColHeaderLight label="App" onRename={()=>{}} onRemove={()=>{}} /></th>
              )}
              {(currentTab !== 'database' || visibleStats.has('gls')) && (
                <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[60px] bg-card"><EditableColHeaderLight label="Gls" onRename={()=>{}} onRemove={()=>{}} /></th>
              )}
              {(currentTab !== 'database' || visibleStats.has('pen')) && (
                <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[60px] bg-card"><EditableColHeaderLight label="Pen" onRename={()=>{}} onRemove={()=>{}} /></th>
              )}
              {/* Ast — vertical divider after (end of Game Stats group) */}
              {(currentTab !== 'database' || visibleStats.has('ast')) && (
                <th className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[60px] bg-card border-r-2 border-border"><EditableColHeaderLight label="Ast" onRename={()=>{}} onRemove={()=>{}} /></th>
              )}
              {extraCols.map(c => (
                <th key={c.id} className="px-2 py-4 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[64px] whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grouped.map(({ pos, yob, players: grpPlayers, isArchiveGroup }) => {
              const allPosPlayers = isArchiveGroup ? grpPlayers : displayPlayers.filter(p => !archivedSet.has(p.id) && p.pos === pos);
              const isFirstYob = isArchiveGroup ? true : grouped.findIndex(g => g.pos === pos) === grouped.findIndex(g => g.pos === pos && g.yob === yob);
              return (
                <React.Fragment key={isArchiveGroup ? '__archived__' : `${pos}-${yob}`}>
                  {isArchiveGroup ? (
                    <tr className="bg-muted-foreground/80">
                      <td colSpan={TOTAL_COLS} className="py-2 px-4 text-center">
                        <span className="font-heading font-bold text-[10px] tracking-widest uppercase text-chalk">Archived — Not Visible to Scouts · {grpPlayers.length}</span>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {isFirstYob && <PosHeader pos={pos} count={allPosPlayers.length} colSpan={TOTAL_COLS} />}
                      <YobHeader yob={yob} colSpan={TOTAL_COLS} />
                    </>
                  )}
                  {grpPlayers.map(player => {
                    const isArchived = archivedSet.has(player.id);
                    const natCode = flagMap[player.nationality] || 'un';
                    const isRaised = raisedPlayerIds?.has(player.id) ?? false;
                    const actionItems = buildActionItems(currentTab,
                      () => onSendForward(player.id), () => {}, () => onArchive(player.id),
                      () => onRestore(player.id), isArchived);
                    return (
                      <tr key={player.id} id={`row-${player.id}`}
                        className={`border-b border-border last:border-0 group transition-colors ${isArchived ? 'opacity-50' : isRaised ? 'border-l-4 border-l-primary hover:bg-accent' : 'hover:bg-accent'}${highlightId === player.id ? ' ring-2 ring-primary ring-inset bg-primary/5' : ''}`}>
                        {/* Action — icon forward button (all list tabs) */}
                        <td className={`sticky left-0 z-20 bg-card group-hover:bg-accent px-2 py-2 ${actWCls}`}>
                          <ActionButtons items={actionItems} />
                        </td>

                        {/* Identity — vertical divider after (Player ID group end) */}
                        <td className={`sticky z-20 bg-card group-hover:bg-accent pl-3 pr-2 py-2 border-r-2 border-border ${idLeftCls}`}>
                          <div className="flex items-center gap-2 min-w-[190px]">
                            <div className="w-8 h-8 rounded-xl bg-card text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">{player.initials}</div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1">
                                <span onClick={() => navigate(`${window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : window.location.pathname.startsWith('/senior-scout') ? '/senior-scout' : ''}/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, preferredFoot: player.foot, height: player.height, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }, { label: ((typeof currentTab !== 'undefined' ? ({ 'database': 'Database', 'long-list': 'Long List', 'short-list': 'Short List', 'target-list': 'Target List', 'signed-list': 'Signed List' } as any)[currentTab] : null) || 'Database'), path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }] } })} className="font-body font-bold text-primary text-[14px] leading-tight whitespace-nowrap hover:underline cursor-pointer">{player.name}</span>
                                {isArchived && <span className="bg-muted-foreground/15 text-muted-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shrink-0">Archived</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-body text-[12px] text-muted-foreground shrink-0">{player.age}</span>
                                <div className={`w-2 h-2 rounded-full shrink-0 ${player.scouted ? 'bg-[#3A8C6A]' : 'bg-[#E05C4B]'}`} title={player.scouted ? 'Scouted' : 'Unscouted'} />
                                <FlagBadge code={natCode} label={player.nationality} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center w-[92px]"><span className="font-body text-[12px] text-muted-foreground">{player.dob}</span></td>
                        <td className="px-2 py-3 text-center w-[56px]"><span className="font-body text-[12px] font-bold text-muted-foreground">{player.posAcronym}</span></td>
                        <td className="px-2 py-3 w-[120px] border-r-2 border-border"><span className="font-body text-[12px] text-muted-foreground truncate block max-w-[110px]">{player.team}</span></td>

                        {/* Status — long-list only (video badges + method icon + play) / Videos — database */}
                        {currentTab === 'long-list' ? (
                          <td className="px-2 py-3 w-[120px] border-r-2 border-border">
                            <div className="flex items-center justify-center gap-1">
                              {player.matchVideos > 0 && <span className="bg-primary/20 text-foreground font-body font-bold px-1.5 py-0.5 rounded text-[11px]">F{player.matchVideos}</span>}
                              {player.highlightVideos > 0 && <span className="bg-primary/10 text-foreground font-body font-bold px-1.5 py-0.5 rounded text-[11px]">H{player.highlightVideos}</span>}
                              {isRaised
                                ? <span title="Direct — added directly to the Long List"><UserRoundCheck size={15} className="text-[#E8A838]" /></span>
                                : <span title="Ladder — reached via the scouting process"><StairsIcon className="w-[15px] h-[15px] text-[#7C5CFC]" /></span>}
                              <button onClick={() => onOpenVideos?.(player)} title="Watch videos"
                                className="w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-chalk flex items-center justify-center transition-colors">
                                <Play size={11} className="ml-0.5" />
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-2 py-3 text-center w-[52px]">
                              <span className="bg-primary/20 text-foreground font-body font-bold px-2 py-0.5 rounded text-[12px] cursor-pointer hover:opacity-80">F{player.matchVideos}</span>
                            </td>
                            <td className="px-2 py-3 text-center w-[52px]">
                              <span className="bg-primary/10 text-foreground font-body font-bold px-2 py-0.5 rounded text-[12px] cursor-pointer hover:opacity-80">H{player.highlightVideos}</span>
                            </td>
                            <td className="px-2 py-3 text-center w-[80px] border-r-2 border-border">
                              <span className="font-body text-[12px] font-medium text-muted-foreground">{player.submissionDate}</span>
                            </td>
                          </>
                        )}
                        {/* Bio Data */}
                        <td className="px-2 py-3 text-center w-[52px]">
                          <span className={`font-body text-[12px] font-bold ${player.foot === 'Both' ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {player.foot === 'Both' ? 'B' : player.foot[0]}
                          </span>
                        </td>
                        {/* Ht — vertical divider after (Bio Data group end) */}
                        <td className="px-2 py-3 text-center w-[52px] border-r-2 border-border">
                          <span className="font-mono font-bold text-[12px] text-muted-foreground">{player.height}</span>
                        </td>

                        {/* Scout — vertical divider after (Scout group end) */}
                        <td className="px-2 py-3 w-[110px] border-r-2 border-border">
                          <span className="font-body text-[12px] font-bold text-muted-foreground">{player.scout}</span>
                        </td>

                        {/* Game Stats — alternating shaded */}
                        {(currentTab !== 'database' || visibleStats.has('app')) && (
                          <td className="px-2 py-3 text-center w-[60px] bg-accent/30 group-hover:bg-accent">
                            <span className="font-mono font-bold text-[14px] text-foreground">{player.app}</span>
                          </td>
                        )}
                        {(currentTab !== 'database' || visibleStats.has('gls')) && (
                          <td className="px-2 py-3 text-center w-[60px]">
                            <span className={`font-mono font-bold text-[14px] ${player.goals >= 8 ? 'text-foreground' : 'text-foreground'}`}>{player.goals}</span>
                          </td>
                        )}
                        {(currentTab !== 'database' || visibleStats.has('pen')) && (
                          <td className="px-2 py-3 text-center w-[60px] bg-accent/30 group-hover:bg-accent">
                            <span className="font-mono text-[14px] text-muted-foreground">{player.pens}</span>
                          </td>
                        )}
                        {/* Ast — vertical divider after (Game Stats group end) */}
                        {(currentTab !== 'database' || visibleStats.has('ast')) && (
                          <td className="px-2 py-3 text-center w-[60px] border-r-2 border-border">
                            <span className="font-mono text-[14px] text-foreground">{player.ass}</span>
                          </td>
                        )}

                        {extraCols.map(c => (
                          <td key={c.id} className="px-2 py-3 text-center w-[64px]">
                            <span className={`text-[12px] font-medium text-foreground whitespace-nowrap ${c.mono ? 'font-mono' : 'font-body'}`}>{c.value(player, 0)}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showTop && (
        <button onClick={() => scrollBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg font-body font-bold text-[13px] hover:bg-primary/90 transition-colors">
          <ArrowUp size={14} /> Top
        </button>
      )}
    </div>
  );
};

// ─── Target List Super-Table ──────────────────────────────────────────────────────
const TargetSuperTable = ({
  players, archivedSet, archiveView, currentTab, flagMap,
  openDropdownId, setOpenDropdownId, onArchive, onRestore, onSendBackward,
  targetDataMap, onUpdateTarget,
  openNotesId, setOpenNotesId, profileTypes,
  onOpenVideos, extraCols = [], highlightId = null,
}: {
  players: ExtPlayer[]; archivedSet: Set<string>; archiveView: ArchiveView;
  flagMap: Record<string, string>;
  openDropdownId: string | null; setOpenDropdownId: (id: string | null) => void;
  onArchive: (id: string) => void; onRestore?: (id: string) => void;
  onSendBackward?: (id: string) => void;
  targetDataMap: Map<string, TargetData>;
  onUpdateTarget: (id: string, field: keyof TargetData, value: string) => void;
  openNotesId: string | null; setOpenNotesId: (id: string | null) => void;
  profileTypes?: ProfileType[];
  onOpenVideos?: (player: ExtPlayer) => void;
  extraCols?: PlayerColumn[];
  highlightId?: string | null;
}) => {
  const navigate = useNavigate();
  const displayPlayers = useMemo(() => {
    if (archiveView === 'audit') return players.filter(p => archivedSet.has(p.id));
    return [...players.filter(p => !archivedSet.has(p.id)), ...players.filter(p => archivedSet.has(p.id))];
  }, [players, archivedSet, archiveView]);

  const getTD = (id: string): TargetData => targetDataMap.get(id) || DEFAULT_TARGET;
  const upd = (id: string, field: keyof TargetData) => (v: string) => onUpdateTarget(id, field, v);
  const profileColor = (name: string) => profileTypes?.find(p => p.name === name)?.color || '#1E88E5';
  const TOTAL_COLS = 23 + extraCols.length;

  const grouped = useMemo(() => {
    const result: { pos: string; yob: number; players: ExtPlayer[] }[] = [];
    for (const pos of POS_ORDER) {
      const posPlayers = displayPlayers.filter(p => p.pos === pos);
      if (!posPlayers.length) continue;
      const yobMap = new Map<number, ExtPlayer[]>();
      for (const p of posPlayers) { if (!yobMap.has(p.yob)) yobMap.set(p.yob, []); yobMap.get(p.yob)!.push(p); }
      [...yobMap.keys()].sort((a, b) => b - a).forEach(yob => {
        // Sort by rank within yob group — ranked (1,2,3...) first, unranked last
        const sorted = [...yobMap.get(yob)!].sort((a, b) => {
          const ra = parseInt(targetDataMap.get(a.id)?.rank || '99', 10);
          const rb = parseInt(targetDataMap.get(b.id)?.rank || '99', 10);
          return ra - rb;
        });
        result.push({ pos, yob, players: sorted });
      });
    }
    return result;
  }, [displayPlayers, targetDataMap]);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;
    const onScroll = () => setShowTop(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [displayPlayers.length]);

  const ColHd = ({ label, cls = '' }: { label: string; cls?: string }) => (
    <th className={`px-2 py-2 font-heading font-bold text-[12px] text-chalk uppercase tracking-widest text-center whitespace-nowrap ${cls}`}>{label}</th>
  );
  const GrpHd = ({ label, span, amber = false }: { label: string; span: number; amber?: boolean }) => (
    <th colSpan={span} className={`px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-center border-b border-white/10 ${amber ? 'text-foreground' : 'text-chalk/50'}`}>{label}</th>
  );

  if (displayPlayers.length === 0) return (
    <div className="bg-card rounded-[20px] border border-border flex flex-col items-center justify-center py-16 w-full">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3"><Archive size={16} className="text-muted-foreground" /></div>
      <div className="font-heading font-semibold text-[16px] text-foreground mt-4">No target players yet</div>
      <p className="font-body text-[12px] font-medium text-muted-foreground">Send players forward from the Short List to begin tracking.</p>
    </div>
  );

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div ref={scrollBoxRef} id="tl-scroll-box" className="overflow-auto w-full flex-1 min-h-0 hide-scrollbar rounded-b-[24px]">
        <table className="rtable w-full text-left whitespace-nowrap border-separate border-spacing-0">
          <thead className="sticky top-0 z-30">
            {/* Group header row — dark, matches Short List */}
            <tr className="bg-primary">
              <th colSpan={2} className="sticky left-0 z-40 bg-primary border-b border-white/15" />
              <th colSpan={3} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Player Info" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={1} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">Status</th>
              <th colSpan={2} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Lead" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={4} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Grades" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={4} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Video Links" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={4} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Match Data" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={3} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Financials" onRename={()=>{}} onRemove={()=>{}} /></th>
              {extraCols.length > 0 && (
                <th colSpan={extraCols.length} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">Custom</th>
              )}
            </tr>
            {/* Sub-header row — light, matches Short List */}
            <tr className="bg-card border-b-2 border-border">
              {/* Action — first sticky col */}
              <th className="sticky left-0 z-40 bg-card px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[76px]"><EditableColHeaderLight label="Act" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Player */}
              <th className="sticky left-[76px] z-40 bg-card pl-2 pr-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[180px] border-r-2 border-border"><EditableColHeaderLight label="Player" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* DOB / POS / Team */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[80px] border-l border-border">DOB</th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[48px]">POS</th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[110px]">Team</th>
              {/* Status — N&T + F/H + video popup */}
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[120px] border-l border-border">Status</th>
              {/* Lead */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[70px] border-l border-border"><EditableColHeaderLight label="Profile" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[60px]"><EditableColHeaderLight label="Lead" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Grades */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[36px] border-l border-border"><EditableColHeaderLight label="RPT" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px]"><EditableColHeaderLight label="PLR" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px]"><EditableColHeaderLight label="POR" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px]"><EditableColHeaderLight label="NXT" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Video Links */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px] border-l border-border"><EditableColHeaderLight label="HL1" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="HL2" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="FM1" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="FM2" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Match Data */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px] border-l border-border"><EditableColHeaderLight label="Ssn" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[50px]"><EditableColHeaderLight label="Comp" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[36px]"><EditableColHeaderLight label="Gls" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[36px]"><EditableColHeaderLight label="Ast" onRename={()=>{}} onRemove={()=>{}} /></th>
              {/* Financials */}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[56px] border-l border-border"><EditableColHeaderLight label="Cost" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[56px]"><EditableColHeaderLight label="Fee" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[36px]"><EditableColHeaderLight label="%" onRename={()=>{}} onRemove={()=>{}} /></th>
              {extraCols.map(c => (
                <th key={c.id} className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[64px] whitespace-nowrap border-l border-border">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ pos, yob, players: grpPlayers, isArchiveGroup }) => {
              const allPosPlayers = isArchiveGroup ? grpPlayers : displayPlayers.filter(p => !archivedSet.has(p.id) && p.pos === pos);
              const isFirstYob = isArchiveGroup ? true : grouped.findIndex(g => g.pos === pos) === grouped.findIndex(g => g.pos === pos && g.yob === yob);
              return (
                <React.Fragment key={isArchiveGroup ? '__archived__' : `${pos}-${yob}`}>
                  {isArchiveGroup ? (
                    <tr className="bg-muted-foreground/80">
                      <td colSpan={TOTAL_COLS} className="py-2 px-4 text-center">
                        <span className="font-heading font-bold text-[10px] tracking-widest uppercase text-chalk">Archived — Not Visible to Scouts · {grpPlayers.length}</span>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {isFirstYob && <PosHeader pos={pos} count={allPosPlayers.length} colSpan={TOTAL_COLS} />}
                      <YobHeader yob={yob} colSpan={TOTAL_COLS} />
                    </>
                  )}
                  {grpPlayers.map(player => {
                    const isArchived = archivedSet.has(player.id);
                    const td = getTD(player.id);
                    const natCode = flagMap[player.nationality] || 'un';
                    const tItems = buildActionItems('target-list',
                      () => {}, () => onSendBackward ? onSendBackward(player.id) : {}, () => onArchive(player.id),
                      onRestore ? () => onRestore(player.id) : undefined, isArchived);
                    const EC = ({ field, opts, type = 'text', ph = '' }: { field: keyof TargetData; opts?: string[]; type?: string; ph?: string }) => (
                      <td className="px-1 py-2 border-b border-border text-center">
                        <TCell value={(td as any)[field]} onChange={upd(player.id, field)} opts={opts} type={type} placeholder={ph} />
                      </td>
                    );
                    // Styled dropdown cell (matches Short List CellSelect); tint=true → muted profile pill
                    const ECSel = ({ field, opts, tint = false }: { field: keyof TargetData; opts: string[]; tint?: boolean }) => (
                      <td className="px-1 py-2 border-b border-border text-center">
                        <CellSelect value={(td as any)[field] || ''} options={opts} menuWidth={tint ? 140 : 88}
                          onChange={upd(player.id, field)}
                          renderValue={tint
                            ? (v => v ? <span style={tintStyle(profileColor(v))} className="inline-block border font-body text-[10px] font-black px-2 py-0.5 rounded-full">{v}</span> : <span className="font-body text-[12px] font-bold text-muted-foreground">–</span>)
                            : (v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>)} />
                      </td>
                    );
                    return (
                      <tr key={player.id} id={`row-${player.id}`} className={`border-b border-border last:border-0 group transition-colors ${isArchived ? 'opacity-50' : 'hover:bg-accent'}${highlightId === player.id ? ' ring-2 ring-primary ring-inset bg-primary/5' : ''}`}>
                        {/* Action — first column */}
                        <td className="sticky left-0 z-20 bg-card group-hover:bg-accent px-1 py-2 w-[76px] text-center">
                          <ActionButtons items={tItems} />
                        </td>
                        {/* Player */}
                        <td className="sticky left-[76px] z-20 bg-card group-hover:bg-accent pl-2 pr-1 py-2 border-r-2 border-border">
                          <div className="flex items-center gap-2 min-w-[160px]">
                            <div className="w-8 h-8 rounded-xl bg-card text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">{player.initials}</div>
                            <div className="flex flex-col min-w-0">
                              <span onClick={() => navigate(`${window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : window.location.pathname.startsWith('/senior-scout') ? '/senior-scout' : ''}/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, preferredFoot: player.foot, height: player.height, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }, { label: ((typeof currentTab !== 'undefined' ? ({ 'database': 'Database', 'long-list': 'Long List', 'short-list': 'Short List', 'target-list': 'Target List', 'signed-list': 'Signed List' } as any)[currentTab] : null) || 'Database'), path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }] } })} className="font-body font-bold text-primary text-[14px] leading-tight truncate max-w-[130px] hover:underline cursor-pointer">{player.name}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-body text-[12px] text-muted-foreground">{player.age}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${player.scouted ? 'bg-[#3A8C6A]' : 'bg-[#E05C4B]'}`} />
                                <FlagBadge code={natCode} label={player.nationality} />
                                {isArchived && <span className="bg-muted-foreground/15 text-muted-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shrink-0">Archived</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-1 py-2 border-b border-border text-center w-[80px]"><span className="font-body text-[12px] text-muted-foreground">{player.dob}</span></td>
                        <td className="px-1 py-2 border-b border-border text-center w-[48px]"><span className="font-body text-[12px] font-bold text-muted-foreground">{player.posAcronym}</span></td>
                        <td className="px-1 py-2 border-b border-border text-center w-[110px]"><span className="font-body text-[12px] text-muted-foreground truncate block max-w-[100px]">{player.team}</span></td>
                        {/* Status — N&T, F/H video counts, video popup */}
                        <td className="px-2 py-2 border-b border-border border-l border-border text-center w-[120px]">
                          {openNotesId === player.id && <NotesTasksPopup playerId={player.id} playerName={player.name} onClose={() => setOpenNotesId(null)} />}
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setOpenNotesId(player.id)} title="Notes & Tasks" className="w-6 h-6 rounded-lg bg-accent hover:bg-primary/80 hover:text-primary-foreground text-foreground flex items-center justify-center transition-all shrink-0"><StickyNote size={11} /></button>
                            {player.matchVideos > 0 && <span className="bg-primary/20 text-foreground font-body font-bold px-1 py-0.5 rounded text-[10px] shrink-0">F{player.matchVideos}</span>}
                            {player.highlightVideos > 0 && <span className="bg-primary/10 text-foreground font-body font-bold px-1 py-0.5 rounded text-[10px] shrink-0">H{player.highlightVideos}</span>}
                            <button onClick={() => onOpenVideos?.(player)} title="Watch videos" className="w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-chalk flex items-center justify-center transition-colors shrink-0"><Play size={11} className="ml-0.5" /></button>
                          </div>
                        </td>
                        <ECSel field="profile" opts={['', ...(profileTypes?.map((pt:any)=>pt.name) || ['Performance','Prospect','Wonderkid'])]} tint />
                        <ECSel field="lead" opts={['', 'Tom', 'Mbugua', 'Brice', 'Nene', 'All']} />
                        <ECSel field="rpt" opts={['', '1','2','3']} />
                        <ECSel field="plr" opts={GRADE_OPTS} />
                        <ECSel field="por" opts={GRADE_OPTS} />
                        <ECSel field="nxt" opts={NXT_OPTS} />
                        {/* Video links — underlined Link text */}
                        <td className="px-1 py-2 border-b border-border border-l border-border text-center w-[56px]">
                          {td.h1
                            ? <a href={td.h1} className="font-body text-[12px] font-bold text-foreground underline">Link</a>
                            : <TCell value={(td as any).h1} onChange={upd(player.id, 'h1')} placeholder="url" />}
                        </td>
                        <td className="px-1 py-2 border-b border-border text-center w-[56px]">
                          {td.h2 
                            ? <a href={td.h2} className="font-body text-[12px] font-bold text-foreground underline">Link</a>
                            : <TCell value={(td as any).h2} onChange={upd(player.id, 'h2')} placeholder="url" />}
                        </td>
                        <td className="px-1 py-2 border-b border-border text-center w-[56px]">
                          {td.fm1 
                            ? <a href={td.fm1} className="font-body text-[12px] font-bold text-foreground underline">Link</a>
                            : <TCell value={(td as any).fm1} onChange={upd(player.id, 'fm1')} placeholder="url" />}
                        </td>
                        <td className="px-1 py-2 border-b border-border text-center w-[56px]">
                          {td.fm2 
                            ? <a href={td.fm2} className="font-body text-[12px] font-bold text-foreground underline">Link</a>
                            : <TCell value={(td as any).fm2} onChange={upd(player.id, 'fm2')} placeholder="url" />}
                        </td>
                        <EC field="season" ph="24/25" /><EC field="comp" ph="Comp" />
                        <td className="px-1 py-2 border-b border-border text-center"><span className="font-mono font-bold text-[14px] text-foreground">{player.goals}</span></td>
                        <td className="px-1 py-2 border-b border-border text-center"><span className="font-mono text-[14px] text-foreground">{player.ass}</span></td>
                        <EC field="cost" ph="€0" /><EC field="fee" ph="€0" /><EC field="pct" ph="%" />
                        {extraCols.map(c => (
                          <td key={c.id} className="px-2 py-2 border-b border-border text-center w-[64px] border-l border-border">
                            <span className={`font-body text-[12px] font-medium text-foreground whitespace-nowrap ${c.mono ? 'font-mono' : ''}`}>{c.value(player, 0)}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {archiveView === 'active' && displayPlayers.some(p => archivedSet.has(p.id)) && (
        <div className="px-4 py-2 bg-accent border-t border-border flex items-center gap-2">
          <Archive size={10} className="text-muted-foreground" />
          <span className="font-body text-[12px] font-bold text-muted-foreground">{displayPlayers.filter(p => archivedSet.has(p.id)).length} archived</span>
        </div>
      )}
      {showTop && (
        <button onClick={() => scrollBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg font-body font-bold text-[14px] hover:bg-primary/90 transition-colors">
          <ArrowUp size={14} /> Top
        </button>
      )}
    </div>
  );
};

// ─── Short List Table ────────────────────────────────────────────────────────────
// Per Image 4: Name, YR, G, DOB, Pos, Team, Nation, Profile, Pathway,
// Video Scouting (PLG/POG/NXT) per Nene/Mbugua/Tom, HL, PK, NO, FM1-3, Monitor
interface ShortScoutData {
  [scoutKey: string]: { plg: string; pog: string; nxt: string; };
}

const SCOUT_COLS = [
  { key: 'nene',   label: 'Nene'   },
  { key: 'mbugua', label: 'Mbugua' },
  { key: 'tom',    label: 'Tom'    },
];

const ShortListTable = ({
  players, archivedSet, archiveView, currentTab, flagMap,
  openDropdownId, setOpenDropdownId,
  onSendForward, onSendBackward, onArchive, onRestore,
  profileTypes,
  openNotesId, setOpenNotesId, raisedPlayerIds,
  onOpenVideos, highlightId = null,
}: {
  players: ExtPlayer[]; archivedSet: Set<string>; archiveView: ArchiveView;
  flagMap: Record<string, string>;
  openDropdownId: string | null; setOpenDropdownId: (id: string | null) => void;
  onSendForward: (id: string) => void; onSendBackward?: (id: string) => void; onArchive: (id: string) => void; onRestore: (id: string) => void;
  profileTypes: ProfileType[];
  openNotesId: string | null; setOpenNotesId: (id: string | null) => void;
  raisedPlayerIds?: Set<string>;
  onOpenVideos?: (player: ExtPlayer) => void;
  highlightId?: string | null;
}) => {
  const navigate = useNavigate();
  // Seed realistic scout data so Monitor/Target tags fire
  const buildSeedScoutData = () => {
    const m = new Map<string, ShortScoutData>();
    SL_PLAYERS.forEach((p, i) => {
      // Pattern: 0-6=Target(2+T), 7-13=Monitor(2+M), 14-20=Mixed(1T), 21+=nothing
      if (i < 7) {
        m.set(p.id, { nene: { plg:'A', pog:'B', nxt:'T' }, mbugua: { plg:'A', pog:'A', nxt:'T' }, tom: { plg:'B', pog:'B', nxt:'M' } });
      } else if (i < 14) {
        m.set(p.id, { nene: { plg:'B', pog:'B', nxt:'M' }, mbugua: { plg:'B', pog:'C', nxt:'M' }, tom: { plg:'C', pog:'B', nxt:'D' } });
      } else if (i < 21) {
        m.set(p.id, { nene: { plg:'B', pog:'B', nxt:'T' }, mbugua: { plg:'', pog:'', nxt:'' }, tom: { plg:'', pog:'', nxt:'' } });
      }
      // rest have no data — scouts haven't filed yet
    });
    return m;
  };
  const [scoutData, setScoutData] = useState<Map<string, ShortScoutData>>(() => buildSeedScoutData());
  const [pathwayMap, setPathwayMap] = useState<Map<string, string>>(new Map());
  // Seed video links so "Link" text appears by default
  const buildSeedVideoFields = () => {
    const m = new Map<string, any>();
    SL_PLAYERS.forEach((p, i) => {
      m.set(p.id, {
        fm1: i < 30 ? 'https://example.com/fm1' : '',
        fm2: i < 20 ? 'https://example.com/fm2' : '',
        fm3: i < 10 ? 'https://example.com/fm3' : '',
        pk1: i < 25 ? 'https://example.com/pk1' : '',
        pk2: i < 15 ? 'https://example.com/pk2' : '',
        pk3: i < 8  ? 'https://example.com/pk3' : '',
        hl1: i < 20 ? 'https://example.com/hl1' : '',
        hl2: i < 12 ? 'https://example.com/hl2' : '',
      });
    });
    return m;
  };
  const [videoFields, setVideoFields] = useState<Map<string, any>>(() => buildSeedVideoFields());
  // Rank (1/2/3) — muted priority tier, seeded so the column isn't empty
  const [rankMap, setRankMap] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    SL_PLAYERS.forEach((p, i) => { if (i < 12) m.set(p.id, String((i % 3) + 1)); });
    return m;
  });
  // Profile — editable per player; any legacy 'Journeyman' coerced to Prospect
  const PROFILE_OPTS = ['Performance', 'Prospect', 'Wonderkid'];
  const [profileMap, setProfileMap] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>();
    SL_PLAYERS.forEach(p => m.set(p.id, ((p as any).profile === 'Journeyman' ? 'Prospect' : (p as any).profile) || 'Prospect'));
    return m;
  });
  const profileColor = (name: string) => profileTypes?.find(p => p.name === name)?.color || '#1E88E5';

  const getSD = (id: string, scout: string) => scoutData.get(id)?.[scout] || { plg:'', pog:'', nxt:'' };
  const updSD = (id: string, scout: string, field: 'plg'|'pog'|'nxt', val: string) => {
    setScoutData(prev => {
      const n = new Map(prev);
      const row = { ...(n.get(id) || {}) };
      row[scout] = { ...getSD(id, scout), [field]: val };
      n.set(id, row);
      return n;
    });
  };
  const getVF = (id: string) => videoFields.get(id) || { fm1:'', fm2:'', fm3:'', pk1:'', pk2:'', pk3:'', hl1:'', hl2:'' };
  const updVF = (id: string, field: string, val: string) => {
    setVideoFields(prev => { const n = new Map(prev); n.set(id, { ...getVF(id), [field]: val }); return n; });
  };

  const displayPlayers = useMemo(() => {
    if (archiveView === 'audit') return players.filter(p => archivedSet.has(p.id));
    return [...players.filter(p => !archivedSet.has(p.id)), ...players.filter(p => archivedSet.has(p.id))];
  }, [players, archivedSet, archiveView]);

  const grouped = useMemo(() => {
    const result: { pos: string; yob: number; players: ExtPlayer[]; isArchiveGroup?: boolean }[] = [];
    const active = archiveView === 'audit' ? displayPlayers : displayPlayers.filter(p => !archivedSet.has(p.id));
    for (const pos of POS_ORDER) {
      const posPlayers = active.filter(p => p.pos === pos);
      if (!posPlayers.length) continue;
      const yobMap = new Map<number, ExtPlayer[]>();
      for (const p of posPlayers) { if (!yobMap.has(p.yob)) yobMap.set(p.yob, []); yobMap.get(p.yob)!.push(p); }
      [...yobMap.keys()].sort((a, b) => b - a).forEach(yob => result.push({ pos, yob, players: yobMap.get(yob)! }));
    }
    if (archiveView === 'active') {
      const archived = displayPlayers.filter(p => archivedSet.has(p.id));
      if (archived.length > 0) result.push({ pos: '— Archived —', yob: 0, players: archived, isArchiveGroup: true });
    }
    return result;
  }, [displayPlayers, archivedSet, archiveView]);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const el = scrollBoxRef.current;
    if (!el) return;
    const onScroll = () => setShowTop(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [displayPlayers.length]);

  // Action(1) + Rank(1) + Player(1) + DOB,Pos,Team,Profile,Pathway(5) + Status(1) + 3 scouts × 3 (9) + 8 videos = 26
  const TOTAL_COLS = 26;

  const GradeOpts = GRADE_OPTS;
  const NxtOpts   = NXT_OPTS;

  const CI = ({ val, onChange, opts, ph='', chevron=false }: {val:string; onChange:(v:string)=>void; opts?:string[]; ph?:string; chevron?:boolean}) => (
    opts ? (
      <div className="relative inline-flex items-center w-full">
        <select value={val} onChange={e=>onChange(e.target.value)}
          className={`w-full bg-transparent font-body text-[12px] font-bold text-foreground focus:outline-none appearance-none text-center cursor-pointer ${chevron ? 'pr-4' : ''}`}>
          {opts.map(o=><option key={o} value={o}>{o||'–'}</option>)}
        </select>
        {chevron && <ChevronDown size={10} className="absolute right-0 text-muted-foreground pointer-events-none" />}
      </div>
    ) : (
      <input value={val} onChange={e=>onChange(e.target.value)} placeholder={ph}
        className="w-full bg-transparent font-body text-[12px] font-bold text-foreground focus:outline-none placeholder:text-muted-foreground text-center" />
    )
  );

  if (displayPlayers.length === 0) return (
    <div className="bg-card rounded-[20px] border border-border flex flex-col items-center justify-center py-16">
      <Archive size={16} className="text-muted-foreground mb-3" />
      <div className="font-heading font-semibold text-[16px] text-foreground mt-2">No short-listed players yet</div>
      <p className="font-body text-[12px] text-muted-foreground font-medium">Send players forward from the Long List.</p>
    </div>
  );

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div ref={scrollBoxRef} id="sl-scroll-box" className="overflow-auto w-full flex-1 min-h-0 hide-scrollbar rounded-b-[24px]">
        <table className="rtable w-full text-left whitespace-nowrap border-separate border-spacing-0">
          <thead className="sticky top-0 z-30">
            {/* Group header row */}
            <tr className="bg-primary">
              <th colSpan={3} className="sticky left-0 z-40 bg-primary px-3 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15">Player ID</th>
              <th colSpan={5} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Player Info" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th colSpan={1} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">Status</th>
              {SCOUT_COLS.map(s => (
                <th key={s.key} colSpan={3} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">{s.label}</th>
              ))}
              <th colSpan={8} className="px-2 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15"><EditableColHeaderLight label="Video Codes" onRename={()=>{}} onRemove={()=>{}} /></th>
            </tr>
            {/* Sub-header row */}
            <tr className="bg-card border-b-2 border-border">
              <th className="sticky left-0 z-40 bg-card px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[108px]"></th>
              <th className="sticky left-[108px] z-40 bg-card px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center min-w-[56px] w-[56px]"><EditableColHeaderLight label="Rank" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="sticky left-[164px] z-40 bg-card px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[190px] border-r-2 border-border"><EditableColHeaderLight label="Player" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[80px]"><EditableColHeaderLight label="DOB" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="Pos" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[110px]"><EditableColHeaderLight label="Team" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[110px] border-r border-border"><EditableColHeaderLight label="Profile" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest w-[64px] border-r-2 border-border"><EditableColHeaderLight label="Pathway" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-2 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[130px] border-r-2 border-border">Status</th>
              {SCOUT_COLS.map(s => (
                <React.Fragment key={s.key}>
                  <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px] border-l border-border"><EditableColHeaderLight label="PLG" onRename={()=>{}} onRemove={()=>{}} /></th>
                  <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px]"><EditableColHeaderLight label="POG" onRename={()=>{}} onRemove={()=>{}} /></th>
                  <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[40px] border-r border-border"><EditableColHeaderLight label="NXT" onRename={()=>{}} onRemove={()=>{}} /></th>
                </React.Fragment>
              ))}
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px] border-l-2 border-border"><EditableColHeaderLight label="FM1" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="FM2" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="FM3" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px] border-l border-border"><EditableColHeaderLight label="PK1" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="PK2" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="PK3" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px] border-l border-border"><EditableColHeaderLight label="HL1" onRename={()=>{}} onRemove={()=>{}} /></th>
              <th className="px-1 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[32px]"><EditableColHeaderLight label="HL2" onRename={()=>{}} onRemove={()=>{}} /></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ pos, yob, players: grpPlayers, isArchiveGroup }) => {
              const allPosPlayers = isArchiveGroup ? grpPlayers : displayPlayers.filter(p => !archivedSet.has(p.id) && p.pos === pos);
              const isFirstYob = isArchiveGroup ? true : grouped.findIndex(g => g.pos === pos) === grouped.findIndex(g => g.pos === pos && g.yob === yob);
              return (
                <React.Fragment key={isArchiveGroup ? '__archived__' : `${pos}-${yob}`}>
                  {isArchiveGroup ? (
                    <tr className="bg-muted-foreground/80">
                      <td colSpan={TOTAL_COLS} className="py-2 px-4 text-center">
                        <span className="font-heading font-bold text-[10px] tracking-widest uppercase text-chalk">Archived — Not Visible to Scouts · {grpPlayers.length}</span>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {isFirstYob && <PosHeader pos={pos} count={allPosPlayers.length} colSpan={TOTAL_COLS} />}
                      <YobHeader yob={yob} colSpan={TOTAL_COLS} />
                    </>
                  )}
                  {grpPlayers.map(player => {
                    const isArchived = archivedSet.has(player.id);
                    const natCode = flagMap[player.nationality] || 'un';
                    const vf = getVF(player.id);
                    const slItems = buildActionItems('short-list',
                      () => onSendForward(player.id), () => onSendBackward ? onSendBackward(player.id) : {},
                      () => onArchive(player.id), () => onRestore(player.id), isArchived);
                    const isMonitor = player.monitor && !isArchived;
                    return (
                      <tr key={player.id} id={`row-${player.id}`}
                        className={`border-b border-border last:border-0 group transition-colors ${isArchived ? 'opacity-50' : isMonitor ? 'border-l-4 border-l-[#E8A838] hover:bg-accent' : 'hover:bg-accent'}${highlightId === player.id ? ' ring-2 ring-primary ring-inset bg-primary/5' : ''}`}>
                        {/* Action */}
                        <td className="sticky left-0 z-20 bg-card group-hover:bg-inherit px-1 py-2 w-[108px] text-center">
                          <ActionButtons items={slItems} />
                        </td>
                        {/* Rank — muted 1/2/3, height matches the action pill */}
                        <td className="sticky left-[108px] z-20 bg-card group-hover:bg-inherit px-1 py-2 min-w-[56px] w-[56px] text-center">
                          <CellSelect value={rankMap.get(player.id) || ''} options={['', '1', '2', '3']} menuWidth={96}
                            onChange={v => setRankMap(prev => { const n = new Map(prev); n.set(player.id, v); return n; })}
                            triggerClass="h-8 mx-auto"
                            renderValue={v => v
                              ? <span style={tintStyle(RANK_TINT[v])} className="inline-flex items-center justify-center w-6 h-6 rounded-full border font-body text-[10px] font-black">{v}</span>
                              : <span className="font-body text-[12px] font-bold text-muted-foreground">–</span>} />
                        </td>
                        {/* Player name + monitor pill */}
                        <td className="sticky left-[164px] z-20 bg-card group-hover:bg-inherit px-2 py-2 border-r-2 border-border w-[190px]">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-card text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">{player.initials}</div>
                            <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span onClick={() => navigate(`${window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : window.location.pathname.startsWith('/senior-scout') ? '/senior-scout' : ''}/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, preferredFoot: player.foot, height: player.height, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }, { label: ((typeof currentTab !== 'undefined' ? ({ 'database': 'Database', 'long-list': 'Long List', 'short-list': 'Short List', 'target-list': 'Target List', 'signed-list': 'Signed List' } as any)[currentTab] : null) || 'Database'), path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }] } })} className="font-body font-bold text-primary text-[14px] leading-tight whitespace-nowrap hover:underline cursor-pointer">{player.name}</span>
                              {isArchived && <span className="bg-muted-foreground/15 text-muted-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded shrink-0">Archived</span>}
                              {(() => {
                                const nxtVals = Object.values(scoutData.get(player.id) || {});
                                const tCount = nxtVals.filter((sd:any) => sd?.nxt === 'T').length;
                                const mCount = nxtVals.filter((sd:any) => sd?.nxt === 'M').length;
                                if (tCount >= 2) return <span className="shrink-0 font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-foreground border border-primary/20">Target</span>;
                                if (mCount >= 2) return <span className="shrink-0 font-body text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8A838]/15 text-[#E8A838] border border-[#E8A838]/30">Monitor</span>;
                                return null;
                              })()}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${player.scouted ? 'bg-[#3A8C6A]' : 'bg-[#E05C4B]'}`} />
                              <FlagBadge code={natCode} label={player.nationality} />
                            </div>
                          </div>
                          </div>
                        </td>
                        {/* DOB */}
                        <td className="px-1 py-2 text-center w-[80px]">
                          <span className="font-body text-[12px] text-muted-foreground">{player.dob}</span>
                        </td>
                        {/* Pos */}
                        <td className="px-1 py-2 text-center w-[32px]">
                          <span className="font-body text-[12px] font-bold text-muted-foreground">{player.posAcronym}</span>
                        </td>
                        {/* Team */}
                        <td className="px-2 py-2 w-[110px]">
                          <span className="font-body text-[12px] font-medium text-muted-foreground truncate block max-w-[100px]">{player.team}</span>
                        </td>
                        {/* Profile — editable dropdown, muted tint pill */}
                        <td className="px-1 py-2 w-[110px] border-r border-border">
                          {(() => {
                            const pv = profileMap.get(player.id) || ((player.profile as any) === 'Journeyman' ? 'Prospect' : player.profile) || 'Prospect';
                            return (
                              <CellSelect value={pv} options={PROFILE_OPTS} menuWidth={140}
                                onChange={v => setProfileMap(prev => { const n = new Map(prev); n.set(player.id, v); return n; })}
                                renderValue={val => <span style={tintStyle(profileColor(val))} className="inline-block border font-body text-[10px] font-black px-2 py-0.5 rounded-full">{val}</span>} />
                            );
                          })()}
                        </td>
                        {/* Pathway */}
                        <td className="px-1 py-2 w-[64px] border-r-2 border-border">
                          <CellSelect value={pathwayMap.get(player.id) || ''} options={PATHWAY_OPTS} menuWidth={120}
                            onChange={v => setPathwayMap(prev => { const n = new Map(prev); n.set(player.id, v); return n; })}
                            renderValue={v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>} />
                        </td>
                        {/* Status — N&T, F/H video counts, video popup */}
                        <td className="px-2 py-2 border-r-2 border-border w-[130px]">
                          {openNotesId === player.id && <NotesTasksPopup playerId={player.id} playerName={player.name} onClose={() => setOpenNotesId(null)} />}
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setOpenNotesId(player.id)} title="Notes & Tasks" className="w-6 h-6 rounded-lg bg-accent hover:bg-primary/80 hover:text-primary-foreground text-foreground flex items-center justify-center transition-all shrink-0"><StickyNote size={11} /></button>
                            {player.matchVideos > 0 && <span className="bg-primary/20 text-foreground font-body font-bold px-1 py-0.5 rounded text-[10px] shrink-0">F{player.matchVideos}</span>}
                            {player.highlightVideos > 0 && <span className="bg-primary/10 text-foreground font-body font-bold px-1 py-0.5 rounded text-[10px] shrink-0">H{player.highlightVideos}</span>}
                            <button onClick={() => onOpenVideos?.(player)} title="Watch videos" className="w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-chalk flex items-center justify-center transition-colors shrink-0"><Play size={11} className="ml-0.5" /></button>
                          </div>
                        </td>
                        {/* Scout columns: PLG / POG / NXT each */}
                        {SCOUT_COLS.map(s => {
                          const sd = getSD(player.id, s.key);
                          const gcell = (val: string, field: 'plg'|'pog'|'nxt', opts: string[]) => (
                            <CellSelect value={val} options={opts} menuWidth={72}
                              onChange={v=>updSD(player.id,s.key,field,v)}
                              renderValue={x => <span className="font-body text-[12px] font-bold text-foreground">{x || '–'}</span>} />
                          );
                          return (
                            <React.Fragment key={s.key}>
                              <td className="px-1 py-2 text-center w-[40px] border-l border-border">{gcell(sd.plg,'plg',GradeOpts)}</td>
                              <td className="px-1 py-2 text-center w-[40px]">{gcell(sd.pog,'pog',GradeOpts)}</td>
                              <td className="px-1 py-2 text-center w-[40px] border-r border-border">{gcell(sd.nxt,'nxt',NxtOpts)}</td>
                            </React.Fragment>
                          );
                        })}
                        {/* Video codes — 8 columns */}
                        {[['fm1','FM1','border-l-2 border-border'],['fm2','FM2',''],['fm3','FM3',''],
                          ['pk1','PK1','border-l border-border'],['pk2','PK2',''],['pk3','PK3',''],
                          ['hl1','HL1','border-l border-border'],['hl2','HL2','']].map(([field, label, cls]) => (
                          <td key={field} className={`px-1 py-2 text-center w-[32px] ${cls}`}>
                            {(vf as any)[field]
                              ? <a href={(vf as any)[field]} className="font-body text-[12px] font-bold text-foreground underline">Link</a>
                              : <CI val="" onChange={v=>updVF(player.id, field, v)} ph="url" />}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showTop && (
        <button onClick={() => scrollBoxRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-lg font-body font-bold text-[14px] hover:bg-primary/90 transition-colors">
          <ArrowUp size={14} /> Top
        </button>
      )}
    </div>
  );
};

// ─── Card View ────────────────────────────────────────────────────────────────────

// Remove the local CardView definition completely


// ─── Inline Select — plain text until clicked ────────────────────────────────
const InlineSelect = ({ value, opts, onChange, colorMap }: {
  value: string; opts: string[];
  onChange: (v: string) => void;
  colorMap?: Record<string, string>;
}) => {
  const [editing, setEditing] = React.useState(false);
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  const color = colorMap?.[value];
  if (editing) return (
    <select ref={ref} value={value} autoFocus
      onChange={e => { onChange(e.target.value); setEditing(false); }}
      onBlur={() => setEditing(false)}
      className="bg-card border border-border rounded-lg px-2 py-0.5 font-body text-[12px] font-bold text-foreground focus:outline-none cursor-pointer">
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
  return (
    <span onClick={() => setEditing(true)} title="Click to edit"
      style={color ? { backgroundColor: color, color: '#fff' } : undefined}
      className={`inline-block font-body text-[12px] font-bold cursor-pointer hover:opacity-80 rounded px-2 py-0.5 ${!color ? 'text-foreground' : ''}`}>
      {value || '—'}
    </span>
  );
};

// ─── Signed List Tab ──────────────────────────────────────────────────────────────
interface SignedPlayer {
  id: string; name: string; club: string; pos: string; nation: string; dob: string;
  identified: string; scout: string; move: string; year: number; fee: string;
  currentValue: string; potentialValue: string; scoutSuccess: string; devSuccess: string; note: string;
}

const INITIAL_SIGNED_PLAYERS: SignedPlayer[] = [
  { id: 'sp1', name: 'Kouassi Odilon',     club: 'AC Horsens', pos: 'CM',  nation: 'CIV',    dob: '2003-02-11', identified: 'Scouted',      scout: 'Scott',  move: 'Signed',      year: 2023, fee: '$250,000',  currentValue: '$500,000',    potentialValue: '$500,000',    scoutSuccess: 'Unsuccessful', devSuccess: 'Unsuccessful', note: '' },
  { id: 'sp2', name: 'Sory Traore',         club: 'AC Horsens', pos: 'RW',  nation: 'Guinea', dob: '2004-07-23', identified: 'Social',       scout: 'Tom',    move: 'Signed',      year: 2023, fee: '$100,000',  currentValue: '$0',          potentialValue: '$250,000',    scoutSuccess: 'Unsuccessful', devSuccess: 'Unsuccessful', note: '' },
  { id: 'sp3', name: 'Tape Christ',         club: 'AC Horsens', pos: 'LB',  nation: 'CIV',    dob: '2002-11-05', identified: 'Scouted',      scout: 'Tom',    move: 'Loan',        year: 2024, fee: '$223,000',  currentValue: '$1,500,000',  potentialValue: '$2,000,000',  scoutSuccess: 'Success',      devSuccess: 'Success',      note: '' },
  { id: 'sp4', name: 'Yamirou Ouorou',      club: 'AC Horsens', pos: 'LW',  nation: 'Benin',  dob: '2005-04-18', identified: 'Scouted',      scout: 'Tom',    move: 'Signed',      year: 2024, fee: '$250,000',  currentValue: '$350,000',    potentialValue: '$4,500,000',  scoutSuccess: 'Success',      devSuccess: 'Pending',      note: '' },
  { id: 'sp5', name: 'Abdul Moro',          club: 'AC Horsens', pos: 'DM',  nation: 'Ghana',  dob: '2003-09-30', identified: 'Scouted',      scout: 'Nene',   move: 'Loan/Signed', year: 2024, fee: '$45,000',   currentValue: '$3,000,000',  potentialValue: '$4,500,000',  scoutSuccess: 'Success',      devSuccess: 'Success',      note: '' },
  { id: 'sp6', name: 'Arnold Adu',          club: 'AC Horsens', pos: 'RB',  nation: 'Ghana',  dob: '2004-01-14', identified: 'Scouted',      scout: 'Nene',   move: 'Trial/Signed',year: 2024, fee: '$80,000',   currentValue: '$0',          potentialValue: '$2,000,000',  scoutSuccess: 'Success',      devSuccess: 'Pending',      note: '' },
  { id: 'sp7', name: 'Seyi Ogunniyi',       club: 'AC Horsens', pos: 'RB',  nation: 'Nigeria',dob: '2005-06-08', identified: 'Scouted',      scout: 'Tom',    move: 'Trial/Signed',year: 2025, fee: '$135,000',  currentValue: '$200,000',    potentialValue: '$2,000,000',  scoutSuccess: 'Success',      devSuccess: 'Pending',      note: '' },
  { id: 'sp8', name: 'Abdoulaye Gouba',     club: 'AC Horsens', pos: 'CM',  nation: 'CIV',    dob: '2003-12-02', identified: 'Agent',        scout: 'Sekou',  move: 'Trial/Signed',year: 2025, fee: '$120,000',  currentValue: '$0',          potentialValue: '$4,000,000',  scoutSuccess: 'Success',      devSuccess: 'Success',      note: '' },
  { id: 'sp9', name: 'Francis Gomez',       club: 'AC Horsens', pos: 'RW',  nation: 'Gambia', dob: '2004-05-27', identified: 'Scouted',      scout: 'Buba',   move: 'Signed',      year: 2025, fee: '$40,000',   currentValue: '$100,000',    potentialValue: '$8,000,000',  scoutSuccess: 'Unsuccessful', devSuccess: 'Pending',      note: '' },
  { id: 'sp10',name: 'Emilio Sadio',        club: 'AC Horsens', pos: 'DM',  nation: 'Senegal',dob: '2002-10-19', identified: 'Scouted',      scout: 'Sall',   move: 'Signed',      year: 2026, fee: '$120,000',  currentValue: '$0',          potentialValue: '$5,000,000',  scoutSuccess: 'Pending',      devSuccess: 'Pending',      note: '' },
  { id: 'sp11',name: 'Alhassan Dedenka',    club: 'AC Horsens', pos: 'DM',  nation: 'Ghana',  dob: '2003-03-25', identified: 'Scouted',      scout: 'Nene',   move: 'Signed',      year: 2026, fee: '$210,000',  currentValue: '$0',          potentialValue: '$5,000,000',  scoutSuccess: 'Pending',      devSuccess: 'Pending',      note: '' },
];

// ─── Position grouping for Signed List ────────────────────────────────────────
const SIGNED_POS_GROUPS: Record<string, string[]> = {
  'Attackers': ['ST', 'LW', 'RW'],
  'Midfielders': ['CM', 'CAM', 'CDM', 'DM', 'AM'],
  'Defenders': ['LB', 'RB', 'CB', 'FB', 'RCB', 'LCB'],
  'Goalkeepers': ['GK'],
};

const NATION_FLAG_MAP: Record<string, string> = {
  'CIV': 'ci', 'Guinea': 'gn', 'Benin': 'bj', 'Ghana': 'gh',
  'Nigeria': 'ng', 'Gambia': 'gm', 'Senegal': 'sn', 'Cameroon': 'cm',
  'Mali': 'ml', 'Kenya': 'ke', 'Burundi': 'bi',
};

const SignedListTab = ({ extraCols = [], showAdd, setShowAdd }: {
  extraCols?: PlayerColumn[];
  showAdd: boolean;
  setShowAdd: (v: boolean) => void;
}) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<SignedPlayer[]>(INITIAL_SIGNED_PLAYERS);
  const [newPlayer, setNewPlayer] = useState<Partial<SignedPlayer>>({ move: 'Signed', year: new Date().getFullYear() });

  const handleAdd = () => {
    if (!newPlayer.name) return;
    setPlayers(prev => [...prev, {
      id: `sp${Date.now()}`, name: newPlayer.name!, club: newPlayer.club || '',
      pos: newPlayer.pos || 'ST', nation: newPlayer.nation || '', dob: newPlayer.dob || '', identified: newPlayer.identified || 'Scouted',
      scout: newPlayer.scout || '', move: newPlayer.move || 'Signed', year: newPlayer.year || new Date().getFullYear(),
      fee: newPlayer.fee || '$0', currentValue: '$0', potentialValue: '$0',
      scoutSuccess: 'Pending', devSuccess: 'Pending', note: newPlayer.note || '',
    }]);
    setShowAdd(false);
    setNewPlayer({ move: 'Signed', year: new Date().getFullYear() });
  };

  // Group players by position category
  const grouped = useMemo(() => {
    const result: { group: string; players: SignedPlayer[] }[] = [];
    for (const [group, positions] of Object.entries(SIGNED_POS_GROUPS)) {
      const grpPlayers = players.filter(p => positions.includes(p.pos));
      if (grpPlayers.length > 0) result.push({ group, players: grpPlayers });
    }
    return result;
  }, [players]);

  const STATUS_TINT: Record<string, string> = { 'Success': '#22C55E', 'Unsuccessful': '#E05C4B', 'Pending': '#E8A838' };
  const StatusPill = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <CellSelect value={value} options={['Success', 'Unsuccessful', 'Pending']} menuWidth={140} onChange={onChange}
      renderValue={v => <span style={tintStyle(STATUS_TINT[v])} className="inline-block border font-body text-[10px] font-black px-2 py-0.5 rounded-full">{v || '–'}</span>} />
  );

  const TOTAL_COLS = 14 + extraCols.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Table */}
      <div className="w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="rtable w-full whitespace-nowrap border-separate border-spacing-0">
            {/* Two-row header system matching other tables */}
            <thead className="sticky top-0 z-30">
              {/* Row 1: Group header */}
              <tr className="bg-primary">
                <th colSpan={4} className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15">
                  Player Identity
                </th>
                <th colSpan={3} className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                  Acquisition
                </th>
                <th colSpan={4} className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                  Financials
                </th>
                <th colSpan={3} className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                  Outcome
                </th>
                {extraCols.length > 0 && (
                  <th colSpan={extraCols.length} className="px-4 py-2 font-heading font-bold text-[10px] uppercase tracking-widest text-white text-center border-b border-white/15 border-l border-l-white/15">
                    Custom
                  </th>
                )}
              </tr>
              {/* Row 2: Column sub-headers */}
              <tr className="bg-card border-b-2 border-border">
                <th className="px-4 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[180px]">Name</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[90px]">DOB</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[52px]">POS</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[100px]">Team</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[80px]">Source</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[70px]">Scout</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[90px] border-r border-border/30">Move</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[52px]">Year</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-right w-[80px]">Fee</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-right w-[90px]">Current</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-right w-[90px] border-r border-border/30">Potential</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[100px]">Scout</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[100px]">Dev</th>
                <th className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-left w-[100px]">Note</th>
                {extraCols.map(c => (
                  <th key={c.id} className="px-3 py-3 font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest text-center w-[64px] whitespace-nowrap border-l border-border/30">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ group, players: grpPlayers }) => (
                <React.Fragment key={group}>
                  {/* Position group header */}
                  <tr className="bg-primary">
                    <td colSpan={TOTAL_COLS} className="py-2 px-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="font-heading font-bold text-[11px] tracking-widest uppercase text-white">{group}</span>
                        <span className="inline-flex items-center justify-center bg-white/20 rounded-full px-[6px] py-[2px] font-heading font-bold text-[10px] leading-none text-white">{grpPlayers.length}</span>
                      </span>
                    </td>
                  </tr>
                  {/* Player rows with alternating shading (reset per group) */}
                  {grpPlayers.map((p, i) => {
                    const flagCode = NATION_FLAG_MAP[p.nation] || 'un';
                    return (
                      <tr key={p.id} className={`border-b border-border/40 hover:bg-accent transition-colors ${i % 2 === 0 ? 'bg-card' : 'bg-accent/30'}`}>
                        {/* Name with initials avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-card text-foreground flex items-center justify-center font-body font-bold text-[12px] shadow-sm shrink-0 border border-border">
                              {p.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span onClick={() => navigate(`${window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout'}/player/${p.id}`, { state: { player: { id: p.id, name: p.name, initials: p.initials, age: p.age, nationality: p.nationality, primaryPos: p.pos, preferredFoot: p.foot, height: p.height, currentTeam: p.team, matchVideos: p.matchVideos, highlightVideos: p.highlightVideos }, trail: [{ label: 'Players', path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }, { label: 'Signed List', path: (window.location.pathname.startsWith('/lead-scout') ? '/lead-scout' : '/senior-scout') + '/players' }] } })}
                              className="font-body font-bold text-[14px] text-primary hover:underline cursor-pointer whitespace-nowrap">{p.name}</span>
                            <FlagBadge code={flagCode} label={p.nation} />
                          </div>
                        </td>
                        {/* DOB */}
                        <td className="px-3 py-2 text-center"><span className="font-body text-[12px] text-muted-foreground">{p.dob}</span></td>
                        {/* POS */}
                        <td className="px-3 py-2 text-center"><span className="font-body text-[12px] font-bold text-muted-foreground">{p.pos}</span></td>
                        {/* Team (Club) */}
                        <td className="px-3 py-2 border-r border-border/10">
                          <CellSelect value={p.club} options={['AC Horsens','VPN']} menuWidth={140} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, club: v} : x))}
                            renderValue={v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>} />
                        </td>
                        {/* Identified/Source */}
                        <td className="px-3 py-2 border-r border-border/10">
                          <CellSelect value={p.identified} options={['Scouted','Social','Agent']} menuWidth={120} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, identified: v} : x))}
                            renderValue={v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>} />
                        </td>
                        {/* Scout */}
                        <td className="px-3 py-2 border-r border-border/10">
                          <CellSelect value={p.scout} options={['Tom','Mbugua','Brice','Nene','Scott','Sekou','Sall','Buba']} menuWidth={120} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, scout: v} : x))}
                            renderValue={v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>} />
                        </td>
                        {/* Move */}
                        <td className="px-3 py-2 border-r border-border/30">
                          <CellSelect value={p.move} options={['Signed','Loan','Trial','Trial/Signed','Loan/Signed']} menuWidth={140} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, move: v} : x))}
                            renderValue={v => <span className="font-body text-[12px] font-bold text-foreground">{v || '–'}</span>} />
                        </td>
                        {/* Year */}
                        <td className="px-3 py-2 text-center border-r border-border/10">
                          <input type="number" value={p.year} onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, year: Number(e.target.value)} : x))}
                            className="bg-transparent font-mono font-bold text-[12px] text-foreground focus:outline-none w-[32px] text-center" />
                        </td>
                        {/* Fee */}
                        <td className="px-3 py-2 text-right border-r border-border/10">
                          <input value={p.fee} onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, fee: e.target.value} : x))}
                            className="bg-transparent font-mono text-[12px] text-muted-foreground focus:outline-none w-[72px] text-right" />
                        </td>
                        {/* Current Val */}
                        <td className="px-3 py-2 text-right border-r border-border/10">
                          <input value={p.currentValue} onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, currentValue: e.target.value} : x))}
                            className="bg-transparent font-mono text-[12px] text-foreground focus:outline-none w-[80px] text-right" />
                        </td>
                        {/* Potential Val */}
                        <td className="px-3 py-2 text-right border-r border-border/30">
                          <input value={p.potentialValue} onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, potentialValue: e.target.value} : x))}
                            className="bg-transparent font-mono font-bold text-[12px] text-foreground focus:outline-none w-[80px] text-right" />
                        </td>
                        {/* Scout Success — soft pill */}
                        <td className="px-2 py-2 text-center border-r border-border/10">
                          <StatusPill value={p.scoutSuccess} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, scoutSuccess: v} : x))} />
                        </td>
                        {/* Dev Success — soft pill */}
                        <td className="px-2 py-2 text-center border-r border-border/10">
                          <StatusPill value={p.devSuccess} onChange={v => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, devSuccess: v} : x))} />
                        </td>
                        {/* Note */}
                        <td className="px-3 py-2">
                          <input value={p.note} onChange={e => setPlayers(prev => prev.map(x => x.id === p.id ? {...x, note: e.target.value} : x))} placeholder="Note..."
                            className="bg-transparent font-body text-[12px] text-muted-foreground focus:outline-none min-w-[80px]" />
                        </td>
                        {extraCols.map(c => (
                          <td key={c.id} className="px-3 py-2 text-center border-l border-border/10">
                            <span className={`font-body text-[12px] font-medium text-foreground whitespace-nowrap ${c.mono ? 'font-mono' : ''}`}>{c.value(p, 0)}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-[32px] shadow-2xl w-full max-w-lg border border-border" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-primary rounded-t-[32px] flex items-center justify-between">
              <span className="font-heading font-semibold text-[16px] text-chalk">Add Signed Player</span>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-chalk/60 hover:text-chalk"><X size={16} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Player Name', key: 'name', type: 'text' },
                  { label: 'Club', key: 'club', type: 'text' },
                  { label: 'Nation', key: 'nation', type: 'text' },
                  { label: 'Scout', key: 'scout', type: 'text' },
                  { label: 'Fee', key: 'fee', type: 'text' },
                  { label: 'Year Signed', key: 'year', type: 'number' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">{field.label}</label>
                    <input type={field.type} value={(newPlayer as any)[field.key] || ''} onChange={e => setNewPlayer(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                  </div>
                ))}
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Position</label>
                  <select value={newPlayer.pos || 'ST'} onChange={e => setNewPlayer(prev => ({ ...prev, pos: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    {['ST','LW','RW','CM','CDM','CAM','FB','CB','DM','LB','RB'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Move Type</label>
                  <select value={newPlayer.move || 'Signed'} onChange={e => setNewPlayer(prev => ({ ...prev, move: e.target.value }))}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none appearance-none">
                    {['Signed','Loan','Trial/Signed','Loan/Signed'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Note</label>
                <input type="text" value={newPlayer.note || ''} onChange={e => setNewPlayer(prev => ({ ...prev, note: e.target.value }))} placeholder="Optional note..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              <button onClick={handleAdd} disabled={!newPlayer.name}
                className="w-full bg-primary border-2 border-primary text-chalk rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Add to Signed List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Scope Settings Panel — 2-Card Split-Grid ────────────────────────────────────
const COLOR_SWATCHES = ['#1E88E5', '#449CE9', '#22C55E', '#E8A838', '#E05C4B', '#8B5CF6', '#06B6D4', '#304151'];
const ALL_POSITIONS = ['ST','LW','RW','CAM','CM','CDM','CB','LB','RB','LWB','RWB','DM','FB','GK','AM'];
const AVAILABLE_SCOPES = ['West Africa U19 Cycle 2026', 'East Africa U17 Cycle 2025', 'Southern Africa U20 Cycle 2026'];

// ─── Custom Calendar DatePicker ───────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const DatePicker = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const [showYearList, setShowYearList] = useState(false);

  // viewYear/viewMonth sync moved to onClick handler to prevent re-render loop

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setShowMonthGrid(false); setShowYearList(false); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mon=0
  const selectedDay = value ? new Date(value) : null;
  const isSelected = (d: number) => selectedDay && selectedDay.getFullYear() === viewYear && selectedDay.getMonth() === viewMonth && selectedDay.getDate() === d;
  const isToday = (d: number) => { const t = new Date(); return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d; };

  const selectDay = (d: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    onChange(`${viewYear}-${m}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const fmtDisplay = value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const blanks = Array.from({ length: firstDow }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <button onClick={() => {
          if (!open) {
            const p = value ? new Date(value) : new Date();
            setViewYear(p.getFullYear());
            setViewMonth(p.getMonth());
            setShowMonthGrid(false);
            setShowYearList(false);
          }
          setOpen(!open);
        }} type="button"
        className="w-full flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-left font-body text-[14px] font-bold text-foreground hover:border-primary focus:outline-none focus:border-ring transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{fmtDisplay || 'Select date'}</span>
      </button>
      {open && (
        <div className="absolute mt-1 bg-card border border-border/50 rounded-xl shadow-[var(--shadow-2xl)] p-3 z-50 w-[260px] animate-fade-in">
          {/* Month/Year nav */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <ChevronDown size={14} className="rotate-90" />
            </button>
            <div className="flex items-center gap-1 relative">
              {/* Month dropdown trigger */}
              <button onClick={() => { setShowMonthGrid(!showMonthGrid); setShowYearList(false); }}
                className="flex items-center gap-0.5 font-heading font-bold text-[14px] text-foreground hover:text-primary transition-colors px-1 py-0.5 rounded-md hover:bg-accent">
                {MONTH_NAMES[viewMonth]}
                <ChevronDown size={9} className="text-muted-foreground" />
              </button>
              {/* Year dropdown trigger */}
              <button onClick={() => { setShowYearList(!showYearList); setShowMonthGrid(false); }}
                className="flex items-center gap-0.5 font-heading font-bold text-[14px] text-foreground hover:text-primary transition-colors px-1 py-0.5 rounded-md hover:bg-accent">
                {viewYear}
                <ChevronDown size={9} className="text-muted-foreground" />
              </button>

              {/* Month grid overlay */}
              {showMonthGrid && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-[var(--shadow-2xl)] p-2 z-[60] w-[200px]">
                  <div className="grid grid-cols-3 gap-1">
                    {MONTH_SHORT.map((m, i) => (
                      <button key={m} onClick={() => { setViewMonth(i); setShowMonthGrid(false); }}
                        className={`py-2 rounded-lg font-body font-bold text-[12px] text-center transition-all ${
                          i === viewMonth ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-accent'
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Year scrollable list */}
              {showYearList && (
                <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-[var(--shadow-2xl)] p-2 z-[60] w-[96px] max-h-[200px] overflow-y-auto">
                  {Array.from({ length: 21 }, (_, i) => viewYear - 10 + i).map(y => (
                    <button key={y} onClick={() => { setViewYear(y); setShowYearList(false); }}
                      className={`w-full py-2 rounded-lg font-heading font-bold text-[12px] text-center transition-all ${
                        y === viewYear ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-accent'
                      }`}>{y}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
          {/* Day labels */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <span key={d} className="text-center font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground py-1">{d}</span>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7">
            {blanks.map(b => <span key={`b${b}`} />)}
            {days.map(d => (
              <button key={d} onClick={() => selectDay(d)}
                className={`w-full aspect-square flex items-center justify-center font-body font-bold text-[12px] rounded-full transition-all ${
                  isSelected(d) ? 'bg-primary text-primary-foreground shadow-sm'
                    : isToday(d) ? 'bg-primary/10 text-primary font-black'
                    : 'text-foreground hover:bg-accent'
                }`}>
                {d}
              </button>
            ))}
          </div>
          {/* Footer actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="font-body font-bold text-[12px] text-muted-foreground hover:text-primary transition-colors">Clear</button>
            <button onClick={() => { const t = new Date(); selectDay(t.getDate()); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); }}
              className="font-body font-bold text-[12px] text-primary hover:text-primary/80 transition-colors">Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ChipStrip = ({ label, items, newVal, setNewVal, onAdd, onRemove }: {
  label: string; items: string[]; newVal: string; setNewVal: (v: string) => void;
  onAdd: () => void; onRemove: (i: number) => void;
}) => (
  <div className="flex flex-col gap-2 flex-1 min-w-0">
    <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
    <div className="flex flex-wrap gap-2">
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1 bg-accent border border-border rounded-full px-2 py-1 font-body font-black text-[12px] text-foreground">
          {c}
          <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-[#E05C4B] transition-colors leading-none"><X size={9} /></button>
        </span>
      ))}
    </div>
    <div className="flex items-center border border-dashed border-border rounded-full overflow-hidden">
      <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Add…"
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        className="font-body text-[12px] font-semibold text-foreground border-none outline-none px-2 py-1 flex-1 min-w-0 bg-transparent placeholder:text-muted-foreground" />
      <button onClick={onAdd}
        className="bg-accent border-l border-border text-primary font-black text-[14px] px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0">+</button>
    </div>
  </div>
);

const ScopeSettingsPanel = ({ profileTypes, onAddProfile, onEditProfile, onDeleteProfile, loggedInRole, scopeYearMin, setScopeYearMin, scopeYearMax, setScopeYearMax }: {
  profileTypes: ProfileType[];
  onAddProfile: (name: string, color: string) => void;
  onEditProfile: (id: string, name: string, color: string) => void;
  onDeleteProfile: (id: string) => void;
  loggedInRole?: string;
  scopeYearMin: number; setScopeYearMin: (v: number) => void;
  scopeYearMax: number; setScopeYearMax: (v: number) => void;
}) => {
  // Card 1 state
  const [scopeName, setScopeName] = useState('West Africa U19 Cycle 2026');
  const [activeScope, setActiveScope] = useState('West Africa U19 Cycle 2026');
  const [scopeStart, setScopeStart] = useState('2024-01-01');
  const [scopeEnd, setScopeEnd] = useState('2026-12-31');
  const [description, setDescription] = useState('');
  const [activeYearBadge, setActiveYearBadge] = useState<number | null>(null);
  const [savedCard1, setSavedCard1] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScope, setNewScope] = useState({ name: '', start: '', end: '', desc: '' });

  // Card 2 state
  const [savedCard2, setSavedCard2] = useState(false);
  const [classView, setClassView] = useState<'tags' | 'grades' | 'nxt' | 'pathways'>('grades');
  const [classDropOpen, setClassDropOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('#1E88E5');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [activeSwatchId, setActiveSwatchId] = useState<string | null>(null);
  const [customGrades, setCustomGrades] = React.useState(['A+','A','B','C']);
  const [customNxt, setCustomNxt] = React.useState(['T','M','D']);
  const [customPathways, setCustomPathways] = React.useState(['ACH','Partner']);
  const [newGrade, setNewGrade] = React.useState('');
  const [newNxtVal, setNewNxtVal] = React.useState('');
  const [newPathway, setNewPathway] = React.useState('');

  // Fill available viewport height so there's no empty band below the cards.
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [avail, setAvail] = React.useState(0);
  React.useLayoutEffect(() => {
    const measure = () => { if (wrapRef.current) setAvail(Math.max(520, window.innerHeight - wrapRef.current.getBoundingClientRect().top - 24)); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Year badges from date range
  const yearBadges = useMemo(() => {
    const sy = new Date(scopeStart).getFullYear();
    const ey = new Date(scopeEnd).getFullYear();
    // Generate birth-year range (players born within the scope window)
    const minY = Math.max(2000, Math.min(sy, ey));
    const maxY = Math.min(2030, Math.max(sy, ey));
    const years: number[] = [];
    for (let y = minY; y <= maxY; y++) years.push(y);
    return years;
  }, [scopeStart, scopeEnd]);

  // Sequential description engine — Condition 2 & 3
  const handleYearClick = (year: number) => {
    if (activeYearBadge === year) {
      setActiveYearBadge(null);
      return;
    }
    setActiveYearBadge(year);
    // Condition 2: write year prefix if not present
    const prefix = `${year}:`;
    const lines = description.split('\n').filter(l => l.trim());
    const exists = lines.some(l => l.startsWith(prefix));
    if (!exists) {
      const newLines = [...lines, `${year}: `].sort();
      setDescription(newLines.join('\n'));
    }
  };

  // Condition 3: append position after active year prefix
  const injectPosition = (year: number, pos: string) => {
    const prefix = `${year}:`;
    const lines = description.split('\n');
    const li = lines.findIndex(l => l.startsWith(prefix));
    if (li >= 0) {
      const existing = lines[li].substring(prefix.length).trim();
      const poss = existing ? existing.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (poss.includes(pos)) {
        // Toggle off: remove position
        const filtered = poss.filter(p => p !== pos);
        lines[li] = filtered.length > 0 ? `${prefix} ${filtered.join(', ')}` : `${year}: `;
      } else {
        poss.push(pos);
        lines[li] = `${prefix} ${poss.join(', ')}`;
      }
    } else {
      lines.push(`${year}: ${pos}`);
    }
    setDescription(lines.filter(l => l.trim()).join('\n'));
  };

  const handleSaveCard1 = () => { setSavedCard1(true); setTimeout(() => setSavedCard1(false), 2500); };
  const handleSaveCard2 = () => { setSavedCard2(true); setTimeout(() => setSavedCard2(false), 2500); };

  // Split profile tags into 2 columns
  const tagCol1 = profileTypes.filter((_, i) => i % 2 === 0);
  const tagCol2 = profileTypes.filter((_, i) => i % 2 === 1);

  const renderTagRow = (pt: ProfileType) => (
    <div key={pt.id} className="flex items-center gap-2 px-1 py-2 border-b border-border/10 last:border-b-0 transition-all">
      {editingId === pt.id ? (
        <>
          <input value={editName} onChange={e => setEditName(e.target.value)}
            className="flex-1 min-w-0 bg-card border border-border rounded-lg px-2 py-1 font-body text-[12px] font-bold text-foreground focus:outline-none focus:border-ring" />
          <div className="flex gap-0.5 shrink-0">{COLOR_SWATCHES.map(c => (
            <button key={c} onClick={() => setEditColor(c)}
              className={`w-3.5 h-3.5 rounded-full hover:scale-110 transition-transform ${editColor === c ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
              style={{ backgroundColor: c }} />
          ))}</div>
          <button onClick={() => { onEditProfile(pt.id, editName, editColor); setEditingId(null); }}
            className="px-2 py-0.5 bg-primary text-chalk rounded-lg font-body text-[10px] font-black">Ok</button>
          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X size={11} /></button>
        </>
      ) : (
        <>
          <span className="flex-1 font-body font-bold text-[12px] text-foreground truncate">{pt.name}</span>
          <div className="relative shrink-0">
            <button onClick={() => setActiveSwatchId(activeSwatchId === pt.id ? null : pt.id)}
              className="w-5 h-5 rounded-full border-2 border-card shadow-[0_0_0_1px_var(--border)] hover:scale-110 transition-transform"
              style={{ backgroundColor: pt.color }} />
            {activeSwatchId === pt.id && (
              <div className="absolute top-7 left-1/2 -translate-x-1/2 flex gap-1 bg-card border border-border rounded-xl p-2 shadow-[var(--shadow-2xl)] z-50">
                {COLOR_SWATCHES.map(c => (
                  <button key={c} onClick={() => { onEditProfile(pt.id, pt.name, c); setActiveSwatchId(null); }}
                    className={`w-4 h-4 rounded-full hover:scale-110 transition-transform ${pt.color === c ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { setEditingId(pt.id); setEditName(pt.name); setEditColor(pt.color); }}
            className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:bg-primary/80 hover:text-chalk transition-colors shrink-0"><Edit2 size={9} /></button>
          <button onClick={() => onDeleteProfile(pt.id)}
            className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-muted-foreground hover:bg-[#E05C4B] hover:text-chalk transition-colors shrink-0"><Trash2 size={9} /></button>
        </>
      )}
    </div>
  );

  return (
    <>
    <div ref={wrapRef} style={{ height: avail || undefined }} className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[560px] overflow-y-auto no-scrollbar">

    {/* ════════════ LEFT COLUMN — Scope Settings + Requirements ════════════ */}
    <div className="flex flex-col gap-4 min-h-0">

      {/* ════════════ CARD 1: Scope Settings ════════════ */}
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <h3 className="font-heading font-semibold text-[16px] text-foreground shrink-0">Scope Settings</h3>
          <div className="flex-1" />
          <button onClick={handleSaveCard1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-[12px] transition-all shadow-sm ${savedCard1 ? 'bg-[#22C55E] text-chalk' : 'bg-primary text-primary-foreground hover:bg-primary/80'}`}>
            {savedCard1 ? <><Check size={11} /> Saved</> : <><Save size={11} /> Update</>}
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-full border border-border bg-card font-body font-bold text-[12px] text-foreground hover:border-primary hover:text-primary transition-all">
            <Plus size={11} /> Add Scope
          </button>
        </div>

        {/* Scope selector capsule — cloned from System Classifications */}
        <div className="px-5 py-2 border-b border-border/40">
          <div className="relative inline-block">
            <select value={activeScope} onChange={e => { setActiveScope(e.target.value); setScopeName(e.target.value); }}
              className="appearance-none bg-accent border border-border rounded-full pl-4 pr-8 py-2 font-heading font-bold text-[12px] text-foreground cursor-pointer focus:outline-none hover:border-primary transition-all">
              {AVAILABLE_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 flex-1">
          {/* Scope Name */}
          <div className="flex flex-col gap-1">
            <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Scope Name</label>
            <input type="text" value={scopeName} onChange={e => setScopeName(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:border-ring transition-all" />
          </div>
          {/* Dates inline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <DatePicker label="Start Date" value={scopeStart} onChange={setScopeStart} />
            </div>
            <div className="relative">
              <DatePicker label="End Date" value={scopeEnd} onChange={setScopeEnd} />
            </div>
          </div>

          {/* Description */}
          <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Enter start and end dates, then use the Scope Requirements builder below to set target positions per year…"
            className="w-full min-h-[120px] flex-1 bg-card border border-border rounded-xl px-3 py-2 font-mono text-[12px] font-bold text-foreground focus:outline-none focus:border-ring transition-all resize-none leading-relaxed" />
        </div>
      </div>

      {/* ════════════ CARD 2 (bottom-left): Scope Requirements by Year ════════════ */}
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col flex-1 min-h-[260px]">
        <div className="flex items-center gap-4 px-5 py-3 border-b border-border shrink-0 flex-wrap">
          <h3 className="font-heading font-semibold text-[16px] text-foreground shrink-0">Scope Requirements by Year</h3>
          <div className="flex items-center gap-1 bg-accent border border-border rounded-full p-1">
            {yearBadges.map(y => (
              <button key={y} onClick={() => handleYearClick(y)}
                className={`px-4 py-2 rounded-full font-body font-bold text-[12px] transition-all ${
                  activeYearBadge === y ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}>{y}</button>
            ))}
          </div>
        </div>
        <div className="p-5 flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {activeYearBadge ? (
            <>
              <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-4">{activeYearBadge} — target positions</p>
              <div className="flex flex-wrap gap-3">
                {ALL_POSITIONS.map(pos => {
                  const active = description.split('\n').some(l => l.startsWith(`${activeYearBadge}:`) && l.split(':')[1]?.split(',').map(s => s.trim()).includes(pos));
                  return (
                    <button key={pos} onClick={() => injectPosition(activeYearBadge, pos)}
                      className={`px-5 py-3 rounded-full font-heading font-bold text-[14px] border transition-all ${
                        active ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-accent text-foreground border-border hover:bg-primary/10 hover:border-primary hover:text-primary'
                      }`}>{pos}</button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <p className="font-heading font-semibold text-[16px] text-foreground">Select a year to begin</p>
              <p className="font-body text-[14px] font-medium text-muted-foreground max-w-[360px]">Choose a year tab above to set the target positions your scouts should prioritise for that intake.</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* ════════════ RIGHT COLUMN — Profile Tags + Classifications ════════════ */}
    <div className="flex flex-col gap-4 min-h-0">

      {/* ════════════ CARD 3 (top-right): Profile Tags ════════════ */}
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <h3 className="font-heading font-semibold text-[16px] text-foreground">Profile Tags</h3>
          <div className="flex-1" />
          <button onClick={handleSaveCard2}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-[12px] transition-all shadow-sm ${savedCard2 ? 'bg-[#22C55E] text-chalk' : 'bg-primary text-primary-foreground hover:bg-primary/80'}`}>
            {savedCard2 ? <><Check size={11} /> Saved</> : <><Save size={11} /> Update</>}
          </button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {profileTypes.map(pt => renderTagRow(pt))}
          <div className="flex items-center gap-2 px-3 py-3 mt-1 border border-dashed border-border rounded-xl">
            <input value={newProfileName} onChange={e => setNewProfileName(e.target.value)}
              placeholder="New profile…"
              className="flex-1 min-w-0 bg-transparent font-body text-[12px] font-bold text-foreground outline-none placeholder:text-muted-foreground" />
            <div className="flex gap-1 shrink-0">{COLOR_SWATCHES.map(c => (
              <button key={c} onClick={() => setNewProfileColor(c)}
                className={`w-4 h-4 rounded-full hover:scale-110 transition-transform ${newProfileColor === c ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
                style={{ backgroundColor: c }} />
            ))}</div>
            <button onClick={() => { if (newProfileName.trim()) { onAddProfile(newProfileName.trim(), newProfileColor); setNewProfileName(''); setNewProfileColor('#1E88E5'); } }}
              disabled={!newProfileName.trim()}
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-40 shrink-0">
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ CARD 4 (bottom-right): Classifications ════════════ */}
      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col flex-1 min-h-[260px]">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
          <h3 className="font-heading font-semibold text-[16px] text-foreground shrink-0">Classifications</h3>
          <div className="flex-1" />
          <div className="relative inline-block">
            <button onClick={() => setClassDropOpen(!classDropOpen)}
              className="flex items-center gap-2 bg-accent border border-border rounded-full px-4 py-2 font-heading font-bold text-[12px] text-foreground hover:border-primary transition-all">
              Manage: {{ tags: 'Grade Scale', grades: 'Grade Scale', nxt: 'NXT Values', pathways: 'Pathways' }[classView]}
              <ChevronDown size={10} className={`text-muted-foreground transition-transform ${classDropOpen ? 'rotate-180' : ''}`} />
            </button>
            {classDropOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-[var(--shadow-2xl)] z-50 min-w-[180px] overflow-hidden">
                {([
                  { id: 'grades' as const, label: 'Grade Scale' },
                  { id: 'nxt' as const, label: 'NXT Values' },
                  { id: 'pathways' as const, label: 'Pathways' },
                ]).map(opt => (
                  <button key={opt.id} onClick={() => { setClassView(opt.id); setClassDropOpen(false); }}
                    className={`flex items-center gap-2 w-full px-4 py-2 font-body font-bold text-[12px] transition-colors text-left ${classView === opt.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'}`}>
                    {classView === opt.id && <Check size={11} className="text-primary" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic canvas — Grade Scale / NXT Values / Pathways */}
        <div className="p-5 flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto no-scrollbar">

          {/* State B: Grade Scale */}
          {classView === 'grades' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {customGrades.map((g, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-accent border border-border rounded-full px-4 py-2 font-body font-black text-[14px] text-foreground">
                    {g}
                    <button onClick={() => setCustomGrades(p => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-[#E05C4B] transition-colors"><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center border border-dashed border-border rounded-full overflow-hidden max-w-xs">
                <input value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="Add grade…"
                  onKeyDown={e => e.key === 'Enter' && newGrade.trim() && (setCustomGrades(p => [...p, newGrade.trim()]), setNewGrade(''))}
                  className="flex-1 font-body text-[14px] font-bold text-foreground border-none outline-none px-4 py-2 bg-transparent placeholder:text-muted-foreground" />
                <button onClick={() => { if (newGrade.trim()) { setCustomGrades(p => [...p, newGrade.trim()]); setNewGrade(''); }}}
                  className="bg-accent border-l border-border text-primary font-black text-[14px] px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
              </div>
            </div>
          )}

          {/* State C: NXT Values */}
          {classView === 'nxt' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {customNxt.map((n, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-accent border border-border rounded-full px-4 py-2 font-body font-black text-[14px] text-foreground">
                    {n}
                    <button onClick={() => setCustomNxt(p => p.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-[#E05C4B] transition-colors"><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center border border-dashed border-border rounded-full overflow-hidden max-w-xs">
                <input value={newNxtVal} onChange={e => setNewNxtVal(e.target.value)} placeholder="Add value…"
                  onKeyDown={e => e.key === 'Enter' && newNxtVal.trim() && (setCustomNxt(p => [...p, newNxtVal.trim()]), setNewNxtVal(''))}
                  className="flex-1 font-body text-[14px] font-bold text-foreground border-none outline-none px-4 py-2 bg-transparent placeholder:text-muted-foreground" />
                <button onClick={() => { if (newNxtVal.trim()) { setCustomNxt(p => [...p, newNxtVal.trim()]); setNewNxtVal(''); }}}
                  className="bg-accent border-l border-border text-primary font-black text-[14px] px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
              </div>
            </div>
          )}

          {/* State D: Pathways */}
          {classView === 'pathways' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {customPathways.map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-2 bg-accent border border-border rounded-full px-4 py-2 font-body font-black text-[14px] text-foreground">
                    {p}
                    <button onClick={() => setCustomPathways(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-[#E05C4B] transition-colors"><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex items-center border border-dashed border-border rounded-full overflow-hidden max-w-xs">
                <input value={newPathway} onChange={e => setNewPathway(e.target.value)} placeholder="Add pathway…"
                  onKeyDown={e => e.key === 'Enter' && newPathway.trim() && (setCustomPathways(p => [...p, newPathway.trim()]), setNewPathway(''))}
                  className="flex-1 font-body text-[14px] font-bold text-foreground border-none outline-none px-4 py-2 bg-transparent placeholder:text-muted-foreground" />
                <button onClick={() => { if (newPathway.trim()) { setCustomPathways(p => [...p, newPathway.trim()]); setNewPathway(''); }}}
                  className="bg-accent border-l border-border text-primary font-black text-[14px] px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">+</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    </div>

    {/* ═══ Add Scope Modal ═══ */}
    {showAddModal && (
      <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setShowAddModal(false)}>
        <div className="bg-card rounded-[24px] shadow-[var(--shadow-2xl)] w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 bg-primary rounded-t-[24px] flex items-center justify-between">
            <span className="font-heading font-semibold text-[16px] text-chalk">Add New Scope</span>
            <button onClick={() => setShowAddModal(false)} className="w-7 h-7 rounded-full bg-card/10 flex items-center justify-center text-chalk/60 hover:text-chalk"><X size={14} /></button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Scope Name</label>
              <input type="text" value={newScope.name} onChange={e => setNewScope(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. East Africa U17 Cycle 2026"
                className="w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:border-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <DatePicker label="Start Date" value={newScope.start} onChange={v => setNewScope(p => ({ ...p, start: v }))} />
              </div>
              <div className="relative">
                <DatePicker label="End Date" value={newScope.end} onChange={v => setNewScope(p => ({ ...p, end: v }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
              <textarea value={newScope.desc} onChange={e => setNewScope(p => ({ ...p, desc: e.target.value }))}
                placeholder="Scope description…" rows={3}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:border-ring resize-none" />
            </div>
            <button onClick={() => { setShowAddModal(false); setNewScope({ name: '', start: '', end: '', desc: '' }); }}
              disabled={!newScope.name.trim()}
              className="w-full bg-primary text-chalk rounded-full py-2 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
              Create Scope
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

// ─── Main Export ─────────────────────────────────────────────────────────────────
// ─── Mock Player Generator ───────────────────────────────────────────────────────
const PLAYER_NAMES = [
  'Kofi Mensah','David Conteh','Kazungu Nesta','Amadou Sarr','Cheikh Diop','Francis Gomez',
  'Yamirou Ouorou','Abdul Moro','Arnold Adu','Seyi Ogunniyi','Mourana Camara','Ousman Touray',
  'Abdulkareem Bashir','Moses Simon','Kwame Asante','Tariq Lamptey','Emeka Okafor','Pape Sarr',
  'Ismaila Ceesay','Kingsley Bimpong','Alhassan Dedenka','Richmondson Ansah','Emilio Sadio',
  'Joseph Narbi','Sory Traore','Jean Manguele','Sidy Sow','Maxwell Oduro','Thomas Nkudivi',
  'Habib Soumahoro','Jacob Kpoeti','Macodou Lo','El Hadji Malick','Hassan Kone','Udo Nsikan',
  'Babatunde Abdullahi','Abdulmuiz Adeleke','Habeeb Adewusi','Sadiq Ashiru','Emerson Lyors',
  'Eric Stephane','Abubacar Kujabi','Charles Diege','Ntoh Balling','Robinho Yao','Sanaba Keita',
  'Solomon Adeleke','Ismael Younou','Fousseyni Doumbia','Mamadou Gueye','Modou Lamin',
  'Elwood Banter','Marc Mebara','Foussey Doumbia','Lassana Diarra','Ibrahim Sangare',
  'Naby Keita Jr','Koffi Ange','Kouakou Hans','Camille Mbog','Nyanga Tombu',
];

const NAT_LIST = ['GAM','NGA','GHA','CMR','SEN','CIV','MLI','BDI'];
const COUNTRY_LIST = ['The Gambia','Nigeria','Ghana','Cameroon','Senegal','Ghana','Mali','Burundi'];
const TEAM_LIST = ['Hawks FC','Fauve Azur','ATS','United Acad','Gunjur Utd','AC Wembo','Imperial FC','WAFA','CSB','Seamoriow','Be Sport','Vinod FA','Diamond Seed','Amazon Kayak','Borough FC'];
const TRANSFER_OPTS = ['Available','On Loan','Under Contract','Free Agent'];
const FORM_OPTS = ['F1','F3','F5','H1','R1'];
const WEEK_OPTS = ['W1','W2','W3','W4','W5','W6'];
const POS_GROUPS = ['Strikers','Wingers','Wingers','Midfielders','Midfielders','Full Backs','Centre Backs'];

let _seed = 42;
function rng() { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return Math.abs(_seed) / 0x7fffffff; }

function genPlayers(count: number, idPrefix: string, yearMin = 2008, yearMax = 2009): ExtPlayer[] {
  const players: ExtPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const nameIdx = (i + (idPrefix.charCodeAt(0) || 0)) % PLAYER_NAMES.length;
    const name = PLAYER_NAMES[nameIdx];
    const natIdx  = i % NAT_LIST.length;
    const posIdx  = i % POS_GROUPS.length;
    const pos     = POS_GROUPS[posIdx];
    const posAcronyms: Record<string,string[]> = {
      Strikers:['ST'], Wingers:['LW','RW'], Midfielders:['CM','CDM','CAM'],
      'Full Backs':['FB'], 'Centre Backs':['CB']
    };
    const acr = posAcronyms[pos][i % posAcronyms[pos].length];
    const yearRange = yearMax - yearMin;
    const yob = yearMin + (i % (yearRange + 1));
    const age = 2026 - yob;
    const foot = (['Right','Right','Right','Left','Both'] as const)[i % 5];
    const prof = (['Wonderkid','Prospect','Prospect','Performance','Performance'] as const)[i % 5];
    const scout = SCOUTS[i % SCOUTS.length];
    players.push({
      id: `${idPrefix}-${i}`,
      name,
      initials: name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(),
      age, yob,
      nationality: NAT_LIST[natIdx],
      country: COUNTRY_LIST[natIdx],
      pos,
      posAcronym: acr,
      foot,
      height: HEIGHTS[i % HEIGHTS.length],
      profile: prof,
      scout,
      goals: i % 15,
      ass: i % 8,
      app: 5 + (i % 30),
      pens: i % 4,
      matchVideos: i % 9,
      highlightVideos: i % 12,
      scouted: i % 3 !== 0,
      dob: `${yob}-${String((i % 12) + 1).padStart(2,'0')}-${String((i % 28) + 1).padStart(2,'0')}`,
      team: TEAM_LIST[i % TEAM_LIST.length],
      monitor: i % 7 === 0,
      submissionDate: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i % 12]} ${2024 + Math.floor(i/12)}`,
      transfer: (['Available','On Loan','Under Contract','Free Agent'])[i % 4],
      form: (['F1','F3','F5','H1','R1'])[i % 5],
      week: `W${(i % 6) + 1}`,
    });
  }
  return players;
}

// Pre-generate all players with fixed tier assignments
// Database: 60, Long List: 50, Short List: 40, Target List: 30
const DB_PLAYERS   = genPlayers(60, 'db');
const LL_PLAYERS   = genPlayers(50, 'll');
const SL_PLAYERS   = genPlayers(40, 'sl');
const TL_PLAYERS   = genPlayers(30, 'tl');

const INITIAL_TIER_MAP = (): Map<string, PipelineTier> => {
  const m = new Map<string, PipelineTier>();
  LL_PLAYERS.forEach(p => m.set(p.id, 'long-list'));
  SL_PLAYERS.forEach(p => m.set(p.id, 'short-list'));
  TL_PLAYERS.forEach(p => m.set(p.id, 'target-list'));
  return m;
};

// All players pool = union of all tiers. Exported so the global top-nav search can query it.
export const ALL_GENERATED_PLAYERS = [...DB_PLAYERS, ...LL_PLAYERS, ...SL_PLAYERS, ...TL_PLAYERS];
export type SearchPlayer = ExtPlayer;

// Seed the shared tier store once (idempotent) so the global search and this page agree.
seedTiers(INITIAL_TIER_MAP());

// ─── Highlights feed — real player ids so dashboard deep-links scroll to real rows ──
// Deterministic (no Date.now / Math.random). First 3 Short + first 3 Target players,
// interleaved via sort by hoursAgo ascending (newest first).
export const HIGHLIGHTS_FEED: {
  id: string; name: string; initials: string; posAcronym: string;
  list: 'short' | 'target'; matchVideos: number; highlightVideos: number; hoursAgo: number;
}[] = (() => {
  const shorts = SL_PLAYERS.slice(0, 3).map((p, i) => ({
    id: p.id, name: p.name, initials: p.initials, posAcronym: p.posAcronym,
    list: 'short' as const, matchVideos: 2 + i, highlightVideos: 1 + i, hoursAgo: 2 + i * 5,
  }));
  const targets = TL_PLAYERS.slice(0, 3).map((p, i) => ({
    id: p.id, name: p.name, initials: p.initials, posAcronym: p.posAcronym,
    list: 'target' as const, matchVideos: 3 + i, highlightVideos: 2 + i, hoursAgo: 4 + i * 5,
  }));
  return [...shorts, ...targets].sort((a, b) => a.hoursAgo - b.hoursAgo);
})();

// ─── Database Toolbar — light replacement for the blue FilterBar on the Database tab ──
const DB_STAT_OPTIONS = [
  { key: 'app', label: 'App' }, { key: 'gls', label: 'Gls' },
  { key: 'pen', label: 'Pen' }, { key: 'ast', label: 'Ast' },
];
const DatabaseToolbar = ({
  scopeYearMin, scopeYearMax, filterPos, setFilterPos,
  visibleStats, setVisibleStats, dbSearch, setDbSearch,
}: {
  scopeYearMin: number; scopeYearMax: number;
  filterPos: string; setFilterPos: (v: string) => void;
  visibleStats: Set<string>; setVisibleStats: React.Dispatch<React.SetStateAction<Set<string>>>;
  dbSearch: string; setDbSearch: (v: string) => void;
}) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (statsRef.current && !statsRef.current.contains(e.target as Node)) setStatsOpen(false);
      if (posRef.current && !posRef.current.contains(e.target as Node)) setPosOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  const allSelected = DB_STAT_OPTIONS.every(s => visibleStats.has(s.key));
  const toggleStat = (key: string) =>
    setVisibleStats(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  const dobTooltip = `Players born between 01/01/${scopeYearMin} to 31/12/${scopeYearMax}`;
  const trigger = "flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border font-body font-bold text-[12px] text-foreground hover:border-primary transition-colors";
  const label = "font-heading font-bold text-[9px] uppercase tracking-wider text-muted-foreground px-1";
  return (
    <div className="flex items-end gap-4 flex-wrap w-full">
      {/* DOB range — read-only, driven by Scope Settings */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={label}>DOB range</span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border">
          <span className="font-body font-bold text-[12px] text-foreground">01/01/{scopeYearMin} – 31/12/{scopeYearMax}</span>
          <span title={dobTooltip} className="flex items-center text-primary cursor-help"><Info size={13} /></span>
        </div>
      </div>
      {/* Position — label above */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={label}>Position</span>
        <div className="relative" ref={posRef}>
          <button onClick={() => setPosOpen(o => !o)} className={trigger}>
            <span>{filterPos}</span>
            <ChevronDown size={12} className={`text-muted-foreground transition-transform ${posOpen ? 'rotate-180' : ''}`} />
          </button>
          {posOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl py-2 min-w-[190px] max-h-[280px] overflow-y-auto">
              {['All', ...POSITION_LIST.map(p => p.pos)].map(opt => {
                const text = opt === 'All' ? 'All' : `${opt} — ${POSITION_LIST.find(p => p.pos === opt)?.name ?? ''}`;
                return (
                  <button key={opt} onClick={() => { setFilterPos(opt); setPosOpen(false); }}
                    className={`w-full text-left px-4 py-1.5 font-body font-bold text-[12px] transition-colors ${filterPos === opt ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent'}`}>{text}</button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Stats — label above, multi-select controls App/Gls/Pen/Ast column visibility */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className={label}>Stats</span>
        <div className="relative" ref={statsRef}>
          <button onClick={() => setStatsOpen(o => !o)} className={trigger}>
            <span>{allSelected ? 'All' : (DB_STAT_OPTIONS.filter(s => visibleStats.has(s.key)).map(s => s.label).join(', ') || 'None')}</span>
            <ChevronDown size={12} className={`text-muted-foreground transition-transform ${statsOpen ? 'rotate-180' : ''}`} />
          </button>
          {statsOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl py-2 px-3 min-w-[150px]">
              {DB_STAT_OPTIONS.map(s => (
                <label key={s.key} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input type="checkbox" checked={visibleStats.has(s.key)} onChange={() => toggleStat(s.key)} />
                  <span className="font-body font-bold text-[12px] text-foreground">{s.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1" />
      {/* Player name search */}
      <div className="relative shrink-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input value={dbSearch} onChange={e => setDbSearch(e.target.value)} placeholder="Look for a player"
          className="pl-9 pr-3 py-2 rounded-full bg-card border border-border font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors w-[220px]" />
      </div>
    </div>
  );
};

// ─── Long List Toolbar — light replacement for the blue FilterBar on the Long List tab ──
const LLSelect = ({ label, value, setValue, options, openKey, setOpenKey }: {
  label: string; value: string; setValue: (v: string) => void; options: string[];
  openKey: string | null; setOpenKey: (k: string | null) => void;
}) => {
  const open = openKey === label;
  return (
    <div className="flex flex-col gap-0.5 shrink-0" data-llselect>
      <span className="font-heading font-bold text-[9px] uppercase tracking-wider text-muted-foreground px-1">{label}</span>
      <div className="relative">
        <button onClick={() => setOpenKey(open ? null : label)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border font-body font-bold text-[12px] text-foreground hover:border-primary transition-colors whitespace-nowrap">
          <span>{value === 'All' ? 'All' : value}</span>
          <ChevronDown size={12} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl py-2 min-w-[150px] max-h-[280px] overflow-y-auto">
            {['All', ...options].map(opt => (
              <button key={opt} onClick={() => { setValue(opt); setOpenKey(null); }}
                className={`w-full text-left px-4 py-1.5 font-body font-bold text-[12px] transition-colors ${value === opt ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent'}`}>{opt}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LongListToolbar = ({ methodFilter, setMethodFilter, filters, search, setSearch }: {
  methodFilter: 'all'|'ladder'|'direct'|'archive'; setMethodFilter: (v: 'all'|'ladder'|'direct'|'archive') => void;
  filters: { label: string; value: string; setValue: (v: string) => void; options: string[] }[];
  search: string; setSearch: (v: string) => void;
}) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  const segBtn = (val: 'all'|'ladder'|'direct'|'archive', text: string) => (
    <button onClick={() => setMethodFilter(val)}
      className={`px-3 py-1.5 rounded-full font-body font-bold text-[12px] transition-colors whitespace-nowrap ${methodFilter === val ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
      {text}
    </button>
  );
  return (
    <div ref={containerRef} className="flex items-end gap-4 w-full">
      {/* Method — 4-way segmented toggle, far left (glassmorphism) */}
      <div className="flex items-center bg-card border border-border rounded-full p-1 gap-1 shrink-0">
        {segBtn('all', 'All Players')}
        {segBtn('ladder', 'Ladder')}
        {segBtn('direct', 'Direct')}
        {segBtn('archive', 'Archive')}
      </div>
      {/* Compact label-inside filter dropdowns */}
      {filters.map(f => (
        <LLSelect key={f.label} label={f.label} value={f.value} setValue={f.setValue} options={f.options}
          openKey={openKey} setOpenKey={setOpenKey} />
      ))}
      {/* Player name search — full form, far right */}
      <div className="ml-auto shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Look for a player"
            className="pl-9 pr-3 py-2 rounded-full bg-card border border-border font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors w-[220px]" />
        </div>
      </div>
    </div>
  );
};

// Light label-above filter toolbar for Short List / Target List — matches Database & Long List style
const ListFilterToolbar = ({
  filterFoot, setFilterFoot, filterHeightMin, setFilterHeightMin, filterHeightMax, setFilterHeightMax,
  filterAgeMin, setFilterAgeMin, filterAgeMax, setFilterAgeMax, filterPos, setFilterPos,
  filterProfile, setFilterProfile, filterScout, setFilterScout,
  filterGrade, setFilterGrade, archiveView, setArchiveView, search, setSearch,
}: {
  filterFoot: string; setFilterFoot: (v: string) => void;
  filterHeightMin: string; setFilterHeightMin: (v: string) => void;
  filterHeightMax: string; setFilterHeightMax: (v: string) => void;
  filterAgeMin: string; setFilterAgeMin: (v: string) => void;
  filterAgeMax: string; setFilterAgeMax: (v: string) => void;
  filterPos: string; setFilterPos: (v: string) => void;
  filterProfile: string; setFilterProfile: (v: string) => void;
  filterScout: string; setFilterScout: (v: string) => void;
  filterGrade: string; setFilterGrade: (v: string) => void;
  archiveView: ArchiveView; setArchiveView: (v: ArchiveView) => void;
  search: string; setSearch: (v: string) => void;
}) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpenKey(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);
  const num = "w-16 px-2 py-2 rounded-full bg-card border border-border font-body font-bold text-[12px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors";
  const RangePair = ({ label, minV, setMin, maxV, setMax }: { label: string; minV: string; setMin: (v: string) => void; maxV: string; setMax: (v: string) => void }) => (
    <div className="flex flex-col gap-0.5 shrink-0">
      <span className="font-heading font-bold text-[9px] uppercase tracking-wider text-muted-foreground px-1">{label}</span>
      <div className="flex items-center gap-1">
        <input type="number" value={minV} onChange={e => setMin(e.target.value)} placeholder="min" className={num} />
        <span className="text-muted-foreground text-[12px]">–</span>
        <input type="number" value={maxV} onChange={e => setMax(e.target.value)} placeholder="max" className={num} />
      </div>
    </div>
  );
  const segBtn = (val: ArchiveView, text: string) => (
    <button onClick={() => setArchiveView(val)}
      className={`px-3 py-1.5 rounded-full font-body font-bold text-[12px] transition-colors whitespace-nowrap ${archiveView === val ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
      {text}
    </button>
  );
  return (
    <div ref={containerRef} className="flex items-end gap-4 flex-wrap w-full">
      <div className="flex items-center bg-card border border-border rounded-full p-1 gap-1 shrink-0">
        {segBtn('active', 'Active')}
        {segBtn('audit', 'Archive')}
      </div>
      <LLSelect label="Foot" value={filterFoot} setValue={setFilterFoot} options={['Left', 'Right', 'Both']} openKey={openKey} setOpenKey={setOpenKey} />
      <RangePair label="Age" minV={filterAgeMin} setMin={setFilterAgeMin} maxV={filterAgeMax} setMax={setFilterAgeMax} />
      <RangePair label="Height" minV={filterHeightMin} setMin={setFilterHeightMin} maxV={filterHeightMax} setMax={setFilterHeightMax} />
      <LLSelect label="Position" value={filterPos} setValue={setFilterPos} options={['ST', 'LW', 'RW', 'CM', 'CDM', 'CAM', 'FB', 'CB']} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Profile" value={filterProfile} setValue={setFilterProfile} options={['Performance', 'Prospect', 'Wonderkid']} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Scout" value={filterScout} setValue={setFilterScout} options={SCOUTS} openKey={openKey} setOpenKey={setOpenKey} />
      <LLSelect label="Grade" value={filterGrade} setValue={setFilterGrade} options={GRADE_FILTER_OPTS.filter(o => o !== 'All')} openKey={openKey} setOpenKey={setOpenKey} />
      <div className="ml-auto shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Look for a player"
            className="pl-9 pr-3 py-2 rounded-full bg-card border border-border font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors w-[220px]" />
        </div>
      </div>
    </div>
  );
};

export function SeniorLeadPlayersPage({ allPlayersData, loggedInRole, flagMap }: Props) {
  const [activeTab, setActiveTab] = useState<SeniorTab>('database');
  const [filterGrade, setFilterGrade] = useState('All');
  const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  // Deep-link: honor ?section=<tab id> so the dashboard can link to a specific tab,
  // plus ?grade=<grade> (grade filter) and ?player=<id> (scroll + highlight a row).
  useEffect(() => {
    const section = searchParams.get('section');
    const validTabs: SeniorTab[] = ['database', 'long-list', 'short-list', 'target-list', 'signed-list', 'reports', 'settings'];
    if (section && (validTabs as string[]).includes(section)) {
      setActiveTab(section as SeniorTab);
    }
    const grade = searchParams.get('grade');
    if (grade) {
      const decoded = decodeURIComponent(grade);
      if (GRADE_FILTER_OPTS.includes(decoded)) setFilterGrade(decoded);
    }
    const player = searchParams.get('player');
    if (player) setTargetPlayerId(decodeURIComponent(player));
  }, [searchParams]);
  // Deep-link: scroll the targeted row into view and apply a transient highlight.
  useEffect(() => {
    if (!targetPlayerId) return;
    const scrollT = setTimeout(() => {
      document.getElementById(`row-${targetPlayerId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
    setHighlightId(targetPlayerId);
    const clearT = setTimeout(() => setHighlightId(null), 2500);
    return () => { clearTimeout(scrollT); clearTimeout(clearT); };
  }, [targetPlayerId, activeTab]);
  const [viewMode,  setViewMode]  = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);        // desktop: inline filters toggle (visible by default)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // mobile: bottom-sheet
  const [tabsMenuOpen, setTabsMenuOpen] = useState(false);     // mobile: 'More ▾' tab dropdown
  // User-arrangeable tab order (drag on desktop / up-down on mobile), persisted per role
  const [tabOrder, setTabOrder] = useState<SeniorTab[]>(() => loadTabOrder(loggedInRole));
  const [dragTabId, setDragTabId] = useState<SeniorTab | null>(null);
  useEffect(() => { setTabOrder(loadTabOrder(loggedInRole)); }, [loggedInRole]);
  const persistTabOrder = (order: SeniorTab[]) => {
    setTabOrder(order);
    try { window.localStorage.setItem(tabOrderKey(loggedInRole), JSON.stringify(order)); } catch {}
  };
  const reorderTab = (dragId: SeniorTab, overId: SeniorTab) => {
    if (dragId === overId) return;
    const from = tabOrder.indexOf(dragId);
    const to = tabOrder.indexOf(overId);
    if (from < 0 || to < 0) return;
    const next = [...tabOrder];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    persistTabOrder(next);
  };
  const moveTab = (id: SeniorTab, dir: -1 | 1) => {
    const i = tabOrder.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= tabOrder.length) return;
    const next = [...tabOrder];
    [next[i], next[j]] = [next[j], next[i]];
    persistTabOrder(next);
  };
  const resetTabOrder = () => {
    try { window.localStorage.removeItem(tabOrderKey(loggedInRole)); } catch {}
    setTabOrder(DEFAULT_TAB_ORDER);
  };
  // Video Manager has no scouting Reports or scope Settings on the players page.
  const hiddenTabs: SeniorTab[] = loggedInRole === 'Video Manager' ? ['reports', 'settings'] : [];
  const orderedTabs = tabOrder.map(id => TABS.find(t => t.id === id)).filter((t): t is typeof TABS[number] => !!t && !hiddenTabs.includes(t.id));
  const isCustomOrder = tabOrder.join(',') !== DEFAULT_TAB_ORDER.join(',');
  const [colsModalOpen, setColsModalOpen] = useState(false);   // Edit Columns modal
  const [signedAddOpen, setSignedAddOpen] = useState(false);   // Add Signed Player modal (lifted so the trigger can live in the tab strip)
  const [visibleColIds, setVisibleColIds] = useState<Set<string>>(() => new Set(DEFAULT_VISIBLE_IDS));
  const extraCols: PlayerColumn[] = useMemo(() => PLAYER_COLUMNS.filter(c => visibleColIds.has(c.id)), [visibleColIds]);
  const playerTierMap = useTierMap();
  const [archivedByTier, setArchivedByTier] = useState<Map<PipelineTier, Set<string>>>(
    new Map([['long-list', new Set()], ['short-list', new Set()], ['target-list', new Set()]]));
  // Seed target data per player
  const buildSeedTargetData = () => {
    const m = new Map<string, TargetData>();
    const scouts = ['Tom', 'Mbugua', 'Brice', 'Nene'];
    const nxtVals = ['T', 'T', 'M', 'D'];
    const plrVals = ['A+', 'A', 'B', 'A', 'B', 'C'];
    TL_PLAYERS.forEach((p, i) => {
      m.set(p.id, {
        rank: i < 10 ? String((i % 3) + 1) : '',
        profile: ['Wonderkid','Prospect','Prospect','Performance','Performance'][i % 5],
        lead: scouts[i % scouts.length],
        rpt: String((i % 3) + 1),
        plr: plrVals[i % plrVals.length],
        por: plrVals[(i + 2) % plrVals.length],
        nxt: nxtVals[i % nxtVals.length],
        h1: i < 25 ? 'https://example.com/hl1' : '',
        h2: i < 18 ? 'https://example.com/hl2' : '',
        fm1: i < 28 ? 'https://example.com/fm1' : '',
        fm2: i < 20 ? 'https://example.com/fm2' : '',
        season: '24/25',
        comp: ['NPFL','CAF U20','Liga Rev.','WAFU'][i % 4],
        mins: String(45 + (i % 90)),
        cost: ['€0','€50k','€120k','€200k','€350k'][i % 5],
        fee: ['€0','€30k','€80k','€150k'][i % 4],
        pct: String(10 + (i % 40)),
      });
    });
    return m;
  };
  const [targetDataMap, setTargetDataMap] = useState<Map<string, TargetData>>(() => buildSeedTargetData());
  const updateTarget = (id: string, field: keyof TargetData, value: string) => {
    setTargetDataMap(prev => { const next = new Map(prev); const cur = next.get(id) || { ...DEFAULT_TARGET }; next.set(id, { ...cur, [field]: value }); return next; });
  };
  const [filterFoot, setFilterFoot] = useState('All');
  const [filterHeightMin, setFilterHeightMin] = useState('');
  const [filterHeightMax, setFilterHeightMax] = useState('');
  const [filterAgeMin, setFilterAgeMin] = useState('');
  const [filterAgeMax, setFilterAgeMax] = useState('');
  const [filterPos, setFilterPos] = useState('All');
  const [visibleStats, setVisibleStats] = useState<Set<string>>(new Set(['app', 'gls', 'pen', 'ast']));
  const [dbSearch, setDbSearch] = useState('');
  const [filterProfile, setFilterProfile] = useState('All');
  const [filterScout, setFilterScout] = useState('All');
  const [methodFilter, setMethodFilter] = useState<'all'|'ladder'|'direct'|'archive'>('all');
  const [filterTransfer, setFilterTransfer] = useState('All');
  const [filterVideo, setFilterVideo] = useState('All');
  const [filterYob, setFilterYob] = useState('All');
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterNat, setFilterNat] = useState('All');
  const [filterForms, setFilterForms] = useState('All');
  const [filterWeek, setFilterWeek] = useState('All');
  const [llSearch, setLlSearch] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [archiveView, setArchiveView] = useState<ArchiveView>('active');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openNotesId, setOpenNotesId] = useState<string | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<ExtPlayer | null>(null);
  // Reports filed from the Player Video Workspace — surfaced in Reports → Submissions.
  const [filedSubmissions, setFiledSubmissions] = useState<Submission[]>([]);
  const fileSubmission = (sub: Omit<Submission, 'id'>) =>
    setFiledSubmissions(prev => [{ ...sub, id: `ws-${prev.length + 1}` }, ...prev]);
  const [scopeYearMin, setScopeYearMin] = useState(2008);
  const [scopeYearMax, setScopeYearMax] = useState(2009);

  // Profile types — managed in Settings, used as dropdown in tables
  const DEFAULT_PROFILES: ProfileType[] = [
    { id: 'wk',  name: 'Wonderkid',    color: '#8B5CF6' },
    { id: 'pr',  name: 'Prospect',     color: '#1E88E5' },
    { id: 'pe',  name: 'Performance',  color: '#06B6D4' },
  ];
  const [profileTypes, setProfileTypes] = useState<ProfileType[]>(DEFAULT_PROFILES);
  const addProfile = (name: string, color: string) =>
    setProfileTypes(prev => [...prev, { id: `pt_${Date.now()}`, name, color }]);
  const editProfile = (id: string, name: string, color: string) =>
    setProfileTypes(prev => prev.map(p => p.id === id ? { ...p, name, color } : p));
  const deleteProfile = (id: string) =>
    setProfileTypes(prev => prev.filter(p => p.id !== id));

  // Use pre-generated players — allPlayersData prop ignored for Senior/Lead page
  const extPlayers = useMemo(() => ALL_GENERATED_PLAYERS, []);

  // Long List "raised directly" set — shared by the filter memo and the table rows
  const llRaised = useMemo(() => new Set<string>(LL_PLAYERS.slice(0,3).map(p => p.id)), []);
  const yobOptions = useMemo(() => [...new Set(extPlayers.map(p => String(p.yob)))].sort(), [extPlayers]);

  const currentPoolPlayers = useMemo((): ExtPlayer[] => {
    if (activeTab === 'settings' || activeTab === 'signed-list') return [];
    let list = activeTab === 'database' ? extPlayers.filter(p => !playerTierMap.has(p.id)) : extPlayers.filter(p => playerTierMap.get(p.id) === (activeTab as PipelineTier));
    if (filterFoot    !== 'All') list = list.filter(p => p.foot       === filterFoot);
    if (filterPos     !== 'All') list = list.filter(p => p.posAcronym === filterPos);
    if (filterProfile !== 'All') list = list.filter(p => p.profile    === filterProfile);
    if (filterScout   !== 'All') list = list.filter(p => p.scout      === filterScout);
    if (filterGrade   !== 'All') list = list.filter(p => playerGrade(p) === filterGrade);
    if (filterAgeMin)    list = list.filter(p => p.age    >= parseInt(filterAgeMin));
    if (filterAgeMax)    list = list.filter(p => p.age    <= parseInt(filterAgeMax));
    if (filterHeightMin) list = list.filter(p => p.height >= parseInt(filterHeightMin));
    if (filterHeightMax) list = list.filter(p => p.height <= parseInt(filterHeightMax));
    // Scope year range filter
    list = list.filter(p => p.yob >= scopeYearMin && p.yob <= scopeYearMax);
    // Database name search
    if (dbSearch.trim()) list = list.filter(p => p.name.toLowerCase().includes(dbSearch.trim().toLowerCase()));
    // Long List toolbar filters
    if (filterTransfer !== 'All') list = list.filter(p => p.transfer === filterTransfer);
    if (filterVideo === 'Has footage') list = list.filter(p => p.matchVideos > 0);
    else if (filterVideo === 'No footage') list = list.filter(p => p.matchVideos === 0);
    if (filterYob !== 'All') list = list.filter(p => String(p.yob) === filterYob);
    if (filterTeam !== 'All') list = list.filter(p => p.team === filterTeam);
    if (filterNat !== 'All') list = list.filter(p => p.nationality === filterNat);
    if (filterForms !== 'All') list = list.filter(p => p.form === filterForms);
    if (filterWeek !== 'All') list = list.filter(p => p.week === filterWeek);
    if (activeTab === 'long-list') {
      if (methodFilter === 'direct') list = list.filter(p => llRaised.has(p.id));
      else if (methodFilter === 'ladder') list = list.filter(p => !llRaised.has(p.id));
    }
    if (llSearch.trim()) list = list.filter(p => p.name.toLowerCase().includes(llSearch.trim().toLowerCase()));
    if ((activeTab === 'short-list' || activeTab === 'target-list') && listSearch.trim()) list = list.filter(p => p.name.toLowerCase().includes(listSearch.trim().toLowerCase()));
    return list;
  }, [activeTab, extPlayers, playerTierMap, filterFoot, filterPos, filterProfile, filterScout, filterGrade, filterAgeMin, filterAgeMax, filterHeightMin, filterHeightMax, scopeYearMin, scopeYearMax, dbSearch, filterTransfer, filterVideo, filterYob, filterTeam, filterNat, filterForms, filterWeek, methodFilter, llSearch, llRaised, listSearch]);

  const currentArchivedSet = useMemo((): Set<string> => {
    if (activeTab === 'settings' || activeTab === 'database') return new Set();
    return archivedByTier.get(activeTab as PipelineTier) || new Set();
  }, [activeTab, archivedByTier]);

  const counts = useMemo(() => ({
    database:      extPlayers.filter(p => !playerTierMap.has(p.id)).length,
    'long-list':   extPlayers.filter(p => playerTierMap.get(p.id) === 'long-list').length,
    'short-list':  extPlayers.filter(p => playerTierMap.get(p.id) === 'short-list').length,
    'target-list': extPlayers.filter(p => playerTierMap.get(p.id) === 'target-list').length,
    'signed-list': INITIAL_SIGNED_PLAYERS.length,
    'reports':     null,
    'settings':    null,
  }), [extPlayers, playerTierMap]);

  const moveTo = (id: string, tier: PipelineTier) => { setTier(id, tier); setOpenDropdownId(null); };
  const sendForward   = (id: string) => {
    if (activeTab === 'database')   moveTo(id, 'long-list');
    if (activeTab === 'long-list')  moveTo(id, 'short-list');
    if (activeTab === 'short-list') moveTo(id, 'target-list');
  };
  const sendBackward  = (id: string) => {
    if (activeTab === 'short-list')  { setTier(id, 'long-list'); }
    if (activeTab === 'target-list') { setTier(id, 'short-list'); }
    setOpenDropdownId(null);
  };
  const archivePlayer = (id: string) => {
    if (activeTab === 'settings' || activeTab === 'database') return;
    const tier = activeTab as PipelineTier;
    setArchivedByTier(prev => { const n = new Map(prev); const s = new Set(n.get(tier) || new Set<string>()); s.add(id); n.set(tier, s); return n; });
    setOpenDropdownId(null);
  };
  const restorePlayer = (id: string) => {
    if (activeTab === 'settings' || activeTab === 'database') return;
    const tier = activeTab as PipelineTier;
    setArchivedByTier(prev => { const n = new Map(prev); const s = new Set(n.get(tier) || new Set<string>()); s.delete(id); n.set(tier, s); return n; });
    setOpenDropdownId(null);
  };

  const isListTab = activeTab !== 'settings' && activeTab !== 'signed-list' && activeTab !== 'reports';

  const filterBarProps = {
    filterFoot, setFilterFoot, filterHeightMin, setFilterHeightMin, filterHeightMax, setFilterHeightMax,
    filterAgeMin, setFilterAgeMin, filterAgeMax, setFilterAgeMax, filterPos, setFilterPos,
    filterProfile, setFilterProfile, filterScout, setFilterScout,
    filterGrade, setFilterGrade, archiveView, setArchiveView,
  };

  return (
    <div className="flex flex-col w-full min-w-0">
      <EditColumnsModal open={colsModalOpen} columns={PLAYER_COLUMNS} visible={visibleColIds} onApply={setVisibleColIds} onClose={() => setColsModalOpen(false)} />
      <div className="pt-6 mb-3">
        <h1 className="font-heading font-semibold text-[32px] tracking-tight text-foreground flex items-center gap-4 leading-none">
          {PAGE_TITLES[activeTab].first}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
            {PAGE_ICON_NODES[activeTab]}
          </div>
          {PAGE_TITLES[activeTab].rest}
        </h1>
        <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">{TAB_SUBTITLES[activeTab]}</p>
      </div>

      <div className={`bg-card border border-border rounded-[24px] mb-6 ${isListTab ? 'h-[calc(100vh-210px)] flex flex-col overflow-hidden' : ''}`}>
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-border rounded-t-[24px] bg-card">
        {/* Tabs — desktop: all inline, drag to reorder */}
        <div className="hidden md:flex items-center gap-1 flex-wrap">
          {orderedTabs.map(tab => {
            const count = counts[tab.id as keyof typeof counts];
            const isActive = activeTab === tab.id;
            const isDragging = dragTabId === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                draggable
                onDragStart={e => { setDragTabId(tab.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', tab.id); }}
                onDragOver={e => { e.preventDefault(); if (dragTabId) reorderTab(dragTabId, tab.id); }}
                onDrop={e => { e.preventDefault(); setDragTabId(null); }}
                onDragEnd={() => setDragTabId(null)}
                title="Drag to reorder"
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm transition-colors border whitespace-nowrap cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40 ring-2 ring-primary' : ''} ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
                {tab.label}
                {count !== null && count > 0 && (
                  <span className={`font-body text-micro font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-card/20 text-white' : 'bg-primary/15 text-foreground'}`}>{count}</span>
                )}
              </button>
            );
          })}
          {isCustomOrder && (
            <button onClick={resetTabOrder} title="Reset tab order"
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
        {/* Tabs — mobile: active label + 'More ▾' dropdown */}
        <div className="md:hidden relative">
          <button onClick={() => setTabsMenuOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-body font-bold text-body-sm">
            <span className="truncate max-w-[160px]">{TABS.find(t => t.id === activeTab)?.label ?? 'Select'}</span>
            <ChevronDown size={14} className={`shrink-0 transition-transform ${tabsMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {tabsMenuOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl overflow-hidden min-w-[200px] py-1">
              {orderedTabs.map((tab, idx) => {
                const count = counts[tab.id as keyof typeof counts];
                const isActive = activeTab === tab.id;
                return (
                  <div key={tab.id} className="flex items-center gap-1 pl-2 pr-1">
                    <button onClick={() => { setActiveTab(tab.id); setTabsMenuOpen(false); }}
                      className={`flex-1 flex items-center justify-between gap-2 px-2 py-2 rounded-lg font-body font-bold text-body-sm ${isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent'}`}>
                      {tab.label}
                      {count !== null && count > 0 && <span className="font-body text-micro font-black px-2 py-0.5 rounded-full bg-primary/15 text-foreground">{count}</span>}
                    </button>
                    <button onClick={() => moveTab(tab.id, -1)} disabled={idx === 0} title="Move up"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 shrink-0"><ChevronDown size={13} className="rotate-180" /></button>
                    <button onClick={() => moveTab(tab.id, 1)} disabled={idx === orderedTabs.length - 1} title="Move down"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-30 shrink-0"><ChevronDown size={13} /></button>
                  </div>
                );
              })}
              {isCustomOrder && (
                <button onClick={resetTabOrder}
                  className="w-full flex items-center gap-2 px-4 py-2 mt-1 border-t border-border font-body font-bold text-body-sm text-muted-foreground hover:bg-accent">
                  <RotateCcw size={13} /> Reset order
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1" />
        {activeTab === 'signed-list' && (
          <>
            <button onClick={() => setColsModalOpen(true)} aria-label="Columns"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground shrink-0 transition-colors">
              <Columns3 size={14} /> <span className="hidden sm:inline">Columns</span>
            </button>
            <button onClick={() => setSignedAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm border border-border bg-card text-primary hover:border-primary hover:bg-accent shrink-0 transition-colors">
              <Plus size={14} /> Add Signed Player
            </button>
          </>
        )}
        {isListTab && (
          <div className="flex items-center bg-accent rounded-full p-1 gap-1 shrink-0">
            <button onClick={() => setViewMode('table')} title="Table View"
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <List size={14} />
            </button>
            <button onClick={() => setViewMode('card')} title="Card View"
              className={`p-2 rounded-full flex items-center justify-center transition-colors ${viewMode === 'card' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
        )}
        {/* Filters — desktop toggles the inline panel/toolbar; mobile opens a bottom-sheet (non-database only) */}
        {isListTab && (
          <>
            <button onClick={() => setShowFilters(s => !s)}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm border shrink-0 transition-colors ${showFilters ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
              <SlidersHorizontal size={14} /> Filters
            </button>
            {activeTab !== 'database' && (
              <button onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm border border-border bg-card text-muted-foreground shrink-0">
                <SlidersHorizontal size={14} /> Filters
              </button>
            )}
            <button onClick={() => setColsModalOpen(true)} aria-label="Columns"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-body-sm border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground shrink-0 transition-colors">
              <Columns3 size={14} /> <span className="hidden sm:inline">Columns</span>
            </button>
          </>
        )}
        {isListTab && (
          <div className="flex flex-col gap-1 items-start shrink-0">
            <span className="flex items-center gap-1 font-body text-caption font-bold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-[#3A8C6A] inline-block" />Scouted</span>
            <span className="flex items-center gap-1 font-body text-caption font-bold text-muted-foreground"><span className="w-2 h-2 rounded-full bg-[#E05C4B] inline-block" />Unscouted</span>
          </div>
        )}
      </div>

      {activeTab === 'settings' && <div className="p-4"><ScopeSettingsPanel profileTypes={profileTypes} onAddProfile={addProfile} onEditProfile={editProfile} onDeleteProfile={deleteProfile} loggedInRole={loggedInRole} scopeYearMin={scopeYearMin} setScopeYearMin={setScopeYearMin} scopeYearMax={scopeYearMax} setScopeYearMax={setScopeYearMax} /></div>}

      {activeTab === 'reports' && <div className="p-4"><ReportsHub extraSubmissions={filedSubmissions} /></div>}

      {activeTab === 'signed-list' && <div className="p-4"><SignedListTab extraCols={extraCols} showAdd={signedAddOpen} setShowAdd={setSignedAddOpen} /></div>}

      {isListTab && (
        <>
          {/* Database: light toolbar replaces the blue FilterBar */}
          {activeTab === 'database' && showFilters && (
            <div className="px-4 py-3 border-b border-border">
              <DatabaseToolbar scopeYearMin={scopeYearMin} scopeYearMax={scopeYearMax}
                filterPos={filterPos} setFilterPos={setFilterPos}
                visibleStats={visibleStats} setVisibleStats={setVisibleStats}
                dbSearch={dbSearch} setDbSearch={setDbSearch} />
            </div>
          )}
          {/* Long List: light toolbar replaces the blue FilterBar */}
          {activeTab === 'long-list' && showFilters && (
            <div className="px-4 py-3 border-b border-border">
              <LongListToolbar methodFilter={methodFilter} setMethodFilter={setMethodFilter}
                filters={[
                  { label: 'Transfer', value: filterTransfer, setValue: setFilterTransfer, options: TRANSFER_OPTS },
                  { label: 'Video', value: filterVideo, setValue: setFilterVideo, options: ['Has footage', 'No footage'] },
                  { label: 'YOB', value: filterYob, setValue: setFilterYob, options: yobOptions },
                  { label: 'Position', value: filterPos, setValue: setFilterPos, options: POSITION_LIST.map(p => p.pos) },
                  { label: 'Team', value: filterTeam, setValue: setFilterTeam, options: TEAM_LIST },
                  { label: 'Nationality', value: filterNat, setValue: setFilterNat, options: NAT_LIST },
                  { label: 'Forms', value: filterForms, setValue: setFilterForms, options: FORM_OPTS },
                  { label: 'Scout', value: filterScout, setValue: setFilterScout, options: SCOUTS },
                  { label: 'Week', value: filterWeek, setValue: setFilterWeek, options: WEEK_OPTS },
                ]}
                search={llSearch} setSearch={setLlSearch} />
            </div>
          )}
          {/* Desktop: inline filter panel, toggled by the Filters button (visible by default) */}
          {activeTab !== 'database' && activeTab !== 'long-list' && showFilters && (
            <div className="hidden md:block px-4 py-3 border-b border-border">
              <ListFilterToolbar {...filterBarProps} search={listSearch} setSearch={setListSearch} />
            </div>
          )}
          {/* Mobile: filters as a bottom-sheet that slides up */}
          {activeTab !== 'database' && activeTab !== 'long-list' && mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative z-10 bg-background rounded-t-[24px] max-h-[80vh] overflow-y-auto p-4 pb-8 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-bold text-body-lg text-foreground">Filters</span>
                  <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"><X size={16} /></button>
                </div>
                <FilterBar {...filterBarProps} />
              </div>
            </div>
          )}
          <div className={`w-full ${viewMode === 'card' ? 'flex-1 min-h-0 overflow-auto hide-scrollbar px-4 pb-4' : 'flex-1 min-h-0 flex flex-col'}`}>
            {viewMode === 'card' ? (
              <CardView players={currentPoolPlayers} archivedSet={currentArchivedSet} archiveView={archiveView}
                flagMap={flagMap} currentTab={activeTab as Exclude<SeniorTab, 'settings'>}
                onReserve={id => moveTo(id, 'long-list')} onShort={id => moveTo(id, 'short-list')}
                onSendForward={sendForward} onArchive={archivePlayer}
                onSendBackward={sendBackward} onRestore={restorePlayer} />
            ) : activeTab === 'target-list' ? (
              <TargetSuperTable players={currentPoolPlayers} archivedSet={currentArchivedSet} archiveView={archiveView}
                currentTab={activeTab as Exclude<SeniorTab, 'settings'>}
                flagMap={flagMap} openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                onArchive={archivePlayer} onRestore={restorePlayer} targetDataMap={targetDataMap} onUpdateTarget={updateTarget}
                openNotesId={openNotesId} setOpenNotesId={setOpenNotesId}
                onOpenVideos={setVideoPlayer} extraCols={extraCols} highlightId={highlightId} />
            ) : activeTab === 'short-list' ? (
              <ShortListTable players={currentPoolPlayers} archivedSet={currentArchivedSet} archiveView={archiveView}
                currentTab={activeTab as Exclude<SeniorTab, 'settings'>}
                flagMap={flagMap} openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                onSendForward={sendForward} onSendBackward={sendBackward} onArchive={archivePlayer} onRestore={restorePlayer}
                profileTypes={profileTypes}
                openNotesId={openNotesId} setOpenNotesId={setOpenNotesId}
                raisedPlayerIds={new Set<string>(SL_PLAYERS.slice(0,3).map(p=>p.id))}
                onOpenVideos={setVideoPlayer} highlightId={highlightId} />
            ) : (
              <PlayerTable players={currentPoolPlayers} archivedSet={currentArchivedSet}
                archiveView={activeTab === 'long-list' ? (methodFilter === 'archive' ? 'audit' : 'active') : archiveView}
                currentTab={activeTab as Exclude<SeniorTab, 'settings'>} flagMap={flagMap}
                openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
                onReserve={id => { const p = currentPoolPlayers.find(x => x.id === id); moveTo(id, 'target-list'); toast.success(`Moved ${p?.name ?? 'Player'} to Target List`); }}
                onShort={id => { const p = currentPoolPlayers.find(x => x.id === id); moveTo(id, 'short-list'); toast.success(`Moved ${p?.name ?? 'Player'} to Short List`); }}
                onSendForward={sendForward} onArchive={archivePlayer} onRestore={restorePlayer}
                raisedPlayerIds={llRaised} loggedInRole={loggedInRole}
                profileTypes={profileTypes} extraCols={extraCols} visibleStats={visibleStats} highlightId={highlightId}
                onOpenVideos={setVideoPlayer} />
            )}
          </div>
        </>
      )}
      </div>

      {videoPlayer && <PlayerVideoWorkspace player={videoPlayer} onClose={() => setVideoPlayer(null)} onSaveReport={fileSubmission} />}
    </div>
  );
}