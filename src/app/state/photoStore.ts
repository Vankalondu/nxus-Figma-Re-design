import { useSyncExternalStore } from 'react';

// Session-scoped photo library per player (prototype — no backend). Seeded photos are
// generated SVG placeholders; uploads are object URLs, so they last until the tab closes.
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

// ── Placeholder images ────────────────────────────────────────────────────────────
// Each is a simple SVG "photo" in one of the real-world shapes scouts upload: tall
// headshots, wide match shots, square team crops. Colours are image content, not UI.
const SCENES = [
  { tag: 'Headshot' as PhotoTag, w: 3, h: 4, sky: '#1971BF', ground: '#0B3A66' },
  { tag: 'Action' as PhotoTag, w: 16, h: 9, sky: '#7FB2E5', ground: '#2F8F4E' },
  { tag: 'Full body' as PhotoTag, w: 4, h: 5, sky: '#C9DDF2', ground: '#3B7A57' },
  { tag: 'Team' as PhotoTag, w: 3, h: 2, sky: '#E8A838', ground: '#2F6B45' },
  { tag: 'Action' as PhotoTag, w: 4, h: 3, sky: '#5C9BD9', ground: '#2E7D4F' },
  { tag: 'Headshot' as PhotoTag, w: 1, h: 1, sky: '#0F4C81', ground: '#061B2E' },
];
const KIT = ['#E05C4B', '#F6FAFE', '#1E88E5', '#22C55E', '#E8A838', '#7C5CFC'];

const figure = (cx: number, base: number, s: number, kit: string) =>
  `<circle cx="${cx}" cy="${base - s * 1.7}" r="${s * 0.32}" fill="#8A5A3C"/>` +
  `<rect x="${cx - s * 0.42}" y="${base - s * 1.35}" width="${s * 0.84}" height="${s * 0.85}" rx="${s * 0.2}" fill="${kit}"/>` +
  `<rect x="${cx - s * 0.36}" y="${base - s * 0.55}" width="${s * 0.3}" height="${s * 0.55}" fill="#0B2239"/>` +
  `<rect x="${cx + s * 0.06}" y="${base - s * 0.55}" width="${s * 0.3}" height="${s * 0.55}" fill="#0B2239"/>`;

export function placeholderPhoto(index: number): { src: string; ratio: number; tag: PhotoTag } {
  const sc = SCENES[index % SCENES.length];
  const kit = KIT[index % KIT.length];
  const W = sc.w * 100, H = sc.h * 100;
  const horizon = H * 0.62;
  let people = '';
  if (sc.tag === 'Headshot') {
    const s = Math.min(W, H) * 0.55;
    people = `<circle cx="${W / 2}" cy="${H * 0.42}" r="${s * 0.36}" fill="#8A5A3C"/>` +
      `<rect x="${W / 2 - s * 0.7}" y="${H * 0.68}" width="${s * 1.4}" height="${H * 0.4}" rx="${s * 0.35}" fill="${kit}"/>`;
  } else if (sc.tag === 'Team') {
    for (let i = 0; i < 6; i++) people += figure(W * (0.14 + i * 0.145), H * 0.9, H * 0.3, kit);
  } else if (sc.tag === 'Full body') {
    people = figure(W / 2, H * 0.92, H * 0.4, kit);
  } else {
    people = figure(W * 0.38, H * 0.9, H * 0.36, kit) + `<circle cx="${W * 0.62}" cy="${H * 0.84}" r="${H * 0.06}" fill="#F6FAFE"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${sc.sky}"/>` +
    `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="${sc.ground}"/>` +
    people + `</svg>`;
  return { src: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg), ratio: sc.w / sc.h, tag: sc.tag };
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
  return Array.from({ length: seedCount(playerId) }, (_, i) => {
    const p = placeholderPhoto(i);
    return {
      id: `${playerId}-ph${i}`, src: p.src, ratio: p.ratio, tag: p.tag,
      uploadedBy: UPLOADERS[i % UPLOADERS.length],
      dateLabel: `${MONTHS[9 - (i % 10)]} ${1 + ((i * 7) % 27)}, 2026`,
      fileName: `photo-${i + 1}.svg`,
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
