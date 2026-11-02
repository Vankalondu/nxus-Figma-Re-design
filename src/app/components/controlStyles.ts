// Shared control looks (P-CO23, D-20). One source so the profile tabs, dashboards and
// Players pages can't drift apart.

/**
 * The tinted "filter" fill from the Lead Scout dashboard Reports tab: half-opacity card
 * surface with a soft brand border. Used by every filter, search field and segmented
 * toggle that sits directly on the page (not inside a card).
 */
export const FILTER_SURFACE = 'bg-surface-card/60 border border-brand-primary/40';

const PILL_BASE = 'flex items-center gap-2 px-4 py-2 rounded-full border font-body font-bold text-[12px] transition-colors whitespace-nowrap shrink-0';
/** A filter pill / dropdown trigger in the filter look. */
export const FILTER_PILL = `${PILL_BASE} bg-surface-card/60 border-brand-primary/40 hover:bg-surface-card text-strong`;
/** The same pill when its filter is on (matches the dashboard InlineSel active state). */
export const FILTER_PILL_ACTIVE = `${PILL_BASE} bg-brand-primary border-transparent text-on-brand`;

/** A search field in the filter look (pair with a left-aligned 14px Search icon). */
export const FILTER_INPUT =
  `w-full ${FILTER_SURFACE} rounded-full pl-9 pr-3 py-2 font-body font-medium text-[13px] text-body placeholder:text-placeholder outline-none focus:border-brand-primary hover:bg-surface-card transition-colors`;

/** The top-nav secondary button ("This Week", "Add Report"): outlined brand, transparent fill. */
export const SECONDARY_BUTTON =
  'flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-brand-primary text-body hover:bg-brand-primary/10 rounded-full font-body type-body-sm font-bold transition-colors shrink-0';

/** Quiet text button for actions that live inside a card header (no pill). */
export const CARD_TEXT_BUTTON =
  'inline-flex items-center gap-1 font-body font-bold text-[12px] text-body hover:text-strong transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded';
