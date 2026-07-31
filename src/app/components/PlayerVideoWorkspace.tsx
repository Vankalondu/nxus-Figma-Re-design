import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowLeftRight, ArrowRightLeft, Check, Clapperboard, Flag, Globe,
  LayoutGrid, Maximize, Maximize2, MousePointerClick, PanelRightOpen, Play, Plus, Settings,
  Shield, Sparkles, Square, Tag, Target, Volume2, X, Zap,
} from 'lucide-react';
import {
  GRADE_SCALE, Grade, MOCK_CURRENT_SCOUT, MOCK_REPORT_TIMESTAMP,
  REPORT_CRITERIA_TOTAL, SHORT_REPORT_TEMPLATE, Submission,
} from '../data/reports';
import { getHighlightsFor } from '../state/playerStore';

// ─── Types ───────────────────────────────────────────────────────────────────────
export interface VideoWorkspacePlayer {
  id: string;
  name: string;
  posAcronym?: string;
}

interface PlayerVideo {
  id: string;
  kind: 'match' | 'highlight';
  home: string;
  away: string;
  competition: string;
  season: string;
  round: string;
  date: string;
  title: string;
  hasReport: boolean;
}

interface Props {
  player: VideoWorkspacePlayer;
  onClose: () => void;
  onSaveReport?: (sub: Omit<Submission, 'id'>) => void;
}

type PanelMode = 'tagging' | 'reports';

// ─── Mock data ───────────────────────────────────────────────────────────────────
function getPlayerVideos(player: VideoWorkspacePlayer): PlayerVideo[] {
  const m = (id: string, home: string, away: string, competition: string, season: string, round: string, date: string, hasReport = false): PlayerVideo => ({
    id, kind: 'match', home, away, competition, season, round, date,
    title: `${home} vs ${away}`, hasReport,
  });
  const h = (id: string, title: string, date: string, hasReport = false): PlayerVideo => ({
    id, kind: 'highlight', home: '', away: '', competition: 'Highlight Package', season: '2025', round: 'Clip', date,
    title, hasReport,
  });
  return [
    m('v1',  'Rising Star Academy', 'Asanska Fc',          'ARG Tournament',        '2025', 'Round 1', 'Oct 27, 2025', true),
    m('v2',  'Msk Zilina Africa',   'Rising Star Academy', 'ARG Tournament',        '2025', 'Round 2', 'Oct 28, 2025'),
    m('v3',  'Rising Star Academy', 'Star Makers Fc',      'ARG Tournament',        '2025', 'Round 3', 'Oct 29, 2025'),
    m('v4',  'Daniock SC',          'Rising Star Academy', 'Ghana Friendly Matches', '2025', 'Day 1',  'Feb 20, 2025', true),
    m('v5',  'Rising Star Academy', 'Old Fadama Fc',       'Ghana Friendly Matches', '2025', 'Day 2',  'Feb 21, 2025'),
    m('v6',  'Rising Star Academy', 'JP FC',               'Ghana Friendly Matches', '2025', 'Day 3',  'Feb 22, 2025'),
    m('v7',  'Newlife Fc',          'Rising Star Academy', 'Ghana Friendly Matches', '2025', 'Day 4',  'Feb 23, 2025'),
    m('v8',  'Sakora Fc',           'Rising Star Academy', 'Ghana Friendly Matches', '2025', 'Day 5',  'Feb 24, 2025'),
    m('v9',  'Star Makers Fc',      'Rising Star Academy', 'Ghana Friendly Matches', '2025', 'Day 6',  'Feb 25, 2025'),
    h('v10', `${player.name} Ghana`,      'Mar 04, 2025', true),
    h('v11', `${player.name} [Goal]`,     'Mar 12, 2025'),
    h('v12', `${player.name} Highlights`, 'Apr 02, 2025'),
  ];
}

const VIDEO_DURATION_SEC = 90 * 60;

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Atoms ───────────────────────────────────────────────────────────────────────
const HeaderIconButton = ({ title, onClick, children }: { title: string; onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} title={title}
    className="w-10 h-10 rounded-[12px] bg-primary text-chalk flex items-center justify-center hover:bg-primary/80 transition-colors shadow-sm shrink-0">
    {children}
  </button>
);

const KindBadge = ({ kind }: { kind: 'match' | 'highlight' }) => (
  <span className={`font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
    kind === 'match' ? 'bg-primary text-chalk' : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
  }`}>
    {kind === 'match' ? 'FM' : 'PK'}
  </span>
);

const VideoCard = ({ video, playerName, onClick }: { video: PlayerVideo; playerName: string; onClick: () => void }) => {
  const isMatch = video.kind === 'match';
  return (
    <button onClick={onClick} title="Open video"
      className="text-left bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-3 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
      {/* Thumbnail — dark video surface */}
      <div className="relative aspect-video bg-[#0B0B0B] rounded-[16px] overflow-hidden flex items-center justify-center px-4">
        <span className={`absolute top-2 left-2 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
          isMatch ? 'bg-primary text-chalk' : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
        }`}>
          {isMatch ? 'FM' : 'PK'}
        </span>
        {video.hasReport && (
          <span title="Report filed"
            className="absolute top-2 right-2 inline-flex items-center gap-0.5 bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
            <Check size={10} />R
          </span>
        )}
        {isMatch ? (
          <span className="font-body font-bold text-[14px] text-chalk text-center leading-snug">
            {video.home} <span className="text-chalk/50 font-medium">vs</span> {video.away}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-chalk/10 border border-chalk/20 flex items-center justify-center">
              <Play size={14} className="text-chalk ml-0.5" />
            </div>
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-chalk/60">Highlight</span>
            <span className="font-body font-bold text-[12px] text-chalk text-center leading-snug">{playerName}</span>
          </div>
        )}
      </div>
      {/* Meta */}
      <div className="flex flex-col gap-1 px-1 pb-1 min-w-0">
        <span className="font-heading font-semibold text-[14px] text-foreground truncate">
          {isMatch ? <>{video.home} <span className="text-muted-foreground">vs</span> {video.away}</> : video.title}
        </span>
        <span className="font-body font-medium text-[12px] text-muted-foreground truncate">
          {video.competition} · {video.competition} ({video.season}) · {video.round}
        </span>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="font-body font-medium text-[12px] text-muted-foreground">{video.round}</span>
          <span className="font-body font-medium text-[12px] text-muted-foreground">{video.date}</span>
        </div>
      </div>
    </button>
  );
};

// ─── Filmstrip thumbnail ─────────────────────────────────────────────────────────
const FilmThumb = ({ video, active, onClick }: { video: PlayerVideo; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} title={video.title}
    className={`text-left w-[200px] shrink-0 bg-[#0B0B0B] rounded-[12px] border border-border p-3 flex flex-col gap-2 hover:border-primary/60 transition-colors ${
      active ? 'ring-2 ring-primary' : ''
    }`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 min-w-0">
        <KindBadge kind={video.kind} />
        {video.hasReport && (
          <span title="Report filed"
            className="inline-flex items-center gap-0.5 bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
            <Check size={10} />R
          </span>
        )}
      </div>
      {video.kind === 'match'
        ? <Globe size={12} className="text-chalk/50 shrink-0" />
        : <Clapperboard size={12} className="text-chalk/50 shrink-0" />}
    </div>
    <span className="font-body font-bold text-[12px] text-chalk truncate">{video.title}</span>
    <span className="font-body font-medium text-[10px] text-chalk/50 truncate">
      {video.competition} · {video.round}
    </span>
  </button>
);

// ─── Right work panel: Tagging (Phase 4) ─────────────────────────────────────────
// Timestamped event tagging against the video. Quick-tag buttons stamp the
// current playback position (currentSec); clicking a logged tag seeks to it.
// Event-type set + icons/colors mirror MatchEntry's Match Events for consistency.
const TAG_EVENT_TYPES: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; chipClass: string }[] = [
  { id: 'goal', label: 'Goal', icon: Target, chipClass: 'bg-primary/10 text-primary' },
  { id: 'assist', label: 'Assist', icon: Zap, chipClass: 'bg-primary/10 text-primary' },
  { id: 'chance', label: 'Chance', icon: Sparkles, chipClass: 'bg-primary/10 text-primary' },
  { id: 'save', label: 'Save', icon: Shield, chipClass: 'bg-[#22C55E]/10 text-[#22C55E]' },
  { id: 'foul', label: 'Foul', icon: AlertTriangle, chipClass: 'bg-destructive/10 text-destructive' },
  { id: 'yellow-card', label: 'Yellow Card', icon: Square, chipClass: 'bg-[#E8A838]/10 text-[#E8A838]' },
  { id: 'red-card', label: 'Red Card', icon: Square, chipClass: 'bg-destructive/10 text-destructive' },
  { id: 'substitution', label: 'Substitution', icon: ArrowRightLeft, chipClass: 'bg-accent text-muted-foreground' },
];

interface VideoTag {
  id: number;
  typeId: string;
  sec: number;
  note: string;
}

const TaggingPanel = ({ currentSec, onSeek }: { currentSec: number; onSeek: (sec: number) => void }) => {
  const [tags, setTags] = useState<VideoTag[]>([]);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [draftTypeId, setDraftTypeId] = useState<string>(TAG_EVENT_TYPES[0].id);
  const [draftNote, setDraftNote] = useState('');
  const nextId = useRef(1);

  const addTag = (typeId: string, note = '') => {
    const id = nextId.current;
    nextId.current += 1;
    setTags(prev => [...prev, { id, typeId, sec: currentSec, note: note.trim() }]);
    setActiveTagId(id);
  };

  const addDraftTag = () => {
    addTag(draftTypeId, draftNote);
    setDraftNote('');
  };

  const removeTag = (id: number) => {
    setTags(prev => prev.filter(t => t.id !== id));
    setActiveTagId(prev => (prev === id ? null : prev));
  };

  const selectTag = (tag: VideoTag) => {
    onSeek(tag.sec);
    setActiveTagId(tag.id);
  };

  const sorted = [...tags].sort((a, b) => a.sec - b.sec || a.id - b.id);

  return (
    <aside className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col min-h-[280px] overflow-hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-5 pb-4 flex items-center justify-between gap-2 shrink-0 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground">Tagging</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </span>
        </div>
        <span title="Current video position"
          className="inline-flex items-center gap-1 font-mono font-bold text-[12px] text-muted-foreground bg-accent px-2 py-0.5 rounded-full shrink-0">
          @ {fmtTime(currentSec)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Quick-tag buttons */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Quick Tag</span>
          <div className="grid grid-cols-2 gap-2">
            {TAG_EVENT_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => addTag(t.id)} title={`Tag ${t.label} at ${fmtTime(currentSec)}`}
                  className="flex items-center gap-2 rounded-[12px] border border-border bg-card px-3 py-2 hover:border-primary transition-colors text-left min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${t.chipClass}`}>
                    <Icon size={12} />
                  </span>
                  <span className="font-body font-bold text-[12px] text-foreground truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add with note */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Add With Note</span>
          <div className="flex gap-2">
            <select value={draftTypeId} onChange={e => setDraftTypeId(e.target.value)} title="Tag type"
              className="w-[120px] shrink-0 rounded-[10px] border border-border bg-card px-2 py-2 font-body font-bold text-[12px] text-foreground focus:outline-none focus:border-primary transition-colors">
              {TAG_EVENT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <input value={draftNote} onChange={e => setDraftNote(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addDraftTag(); }}
              placeholder="Optional note…" maxLength={80} title="Optional note"
              className="flex-1 min-w-0 rounded-[10px] border border-border bg-accent/30 px-3 py-2 font-body font-medium text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
          </div>
          <button onClick={addDraftTag} title={`Add tag at ${fmtTime(currentSec)}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2 font-body font-semibold text-[12px] hover:bg-primary/80 transition-colors shadow-sm">
            <Plus size={12} className="shrink-0" />
            Add at {fmtTime(currentSec)}
          </button>
        </div>

        {/* Tags timeline */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Tags</span>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Tag size={20} className="text-muted-foreground" />
              </div>
              <p className="font-body font-bold text-[14px] text-foreground">No tags yet</p>
              <p className="font-body font-medium text-[12px] text-muted-foreground max-w-[220px]">
                Use the buttons above to tag moments as you watch.
              </p>
            </div>
          ) : (
            sorted.map(tag => {
              const type = TAG_EVENT_TYPES.find(t => t.id === tag.typeId) ?? TAG_EVENT_TYPES[0];
              const Icon = type.icon;
              const active = tag.id === activeTagId;
              return (
                <div key={tag.id} role="button" tabIndex={0} onClick={() => selectTag(tag)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTag(tag); } }}
                  title={`Seek to ${fmtTime(tag.sec)}`}
                  className={`flex items-center gap-2 rounded-[12px] border p-3 cursor-pointer transition-colors ${
                    active ? 'border-primary bg-primary/5' : 'border-border bg-accent/30 hover:border-primary'
                  }`}>
                  <span className={`font-mono font-bold text-[12px] px-2 py-0.5 rounded-full shrink-0 ${
                    active ? 'bg-primary text-chalk' : 'bg-accent text-muted-foreground'
                  }`}>
                    {fmtTime(tag.sec)}
                  </span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${type.chipClass}`}>
                    <Icon size={12} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-body font-bold text-[12px] text-foreground block truncate">{type.label}</span>
                    {tag.note && (
                      <span className="font-body font-medium text-[12px] text-muted-foreground block truncate">{tag.note}</span>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeTag(tag.id); }} title="Delete tag"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};

// ─── Right work panel: Reports (Phase 3) ─────────────────────────────────────────
// Fill the shared Short Report template beside the video; saving files a
// submission into the Reports tab and flags the video as reported.
const ReportsPanel = ({ onSave }: { onSave: (progressPct: number) => void }) => {
  const [grades, setGrades] = useState<Record<string, Grade>>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const flashTimer = useRef<number | null>(null);
  useEffect(() => () => { if (flashTimer.current !== null) window.clearTimeout(flashTimer.current); }, []);

  const total = REPORT_CRITERIA_TOTAL;
  const graded = Object.keys(grades).length;
  const pct = total > 0 ? Math.round((graded / total) * 100) : 0;
  const requiredLeft = SHORT_REPORT_TEMPLATE.sections
    .flatMap(s => s.criteria)
    .filter(c => c.required && !grades[c.id]).length;

  const setGrade = (criterionId: string, grade: Grade) =>
    setGrades(prev => {
      if (prev[criterionId] === grade) {
        const next = { ...prev };
        delete next[criterionId];
        return next;
      }
      return { ...prev, [criterionId]: grade };
    });

  const handleSave = () => {
    onSave(pct);
    setGrades({});
    setSavedFlash(true);
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setSavedFlash(false), 3000);
  };

  return (
    <aside className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] flex flex-col min-h-[280px] overflow-hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-5 pb-4 flex flex-col gap-3 shrink-0 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-muted-foreground">Short Report</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="font-body font-medium text-[12px] text-muted-foreground">Creating new report</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono font-bold text-[12px] text-muted-foreground shrink-0">{graded}/{total}</span>
        </div>
        {savedFlash && (
          <span className="inline-flex items-center gap-2 self-start bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 font-body font-bold text-[12px] px-3 py-1 rounded-full">
            <Check size={12} /> Report saved — filed to Reports · Submissions
          </span>
        )}
      </div>

      {/* Graded criteria */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
        {SHORT_REPORT_TEMPLATE.sections.map(section => (
          <div key={section.title} className="flex flex-col gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">{section.title}</span>
            {section.criteria.map(c => (
              <div key={c.id} className="rounded-[12px] border border-border bg-accent/30 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body font-bold text-[12px] text-foreground truncate">{c.label}</span>
                  {c.required && (
                    <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-[#E8A838]/10 text-[#E8A838] px-2 py-0.5 rounded-full shrink-0">Required</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {GRADE_SCALE.map(g => (
                    <button key={g} onClick={() => setGrade(c.id, g)} title={`Grade ${c.label}: ${g}`}
                      className={`py-1 rounded-[10px] font-heading font-bold text-[12px] border transition-colors ${
                        grades[c.id] === g
                          ? 'bg-primary text-chalk border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-5 pt-4 border-t border-border flex flex-col gap-2 shrink-0">
        {requiredLeft > 0 && (
          <p className="font-body font-medium text-[12px] text-muted-foreground">
            Grade {requiredLeft} more required {requiredLeft === 1 ? 'criterion' : 'criteria'} to save.
          </p>
        )}
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={requiredLeft > 0}
            className="flex-1 bg-primary text-primary-foreground rounded-full py-2 font-body font-semibold text-[14px] hover:bg-primary/80 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Save Report
          </button>
          <button onClick={() => setGrades({})} disabled={graded === 0}
            className="px-5 py-2 rounded-full border border-border bg-card text-muted-foreground font-body font-bold text-[14px] hover:border-primary hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Workspace ───────────────────────────────────────────────────────────────────
export function PlayerVideoWorkspace({ player, onClose, onSaveReport }: Props) {
  const [videos, setVideos] = useState<PlayerVideo[]>(() => {
    // Surface any highlights uploaded via the global search for this player.
    const uploaded: PlayerVideo[] = getHighlightsFor(player.id).map(u => ({
      id: u.id, kind: 'highlight', home: '', away: '',
      competition: u.source === 'link' ? 'External link' : 'Uploaded file',
      season: '2026', round: 'Clip', date: u.addedLabel, title: u.title, hasReport: false,
    }));
    return [...uploaded, ...getPlayerVideos(player)];
  });
  const [selectedVideo, setSelectedVideo] = useState<PlayerVideo | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('reports');
  const [focus, setFocus] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);

  const openVideo = (v: PlayerVideo) => {
    setSelectedVideo(v);
    setCurrentSec(0);
  };
  const backToLibrary = () => {
    setSelectedVideo(null);
    setFocus(false);
  };
  const seek = (delta: number) =>
    setCurrentSec(prev => Math.min(VIDEO_DURATION_SEC, Math.max(0, prev + delta)));

  // Mock-save: file a Short Report submission into the shared Reports data
  // and flip this video's hasReport so its ✓R badge shows.
  const handleSaveReport = (videoId: string) => (progressPct: number) => {
    onSaveReport?.({
      formName: SHORT_REPORT_TEMPLATE.name,
      formType: SHORT_REPORT_TEMPLATE.formType,
      scoutName: MOCK_CURRENT_SCOUT.name,
      scoutInitials: MOCK_CURRENT_SCOUT.initials,
      status: 'Submitted',
      timestamp: MOCK_REPORT_TIMESTAMP,
      progress: progressPct,
      playerName: player.name,
    });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, hasReport: true } : v));
    setSelectedVideo(prev => prev && prev.id === videoId ? { ...prev, hasReport: true } : prev);
  };

  const isMatch = selectedVideo?.kind === 'match';
  const filmstripVideos = selectedVideo
    ? (focus ? videos : videos.filter(v => v.id !== selectedVideo.id))
    : [];
  const playheadPct = Math.min(100, (currentSec / VIDEO_DURATION_SEC) * 100);

  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-y-auto">
      <div className="flex flex-col gap-6 p-6 lg:p-8 min-h-full w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-[24px] text-foreground leading-tight truncate">
              {player.name}{player.posAcronym ? ` ${player.posAcronym}` : ''}
            </h2>
            <p className="font-body font-medium text-[14px] text-muted-foreground mt-1 truncate">
              {selectedVideo ? selectedVideo.title : 'Select a video to start'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedVideo ? (
              <>
                {focus ? (
                  <HeaderIconButton title="Expand panel" onClick={() => setFocus(false)}>
                    <PanelRightOpen size={16} />
                  </HeaderIconButton>
                ) : (
                  <>
                    {/* Tagging | Reports segmented toggle */}
                    <div className="h-10 flex items-center gap-0.5 bg-card border border-border rounded-[12px] p-0.5 shadow-sm shrink-0">
                      {(['tagging', 'reports'] as PanelMode[]).map(mode => (
                        <button key={mode} onClick={() => setPanelMode(mode)}
                          className={`h-full px-4 rounded-[10px] font-body font-bold text-[12px] capitalize transition-colors ${
                            panelMode === mode ? 'bg-primary text-chalk' : 'text-muted-foreground hover:text-foreground'
                          }`}>
                          {mode}
                        </button>
                      ))}
                    </div>
                    <HeaderIconButton title="Focus video" onClick={() => setFocus(true)}>
                      <Maximize size={16} />
                    </HeaderIconButton>
                    <HeaderIconButton title="Swap layout" onClick={() => setSwapped(s => !s)}>
                      <ArrowLeftRight size={16} />
                    </HeaderIconButton>
                  </>
                )}
                <HeaderIconButton title="Back to video library" onClick={backToLibrary}>
                  <LayoutGrid size={16} />
                </HeaderIconButton>
              </>
            ) : (
              <>
                <HeaderIconButton title="Swap layout — select a video first"><ArrowLeftRight size={16} /></HeaderIconButton>
                <HeaderIconButton title="Video library"><LayoutGrid size={16} /></HeaderIconButton>
              </>
            )}
            <HeaderIconButton title="Close" onClick={onClose}><X size={16} /></HeaderIconButton>
          </div>
        </div>

        {/* ── Body ── */}
        {selectedVideo ? (
          <div className={`grid grid-cols-1 gap-4 items-start ${
            focus ? '' : swapped ? 'lg:grid-cols-[380px_1fr]' : 'lg:grid-cols-[1fr_380px]'
          }`}>

            {/* Video pane */}
            <div className={`flex flex-col gap-4 min-w-0 ${!focus && swapped ? 'lg:order-2' : ''}`}>

              {/* Video player (mock — mirrors MatchEntry) */}
              <div className="bg-[#0B0B0B] rounded-[20px] overflow-hidden border border-border shadow-[var(--shadow-lg)]">
                <div className="aspect-video relative flex items-center justify-center">
                  <button
                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center transition-colors shadow-[var(--shadow-md)]"
                    title="Play (mock)">
                    <Play size={24} className="text-chalk ml-1" />
                  </button>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chalk/10 font-body font-bold text-[10px] uppercase tracking-widest text-chalk/80">
                    {isMatch ? <Globe size={12} className="shrink-0" /> : <Clapperboard size={12} className="shrink-0" />}
                    {isMatch ? 'Match Footage' : 'Highlight Package'}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center gap-3 border-t border-chalk/10">
                  <button className="text-chalk/60 hover:text-chalk transition-colors shrink-0" title="Play">
                    <Play size={16} />
                  </button>
                  <span className="font-mono font-bold text-[12px] text-chalk/60 shrink-0">{fmtTime(currentSec)}</span>
                  <div className="flex-1 h-1 rounded-full bg-chalk/20 relative">
                    <span
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
                      style={{ left: `${playheadPct}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[12px] text-chalk/60 shrink-0">{fmtTime(VIDEO_DURATION_SEC)}</span>
                  <button
                    className="px-2 py-0.5 rounded-full bg-chalk/10 font-body font-bold text-[10px] text-chalk/80 hover:text-chalk transition-colors shrink-0"
                    title="Playback speed">
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

              {/* Meta row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-heading font-semibold text-[20px] text-foreground leading-tight block truncate">
                    {isMatch
                      ? <>{selectedVideo.home} <span className="text-muted-foreground font-medium">vs</span> {selectedVideo.away}</>
                      : selectedVideo.title}
                  </span>
                  <span className="font-body font-medium text-[12px] text-muted-foreground block truncate mt-1">
                    {selectedVideo.competition} · {selectedVideo.competition} ({selectedVideo.season}) · {selectedVideo.round}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-body font-medium text-[12px] text-muted-foreground">{selectedVideo.date}</span>
                  <button title="Flag video"
                    className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Flag size={16} />
                  </button>
                </div>
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={backToLibrary}
                  className="inline-flex items-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors">
                  <ArrowLeft size={14} />All Videos
                </button>
                <div className="flex items-center gap-2">
                  {[-10, -5, 5, 10].map(delta => (
                    <button key={delta} onClick={() => seek(delta)} title={`Seek ${delta > 0 ? '+' : ''}${delta} seconds`}
                      className="bg-primary text-chalk rounded-[12px] px-3 py-2 font-body font-bold text-[14px] hover:bg-primary/80 transition-colors">
                      {delta > 0 ? `+${delta}s` : `−${Math.abs(delta)}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filmstrip */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filmstripVideos.map(v => (
                  <FilmThumb key={v.id} video={v} active={v.id === selectedVideo.id} onClick={() => openVideo(v)} />
                ))}
              </div>
            </div>

            {/* Right work panel (hidden in focus mode) */}
            {!focus && (
              <div className={swapped ? 'lg:order-1' : ''}>
                {panelMode === 'reports'
                  ? <ReportsPanel key={selectedVideo.id} onSave={handleSaveReport(selectedVideo.id)} />
                  : <TaggingPanel key={selectedVideo.id} currentSec={currentSec} onSeek={setCurrentSec} />}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Video library grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {videos.map(v => (
                <VideoCard key={v.id} video={v} playerName={player.name} onClick={() => openVideo(v)} />
              ))}
            </div>
            {/* Empty prompt panel */}
            <aside className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-8 flex flex-col items-center justify-center text-center gap-4 xl:sticky xl:top-8 min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MousePointerClick size={20} className="text-primary" />
              </div>
              <p className="font-body font-medium text-[14px] text-muted-foreground max-w-[220px]">
                Select a video to start tagging or reporting.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
