import React, { useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRightLeft, Calendar, Check, ChevronDown, ChevronRight,
  ChevronUp, ClipboardList, Clock, Info, ListChecks, MapPin, Maximize2, Palette, Play,
  Plus, Radio, RotateCcw, Save, Settings, Shield, Shirt, Sparkles, Square, Target,
  Timer, UserX, Video, Volume2, X, Zap,
} from 'lucide-react';
import { Switch } from './ui/switch';
import type { Match } from '../pages/MatchesView';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  name: string;
  jersey: number;
  yob: number;
  starter: boolean;
  sub: boolean;
  seasonStarts: number;
  seasonSubs: number;
}

interface KitColors {
  jersey: string;
  shorts: string;
}

interface TeamState {
  players: Player[];
  kit: KitColors;
}

type TeamSide = 'home' | 'away';
type PlayerFilter = 'all' | 'lt6starts' | 'lt6either';
type EntryTab = 'lineups' | 'events';

interface MatchEntryProps {
  match: Match;
  competitionName: string;
  roundName: string;
  onBackToCompetitions: () => void;
  onBackToCompetition: () => void;
}

// ─── Kit palette ─────────────────────────────────────────────────────────────

const DEFAULT_PALETTE: { hex: string; name: string }[] = [
  { hex: '#D32F2F', name: 'Red' },
  { hex: '#1565C0', name: 'Blue' },
  { hex: '#2E7D32', name: 'Green' },
  { hex: '#FBC02D', name: 'Yellow' },
  { hex: '#EF6C00', name: 'Orange' },
  { hex: '#6A1B9A', name: 'Purple' },
  { hex: '#F5F5F5', name: 'White' },
  { hex: '#111111', name: 'Black' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#800000', name: 'Maroon' },
  { hex: '#6B7280', name: 'Gray' },
];

function colorName(hex: string, palette: { hex: string; name: string }[]) {
  return palette.find(c => c.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex.toUpperCase();
}

// ─── Mock rosters ────────────────────────────────────────────────────────────

let playerSeq = 0;
function p(
  name: string, jersey: number, yob: number,
  starter: boolean, sub: boolean, seasonStarts: number, seasonSubs: number
): Player {
  playerSeq += 1;
  return { id: `player-${playerSeq}`, name, jersey, yob, starter, sub, seasonStarts, seasonSubs };
}

function seedTeams(): { home: TeamState; away: TeamState } {
  return {
    home: {
      kit: { jersey: '#D32F2F', shorts: '#111111' },
      players: [
        p('Nana Kwame Nkpanibake', 7, 2007, true, false, 12, 2),
        p('Daniel Goku', 10, 2008, true, false, 9, 1),
        p('Emmanuel Boateng', 1, 2007, true, false, 14, 0),
        p('Kofi Mensah', 4, 2008, false, false, 3, 4),
        p('Ibrahim Sesay', 8, 2007, true, false, 8, 3),
        p('Samuel Etoo Jr', 9, 2008, false, true, 2, 7),
        p('Yaw Darko', 11, 2007, false, true, 4, 5),
        p('Chidi Okafor', 5, 2008, false, false, 1, 2),
        p('Moussa Traoré', 6, 2007, true, false, 11, 1),
      ],
    },
    away: {
      kit: { jersey: '#1565C0', shorts: '#F5F5F5' },
      players: [
        p('Abdoulaye Diallo', 1, 2007, true, false, 13, 0),
        p('Cheikh Ndiaye', 3, 2008, false, false, 2, 3),
        p('Pape Gueye', 7, 2007, true, false, 10, 2),
        p('Ousmane Sarr', 9, 2008, false, true, 3, 6),
        p('Mamadou Kane', 10, 2007, true, false, 12, 1),
        p('Idrissa Fall', 5, 2008, false, false, 1, 1),
        p('Serigne Mbaye', 11, 2007, false, true, 5, 4),
        p('Aliou Cissé Jr', 8, 2008, true, false, 7, 2),
      ],
    },
  };
}

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTERS: { id: PlayerFilter; label: string; caption: string }[] = [
  { id: 'all', label: 'All', caption: 'Showing all players.' },
  { id: 'lt6starts', label: 'Less than 6 Starts', caption: 'Showing players with fewer than 6 starts this season.' },
  { id: 'lt6either', label: 'Less than 6 Starts or Subs', caption: 'Showing players with fewer than 6 combined starts and sub appearances this season.' },
];

function matchesFilter(player: Player, filter: PlayerFilter) {
  if (filter === 'lt6starts') return player.seasonStarts < 6;
  if (filter === 'lt6either') return player.seasonStarts + player.seasonSubs < 6;
  return true;
}

// ─── Small pieces ────────────────────────────────────────────────────────────

function ShortsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h16l2 13h-8l-2-7-2 7H2L4 5Z" />
      <path d="M4 8h16" />
    </svg>
  );
}

function teamInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('');
}

// ─── Kit Colors modal (2-step wizard) ────────────────────────────────────────

function KitColorsModal({
  teamName, initialKit, palette, onAddToPalette, onCancel, onSave,
}: {
  teamName: string;
  initialKit: KitColors;
  palette: { hex: string; name: string }[];
  onAddToPalette: (hex: string) => void;
  onCancel: () => void;
  onSave: (kit: KitColors) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [jersey, setJersey] = useState<string>(initialKit.jersey);
  const [shorts, setShorts] = useState<string>(initialKit.shorts);
  const [customColor, setCustomColor] = useState('#1E88E5');

  const activeColor = step === 1 ? jersey : shorts;
  const pickColor = (hex: string) => {
    if (step === 1) {
      setJersey(hex);
      setStep(2);
    } else {
      setShorts(hex);
    }
  };

  const stepCard = (target: 1 | 2, label: string, icon: React.ReactNode, value: string) => {
    const active = step === target;
    return (
      <button
        onClick={() => setStep(target)}
        className={`flex-1 flex flex-col gap-2 p-4 rounded-[20px] border-2 text-left transition-colors ${
          active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
      >
        <span className={`flex items-center gap-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
          {icon}
          <span className="font-heading font-semibold text-[14px] text-foreground">{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full border-2 border-border shadow-sm shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-body font-bold text-[12px] text-muted-foreground truncate">
            {colorName(value, palette)}
          </span>
          {active && (
            <span className="ml-auto inline-flex items-center gap-1 font-heading font-bold text-[10px] uppercase tracking-widest text-primary shrink-0">
              <Check size={12} className="shrink-0" />
              Selected
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-[24px] shadow-[var(--shadow-2xl)] w-full max-w-lg max-h-[90vh] border border-border flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-primary rounded-t-[24px] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center font-heading font-bold text-[12px] text-chalk shrink-0">
              {teamInitials(teamName)}
            </span>
            <div className="min-w-0">
              <span className="font-heading font-semibold text-[16px] text-chalk block truncate">Team Kit Colors</span>
              <span className="font-body text-[12px] text-chalk/60 block truncate">{teamName} · Current Kit</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-chalk/60 hover:text-chalk shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Step progress */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-semibold text-[14px] text-foreground">
              {step === 1 ? 'Step 1/2: Select Jersey Color' : 'Step 2/2: Select Shorts Color'}
            </span>
            <div className="h-1 rounded-full bg-accent overflow-hidden">
              <div
                className={`h-full bg-primary rounded-full transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`}
              />
            </div>
          </div>

          {/* Jersey / Shorts step cards */}
          <div className="flex flex-col sm:flex-row gap-3">
            {stepCard(1, 'Jersey Color', <Shirt size={14} className="shrink-0" />, jersey)}
            {stepCard(2, 'Shorts Color', <ShortsIcon size={14} />, shorts)}
          </div>

          {/* Palette grid */}
          <div className="flex flex-col gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
              Palette
            </span>
            <div className="grid grid-cols-6 gap-2">
              {palette.map(color => (
                <button
                  key={color.hex}
                  title={color.name}
                  onClick={() => pickColor(color.hex)}
                  className={`w-10 h-10 rounded-xl border border-border transition-all cursor-pointer ${
                    activeColor.toLowerCase() === color.hex.toLowerCase()
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-card'
                      : 'hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-card'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
              Custom Color
            </span>
            <input
              type="color"
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              className="w-10 h-10 p-1 bg-card border border-border rounded-xl cursor-pointer"
            />
            <button
              onClick={() => onAddToPalette(customColor)}
              className="inline-flex items-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-4 py-2 font-body font-bold text-[12px] transition-colors"
            >
              <Palette size={12} className="shrink-0" />
              Add to Palette
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onCancel}
            className="bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors shadow-sm"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => onSave({ jersey, shorts })}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors shadow-sm"
              >
                <Check size={14} className="shrink-0" />
                Save Kit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Player row ──────────────────────────────────────────────────────────────

function PlayerRow({
  player, onToggleRole, onJerseyChange,
}: {
  player: Player;
  onToggleRole: (role: 'starter' | 'sub', value: boolean) => void;
  onJerseyChange: (jersey: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(player.jersey));

  const commit = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n) && n > 0 && n < 100) onJerseyChange(n);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/40 last:border-b-0 flex-wrap">
      <span className="w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center font-mono font-bold text-[12px] text-foreground shrink-0">
        {player.jersey}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-heading font-semibold text-[14px] text-foreground truncate" title={player.name}>
          {player.name}
        </span>
        <span className="font-body font-medium text-[12px] text-muted-foreground">YOB {player.yob}</span>
      </div>

      {editing ? (
        <input
          type="number"
          autoFocus
          value={draft}
          min={1}
          max={99}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(String(player.jersey)); setEditing(false); }
          }}
          className="w-16 bg-card border border-border rounded-xl px-2 py-1 font-mono font-bold text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shrink-0"
        />
      ) : (
        <button
          onClick={() => { setDraft(String(player.jersey)); setEditing(true); }}
          className="bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-3 py-1 font-body font-bold text-[12px] transition-colors shrink-0"
        >
          Edit J. No.
        </button>
      )}

      <label className="flex items-center gap-2 shrink-0 cursor-pointer">
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Starter</span>
        <Switch checked={player.starter} onCheckedChange={v => onToggleRole('starter', v)} />
      </label>
      <label className="flex items-center gap-2 shrink-0 cursor-pointer">
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Sub</span>
        <Switch checked={player.sub} onCheckedChange={v => onToggleRole('sub', v)} />
      </label>
    </div>
  );
}

// ─── Team card ───────────────────────────────────────────────────────────────

function TeamCard({
  side, name, team, filter, onToggleRole, onJerseyChange, onEditKit,
}: {
  side: TeamSide;
  name: string;
  team: TeamState;
  filter: PlayerFilter;
  onToggleRole: (playerId: string, role: 'starter' | 'sub', value: boolean) => void;
  onJerseyChange: (playerId: string, jersey: number) => void;
  onEditKit: () => void;
}) {
  const starters = team.players.filter(pl => pl.starter).length;
  const subs = team.players.filter(pl => pl.sub).length;
  const visible = team.players.filter(pl => matchesFilter(pl, filter));

  return (
    <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-heading font-semibold text-[16px] text-foreground truncate" title={name}>
          {name}
        </h4>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full border font-heading font-bold text-[10px] uppercase tracking-widest shrink-0 ${
            side === 'home'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
          }`}
        >
          {side === 'home' ? 'Home' : 'Away'}
        </span>
      </div>

      {/* Kit row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            title={`Jersey: ${colorName(team.kit.jersey, DEFAULT_PALETTE)}`}
            className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
            style={{ backgroundColor: team.kit.jersey }}
          />
          <span
            title={`Shorts: ${colorName(team.kit.shorts, DEFAULT_PALETTE)}`}
            className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
            style={{ backgroundColor: team.kit.shorts }}
          />
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            Kit
          </span>
        </div>
        <button
          onClick={onEditKit}
          className="inline-flex items-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-4 py-1 font-body font-bold text-[12px] transition-colors"
        >
          <Palette size={12} className="shrink-0" />
          Edit Kit Colors
        </button>
      </div>

      {/* Counter */}
      <span className="font-body font-bold text-[12px] text-muted-foreground">
        {starters} Starters &amp; {subs} Subs
      </span>

      {/* Roster */}
      {team.players.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <UserX size={16} className="text-muted-foreground" />
          </span>
          <span className="font-body font-medium text-[12px] text-muted-foreground">
            No players registered for this team yet.
          </span>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <UserX size={16} className="text-muted-foreground" />
          </span>
          <span className="font-body font-medium text-[12px] text-muted-foreground">
            No players match the active filter.
          </span>
        </div>
      ) : (
        <div className="flex flex-col">
          {visible.map(pl => (
            <PlayerRow
              key={pl.id}
              player={pl}
              onToggleRole={(role, value) => onToggleRole(pl.id, role, value)}
              onJerseyChange={jersey => onJerseyChange(pl.id, jersey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Match Events tab (Phase 4 — detailed match entry) ──────────────────────

type DurationMode = 'regular' | 'extra';
type CaptureMode = 'live' | 'video';

interface MatchEventItem {
  id: string;
  typeId: string;
  team: TeamSide;
  playerName: string;
  minute: number;
}

const PHASES: { id: string; label: string }[] = [
  { id: 'pre-match', label: 'Pre-Match' },
  { id: 'kickoff-1st', label: 'Kick-Off (1st Half)' },
  { id: 'half-time', label: 'Half-Time' },
  { id: '2nd-half', label: '2nd Half Start' },
  { id: 'full-time-90', label: "Full-Time (90')" },
  { id: 'et-start', label: 'Extra-Time Start' },
  { id: 'et-end', label: 'Extra-Time End' },
  { id: 'post-match', label: 'Post-Match' },
];

const EVENT_TYPES: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; chipClass: string }[] = [
  { id: 'goal', label: 'Goal', icon: Target, chipClass: 'bg-primary/10 text-primary' },
  { id: 'assist', label: 'Assist', icon: Zap, chipClass: 'bg-primary/10 text-primary' },
  { id: 'yellow-card', label: 'Yellow Card', icon: Square, chipClass: 'bg-[#E8A838]/10 text-[#E8A838]' },
  { id: 'red-card', label: 'Red Card', icon: Square, chipClass: 'bg-destructive/10 text-destructive' },
  { id: 'substitution', label: 'Substitution', icon: ArrowRightLeft, chipClass: 'bg-accent text-muted-foreground' },
  { id: 'chance', label: 'Chance', icon: Sparkles, chipClass: 'bg-primary/10 text-primary' },
  { id: 'save', label: 'Save', icon: Shield, chipClass: 'bg-[#22C55E]/10 text-[#22C55E]' },
  { id: 'foul', label: 'Foul', icon: AlertTriangle, chipClass: 'bg-destructive/10 text-destructive' },
];

function nowStamp() {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

let eventSeq = 0;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
      {children}
    </span>
  );
}

function SelectField({
  value, onChange, children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-card border border-border rounded-xl pl-4 pr-8 py-2 font-body font-bold text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function TeamAvatar({ name }: { name: string }) {
  return (
    <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-heading font-bold text-[12px] text-chalk shrink-0">
      {teamInitials(name)}
    </span>
  );
}

function MatchEventsTab({
  match, competitionName, roundName, teams, onViewLineups,
}: {
  match: Match;
  competitionName: string;
  roundName: string;
  teams: { home: TeamState; away: TeamState };
  onViewLineups: () => void;
}) {
  const [duration, setDuration] = useState<DurationMode>('regular');
  const [mode, setMode] = useState<CaptureMode>('video');
  const [phaseTimes, setPhaseTimes] = useState<Record<string, string>>({});
  const [phasesOpen, setPhasesOpen] = useState(true);
  const [events, setEvents] = useState<MatchEventItem[]>([]);
  const [railSide, setRailSide] = useState<TeamSide>('home');
  const [formType, setFormType] = useState('goal');
  const [formTeam, setFormTeam] = useState<TeamSide>('home');
  const [formPlayer, setFormPlayer] = useState('');
  const [formMinute, setFormMinute] = useState('');

  const teamName = (side: TeamSide) => (side === 'home' ? match.home : match.away);

  const capturedCount = PHASES.filter(ph => phaseTimes[ph.id]).length;
  const currentPhase = [...PHASES].reverse().find(ph => phaseTimes[ph.id]);
  const homeGoals = events.filter(e => e.typeId === 'goal' && e.team === 'home').length;
  const awayGoals = events.filter(e => e.typeId === 'goal' && e.team === 'away').length;
  const maxMinute = duration === 'extra' ? 120 : 90;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.minute - b.minute),
    [events]
  );

  const parsedMinute = parseInt(formMinute, 10);
  const canAdd =
    formPlayer !== '' &&
    !Number.isNaN(parsedMinute) &&
    parsedMinute >= 1 &&
    parsedMinute <= maxMinute;

  const capturePhase = (id: string) => {
    setPhaseTimes(prev => ({ ...prev, [id]: nowStamp() }));
  };
  const clearPhase = (id: string) => {
    setPhaseTimes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addEvent = () => {
    const player = teams[formTeam].players.find(pl => pl.id === formPlayer);
    if (!player || !canAdd) return;
    eventSeq += 1;
    setEvents(prev => [
      ...prev,
      { id: `event-${eventSeq}`, typeId: formType, team: formTeam, playerName: player.name, minute: parsedMinute },
    ]);
    setFormPlayer('');
    setFormMinute('');
  };

  const railTeam = teams[railSide];
  const railActive = railTeam.players.filter(pl => pl.starter || pl.sub).length;

  const durationCard = (target: DurationMode, minutes: string, caption: string, chips: string[]) => {
    const active = duration === target;
    return (
      <button
        onClick={() => setDuration(target)}
        className={`flex-1 flex flex-col gap-2 p-4 rounded-[20px] border-2 text-left transition-colors ${
          active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 min-w-0">
            <Timer size={14} className={`shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-heading font-semibold text-[14px] text-foreground truncate">
              {target === 'regular' ? 'Regular Time' : 'Extra Time'}
            </span>
          </span>
          {active && (
            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check size={12} className="text-chalk" />
            </span>
          )}
        </span>
        <span className="font-heading font-semibold text-[24px] text-foreground leading-none">{minutes}</span>
        <span className="font-body font-medium text-[12px] text-muted-foreground">{caption}</span>
        <span className="flex items-center gap-2 flex-wrap">
          {chips.map(chip => (
            <span
              key={chip}
              className="px-2 py-0.5 rounded-full bg-accent border border-border font-body font-bold text-[10px] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </span>
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* ── Main column ── */}
      <div className="lg:col-span-2 flex flex-col gap-4 min-w-0">
        {/* Score header */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamAvatar name={match.home} />
              <span className="font-heading font-semibold text-[14px] text-foreground truncate" title={match.home}>
                {match.home}
              </span>
            </div>
            <span className="font-heading font-extrabold text-[36px] tracking-tight text-foreground leading-none whitespace-nowrap shrink-0">
              {homeGoals} – {awayGoals}
            </span>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-heading font-semibold text-[14px] text-foreground truncate text-right" title={match.away}>
                {match.away}
              </span>
              <TeamAvatar name={match.away} />
            </div>
          </div>
          <div className="flex flex-col gap-1 md:items-end md:text-right md:border-l md:border-border md:pl-4 shrink-0">
            <span className="font-heading font-semibold text-[14px] text-foreground">{roundName}</span>
            <span className="font-body font-medium text-[12px] text-muted-foreground">{competitionName}</span>
            <span className="font-mono font-bold text-[12px] text-muted-foreground">{match.date}</span>
            <button
              onClick={onViewLineups}
              className="inline-flex items-center gap-1 font-body font-bold text-[12px] text-primary hover:underline"
            >
              <ClipboardList size={12} className="shrink-0" />
              View Basic Entry
            </button>
          </div>
        </div>

        {/* Video player (mock) */}
        <div className="bg-[#02090F] rounded-[20px] overflow-hidden border border-border shadow-[var(--shadow-lg)]">
          <div className="aspect-video relative flex items-center justify-center">
            <button
              className="w-16 h-16 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-colors shadow-[var(--shadow-md)]"
              title="Play (mock)"
            >
              <Play size={24} className="text-chalk ml-1" />
            </button>
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chalk/10 font-body font-bold text-[10px] uppercase tracking-widest text-chalk/80">
              <Video size={12} className="shrink-0" />
              Match Footage
            </span>
          </div>
          <div className="px-4 py-3 flex items-center gap-3 border-t border-chalk/10">
            <button className="text-chalk/60 hover:text-chalk transition-colors shrink-0" title="Play">
              <Play size={16} />
            </button>
            <span className="font-mono font-bold text-[12px] text-chalk/60 shrink-0">0:00</span>
            <div className="flex-1 h-1 rounded-full bg-chalk/20 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
            </div>
            <span className="font-mono font-bold text-[12px] text-chalk/60 shrink-0">90:00</span>
            <button
              className="px-2 py-0.5 rounded-full bg-chalk/10 font-body font-bold text-[10px] text-chalk/80 hover:text-chalk transition-colors shrink-0"
              title="Playback speed"
            >
              1x
            </button>
            <button className="text-chalk/60 hover:text-chalk transition-colors shrink-0" title="Volume">
              <Volume2 size={16} />
            </button>
            <button className="text-chalk/60 hover:text-chalk transition-colors shrink-0" title="Settings">
              <Settings size={16} />
            </button>
            <button className="text-chalk/60 hover:text-chalk transition-colors shrink-0" title="Fullscreen">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Match Duration selector */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h4 className="font-heading font-semibold text-[16px] text-foreground">Match Duration</h4>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-body font-bold text-[12px]">
              <Timer size={12} className="shrink-0" />
              Current: {duration === 'extra' ? '120' : '90'} min
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {durationCard('regular', '90', '90 minutes + stoppage', ['1-90 min', '45+, 90+'])}
            {durationCard('extra', '120', '120 minutes + stoppage', ['1-120 min', '45+, 90+, 105+, 120+'])}
          </div>
          <span className="flex items-center gap-2 font-body font-medium text-[12px] text-muted-foreground">
            <Info size={12} className="shrink-0" />
            {duration === 'regular'
              ? 'Regular time selected — events can be logged from minute 1 to 90 plus stoppage.'
              : 'Extra time selected — events can be logged from minute 1 to 120 plus stoppage.'}
          </span>
        </div>

        {/* Capture flow indicator + mode toggle */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-bold text-[10px] shrink-0 ${
                  capturedCount > 0 ? 'bg-primary text-chalk' : 'bg-accent border border-border text-muted-foreground'
                }`}
              >
                {capturedCount === PHASES.length ? <Check size={12} /> : '1'}
              </span>
              <span className="font-heading font-semibold text-[14px] text-foreground">Phase Tracking</span>
            </span>
            <span className="font-body font-bold text-[14px] text-muted-foreground">·</span>
            <span className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-heading font-bold text-[10px] shrink-0 ${
                  events.length > 0 ? 'bg-primary text-chalk' : 'bg-accent border border-border text-muted-foreground'
                }`}
              >
                2
              </span>
              <span className="font-heading font-semibold text-[14px] text-foreground">Event Entry</span>
            </span>
          </div>
          <div className="flex items-center bg-accent rounded-full p-0.5">
            {([
              { id: 'live' as const, label: 'Live', icon: Radio },
              { id: 'video' as const, label: 'Video', icon: Video },
            ]).map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-2 px-4 py-1 rounded-full font-body font-bold text-[12px] transition-colors ${
                  mode === m.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <m.icon size={12} className="shrink-0" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Match Phase Tracking */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Clock size={16} className="text-muted-foreground" />
              </span>
              <div className="flex flex-col min-w-0">
                <h4 className="font-heading font-semibold text-[16px] text-foreground">Match Phase Tracking</h4>
                <span className="font-body font-medium text-[12px] text-muted-foreground">
                  {capturedCount}/{PHASES.length} phases captured
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
                Current Phase:
                <span className="text-foreground">{currentPhase ? currentPhase.label : 'Not started'}</span>
              </span>
              <button
                onClick={() => setPhasesOpen(o => !o)}
                className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                title={phasesOpen ? 'Collapse phases' : 'Expand phases'}
              >
                {phasesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
          <div className="h-1 rounded-full bg-accent overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(capturedCount / PHASES.length) * 100}%` }}
            />
          </div>
          {phasesOpen && (
            <div className="flex flex-col">
              {PHASES.map((ph, idx) => {
                const stampedAt = phaseTimes[ph.id];
                return (
                  <div key={ph.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-b-0 flex-wrap">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        stampedAt
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : 'bg-accent border border-border text-muted-foreground'
                      }`}
                    >
                      {stampedAt ? <Check size={14} /> : (
                        <span className="font-mono font-bold text-[12px]">{idx + 1}</span>
                      )}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-heading font-semibold text-[14px] text-foreground truncate">{ph.label}</span>
                      {stampedAt && (
                        <span className="font-mono font-bold text-[12px] text-muted-foreground">at {stampedAt}</span>
                      )}
                    </div>
                    {stampedAt ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => capturePhase(ph.id)}
                          className="inline-flex items-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-3 py-1 font-body font-bold text-[12px] transition-colors"
                        >
                          <RotateCcw size={12} className="shrink-0" />
                          Re-capture
                        </button>
                        <button
                          onClick={() => clearPhase(ph.id)}
                          className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                          title="Clear timestamp"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => capturePhase(ph.id)}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-4 py-1 font-body font-bold text-[12px] transition-colors shadow-sm shrink-0"
                      >
                        <Clock size={12} className="shrink-0" />
                        Capture
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add event */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-heading font-semibold text-[16px] text-foreground">Match Events</h4>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
              {events.length} recorded
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col gap-2">
              <FieldLabel>Event Type</FieldLabel>
              <SelectField value={formType} onChange={setFormType}>
                {EVENT_TYPES.map(t => (
                  <option key={t.id} value={t.id} className="bg-card text-foreground">{t.label}</option>
                ))}
              </SelectField>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Team</FieldLabel>
              <SelectField
                value={formTeam}
                onChange={v => { setFormTeam(v as TeamSide); setFormPlayer(''); }}
              >
                <option value="home" className="bg-card text-foreground">{match.home}</option>
                <option value="away" className="bg-card text-foreground">{match.away}</option>
              </SelectField>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Player</FieldLabel>
              <SelectField value={formPlayer} onChange={setFormPlayer}>
                <option value="" className="bg-card text-foreground">Select player…</option>
                {teams[formTeam].players.map(pl => (
                  <option key={pl.id} value={pl.id} className="bg-card text-foreground">
                    #{pl.jersey} {pl.name}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Minute</FieldLabel>
              <input
                type="number"
                min={1}
                max={maxMinute}
                value={formMinute}
                onChange={e => setFormMinute(e.target.value)}
                placeholder={`1–${maxMinute}`}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 font-mono font-bold text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div>
            <button
              onClick={addEvent}
              disabled={!canAdd}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors shadow-sm ${
                canAdd
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-accent text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Plus size={14} className="shrink-0" />
              Add Event
            </button>
          </div>
        </div>

        {/* Events timeline */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-heading font-semibold text-[16px] text-foreground">Events Timeline</h4>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
              Sorted by minute
            </span>
          </div>
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <ClipboardList size={20} className="text-muted-foreground" />
              </span>
              <span className="font-heading font-semibold text-[14px] text-foreground">No events recorded yet</span>
              <span className="font-body font-medium text-[12px] text-muted-foreground">
                Add your first event using the form above.
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              {sortedEvents.map(ev => {
                const type = EVENT_TYPES.find(t => t.id === ev.typeId) ?? EVENT_TYPES[0];
                const TypeIcon = type.icon;
                return (
                  <div key={ev.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-b-0">
                    <span className="min-w-10 px-2 py-1 rounded-full bg-accent border border-border font-mono font-bold text-[12px] text-foreground text-center shrink-0">
                      {ev.minute}&#39;
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${type.chipClass}`}>
                      <TypeIcon size={14} />
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-heading font-semibold text-[14px] text-foreground truncate">
                        {ev.playerName} · {teamName(ev.team)}
                      </span>
                      <span className="font-body font-medium text-[12px] text-muted-foreground">{type.label}</span>
                    </div>
                    <button
                      onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}
                      className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-destructive hover:text-destructive transition-colors shrink-0"
                      title="Delete event"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right rail ── */}
      <div className="lg:col-span-1 flex flex-col gap-4 min-w-0">
        {/* TEAMS card */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            Teams
          </span>
          <div className="grid grid-cols-2 bg-accent rounded-full p-0.5">
            {(['home', 'away'] as TeamSide[]).map(side => (
              <button
                key={side}
                onClick={() => setRailSide(side)}
                className={`px-4 py-1 rounded-full font-body font-bold text-[12px] transition-colors ${
                  railSide === side ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {side === 'home' ? 'Home' : 'Away'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <TeamAvatar name={teamName(railSide)} />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-heading font-semibold text-[16px] text-foreground truncate" title={teamName(railSide)}>
                {teamName(railSide)}
              </span>
              <span className="inline-flex items-center self-start px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-heading font-bold text-[10px] uppercase tracking-widest">
                Senior Team
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-border/40">
            <FieldLabel>Kit Colors</FieldLabel>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full border-2 border-border shadow-sm shrink-0"
                  style={{ backgroundColor: railTeam.kit.jersey }}
                />
                <span className="font-body font-bold text-[12px] text-muted-foreground">
                  Jersey · {colorName(railTeam.kit.jersey, DEFAULT_PALETTE)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full border-2 border-border shadow-sm shrink-0"
                  style={{ backgroundColor: railTeam.kit.shorts }}
                />
                <span className="font-body font-bold text-[12px] text-muted-foreground">
                  Shorts · {colorName(railTeam.kit.shorts, DEFAULT_PALETTE)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* SQUAD card */}
        <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
              Squad
            </span>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-heading font-bold text-[10px] uppercase tracking-widest">
              {railActive}/{railTeam.players.length} active
            </span>
          </div>
          <div className="grid grid-cols-[32px_1fr_48px_16px] gap-2 items-center">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">#</span>
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Player</span>
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">YOB</span>
            <span />
            {railTeam.players.map(pl => {
              const active = pl.starter || pl.sub;
              return (
                <React.Fragment key={pl.id}>
                  <span className="font-mono font-bold text-[12px] text-foreground py-2 border-t border-border/40">
                    {pl.jersey}
                  </span>
                  <span
                    className="font-body font-bold text-[12px] text-foreground truncate py-2 border-t border-border/40"
                    title={pl.name}
                  >
                    {pl.name}
                  </span>
                  <span className="font-mono font-bold text-[12px] text-muted-foreground py-2 border-t border-border/40">
                    {pl.yob}
                  </span>
                  <span className="py-2 border-t border-border/40 flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-[#22C55E]' : 'bg-muted-foreground/30'}`}
                      title={active ? 'Active (starter or sub)' : 'Inactive'}
                    />
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function MatchEntry({
  match, competitionName, roundName, onBackToCompetitions, onBackToCompetition,
}: MatchEntryProps) {
  const [tab, setTab] = useState<EntryTab>('lineups');
  const [filter, setFilter] = useState<PlayerFilter>('all');
  const [teams, setTeams] = useState(() => seedTeams());
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [kitModalSide, setKitModalSide] = useState<TeamSide | null>(null);
  const [saved, setSaved] = useState(false);

  const activeFilter = useMemo(() => FILTERS.find(f => f.id === filter)!, [filter]);

  const toggleRole = (side: TeamSide, playerId: string, role: 'starter' | 'sub', value: boolean) => {
    setTeams(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        players: prev[side].players.map(pl =>
          pl.id === playerId
            ? {
                ...pl,
                [role]: value,
                // A player can't be both — switching one on switches the other off.
                ...(value ? { [role === 'starter' ? 'sub' : 'starter']: false } : {}),
              }
            : pl
        ),
      },
    }));
  };

  const changeJersey = (side: TeamSide, playerId: string, jersey: number) => {
    setTeams(prev => ({
      ...prev,
      [side]: {
        ...prev[side],
        players: prev[side].players.map(pl => (pl.id === playerId ? { ...pl, jersey } : pl)),
      },
    }));
  };

  const saveKit = (side: TeamSide, kit: KitColors) => {
    setTeams(prev => ({ ...prev, [side]: { ...prev[side], kit } }));
    setKitModalSide(null);
  };

  const addToPalette = (hex: string) => {
    setPalette(prev =>
      prev.some(c => c.hex.toLowerCase() === hex.toLowerCase())
        ? prev
        : [...prev, { hex, name: hex.toUpperCase() }]
    );
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full pb-10">
      {/* ── Header: breadcrumb + title + meta ── */}
      <div className="pt-8 pb-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCompetition}
            className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-foreground transition-colors shadow-sm"
            title="Back to competition"
          >
            <ArrowLeft size={14} />
          </button>
          <nav className="flex items-center gap-2 font-body font-bold text-[14px] min-w-0 flex-wrap">
            <button onClick={onBackToCompetitions} className="text-primary hover:underline shrink-0">
              Competitions
            </button>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <button onClick={onBackToCompetition} className="text-primary hover:underline truncate max-w-[240px]">
              {competitionName}
            </button>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <button onClick={onBackToCompetition} className="text-primary hover:underline truncate max-w-[200px]">
              {roundName}
            </button>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">
              {match.home} vs {match.away}
            </span>
          </nav>
        </div>

        <h1 className="font-heading font-semibold text-[32px] tracking-tight text-foreground flex items-center gap-4 leading-none">
          {match.home} vs {match.away}
          <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
            <ClipboardList size={20} className="text-chalk" />
          </span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
            <Calendar size={12} className="shrink-0" />
            {match.date}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
            <MapPin size={12} className="shrink-0" />
            {match.venue}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* ── Unified tab bar (Lineups / Match Events) ── */}
        <div className="flex items-center gap-6 border-b border-border overflow-x-auto hide-scrollbar">
          {([
            { id: 'lineups' as const, label: 'Lineups', icon: ClipboardList },
            { id: 'events' as const, label: 'Match Events', icon: ListChecks },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 pb-2 -mb-px border-b-2 font-body font-bold text-[14px] whitespace-nowrap transition-colors ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Live-presence banner ── */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-accent/60 border border-border flex-wrap">
          <Info size={12} className="text-muted-foreground shrink-0" />
          <span className="font-body font-medium text-[12px] text-muted-foreground">
            Another scout is viewing this page:
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
            <span className="font-body font-bold text-[12px] text-[#22C55E]">Vanessa Lighthouse</span>
          </span>
        </div>

        {/* ── Match Events tab (kept mounted so capture state survives tab switches) ── */}
        <div className={tab === 'events' ? '' : 'hidden'}>
          <MatchEventsTab
            match={match}
            competitionName={competitionName}
            roundName={roundName}
            teams={teams}
            onViewLineups={() => setTab('lineups')}
          />
        </div>

        {tab === 'lineups' && (
          <>
            {/* ── Player filter ── */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                  Filter Players:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-4 py-2 rounded-full font-body font-bold text-[14px] transition-colors whitespace-nowrap ${
                        filter === f.id
                          ? 'bg-primary text-chalk shadow-sm'
                          : 'bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="font-body font-medium text-[12px] text-muted-foreground">
                {activeFilter.caption}
              </span>
            </div>

            {/* ── Team columns ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TeamCard
                side="home"
                name={match.home}
                team={teams.home}
                filter={filter}
                onToggleRole={(id, role, v) => toggleRole('home', id, role, v)}
                onJerseyChange={(id, j) => changeJersey('home', id, j)}
                onEditKit={() => setKitModalSide('home')}
              />
              <TeamCard
                side="away"
                name={match.away}
                team={teams.away}
                filter={filter}
                onToggleRole={(id, role, v) => toggleRole('away', id, role, v)}
                onJerseyChange={(id, j) => changeJersey('away', id, j)}
                onEditKit={() => setKitModalSide('away')}
              />
            </div>

            {/* ── Footer actions ── */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors shadow-sm"
              >
                <Save size={14} className="shrink-0" />
                Save Submission
              </button>
              <button
                onClick={() => setTab('events')}
                className="inline-flex items-center justify-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors"
              >
                <ListChecks size={14} className="shrink-0" />
                View Detailed Entry
              </button>
              {saved && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-body font-bold text-[12px]">
                  <Check size={12} className="shrink-0" />
                  Submission saved
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Kit Colors modal ── */}
      {kitModalSide && (
        <KitColorsModal
          teamName={kitModalSide === 'home' ? match.home : match.away}
          initialKit={teams[kitModalSide].kit}
          palette={palette}
          onAddToPalette={addToPalette}
          onCancel={() => setKitModalSide(null)}
          onSave={kit => saveKit(kitModalSide, kit)}
        />
      )}
    </div>
  );
}
