// ─── Shared column registry for the players tables ───────────────────────────────
// A single source of truth for every column that can appear in a players table,
// grouped exactly like the design mockup. `value()` reads the obvious field off a
// player when present, otherwise falls back to a DETERMINISTIC mock keyed off the
// player id (or row index) so a given cell renders the same string on every render.

export type ColGroup = 'BIO DATA' | 'GAME STATS' | 'METHOD' | 'STATUS' | 'GRADES' | 'EXTERNAL';

export interface PlayerColumn {
  id: string;            // stable key, e.g. 'starts'
  label: string;         // header text, e.g. 'Starts'
  group: ColGroup;
  defaultVisible: boolean;
  align?: 'left' | 'center';
  mono?: boolean;        // numeric columns → tabular-nums
  // returns a display string for a player row; uses a deterministic mock when the field is absent
  value: (player: any, index: number) => string;
}

// Canonical group order — mirrors the mockup and drives the modal layout.
export const GROUP_ORDER: ColGroup[] = ['BIO DATA', 'GAME STATS', 'METHOD', 'STATUS', 'GRADES', 'EXTERNAL'];

// ─── Deterministic pseudo-random helper ──────────────────────────────────────────
// hashSeed turns any seed string into a stable unsigned 32-bit integer (no Math.random,
// no Date.now — same input always yields the same number). `seededFloat` maps that to
// a stable 0..1 float, and the pick/range helpers derive concrete mock values from it.
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0; // FNV-1a offset basis
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619); // FNV prime
  }
  return h >>> 0;
}

// Build the per-cell seed from (player id ?? row index) + column id so values are
// stable per player *and* per column.
function seedFor(player: any, index: number, colId: string): number {
  const base = player && player.id != null ? String(player.id) : String(index);
  return hashSeed(base + '::' + colId);
}

const seededFloat = (seed: number): number => (seed % 100000) / 100000;

const pick = <T,>(arr: T[], seed: number): T => arr[seed % arr.length];

const rangeInt = (min: number, max: number, seed: number): number =>
  min + (seed % (max - min + 1));

// ─── Mock value pools ─────────────────────────────────────────────────────────────
const COUNTRIES = ['GHA', 'NGA', 'SEN', 'CIV', 'CMR', 'MLI', 'MAR', 'EGY', 'RSA', 'ALG'];
const POSITIONS = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];
const TEAMS = ['Karela United', 'Hearts of Oak', 'Asante Kotoko', 'Enyimba FC', 'Kaizer Chiefs', 'Simba SC', 'TP Mazembe', 'Espérance'];
const METHODS = ['Live', 'Video', 'Report'];
const STATUSES = ['Active', 'Pending', 'Signed', 'Watch'];
const GRADES = ['A+', 'A', 'B+', 'B', 'C'];

// Format a deterministic per-90-style decimal, e.g. "0.42".
const per90 = (seed: number, min = 0, max = 250): string => (rangeInt(min, max, seed) / 100).toFixed(2);

// Format a deterministic market value, e.g. "$1.2M" or "$450K".
const marketValue = (seed: number): string => {
  if (seededFloat(seed) > 0.5) return `$${(rangeInt(5, 45, seed) / 10).toFixed(1)}M`;
  return `$${rangeInt(50, 950, seed)}K`;
};

// ─── Column registry ──────────────────────────────────────────────────────────────
export const PLAYER_COLUMNS: PlayerColumn[] = [
  // ── BIO DATA ──
  {
    id: 'ctry', label: 'Ctry', group: 'BIO DATA', defaultVisible: false, align: 'left',
    value: (p, i) => p?.ctry ?? p?.country ?? pick(COUNTRIES, seedFor(p, i, 'ctry')),
  },
  {
    id: 'pos', label: 'Pos', group: 'BIO DATA', defaultVisible: false, align: 'left',
    value: (p, i) => p?.pos ?? p?.position ?? pick(POSITIONS, seedFor(p, i, 'pos')),
  },
  {
    id: 'team', label: 'Team', group: 'BIO DATA', defaultVisible: false, align: 'left',
    value: (p, i) => p?.team ?? p?.club ?? pick(TEAMS, seedFor(p, i, 'team')),
  },

  // ── GAME STATS ──
  {
    id: 'app', label: 'App', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.app ?? p?.appearances ?? rangeInt(0, 34, seedFor(p, i, 'app'))),
  },
  {
    id: 'starts', label: 'Starts', group: 'GAME STATS', defaultVisible: true, align: 'center', mono: true,
    value: (p, i) => String(p?.starts ?? rangeInt(0, 34, seedFor(p, i, 'starts'))),
  },
  {
    id: 'goals', label: 'Goals', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.goals ?? rangeInt(0, 28, seedFor(p, i, 'goals'))),
  },
  {
    id: 'ass', label: 'Ass', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.ass ?? p?.assists ?? rangeInt(0, 20, seedFor(p, i, 'ass'))),
  },
  {
    id: 'pens', label: 'Pens', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.pens ?? rangeInt(0, 8, seedFor(p, i, 'pens'))),
  },
  {
    id: 'gc', label: 'GC', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.gc ?? rangeInt(0, 40, seedFor(p, i, 'gc'))),
  },
  {
    id: 'mins', label: 'Mins', group: 'GAME STATS', defaultVisible: true, align: 'center', mono: true,
    value: (p, i) => String(p?.mins ?? p?.minutes ?? rangeInt(120, 3060, seedFor(p, i, 'mins'))),
  },
  {
    id: 'm90', label: 'M/90', group: 'GAME STATS', defaultVisible: true, align: 'center', mono: true,
    value: (p, i) => per90(seedFor(p, i, 'm90'), 0, 3400),
  },
  {
    id: 'g90', label: 'G/90', group: 'GAME STATS', defaultVisible: true, align: 'center', mono: true,
    value: (p, i) => per90(seedFor(p, i, 'g90'), 0, 120),
  },
  {
    id: 'a90', label: 'A/90', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => per90(seedFor(p, i, 'a90'), 0, 90),
  },
  {
    id: 'gc90', label: 'GC/90', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => per90(seedFor(p, i, 'gc90'), 0, 180),
  },
  {
    id: 'mpg', label: 'MPG', group: 'GAME STATS', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.mpg ?? rangeInt(35, 90, seedFor(p, i, 'mpg'))),
  },

  // ── METHOD ──
  {
    id: 'method', label: 'Method', group: 'METHOD', defaultVisible: true, align: 'left',
    value: (p, i) => p?.method ?? pick(METHODS, seedFor(p, i, 'method')),
  },
  {
    id: 'methodStatus', label: 'Status', group: 'METHOD', defaultVisible: true, align: 'left',
    value: (p, i) => p?.methodStatus ?? pick(STATUSES, seedFor(p, i, 'methodStatus')),
  },

  // ── STATUS ──
  {
    id: 'market', label: 'Market', group: 'STATUS', defaultVisible: true, align: 'left', mono: true,
    value: (p, i) => p?.market ?? marketValue(seedFor(p, i, 'market')),
  },
  {
    id: 'status', label: 'Status', group: 'STATUS', defaultVisible: true, align: 'left',
    value: (p, i) => p?.status ?? pick(STATUSES, seedFor(p, i, 'status')),
  },

  // ── GRADES ──
  {
    id: 'overallGrade', label: 'Overall', group: 'GRADES', defaultVisible: false, align: 'center',
    value: (p, i) => p?.overallGrade ?? p?.grade ?? pick(GRADES, seedFor(p, i, 'overallGrade')),
  },
  {
    id: 'potentialGrade', label: 'Potential', group: 'GRADES', defaultVisible: false, align: 'center',
    value: (p, i) => p?.potentialGrade ?? pick(GRADES, seedFor(p, i, 'potentialGrade')),
  },

  // ── EXTERNAL ──
  {
    id: 'appsExt', label: 'Apps (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.appsExt ?? rangeInt(0, 38, seedFor(p, i, 'appsExt'))),
  },
  {
    id: 'minExt', label: 'Min (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.minExt ?? rangeInt(90, 3420, seedFor(p, i, 'minExt'))),
  },
  {
    id: 'goalsExt', label: 'Goals (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.goalsExt ?? rangeInt(0, 30, seedFor(p, i, 'goalsExt'))),
  },
  {
    id: 'assistsExt', label: 'Assists (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => String(p?.assistsExt ?? rangeInt(0, 22, seedFor(p, i, 'assistsExt'))),
  },
  {
    id: 'valueExt', label: 'Value (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'left', mono: true,
    value: (p, i) => p?.valueExt ?? marketValue(seedFor(p, i, 'valueExt')),
  },
  {
    id: 'ebRating', label: 'EB Rating (ext)', group: 'EXTERNAL', defaultVisible: false, align: 'center', mono: true,
    value: (p, i) => per90(seedFor(p, i, 'ebRating'), 550, 990),
  },
];

// Ids whose defaultVisible is true — the mockup's selected set.
export const DEFAULT_VISIBLE_IDS: string[] = PLAYER_COLUMNS.filter(c => c.defaultVisible).map(c => c.id);
