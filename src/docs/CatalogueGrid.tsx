/**
 * The grid for the "All Components" index. Tiles are links, so the page works
 * the way MUI's all-components page does: scan visually, click through to the
 * component's own documentation.
 *
 * Everything here binds design-system tokens rather than Storybook's own
 * styling — the index is itself a piece of NXUS UI, and it would be a poor
 * advertisement for the rulebook if it broke it.
 */
import * as React from 'react'
import { type Entry, storyHref } from './catalogue'

const Tile = ({ e }: { e: Entry }) => (
  <a
    href={storyHref(e.title)}
    // textDecoration and color inline for the same reason the grid is inline:
    // Storybook's docs stylesheet styles every <a> and beats the generated
    // `no-underline` utility, which underlined every name and blurb in the grid.
    style={{ textDecoration: 'none', color: 'inherit' }}
    className="group flex flex-col gap-3 p-4 rounded-[20px] bg-surface-card border border-default
               shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5
               transition-all"
  >
    {/* Fixed-height preview well so the grid stays on a rhythm whether or not
        an entry has a live preview. */}
    <div
      className="h-[76px] rounded-[14px] bg-surface-accent/40 border border-default/60
                 flex items-center justify-center px-3 overflow-hidden"
    >
      {e.preview ?? (
        <span className="font-heading font-bold type-micro uppercase tracking-widest text-muted">
          Open story
        </span>
      )}
    </div>

    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-heading font-bold type-body-sm text-strong group-hover:text-brand-primary transition-colors">
          {e.name}
        </span>
        {e.rule && (
          <span className="font-mono type-micro text-muted shrink-0">{e.rule}</span>
        )}
      </div>
      <span className="font-body type-caption text-muted leading-snug">{e.blurb}</span>
      {/* Only 7 of the 46 primitives are imported by app code. Marking them
          keeps the catalogue honest: the rest are documented so nobody rebuilds
          one that exists, not to imply they are load-bearing. */}
      {e.used && (
        <span className="mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded-full
                         bg-status-success/15 text-status-success font-bold type-micro uppercase tracking-wider">
          In use
        </span>
      )}
      {e.deprecated && (
        <span className="mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded-full
                         bg-status-error/15 text-status-error font-bold type-micro uppercase tracking-wider">
          Do not use
        </span>
      )}
    </div>
  </a>
)

export const CatalogueGrid = ({ entries }: { entries: Entry[] }) => (
  // Inline grid, deliberately. An arbitrary Tailwind class
  // ([grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]) collapsed to a
  // single column here — Storybook's docs stylesheet wins over the generated
  // utility, which stretched the page to 12,000px. The tiles keep their Tailwind
  // classes; only the container that docs CSS fights over is inlined.
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
      gap: '16px',
      margin: '24px 0',
    }}
  >
    {entries.map((e) => (
      <Tile key={e.title} e={e} />
    ))}
  </div>
)

export const CatalogueCount = ({ entries }: { entries: Entry[] }) => (
  <span className="font-mono type-caption text-muted">{entries.length} components</span>
)
