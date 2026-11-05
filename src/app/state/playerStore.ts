import { useSyncExternalStore } from 'react';
import { currentBase, meFor } from '../data/people';

// Shared, session-scoped player state so the global top-nav search and the players
// page read/write the SAME list membership + uploaded highlights (keyed by the
// module-global, stable player ids from ALL_GENERATED_PLAYERS).

export type PipelineTier = 'long-list' | 'short-list' | 'target-list';

export interface UploadedHighlight {
  id: string;
  title: string;
  source: 'link' | 'file';
  url?: string;
  fileName?: string;
  addedLabel: string; // e.g. "Just now"
}

// ── Tier store (short/target/long membership) ──────────────────────────────────
let tierMap: Map<string, PipelineTier> = new Map();
let tierSeeded = false;
const tierListeners = new Set<() => void>();
const emitTiers = () => tierListeners.forEach(l => l());

/** Seed once from the page's initial tiers (idempotent). */
export function seedTiers(seed: Map<string, PipelineTier>) {
  if (tierSeeded) return;
  tierMap = new Map(seed);
  tierSeeded = true;
}
/** Move a player to a list. Every move is kept in the player's list history (D-26). */
export function setTier(id: string, tier: PipelineTier, by: string = meFor(currentBase()).name) {
  const before = historyFor(id);
  tierMap = new Map(tierMap).set(id, tier);
  if (before[before.length - 1]?.tier !== tier) {
    history = new Map(history).set(id, [...before, { tier, by, at: isoDay(0) }]);
  }
  emitTiers();
}
export function clearTier(id: string) {
  if (!tierMap.has(id)) return;
  const next = new Map(tierMap); next.delete(id); tierMap = next; emitTiers();
}
export function getTierMap() { return tierMap; }
const subscribeTiers = (cb: () => void) => { tierListeners.add(cb); return () => tierListeners.delete(cb); };
export function useTierMap(): Map<string, PipelineTier> {
  return useSyncExternalStore(subscribeTiers, getTierMap, getTierMap);
}

// ── List history (D-26): every list a player has been on, who put them there and when ──
export interface TierMove { tier: PipelineTier; by: string; at: string /* ISO yyyy-mm-dd */ }
const LIST_SCOUTS = ['Tom Legg', 'Kwame Asante', 'David Mbugua', 'Sanoussy Sinare'];
const isoDay = (offset: number) => { const d = new Date(new Date().toDateString()); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
let history: Map<string, TierMove[]> = new Map();

/**
 * The seeded path to a player's current list, deterministic per id: Long → Short → Target,
 * and every third player has a move back down on the way so the full history shows.
 */
function seedHistory(id: string): TierMove[] {
  const tier = tierMap.get(id);
  if (!tier) return [];
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const path: PipelineTier[] = tier === 'long-list' ? ['long-list']
    : tier === 'short-list' ? (n % 3 === 0 ? ['long-list', 'short-list', 'target-list', 'short-list'] : ['long-list', 'short-list'])
    : (n % 3 === 0 ? ['long-list', 'short-list', 'long-list', 'short-list', 'target-list'] : ['long-list', 'short-list', 'target-list']);
  let day = -(8 + (n % 9));
  const moves: TierMove[] = [];
  for (let i = path.length - 1; i >= 0; i--) {
    moves.unshift({ tier: path[i], by: LIST_SCOUTS[(n + i) % LIST_SCOUTS.length], at: isoDay(day) });
    day -= 9 + ((n + i * 5) % 12);
  }
  return moves;
}
export function historyFor(id: string): TierMove[] {
  return history.get(id) ?? seedHistory(id);
}
/** Reactive list history for one player (empty when they've never been on a list). */
export function useTierHistory(id: string | undefined): TierMove[] {
  useTierMap();
  return id ? historyFor(id) : [];
}

// ── Uploaded highlights store (playerId → highlights) ──────────────────────────
let highlights: Map<string, UploadedHighlight[]> = new Map();
let hlSeq = 0;
const hlListeners = new Set<() => void>();
const emitHl = () => hlListeners.forEach(l => l());
const EMPTY_HL: UploadedHighlight[] = [];

export function addHighlight(playerId: string, h: Omit<UploadedHighlight, 'id'>) {
  const list = highlights.get(playerId) ?? [];
  const next = new Map(highlights);
  next.set(playerId, [{ ...h, id: `uh-${++hlSeq}` }, ...list]);
  highlights = next;
  emitHl();
}
export function getHighlightsFor(playerId: string): UploadedHighlight[] {
  return highlights.get(playerId) ?? EMPTY_HL;
}
const getHlSnapshot = () => highlights;
const subscribeHl = (cb: () => void) => { hlListeners.add(cb); return () => hlListeners.delete(cb); };
/** Reactive: uploaded highlights for one player (empty array if none). */
export function useHighlightsFor(playerId: string | undefined): UploadedHighlight[] {
  const map = useSyncExternalStore(subscribeHl, getHlSnapshot, getHlSnapshot);
  return (playerId && map.get(playerId)) || EMPTY_HL;
}
