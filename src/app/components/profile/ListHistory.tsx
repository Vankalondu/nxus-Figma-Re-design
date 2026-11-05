import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PipelineTier, TierMove, useTierHistory } from '../../state/playerStore';
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
export const ListHistory = ({ playerId, className = '' }: { playerId: string; className?: string }) => {
  const moves = useTierHistory(playerId);
  if (moves.length === 0) {
    return <p className={`font-body font-medium type-caption text-muted ${className}`}>Not on a list yet</p>;
  }
  return (
    <ol aria-label="List history" className={`flex flex-col items-center ${className}`}>
      {moves.map((m, i) => (
        <li key={i} className="flex flex-col items-center" aria-current={i === moves.length - 1 ? 'step' : undefined}>
          {i > 0 && <ChevronDown size={12} aria-hidden className="text-muted my-0.5" />}
          <ListPill move={m} current={i === moves.length - 1} />
        </li>
      ))}
    </ol>
  );
};
