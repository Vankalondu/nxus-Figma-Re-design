import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { EditPlayerModal } from '../components/EditPlayerModal';
import { TopNav } from '../components/TopNav';
import { toast } from 'sonner';
import { Calendar, Trophy, Activity, ShieldCheck, Search, ChevronDown, ChevronRight, Edit2, Trash2, Plus, Play, Video, Check, TrendingUp, Footprints, Ruler, Scale, Flag, Clock, X, CornerDownRight, MessageSquare } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';

let __id = 100;
const nextId = () => 'id' + (++__id);
const AVATAR = 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=faces&q=80';

function getStoredRole() {
  return sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
}
function getRoleBasePath() {
  const role = getStoredRole();
  if (role === 'Lead Scout') return '/lead-scout';
  if (role === 'Senior Scout') return '/senior-scout';
  if (role === 'Head Scout') return '/head-scout';
  return '/country-scout';
}
function getRoleLabel() {
  return getStoredRole() || 'Country Scout';
}

// Default player used for cold/direct loads; navigation merges the real
// clicked player over this via location.state.player.
const MOCK_DEFAULTS = {
  id: 'P-123',
  name: 'Mamadou Diop',
  initials: 'MD',
  image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=400&h=400&fit=crop',
  dob: '12/05/2007',
  age: 18,
  nationality: ['Senegal'],
  primaryPos: 'ST',
  secondaryPos: 'LW',
  tertiaryPos: '',
  preferredFoot: 'Right',
  height: 188,
  weight: 78,
  currentTeam: 'Generation Foot',
  contractEnds: 'Jun 2028',
  matchesScouted: 12,
  seasonMatches: 16,
  potentialMins: 82,
};

// Radar normalised 0-100 from the real stats; raw values live in the tiles.
const RADAR_DATA = [
  { axis: 'Goals', value: 82 },
  { axis: 'Assists', value: 58 },
  { axis: 'Minutes', value: 88 },
  { axis: 'Starts', value: 87 },
  { axis: 'Discipline', value: 90 },
  { axis: 'Activity', value: 85 },
];

const PLAYING_TIME_BARS = [
  { name: 'Apps', value: 24 },
  { name: 'Starts', value: 21 },
  { name: 'Subs', value: 3 },
];

const DISCIPLINE_ITEMS = [
  { l: 'Yellow', v: '2', c: '#E8A838' },
  { l: 'Red', v: '0', c: '#E05C4B' },
  { l: 'Fouls/90', v: '1.2', c: 'var(--primary)' },
  { l: 'Offsides', v: '18', c: 'var(--primary)' },
];

const VIDEOS = [
  { title: 'vs AS Pikine - Full Performance', date: 'Oct 12, 2026', dur: '08:42', type: 'Match', mins: 90, goals: 2, tags: ['Full 90', 'MOTM'] },
  { title: 'vs Diambars FC - Full Match', date: 'Sep 28, 2026', dur: '11:04', type: 'Match', mins: 78, goals: 1, tags: [] },
  { title: 'vs Teungueth - Full Performance', date: 'Sep 14, 2026', dur: '09:22', type: 'Match', mins: 90, goals: 0, tags: ['Assist'] },
  { title: 'vs Jaraaf - Full Match', date: 'Aug 30, 2026', dur: '10:37', type: 'Match', mins: 64, goals: 1, tags: [] },
  { title: 'vs Casa Sports - Full Performance', date: 'Aug 15, 2026', dur: '08:55', type: 'Match', mins: 90, goals: 3, tags: ['Hat-trick'] },
  { title: 'Goals & Key Actions Compilation', date: 'Oct 08, 2026', dur: '03:15', type: 'Highlight', tags: ['Goals', 'Finishing'] },
  { title: 'Dribbling & Take-ons Reel', date: 'Sep 20, 2026', dur: '02:41', type: 'Highlight', tags: ['Dribbling'] },
  { title: 'Aerial Duels & Pressing', date: 'Sep 06, 2026', dur: '01:58', type: 'Highlight', tags: [] },
  { title: 'Best Assists of the Season', date: 'Aug 22, 2026', dur: '02:12', type: 'Highlight', tags: ['Assists', 'Vision'] },
];

const INITIAL_CAREER = [
  { title: 'Club', items: [
    { id: nextId(), d: '2024 - Present', o: 'Generation Foot', c: true, loans: [] },
    { id: nextId(), d: '2023 - 2024', o: 'AS Pikine', c: false, loans: [] },
  ] },
  { title: 'Academy', items: [
    { id: nextId(), d: '2019 - 2023', o: 'Generation Foot Academy', c: false, loans: [] },
  ] },
  { title: 'National', items: [
    { id: nextId(), d: '2024 - Present', o: 'Senegal U20', c: true, loans: [] },
    { id: nextId(), d: '2022 - 2024', o: 'Senegal U17', c: false, loans: [] },
  ] },
  { title: 'School', items: [
    { id: nextId(), d: '2015 - 2019', o: 'Dakar International School', c: false, loans: [] },
  ] },
  { title: 'Showcases', items: [
    { id: nextId(), d: '2025', o: 'Dakar Talent Showcase', c: false, loans: [] },
  ] },
  { title: 'Other', items: [
    { id: nextId(), d: '2024', o: 'MLS Combine Invite', c: false, loans: [] },
  ] },
];

const INITIAL_NOTES = [
  { id: nextId(), author: 'Vanessa Scout', initials: 'VS', date: 'Oct 12, 2026', type: 'Scouting', isPublic: true, text: 'Strong physical presence for his age. Technical ability is refined, especially in transitional play. High-potential prospect for the upcoming cycle.', replies: [] },
  { id: nextId(), author: 'Tom Grant', initials: 'TG', date: 'Oct 05, 2026', type: 'Performance', isPublic: true, text: 'Excellent movement off the ball and consistent pressing intensity across 90 minutes. Finishing under pressure has clearly improved.', replies: [{ id: nextId(), author: 'You', text: 'Agreed, the diagonal runs in behind are a real weapon.', date: 'Oct 06, 2026' }] },
  { id: nextId(), author: 'Vanessa Scout', initials: 'VS', date: 'Sep 28, 2026', type: 'General', isPublic: false, text: 'Private: agent contact established, open to a winter move. Keep monitoring minutes.', replies: [] },
];

const NOTE_TYPES = ['General', 'Scouting', 'Performance', 'Personal', 'Other'];
const LABEL = 'font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground';

const Donut = ({ pct, center, label }: { pct: number; center: string; label: string }) => {
  const R = 30;
  const C = 2 * Math.PI * R;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * C;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[72px] h-[72px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="36" cy="36" r={R} fill="none" stroke="var(--primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray={dash + ' ' + C} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading font-semibold text-[16px] text-foreground">{center}</div>
      </div>
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center leading-tight">{label}</div>
    </div>
  );
};

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Videos & Highlights');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [videoFilter, setVideoFilter] = useState('All');
  const [imgError, setImgError] = useState(false);

  const passed = (location.state && (location.state as any).player) || null;
  const cleanPassed = passed ? Object.fromEntries(Object.entries(passed).filter(([, v]) => v !== undefined && v !== null && v !== '')) : {};
  const [player, setPlayer] = useState(() => {
    const merged: any = { ...MOCK_DEFAULTS, id: id || MOCK_DEFAULTS.id, ...cleanPassed };
    // A player clicked from a list has no photo -> show initials, not the default face.
    if (passed && !(cleanPassed as any).image) merged.image = '';
    // EditPlayerModal expects nationality as an array; coerce strings.
    if (typeof merged.nationality === 'string') merged.nationality = [merged.nationality];
    if (merged.tertiaryPos === undefined) merged.tertiaryPos = '';
    return merged;
  });

  // Career state
  const [careerSections, setCareerSections] = useState(INITIAL_CAREER);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editText, setEditText] = useState('');

  // Notes state
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [noteFilter, setNoteFilter] = useState('All Types');
  const [noteSearch, setNoteSearch] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState('General');
  const [newNotePublic, setNewNotePublic] = useState(true);
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  const tabs = ['Videos & Highlights', 'Statistics', 'Career History', 'Notes'];
  const roleLabel = getRoleLabel();

  const defaultTrail = [
    { label: 'Players', path: getRoleBasePath() + '/players' },
    { label: 'Database', path: getRoleBasePath() + '/players' },
  ];
  const trail = (location.state && (location.state as any).trail) ? (location.state as any).trail : defaultTrail;

  const nationality = Array.isArray(player.nationality) ? player.nationality.join(', ') : (player.nationality || '');
  const bio = [
    { icon: Footprints, l: 'Foot', v: player.preferredFoot },
    { icon: Activity, l: 'Age', v: player.age + ' years' },
    { icon: Calendar, l: 'Born', v: player.dob },
    { icon: Ruler, l: 'Height', v: player.height ? player.height + ' cm' : '-' },
    { icon: Scale, l: 'Weight', v: player.weight ? player.weight + ' kg' : '-' },
    { icon: Flag, l: 'Nationality', v: nationality },
  ];
  const scoutedPct = Math.round(((player.matchesScouted || 0) / (player.seasonMatches || 16)) * 100);

  // Career handlers
  const addEntry = (si: number) => {
    setCareerSections(prev => prev.map((s, i) => i !== si ? s : { ...s, items: [...s.items, { id: nextId(), d: '2026 - Present', o: 'New Team', c: false, loans: [] }] }));
    toast.success('Entry added');
  };
  const addLoan = (si: number, entryId: string) => {
    setCareerSections(prev => prev.map((s, i) => i !== si ? s : { ...s, items: s.items.map(e => e.id !== entryId ? e : { ...e, loans: [...e.loans, { id: nextId(), label: '2026-27 Loan - Club X' }] }) }));
    toast.success('Loan added');
  };
  const deleteEntry = (si: number, entryId: string) => {
    setCareerSections(prev => prev.map((s, i) => i !== si ? s : { ...s, items: s.items.filter(e => e.id !== entryId) }));
    toast.success('Entry removed');
  };
  const deleteLoan = (si: number, entryId: string, loanId: string) => {
    setCareerSections(prev => prev.map((s, i) => i !== si ? s : { ...s, items: s.items.map(e => e.id !== entryId ? e : { ...e, loans: e.loans.filter(l => l.id !== loanId) }) }));
  };
  const startEdit = (si: number, entryId: string, loanId: string | null, current: string) => {
    setEditTarget({ si, entryId, loanId });
    setEditText(current);
  };
  const saveEdit = () => {
    if (!editTarget) return;
    const { si, entryId, loanId } = editTarget;
    setCareerSections(prev => prev.map((s, i) => i !== si ? s : { ...s, items: s.items.map(e => {
      if (e.id !== entryId) return e;
      if (loanId) return { ...e, loans: e.loans.map(l => l.id === loanId ? { ...l, label: editText } : l) };
      return { ...e, o: editText };
    }) }));
    setEditTarget(null);
    setEditText('');
  };

  // Notes handlers
  const deleteNote = (nid: string) => { setNotes(prev => prev.filter(n => n.id !== nid)); toast.success('Note deleted'); };
  const saveNoteEdit = () => { setNotes(prev => prev.map(n => n.id === editNoteId ? { ...n, text: editNoteText } : n)); setEditNoteId(null); toast.success('Note updated'); };
  const postReply = (nid: string) => {
    if (!replyText.trim()) return;
    setNotes(prev => prev.map(n => n.id !== nid ? n : { ...n, replies: [...n.replies, { id: nextId(), author: 'You', text: replyText.trim(), date: 'Just now' }] }));
    setReplyText('');
    setReplyTarget(null);
    toast.success('Reply posted');
  };
  const postNote = () => {
    if (!newNoteText.trim()) { toast('Please enter a note'); return; }
    setNotes(prev => [{ id: nextId(), author: 'You', initials: 'YO', date: 'Just now', type: newNoteType, isPublic: newNotePublic, text: newNoteText.trim(), replies: [] }, ...prev]);
    setNewNoteText('');
    setNewNoteType('General');
    setNewNotePublic(true);
    setShowAddNote(false);
    toast.success('Note posted');
  };

  // ---- Render helpers ----
  const videoCard = (vid: any, i: number) => (
    <div key={vid.title} className="w-full bg-card border border-border rounded-[20px] overflow-hidden shadow-[var(--shadow-lg)] group hover:shadow-[var(--shadow-xl)] transition-all cursor-pointer">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#B4D7F6]/70 via-[#D2E7FA]/50 to-accent flex items-center justify-center overflow-hidden">
        <Video size={36} strokeWidth={1.5} className="text-primary/50" />
        <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-md text-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg shadow-sm">{(vid.type === 'Match' ? 'F' : 'H') + (i + 1)}</span>
      </div>
      <div className="p-4">
        <h4 className="font-heading font-black text-[14px] text-foreground group-hover:text-primary transition-colors truncate">{vid.title}</h4>
        <div className="font-body font-medium text-[12px] text-muted-foreground mt-1">{vid.date}</div>
        <div className="flex items-center gap-4 mt-2 font-mono font-bold text-[14px] text-foreground">
          {vid.type === 'Match' ? (<><span>Mins: {vid.mins}</span><span>Goals: {vid.goals}</span></>) : (<span>{vid.dur}</span>)}
        </div>
        <div className="font-body font-medium text-[12px] text-muted-foreground mt-2">{vid.tags && vid.tags.length ? vid.tags.join(' • ') : 'No tags assigned'}</div>
      </div>
    </div>
  );

  const renderVideos = () => {
    const matches = VIDEOS.filter(v => v.type === 'Match');
    const highlights = VIDEOS.filter(v => v.type === 'Highlight');
    const showMatches = videoFilter === 'All' || videoFilter === 'Matches';
    const showHighlights = videoFilter === 'All' || videoFilter === 'Highlights';
    const both = showMatches && showHighlights;
    const listCls = both ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4';
    const column = (title: string, items: typeof VIDEOS) => (
      <div className="flex flex-col min-h-0">
        <div className={LABEL + ' mb-2 shrink-0'}>{title} ({items.length})</div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
          <div className={listCls}>{items.map((v, i) => videoCard(v, i))}</div>
        </div>
      </div>
    );
    return (
      <div className={'h-full animate-fade-in ' + (both ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'block')}>
        {showMatches && column('Full Matches', matches)}
        {showHighlights && column('Highlights', highlights)}
      </div>
    );
  };

  const renderStatistics = () => (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 animate-fade-in">
      <div className="bg-card border border-border rounded-[32px] p-6 shadow-[var(--shadow-lg)] flex flex-col min-h-0">
        <h3 className={LABEL}>Performance Profile</h3>
        <div className="h-[280px] sm:h-[320px] lg:h-auto lg:flex-1 lg:min-h-0 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA} outerRadius="72%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--muted-foreground)', fontSize: 11, fontWeight: 800 }} />
              <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-rows-2 gap-6 min-h-0">
        <div className="bg-card border border-border rounded-[32px] p-6 shadow-[var(--shadow-lg)] flex flex-col min-h-0">
          <h3 className={LABEL}>Goals &amp; Assists</h3>
          <div className="mt-2 flex items-end gap-3">
            <div className="font-heading font-extrabold text-[36px] leading-none text-foreground tracking-tight">14</div>
            <div className="pb-1.5">
              <div className={LABEL}>Goals</div>
              <span className="inline-flex items-center gap-1 mt-1 bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-black px-2 py-0.5 rounded-full">
                <TrendingUp size={12} strokeWidth={3} /> +4 vs last
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-3 flex-1 flex flex-col justify-center">
            {[{ l: 'Assists', v: '7', pct: 58 }, { l: 'G/90', v: '0.68', pct: 68 }, { l: 'xG/90', v: '0.65', pct: 65 }].map(m => (
              <div key={m.l}>
                <div className="flex justify-between mb-1">
                  <span className={LABEL}>{m.l}</span>
                  <span className="font-mono text-[14px] font-bold text-foreground">{m.v}</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: m.pct + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-[32px] p-6 shadow-[var(--shadow-lg)] flex flex-col min-h-0">
          <h3 className={LABEL}>Playing Time</h3>
          <div className="mt-1 flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PLAYING_TIME_BARS} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 800 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {PLAYING_TIME_BARS.map((_, i) => (<Cell key={i} fill="var(--primary)" fillOpacity={i === 1 ? 1 : 0.55} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[{ l: 'Minutes', v: '1,842' }, { l: 'Min/Game', v: '76.8' }].map(s => (
              <div key={s.l} className="bg-accent/40 rounded-[14px] px-3 py-2 border border-border/40">
                <div className="font-mono font-bold text-[14px] text-foreground leading-none">{s.v}</div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3">
            <h3 className={LABEL}>Discipline</h3>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {DISCIPLINE_ITEMS.map(d => (
                <div key={d.l} className="text-center">
                  <div className="font-mono font-bold text-[14px] leading-none" style={{ color: d.c }}>{d.v}</div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{d.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const isEditing = (si: number, entryId: string, loanId: string | null) => editTarget && editTarget.si === si && editTarget.entryId === entryId && ((loanId && editTarget.loanId === loanId) || (!loanId && !editTarget.loanId));

  const renderCareer = () => (
    <div className="h-full animate-fade-in">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 h-full auto-rows-fr">
        {careerSections.map((sect, si) => (
          <div key={sect.title} className="bg-card border border-border rounded-[24px] p-4 shadow-[var(--shadow-lg)] flex flex-col min-h-0">
            <h3 className={LABEL + ' shrink-0'}>{sect.title}</h3>
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar mt-2">
              {sect.items.length === 0 && <div className="text-[12px] font-medium text-muted-foreground py-2">No entries yet.</div>}
              {sect.items.map(entry => (
                <div key={entry.id} className="py-2 border-b border-border/60 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-body font-medium text-[12px] text-muted-foreground">{entry.d}</div>
                      {isEditing(si, entry.id, null) ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <input value={editText} onChange={e => setEditText(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1 text-[12px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
                          <button onClick={saveEdit} className="text-primary"><Check size={14} strokeWidth={3} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-body font-bold text-[14px] text-foreground truncate">{entry.o}</span>
                          {entry.c && <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] text-chalk flex items-center justify-center shrink-0"><Check size={9} strokeWidth={4} /></span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button title="Add loan" onClick={() => addLoan(si, entry.id)} className="text-muted-foreground hover:text-primary transition-colors"><CornerDownRight size={14} /></button>
                      <button title="Edit" onClick={() => startEdit(si, entry.id, null, entry.o)} className="text-muted-foreground hover:text-primary transition-colors"><Edit2 size={13} /></button>
                      <button title="Delete" onClick={() => deleteEntry(si, entry.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {entry.loans.length > 0 && (
                    <div className="ml-3 pl-3 border-l-2 border-border mt-1 space-y-1">
                      {entry.loans.map(loan => (
                        <div key={loan.id} className="flex items-center justify-between gap-2">
                          {isEditing(si, entry.id, loan.id) ? (
                            <div className="flex items-center gap-1">
                              <input value={editText} onChange={e => setEditText(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1 text-[12px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
                              <button onClick={saveEdit} className="text-primary"><Check size={13} strokeWidth={3} /></button>
                            </div>
                          ) : (
                            <span className="font-body font-medium text-[12px] text-muted-foreground truncate">{loan.label}</span>
                          )}
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => startEdit(si, entry.id, loan.id, loan.label)} className="text-muted-foreground hover:text-primary transition-colors"><Edit2 size={12} /></button>
                            <button onClick={() => deleteLoan(si, entry.id, loan.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => addEntry(si)} className="mt-2 shrink-0 flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-[14px] py-2 font-body font-bold text-[12px] transition-colors">
              <Plus size={13} /> Add New
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotes = () => {
    const filtered = notes.filter(n => (noteFilter === 'All Types' || n.type === noteFilter) && n.text.toLowerCase().includes(noteSearch.toLowerCase()));
    return (
      <div className="h-full flex flex-col gap-4 animate-fade-in">
        <div className="flex items-center gap-3 w-full shrink-0">
          <div className="relative">
            <select value={noteFilter} onChange={e => setNoteFilter(e.target.value)} className="bg-card border border-border rounded-full px-5 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 appearance-none min-w-[150px]">
              {['All Types'].concat(NOTE_TYPES).map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="Search notes..." className="w-full bg-card border border-border rounded-full px-11 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
          <button onClick={() => setShowAddNote(true)} className="flex items-center gap-2 bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground px-5 py-2 rounded-full font-body font-bold text-[14px] transition-colors shrink-0"><Plus size={15} strokeWidth={3} /> Add Note</button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {filtered.map(note => (
              <div key={note.id} className="bg-card border border-border rounded-[24px] p-4 shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-all flex flex-col">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[12px] shrink-0">{note.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-body font-bold text-[14px] text-foreground truncate">{note.author}</div>
                    <div className="font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{note.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-primary/10 text-foreground font-body font-bold px-2 py-0.5 rounded text-[12px]">{note.type}</span>
                  <span className="font-heading text-[10px] font-black uppercase tracking-widest text-muted-foreground">{note.isPublic ? 'Public' : 'Private'}</span>
                </div>
                {editNoteId === note.id ? (
                  <div className="mt-3">
                    <textarea value={editNoteText} onChange={e => setEditNoteText(e.target.value)} rows={3} className="w-full bg-card border border-border rounded-xl px-3 py-2 text-[14px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
                    <div className="flex justify-end gap-3 mt-1">
                      <button onClick={() => setEditNoteId(null)} className="text-[12px] font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                      <button onClick={saveNoteEdit} className="text-[12px] font-black text-primary">Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="font-body font-medium text-[14px] text-muted-foreground leading-relaxed mt-3 line-clamp-3">{note.text}</p>
                )}
                {note.replies.length > 0 && (
                  <button onClick={() => setOpenReplies(prev => ({ ...prev, [note.id]: !prev[note.id] }))} className="flex items-center gap-2 mt-3 font-body font-bold text-[12px] text-primary hover:underline">
                    <MessageSquare size={13} /> {note.replies.length} {note.replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                )}
                {openReplies[note.id] && note.replies.length > 0 && (
                  <div className="ml-3 pl-3 border-l-2 border-border mt-2 space-y-2">
                    {note.replies.map(r => (
                      <div key={r.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-body font-bold text-[12px] text-foreground">{r.author}</span>
                          <span className="font-heading text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{r.date}</span>
                        </div>
                        <p className="font-body font-medium text-[12px] text-muted-foreground leading-relaxed">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/60">
                  <button onClick={() => { setReplyTarget(replyTarget === note.id ? null : note.id); setReplyText(''); }} className="flex items-center gap-2 font-body font-bold text-[12px] text-muted-foreground hover:text-primary transition-colors"><MessageSquare size={13} /> Reply</button>
                  <button onClick={() => { setEditNoteId(note.id); setEditNoteText(note.text); }} className="flex items-center gap-2 font-body font-bold text-[12px] text-muted-foreground hover:text-primary transition-colors"><Edit2 size={13} /> Edit</button>
                  <button onClick={() => deleteNote(note.id)} className="flex items-center gap-2 font-body font-bold text-[12px] text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={13} /> Delete</button>
                </div>
                {replyTarget === note.id && (
                  <div className="flex items-center gap-2 mt-3">
                    <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="flex-1 bg-card border border-border rounded-full px-4 py-2 text-[12px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20" />
                    <button onClick={() => postReply(note.id)} className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-[12px] font-black">Post</button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="text-[14px] font-bold text-muted-foreground py-6">No notes match your filters.</div>}
          </div>
        </div>
      </div>
    );
  };

  const rolePill = (
    <div className="flex items-center gap-2 px-3 md:px-5 h-[44px] bg-accent rounded-full shrink-0">
      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
      <span className="hidden md:inline font-body text-[14px] font-bold text-foreground whitespace-nowrap">{roleLabel} Dashboard</span>
    </div>
  );

  return (
    <div className="flex lg:h-screen bg-background font-body text-foreground lg:overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col lg:overflow-hidden relative w-full lg:h-full pt-6">
        <TopNav
          responsive
          sticky={false}
          rolePill={rolePill}
          unreadCount={3}
          onNotifToggle={() => toast('Notifications - coming soon')}
          onThisWeek={() => toast('This Week - coming soon')}
          onAddReport={() => toast('Add Report - coming soon')}
          onAddPlayer={() => toast('Add Player - coming soon')}
          avatarImg={AVATAR}
          onProfileToggle={() => toast('Profile menu - coming soon')}
        />

        {/* Breadcrumb only */}
        <div className="flex items-center mx-[var(--pad-page)] mt-3 mb-1 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {trail.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <button onClick={() => navigate(c.path)} className="font-body font-bold text-[14px] text-muted-foreground hover:text-primary transition-colors">{c.label}</button>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            ))}
            <span className="font-body font-black text-[14px] text-foreground">{player.name}</span>
          </div>
        </div>

        {/* Two-column body — stacks below lg, page scrolls on mobile */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden px-[var(--pad-page)] py-4 gap-6">
          {/* Left rail */}
          <aside className="w-full lg:w-80 lg:shrink-0 bg-card border border-border rounded-[32px] shadow-[var(--shadow-lg)] p-6 flex flex-col">
            <div className="relative mx-auto shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/40 shadow-[var(--shadow-lg)] bg-accent flex items-center justify-center">
                {player.image && !imgError ? (
                  <img src={player.image} alt={player.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-heading font-black text-3xl text-primary">{player.initials}</span>
                )}
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-chalk font-body font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm border-2 border-card">{player.primaryPos}</span>
            </div>
            <div className="text-center mt-5">
              <h1 className="font-heading font-semibold text-[24px] text-foreground tracking-tight leading-tight">{player.name}</h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-heading font-bold text-[12px] text-muted-foreground uppercase tracking-widest">{player.currentTeam}</span>
                <span className="bg-accent text-muted-foreground font-body font-black text-[10px] px-2 py-0.5 rounded uppercase">{(Array.isArray(player.nationality) ? player.nationality[0] : (player.nationality || '')).slice(0, 2).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-start justify-center gap-8 mt-5">
              <Donut pct={scoutedPct} center={String(player.matchesScouted || 0)} label="Matches Scouted" />
              <Donut pct={player.potentialMins || 0} center={(player.potentialMins || 0) + '%'} label="Potential Mins" />
            </div>
            <div className="mt-5 pt-5 border-t border-border flex-1">
              {bio.map(row => (
                <div key={row.l} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <span className="flex items-center gap-2 font-heading text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <row.icon size={13} className="text-primary" /> {row.l}
                  </span>
                  <span className="font-body font-bold text-[12px] text-foreground text-right">{row.v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setIsEditModalOpen(true)} className="mt-5 shrink-0 w-full flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary/10 rounded-full py-2 font-body font-bold text-[14px] transition-colors">
              <Edit2 size={15} /> Edit Player
            </button>
          </aside>

          {/* Right column */}
          <div className="flex-1 min-h-0 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1 bg-card/50 backdrop-blur-xl border border-border/60 rounded-full p-1 shadow-sm overflow-x-auto hide-scrollbar max-w-full">
                {tabs.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={(activeTab === t ? 'bg-primary text-primary-foreground shadow-sm ' : 'text-muted-foreground hover:text-foreground ') + 'rounded-full px-5 py-2 font-body font-bold text-[14px] transition-colors'}>{t}</button>
                ))}
              </div>
              {activeTab === 'Videos & Highlights' && (
                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-xl border border-border/60 rounded-full p-1 shadow-sm shrink-0 overflow-x-auto hide-scrollbar max-w-full">
                  {[['All', 'All Videos'], ['Highlights', 'Only Highlights'], ['Matches', 'Only Matches']].map(opt => (
                    <button key={opt[0]} onClick={() => setVideoFilter(opt[0])} className={(videoFilter === opt[0] ? 'bg-primary text-primary-foreground shadow-sm ' : 'text-muted-foreground hover:text-foreground hover:bg-accent ') + 'px-4 py-2 rounded-full font-body font-bold text-[14px] transition-all'}>{opt[1]}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 max-lg:min-h-[70vh]">
              {activeTab === 'Videos & Highlights' && renderVideos()}
              {activeTab === 'Statistics' && renderStatistics()}
              {activeTab === 'Career History' && renderCareer()}
              {activeTab === 'Notes' && renderNotes()}
            </div>
          </div>
        </div>
      </main>

      {isEditModalOpen && (
        <EditPlayerModal player={player} onClose={() => setIsEditModalOpen(false)} onUpdate={updatedData => setPlayer({ ...player, ...updatedData })} />
      )}

      {showAddNote && (
        <div className="fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
          <div className="bg-card w-full max-w-2xl rounded-[24px] shadow-[var(--shadow-2xl)] border border-border flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-heading font-semibold text-[24px] text-foreground leading-none">Add Note</h3>
              <button onClick={() => setShowAddNote(false)} className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-5 overflow-y-auto no-scrollbar">
              <div>
                <label className={LABEL + ' block mb-2'}>Note</label>
                <textarea value={newNoteText} onChange={e => setNewNoteText(e.target.value)} rows={5} placeholder="Enter your note..." className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all placeholder:text-muted-foreground/40 shadow-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="relative">
                  <label className={LABEL + ' block mb-2'}>Type</label>
                  <select value={newNoteType} onChange={e => setNewNoteType(e.target.value)} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 appearance-none shadow-sm">
                    {NOTE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-[42px] text-muted-foreground pointer-events-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-3">
                  <input type="checkbox" checked={newNotePublic} onChange={e => setNewNotePublic(e.target.checked)} className="w-4 h-4 rounded-sm" />
                  <span className="font-body font-bold text-[14px] text-foreground">Make this note public</span>
                </label>
              </div>
            </div>
            <div className="px-8 py-6 border-t border-border flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowAddNote(false)} className="bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors">Cancel</button>
              <button onClick={postNote} className="bg-primary text-primary-foreground hover:bg-primary/80 px-8 py-2 rounded-full font-body font-black text-[14px] transition-all shadow-[var(--shadow-md)]">Post Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
