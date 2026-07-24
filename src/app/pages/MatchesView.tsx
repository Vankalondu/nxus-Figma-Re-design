import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  ArrowLeft, ArrowLeftRight, Briefcase, Calendar, CalendarX, ChevronDown, ChevronRight,
  ClipboardList, Clock, Info, MapPin, Pencil, Search, SearchX, Trophy, Video,
} from 'lucide-react';
import { MatchEntry } from '../components/MatchEntry';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Match {
  id: string;
  date: string;
  home: string;
  away: string;
  venue: string;
  raised: number;
  inBracket: number;
  lastUpdatedBy: string;
  hasVideo: boolean;
}

interface Round {
  id: string;
  name: string;
  matches: Match[];
}

interface Competition {
  id: number;
  name: string;
  season: string;
  progress: number; // upload-completion %
  category?: string;
  archived?: boolean;
  rounds?: Round[];
}

// ─── Mock data (mirrors the live platform) ───────────────────────────────────

let matchSeq = 0;
function m(
  date: string, home: string, away: string, venue: string,
  raised: number, inBracket: number, lastUpdatedBy: string, hasVideo = false
): Match {
  matchSeq += 1;
  return { id: `match-${matchSeq}`, date, home, away, venue, raised, inBracket, lastUpdatedBy, hasVideo };
}

const competitionsData: Competition[] = [
  {
    id: 1, name: 'U-17 Africa Cup of Nations UNIFFAC Qualifiers', season: '2025/2026', progress: 0, category: 'U-17',
    rounds: [
      {
        id: 'c1-r1', name: 'Group Stage', matches: [
          m('Sat, 11 Oct 2025', 'Espoirs De Guediawaye', 'Kadji Sports Academy', 'Stade Léopold Sédar Senghor', 6, 3, 'Nene Balde', true),
          m('Sun, 12 Oct 2025', 'AS Douanes', 'JMG Academy Bamako', 'Venue TBD', 2, 1, 'Tom Okeke'),
          m('Sat, 18 Oct 2025', 'Diambars FC', 'Right to Dream Academy', 'Stade Alassane Djigo', 4, 2, 'Mbugua', true),
          m('Sun, 19 Oct 2025', 'Espoirs De Guediawaye', 'AS Douanes', 'Venue TBD', 0, 0, 'Nene Balde'),
        ],
      },
      {
        id: 'c1-r2', name: 'Semi-Finals', matches: [
          m('Sat, 25 Oct 2025', 'Espoirs De Guediawaye', 'Diambars FC', 'Stade Léopold Sédar Senghor', 8, 5, 'Nene Balde', true),
          m('Sun, 26 Oct 2025', 'Kadji Sports Academy', 'Right to Dream Academy', 'Venue TBD', 3, 2, 'Dr. Kwame Asante'),
        ],
      },
      {
        id: 'c1-r3', name: 'Final', matches: [
          m('Sat, 1 Nov 2025', 'Espoirs De Guediawaye', 'Right to Dream Academy', 'Stade Léopold Sédar Senghor', 11, 6, 'Vanessa Lighthouse', true),
        ],
      },
    ],
  },
  {
    id: 2, name: 'ARG Tournament', season: '2025/2025', progress: 100,
    rounds: [
      {
        id: 'c2-r1', name: 'Playoffs 2nd Round', matches: [
          m('Fri, 14 Mar 2025', 'IFA Academy', 'Rising Star Academy', 'ARG Complex Pitch 1', 5, 3, 'Tom Okeke', true),
          m('Sat, 15 Mar 2025', 'Asanska Fc', 'Mawa FC', 'ARG Complex Pitch 2', 3, 1, 'Tom Okeke', true),
          m('Sun, 16 Mar 2025', 'Golden Boys Academy', 'IFA Academy', 'Venue TBD', 2, 2, 'Mbugua'),
        ],
      },
      {
        id: 'c2-r2', name: 'Playoffs 3rd Round Group A', matches: [
          m('Fri, 21 Mar 2025', 'IFA Academy', 'Asanska Fc', 'ARG Complex Pitch 1', 7, 4, 'Tom Okeke', true),
          m('Sat, 22 Mar 2025', 'Rising Star Academy', 'Golden Boys Academy', 'ARG Complex Pitch 1', 4, 2, 'Nene Balde', true),
        ],
      },
      {
        id: 'c2-r3', name: 'Playoffs 3rd Round Group B', matches: [
          m('Fri, 21 Mar 2025', 'Mawa FC', 'Cheetah FC', 'ARG Complex Pitch 2', 1, 0, 'Mbugua'),
          m('Sat, 22 Mar 2025', 'Attram De Visser', 'Mawa FC', 'ARG Complex Pitch 2', 6, 3, 'Dr. Kwame Asante', true),
        ],
      },
      {
        id: 'c2-r4', name: 'Grand Final', matches: [
          m('Sat, 29 Mar 2025', 'IFA Academy', 'Attram De Visser', 'ARG Complex Pitch 1', 9, 5, 'Vanessa Lighthouse', true),
        ],
      },
    ],
  },
  {
    id: 3, name: 'Abuja Elite League', season: '2025/2026', progress: 0, category: 'Senior',
    rounds: [
      {
        id: 'c3-r1', name: 'Round 1', matches: [
          m('Sat, 6 Sep 2025', 'Abuja City FC', 'Kano Pillars', 'Moshood Abiola Stadium', 0, 0, 'Tom Okeke'),
          m('Sun, 7 Sep 2025', 'Rivers United', 'Enyimba FC', 'Venue TBD', 1, 0, 'Tom Okeke'),
          m('Sun, 7 Sep 2025', 'Nasarawa United', 'Katsina United', 'Venue TBD', 0, 0, 'Mbugua'),
        ],
      },
      {
        id: 'c3-r2', name: 'Round 2', matches: [
          m('Sat, 13 Sep 2025', 'Enyimba FC', 'Abuja City FC', 'Enyimba International Stadium', 2, 1, 'Tom Okeke'),
          m('Sun, 14 Sep 2025', 'Kano Pillars', 'Nasarawa United', 'Sani Abacha Stadium', 0, 0, 'Nene Balde'),
        ],
      },
    ],
  },
  {
    id: 4, name: 'African Cup of Nations (AFCON)', season: '2025/2026', progress: 100, category: 'Senior',
    rounds: [
      {
        id: 'c4-r1', name: 'Group Stage', matches: [
          m('Sun, 21 Dec 2025', 'Morocco', 'Comoros', 'Prince Moulay Abdellah Stadium', 8, 4, 'Vanessa Lighthouse', true),
          m('Mon, 22 Dec 2025', 'Senegal', 'Botswana', 'Stade de Tanger', 10, 6, 'Nene Balde', true),
          m('Tue, 23 Dec 2025', 'Nigeria', 'Tanzania', 'Stade de Fès', 7, 3, 'Tom Okeke', true),
          m('Wed, 24 Dec 2025', 'Kenya', 'Ivory Coast', 'Stade de Marrakech', 5, 2, 'Mbugua', true),
        ],
      },
      {
        id: 'c4-r2', name: 'Round of 16', matches: [
          m('Sat, 3 Jan 2026', 'Senegal', 'Nigeria', 'Stade de Tanger', 12, 7, 'Vanessa Lighthouse', true),
          m('Sun, 4 Jan 2026', 'Morocco', 'Ivory Coast', 'Prince Moulay Abdellah Stadium', 9, 5, 'Nene Balde', true),
        ],
      },
      {
        id: 'c4-r3', name: 'Quarter-Finals', matches: [
          m('Fri, 9 Jan 2026', 'Senegal', 'Morocco', 'Prince Moulay Abdellah Stadium', 14, 8, 'Vanessa Lighthouse', true),
        ],
      },
    ],
  },
  {
    id: 5, name: 'CAF-CUP', season: '2025/2026', progress: 45,
    rounds: [
      {
        id: 'c5-r1', name: 'Preliminary Round', matches: [
          m('Sat, 16 Aug 2025', 'ASEC Mimosas', 'AS Douanes', 'Stade Félix Houphouët-Boigny', 3, 1, 'Dr. Kwame Asante', true),
          m('Sun, 17 Aug 2025', 'Gor Mahia', 'Enyimba FC', 'Venue TBD', 2, 1, 'Mbugua'),
        ],
      },
      {
        id: 'c5-r2', name: 'First Round', matches: [
          m('Sat, 13 Sep 2025', 'ASEC Mimosas', 'Gor Mahia', 'Stade Félix Houphouët-Boigny', 4, 2, 'Dr. Kwame Asante'),
          m('Sun, 14 Sep 2025', 'Tusker FC', 'Rivers United', 'Nyayo National Stadium', 1, 1, 'Mbugua', true),
          m('Sun, 14 Sep 2025', 'Kadji Sports Academy', 'Diambars FC', 'Venue TBD', 0, 0, 'Nene Balde'),
        ],
      },
      {
        id: 'c5-r3', name: 'Group Stage', matches: [],
      },
    ],
  },
  {
    id: 6, name: 'Nigeria Professional Football League', season: '2025/2026', progress: 60, category: 'Senior',
    rounds: [
      {
        id: 'c6-r1', name: 'Matchday 1', matches: [
          m('Sat, 30 Aug 2025', 'Enyimba FC', 'Kano Pillars', 'Enyimba International Stadium', 4, 2, 'Tom Okeke', true),
          m('Sun, 31 Aug 2025', 'Rivers United', 'Katsina United', 'Adokiye Amiesimaka Stadium', 2, 1, 'Tom Okeke'),
          m('Sun, 31 Aug 2025', 'Abuja City FC', 'Nasarawa United', 'Venue TBD', 1, 0, 'Mbugua'),
        ],
      },
      {
        id: 'c6-r2', name: 'Matchday 2', matches: [
          m('Sat, 6 Sep 2025', 'Kano Pillars', 'Rivers United', 'Sani Abacha Stadium', 3, 2, 'Tom Okeke', true),
          m('Sun, 7 Sep 2025', 'Katsina United', 'Enyimba FC', 'Muhammadu Dikko Stadium', 0, 0, 'Nene Balde'),
        ],
      },
      {
        id: 'c6-r3', name: 'Matchday 3', matches: [
          m('Sat, 13 Sep 2025', 'Nasarawa United', 'Kano Pillars', 'Lafia City Stadium', 2, 1, 'Tom Okeke'),
          m('Sun, 14 Sep 2025', 'Enyimba FC', 'Abuja City FC', 'Venue TBD', 5, 3, 'Mbugua', true),
        ],
      },
    ],
  },
  {
    id: 7, name: 'Kenya Premier League', season: '2025/2026', progress: 80, category: 'Senior',
    rounds: [
      {
        id: 'c7-r1', name: 'Matchday 1', matches: [
          m('Sat, 23 Aug 2025', 'Gor Mahia', 'Tusker FC', 'Nyayo National Stadium', 6, 4, 'Mbugua', true),
          m('Sun, 24 Aug 2025', 'AFC Leopards', 'Kakamega Homeboyz', 'Bukhungu Stadium', 3, 2, 'Mbugua', true),
          m('Sun, 24 Aug 2025', 'Ulinzi Stars', 'Sofapaka FC', 'Venue TBD', 1, 0, 'Nene Balde'),
        ],
      },
      {
        id: 'c7-r2', name: 'Matchday 2', matches: [
          m('Sat, 30 Aug 2025', 'Tusker FC', 'AFC Leopards', 'Ruaraka Grounds', 4, 3, 'Mbugua', true),
          m('Sun, 31 Aug 2025', 'Kakamega Homeboyz', 'Gor Mahia', 'Bukhungu Stadium', 5, 2, 'Mbugua', true),
          m('Sun, 31 Aug 2025', 'Sofapaka FC', 'Ulinzi Stars', 'Venue TBD', 0, 0, 'Tom Okeke'),
        ],
      },
      {
        id: 'c7-r3', name: 'Matchday 3', matches: [
          m('Sat, 6 Sep 2025', 'Gor Mahia', 'Ulinzi Stars', 'Nyayo National Stadium', 2, 1, 'Mbugua'),
          m('Sun, 7 Sep 2025', 'AFC Leopards', 'Sofapaka FC', 'Venue TBD', 1, 1, 'Nene Balde'),
        ],
      },
      {
        id: 'c7-r4', name: 'Matchday 4', matches: [
          m('Sat, 13 Sep 2025', 'Tusker FC', 'Kakamega Homeboyz', 'Ruaraka Grounds', 3, 1, 'Mbugua', true),
        ],
      },
    ],
  },
  {
    id: 8, name: 'WAFU Zone B U-20 Championship', season: '2025/2026', progress: 20, category: 'U-20',
    rounds: [
      {
        id: 'c8-r1', name: 'Group Stage', matches: [
          m('Sat, 4 Oct 2025', 'Ghana U-20', 'Ivory Coast U-20', 'University of Ghana Stadium', 5, 3, 'Dr. Kwame Asante', true),
          m('Sun, 5 Oct 2025', 'Nigeria U-20', 'Burkina Faso U-20', 'Venue TBD', 4, 2, 'Tom Okeke'),
          m('Mon, 6 Oct 2025', 'Benin U-20', 'Togo U-20', 'Venue TBD', 1, 0, 'Nene Balde'),
        ],
      },
      {
        id: 'c8-r2', name: 'Semi-Finals', matches: [
          m('Fri, 10 Oct 2025', 'Ghana U-20', 'Nigeria U-20', 'University of Ghana Stadium', 7, 4, 'Dr. Kwame Asante', true),
          m('Sat, 11 Oct 2025', 'Ivory Coast U-20', 'Burkina Faso U-20', 'Venue TBD', 3, 1, 'Tom Okeke'),
        ],
      },
    ],
  },
  { id: 9, name: 'AFCON U17', season: '2024/2025', progress: 100, category: 'U-17', archived: true },
  { id: 10, name: 'COSAFA Cup', season: '2024/2025', progress: 100, category: 'Senior', archived: true },
];

const SEASONS = ['All Seasons', '2025/2026', '2024/2025'];

// ─── Small pieces ────────────────────────────────────────────────────────────

function ProgressPill({ progress }: { progress: number }) {
  const cls =
    progress === 100
      ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20'
      : progress === 0
        ? 'bg-accent text-muted-foreground border-border'
        : 'bg-primary/10 text-primary border-primary/20';
  return (
    <span
      title="Match upload progress"
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-mono font-bold text-[12px] ${cls}`}
    >
      {progress}%
      <Info size={12} className="opacity-60 shrink-0" />
    </span>
  );
}

function CompetitionCard({ comp, onOpen }: { comp: Competition; onOpen: (c: Competition) => void }) {
  return (
    <button
      onClick={() => onOpen(comp)}
      className={`bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3 text-left transition-all hover:border-primary hover:shadow-[var(--shadow-xl)] hover:-translate-y-1 cursor-pointer ${comp.archived ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-heading font-semibold text-[16px] text-foreground leading-snug line-clamp-2">
          {comp.name}
        </h4>
        <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
          <Trophy size={14} className="text-muted-foreground" />
        </span>
      </div>

      {comp.category && (
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
          {comp.category}
        </span>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-auto">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
          {comp.season}
        </span>
        <ProgressPill progress={comp.progress} />
        {comp.archived && (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted-foreground/10 border border-border font-body font-bold text-[12px] text-muted-foreground">
            Archived
          </span>
        )}
      </div>
    </button>
  );
}

// Locate a match by id across all competitions/rounds (for ?match= deep-links from the dashboard).
function findMatchLocation(matchId: string): { comp: Competition; round: Round } | null {
  for (const comp of competitionsData) {
    for (const round of comp.rounds ?? []) {
      if (round.matches.some(mm => mm.id === matchId)) return { comp, round };
    }
  }
  return null;
}

function MatchCard({ match, onEntry, highlight = false }: { match: Match; onEntry: (m: Match) => void; highlight?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlight && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight]);
  return (
    <div ref={ref} id={`match-card-${match.id}`}
      className={`bg-card rounded-[20px] border shadow-[var(--shadow-lg)] p-5 flex flex-col gap-3 transition-all hover:shadow-[var(--shadow-xl)] ${highlight ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-border'}`}>
      {/* Top row: date + visible icon actions */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-body font-bold text-[12px] text-muted-foreground min-w-0">
          <Calendar size={12} className="shrink-0" />
          <span className="truncate">{match.date}</span>
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            title="Edit Date/Venue"
            className="w-8 h-8 rounded-full bg-accent hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            title="Move Match"
            className="w-8 h-8 rounded-full bg-accent hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeftRight size={13} />
          </button>
        </div>
      </div>

      {/* Teams block */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Home</span>
          </span>
          <span className="font-heading font-semibold text-[16px] text-foreground truncate" title={match.home}>
            {match.home}
          </span>
        </div>
        <span className="shrink-0 w-8 h-8 rounded-full bg-accent border border-border flex items-center justify-center font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
          VS
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-1 items-end text-right">
          <span className="inline-flex items-center gap-2">
            <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Away</span>
            <span className="w-2 h-2 rounded-full bg-[#E05C4B] shrink-0" />
          </span>
          <span className="font-heading font-semibold text-[16px] text-foreground truncate w-full" title={match.away}>
            {match.away}
          </span>
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-2">
        <MapPin size={12} className="text-muted-foreground shrink-0" />
        <span className="font-body font-medium text-[12px] text-muted-foreground truncate">{match.venue}</span>
      </div>

      {/* Status chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-body font-bold text-[12px]">
          <Briefcase size={12} className="shrink-0" />
          {match.raised} Raised
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 font-body font-bold text-[12px]">
          <Clock size={12} className="shrink-0" />
          {match.inBracket} In Age Bracket
        </span>
      </div>

      {/* Actions — primary + secondary on one line (Reports-card pattern) */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => onEntry(match)}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-4 py-2 font-body font-bold text-[14px] transition-colors shadow-sm"
        >
          <ClipboardList size={14} className="shrink-0" />
          Match Entry
        </button>
        <button
          className={`flex-1 inline-flex items-center justify-center gap-2 bg-card text-foreground border border-border hover:border-primary rounded-full px-4 py-2 font-body font-bold text-[14px] transition-colors shadow-sm ${match.hasVideo ? '' : 'opacity-60'}`}
        >
          <Video size={14} className="shrink-0" />
          Watch Video
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <Info size={12} className="text-muted-foreground/60 shrink-0" />
        <span className="font-body font-medium text-[12px] text-muted-foreground truncate">
          Last updated by {match.lastUpdatedBy}
        </span>
      </div>
    </div>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function MatchesView() {
  const [view, setView] = useState<'competitions' | 'competition' | 'entry'>('competitions');
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [season, setSeason] = useState('All Seasons');
  const [searchParams] = useSearchParams();
  const [highlightMatchId, setHighlightMatchId] = useState<string | null>(null);

  // Deep-link: ?match=<id> opens that fixture's competition/round with the card highlighted.
  useEffect(() => {
    const mid = searchParams.get('match');
    if (!mid) return;
    const loc = findMatchLocation(mid);
    if (!loc) return;
    setSelectedComp(loc.comp);
    setSelectedRound(loc.round.id);
    setSelectedMatch(null);
    setView('competition');
    setHighlightMatchId(mid);
    const t = setTimeout(() => setHighlightMatchId(null), 3000);
    return () => clearTimeout(t);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return competitionsData.filter(
      c =>
        (season === 'All Seasons' || c.season === season) &&
        (q === '' || c.name.toLowerCase().includes(q))
    );
  }, [searchQuery, season]);

  const active = filtered.filter(c => !c.archived);
  const archived = filtered.filter(c => c.archived);

  const openCompetition = (c: Competition) => {
    setSelectedComp(c);
    setSelectedRound(c.rounds?.[0]?.id ?? '');
    setSelectedMatch(null);
    setView('competition');
  };

  const backToList = () => {
    setView('competitions');
    setSelectedComp(null);
    setSelectedRound('');
    setSelectedMatch(null);
  };

  const backToCompetition = () => {
    setView('competition');
    setSelectedMatch(null);
  };

  const openEntry = (match: Match) => {
    setSelectedMatch(match);
    setView('entry');
  };

  const rounds = selectedComp?.rounds ?? [];
  const currentRound = rounds.find(r => r.id === selectedRound) ?? rounds[0];

  // ── Match entry (Phase 3: unified entry screen — see MatchEntry.tsx) ──
  if (view === 'entry' && selectedComp && selectedMatch) {
    return (
      <MatchEntry
        key={selectedMatch.id}
        match={selectedMatch}
        competitionName={selectedComp.name}
        roundName={currentRound?.name ?? 'Round'}
        onBackToCompetitions={backToList}
        onBackToCompetition={backToCompetition}
      />
    );
  }

  // ── Competition detail: round tabs + match grid ──
  if (view === 'competition' && selectedComp) {
    return (
      <div className="flex flex-col h-full space-y-4 pb-10">
        <div className="pt-6 mb-3 flex flex-col gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={backToList}
              className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-foreground transition-colors shadow-sm"
              title="Back to competitions"
            >
              <ArrowLeft size={14} />
            </button>
            <nav className="flex items-center gap-2 font-body font-bold text-[14px]">
              <button onClick={backToList} className="text-primary hover:underline">
                Competitions
              </button>
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">{selectedComp.name}</span>
            </nav>
          </div>

          <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
            {selectedComp.name}
            <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Trophy size={20} className="text-chalk" />
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent border border-border font-body font-bold text-[12px] text-muted-foreground">
              {selectedComp.season}
            </span>
            <ProgressPill progress={selectedComp.progress} />
          </div>
        </div>

        {/* Round / stage tabs */}
        {rounds.length > 0 ? (
          <>
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {rounds.map(round => (
                <button
                  key={round.id}
                  onClick={() => setSelectedRound(round.id)}
                  className={`px-4 py-2 rounded-full font-body font-bold text-[14px] transition-colors whitespace-nowrap ${
                    currentRound?.id === round.id
                      ? 'bg-primary text-chalk shadow-sm'
                      : 'bg-accent text-foreground border border-border hover:border-primary'
                  }`}
                >
                  {round.name}
                </button>
              ))}
            </div>

            {/* Match grid */}
            {currentRound && currentRound.matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentRound.matches.map(match => (
                  <MatchCard key={match.id} match={match} onEntry={openEntry} highlight={highlightMatchId === match.id} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <span className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <CalendarX size={20} className="text-muted-foreground" />
                </span>
                <p className="font-body font-medium text-[14px] text-muted-foreground">
                  No matches scheduled for this round yet.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] p-8 flex items-center justify-center">
            <p className="font-body font-medium text-[14px] text-muted-foreground">
              No rounds have been created for this competition yet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Competitions list ──
  return (
    <div className="flex flex-col h-full space-y-4 pb-10">
      {/* Page header + toolbar share one row on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 pt-6 mb-3">
        <div className="flex flex-col justify-center shrink-0">
        <h1 className="font-heading font-semibold text-h3 tracking-tight text-foreground flex items-center gap-4 leading-none">
          Competitions
          <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Calendar size={28} className="text-chalk" />
          </span>
        </h1>
        <p className="font-body font-medium text-[15px] text-muted-foreground mt-2 short:hidden">
          Track upload progress across your competitions.
        </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap lg:justify-end">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search competitions…"
            className="w-full pl-11 pr-4 py-2 bg-card border border-border rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all font-body font-bold shadow-sm placeholder:text-muted-foreground text-foreground"
          />
        </div>

        <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary transition-colors cursor-pointer shadow-sm">
          <span className="font-body font-bold text-[14px] text-muted-foreground">Season:</span>
          <select
            value={season}
            onChange={e => setSeason(e.target.value)}
            className="appearance-none bg-transparent border-none font-body font-bold text-[14px] text-foreground focus:outline-none cursor-pointer pr-5"
          >
            {SEASONS.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <span className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <SearchX size={20} className="text-muted-foreground" />
          </span>
          <p className="font-body font-medium text-[14px] text-muted-foreground">
            No competitions match your search.
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {active.map(comp => (
                <CompetitionCard key={comp.id} comp={comp} onOpen={openCompetition} />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <>
              <div className="flex items-center gap-3 pt-4">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                  Archived
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {archived.map(comp => (
                  <CompetitionCard key={comp.id} comp={comp} onOpen={openCompetition} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
