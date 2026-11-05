import { useSyncExternalStore } from 'react';
import { directoryFor, meFor, Person } from '../data/people';

// Tasks for the dashboard Tasks board (P-CO26, D-26). Prototype — no backend.
// Each account sees its own board. The seed is rebuilt on every load with due dates
// RELATIVE to today (fixed dates would all age into "overdue"), and only what people
// change — status moves, archives, new tasks — is kept in localStorage.

export type TaskType = 'report-request' | 'weekly-report' | 'video-request' | 'general';
export type TaskState = 'todo' | 'in-progress' | 'completed';
export type TaskColumn = 'overdue' | TaskState;
export type Priority = 'High' | 'Medium' | 'Low';

export interface BoardTask {
  id: string;
  title: string;
  notes?: string;
  type: TaskType;
  priority: Priority;
  status: TaskState;
  archived?: boolean;
  createdBy: string;
  assignee: string;
  created: string;      // ISO yyyy-mm-dd
  due: string;          // ISO yyyy-mm-dd
  completedAt?: string; // ISO yyyy-mm-dd
  playerId?: string;
  playerName?: string;
  match?: string;
  /** Report requests: which report to file ("Short report"). */
  reportType?: string;
  /** General tasks: the profile tab where the work happens. */
  profileTab?: 'career' | 'photos' | 'notes' | 'statistics';
}

export const TASK_TYPES: { id: TaskType; label: string }[] = [
  { id: 'report-request', label: 'Report request' },
  { id: 'weekly-report', label: 'Scout weekly report' },
  { id: 'video-request', label: 'Video request' },
  { id: 'general', label: 'General' },
];
export const typeLabel = (t: TaskType) => TASK_TYPES.find(x => x.id === t)!.label;

export const COLUMNS: { id: TaskColumn; label: string }[] = [
  { id: 'overdue', label: 'Overdue' },
  { id: 'todo', label: 'To-Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];
export const columnLabel = (c: TaskColumn) => COLUMNS.find(x => x.id === c)!.label;

// ── Dates ────────────────────────────────────────────────────────────────────────
export const isoDay = (offset = 0) => {
  const d = new Date(new Date().toDateString());
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayNum = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
/** Whole days from today to `iso` (negative = in the past). */
export const daysFromToday = (iso: string) => dayNum(iso) - dayNum(isoDay(0));
/** "21 Oct" */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const dayLabel = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]}`; };

export const isOverdue = (t: BoardTask) => t.status !== 'completed' && daysFromToday(t.due) < 0;
/** The board column a task sits in: Overdue is worked out from the due date, never chosen. */
export const columnOf = (t: BoardTask): TaskColumn => (isOverdue(t) ? 'overdue' : t.status);
/** Only the person who assigned a task and the person it's for can move it (D-26). */
export const canMove = (t: BoardTask, me: string) => t.createdBy === me || t.assignee === me;

// ── Where a task's work happens (D-26) ───────────────────────────────────────────
const profile = (base: string, id: string, tab?: string) =>
  `${base || '/country-scout'}/player/${encodeURIComponent(id)}${tab ? `?tab=${tab}` : ''}`;

export function taskTarget(t: BoardTask, base: string): string {
  const home = base || '/country-scout';
  switch (t.type) {
    case 'report-request':
      return t.playerId ? profile(base, t.playerId, 'reports') : `${home}/players`;
    case 'weekly-report':
      return base === '/lead-scout' || base === '/senior-scout' ? `${base}/reports` : `${home}?tab=reports`;
    case 'video-request':
      if (base === '/video-manager') return '/video-manager/players?section=video-tracker';
      if (base === '/package-uploader' || base === '/full-match-uploader') return base;
      return t.playerId ? profile(base, t.playerId, 'videos') : `${home}/players`;
    case 'general':
      return t.playerId ? profile(base, t.playerId, t.profileTab) : `${home}/players`;
  }
}

// ── Seed ─────────────────────────────────────────────────────────────────────────
// Real player ids (db-/ll-/sl-/tl-), so a task opens the right profile. Names mirror the
// generated players' pool order on the Players page.
export interface SeedPlayer { id: string; name: string }
let playerPool: SeedPlayer[] = [];
/** The Players page hands its players over once (avoids an import cycle with it). */
export function registerTaskPlayers(players: SeedPlayer[]) {
  if (playerPool.length === 0) { playerPool = players; cache.clear(); emit(); }
}
const FALLBACK_PLAYERS: SeedPlayer[] = [
  'Kwabena Boateng', 'Adama Diedhiou', 'Baboucarr Touray', 'Abdou Kader Mangane', 'Ibrahim Mohammed',
  'Misganaw Melaku', 'Huzeyfa Shafi', 'Corneille Diompy', 'Adegboye Safiu', 'El Hadji Baytir Fall',
].map((name, i) => ({ id: `db-${i}`, name }));

const REPORT_TYPES = ['Scout report', 'Short report', 'Long report', 'Target report'];
const GENERAL: { title: (p: string) => string; tab?: BoardTask['profileTab'] }[] = [
  { title: p => `Fill in all player details: ${p}` },
  { title: p => `Update career history: ${p}`, tab: 'career' },
  { title: p => `Add photos: ${p}`, tab: 'photos' },
  { title: p => `Confirm date of birth: ${p}` },
  { title: p => `Add match stats: ${p}`, tab: 'statistics' },
];
const MATCHES = ['Hearts of Oak vs Asante Kotoko', 'Gor Mahia vs AFC Leopards', 'ASC Jaraaf vs Casa Sports', 'Enyimba vs Rangers', 'Simba vs Young Africans'];

type Recipe = { type: TaskType; from: string; to: string };
/** Who sends what to whom, from the signed-in person's seat (D-26). */
function recipes(me: Person, dir: Person[]): Recipe[] {
  const by = (role: string) => dir.filter(p => p.role === role && p.name !== me.name).map(p => p.name);
  const leads = [...by('Lead Scout'), ...by('Senior Scout')];
  const bosses = [...by('Country Scout'), ...by('Head Scout')];
  const video = [...by('Video Manager'), ...by('Package Uploader'), ...by('Full Match Uploader')];
  const R: Recipe[] = [];
  const add = (n: number, type: TaskType, from: string[], to: string[]) => {
    for (let i = 0; i < n; i++) R.push({ type, from: from[i % from.length], to: to[(i * 7 + 3) % to.length] });
  };
  switch (me.role) {
    case 'Country Scout':
    case 'Head Scout':
      add(26, 'report-request', [me.name], leads);
      add(10, 'general', [me.name], [...by('Country Scout'), ...leads]);
      add(8, 'general', bosses.length ? bosses : leads, [me.name]);
      if (me.role === 'Head Scout') add(6, 'weekly-report', [me.name], [me.name]);
      add(10, 'video-request', [me.name], video);
      add(12, 'report-request', bosses, leads);
      break;
    case 'Lead Scout':
    case 'Senior Scout':
      add(24, 'report-request', bosses, [me.name]);
      add(14, 'video-request', [me.name], video);
      add(10, 'general', bosses, [me.name]);
      if (me.role === 'Senior Scout') add(6, 'weekly-report', by('Head Scout'), [me.name]);
      add(8, 'report-request', bosses, leads);
      add(6, 'video-request', leads, video);
      break;
    default: // video team
      add(28, 'video-request', [...bosses, ...leads], [me.name]);
      add(12, 'video-request', [me.name], video.length ? video : [me.name]);
      add(10, 'general', by('Video Manager').length ? by('Video Manager') : leads, [me.name]);
      add(14, 'video-request', leads, video);
  }
  return R;
}

function seed(base: string): BoardTask[] {
  const me = meFor(base);
  const players = playerPool.length ? playerPool : FALLBACK_PLAYERS;
  return recipes(me, directoryFor(base)).map((r, i) => {
    const p = players[(i * 11 + 5) % players.length];
    const priority = (['Medium', 'High', 'Medium', 'Low'] as Priority[])[i % 4];
    const status = (['todo', 'in-progress', 'todo', 'completed', 'todo'] as TaskState[])[i % 5];
    // Due offset must not share a period with status (period 5) or every to-do lands late.
    const dueIn = -12 + ((i * 13) % 41);
    const created = isoDay(dueIn - 7 - (i % 6));
    const base0 = { id: `${base || '/country-scout'}#${i}`, priority, status, createdBy: r.from, assignee: r.to, created, due: isoDay(dueIn),
      completedAt: status === 'completed' ? isoDay(-((i * 7) % 12)) : undefined };
    switch (r.type) {
      case 'report-request': {
        const rt = REPORT_TYPES[i % REPORT_TYPES.length];
        return { ...base0, type: r.type, title: `Report: ${p.name} (${rt})`, notes: `File a ${rt.toLowerCase()} for ${p.name}.`, reportType: rt, playerId: p.id, playerName: p.name };
      }
      case 'weekly-report':
        return { ...base0, type: r.type, title: `Scout weekly report: week ${40 + (i % 8)}`, notes: 'Players watched, standouts and next steps for the week.' };
      case 'video-request': {
        const kind = ['package', 'full match', 'both'][i % 3];
        return { ...base0, type: r.type, title: `Video request (${kind}): ${p.name}`, notes: `${r.from} requested ${kind} footage for ${p.name}.`, playerId: p.id, playerName: p.name, match: kind !== 'package' ? MATCHES[i % MATCHES.length] : undefined };
      }
      case 'general': {
        const g = GENERAL[i % GENERAL.length];
        return { ...base0, type: r.type, title: g.title(p.name), playerId: p.id, playerName: p.name, profileTab: g.tab };
      }
    }
  });
}

// ── Store: seed + saved changes, per account ─────────────────────────────────────
interface Saved { changes: Record<string, Partial<Pick<BoardTask, 'status' | 'archived' | 'completedAt'>>>; created: BoardTask[] }
const KEY = (base: string) => `nxus:tasks:v1:${base || '/country-scout'}`;
const load = (base: string): Saved => {
  try { const raw = localStorage.getItem(KEY(base)); if (raw) return JSON.parse(raw); } catch { /* private mode etc. */ }
  return { changes: {}, created: [] };
};
const save = (base: string, s: Saved) => { try { localStorage.setItem(KEY(base), JSON.stringify(s)); } catch { /* ignore */ } };

const cache = new Map<string, BoardTask[]>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

export function getTasks(base: string): BoardTask[] {
  let list = cache.get(base);
  if (!list) {
    const s = load(base);
    list = [...s.created, ...seed(base)].map(t => (s.changes[t.id] ? { ...t, ...s.changes[t.id] } : t));
    cache.set(base, list);
  }
  return list;
}

function update(base: string, id: string, patch: Partial<Pick<BoardTask, 'status' | 'archived' | 'completedAt'>>) {
  const s = load(base);
  if (s.created.some(t => t.id === id)) s.created = s.created.map(t => (t.id === id ? { ...t, ...patch } : t));
  else s.changes[id] = { ...s.changes[id], ...patch };
  save(base, s);
  cache.set(base, getTasks(base).map(t => (t.id === id ? { ...t, ...patch } : t)));
  emit();
}

export function setTaskStatus(base: string, id: string, status: TaskState) {
  update(base, id, { status, completedAt: status === 'completed' ? isoDay(0) : undefined });
}
export function setTaskArchived(base: string, id: string, archived: boolean) {
  update(base, id, { archived });
}

let seq = 0;
export type NewTask = Omit<BoardTask, 'id' | 'status' | 'created' | 'archived' | 'completedAt'>;
/** Adds the tasks to this account's board and returns them. */
export function addTasks(base: string, input: NewTask[]): BoardTask[] {
  const made = input.map(t => ({ ...t, id: `new-${Date.now()}-${++seq}`, status: 'todo' as const, created: isoDay(0) }));
  const s = load(base);
  s.created = [...made, ...s.created];
  save(base, s);
  cache.set(base, [...made, ...getTasks(base)]);
  emit();
  return made;
}

/** Reactive tasks for one account's board. */
export function useTasks(base: string): BoardTask[] {
  return useSyncExternalStore(subscribe, () => getTasks(base), () => getTasks(base));
}

/** Open (not done, not archived) tasks assigned to the signed-in person: the top-nav badge. */
export function useMyOpenCount(base: string): number {
  const me = meFor(base).name;
  return useTasks(base).filter(t => !t.archived && t.status !== 'completed' && t.assignee === me).length;
}
