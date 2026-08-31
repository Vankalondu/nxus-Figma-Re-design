# NXUS — UI Style Guide

> The design system for the NXUS scouting terminal. This document is the reference for
> anyone writing UI code for NXUS, and for any team building on the NXUS design system.
>
> **All design decisions belong to Vanessa.** This document records them; it does not make
> them. If you believe a rule is wrong, raise it — do not work around it.

---

## How to use this document

Every rule carries a **tier** and a **stable ID**.

| Tier | Means | If you break it |
|---|---|---|
| **Law** | Non-negotiable. Portable to any product using this system. | The PR is rejected. No discussion needed. |
| **Pattern** | The recommended shape. Deviating is allowed. | Say why in the PR. |
| **Reference** | Lookup tables. Facts, not judgements. | You used a value that doesn't exist. |

**IDs are permanent.** `L-C3` is Law, Colour, third. `P-CO2` is Pattern, Components, second.
Cite them in code comments and PR reviews — `// per L-C1` — so the reason for a line survives
the person who wrote it.

Topic codes: `G` general · `C` colour · `TY` type · `S` spacing · `E` elevation · `R` radius
· `CO` components · `M` motion · `I` icons.

Serials are **append-only**. A new colour law becomes the next free number even if it belongs
logically elsewhere — document order is curated, the ID never encodes position. Retired rules
keep their ID as a tombstone (see the end) so old citations stay truthful.

**When this document and the code disagree**, the code describes what *is* and this document
should be corrected to match — but only after Vanessa has agreed the change. Drift is raised
as a question, never synced silently.

---

## 0. What NXUS is

A Bloomberg-style professional football scouting terminal, used by scouts who spend hours
inside it daily. Every design decision serves one of three values:

- **Density** — show as much meaningful data as possible without clutter
- **Clarity** — every element has a clear purpose and a clear hierarchy
- **Authority** — the interface feels premium, professional, trustworthy

**In code terms:** density means resisting whitespace that costs a row. Clarity means a
scout should never have to ask what a colour or badge means. Authority means that when two
implementations are equally functional, you choose the more refined one — aesthetics come
second to function, never last.

---

## 1. Colour

### L-G1 · Law — Bind tokens, never raw values
Every colour, shadow, radius and spacing value in component code resolves to a token. Never
a literal hex, never a raw rgba, never a Tailwind default that bypasses the theme.

**Why:** the token layer is the single point where a theme change, a dark-mode fix, or a
brand adjustment takes effect. A literal value is invisible to that mechanism and silently
stops tracking the system — and it is the one defect that cannot be caught by looking at a
screenshot.

**Do:** `bg-card`, `text-muted-foreground`, `shadow-[var(--shadow-lg)]`
**Don't:** `bg-[#F4FAFF]`, `style={{ color: '#304151' }}`, Tailwind's own `shadow-lg`
**Exceptions:** none in application code. See §11.3 for the quarantined `src/app/imports/`,
and L-G2 for colour that is data rather than styling.

### L-G2 · Law — Colour that is *data* is not governed by the palette
When a colour describes something in the real world rather than styling the interface, it is
data. It does not bind a token, and the palette Laws do not apply to it.

In NXUS this covers **team kit colours** (`DEFAULT_PALETTE` and each team’s `kit.jersey` /
`kit.shorts` in `src/app/components/MatchEntry.tsx`) and any colour a **user picks and
stores**, such as custom tag colours.

**Why:** a team that plays in maroon plays in maroon. Mapping its strip onto the brand scale
would make the interface lie about the world it describes — and the closer the mapped colour
looks, the more convincing the lie. The test is not “is this hex in the scale?” but “would a
rebrand of NXUS change this colour?” If no, it is data.

**Do:** store real kit colours verbatim; render them through a neutral swatch component.
**Don’t:** “correct” a kit or a saved tag colour to the nearest token.
**Still applies:** the *chrome* around the data — the swatch border, the label, the picker
panel — is styling and binds tokens normally.

### L-C1 · Law — Light and dark come from the palette, never from white or black
`#FFFFFF` and `#000000` never appear — in any mode, in any property, at **any opacity**,
including SVG fills and gradient stops. Where you need a light or dark value, use the
palette's own: **`--chalk`**, the light version of the primary blue, and **`--midnight`**, its
dark counterpart. Both are theme-invariant and both have Tailwind bridges, so `text-chalk`,
`border-chalk/15` and `bg-midnight/60` all resolve.

**Why:** every neutral in this system is blue-cast. A pure-white surface reads as a hole
punched in the page and breaks the tinted atmosphere the product is recognised by — and a
translucent white scrim has the same problem in miniature, because it drifts the surface
beneath it toward a grey the palette never contains. A chalk scrim lightens *along the
palette* instead.

**Do:** `text-chalk` on primary · `border-chalk/15` inside an accent card · `bg-midnight/60`
for a modal overlay · `bg-card` for the brightest ordinary surface
**Don't:** `text-white`, `bg-white/10`, `bg-black/60`, `color: '#fff'` in an inline style
**Exception:** an attribute selector that *matches* a third-party library's own hardcoded
output in order to override it. `[&_.recharts-dot[stroke='#fff']]:stroke-transparent` in
`components/ui/chart.tsx` targets recharts' default rather than setting a colour; rewriting it
would break the override.
**Catch:** `grep -rE '\-(white|black)(/[0-9]+)?\b' src/app` and
`grep -riE '#fff\b|#ffffff|#000\b|#000000' src/app`

### L-C2 · Law — No colour from outside the system
No `gray-*`, `slate-*`, `zinc-*` or any other Tailwind palette class. No colour that is not
in the scales or semantic tokens in R-C1 and R-C2.

**Why:** Tailwind's neutrals are grey; ours are blue-cast. Mixed together they read as a
rendering bug rather than a design choice.

**Catch:** `grep -rE '(bg|text|border)-(gray|slate|zinc|stone|neutral)-' src/app`

### L-C3 · Law — Status colour carries meaning, never decoration
`--scout-green` = success, complete, scouted, approved. `--scout-red` = late, flagged,
unscouted, destructive. `--scout-amber` = pending, in progress, warning, monitor.
Identical in both themes.

**Why:** scouts scan hundreds of rows. A green dot must mean the same thing in every view,
or the scanning skill a user builds stops transferring between pages.

**Do:** `bg-scout-amber/15 text-scout-amber` for a pending pill
**Don't:** green as a decorative accent; a red border purely for emphasis
**Catch:** in review, ask "what state does this colour report?" No answer, no colour.

### L-C4 · Law — Consume status colour through the semantic tokens
Use `scout-green` / `scout-amber` / `scout-red` utility classes. Never bracketed hex.

**Why:** `globals.css` exposes `--color-scout-*` bridges precisely so `text-scout-green` and
`bg-scout-amber/15` resolve. Bracketed hex bypasses them and breaks L-G1.

**Do:** see `TASK_STATE_META` — `src/app/components/dashboard/shared.tsx:25`
**Don't:** `bg-[#22C55E]/10 text-[#22C55E]`

### L-C5 · Law — `#061B2E` is the dark-mode background only
Navy `--blue-950` is exclusively the dark-mode page background. It must never appear as a
button, table header, filter bar, modal header, card surface or logo background. Use
`bg-primary` for all of those.

**Why:** it is the canvas. Anything painted with the canvas colour stops reading as a raised
element and the surface hierarchy collapses. Historically the most common palette violation.

### L-C6 · Law — Text on primary is always `text-chalk`
Never `text-foreground` on a `bg-primary` surface, in either theme.

**Why:** `--foreground` flips between themes; `bg-primary` does not flip enough to stay
legible against it. `--chalk` is theme-invariant by design.

### L-C7 · Law — Primary is scarce
`bg-primary` is the 10% colour. Within a single view, at most one card may use primary as
its background. Structural anchors (table group headers, modal headers, active tabs) are not
cards and are exempt.

**Why:** the accent stops being an accent the moment it is common. Scarcity is what makes it
read as "this one matters".

### P-C1 · Pattern — The 60/30/10 split
| Share | Role | Token | Used for |
|---|---|---|---|
| 60% | Background | `bg-background` | Page background, layout canvas |
| 30% | Surface | `bg-card` | Cards, KPIs, panels, modals, dropdowns, sidebar |
| 10% | Primary | `bg-primary` | Buttons, CTAs, active tabs, structural headers, filter bars, modal headers |

A guiding proportion, not a pixel ratio. Aesthetics may bend it — deviation should be
intentional, and L-C7 still binds.

### P-C2 · Pattern — The accent card
In a dashboard's below-KPI section, the right-hand sidebar column carries the one primary
card permitted by L-C7. It uses `text-chalk` for all text, `border-chalk/15` for internal
borders and `bg-chalk/10` for internal fills. All other cards use `bg-card`.

(Earlier revisions said `border-white/10`. Superseded by L-C1 on 31 Aug 2026 — translucent
white drifts toward grey; chalk lightens along the palette.)

### R-C1 · Reference — Palette scales
Every custom tint or gradient derives from these. Defined in `src/styles/globals.css`.

**Primary Blue** — `--blue-50` … `--blue-950`
```
#d2e7fa  #b4d7f6  #8fc4f2  #69b0ee  #449ce9  #1e88e5  #1971bf  #145b99  #0f4473  #0a2d4c  #061b2e
   50      100      200      300      400      500      600      700      800      900      950
```

**Dark / Navy** (text in light mode) — `--navy-50` … `--navy-950`
```
#cdd1d5  #acb3b9  #838d97  #596774  #304151  #061b2e  #051726  #04121f  #030e17  #02090f  #010509
   50      100      200      300      400      500      600      700      800      900      950
```

**Light** (text in dark mode) — `--light-50` … `--light-950`
```
#f6fafe  #f0f7fd  #e9f3fd  #e1effc  #daebfb  #d2e7fa  #afc1d0  #8c9aa7  #69747d  #464d53  #2a2e32
   50      100      200      300      400      500      600      700      800      900      950
```

### R-C2 · Reference — Semantic tokens
Hex values appear here and nowhere else in this document.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `--blue-50` | `--blue-950` | Page background |
| `--foreground` | `--blue-950` | `--blue-50` | Primary text |
| `--card` / `--popover` | `#f4faff` | `--blue-900` | Card and popover surfaces |
| `--card-foreground` | `--blue-950` | `--blue-50` | Text on cards |
| `--primary` | `--blue-500` | `--blue-400` | Accent, CTAs |
| `--primary-foreground` | same as `--card` | `--blue-950` | Text on primary |
| `--secondary` / `--muted` | `#e8f3fc` | `--blue-800` | Secondary and muted surfaces |
| `--muted-foreground` | `--navy-400` | `--light-600` | Secondary text, labels |
| `--accent` | `--blue-50` | `--blue-800` | Tinted backgrounds |
| `--border` | `--blue-100` | `--blue-700` | All borders and dividers |
| `--ring` | `--blue-500` | `--blue-400` | Focus rings |
| `--input-background` | `--light-100` | — | Input field fill |
| `--destructive` | same as `--scout-red` | same | Errors, delete actions |
| `--chalk` | `--blue-50` | same | Always-light text on primary |
| `--midnight` | `--blue-950` | same | Theme-invariant darkest |
| `--scout-green` | `#22C55E` | same | Status: success |
| `--scout-red` | `#E05C4B` | same | Status: attention |
| `--scout-amber` | `#E8A838` | same | Status: pending |
| `--midtone` | `--blue-100` | same | Mid surface |
| `--canvas` | `--blue-50` | same | Canvas |

**Sidebar family:** `--sidebar` (same as `--card` light / `--navy-800` dark), `--sidebar-foreground`,
`--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`,
`--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`, `--sidebar-muted`
(`--navy-300`).

**Charts:** `--chart-1` = `--blue-500`, `--chart-2` = `--blue-950`, `--chart-3` =
`--scout-amber`, `--chart-4` = `--scout-green`, `--chart-5` = `--scout-red`. All in-scale as of
27 Aug 2026. Note these tokens are not currently consumed by app code — the live charts in
`AnalyticsTab.tsx` use their own literals. See open ruling **OR-3**.

**Shared values are intentional, not duplication.** Some tokens deliberately resolve to the
same colour because they express different *roles*: `--destructive` and `--scout-red`;
`--chalk`, `--canvas` and `--blue-50`; `--midnight` and `--blue-950`. Change the role token,
never the shared literal — having both names is the whole point.

**Two scales overlap by design.** `#d2e7fa` is both `--blue-50` and `--light-500`; `#061b2e`
is both `--blue-950` and `--navy-500`. The scales meet where light and dark hand over.

---

## 2. Light and dark

### L-C8 · Law — Both themes are fully supported
No element may be styled for one theme only. Every surface, border and text colour resolves
through a token that has a value in both.

### L-C9 · Law — Some things never flip
- Text on `bg-primary` is always `text-chalk` (see L-C6)
- Status colours are theme-invariant: `--scout-green`, `--scout-red`, `--scout-amber`
- Table group headers stay primary-on-chalk in both themes — they are structural anchors
- Image overlays use fixed dark gradients regardless of theme

### R-C3 · Reference — Surface application
Both themes resolve from R-C2; this table shows where each token lands.

| Element | Token |
|---|---|
| Page background | `--background` |
| Card surface | `--card` |
| Card border | `--border` |
| Table rows | `--card`, alternating `--accent` at 30% |
| Table group headers | `--primary` with `--chalk` text — same in both themes |
| Sidebar surface | `--sidebar` |
| Primary text | `--foreground` |
| Muted text | `--muted-foreground` |

**Default theme:** light. Preference persists to the user's profile and never resets on
login. *(Product decision — see D-1.)*

---

## 3. Typography

### L-TY1 · Law — Two typefaces, no exceptions
**Figtree** (`font-heading`) — headings, titles, uppercase labels.
**Plus Jakarta Sans** (`font-body`) — body text, table data, and all numbers.

`.font-mono` is an alias for Plus Jakarta Sans with `tabular-nums` — it is not a third font
(`globals.css:350`). **JetBrains Mono and Manrope are retired.** No third font, ever.

### L-TY2 · Law — Titles use one weight
Semibold (600). Hierarchy comes from **size**, not weight. `font-bold`, `font-extrabold` and
`font-black` are forbidden on titles — those weights belong to KPI stat numbers only.

**Why:** with a responsive ramp doing the work, weight variation on titles produces two
competing hierarchies that disagree at different breakpoints.

### L-TY3 · Law — Use the ramp classes, not literal sizes
Apply `.text-h1` … `.text-micro`. Do not hard-code `text-[28px]` or equivalent.

**Why:** each ramp class reads a token that steps per breakpoint, so one class is responsive
with no call-site variants. A literal size is frozen at one tier and breaks on the others.

### L-TY4 · Law — `tabular-nums` on every large numeral
Any number displayed at h4 size or above — KPI values, stat counts, table numerics — uses
tabular figures.

**Why:** proportional digits change width as values change, so a counting animation or a
live figure visibly jitters. See `KpiCard.tsx:28`.

### R-TY1 · Reference — The responsive ramp
Defined in `globals.css`. Headings step per tier; body and below are floored — identical at
every breakpoint. These values mirror the Figma `Responsive` collection 1:1.

| Class | Mobile | Tablet ≥768 | Desktop ≥1024 | Line height (desktop) |
|---|---|---|---|---|
| `.text-h1` | 32 | 40 | 48 | 56 |
| `.text-h2` | 28 | 32 | 40 | 48 |
| `.text-h3` | 24 | 28 | 32 | 40 |
| `.text-h4` | 20 | 24 | 28 | 32 |
| `.text-h5` | 20 | 20 | 24 | 28 |
| `.text-h6` | 20 | 20 | 20 | 24 |
| `.text-body-lg` | 20 | 20 | 20 | 24 |
| `.text-body` | 16 | 16 | 16 | 20 |
| `.text-body-sm` | 14 | 14 | 14 | 16 |
| `.text-caption` | 12 | 12 | 12 | 14 |
| `.text-micro` | 10 | 10 | 10 | 12 |

Base 16 × ratio 1.2, snapped (2px below 24, 4px at and above 24).

### R-TY2 · Reference — Role assignments
| Element | Class | Weight | Font |
|---|---|---|---|
| KPI large number | `text-4xl`+ | 800 ExtraBold | Figtree |
| Page hero title | `.text-h1` | 600 Semibold | Figtree |
| Card / major section title | `.text-h2` | 600 Semibold | Figtree |
| Section / widget title | `.text-h3` | 600 Semibold | Figtree |
| Sub-heading | `.text-h4` | 600 Semibold | Figtree |
| Page subtitle | `.text-body-lg` | 500 Medium | Plus Jakarta Sans |
| Body / button text | `.text-body-sm` | 700 Bold (500 prose) | Plus Jakarta Sans |
| Table data | `.text-caption` | 700 Bold | Plus Jakarta Sans |
| Column / micro labels | `.text-micro` | 700 Bold, uppercase, tracked | Figtree |

### R-TY3 · Reference — Text colour
| Context | Token |
|---|---|
| Headings, names, values | `text-foreground` |
| Secondary labels, metadata | `text-muted-foreground` |
| On primary surfaces | `text-chalk` / `text-primary-foreground` |
| Interactive / link | `text-primary` |
| Destructive | `text-destructive` |
| Warning | `text-scout-amber` |
| Success | `text-scout-green` |

---

## 4. Spacing

### L-S1 · Law — 4-point grid for layout
Every gap, padding and margin **between blocks** is a multiple of 4px. Use the `--space-*`
scale or its Tailwind equivalents.

**Scoped exception:** spacing **inside an atom** — within a pill, badge, chip or hairline,
at or below 8px — may use 2px steps. This is why `px-2 py-[2px]` on a priority pill is
correct (`shared.tsx:92`) while `gap-1.5` between two cards is not.

**Why the exception exists:** a 4px floor inside a 10px-text badge produces a pill twice the
height it needs, and density is the first value of this system. The exception is deliberately
narrow — if you are spacing two things that are both visible as separate elements, it does
not apply.

### R-S1 · Reference — Approved scale
| px | Token | Tailwind |
|---|---|---|
| 2 (intra-atom only) | — | `p-0.5` `gap-0.5` |
| 4 | `--space-1` | `p-1` `gap-1` |
| 8 | `--space-2` | `p-2` `gap-2` |
| 12 | `--space-3` | `p-3` `gap-3` |
| 16 | `--space-4` | `p-4` `gap-4` |
| 20 | `--space-5` | `p-5` `gap-5` |
| 24 | `--space-6` | `p-6` `gap-6` |
| 32 | `--space-8` | `p-8` `gap-8` |
| 40 | `--space-10` | `p-10` `gap-10` |
| 48 | `--space-12` | `p-12` `gap-12` |
| 64 | `--space-16` | `p-16` |
| 80 | `--space-20` | `p-20` |
| 96 | `--space-24` | `p-24` |

### R-S2 · Reference — Layout spacing
| Element | Value |
|---|---|
| Page horizontal padding — standard | `px-16` |
| Page horizontal padding — full-width tables | `px-8` |
| KPI card grid gap | `gap-6` |
| Below-KPI section gap | `gap-6` |
| Large card padding | `p-8` |
| Standard card padding | `p-6` |
| Sidebar card padding | `p-5` |
| Table cell padding | `px-2 py-3` |
| Modal padding | `p-8` |
| Tab pill gap | `gap-2` |
| Button padding — pills | `px-6 py-2` |
| Button padding — CTAs | `px-6 py-3` |

### L-S2 · Law — Page rhythm uses the responsive tokens
`--pad-page`, `--gap-section`, `--gap-grid`, `--pad-card` and `--gap-stack` govern spacing
**between page-level blocks**. They step per breakpoint, so one declaration is responsive.
The atomic `--space-*` scale in R-S1 governs spacing **inside components** and does not step.

**Why:** page rhythm that does not breathe at 390px produces either a cramped desktop or a
wasteful mobile. Component internals must stay fixed, or a button changes shape between
tiers.

| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| `--pad-page` | 12 | 16 | 24 |
| `--gap-section` | 16 | 28 | 40 |
| `--gap-grid` | 8 | 12 | 16 |
| `--pad-card` | 12 | 16 | 20 |
| `--gap-stack` | 8 | 12 | 12 |

**Migration in progress.** Page code currently still uses the fixed values in R-S2
(`px-16` / `px-8`). Those are the desktop-equivalent legacy usage; new page-level work uses
the tokens above, and existing pages migrate when next touched.

---

## 5. Elevation

### L-E1 · Law — Shadows come from the shadow tokens
Always `shadow-[var(--shadow-lg)]`. Never Tailwind's own `shadow-lg` — it is a different
value and is not theme-aware.

### R-E1 · Reference — Shadow tokens
Navy-tinted in light mode, black in dark. All defined in `globals.css`.

| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle lift |
| `--shadow-sm` | Buttons, active tab pills, small interactive elements |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | All cards — default elevation |
| `--shadow-xl` | Card hover |
| `--shadow-2xl` | Modals, drawers, dropdown portals |
| `--shadow-sidebar` | Sidebar panel |
| `--shadow-bottom-nav` | Mobile bottom nav |

**No shadow:** table rows, list items, inline elements.

---

## 6. Border radius

### L-R1 · Law — Buttons, badges, pills and avatars are fully round
`rounded-full`. This is the most recognisable signature of the system.

### R-R1 · Reference — Radius by element
| Element | Radius |
|---|---|
| KPI cards, dashboard content cards, sidebar cards | `rounded-[40px]` |
| Report summary cards, table containers, modals | `rounded-[32px]` |
| Form and settings cards, standard tables, small report cards | `rounded-[20px]` |
| Icon squares | `rounded-[16px]` |
| Dropdown menus, input fields | `rounded-xl` |
| Buttons, badges, tab pills, avatars, icon circles | `rounded-full` |
| Position badges | `rounded` |

---

## 7. Icons

### L-I1 · Law — `lucide-react` only
No other icon library, no inline custom SVG where a Lucide icon exists.

### R-I1 · Reference — Icon sizes and containers
| Context | Size |
|---|---|
| Page title circle | 28 |
| Card header | 20 |
| Sidebar nav | 20 |
| KPI card | 18 |
| Table action | 13 |
| Inline small | 12 |
| Dropdown item | 11 |
| Tiny indicator | 9–10 |

| Container | Spec |
|---|---|
| Large (page title) | `w-14 h-14 rounded-full bg-primary`, icon `text-chalk` |
| Medium (card header) | `w-12 h-12 rounded-[16px] bg-primary`, icon `text-chalk` |
| Standard (KPI) | `w-10 h-10 rounded-full bg-accent`, icon `text-muted-foreground` |
| Small (sidebar) | `w-9 h-9 rounded-xl bg-accent`, icon `text-foreground` |

---

## 8. Motion

### L-M1 · Law — Content is never gated on JavaScript
Content is visible by default via CSS. Animation enhances; it never hides. Only elements
below the fold may start hidden. If JS fails, every piece of content must still be readable.

**Why:** a scroll animation that sets `opacity: 0` on load turns a JS error into a blank
page. This is the difference between a degraded experience and a broken one.

### R-M1 · Reference — Timings
| Element | Motion |
|---|---|
| Dropdown menus | `animate-fade-in`, 150ms ease-out |
| KPI numbers on load | Count up from 0, 600ms ease-out |
| Modal open | Fade + scale 95→100%, 200ms ease-out |
| Card hover | `hover:-translate-y-1`, 200ms |
| Hover states | `transition-colors duration-150` |
| Pulse dot | 2s ease-in-out infinite |
| Tab switch, theme switch, navigation | Instant — no animation |

---

## 9. Components

All of §9 is **Pattern** tier: recommended anatomy. Deviating is allowed with a stated
reason, but the Laws above still bind — a variant button is still `rounded-full` (L-R1) and
still binds tokens (L-G1).

### P-CO1 — Buttons
Three variants. Anything else needs a reason in the PR.

```
Primary    bg-primary border-2 border-primary text-primary-foreground
           hover:bg-primary/80 rounded-full px-6 py-3
           font-body font-bold .text-body-sm transition-colors shadow-md

Secondary  bg-card text-muted-foreground border border-border
           hover:border-primary hover:text-foreground rounded-full px-6 py-2
           font-body font-bold .text-body-sm transition-colors

Destructive  border-2 border-destructive text-destructive
             hover:bg-destructive/10 rounded-full px-6 py-3
             font-body font-bold .text-body-sm transition-colors
```

### P-CO2 — Tab pills
```
Active    bg-primary text-primary-foreground border-primary shadow-sm
          rounded-full px-6 py-2 font-body font-bold .text-body-sm
Inactive  bg-card text-muted-foreground border-border
          hover:border-primary hover:text-foreground
          rounded-full px-6 py-2 font-body font-bold .text-body-sm transition-colors
Container flex items-center gap-2
```

### P-CO3 — Cards
```
Standard  bg-card rounded-[40px] border border-border shadow-[var(--shadow-lg)]
          hover:-translate-y-1 hover:shadow-xl transition-all
Accent    bg-primary rounded-[40px]; text text-chalk;
          internal borders border-chalk/15; internal fills bg-chalk/10
```

### P-CO4 — KPI stat card
Canonical implementation: `src/app/components/dashboard/KpiCard.tsx`.

```
Container  bg-card rounded-[32px] border border-border p-6
           shadow-[var(--shadow-lg)] min-h-[190px]
           hover:-translate-y-1 hover:shadow-xl transition-all
           rendered as <button> — keyboard focusable
Icon chip  circular, bg-primary/10 text-primary
Heading    short, uppercase, .text-micro tracked, text-muted-foreground
Value      font-heading font-extrabold text-4xl tabular-nums leading-none
Descriptor beside the value, muted
Action     named link with an ArrowUpRight
```

Format: icon chip + short heading, then a big number with a short descriptor beside it, and
an actionable link. One source of truth so dashboards cannot visually drift.

### P-CO5 — Status pills
Soft translucent tint, never a heavy solid fill.

```
bg-scout-green/15 text-scout-green    success / done
bg-scout-amber/15 text-scout-amber    pending / in progress
bg-scout-red/15   text-scout-red      attention / overdue
bg-primary/15     text-primary        assigned
```

**Why the tint:** solid status fills compete with `bg-primary` structural anchors.
Translucent tints keep dozens of pills per screen scannable without shouting.
Reference: `TASK_STATE_META`, `shared.tsx:25`.

### P-CO6 — Priority pills
High = `bg-scout-red/15 text-scout-red` · Medium = `bg-scout-amber/15 text-scout-amber` ·
Low = muted. Reference: `PRIORITY_PILL`, `shared.tsx:86`.

### P-CO7 — Top navigation
Identical on every page.
```
sticky top-6 z-50 flex items-center justify-between
bg-card/90 backdrop-blur-xl border border-border
p-2 pl-6 rounded-[24px] shadow-[var(--shadow-lg)]
```
Left to right: player search · role pill · notification bell with unread count · This Week ·
Add Report · Add Player · theme toggle · avatar (`w-12 h-12 rounded-full`).

### P-CO8 — Sidebar
Surface `bg-sidebar`. Active item `bg-primary/10 text-primary border-l-[3px] border-primary`.
Inactive `text-muted-foreground hover:text-foreground hover:bg-accent transition-colors`.

### P-CO9 — Data tables
```
Container   w-full max-w-none bg-card rounded-[32px]
            shadow-[var(--shadow-lg)] border border-border overflow-hidden
Group header (row 1)   bg-primary text-primary-foreground
            font-heading font-bold .text-micro uppercase tracking-widest px-4 py-3 text-center
Sub-header (row 2)     bg-card text-muted-foreground
            font-heading font-bold uppercase tracking-widest px-3 py-3
Data rows   border-b border-border/40 hover:bg-accent transition-colors
            py-3 px-2 font-body .text-caption font-bold
Position group rows    bg-primary text-primary-foreground — e.g. STRIKERS (9)
Year separator rows    bg-card text-muted-foreground — year only, no prefix
```
Rows alternate `bg-card` / `bg-accent` at 30%, resetting at every position group header — the
first player row after a header always starts on `bg-card`. Table pages use `w-full
max-w-none` with no max-width, and `px-8` page padding.

An `rtable` class provides responsive cell density so small screens keep a real spreadsheet.

### P-CO10 — Identity cluster
The sticky left column of every player table: initials circle (`w-8 h-8 rounded-full
bg-primary text-chalk`) · player name (bold, hover underline, navigates to profile) · age
(muted) · scout dot (`w-2 h-2 rounded-full`, `--scout-green` scouted / `--scout-red` not) ·
flag circle (`w-5 h-5 rounded-full border border-border`).

### P-CO11 — Videos cluster
Present on all table views across all tiers. Never removed.
`F{n}` match footage and `H{n}` highlight badges: `bg-primary/20 text-foreground font-bold
px-2 py-0.5 rounded .text-caption`.

### P-CO12 — Split button (action column)
One pill divided by a 1px vertical rule. Left zone executes the current action on click;
right zone opens the dropdown.

**Behaviour:** selecting from the dropdown only *changes* the surfaced icon — it does not
execute. The user clicks the primary side to execute. This gives control over which action
sits on the surface.

Portal: `bg-card rounded-[12px] border border-border shadow-[var(--shadow-2xl)]`, rendered
via `createPortal` to `document.body`, positioned with `getBoundingClientRect()`, closing on
select, outside click, or table scroll.

### P-CO13 — Form inputs
```
bg-card border border-border rounded-xl px-4 py-2
.text-body-sm font-bold text-foreground
focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all
placeholder:text-muted-foreground
```
Field label: `font-heading font-bold .text-micro uppercase tracking-widest
text-muted-foreground mb-2`.

### P-CO14 — Modals
```
Overlay  fixed inset-0 bg-midnight/60 backdrop-blur-sm z-[200]
Card     bg-card rounded-[32px] shadow-[var(--shadow-2xl)] border border-border
Header   px-8 py-6 bg-primary rounded-t-[32px] text-chalk
Body     p-8 space-y-4
Actions  w-full bg-primary text-primary-foreground rounded-full py-3
Close    w-8 h-8 rounded-full bg-card/10 text-chalk/60 hover:text-chalk
```

### P-CO15 — Grade, NXT and position pills
```
Grade  A+ bg-primary text-primary-foreground · A bg-primary/12 text-foreground
       B  bg-muted-foreground/10 text-muted-foreground · C bg-accent text-muted-foreground
NXT    T bg-primary text-primary-foreground · M bg-scout-amber/15 text-scout-amber
       D bg-scout-red/10 text-scout-red
Position  inline-block px-1.5 py-[2px] rounded font-body .text-micro font-bold
       ST bg-destructive/10 text-destructive · LW/RW/CDM/FB bg-primary/10 text-foreground
       CAM bg-scout-amber/10 text-scout-amber · CM bg-muted-foreground/10 text-muted-foreground
       CB bg-muted-foreground/20 text-muted-foreground
```

### P-CO16 — Date picker
Replaces browser-default date inputs. Popup `bg-card border border-border/50 rounded-xl
shadow-[var(--shadow-2xl)] w-[260px]`. Month and year as separate dropdown buttons; month
opens a 3-column grid, year a scrollable ±10-year list, chevrons step one month. 7-column
day grid; selected `bg-primary text-primary-foreground rounded-full shadow-sm`; today
`bg-primary/10 text-primary`; footer "Clear" and "Today" as primary text links.

### P-CO17 — Editable columns
Every player data table lets the user choose which columns are visible, via an Edit Columns
modal. Canonical implementation: `src/app/components/EditColumnsModal.tsx`, used by
`SeniorLeadPlayersPage` and `CountryScoutDashboard`.

The modal keeps a **local draft** of the visible set, re-seeded from the current selection
each time it opens. Apply commits the draft; the X and the backdrop dismiss without
committing. Named presets can be saved and recalled.

**Why:** scouts work different competitions with different relevant stats. A fixed column set
either buries what one scout needs or shows everyone everything, and density is the first
value of this system.

---

## 10. Page and dashboard layout

### P-L1 — Page header
```
[Title line: first word + primary icon circle + rest of title]
[Subtitle line]
[Tab row, on pages that have tabs]
```
Every page title carries a relevant icon in a primary-filled circle placed between the first
word and the rest of the title. Every page has a subtitle directly below.

### P-L2 — Dashboard structure
```
1. Welcome header — h1 with icon circle + name
2. Tab pills row — horizontal, gap-2
3. KPI cards row — grid grid-cols-2 lg:grid-cols-4 gap-6
4. Below-KPI section — grid grid-cols-1 lg:grid-cols-3 gap-6
   Left  (col-span-2): main content card, bg-card
   Right (col-span-1): stacked sidebar cards
       top    neutral (bg-card)
       bottom accent  (bg-primary, text-chalk) — the one primary card, per L-C7
```

---

## 11. NXUS application reference

**This section is NXUS-specific.** It records how the rules above are applied in this
product. Another team building on this design system should read it as a worked example and
adapt it — not copy it literally.

### 11.1 Page titles and subtitles
| Page | Icon | Title | Subtitle |
|---|---|---|---|
| Dashboard | Sun | Welcome ☀️ [First Name] | Rotating football subtitle |
| Players — Country/Head | Users | Qaza 👥 Players | All players within your active scouting scope. |
| Players — Senior/Lead | Database | Players 🗄 Database | All players within your active scouting scope. |
| Long List | List | Long 📋 List | Players flagged for closer evaluation. |
| Short List | Star | Short ⭐ List | Prioritised candidates for your current cycle. |
| Target List | Crosshair | Target 🎯 List | Players actively being pursued for acquisition. |
| Scope Settings | Target | Scope 🎯 Settings | Configure the parameters that define your active scouting scope. |
| Matches | Calendar | Competitions 📅 | Track fixtures and review match footage for scouted players. |
| Admin | Settings | Admin ⚙️ Panel | Manage platform data across bodies, competitions, teams, players, and transfers. |
| Player Profile | User | Player 👤 Profile | — |
| Reports | — | — | Scouting reports filed by the team. |
| Top 10 | — | — | Your current top ten performance and prospect selections. |
| Reserve List | — | — | Players held in reserve for future consideration. |
| Combined Top 10 | — | — | Track regional scout submissions and pipeline status. |

The dashboard subtitle rotates per page load via the Anthropic API, falling back to a
randomised array if unavailable.

### 11.2 Roles and pipeline
| Mode | Roles |
|---|---|
| Scout | Country Scout, Head Scout, Senior Scout, Lead Scout |
| Video | Video Uploader, Video Editor, Video Manager |
| Match Entry | Basic, Detailed, Advanced Data Entry |
| God Mode | Operations Manager (admin superuser) |

**Tab sets.** Country and Head Scout: Players in Scope, Top 10, Reserve List, Combined Top 10.
Senior and Lead Scout: Scope Settings, Reports, Database, Long List, Short List, Target List,
Signed List.

**Pipeline.** Tier A: Players in Scope → Top 10 → Reserve List → Combined Top 10.
Tier B: Scope Settings → Database → Long List → Short List → Target List → Signed List.
When a Country Scout raises a player, an in-platform and email notification fires and the
player auto-appears on the Senior Scout Long List with a Direct Ladder icon.

**Reports** has no standalone page — its content lives in the dashboard's Reports tab. The
sidebar has no Reports nav item.

**Per-role dashboard KPIs**
| Slot | Country | Head | Lead | Senior |
|---|---|---|---|---|
| KPI 1 | Missing Videos | Missing Videos | Tracked Players | Open Tasks |
| KPI 2 | Missing Match Data | Missing Match Data | Grade A Rate | New Reports |
| KPI 3 | Ready Reports | Ready Reports | Shortlist vs Pending | Packages to Review |
| KPI 4 | Grade A Players | Grade A Players | Pkgs Unwatched | Pipeline |
| Left | Scout Leaderboard | Scout Leaderboard | Target Tasks | My Tasks |
| Right top | Top Prospect | Top Prospect | Upcoming Matches | Recent Reports |
| Right bottom | Upcoming Matches | Upcoming Matches | Latest Packages | Upcoming Packages |

### 11.3 Enforcement scope
L-G1, L-C1 and L-C2 are enforced across `src/app` **except** `src/app/imports/`, which is raw
Figma export and is quarantined — it is generated output, not authored code, and is not
edited by hand.

Current state: 1003 bracketed-hex uses across 42 of 119 `.tsx` files, concentrated in the
quarantine and in unrouted dead code. Live files carry a small tail, migrated opportunistically
when next touched. See open ruling **OR-4**.

---

## 12. Pull request checklist

- [ ] Every colour, shadow and radius resolves to a token — **L-G1**
- [ ] Real-world colour (kit, user-picked tag) left unmapped — **L-G2**
- [ ] No white or black at any opacity; light and dark from chalk and midnight — **L-C1**, **L-C2**
- [ ] Status colour reports a state; consumed via `scout-*` classes — **L-C3**, **L-C4**
- [ ] `#061B2E` used only as dark-mode background — **L-C5**
- [ ] Text on primary is `text-chalk` — **L-C6**
- [ ] At most one primary-background card in the view — **L-C7**
- [ ] Renders correctly in both themes — **L-C8**, **L-C9**
- [ ] Two fonts only; titles at one weight — **L-TY1**, **L-TY2**
- [ ] Ramp classes, not literal sizes; `tabular-nums` on large numerals — **L-TY3**, **L-TY4**
- [ ] Layout spacing on the 4-pt grid — **L-S1**
- [ ] Page-level spacing uses the responsive rhythm tokens — **L-S2**
- [ ] New data tables offer editable columns — **P-CO17**
- [ ] Shadow tokens, not Tailwind defaults — **L-E1**
- [ ] Buttons and pills fully round — **L-R1**
- [ ] Lucide icons only — **L-I1**
- [ ] Content readable with JS disabled — **L-M1**
- [ ] No horizontal overflow at 1440 / 834 / 390

---

## 13. Open rulings — still need a decision

**OR-3 · Off-palette colour in live UI.** 59 of the original 99 occurrences are resolved
(31 Aug). What remains, and why each was held:

| Colour(s) | Where | Why it needs a decision |
|---|---|---|
| `#8b5cf6` `#7c5cfc` `#06b6d4` `#3a8c6a` | tag colour picker + Wonderkid tag, `SeniorLeadPlayersPage.tsx` | User-facing swatches. A picker offering only blues and greys is a worse picker — this may argue for extending the palette rather than restricting the code. |
| `#22d3ee` | video tracker, `VideoTrackerGrid.tsx` | Cyan marks *uploaded / playable*, a deliberate fourth state beside amber and red. The palette has no cyan. |
| `#ccff00` `#b3e600` `#1a1c1d` | `TableColumns.tsx` | A dark-plus-lime block matching nothing else in NXUS. Likely leftover styling from another source — worth a look before mapping or deleting. |
| `#3fb4c0` | `shared.tsx` | A lone teal. No in-scale equivalent. |
| `#7baac7` | grade-B badge background, pipeline chip, 2 scrollbar hovers | The badge is a *background* carrying `text-chalk` (since D-9). Chalk on `#7baac7` is about 1.6:1 — swapping the background to a dark token would fix contrast but change the grade scale, so this needs a decision rather than a guess. |

Kit colours in `MatchEntry.tsx` are **no longer counted** as violations — L-G2 exempts them.

*(OR-6 — bare `text-white` / `bg-white` classes — resolved 31 Aug 2026 by D-9.)*

**OR-4 · Dead code.** `VideoDepartmentDashboard.tsx`, `GlobalPulseDashboard.tsx` and
`OperationsDashboard.tsx` are unrouted and hold 114+ bracketed-hex uses between them. Delete
them rather than migrate?

---

## Decision log

Not rules — the record of choices already made, kept so they are not relitigated.

**D-1 · Light mode is the default.** Users land on light on first login. Dark is fully built
and available from day one. Theme preference persists to the profile.

**D-2 · Retired fonts.** Manrope was considered and replaced by Figtree. JetBrains Mono was
used for statistical columns and is retired; `.font-mono` now aliases Plus Jakarta Sans with
`tabular-nums`.

**D-3 · Theme toggle location.** Moved from the sidebar to the top navigation, beside the
notification bell.

**D-9 · Light and dark are palette-derived (31 Aug 2026).** The ruling: *"do not use white
(#FFFFFF), but use variations derived from the colours in our palette."* L-C1 now covers
translucent white and black as well as opaque, and names `--chalk` and `--midnight` as the
replacements. 283 sites swept across 44 files — `text-white` → `text-chalk`,
`border-white/15` → `border-chalk/15`, `bg-black/60` → `bg-midnight/60`. This also removed a
real contradiction: the accent-card spec prescribed `border-white/10` while L-C1 forbade pure
white.

**D-5 · Four rules ratified (27 Aug 2026).** L-C4 (status colour via `scout-*` tokens),
P-CO6 (priority semantics), L-TY4 (`tabular-nums` on large numerals) and L-M1 (content never
gated on JavaScript) were drafted from behaviour the code already followed and are now
binding.

**D-6 · Page rhythm (27 Aug 2026).** The responsive token system governs page-level spacing;
the atomic `--space-*` scale governs component internals. Recorded as L-S2.

**D-7 · Editable columns (27 Aug 2026).** Confirmed as a real requirement, not a phantom
checklist item. Recorded as P-CO17.

**D-8 · Type ramp (27 Aug 2026).** The shipped responsive ramp supersedes the old fixed ramp,
and the forbidden-size list that barred 28/40/48 is replaced by L-TY3, since the responsive
ramp uses those sizes at tablet and desktop.

**D-4 · Image KPI card.** One per dashboard, sharing the same runners image, with a dark
gradient overlay and a primary CTA.

---

## Tombstones

Retired rule IDs are never reused. None yet — this numbering begins with this revision.
