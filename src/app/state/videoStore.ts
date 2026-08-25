import { useSyncExternalStore } from 'react';
import { ALL_GENERATED_PLAYERS } from '../components/SeniorLeadPlayersPage';

// Video department state: the approval queue (videos uploaded by editors/uploaders
// awaiting the Video Manager's review), assignments, and the approved set.
// Coverage status per (player, video-type) is DERIVED from these — never hand-set,
// so the dashboard can't lie.

export type VideoType = 'package' | 'full-match';
// packages: unassigned→assigned→in-progress(uploaded, pending approval)→has-video(approved)
// full matches: unassigned→assigned→has-video(Available) | not-available (footage can't be sourced)
export type CoverageStatus = 'unassigned' | 'assigned' | 'in-progress' | 'has-video' | 'not-available';

export interface ApprovalItem {
  id: string;
  type: VideoType;
  videoName: string;     // "by match" e.g. "vs Gor Mahia" or a package title
  uploader: string;
  uploaderRole: 'Editor' | 'Uploader';
  dateLabel: string;
  daysAgo: number;
  playerId: string;      // '' = not linked to a player yet
  playerName: string;
}
export interface ReviewedItem extends ApprovalItem {
  outcome: 'approved' | 'redo';
  reason?: string;
}

interface VideoState {
  approvals: ApprovalItem[];             // pending PACKAGE queue (packages are the only type needing approval)
  reviewed: ReviewedItem[];              // history (newest first)
  assignedBy: Record<string, string>;    // `${playerId}:${type}` -> editor
  approved: Record<string, true>;        // `${playerId}:package` -> has video (approved)
  fmStatus: Record<string, 'available' | 'not-available'>; // playerId -> full-match availability
  highlightsCount: number;               // external highlights total (VM KPI; no approval)
  highlights: HighlightItem[];           // uploaded highlights (for the uploader's own view)
}
export interface HighlightItem { id: string; title: string; uploader: string; dateLabel: string; }

const key = (playerId: string, type: VideoType) => `${playerId}:${type}`;
const nameOf = (id: string) => ALL_GENERATED_PLAYERS.find(p => p.id === id)?.name ?? 'Unknown Player';

function seed(): VideoState {
  // Only PACKAGES enter the approval queue (highlights + full matches bypass approval).
  const approvals: ApprovalItem[] = [
    { id: 'ap1', type: 'package', videoName: 'Attacking reel',      uploader: 'Kwesi Owusu',  uploaderRole: 'Editor',   dateLabel: '3 days ago', daysAgo: 3, playerId: 'sl-2', playerName: nameOf('sl-2') },
    { id: 'ap3', type: 'package', videoName: 'Defensive actions',   uploader: 'Brian Otieno', uploaderRole: 'Editor',   dateLabel: '2 days ago', daysAgo: 2, playerId: 'sl-5', playerName: nameOf('sl-5') },
    { id: 'ap5', type: 'package', videoName: 'Set-piece threat',    uploader: 'Kwesi Owusu',  uploaderRole: 'Editor',   dateLabel: '1 day ago',  daysAgo: 1, playerId: 'll-3', playerName: nameOf('ll-3') },
    { id: 'ap6', type: 'package', videoName: 'Trial footage batch', uploader: 'Ama Serwaa',   uploaderRole: 'Uploader', dateLabel: 'today',      daysAgo: 0, playerId: '',     playerName: '' },
  ];
  // Approved PACKAGE video (has-video)
  const approved: Record<string, true> = {};
  (['tl-0', 'tl-2', 'sl-0', 'sl-3', 'sl-4', 'll-0'] as string[]).forEach(id => { approved[key(id, 'package')] = true; });
  // Full-match availability (uploaded = available; footage unsourceable = not-available)
  const fmStatus: Record<string, 'available' | 'not-available'> = {
    'tl-0': 'available', 'tl-3': 'available', 'sl-1': 'available', 'll-1': 'available',
    'tl-5': 'not-available', 'sl-7': 'not-available',
  };
  // Assigned but not yet uploaded
  const assignedBy: Record<string, string> = {
    [key('sl-8', 'package')]: 'Kwesi Owusu',
    [key('tl-6', 'full-match')]: 'Ama Serwaa',
    [key('sl-6', 'full-match')]: 'Brian Otieno',
  };
  const highlights: HighlightItem[] = [
    { id: 'h1', title: 'Kofi Mensah — goals compilation', uploader: 'Kwesi Owusu', dateLabel: '2 days ago' },
    { id: 'h2', title: 'David Conteh — dribbling reel',    uploader: 'Kwesi Owusu', dateLabel: '4 days ago' },
    { id: 'h3', title: 'Amadou Sarr — YouTube clip',       uploader: 'Ama Serwaa',  dateLabel: '1 week ago' },
  ];
  return { approvals, reviewed: [], assignedBy, approved, fmStatus, highlightsCount: 34, highlights };
}

let state: VideoState = seed();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const getSnapshot = () => state;
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };

export function useVideoState(): VideoState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function coverageStatus(s: VideoState, playerId: string, type: VideoType): CoverageStatus {
  if (type === 'full-match') {
    const fm = s.fmStatus[playerId];
    if (fm === 'available') return 'has-video';
    if (fm === 'not-available') return 'not-available';
    if (s.assignedBy[key(playerId, 'full-match')]) return 'assigned';
    return 'unassigned';
  }
  // packages
  if (s.approved[key(playerId, 'package')]) return 'has-video';
  if (s.approvals.some(a => a.playerId === playerId && a.type === 'package')) return 'in-progress';
  if (s.assignedBy[key(playerId, 'package')]) return 'assigned';
  return 'unassigned';
}
export function setFullMatchAvailability(playerId: string, status: 'available' | 'not-available') {
  state = { ...state, fmStatus: { ...state.fmStatus, [playerId]: status } };
  emit();
}
/** External highlight uploaded — no approval; tracked as a count + the uploader's list. */
export function addHighlightUpload(title = 'Highlight', uploader = 'Me') {
  const item: HighlightItem = { id: `h-${Date.now()}`, title, uploader, dateLabel: 'today' };
  state = { ...state, highlightsCount: state.highlightsCount + 1, highlights: [item, ...state.highlights] };
  emit();
}
export function highlightsBy(s: VideoState, uploader: string) {
  return s.highlights.filter(h => h.uploader === uploader);
}

// ── Mutations ──
export function assignVideo(playerId: string, type: VideoType, editor: string) {
  state = { ...state, assignedBy: { ...state.assignedBy, [key(playerId, type)]: editor } };
  emit();
}
export function approveVideo(approvalId: string) {
  const item = state.approvals.find(a => a.id === approvalId);
  if (!item) return;
  const approved = item.playerId ? { ...state.approved, [key(item.playerId, item.type)]: true as const } : state.approved;
  state = {
    ...state,
    approvals: state.approvals.filter(a => a.id !== approvalId),
    reviewed: [{ ...item, outcome: 'approved' }, ...state.reviewed],
    approved,
  };
  emit();
}
/** Returns the reviewed item so the caller can reopen it as an editor task. */
export function redoVideo(approvalId: string, reason: string): ReviewedItem | null {
  const item = state.approvals.find(a => a.id === approvalId);
  if (!item) return null;
  const reviewed: ReviewedItem = { ...item, outcome: 'redo', reason };
  state = {
    ...state,
    approvals: state.approvals.filter(a => a.id !== approvalId),
    reviewed: [reviewed, ...state.reviewed],
  };
  emit();
  return reviewed;
}

/** New video submitted by an uploader — enters the pending approval queue. */
export function submitUpload(input: { type: VideoType; videoName: string; uploader: string; playerId?: string; playerName?: string }) {
  const item: ApprovalItem = {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: input.type,
    videoName: input.videoName,
    uploader: input.uploader,
    uploaderRole: 'Uploader',
    dateLabel: 'today',
    daysAgo: 0,
    playerId: input.playerId ?? '',
    playerName: input.playerName ?? '',
  };
  state = { ...state, approvals: [item, ...state.approvals] };
  emit();
}

/** Pending + approved items for one uploader's own queue, filtered by video type.
 *  Approved source is `reviewed` (not the `approved` map) because the map is only
 *  populated when an item has a playerId, so player-less uploads would vanish. */
export function uploaderItems(s: VideoState, uploader: string, type: VideoType) {
  return {
    pending: s.approvals.filter(a => a.uploader === uploader && a.type === type),
    approved: s.reviewed.filter(r => r.uploader === uploader && r.type === type && r.outcome === 'approved'),
  };
}
