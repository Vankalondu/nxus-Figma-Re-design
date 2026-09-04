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
    className="w-10 h-10 rounded-[12px] bg-brand-primary text-on-brand flex items-center justify-center hover:bg-brand-primary/80 transition-colors shadow-sm shrink-0">
    {children}
  </button>
);

const KindBadge = ({ kind }: { kind: 'match' | 'highlight' }) => (
  <span className={`font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
    kind === 'match' ? 'bg-brand-primary text-on-brand' : 'bg-status-success/15 text-status-success border border-status-success/30'
  }`}>
    {kind === 'match' ? 'FM' : 'PK'}
  </span>
);

const VideoCard = ({ video, playerName, onClick }: { video: PlayerVideo; playerName: string; onClick: () => void }) => {
  const isMatch = video.kind === 'match';
  return (
    <button onClick={onClick} title="Open video"
      className="text-left bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] p-3 flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
      {/* Thumbnail — dark video surface */}
      <div className="relative aspect-video bg-[#02090F] rounded-[16px] overflow-hidden flex items-center justify-center px-4">
        <span className={`absolute top-2 left-2 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
          isMatch ? 'bg-brand-primary text-on-brand' : 'bg-status-success/15 text-status-success border border-status-success/30'
        }`}>
          {isMatch ? 'FM' : 'PK'}
        </span>
        {video.hasReport && (
          <span title="Report filed"
            className="absolute top-2 right-2 inline-flex items-center gap-0.5 bg-status-success/15 text-status-success border border-status-success/30 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
            <Check size={10} />R
          </span>
        )}
        {isMatch ? (
          <span className="font-body font-bold text-[14px] text-on-brand text-center leading-snug">
            {video.home} <span className="text-on-brand/50 font-medium">vs</span> {video.away}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-text-on-brand/10 border border-text-on-brand/20 flex items-center justify-center">
              <Play size={14} className="text-on-brand ml-0.5" />
            </div>
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-on-brand/60">Highlight</span>
            <span className="font-body font-bold text-[12px] text-on-brand text-center leading-snug">{playerName}</span>
          </div>
        )}
      </div>
      {/* Meta */}
      <div className="flex flex-col gap-1 px-1 pb-1 min-w-0">
        <span className="font-heading font-semibold text-[14px] text-strong truncate">
          {isMatch ? <>{video.home} <span className="text-body">vs</span> {video.away}</> : video.title}
        </span>
        <span className="font-body font-medium text-[12px] text-body truncate">
          {video.competition} · {video.competition} ({video.season}) · {video.round}
        </span>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="font-body font-medium text-[12px] text-body">{video.round}</span>
          <span className="font-body font-medium text-[12px] text-body">{video.date}</span>
        </div>
      </div>
    </button>
  );
};

// ─── Filmstrip thumbnail ─────────────────────────────────────────────────────────
const FilmThumb = ({ video, active, onClick }: { video: PlayerVideo; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} title={video.title}
    className={`text-left w-[200px] shrink-0 bg-[#02090F] rounded-[12px] border border-default p-3 flex flex-col gap-2 hover:border-brand-primary/60 transition-colors ${
      active ? 'ring-2 ring-brand-primary' : ''
    }`}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 min-w-0">
        <KindBadge kind={video.kind} />
        {video.hasReport && (
          <span title="Report filed"
            className="inline-flex items-center gap-0.5 bg-status-success/15 text-status-success border border-status-success/30 font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
            <Check size={10} />R
          </span>
        )}
      </div>
      {video.kind === 'match'
        ? <Globe size={12} className="text-on-brand/50 shrink-0" />
        : <Clapperboard size={12} className="text-on-brand/50 shrink-0" />}
    </div>
    <span className="font-body font-bold text-[12px] text-on-brand truncate">{video.title}</span>
    <span className="font-body font-medium text-[10px] text-on-brand/50 truncate">
      {video.competition} · {video.round}
    </span>
  </button>
);

// ─── Right work panel: Tagging (Phase 4) ─────────────────────────────────────────
// Timestamped event tagging against the video. Quick-tag buttons stamp the
// current playback position (currentSec); clicking a logged tag seeks to it.
// Event-type set + icons/colors mirror MatchEntry's Match Events for consistency.
const TAG_EVENT_TYPES: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; chipClass: string }[] = [
  { id: 'goal', label: 'Goal', icon: Target, chipClass: 'bg-brand-primary/10 text-brand-primary' },
  { id: 'assist', label: 'Assist', icon: Zap, chipClass: 'bg-brand-primary/10 text-brand-primary' },
  { id: 'chance', label: 'Chance', icon: Sparkles, chipClass: 'bg-brand-primary/10 text-brand-primary' },
  { id: 'save', label: 'Save', icon: Shield, chipClass: 'bg-status-success/10 text-status-success' },
  { id: 'foul', label: 'Foul', icon: AlertTriangle, chipClass: 'bg-status-error/10 text-status-error' },
  { id: 'yellow-card', label: 'Yellow Card', icon: Square, chipClass: 'bg-status-warning/10 text-status-warning' },
  { id: 'red-card', label: 'Red Card', icon: Square, chipClass: 'bg-status-error/10 text-status-error' },
  { id: 'substitution', label: 'Substitution', icon: ArrowRightLeft, chipClass: 'bg-surface-accent text-body' },
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
    <aside className="bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] flex flex-col min-h-[280px] overflow-hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-5 pb-4 flex items-center justify-between gap-2 shrink-0 border-b border-default">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-body">Tagging</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full shrink-0">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </span>
        </div>
        <span title="Current video position"
          className="inline-flex items-center gap-1 font-mono font-bold text-[12px] text-body bg-surface-accent px-2 py-0.5 rounded-full shrink-0">
          @ {fmtTime(currentSec)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Quick-tag buttons */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-body">Quick Tag</span>
          <div className="grid grid-cols-2 gap-2">
            {TAG_EVENT_TYPES.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => addTag(t.id)} title={`Tag ${t.label} at ${fmtTime(currentSec)}`}
                  className="flex items-center gap-2 rounded-[12px] border border-default bg-surface-card px-3 py-2 hover:border-brand-primary transition-colors text-left min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${t.chipClass}`}>
                    <Icon size={12} />
                  </span>
                  <span className="font-body font-bold text-[12px] text-body truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add with note */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-body">Add With Note</span>
          <div className="flex gap-2">
            <select value={draftTypeId} onChange={e => setDraftTypeId(e.target.value)} title="Tag type"
              className="w-[120px] shrink-0 rounded-[10px] border border-default bg-surface-card px-2 py-2 font-body font-bold text-[12px] text-body focus:outline-none focus:border-brand-primary transition-colors">
              {TAG_EVENT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <input value={draftNote} onChange={e => setDraftNote(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addDraftTag(); }}
              placeholder="Optional note…" maxLength={80} title="Optional note"
              className="flex-1 min-w-0 rounded-[10px] border border-default bg-surface-accent/30 px-3 py-2 font-body font-medium text-[12px] text-body placeholder:text-body focus:outline-none focus:border-brand-primary transition-colors" />
          </div>
          <button onClick={addDraftTag} title={`Add tag at ${fmtTime(currentSec)}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary text-inverse py-2 font-body font-semibold text-[12px] hover:bg-brand-primary/80 transition-colors shadow-sm">
            <Plus size={12} className="shrink-0" />
            Add at {fmtTime(currentSec)}
          </button>
        </div>

        {/* Tags timeline */}
        <div className="flex flex-col gap-2">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-body">Tags</span>
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-surface-accent flex items-center justify-center">
                <Tag size={20} className="text-body" />
              </div>
              <p className="font-body font-bold text-[14px] text-body">No tags yet</p>
              <p className="font-body font-medium text-[12px] text-body max-w-[220px]">
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
                    active ? 'border-brand-primary bg-brand-primary/5' : 'border-default bg-surface-accent/30 hover:border-brand-primary'
                  }`}>
                  <span className={`font-mono font-bold text-[12px] px-2 py-0.5 rounded-full shrink-0 ${
                    active ? 'bg-brand-primary text-on-brand' : 'bg-surface-accent text-body'
                  }`}>
                    {fmtTime(tag.sec)}
                  </span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${type.chipClass}`}>
                    <Icon size={12} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-body font-bold text-[12px] text-body block truncate">{type.label}</span>
                    {tag.note && (
                      <span className="font-body font-medium text-[12px] text-body block truncate">{tag.note}</span>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); removeTag(tag.id); }} title="Delete tag"
                    className="w-6 h-6 rounded-full flex items-center justify-center text-body hover:text-status-error hover:bg-status-error/10 transition-colors shrink-0">
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
    <aside className="bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] flex flex-col min-h-[280px] overflow-hidden lg:sticky lg:top-8 lg:max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="p-5 pb-4 flex flex-col gap-3 shrink-0 border-b border-default">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-bold text-[12px] uppercase tracking-widest text-body">Short Report</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="font-body font-medium text-[12px] text-body">Creating new report</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-border-default rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-brand-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono font-bold text-[12px] text-body shrink-0">{graded}/{total}</span>
        </div>
        {savedFlash && (
          <span className="inline-flex items-center gap-2 self-start bg-status-success/10 text-status-success border border-status-success/30 font-body font-bold text-[12px] px-3 py-1 rounded-full">
            <Check size={12} /> Report saved — filed to Reports · Submissions
          </span>
        )}
      </div>

      {/* Graded criteria */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
        {SHORT_REPORT_TEMPLATE.sections.map(section => (
          <div key={section.title} className="flex flex-col gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-body">{section.title}</span>
            {section.criteria.map(c => (
              <div key={c.id} className="rounded-[12px] border border-default bg-surface-accent/30 p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-body font-bold text-[12px] text-body truncate">{c.label}</span>
                  {c.required && (
                    <span className="font-heading font-bold text-[10px] uppercase tracking-widest bg-status-warning/10 text-status-warning px-2 py-0.5 rounded-full shrink-0">Required</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {GRADE_SCALE.map(g => (
                    <button key={g} onClick={() => setGrade(c.id, g)} title={`Grade ${c.label}: ${g}`}
                      className={`py-1 rounded-[10px] font-heading font-bold text-[12px] border transition-colors ${
                        grades[c.id] === g
                          ? 'bg-brand-primary text-on-brand border-brand-primary shadow-sm'
                          : 'bg-surface-card text-body border-default hover:border-brand-primary hover:text-strong'
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
      <div className="p-5 pt-4 border-t border-default flex flex-col gap-2 shrink-0">
        {requiredLeft > 0 && (
          <p className="font-body font-medium text-[12px] text-body">
            Grade {requiredLeft} more required {requiredLeft === 1 ? 'criterion' : 'criteria'} to save.
          </p>
        )}
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={requiredLeft > 0}
            className="flex-1 bg-brand-primary text-inverse rounded-full py-2 font-body font-semibold text-[14px] hover:bg-brand-primary/80 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Save Report
          </button>
          <button onClick={() => setGrades({})} disabled={graded === 0}
            className="px-5 py-2 rounded-full border border-default bg-surface-card text-body font-body font-bold text-[14px] hover:border-brand-primary hover:text-body transition-all disabled:opacity-40 disabled:cursor-not-allowed">
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
    <div className="fixed inset-0 z-[200] bg-surface-page overflow-y-auto">
      <div className="flex flex-col gap-6 p-6 lg:p-8 min-h-full w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-heading font-semibold text-[24px] text-heading leading-tight truncate">
              {player.name}{player.posAcronym ? ` ${player.posAcronym}` : ''}
            </h2>
            <p className="font-body font-medium text-[14px] text-body mt-1 truncate">
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
                    <div className="h-10 flex items-center gap-0.5 bg-surface-card border border-default rounded-[12px] p-0.5 shadow-sm shrink-0">
                      {(['tagging', 'reports'] as PanelMode[]).map(mode => (
                        <button key={mode} onClick={() => setPanelMode(mode)}
                          className={`h-full px-4 rounded-[10px] font-body font-bold text-[12px] capitalize transition-colors ${
                            panelMode === mode ? 'bg-brand-primary text-on-brand' : 'text-body hover:text-strong'
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
              <div className="bg-[#02090F] rounded-[20px] overflow-hidden border border-default shadow-[var(--shadow-lg)]">
                <div className="aspect-video relative flex items-center justify-center">
                  <button
                    className="w-16 h-16 rounded-full bg-brand-primary hover:bg-brand-primary/80 flex items-center justify-center transition-colors shadow-[var(--shadow-md)]"
                    title="Play (mock)">
                    <Play size={24} className="text-on-brand ml-1" />
                  </button>
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-text-on-brand/10 font-body font-bold text-[10px] uppercase tracking-widest text-on-brand/80">
                    {isMatch ? <Globe size={12} className="shrink-0" /> : <Clapperboard size={12} className="shrink-0" />}
                    {isMatch ? 'Match Footage' : 'Highlight Package'}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center gap-3 border-t border-text-on-brand/10">
                  <button className="text-on-brand/60 hover:text-on-brand transition-colors shrink-0" title="Play">
                    <Play size={16} />
                  </button>
                  <span className="font-mono font-bold text-[12px] text-on-brand/60 shrink-0">{fmtTime(currentSec)}</span>
                  <div className="flex-1 h-1 rounded-full bg-text-on-brand/20 relative">
                    <span
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-primary"
                      style={{ left: `${playheadPct}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[12px] text-on-brand/60 shrink-0">{fmtTime(VIDEO_DURATION_SEC)}</span>
                  <button
                    className="px-2 py-0.5 rounded-full bg-text-on-brand/10 font-body font-bold text-[10px] text-on-brand/80 hover:text-on-brand transition-colors shrink-0"
                    title="Playback speed">
                    1x
                  </button>
                  <button className="text-on-brand/60 hover:text-on-brand transition-colors shrink-0" title="Volume">
                    <Volume2 size={16} />
                  </button>
                  <button className="text-on-brand/60 hover:text-on-brand transition-colors shrink-0" title="Settings">
                    <Settings size={16} />
                  </button>
                  <button className="text-on-brand/60 hover:text-on-brand transition-colors shrink-0" title="Fullscreen">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-heading font-semibold text-[20px] text-strong leading-tight block truncate">
                    {isMatch
                      ? <>{selectedVideo.home} <span className="text-body font-medium">vs</span> {selectedVideo.away}</>
                      : selectedVideo.title}
                  </span>
                  <span className="font-body font-medium text-[12px] text-body block truncate mt-1">
                    {selectedVideo.competition} · {selectedVideo.competition} ({selectedVideo.season}) · {selectedVideo.round}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-body font-medium text-[12px] text-body">{selectedVideo.date}</span>
                  <button title="Flag video"
                    className="w-10 h-10 rounded-[12px] bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary/20 transition-colors">
                    <Flag size={16} />
                  </button>
                </div>
              </div>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={backToLibrary}
                  className="inline-flex items-center gap-2 bg-surface-card text-body border border-default hover:border-brand-primary hover:text-body rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors">
                  <ArrowLeft size={14} />All Videos
                </button>
                <div className="flex items-center gap-2">
                  {[-10, -5, 5, 10].map(delta => (
                    <button key={delta} onClick={() => seek(delta)} title={`Seek ${delta > 0 ? '+' : ''}${delta} seconds`}
                      className="bg-brand-primary text-on-brand rounded-[12px] px-3 py-2 font-body font-bold text-[14px] hover:bg-brand-primary/80 transition-colors">
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
            <aside className="bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] p-8 flex flex-col items-center justify-center text-center gap-4 xl:sticky xl:top-8 min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <MousePointerClick size={20} className="text-brand-primary" />
              </div>
              <p className="font-body font-medium text-[14px] text-body max-w-[220px]">
                Select a video to start tagging or reporting.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
