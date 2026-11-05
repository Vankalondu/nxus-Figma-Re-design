import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PipelineTier, TierMove, useTierHistory, useTierMap } from '../../state/playerStore';
import { dayLabel } from '../../state/taskStore';

const LIST: Record<PipelineTier, string> = { 'long-list': 'Long', 'short-list': 'Short', 'target-list': 'Target' };

/** One move: "Short · Kwame Asante · 20 Sep". The list the player is on now is filled. */
export const ListPill = ({ move, current }: { move: TierMove; current: boolean }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-body type-caption whitespace-nowrap border ${current ? 'bg-brand-primary border-brand-primary text-on-brand font-bold' : 'bg-surface-card border-brand-primary/40 text-body font-medium'}`}>
    <span className="font-bold">{LIST[move.tier]}</span>{' · '}{move.by}{' · '}{dayLabel(move.at)}
  </span>
);

/**
 * Where the player sits on the Lead/Senior lists and how they got there (P-CO27, D-26): one
 * pill per move, oldest at the top, including moves back down. Kept from the moves made on the
 * Players tables.
 */
export const ListHistory = ({ playerId, className = '', layout = 'column' }: {
  playerId: string; className?: string;
  /** column: stacked, oldest on top (desktop card, phone details); row: wrapping left to right (tablet header, D-27) */
  layout?: 'column' | 'row';
}) => {
  const moves = useTierHistory(playerId);
  // Taken off the lists since: no pill is 'current'.
  const onList = useTierMap().has(playerId);
  if (moves.length === 0) {
    return <p className={`font-body font-medium type-caption text-muted ${className}`}>Not on a list yet</p>;
  }
  return (
    <ol aria-label="List history" className={`flex ${layout === 'row' ? 'flex-wrap items-center gap-y-1' : 'flex-col items-center'} ${className}`}>
      {moves.map((m, i) => (
        <li key={i} className={`flex items-center ${layout === 'row' ? '' : 'flex-col'}`} aria-current={onList && i === moves.length - 1 ? 'step' : undefined}>
          {i > 0 && (layout === 'row'
            ? <ChevronRight size={12} aria-hidden className="text-muted mx-0.5" />
            : <ChevronDown size={12} aria-hidden className="text-muted my-0.5" />)}
          <ListPill move={m} current={onList && i === moves.length - 1} />
        </li>
      ))}
    </ol>
  );
};

/** Only the list the player is on now — the phone header (D-27). Nothing when not on a list. */
export const CurrentListPill = ({ playerId, className = '' }: { playerId: string; className?: string }) => {
  const moves = useTierHistory(playerId);
  const onList = useTierMap().has(playerId);
  if (!onList || moves.length === 0) return <span className={`font-body font-medium type-caption text-muted ${className}`}>Not on a list yet</span>;
  return <span className={className}><ListPill move={moves[moves.length - 1]} current /></span>;
};

/** How many moves the player has — the "List history (n)" count. */
export const useListMoveCount = (playerId: string) => useTierHistory(playerId).length;
