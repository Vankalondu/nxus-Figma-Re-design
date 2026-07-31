import { useSyncExternalStore } from 'react';

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
export function setTier(id: string, tier: PipelineTier) {
  tierMap = new Map(tierMap).set(id, tier);
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
