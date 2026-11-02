import React from 'react';
import { Link } from 'react-router';

// Every player name, anywhere, opens that player's profile inside the current account
// (P-CO24, D-20). One component so the look and the routing can't drift.

const ACCOUNTS = ['country-scout', 'head-scout', 'lead-scout', 'senior-scout', 'video-manager', 'package-uploader', 'full-match-uploader'];

/** The current account's route prefix ("/lead-scout"), or "" for the un-prefixed Country Scout routes. */
export function accountBase(pathname = typeof window !== 'undefined' ? window.location.pathname : ''): string {
  const first = pathname.split('/')[1] ?? '';
  return ACCOUNTS.includes(first) ? '/' + first : '';
}

/** A stable id for players we only know by name (mock rows without an id). */
export const playerIdFromName = (name: string) => 'name-' + name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/** Profile path for a player in the current account. */
export const playerPath = (id: string) => `${accountBase()}/player/${encodeURIComponent(id)}`;

export interface PlayerLinkProps {
  name: string;
  /** Player id; when missing, one is derived from the name. */
  id?: string;
  /** Extra fields passed to the profile (team, age, position…) so it opens with the right details. */
  player?: Record<string, unknown>;
  /** Breadcrumb trail for the profile; defaults to "back to where I was". */
  trail?: { label: string; path: string }[];
  /** 'link' = link colour (default, P-CO24). 'inherit' = keep the surrounding text style (headings inside cards); both underline on hover. */
  tone?: 'link' | 'inherit';
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

/**
 * A player's name as a link to their profile. Stops the click from reaching a row or card
 * that has its own click handler, so "open the row" and "open the player" both still work.
 */
export const PlayerLink = ({ name, id, player, trail, tone = 'link', className = '', children, title }: PlayerLinkProps) => {
  const pid = id ?? playerIdFromName(name);
  const here = typeof window !== 'undefined' ? window.location.pathname : '/';
  return (
    <Link
      to={playerPath(pid)}
      state={{ player: { id: pid, name, initials: initialsOf(name), ...player }, trail: trail ?? [{ label: here.endsWith('/players') ? 'Players' : 'Dashboard', path: here }] }}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      draggable={false}
      title={title}
      className={`${tone === 'link' ? 'text-link' : ''} hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm ${className}`}
    >
      {children ?? name}
    </Link>
  );
};
