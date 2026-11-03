import { useSyncExternalStore } from 'react';

// Session-scoped photo library per player (prototype — no backend). Seeded photos are
// real mock photos from /public/mock/photos; uploads are object URLs, so they last until the tab closes.
// The chosen profile photo is the only thing kept in localStorage, and only for seeded
// photos (an object URL dies with the tab).

export const PHOTO_TAGS = ['Headshot', 'Full body', 'Action', 'Team'] as const;
export type PhotoTag = typeof PHOTO_TAGS[number];

export interface PlayerPhoto {
  id: string;
  src: string;
  /** width / height of the original, so tiles can letterbox without loading it first */
  ratio: number;
  tag?: PhotoTag;
  uploadedBy: string;
  dateLabel: string;
  fileName: string;
  /** 0–100 while uploading; undefined once done */
  progress?: number;
}

// ── Mock photos ───────────────────────────────────────────────────────────────────
// Real football photos (Unsplash licence, credited in ATTRIBUTIONS.md) in /public/mock/photos,
// in the shapes scouts actually upload: tall headshots, tall full-body shots, wide action and
// team shots. Each player gets ONE headshot face, then a cycle of action / full-body / team.
const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const mock = (name: string, w: number, h: number, tag: PhotoTag) => ({ src: `${BASE}mock/photos/${name}.jpg`, ratio: w / h, tag });
const HEADSHOTS = [
  mock('headshot-1', 640, 960, 'Headshot'), mock('headshot-2', 640, 960, 'Headshot'),
  mock('headshot-3', 640, 1081, 'Headshot'), mock('headshot-4', 640, 960, 'Headshot'),
];
const OTHERS = [
  mock('action-1', 640, 427, 'Action'), mock('fullbody-1', 640, 962, 'Full body'), mock('team-1', 640, 427, 'Team'),
  mock('action-2', 640, 427, 'Action'), mock('fullbody-2', 640, 828, 'Full body'), mock('action-3', 640, 358, 'Action'),
  mock('action-4', 640, 427, 'Action'), mock('fullbody-3', 640, 853, 'Full body'), mock('team-2', 640, 427, 'Team'),
  mock('action-5', 640, 640, 'Action'), mock('action-6', 640, 374, 'Action'), mock('action-7', 640, 427, 'Action'),
  mock('action-8', 640, 427, 'Action'),
];

/**
 * Stand-in for a HEIC upload: browsers can't draw HEIC, and the real upload converts it to
 * JPG on the server. Neutral on purpose so it never passes for someone else's photo.
 * (Colours are image content, not UI.)
 */
export function heicStandIn(): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#DCE6F0"/>' +
    '<text x="200" y="196" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="700" fill="#3D4F63">HEIC photo</text>' + // nxus-ignore L-TY3: text drawn inside a stand-in image, not UI text
    '<text x="200" y="232" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#3D4F63">Preview after upload</text></svg>'; // nxus-ignore L-TY3: text drawn inside a stand-in image, not UI text
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/** Mock photo for slot `index` of a player's library (slot 0 is their headshot). */
export function placeholderPhoto(index: number, face = 0): { src: string; ratio: number; tag: PhotoTag } {
  return index === 0 ? HEADSHOTS[face % HEADSHOTS.length] : OTHERS[(index - 1) % OTHERS.length];
}

// ── Seeding ───────────────────────────────────────────────────────────────────────
// Deterministic per id so a player always shows the same library. Two fixed examples:
// db-0 (and the cold-load default P-123) have 30 photos, db-1 has 2.
const OVERRIDES: Record<string, number> = { 'P-123': 30, 'db-0': 30, 'db-1': 2 };
const CYCLE = [2, 5, 0, 1, 9, 3, 14, 2, 7, 4];
const UPLOADERS = ['David Mbugua', 'Tom Legg', 'Sanoussy Sinare', 'Ama Serwaa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

function seedCount(playerId: string) {
  if (playerId in OVERRIDES) return OVERRIDES[playerId];
  const n = parseInt(playerId.replace(/\D/g, ''), 10);
  return CYCLE[(isNaN(n) ? playerId.length : n) % CYCLE.length];
}

function seed(playerId: string): PlayerPhoto[] {
  const face = [...playerId].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return Array.from({ length: seedCount(playerId) }, (_, i) => {
    const p = placeholderPhoto(i, face);
    return {
      id: `${playerId}-ph${i}`, src: p.src, ratio: p.ratio, tag: p.tag,
      uploadedBy: UPLOADERS[i % UPLOADERS.length],
      dateLabel: `${MONTHS[9 - (i % 10)]} ${1 + ((i * 7) % 27)}, 2026`,
      fileName: p.src.split('/').pop() ?? `photo-${i + 1}.jpg`,
    };
  });
}

// ── Store ─────────────────────────────────────────────────────────────────────────
let photos: Map<string, PlayerPhoto[]> = new Map();
let profiles: Map<string, string> = new Map(); // playerId → photo id
let seq = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const PROFILE_KEY = 'nxus:profile-photo:v1';

try {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) profiles = new Map(Object.entries(JSON.parse(raw)));
} catch { /* storage blocked — profile choice just won't persist */ }
const saveProfiles = () => {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(Object.fromEntries(profiles))); } catch { /* ignore */ }
};

export function getPhotos(playerId: string): PlayerPhoto[] {
  let list = photos.get(playerId);
  if (!list) { list = seed(playerId); photos = new Map(photos).set(playerId, list); }
  return list;
}
const put = (playerId: string, list: PlayerPhoto[]) => { photos = new Map(photos).set(playerId, list); emit(); };

export function addPhoto(playerId: string, p: Omit<PlayerPhoto, 'id'>): string {
  const id = `${playerId}-up${++seq}`;
  put(playerId, [{ ...p, id }, ...getPhotos(playerId)]);
  return id;
}
export function updatePhoto(playerId: string, id: string, patch: Partial<PlayerPhoto>) {
  put(playerId, getPhotos(playerId).map(p => p.id === id ? { ...p, ...patch } : p));
}
/** Removes a photo and returns a function that puts it back where it was (for Undo). */
export function removePhoto(playerId: string, id: string): () => void {
  const list = getPhotos(playerId);
  const idx = list.findIndex(p => p.id === id);
  if (idx < 0) return () => {};
  const removed = list[idx];
  const wasProfile = profiles.get(playerId) === id;
  put(playerId, list.filter(p => p.id !== id));
  if (wasProfile) { profiles = new Map(profiles); profiles.delete(playerId); saveProfiles(); emit(); }
  return () => {
    const cur = getPhotos(playerId).slice();
    cur.splice(Math.min(idx, cur.length), 0, removed);
    put(playerId, cur);
    if (wasProfile) setProfilePhoto(playerId, id);
  };
}
export function setProfilePhoto(playerId: string, id: string) {
  profiles = new Map(profiles).set(playerId, id); saveProfiles(); emit();
}

export function usePhotos(playerId: string): PlayerPhoto[] {
  return useSyncExternalStore(subscribe, () => getPhotos(playerId), () => getPhotos(playerId));
}
const getProfiles = () => profiles;
/** The player's chosen profile photo, if any (resolved against the current library). */
export function useProfilePhoto(playerId: string): PlayerPhoto | undefined {
  const map = useSyncExternalStore(subscribe, getProfiles, getProfiles);
  const list = usePhotos(playerId);
  const id = map.get(playerId);
  return id ? list.find(p => p.id === id && p.progress === undefined) : undefined;
}
