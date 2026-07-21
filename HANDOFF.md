# HANDOFF — NXUS Responsive System v1

_Last updated: 2026-07-14. Resume by reading this file._

## What this is
Building a ratio-driven responsive system (Figma + Tailwind) for the NXUS/Qaza scouting terminal, per the plan at `~/.claude/plans/reflective-splashing-balloon.md`. Tiers: **Mobile <768 (frame 390) · Tablet 768–1023 (frame 834) · Desktop ≥1024 (frame 1440)**, Tailwind `md`/`lg`, mobile-first.

## The system (DONE, in `src/styles/globals.css`)
- **Type ramp** = base 16 × ratio **1.2**, snapped (2px <24, 4px ≥24) → `10·12·14·16·20·24·28·32·40·48`. Stepped per tier via `--fs-*`/`--lh-*` in `:root` + `@media(min-width:768px/1024px)`. Headings shift one step down per tier; body & smaller (16/14/12/10) are **floored** (same all tiers). Semantic utility classes: `.text-h1..h6`, `.text-body-lg`, `.text-body`, `.text-body-sm`, `.text-caption`, `.text-micro` (size+line-height only; pair with existing `.font-heading`/`.font-body` + weight). Approved deltas from old ramp: 36→40, 44→48.
- **Jumper spacing** tokens (per-tier, PROVISIONAL — Vanessa tuning): `--pad-page` 12/16/24, `--gap-section` 16/28/40, `--gap-grid` 8/12/16, `--pad-card` 12/16/20, `--gap-stack` 8/12/12. Atomic `--space-1..24` stay fixed.
- **`.rtable`** class = table-local per-tier cell density (`--tbl-px/py` 4/6→6/9→8/12). Deliberate exception to the type floor.

## Shared components (DONE)
- **`TopNav.tsx`**: mobile = hamburger (dispatches `nxus:open-menu`) · search icon that expands inline · role pill collapses to dot · secondary actions (This Week/Add Report) `hidden md:flex`. No overflow at any width.
- **`Sidebar.tsx`**: bottom nav REMOVED; drawer opens via `nxus:open-menu` event; new `actions` prop renders a **Quick Actions** section in the drawer (This Week/Add Report on mobile).
- **`ResponsiveTabs.tsx`** (NEW): desktop inline pill strip; mobile active label + 'More ▾' dropdown. Used by Country + Lead dashboards.
- **`DashboardWidgets.tsx`**: KPI cards `grid-cols-2` (2×2) on mobile, flexible height.
- **`SeniorLeadPlayersPage.tsx`**: shared `.rtable` on main table; action col 44→32px; toolbar = condensed tabs (More ▾) + view toggle + **Filters button** + dots. Filters: desktop = inline toggle (`showFilters`, default visible); mobile = **bottom-sheet** (`mobileFiltersOpen`). Filter bar stacks flex-col on mobile.

## Screens migrated
- **CountryScoutDashboard** (also serves Head): dashboard-home headings→tokens, jumper spacing, `min-w-0` shell fix, ResponsiveTabs, Sidebar actions (This Week).
- **LeadScoutDashboard**: OverviewTab KPI→2×2 + de-squeeze (number 44→28 mobile, pad-card, smaller dots), AnalyticsTab responsive (header stacks, pad-card), ResponsiveTabs, Sidebar actions (This Week+Add Report), role-pill→dot fix.
- **MatchesView**: Competitions + match-detail h1→text-h3 + `pt-6 mb-3`/`mt-2` rhythm; search+season filter now share the heading row on desktop (`lg:flex-row justify-between`).
- **AdminView**: heading→text-h3 + rhythm.
- **ReportsHub** (players Reports tab): each sub-tab (Forms/Submissions/Review-grades) toolbar now = search + `FilterToggleBtn` (dropdowns hidden until toggled, `rhFiltersOpen`) + action buttons; no more stacking.
- Players main table (via SeniorLeadPlayersPage) — shared, used by all.
- **`ResponsiveTabs`**, **`FilterToggleBtn`** (in ReportsHub) are the reusable pieces.

## Verification
- Harness: `<scratchpad>/shots.cjs <outDir>` (390/834/1440, asserts 0 h-overflow) + `interact.cjs`/`drawer.cjs` for overlays. Latest good run: `<scratchpad>/proof4/`. **0 horizontal overflow everywhere; prod build clean (`npm run build`).**
- Run/build: prepend Node (`%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_*\node-v24.18.0-win-x64`) to PATH; `npm run dev` (5173). Playwright + chromium already in node_modules.

## DONE since last update (all core screens now responsive, 0 h-overflow at 390/834/1440)
- **`/senior-scout/players` crash FIXED** — SeniorScoutDashboard was missing `import { SeniorLeadPlayersPage }`. Added it.
- **SeniorScoutDashboard** migrated: role toggle `hidden md:flex`, ResponsiveTabs, Sidebar actions (This Week+Add Report), heading→text-h3 + rhythm, `px-[var(--pad-page)]`.
- **PlayerProfile** responsive: fixed-height cockpit gated to `lg` (`lg:h-screen`/`lg:overflow-hidden`); mobile = normal page scroll; body `flex-col lg:flex-row`; rail `w-full lg:w-80`; tab-content `max-lg:min-h-[70vh]`; tab/filter pill rows `overflow-x-auto`; role pill→dot; `responsive` passed to TopNav. Desktop cockpit unchanged.
- **Target/Short/Signed** players tables got `.rtable` density (main table already had it). Frozen columns intact.

## Columns feature (IN PROGRESS)
New: `src/app/components/playerColumns.ts` (registry: 27 cols in 6 groups Bio/GameStats/Method/Status/Grades/External, `DEFAULT_VISIBLE_IDS` = 10, deterministic mock `value(player,i)` via `hashSeed`) + `src/app/components/EditColumnsModal.tsx` (blue-theme modal matching the green mockup: grouped toggle chips, CUSTOM PRESETS panel w/ non-functional "Save current as…", "N columns selected", "Apply Column Selection").
Wired into **SeniorLeadPlayersPage** main `PlayerTable` (Database/Long tabs): `visibleColIds` state, `Columns` button next to Filters, `extraCols` appended as a "Custom" column group in thead/tbody, `TOTAL_COLS = 15 + extraCols.length`. Toggling in modal shows/hides live. Verified `proof8/cols-table-1440.png` + `cols-modal-1440.png`.
**Columns rolled out to ALL tables (done):** PlayerTable (Database/Long/Short), TargetSuperTable (Target), SignedListTab (Signed — has its own Columns button + shared `visibleColIds`), and the Country/Head **inline** table in CountryScoutDashboard.tsx. Each has a Columns button + EditColumnsModal; extraCols appended as a "Custom"/"CUSTOM" group with mock data; group-row colSpans include `+ extraCols.length`. Verified `proof9/` (cols-table, tbl-target, tbl-signed, country-inline).
**Dropdowns unified (done):** `MiniDropdown` (ReportsHub), `Sel`+`NumIn` (SeniorLeadPlayersPage FilterBar), Country inline filter selects → canonical system pill (`bg-card border-border rounded-full`, ChevronDown, `font-body font-bold text-[14px]`). Season filter was already canonical.
**Toolbar (done):** players tabs all on one row (`px-4`, `whitespace-nowrap`); Scouted/Unscouted legend now vertical (`flex-col`) so Signed List doesn't wrap. Competitions search+season share the heading row.
**Columns polish still optional:** modal — ensure all 6 groups lay out cleanly (STATUS/GRADES/EXTERNAL wrap below tall GAME STATS col); presets "Save current as…" persistence (localStorage); dedupe a registry col that already exists natively in a table.
⚠️ **Concurrent file edits observed:** a linter/watcher (or Figma-Make sync) appears to modify these source files between edits (subagents saw base column counts shift, headers restyled). Always re-read a region before editing; rely on build + screenshots as ground truth.

## Lead dashboard "recruitment desk" incorporation (DONE)
Absorbed a suggested data-honest dashboard design into LeadScoutDashboard.tsx tabs (deep-links open players page via `?section=<tab>` — SeniorLeadPlayersPage reads it with useSearchParams):
- **Overview** = triage (RESTRUCTURED per Vanessa's sketch): TOP grid = 6 KPI cards (Tracked Players, Grade A Rate, Shortlist vs Pending, PKGS Unwatched, External Pool, Eyeball 8.0+ — all main-4 style, 3×2 desktop / 2×3 mobile, `lg:col-span-2`) + "Needs a call" card (`lg:col-span-1`, with the "6 no pathway" banner + Set-pathways folded into its top, then Short→Target rows). BOTTOM grid = Target Tasks (`lg:col-span-2`) + Upcoming Matches (`lg:col-span-1`). Counter strip + standalone no-pathway callout + Recent-activity card REMOVED. External Pool→database, Eyeball 8.0+→short-list deep-links.
- **Pipeline** = funnel: hit-rate strip, Shortlist→Target workflow (inline →Target), Target-list pathways (Offer/Trialing/No-pathway + Set-pathway), Target breakdown bars (pathway + status). Existing Signed Pipeline retained.
- **Analytics** = talent-map scatter (eyeball×age, PRIORITY quadrant), Leaderboards (top scouts/players toggle), Short→Target conversion trend. Existing Short-List-Tracked + Grade-Breakdown retained.
All mock data deterministic; NXUS blue; 0 overflow 390/834/1440; builds clean. Verified `proof11/` (lead-dashboard, pipeline, analytics, deeplink-shortlist).

## Lead Overview redesign v2 "glance & act" (DONE, deployed)
- **New net-new plumbing** (`SeniorLeadPlayersPage.tsx`): `?player=<id>` → scroll to + transient-highlight the row (`id="row-<id>"` on PlayerTable/TargetSuperTable/ShortListTable `<tr>`s; `ring-2 ring-primary` ~2.5s); **Grade filter** (FilterBar pill, deterministic `playerGrade(p)` via stable hash, `?grade=` param, options All/A+/A/B/C). Verified: `?section=short-list&grade=A%2B` filters to A+; `?player=sl-0` highlights the row.
- **Overview** = 4 rich KPI cards (2×2, `lg:col-span-2`) — Reports-by-senior-scouts→reports tab, Shortlist-report-coverage (8/14, ex-image card no photo)→reports, Players-in-Target+Short (20, split bar)→short-list, A+-in-reports (33% donut)→`short-list&grade=A%2B`. Rich anatomy: tinted icon + big number + mini-viz + corner `ArrowUpRight` (nudges on hover) + hover "→ Opens X" microcopy. **Target Breakdown moved here** from Pipeline, under the KPIs. RIGHT tall column (`lg:col-span-1`) = **Latest Highlights** feed (from exported `HIGHLIGHTS_FEED` in SeniorLeadPlayersPage = real SL/TL player {id,name,list,clips,hoursAgo}; row click → `goToPlayer` = scroll to real row) + **Upcoming Matches**. Removed: old 6 KPIs, Needs-a-call, Target Tasks, counter strip.
- **Pipeline**: Target Breakdown removed (now on Overview); rest intact.
- **Target tab** replaces Packages (`LeadTab` 'packages'→'target'): new `TargetTab` = the Target Tasks card (moved off Overview). `PackagesTab` left defined-but-unused.
- Verified `proof13/`; all builds clean, 0 overflow 390/834/1440. **Redeployed 2026-07-15** (63baa88b.qaza-2so.pages.dev → live qaza-2so.pages.dev, HTTP 200).

## Visualization responsiveness pass (DONE, not deployed)
Root cause of "graphs look off on mobile/tablet" = `recharts` `ResponsiveContainer height="100%"` collapses to 0 inside parents that only had height on desktop. Fixed:
- **ReportsHub.tsx** Analytics sub-tab: gated the inline fill-height to `isDesktop` (≥1024) only; Overview metrics `grid grid-cols-2 md:flex-col` (8 metrics, no clip); donut `flex-col items-center sm:flex-row` + fixed `w-40 h-40`; Submissions-Over-Time & Scout-Performance chart wrappers `h-[200px] sm:h-[280px] lg:flex-1`; sub-tab buttons `shrink-0 whitespace-nowrap` in `overflow-x-auto`.
- **PlayerProfile.tsx** Statistics radar: wrapper `h-[280px] sm:h-[320px] lg:h-auto lg:flex-1` (was `flex-1 min-h-0` → collapsed below lg because that tab's grid switches at lg).
- **Lead → Analytics** already fine (inline `<svg viewBox>` scales).
- **GlobalPulseDashboard / VideoDepartmentDashboard** use recharts too but live only in `OperationsDashboard`, which is NOT routed (dead code) — skipped; apply the same explicit-height pattern if ever enabled.
Verified `<scratchpad>/audit2/`. Rule going forward: any recharts chart needs an explicit height below `lg`.

## Overview KPI redesign (DONE, not deployed) — corrected layout
Vanessa's intent (a subagent first got this WRONG by making a full-width KPI strip that displaced Highlights/Matches): keep the approved 2-column structure, ONLY turn the KPI block into one row.
- **LEFT col (`lg:col-span-2`, `flex flex-col`):** KPI cards as a single row (`grid grid-cols-2 lg:grid-cols-4`) — badge-based anatomy (label+↗ / figure+badge+action-link, NO mini-viz), TALLER + ROUNDER (`p-6 rounded-[36px] min-h-[172px]`). Below them: **Target breakdown** with `flex-1` so it grows to fill the leftover height; its body uses nested `flex-1 ... justify-around` per section so the 7 bars distribute evenly (no empty void). Bars `h-4`.
- **RIGHT col (`lg:col-span-1`):** **Latest Highlights** (top) + **Upcoming Matches** (bottom) — UNCHANGED / not displaced.
- Outer grid `lg:items-stretch` so both columns equal height (drives the breakdown fill). Below `lg` everything stacks; KPIs go 2×2.
- Badge colors use tokens (scout-green / scout-amber via inline `color-mix`, primary for Elite Tier, accent for neutral Short/Target).
- Verified 1440/834/390 = 0 overflow (`scratchpad/ovshot2/`). Build clean.
LESSON: when Vanessa says "adjust the KPIs to one row," the surrounding cards stay put — don't restructure the whole tab.

## Overview fit-to-screen pass (DONE, not deployed)
Vanessa: "everything in view without scrolling; no gaps between breakdown bars; increase KPI card HEIGHT (not width) so breakdown isn't over-stretched."
- KPI cards `min-h-[204px]` (taller). rounded-[36px] kept.
- Outer grid back to `lg:items-start` (columns natural height; breakdown no longer force-stretched).
- Target breakdown: card is natural height (removed `flex-1`); body `space-y-5`; each section `<div>` + `space-y-2` bars (tight grouped bars, NO justify-around spread). Bars `h-4`.
- Latest Highlights feed `max-h-[200px] lg:max-h-[220px]` (was 320) — this is the lever that makes the right column fit; feed scrolls internally.
- Result: **1440×900 → docH 900, 0 vertical scroll, fits exactly.** 1366×768 still ~125px scroll (a 768-tall viewport can't hold this without becoming cramped — acceptable). 0 horizontal overflow at 390/834/1440.
- Verified `scratchpad/fitshot2/` + `scratchpad/ovshot3/`.

## Latest Videos + Pipeline/Tasks pass (DEPLOYED 2026-07-17)
- **Latest Highlights → "Latest Videos"** (LeadScoutDashboard OverviewTab). Row click now opens `PlayerVideoWorkspace` (same modal as the table video icon) via local `videoPlayer` state — no longer deep-links to the player row. Shows name + posAcronym; "clips" replaced by F{matchVideos}/H{highlightVideos} badges (same H/F style as tables). `HIGHLIGHTS_FEED` (in SeniorLeadPlayersPage.tsx) extended: added `posAcronym`, `matchVideos`, `highlightVideos` (dropped `clips`). Removed now-unused `goToPlayer` from OverviewTab.
- **PipelineTab** stripped to just **Pipeline Overview** (funnel) + **Signed Pipeline** (grid). Removed the hit-rate strip, "Shortlist — awaiting Target decision", and "Target list — pathways" cards + their data consts.
- **Tab "Target" → "Tasks"** (id stays `'target'`, TargetTab unchanged). 
- Verified interactively (`scratchpad/vidshot/`): video modal opens w/ name+pos, Pipeline shows only the 2 cards, Tasks tab present. Build clean.
- **DEPLOYED** to https://qaza-2so.pages.dev (deployment 94c48e14; HTTP 200).

## Overview reorg #2 — image-matched layout + match deep-link (DONE, NOT deployed) 2026-07-21
Ref image: breakdown left (tall), Upcoming Matches top-right, Latest Videos bottom-right.
- **Layout:** KPI cards now a **full-width horizontal row on top** (pulled out of the old left column). Below: `grid lg:grid-cols-3 lg:items-stretch` → Target breakdown `col-span-2` (left) + right column (Upcoming Matches top, Latest Videos bottom). items-stretch makes breakdown == right-column height; breakdown body `flex-1 flex flex-col justify-between` so it fills (bottoms align, no leftover void).
- **KPI cards:** removed ALL pills/badges; label top, big number bottom-left, action link bottom-right (with inline ↗). Kept `rounded-[36px]`. `min-h-[120px]`, `p-5`, bottom row `flex-wrap` (prevents 390px overflow). Shared class consts `KPI_CARD/KPI_LABEL/KPI_NUM/KPI_LINK/KPI_ARROW`.
- **Target breakdown data** rebuilt to the image (VISA excluded): Pathway ACH13·Feeder3·AB2·Partner2·VPS1; Status Reviewing4·Nat Pro2·Negotiating2·Scout2·ACH trial1·Paper work1·Signed1(green). Label col widened `w-20`.
- **Upcoming Matches:** removed competition/player pills; whole row is a button → `navigate('/lead-scout/matches?match=<matchId>')` with a `→` (ArrowRight) affordance. Data (`MOCK_MATCHES`) now has `matchId` mapping to real fixtures `match-1/5/7` in MatchesView.
- **Latest Videos:** table avatar (`w-8 h-8 rounded-xl bg-card border text-foreground` initials, not blue circle); removed **Live** pill; Short/Target pill now uniform `bg-background text-foreground border border-border` (black text, like the match pills). **Click still opens the video popup** (user chose to keep that). Feed `max-h-[150px]` internal scroll.
- **MatchesView.tsx:** added `useSearchParams` + `findMatchLocation(matchId)` helper + effect: `?match=<id>` opens that comp/round (`view='competition'`) and sets `highlightMatchId` (cleared after 3s). `MatchCard` gained `highlight` prop → `id={match-card-<id>}`, `ring-2 ring-primary`, and `scrollIntoView`. Match ids are the deterministic `match-N` from `matchSeq`.
- **Fit:** 1440×900 → docH 902 (~0 scroll). 0 horizontal overflow at 390/834/1440. Tablet/mobile stack & page-scroll (expected). Verified `scratchpad/ov5shot/` incl. match-link (lands on Group Stage w/ highlighted card) + video popup still opens.

## NEXT (remaining)
- Awaiting review of Overview reorg #2. NOT deployed — ask before pushing (live still shows the previous version).
0. **Dropdown UI consistency**: DONE earlier (MiniDropdown/Sel/NumIn/Country filters → pill). 
1. Optional Lead-dashboard follow-ups: richer deep-link FILTERS (e.g. Eyeball≥8, no-pathway) need new players-page filters; wire "Set pathway" + "→ Target" to real state; port Matchday into Packages/Overview if wanted.
1. **Guidelines.md** §4/§6 rewrite to the ratio system + **Figma** `Responsive` collection reconcile (read first via MCP, fileKey `qefpAyr3MEEklQRV96YlSv`) + 3 canonical frames.
2. Tune provisional jumper-spacing values per Vanessa's visual review; mobile bottom-padding polish for fixed elements.
3. **Redeploy** to qaza-2so.pages.dev once Vanessa approves (not yet redeployed).
4. Optional: minor `validateDOMNesting` warning (button-in-button) on /senior-scout — cosmetic console warning, not a crash.

## Open decisions / notes
- Spacing values PROVISIONAL — Vanessa reviewing density; she asked "tighter" twice.
- Live site `qaza-2so.pages.dev` NOT yet redeployed with these changes (deploy only on her go-ahead).
