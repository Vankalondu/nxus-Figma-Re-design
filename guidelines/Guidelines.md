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

**Do:** `bg-surface-card`, `text-body`, `shadow-[var(--shadow-lg)]`
**Don't:** `bg-[#F4FAFF]`, `style={{ color: '#304151' }}`, Tailwind's own `shadow-lg`
**Exceptions:** none in application code. See §11.3 for the quarantined `src/app/imports/`,
and L-G2 for colour that is data rather than styling.

### L-G2 · Law — Colour that is *data* is not governed by the palette
When a colour describes something in the real world rather than styling the interface, it is
data. It does not bind a token, and the palette Laws do not apply to it.

In NXUS this covers **team kit colours** (`DEFAULT_PALETTE` and each team’s `kit.jersey` /
`kit.shorts` in `src/app/components/MatchEntry.tsx`), **medal ranks** on the video leaderboard
(`#ffd700` gold, `#c0c0c0` silver, `#cd7f32` bronze and the `#8b6914` dark-gold accent beside
them, in `VideoDepartmentDashboard.tsx` — ruled 7 Sep 2026), and any colour a **user picks and
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
dark counterpart. Both are theme-invariant and both have Tailwind bridges, so `text-on-brand`,
`border-text-on-brand/15` and `bg-ink-midnight/60` all resolve.

**Why:** every neutral in this system is blue-cast. A pure-white surface reads as a hole
punched in the page and breaks the tinted atmosphere the product is recognised by — and a
translucent white scrim has the same problem in miniature, because it drifts the surface
beneath it toward a grey the palette never contains. A chalk scrim lightens *along the
palette* instead.

**Do:** `text-on-brand` on primary · `border-text-on-brand/15` inside a primary surface (table group header, modal header) · `bg-ink-midnight/60`
for a modal overlay · `bg-surface-card` for the brightest ordinary surface
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
`--status-success` = success, complete, scouted, approved. `--status-error` = late, flagged,
unscouted, destructive. `--status-warning` = pending, in progress, warning, monitor.
`--status-uploaded` = footage uploaded and playable — the fourth video state, because the
three above were already spoken for. `--status-ladder` = a player reached via the scouting
process rather than direct entry. **All five are identical in both themes** — that is the
point of the rule, not an implementation detail.

**Why:** scouts scan hundreds of rows. A green dot must mean the same thing in every view,
or the scanning skill a user builds stops transferring between pages.

**Do:** `bg-status-warning/15 text-status-warning` for a pending pill
**Don't:** green as a decorative accent; a red border purely for emphasis
**Catch:** in review, ask "what state does this colour report?" No answer, no colour.

### L-C4 · Law — Consume status colour through the semantic tokens
Use `scout-green` / `scout-amber` / `scout-red` utility classes. Never bracketed hex.

**Why:** `globals.css` exposes `--color-scout-*` bridges precisely so `text-status-success` and
`bg-status-warning/15` resolve. Bracketed hex bypasses them and breaks L-G1.

**Do:** see `TASK_STATE_META` — `src/app/components/dashboard/shared.tsx:25`
**Don't:** `bg-[#22C55E]/10 text-[#22C55E]`

### L-C5 · Law — `#061B2E` is the dark-mode background only
Navy `--blue-950` is exclusively the dark-mode page background. It must never appear as a
button, table header, filter bar, modal header, card surface or logo background. Use
`bg-brand-primary` for all of those.

**Why:** it is the canvas. Anything painted with the canvas colour stops reading as a raised
element and the surface hierarchy collapses. Historically the most common palette violation.

### L-C6 · Law — Text on primary is always `text-on-brand`
Never `text-heading` or `text-strong` on a `bg-brand-primary` surface, in either theme.

**Why:** `--foreground` flips between themes; `bg-brand-primary` does not flip enough to stay
legible against it. `--chalk` is theme-invariant by design.

### L-C7 · Law — Primary is scarce
`bg-brand-primary` is the 10% colour. Within a single view, at most one card may use primary as
its background. Structural anchors (table group headers, modal headers, active tabs) are not
cards and are exempt.

**Why:** the accent stops being an accent the moment it is common. Scarcity is what makes it
read as "this one matters".

### P-C1 · Pattern — The 60/30/10 split
| Share | Role | Token | Used for |
|---|---|---|---|
| 60% | Background | `bg-surface-page` | Page background, layout canvas |
| 30% | Surface | `bg-surface-card` | Cards, KPIs, panels, modals, dropdowns, sidebar |
| 10% | Primary | `bg-brand-primary` | Buttons, CTAs, active tabs, structural headers (table group rows, position bands), modal headers |

A guiding proportion, not a pixel ratio. Aesthetics may bend it — deviation should be
intentional, and L-C7 still binds.

### P-C2 · Pattern — The accent card *(retired 28 Oct 2026 — see Tombstones and D-16)*
Dashboards no longer carry a solid-primary accent card. Every dashboard card is
`bg-surface-card` (P-CO3). L-C7 still caps any view at one primary card.

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
`--sidebar-accent-text-heading`, `--sidebar-border`, `--sidebar-ring`, `--sidebar-muted`
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

### L-C10 · Law — Four text roles, and `heading` means a title
`--text-heading` (titles) · `--text-strong` (emphatic, not a title) · `--text-body` (default
copy) · `--text-muted` (de-emphasised, still AA). Pick by what the text *is*, never by how
dark you want it.

`heading` and `strong` deliberately hold the same value. That is not redundancy — it is the
point. A button label, a stat value and a filter chip all need a title's weight of contrast
without being titles, and naming them `heading` is how a role model rots: the name stops
describing anything, so nobody can safely change it. Splitting them costs nothing today and
means a future change to title colour will not silently repaint every chip in the product.

**Test:** if this text moved to another screen, would it still be the thing that names the
screen or section? If no, it is `strong`, however bold it looks.

### L-G3 · Law — A colour on a wrapper is a default, not a role
If an element styles no text of its own, its colour utility is setting the inherited default
for everything beneath it. Do not re-role it as though it were copy.

**Why:** the app shell is `flex min-h-screen bg-surface-page font-body text-strong`. Its
`font-body` means "descendants default to the body face", not "this div is body copy".
Retinting it once moved **6,422 descendants** and pushed **241 of them below 4.5:1**, because
chips and badges that never set their own colour inherited a value meant for prose. One line
changed; the product changed.

**Test:** does this element have text directly inside it, or only children? Only children
means leave the colour alone.

---

## 2. Light and dark

### L-C8 · Law — Both themes are fully supported
No element may be styled for one theme only. Every surface, border and text colour resolves
through a token that has a value in both.

### L-C9 · Law — Some things never flip
- Text on `bg-brand-primary` is always `text-on-brand` (see L-C6)
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
Apply `.type-h1` … `.type-micro`. Do not hard-code `text-[28px]` or equivalent.

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
| `.type-h1` | 32 | 40 | 48 | 56 |
| `.type-h2` | 28 | 32 | 40 | 48 |
| `.type-h3` | 24 | 28 | 32 | 40 |
| `.type-h4` | 20 | 24 | 28 | 32 |
| `.type-h5` | 20 | 20 | 24 | 28 |
| `.type-h6` | 20 | 20 | 20 | 24 |
| `.type-body-lg` | 20 | 20 | 20 | 24 |
| `.type-body` | 16 | 16 | 16 | 20 |
| `.type-body-sm` | 14 | 14 | 14 | 16 |
| `.type-caption` | 12 | 12 | 12 | 14 |
| `.type-micro` | 10 | 10 | 10 | 12 |

Base 16 × ratio 1.2, snapped (2px below 24, 4px at and above 24).

### R-TY2 · Reference — Role assignments
| Element | Class | Weight | Font |
|---|---|---|---|
| KPI large number | `text-4xl`+ | 800 ExtraBold | Figtree |
| Page hero title | `.type-h1` | 600 Semibold | Figtree |
| Card / major section title | `.type-h2` | 600 Semibold | Figtree |
| Section / widget title | `.type-h3` | 600 Semibold | Figtree |
| Sub-heading | `.type-h4` | 600 Semibold | Figtree |
| Page subtitle | `.type-body-lg` | 500 Medium | Plus Jakarta Sans |
| Body / button text | `.type-body-sm` | 700 Bold (500 prose) | Plus Jakarta Sans |
| Table data | `.type-caption` | 700 Bold | Plus Jakarta Sans |
| Column / micro labels | `.type-micro` | 700 Bold, uppercase, tracked | Figtree |

### L-TY5 · Law — Size is `type-*`, colour is `text-*`
The responsive ramp is `.type-h1` … `.type-micro`. Text colour is `text-heading`,
`text-strong`, `text-body`, `text-muted`. The two vocabularies never share a
prefix.

**Why:** they used to. `.text-body` was the ramp's font-size class, and `text-body` was also
the natural name for the body colour. Tailwind resolves `text-*` against `--text-color-*`
then `--color-*`, so defining the colour would have emitted a *second* `.text-body` rule.
The two set different properties, so neither overrides the other — **both apply**. Every one
of the 145 elements already carrying the size class would have silently gained a colour, and
nothing in the build would have reported it. Renaming the ramp removed the shared prefix, so
no future role named `caption`, `micro` or `h3` can collide either.

### R-TY3 · Reference — Text colour
| Context | Token |
|---|---|
| Page and section titles | `text-heading` |
| Names, values, chips, button labels — emphatic but not a title | `text-strong` |
| Body copy, secondary labels, metadata | `text-body` |
| Genuinely de-emphasised, still AA | `text-muted` |
| On primary surfaces (anything painted `bg-brand-primary`) | `text-on-brand` — never `text-inverse`, which turns navy in dark mode |
| Interactive / link, blue text and icons | `text-link` (Blue/600 light · Blue/400 dark) |
| Destructive | `text-status-error` |
| Warning | `text-status-warning` |
| Success | `text-status-success` |

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
| Page horizontal padding — every page, tables included | `px-[var(--pad-page)]` (L-S2) |
| Page bottom padding | `pb-20 md:pb-12` |
| KPI card grid gap | `gap-6` |
| Below-KPI section gap | `gap-6` |
| Large card padding | `p-8` |
| Standard card padding | `p-6` |
| Dashboard card header strip | `px-5 py-4 border-b border-default` |
| Dashboard card list rows | `px-5 py-3` |
| Table cell padding | the `rtable` density tokens (`--tbl-px` 4/5/6, `--tbl-py` 4) — P-CO9 |
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

**Page padding migrated (28 Oct 2026).** All seven dashboards and every Players page use
`px-[var(--pad-page)]`. Dashboard grids use a fixed `gap-6`, not `--gap-grid` (D-16); other
pages migrate when next touched.

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
| `--shadow-surface-sidebar` | Sidebar panel |
| `--shadow-bottom-nav` | Mobile bottom nav |

**No shadow:** table rows, list items, inline elements.

---

## 6. Border radius

### L-R1 · Law — Buttons, badges, pills and avatars are fully round
`rounded-full`. This is the most recognisable signature of the system.

### R-R1 · Reference — Radius by element
| Element | Radius |
|---|---|
| KPI cards (P-CO4), report summary cards, modals | `rounded-[32px]` |
| Players-page card (tab strip + filters + table, P-CO9), top navigation | `rounded-[24px]` |
| Dashboard content cards, sidebar cards, form and settings cards, small report cards | `rounded-[20px]` |
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
| Large (page title) | `w-14 h-14 rounded-full bg-brand-primary`, icon `text-on-brand` |
| Medium (card header) | `w-12 h-12 rounded-[16px] bg-brand-primary`, icon `text-on-brand` |
| Standard (KPI) | `w-10 h-10 rounded-full bg-surface-accent`, icon `text-body` |
| Small (sidebar) | `w-9 h-9 rounded-xl bg-surface-accent`, icon `text-strong` |

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
Primary    bg-brand-primary border-2 border-brand-primary text-inverse
           hover:bg-brand-primary/80 rounded-full px-6 py-3
           font-body font-bold .type-body-sm transition-colors shadow-md

Secondary  bg-surface-card text-body border border-default
           hover:border-brand-primary hover:text-strong rounded-full px-6 py-2
           font-body font-bold .type-body-sm transition-colors

Destructive  border-2 border-status-error text-status-error
             hover:bg-status-error/10 rounded-full px-6 py-3
             font-body font-bold .type-body-sm transition-colors
```

### P-CO2 — Tab pills
```
Active    bg-brand-primary text-inverse border-brand-primary shadow-sm
          rounded-full px-6 py-2 font-body font-bold .type-body-sm
Inactive  bg-surface-card text-body border-default
          hover:border-brand-primary hover:text-strong
          rounded-full px-6 py-2 font-body font-bold .type-body-sm transition-colors
Container flex items-center gap-2
```
Dashboards render these through `ResponsiveTabs` (`mt-4 mb-6`; collapses to a dropdown pill
below `md`). On Players pages the tabs sit in the card's header strip as the compact variant —
`px-4 py-2`, `gap-1`, with a count badge — via `TabPill` in `PlayersTableKit.tsx`.

### P-CO3 — Cards
```
Standard  bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)]
          overflow-hidden
Header    px-5 py-4 border-b border-default flex items-center gap-3
          icon tile w-10 h-10 rounded-[12px] bg-brand-primary/10 (icon 16, text-strong)
          title font-heading font-bold text-[16px] text-heading
          subtitle font-body text-[12px] font-medium text-body
Rows      divide-y divide-border-default; each row px-5 py-3 hover:bg-surface-accent
```
There is no accent (primary-background) card variant any more — see the P-C2 tombstone.
Only KPI cards (P-CO4) lift on hover.

### P-CO4 — KPI stat card
Canonical implementation: `src/app/components/dashboard/KpiCard.tsx`.

```
Container  bg-surface-card rounded-[32px] border border-default p-6
           shadow-[var(--shadow-lg)] min-h-[190px]
           hover:-translate-y-1 hover:shadow-xl transition-all
           rendered as <button> — keyboard focusable
Icon chip  circular, bg-brand-primary/10 text-link
Heading    short, uppercase, .type-micro tracked, text-body
Value      font-heading font-extrabold text-4xl tabular-nums leading-none
Descriptor own line under the value, font-heading font-bold text-sm text-strong, plain
           text only (a string prop: no status colours, no red)
Action     own line under the descriptor, left-aligned, text-xs text-link + ArrowUpRight
```

Format: icon chip + short heading, then the big number, the descriptor under it, and the
action link under that on the left. The three rows always stack, whatever the text length
or column count, so every card has the same shape (D-17). One source of truth so dashboards
cannot visually drift.

### P-CO5 — Status pills
Soft translucent tint, never a heavy solid fill. **The tint and the text are not the
same value** — the tint comes from the status colour, the text from a darker step.

```
bg-status-success/15 text-status-success-fg    success / done
bg-status-warning/15 text-status-warning-fg    pending / in progress
bg-status-error/15   text-status-error-fg      attention / overdue
bg-brand-primary/15     text-link                       assigned
```

**Why the tint:** solid status fills compete with `bg-brand-primary` structural anchors.
Translucent tints keep dozens of pills per screen scannable without shouting.

**Why the text is a different value — this is the part that matters.** Using the status
colour for *both* the tint and the text is unreadable. Measured on a light card, the
original pattern gave **1.92:1** for success, **1.80:1** for warning and **2.90:1** for
error — all far below AA, roughly the contrast of light grey on white. The hues are simply
too light to serve as text on their own tint.

`--status-*-fg` resolves per theme: the **/800** step in light and the **/300** step in
dark. Measured after the fix: 7.53 / 6.79 / 8.02 in light, 6.48 / 7.24 / 6.33 in dark.

The darker steps come from the Figma colour families, which carry all eleven steps for
Success, Warning and Error. The code previously held only `Base` for each, which is why the
readable value was out of reach — the fix already existed in the design system.

**Scope:** this applies to text sitting *on a tint*. A standalone `text-status-success` — a
status dot, an icon, a single glyph on a card — is a fill, not text on a tint, and keeps
the base value.

Reference: `TASK_STATE_META`, `shared.tsx:25`.

### P-CO6 — Priority pills
High = `bg-status-error/15 text-status-error-fg` · Medium = `bg-status-warning/15
text-status-warning-fg` · Low = muted. Same tint-and-darker-text rule as **P-CO5** — these
are status pills wearing a different label, and they had the same contrast fault.
Reference: `PRIORITY_PILL`, `shared.tsx:86`.

### P-CO7 — Top navigation
Identical on every page.
```
sticky top-6 z-50 flex items-center justify-between
bg-surface-card/90 backdrop-blur-xl border border-default
p-2 pl-6 rounded-[24px] shadow-[var(--shadow-lg)]
```
Left to right: player search · role pill · notification bell with unread count · This Week ·
Add Report · Add Player · theme toggle · avatar (`w-12 h-12 rounded-full`).

### P-CO8 — Sidebar
Surface `bg-surface-sidebar`. Active item `bg-brand-primary/10 text-link border-l-[3px] border-brand-primary`.
Inactive `text-body hover:text-strong hover:bg-surface-accent transition-colors`.

### P-CO9 — Data tables
Every Players page (Lead, Senior, Video Manager, Head, Country) uses one shared kit —
`src/app/components/PlayersTableKit.tsx` — so the tables cannot drift.
```
Page title  pt-2 pb-3, 32px h1 + icon circle, 15px subtitle mt-2 (P-L1); folds away once
            the table scrolls past 40px ("focus mode")
Card        ONE bg-surface-card border border-default rounded-[24px] holding the tab
            strip, the filter toolbar and the table; height calc(100vh - 204px)
            (114px in focus mode); the table scrolls inside it
Header strip px-4 py-3 border-b — tab pills (P-CO2 compact) · Table/Card toggle ·
            Filters (desktop: shows/hides the toolbar) · Columns
Filter bar  light, label-above: 9px uppercase label over a px-3 py-2 text-[12px] pill;
            Active/Archive segmented toggle first, "Look for a player" search far right.
            Mobile: a Filters button opens the same filters in a bottom-sheet
Table       class rtable — cell padding from --tbl-px (4/5/6) and --tbl-py (4)
Group header (row 1)   bg-brand-primary text-on-brand font-heading font-bold text-[10px]
            uppercase tracking-widest text-center; groups divided by border-text-on-brand/15
Sub-header (row 2)     bg-surface-card text-muted font-heading font-bold text-[12px]
            uppercase tracking-widest
Position band          bg-brand-primary text-on-brand 11px tracked + count pill, sticky under
            the thead (top: --tbl-head-h)
Year band              bg-surface-accent text-link 11px tracked, sticky under the position
            band (top: --tbl-head-h + --tbl-group-h)
Data rows   hover:bg-surface-accent; full-width 1px divider on the cells; body text
            text-[12px], stats font-mono text-[14px]
Measured    thead 50px · bands 33px · player rows 45px, at 1440, 834 and 390
```
The Actions and Player columns are frozen left. Stat columns alternate a
`bg-surface-accent/30` shade. A back-to-top button appears after 400px of scroll. Keep
`--tbl-head-h` / `--tbl-group-h` equal to the rendered heights or the bands overlap.

### P-CO10 — Identity cluster
The sticky left column of every player table (`PlayerAvatar` + `FlagBadge` in the kit):
avatar (`w-9 h-9 rounded-xl bg-surface-accent border border-default`, initials until a photo
exists) · player name (`text-link` bold 14px, hover underline, navigates to profile) · under it
the age (muted 12px) · scout dot where the data has one (`w-2 h-2 rounded-full`,
`--scout-green` scouted / `--scout-red` not) · flag (`w-4 h-4 rounded-full border border-default`).

### P-CO11 — Videos cluster
Present on all table views across all tiers. Never removed.
`F{n}` match footage and `H{n}` highlight badges: `bg-brand-primary/20 text-strong font-bold
px-2 py-0.5 rounded .type-caption`.

### P-CO12 — Split button (action column)
**In tables, row actions are now an inline pill** (`ActionButtons`): every action is its own
24px icon button inside one `rounded-full bg-surface-accent border` pill, separated by 1px
rules — nothing hidden in a menu. The split button below remains for player cards.

One pill divided by a 1px vertical rule. Left zone executes the current action on click;
right zone opens the dropdown.

**Behaviour:** selecting from the dropdown only *changes* the surfaced icon — it does not
execute. The user clicks the primary side to execute. This gives control over which action
sits on the surface.

Portal: `bg-surface-card rounded-[12px] border border-default shadow-[var(--shadow-2xl)]`, rendered
via `createPortal` to `document.body`, positioned with `getBoundingClientRect()`, closing on
select, outside click, or table scroll.

### P-CO13 — Form inputs
```
bg-surface-card border border-default rounded-xl px-4 py-2
.type-body-sm font-bold text-strong
focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-focus transition-all
placeholder:text-body
```
Field label: `font-heading font-bold .type-micro uppercase tracking-widest
text-body mb-2`.

### P-CO14 — Modals
```
Overlay  fixed inset-0 bg-ink-midnight/60 backdrop-blur-sm z-[200]
Card     bg-surface-card rounded-[32px] shadow-[var(--shadow-2xl)] border border-default
Header   px-8 py-6 bg-brand-primary rounded-t-[32px] text-on-brand
Body     p-8 space-y-4
Actions  w-full bg-brand-primary text-inverse rounded-full py-3
Close    w-8 h-8 rounded-full bg-surface-card/10 text-on-brand/60 hover:text-on-brand
```

### P-CO15 — Grade, NXT and position pills
```
Grade  A+ bg-brand-primary text-inverse · A bg-brand-primary/12 text-strong
       B  bg-text-body/10 text-body · C bg-surface-accent text-body
NXT    T bg-brand-primary text-inverse · M bg-status-warning/15 text-status-warning
       D bg-status-error/10 text-status-error
Position  inline-block px-1.5 py-[2px] rounded font-body .type-micro font-bold
       ST bg-status-error/10 text-status-error · LW/RW/CDM/FB bg-brand-primary/10 text-strong
       CAM bg-status-warning/10 text-status-warning · CM bg-text-body/10 text-body
       CB bg-text-body/20 text-body
```

### P-CO16 — Date picker
Replaces browser-default date inputs. Popup `bg-surface-card border border-default/50 rounded-xl
shadow-[var(--shadow-2xl)] w-[260px]`. Month and year as separate dropdown buttons; month
opens a 3-column grid, year a scrollable ±10-year list, chevrons step one month. 7-column
day grid; selected `bg-brand-primary text-inverse rounded-full shadow-sm`; today
`bg-brand-primary/10 text-link`; footer "Clear" and "Today" as primary text links.

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

### P-CO18 — Data tags (profile, rank, outcome)
Tags whose colour is **data** (L-G2) — profile types, Short List rank, Signed List outcome, and
any colour a user picks in Settings — follow the same tint-and-different-text rule as **P-CO5**,
but the text step is computed rather than looked up, because the colour can be anything.

- **Fill** = the tag colour at ~13% (`#hex22`). **Border** = the tag colour at ~33% (`#hex55`).
- **Text** = the tag colour moved toward `--midnight` in light mode and toward `--chalk` in
  dark mode, only as far as needed to read at **4.8:1** on its own tint (4.5:1 plus headroom for
  hover and accent rows).
- Implementation: `tagTint(hex)` + the `data-tint` class, in `src/app/lib/dataColors.ts`.
  Never set the tag text to the raw colour.
- Tokens: `--data-<colour>` and `--data-<colour>-text` (Tailwind `bg-data-blue`,
  `text-data-blue-text`, …) mirror Figma **Mapped › Color/Data/*** and are in the drift check.
  The `-text` values are what `tagTint()` computes; `tests/data-colors.spec.ts` fails if the two
  ever disagree.
- Figma: **Data Tag** component set on 🧩 Atoms (`1555:358`), one variant per data colour, with
  a Light/Dark preview frame beside it.

**Why:** measured on a light card, raw-colour text on its own tint scored 1.8:1 (amber) to
3.4:1 (violet) — every tag failed. In dark mode blue, violet and red failed too. No single
shade passes in both modes, so the text has to move per theme.

**Data colours come from the palette's base steps** (`DATA` in the same file): blue
`#1E88E5` (Blue/Base), violet `#7C5CFC`, cyan `#22D3EE`, green `#22C55E`, amber `#E8A838`,
red `#E05C4B`, neutral `#596774`. These are also the Settings swatches. Chart series use the
same values. Data blue is deliberately **not** the brand primary, so restyling buttons never
repaints a chart. Chart marks are graphics, not text: they need 3:1 against the card
(`#1E88E5` is 3.5 light · 4.7 dark).

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
Reference: the Lead Scout and Video Manager dashboards (D-16). All seven dashboards — Lead,
Senior, Head, Country, Video Manager, Package Uploader, Full Match Uploader — follow it.
```
0. Page   px-[var(--pad-page)] pb-20 md:pb-12
1. Welcome header — pt-6 mb-3
     h1  font-heading font-semibold type-h3 tracking-tight leading-none, gap-4,
         "Welcome" + w-10 h-10 primary icon circle (icon 26) + first name
     p   font-body font-medium text-[15px] text-body mt-2 (hidden on short screens)
2. Tab row — ResponsiveTabs, mt-4 mb-6
3. Tab content — flex flex-col gap-6 pb-8
4. KPI cards row — grid grid-cols-2 lg:grid-cols-4 gap-6 (lg:grid-cols-5 when a role has
   five KPIs); every KPI is the shared KpiCard (P-CO4)
5. Below-KPI section — grid grid-cols-1 lg:grid-cols-3 gap-6
   Left  (col-span-2): main content card (P-CO3)
   Right (col-span-1): stacked neutral cards (P-CO3), gap-6
```
No solid-primary accent card and no photo KPI card (D-16). Measured identical across all
seven dashboards at 1440 / 834 / 390: title, subtitle, tab row and KPI row land on the same
x, y and size. Every below-KPI grid, Lead included, is the 2 + 1 (67/33) split (D-17).

---

## 11. NXUS application reference

**This section is NXUS-specific.** It records how the rules above are applied in this
product. Another team building on this design system should read it as a worked example and
adapt it — not copy it literally.

### 11.1 Page titles and subtitles
| Page | Icon | Title | Subtitle |
|---|---|---|---|
| Dashboard | Sun | Welcome ☀️ [First Name] | Rotating football subtitle |
| Players — Country/Head | Users | NXUS 👥 Players | All players within your active scouting scope. |
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
- [ ] Text on primary is `text-on-brand` — **L-C6**
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

**OR-3 · RESOLVED 7 Sep 2026 — the ratchet is at 12, and all 12 are deliberate.** Every
question in the table below has an answer now; it is kept for the reasoning, not as an ask.

| Ruling | Outcome |
|---|---|
| `#22d3ee` cyan — the fourth video state | Became a real token. `--cyan-500` in Qaza, aliased in Allias, `Color/Status/uploaded` in Mapped, `--status-uploaded` in code. Named in L-C3. |
| `#7c5cfc` violet — the Ladder marker | Same treatment: `--violet-500` → `--status-ladder`, `Color/Status/ladder`. Named in L-C3. |
| `#3a8c6a` teal — the scouted dot | Bound to `status-success`. It reports a state, so L-C3 always governed it. |
| `#ccff00` `#b3e600` `#1a1c1d` — the lime slab | Restyled to the system primary button. It was **live**, not dead: `CountryScoutDashboard` imports `TableColumns`, so a lime button with near-black text was shipping. |
| `#7baac7` grade-B badge | Resolved earlier by the grade-badge per-grade text fix (D-9 era). |
| Vivid oranges + brown | Bound to the Warning family at a 59–74/255 shift, accepted because nothing about them was load-bearing beyond "this is a warning". |
| Medal colours | L-G2 data. Exempt, code untouched, and now on L-G2's named list plus a narrow allow-list in `lint-tokens.mjs`. |

**The 12 that remain are all in `src/app/components/ui/sidebar.tsx`** — the tombstoned duplicate
sidebar. Left deliberately: the rulebook says nobody should import it, and rebinding it would
make a dead file look maintained. If it is ever deleted or revived, that number goes to zero or
gets fixed with it.

The original table, kept for the reasoning behind each hold:

| Colour(s) | Where | Why it needs a decision |
|---|---|---|
| `#8b5cf6` `#7c5cfc` `#06b6d4` `#3a8c6a` | tag colour picker + Wonderkid tag, `SeniorLeadPlayersPage.tsx` | User-facing swatches. A picker offering only blues and greys is a worse picker — this may argue for extending the palette rather than restricting the code. |
| `#22d3ee` | video tracker, `VideoTrackerGrid.tsx` | Cyan marks *uploaded / playable*, a deliberate fourth state beside amber and red. The palette has no cyan. |
| `#ccff00` `#b3e600` `#1a1c1d` | `TableColumns.tsx` | A dark-plus-lime block matching nothing else in NXUS. Likely leftover styling from another source — worth a look before mapping or deleting. |
| `#3fb4c0` | `shared.tsx` | A lone teal. No in-scale equivalent. |
| `#7baac7` | grade-B badge background, pipeline chip, 2 scrollbar hovers | The badge is a *background* carrying `text-on-brand` (since D-9). Chalk on `#7baac7` is about 1.6:1 — swapping the background to a dark token would fix contrast but change the grade scale, so this needs a decision rather than a guess. |

Kit colours in `MatchEntry.tsx` are **no longer counted** as violations — L-G2 exempts them.

**How it came down: 662 → 12**, in eight separately-verified passes.

| Pass | Uses | What |
|---|---|---|
| Invariant roles | 161 | Literals whose value a theme-invariant role already held exactly |
| Near-miss snap | 222 | Off-by-a-digit transcriptions, bound to the nearest scale step |
| Theme-frozen | 72 | Bound to roles so they finally respond to dark mode — an **L-C8** fix |
| Material (1) | 67 | `#43A047` `#E53935` `#F9A825` `#1565C0` → status / brand |
| Material (2) | 25 | The rest of the Material palette, mapped inside each family |
| Greys | 75 | **24 of these were below AA** — `#94a3b8` 2.44:1 → 5.54:1. An accessibility fix, not a rename |
| Accents | 15 | Lime button restyled, scouted dot → success, oranges → Warning, cyan + violet became tokens |
| Medals | 4 | Exempted as L-G2 data, code untouched |

The groups below record the reasoning that got each colour to its answer.

| Group | Colours | Uses | Observation |
|---|---|---|---|
| Greys | `#e0e7ef` `#94a3b8` `#64748b` `#666` `#999` `#9ca3af` `#333640` `#0f1419` `#1a1c1d` `#c0c0c0` | 73 | Breaks **L-C2** — these are Tailwind slate and plain neutrals. Every one has a near equivalent in the Light or Dark scale, so this is the largest and most mechanical group left, but each swap tints a grey blue and that is a visible decision. |
| Material greens | `#e8f5e9` `#2e7d32` | 11 | Tints and a dark green. `--status-success-tint` and `Success/700` are the natural homes. |
| Material ambers | `#fff9c4` `#ffb74d` `#f57c00` `#e65100` `#ff6d00` `#fff8e1` `#ffecb3` `#8b6914` | 21 | Same shape as the `#f9a825` mapping already applied — the Warning family covers all of them. |
| Material blues | `#1976d2` `#0d47a1` | 4 | Blue 700 and Blue 900. `Primary/Base` and `Primary/900`. |
| Teals | `#d0e8e3` `#3a8c6a` | 18 | No palette equivalent, and `#3a8c6a` was already held in the table above. Extend the palette, or map to Success? |
| Medal colours | `#ffd700` `#c0c0c0` `#cd7f32` | 3 | Gold, silver, bronze on the video leaderboard. **L-G2 already covers these** — apply its test: would a rebrand of NXUS change this colour? No. A bronze medal is bronze. Mapping them onto the brand scale would make the interface lie exactly as a recoloured team kit would. Treating as data, not styling, and dropping them from the count on the same grounds as `MatchEntry`'s kit colours — flagged here for confirmation, not adjudication. |
| Already held above | `#22d3ee` `#ccff00` `#b3e600` `#7c5cfc` | 10 | Cyan fourth state, the lime block, the violet tag. Unchanged from the table above. |

**OR-7 · RESOLVED 2026-09-04.** Figma and the code are level. As first written this ruling was
wrong twice, recorded here rather than quietly edited:

- It claimed the Responsive collection still named the ramp `text-*`. It never did — Figma
  names it `Text/Headings/h1/text size` and `Text/Body/md/text size`. `.type-h1` maps onto
  that cleanly and there was no mismatch to fix.
- It counted one missing Mapped variable. There were **eight**: `Surface/midtone`,
  `Surface/switch`, `Surface/sidebar-accent`, `Text/strong`, `Text/on-status`,
  `Text/sidebar-muted`, `Border/input`, and `Ink/midnight`.

Seven were added to Mapped. `Ink/midnight` went to **Allias** instead — it is theme-invariant,
so it is a named alias for one raw value rather than a role with per-mode values, and Mapped
stays at six groups. `Border/input` is the one Mapped variable holding a raw value rather than
an Allias reference: its light mode is transparent, an alias cannot carry an alpha override,
and `#00000000` would break L-C1 — so it is stored as `#061b2e00`, navy at zero alpha.

Reading Figma also corrected the **code**. Where a value exists in two families — `#d2e7fa` is
both `Primary/100` and `Light Mode/Base`, `#061b2e` is both `Primary/1000` and `Dark Mode/Base`
— the code had picked by alphabetical preference and Figma had picked by meaning. Figma governs
naming, so 12 role pointers were realigned: page background comes from the Primary ramp, body
text from the Dark Mode ramp, even where the hex is identical.

`scripts/figma-css-diff.mjs` now reports **66 match · 0 drift · 0 figma-only · 0 ramp drift**.

**OR-8 · PARTLY RESOLVED 7 Sep 2026 — eight roles are still defined and unrendered.** The
secondary tier is now real: 256 uppercase micro-labels and 102 captions moved to
`text-muted`, and 46 placeholders to `text-placeholder`. Current adoption:

| Role | Uses | | Role | Uses |
|---|---|---|---|---|
| `text-body` | 1027 | | `border-default` | 806 |
| `text-strong` | 444 | | `border-focus` | 100 |
| `text-muted` | 358 | | `border-input` | 8 |
| `text-on-brand` | 349 | | `text-placeholder` | 46 |
| `text-inverse` | 156 | | `text-heading` | 117 |

Still defined, bridged, documented and used **zero** times: `text-disabled`, `text-link`,
`text-sidebar-muted`, `text-on-status`, `border-subtle`, `border-strong`, `surface-inverse`,
`surface-overlay`. Several have obvious homes — `text-link` on the anchors that currently use
`text-brand-primary`, `surface-overlay` on the modal scrims that hand-roll
`bg-ink-midnight/60` — but each is a judgement about what the product means, not a sweep.

`Status/info` and `Status/info-tint` remain the mirror image: present in Figma, absent from
code, and nothing in the product renders an info state. `Button/*` (11 Figma vars) is
deliberately excluded — that is a component layer the code expresses as utilities, not tokens.

**OR-9 · RESOLVED 2026-09-04.** The status families were never missing — Qaza already held
`Colors/Red`, `Colors/Amber` and `Colors/Green` at the full 11 steps, and Allias already grouped
them as Error / Warning / Success. Only the code was short, carrying each family's Base value
alone. All three scales are now in `globals.css`, and every colour role in the file resolves
through the alias layer: **zero raw hex outside the scale definitions themselves.**

*(OR-6 — bare `text-white` / `bg-white` classes — resolved 31 Aug 2026 by D-9.)*

**OR-4 · RESOLVED 7 Sep 2026 — they are not dead, so they get the design system.**
`VideoDepartmentDashboard.tsx`, `GlobalPulseDashboard.tsx` and `OperationsDashboard.tsx` are
unrouted but not dead: they are unused *for now*. Ruling: migrate, do not delete. All four
colour passes included them on the same terms as live code.

Worth knowing the scale of this, because it changes what "unrouted" means here. The import
closure from `App.tsx` reaches only **44 of 113** app files; 69 cannot render at all, and
they held the large majority of the colour debt. So the computed-style snapshot — which walks
six routes in their default state — is structurally unable to verify most of this work. Two
consequences, both accepted deliberately:

- A `0 changed` result on a pass that touched mainly unreachable files is **not** evidence of
  correctness. Those passes are justified by the substitution being provably value-identical,
  or by the value change being the intended one, not by the net.
- Reachable is not the same as rendered. `CardView.tsx` is reachable but only appears when the
  user switches to card view, so the snapshot never sees it either.

Rebinding these files to the token layer is what makes them safe to route later: whenever one
is switched on, it will already be themed rather than carrying frozen light-mode literals.

**What would close the gap.** Storybook renders a component in isolation regardless of
routing, so the stories are the natural verification surface for unreachable code — a story
for `GlobalPulseDashboard` would put it in front of the snapshot without routing it.

*Corrected 7 Sep 2026:* this section previously said the route was blocked, because
`npm run build-storybook` had failed earlier on Windows Application Control refusing
`@oxc-resolver/binding-win32-x64-msvc`. **It builds fine** — 196 entries, 65 docs pages,
exit 0 — and the claim was carried forward without being re-tested. Smart App Control is
still enforced on the machine; whatever combination caused that failure no longer does.

So the gap is open by choice, not by obstruction: the unreachable files have no stories, and
writing them is the work that would let the snapshot see those components. Not started.

**OR-10 · CLOSED 28 Oct 2026 by D-17 — leftovers from the D-16 alignment.**
- Lead's below-KPI grid is `lg:grid-cols-5` (3 + 2); the other six dashboards use
  `lg:grid-cols-3` (2 + 1), so Lead's main card is 780px wide at 1440 against 869px. Both are
  "the reference" — pick one split.
- Combined Top 10 (Country/Head Players) still uses `rounded-[40px]` cards, now nested inside
  the 24px Players card.
- `card.stories.tsx` still renders the 40px card and the accent card (P-C2). Changing them
  moves Storybook visual baselines, so it waits for approval.
- The Lead/Senior mobile filter sheet still shows the dark blue `FilterBar`; desktop and the
  Country/Head sheet use the light toolbar.

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
replacements. 283 sites swept across 44 files — `text-white` → `text-on-brand`,
`border-white/15` → `border-text-on-brand/15`, `bg-black/60` → `bg-ink-midnight/60`. This also removed a
real contradiction: the accent-surface-card spec prescribed `border-white/10` while L-C1 forbade pure
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
gradient overlay and a primary CTA. *Superseded 28 Oct 2026 by D-16 — dashboards carry no
photo KPI card.*

**D-10 · The type ramp is `type-*`, not `text-*`.** Renamed so the size vocabulary and the
colour vocabulary stop sharing a prefix. Chosen over leaving the colour roles stuttering as
`text-body`: 43 ramp usages against ~1,989 colour usages, and the collision would
otherwise have recurred for any future role named `caption`, `micro` or `h3`. See L-TY5.

**D-11 · `--text-strong` exists and shares `--text-heading`'s value.** Added rather than
forcing 258 button labels, chips and stat values into either `heading` (wrong name) or `body`
(visibly lighter). Same value means the correction shipped with zero rendered change. See
L-C10.

**D-13 · Where a hex belongs to two families, Figma's choice wins.** `#d2e7fa` is both
`Primary/100` and `Light Mode/Base`; `#061b2e` is both `Primary/1000` and `Dark Mode/Base`. The
rendered colour is the same either way, so this is purely a naming question — and naming is
Figma's to decide. Page surfaces take the Primary ramp, body text the Dark Mode ramp.

**D-15 · Primary moved to Blue/600 `#1971BF` (16 Oct 2026).** Light-blue text on the old
primary `#1E88E5` scored 2.9:1 (`#D2E7FA`) and 3.5:1 (`#F6FAFE`) — every filled button
failed. No single blue can carry light text in light mode and dark text in dark mode, so one
primary with one text colour was chosen: `Brand/primary` → `Primary/600` in both modes,
`Text/on-brand` → `Light Mode/100` `#F6FAFE` in both (4.8:1). Blue text on the navy dark
background uses `Text/link` = Blue/400 `#449CE9` (6.0:1), because `#1971BF` reads at only
3.5:1 there. `#1E88E5` is now the data blue (P-CO18).

**D-14 · `Ink/midnight` lives in Allias, not Mapped.** It is theme-invariant, which makes it a
named alias for a raw value rather than a role with per-mode values. Mapped stays at six groups
(Surface, Text, Border, Brand, Status, Button).

**D-16 · Lead Scout + Video accounts are the reference style (28 Oct 2026).** Vanessa chose
the Lead Scout and Video Manager / Uploader accounts as the look every account follows. All
seven dashboards now share one shell (P-L2): `--pad-page` padding, `type-h3` welcome title,
`ResponsiveTabs` `mt-4 mb-6`, `gap-6` grids, the shared KpiCard, and 20px neutral content
cards (P-CO3, R-R1). This retires the solid-blue accent card (P-C2 — tombstoned), drops the
photo KPI card (supersedes D-4) and moves dashboard cards from 40px to 20px corners. The
Country/Head Players page moved onto the same Players-page kit as Lead/Senior (P-CO9).
Remaining choices are listed in OR-10.

**D-17 · Follow-up rulings on the D-16 alignment (28 Oct 2026).** Vanessa: (1) every KPI card
looks like the Country Scout cards: number, descriptor under it, link under that on the left,
no coloured descriptor text (P-CO4); (2) every dashboard uses the 67/33 split, so Lead moved
from `lg:grid-cols-5` (3 + 2) to `lg:grid-cols-3` (2 + 1); (3) the Country/Head Players page
offers cards and table and opens on cards; (4) Combined Top 10 cards take the 20px dashboard
corner (rows 12px); (5) the light, label-above filter toolbar is the one in use — the dark
blue `FilterBar` is retired everywhere, including the Lead/Senior mobile filter sheet.

**D-12 · The heading/body split was derived, not hand-assigned.** 918 usages classified by
their own font and size classes: 117 titles, 444 strong, 357 retinted to body. The retint was
verified as 1,506 leaf elements with exactly two colour transitions and **zero** elements
falling below 4.5:1.

---

## Tombstones

Retired rule IDs are never reused.

**P-C2 · The accent card — retired 28 Oct 2026 (D-16).** Said: the right-hand column of a
dashboard's below-KPI section carries the one solid `bg-brand-primary` card permitted by
L-C7, with `text-on-brand` text, `border-text-on-brand/15` borders and `bg-text-on-brand/10`
fills. Retired because the reference dashboards (Lead Scout, Video Manager) have no accent
card; every dashboard card is now neutral (P-CO3).
