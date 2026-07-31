# HANDOFF — NXUS Responsive System v1

_Last updated: 2026-07-29. Resume by reading this file._

## LATEST (2026-07-29) — Video Manager dashboard + shared KPI/Tasks refactor (DONE, NOT deployed)
Built the **Video Manager** as a new role/dashboard, plus polish that touches Lead + Senior. All verified: `npm run build` clean, **Playwright 20/20 pass**, 0 h-overflow @1440/834/390. **Not deployed** (pre-meeting draft — the video dashboard is a first draft to review with the video team; all its data is mock).
- **Shared `KpiCard`** (`components/dashboard/KpiCard.tsx`): one source of truth for the clean KPI card (chip + SHORT HEADING · big number + descriptor · actionable link + `ArrowUpRight`). `rounded-[32px]` (was 20). Robust bottom row (fixes the Lead Coverage link mis-wrap). Lead + Senior + Video Manager all use it.
  - Actionable link copy: Lead `Opens Reports·View Coverage·Opens Short List·View A+ Players`; Senior `Opens Reports·Opens Short List·View Packages·Opens Target List`.
- **Shared `TasksTab`**: Active/Archived toggle moved onto the header row next to "Assign task" (was under the title). Affects Lead/Senior/VM (parity).
- **`SeniorLeadPlayersPage`**: `orderedTabs` now filters out `reports` + `settings` when `loggedInRole === 'Video Manager'` (line ~2963, `hiddenTabs`). Scouts unchanged.
- **`TopNav`**: `This Week` + `Add Player` now gated on their handlers (like `Add Report` already was). VM passes none → clean nav; all scout dashboards still pass them → unchanged.
- **New `VideoManagerDashboard.tsx`** (cloned from Senior shell): tabs **Overview · Highlights · Full Matches · Analytics · Tasks** (no Reports). Overview = 4 KPIs (Missing Highlights/Full · Highlights/Full uploaded; % coverage in descriptor) + **Raised Requests queue** (centerpiece) + Upcoming Matches + Team Activity. Highlights/Full Matches = mirrored `CoverageTab` (stat strip + player coverage table + recent uploads). Analytics = coverage-over-time (2-line SVG) + turnaround + editor/uploader leaderboards + demand. Tasks = shared `TasksTab`. Reuses `SeniorLeadPlayersPage`/`MatchesView`/`AdminView` as-is.
- **Role wiring**: `App.tsx` (4 `/video-manager/*` routes + player/:id), `LoginSuccess.tsx` (`Video Manager`→`/video-manager`), `Sidebar.tsx` `getRoleBasePath` (`Video Manager`→`/video-manager`). Login already produced the "Video Manager" role.
- **Open questions for the video-team meeting** (design forks, in the shared design draft): what counts as "covered"; who closes a raised request (auto vs Lead accepts); coverage-% denominator (pipeline vs raised); role work-flow (chain vs independent); do requests carry deadlines; pipeline scale. KPI mock numbers (Short List 14 / Target 6 on Senior; VM counts) are placeholders.
- Prior-art dead code mined but NOT used: `VideoDepartmentDashboard.tsx` / `GlobalPulseDashboard.tsx` / `OperationsDashboard.tsx` (different design system + recharts) — built fresh in house style instead.
- Verified shots: `<scratchpad>/vmproof/` (vm-overview/highlights/full-matches/analytics/tasks/players, lead-overview/tasks, nav bars).

### Global player search + nav polish (2026-07-29, same session — DONE, NOT deployed)
Build clean, **Playwright 20/20**, 0 h-overflow @1440/834/390.
- **KPI cards** earlier this session: extracted shared `components/dashboard/KpiCard.tsx` (rounded-[32px], up-arrow on link, actionable copy, fixed Lead Coverage mis-wrap); Lead + Senior use it. Shared `TasksTab` toggle moved next to "Assign task".
- **New `components/PlayerSearch.tsx`**: live player search dropdown off the top-nav search. Queries `ALL_GENERATED_PLAYERS` (now `export`ed from `SeniorLeadPlayersPage.tsx`). Two-line rows (initials-chip avatar + blue name / flag·team·age), kebab → "Add to shortlist"/"Add to target" (mock `toast` — real tier state still lives inside SeniorLeadPlayersPage, not hoisted). Whole row → `navigate('{base}/player/{id}', {state:{player}})` with base = lead/senior/video-manager path or `/player` fallback (verified lands on `/lead-scout/player/db-18`). 6-row cap + "Showing N of M" footer; keyboard (↑/↓/Enter/Esc), outside-click close. Placeholder **"Find a player"**. Flags via 3→2 letter map (GHA→gh …) + flagcdn.
- **TopNav**: desktop AND mobile-overlay search now render `<PlayerSearch>` (mobile finally matches desktop/tablet). Added a **theme toggle (Moon/Sun via next-themes) next to the notification bell**. `searchPlaceholder` prop now unused (PlayerSearch owns copy).
- **Sidebar**: removed the bottom profile block (avatar + name + role) AND the theme toggle from BOTH desktop and mobile drawer (avatar was a decorative dup of the top-nav one; theme moved to nav). `useTheme`/`Moon`/`Sun`/`displayName`/`displayRole` may now be unused there (harmless).
- **VideoManagerDashboard**: added `showAddPlayer` + `onAddPlayer` + the mock Add-Player modal, so the VM top nav shows **Add Player** again.
- Verified shots: `<scratchpad>/searchproof/` (search-dropdown-1440, search-kebab-1440, search-mobile, topnav-theme, vm-nav-addplayer, sidebar-full).
- **Follow-ups (flagged, not done):** real shortlist/target persistence from search needs hoisting tier state to a shared store; optional "recent players" empty-state; players have no photos so avatars are initials chips.

## Earlier context

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

## Overview Matches card — two views + Kenyan teams + width shift (DONE, NOT deployed) 2026-07-21
- **Matches card is now two-view:** header = Calendar icon + "Matches" title + segmented toggle `[Upcoming | Results]` (`matchView` state in OverviewTab; active = `bg-primary text-primary-foreground`). Removed the top-right ↗ arrow from BOTH the Matches card and the Latest Videos card (user found it purposeless).
- **Upcoming** rows = "Home vs Away" + date under (no competition line). **Results** rows = "Home {hs}–{as} Away" (score in `text-primary`) + date under. Both rows navigate to `/lead-scout/matches` (plain — user chose NOT to deep-link to a specific fixture). Row → ArrowRight affordance kept.
- **Data:** `MOCK_MATCHES` replaced by `UPCOMING_MATCHES` (MatchItem) + `RECENT_RESULTS` (ResultItem, has `hs`/`as`). Real KPL teams: Gor Mahia, Tusker, AFC Leopards, Bandari, Kakamega Homeboyz, Kenya Police, KCB, Ulinzi Stars.
- **Width shift:** lower grid `lg:grid-cols-3`→`lg:grid-cols-5`; breakdown `col-span-2`→`col-span-3` (60%), right column `col-span-1`→`col-span-2` (40%). Widens Matches + Latest Videos, narrows breakdown "a little."
- **Dormant:** MatchesView `?match=` deep-link + MatchCard highlight code from reorg #2 is still present but no longer triggered (dashboard navigates plainly now). Harmless; kept as latent feature.
- **Fit:** 1440×900 → docH 900, 0 scroll. 0 horizontal overflow at 390/834/1440. Verified `scratchpad/ov6shot/` (upcoming + results views).

## Pipeline tab redesign (DONE, NOT deployed) 2026-07-21
Plan: `~/.claude/plans/reflective-splashing-balloon.md`. All in `LeadScoutDashboard.tsx` `PipelineTab` + its data consts.
- **Pipeline Overview** (was funnel bars) → full-width card, `grid lg:grid-cols-[auto_auto_1fr]`: (1) **inline-SVG donut** of the 5 stage counts (r=15.915 → circumference 100 so dasharray = %; per-slice `offset = 25 - cumulative`), center = Database total "60 in pipeline"; distinct slice colors (`#b8d4ef`/`#E8A838`/`#7baac7`/`#061b2e`/`--scout-green`). (2) **By stage** clickable legend (dot + label + count) → `navigate('/lead-scout/players')`. (3) **By position** breakdown = whole-pipeline headcount per position (`PIPELINE_BY_POSITION`, sums to 60) in a 2-col list w/ bars, each → players list.
- **Signed Pipeline** → full-width below. `signedYears` useMemo replaced by fixed `SIGNED_YEARS = [2022,2023,2024,2025,2026]`. Header = **plain year** (dropped the `year+18` eligibility big-number + `(year)`). Dropped the "+ future" column. Per-column `min-w-[180px]`→`min-w-[120px]` + `last:border-r-0` so all 5 years fit full-width **with 0 table scroll at 1440** (still scrolls <lg — expected). Subtitle now "Columns show the year each player was signed".
- **Data:** `LEAD_SIGNED_DATA` gained 2022 (Moussa Diarra ST, Kwame Mensah RCB) + 2023 (Ibrahim Touré CM, Samuel Osei GK); Francis Gomez moved 2028→2026 (was outside range). New `PIPELINE_BY_POSITION` const.
- **Nav preserved:** donut legend + position rows both → `/lead-scout/players` (verified). Signed grid/modal unchanged.
- Verified `scratchpad/pipeshot2/`: donut+legend+by-position render; years [2022,2023,2024,2025,2026] all visible, table scroll 0 @1440; stage & position clicks navigate. Build clean, 0 page overflow.

## Pipeline tab — side-by-side + hover donut (DONE, NOT deployed) 2026-07-21
- **Side by side:** wrapped both cards in `grid lg:grid-cols-[300px_minmax(0,1fr)] gap-4 lg:items-stretch` (return is now a `<>` fragment; modal outside the grid). Pipeline Overview LEFT (fixed 300px), Signed Pipeline RIGHT (rest). `items-stretch` → **equal heights** (verified both 694px).
- **Pipeline Overview:** removed the "By position" breakdown (+ its `PIPELINE_BY_POSITION`/`maxPosCount` consts). Card body `flex-1 flex flex-col items-center justify-center gap-8` → donut on top, "By stage" legend below, vertically centered to fill the tall card.
- **Donut hover:** new `hoveredStage` state. Each slice `<circle>` has `onMouseEnter/Leave` (+ legend rows sync it) → center number/label swaps to that stage's count (else "60 / in pipeline"); hovered slice thickens (strokeWidth 5→6.5) and others dim (`opacity-30`). Click still `navigate('/lead-scout/players')` on slices AND legend rows.
- **Signed grid fit:** added `table-fixed` + `min-w-0` on the card so all 5 year columns (2022–2026) fit the narrower right card with **0 internal scroll** at 1440; long names truncate (with `title={player.name}` tooltip). Pos col `w-[56px]` px-3.
- Verified `scratchpad/pipe4shot/`: equal heights, years all visible, tableScroll 0, page overflow 0, hover "Signed" → center "13 / Signed".

## Reports tab — search + Filters popup + F1 podium (DONE, NOT deployed) 2026-07-21
Plan: `~/.claude/plans/reflective-splashing-balloon.md`. All in `LeadScoutDashboard.tsx` `ReportsTab`.
- **Toolbar** rebuilt: `[🔍 Search…]` (left, filters by player name OR scout) · **`Filters ▾`** popup button (active-count badge) · `Refresh` + `Add Report` (far right, `ml-auto`). Old inline All/Unread pills removed.
- **Filters popup** (`filtersOpen` state, closes on outside-click/Esc; `filtersRef`): a `bg-card` popover with 5 `RFilter` dropdowns (new module-level helper: labelled styled native `<select>`) — **Status** (All/Unread), **Scout**, **Grade (PLR)**, **Position**, **Date** (All time / This month / This week) + **Clear all**. Scout/Grade/Pos opts derived from the reports data.
- **Filtering**: single `shown` filter chains search + fStatus + fScout + fGrade + fPos + fRecency. Added `daysAgo` to each report for the recency filter (week ≤7 / month ≤31). Empty state card when no matches.
- **F1 podium**: now renders the pre-existing `ChampionPodium` (2nd left · champion centre+trophy · 3rd right) — replaced the weak single-trophy tile. Top section = `grid lg:grid-cols-[1.6fr_1fr]`: 4 stat tiles (2×2) left, podium right. `scoutCounts` given distinct values (Mbugua 9 · Tom 6 · Nene 4) so the champion reads clearly.
- Added `SlidersHorizontal`, `ChevronDown` to the lucide import.
- Verified `scratchpad/repshot/`: podium correct; toolbar order correct; 5 dropdowns; Scout=Nene→2 cards; Clear→6; search "gomez"→1; "zzz"→0 + empty msg; 0 overflow @1440/834. Build clean.

### Refinement (2026-07-21): filters inline + nicer champion
- **Filters now inline, not in a popup** (user: "should be in view, they can all fill that space"). Replaced the `Filters ▾` popup with 5 always-visible compact pill selects via new `InlineSel` helper (Status/Scout/Grade/Position/Date; 'All' sentinel shown as "All scouts"/etc; a set filter highlights primary). A "Clear" link appears when `activeFilters>0`. Removed `filtersOpen`/`filtersRef`/outside-click effect and the `SlidersHorizontal` import. Toolbar: `[🔍 Search] [All reports▾][All scouts▾][All grades▾][All positions▾][All time▾] [Clear] … [Refresh][+ Add Report]`. Fits one row @1440, wraps below; 0 overflow @1440/834.
- **ChampionPodium redesigned** (same message, better looking): gold-gradient champion block (tallest, centre) with trophy above + medal-coloured avatar rings (gold/silver/bronze) + rank badges (1/2/3), plus a "**X leads by N reports**" subtitle. Still 2nd-left · 1st-centre · 3rd-right. `Medal` import may now be unused (harmless).
- Verified `scratchpad/repshot2/`: 5 inline selects, Scout=Nene→2 cards + active highlight + Clear link, new podium renders, 0 overflow @1440/834.
- **Dropdown style fix (2 passes):** first matched the pill trigger to the app's `Sel`; then — because a native `<select>`'s OPTION LIST can't be themed — rebuilt `InlineSel` as a **custom dropdown** (button trigger + app-rendered options panel): trigger = pill `bg-card border rounded-full shadow-sm` (active → `bg-primary/10 border-primary text-primary`); panel = `bg-card border rounded-[16px] shadow-xl`, option rows `hover:bg-accent`, selected row `bg-primary/10 text-primary` + `Check` icon. Per-dropdown `open` state + outside-click/Esc close. Both trigger and options now match system UI. Verified `scratchpad/repshot4/`.

## Champion card polish + Analytics rebuild (DONE, NOT deployed) 2026-07-21
Plan: `~/.claude/plans/reflective-splashing-balloon.md`. All in `LeadScoutDashboard.tsx`.
- **ChampionPodium** premium redesign (CSS keyframes in a module-level `CHAMP_KEYFRAMES` `<style>`): winner = gold gradient ring (`from-[#fde047] to-[#b45309]`) + pulsing glow (`champGlow`), floating trophy (`champFloat`), gold-gradient podium (`from-[#b45309] via-[#f59e0b] to-[#fde047]`) with a diagonal shine sweep (`champShine`, 4s); podium blocks spring-in staggered (`champRise`, bottom origin, overshoot cubic-bezier; 2nd 0ms·3rd 120ms·1st 260ms); winner hover `scale-1.04`. Header has a "Leads by X reports" amber badge. Runners (2nd/3rd) on light-blue (`bg-primary/10`) podiums w/ silver/bronze rings + rank badges. Content visible at rest (CSS-only, no JS-gated visibility).
- **AnalyticsTab** reshaped to Vanessa's set: **removed Leaderboards** (+ `TOP_SCOUTS`/`TOP_PLAYERS`/`board`/`rankStyle`). Row1 = Talent map (kept) + **Eyeball rating card** (NEW: avg + 4 bands 8.0+/7.5–7.9/7.0–7.4/<7.0, derived from `TALENT`). Row2 = **Conversion trend — Long→Target, monthly Jan→Jul**, with **country tabs** (`All/Ghana/Nigeria/Senegal/Kenya/Côte d'Ivoire`; `convCountry` state, `CONV_BY_COUNTRY` data; big %/delta recompute per series). Row3 = **Tracked players** (retitled from "Short List Tracked", trend kept) + **Grade Breakdown** (kept).
- Verified `scratchpad/azshot/`: champion badge + gold winner render; leaderboards gone; eyeball card (7.7 avg); conversion country switch works (All 42%/+18 → Ghana 48%/+20); 0 overflow @1440/834/390 (mobile stacks).

## Tasks tab — two-column rebuild (DONE, NOT deployed) 2026-07-22
Plan: `~/.claude/plans/reflective-splashing-balloon.md`. All in `LeadScoutDashboard.tsx`.
- **Model:** `Task.priority` widened to `High|Medium|Low`; added `Task.allocated`. `PriorityPill` handles 3 levels (Medium = scout-amber tint). `MOCK_TASKS` given `allocated` + a Medium + a 2nd completed (t6) so Archived isn't empty. New `TASK_ASSIGNEES` const. Parent `addTask` now accepts **string OR `{text,assignedTo,dueDate,priority}`** (normalises, stamps `allocated`=today, `completed:false`) — keeps the "Tasks This Week" modal's `addTask(text)` working.
- **TargetTab** rebuilt as `grid lg:grid-cols-2 lg:items-stretch` (stacks on mobile):
  - **LEFT "Task distribution":** weekly **stacked bars** (Mon–Sun; Completed=`#061b2e`, Pending=`#E8A838`, Assigned=`#b8d4ef`) built with CSS flex divs; **Tasks/Hours** segmented toggle (`WEEK_TASKS`/`WEEK_HOURS` datasets, bars scale to max daily total); legend.
  - **RIGHT "Target Tasks":** header summary `{active} active · {archived} archived` + **Active/Archived** toggle + **"＋ Assign task"** button. Rows show description + Target/priority pills + **Allocated {date} · Due {date} · → {assignee}**. Active rows have a complete-checkbox (→ archives); Archived rows are muted/strikethrough with a **Restore** button (both call `onToggle`). Tasks never deleted.
  - **Assign modal** (mirrors Sign Player modal): Description + Assignee (`TASK_ASSIGNEES` select) + Due date + Priority (High/Medium/Low pills) → `onAdd({...})`; disabled until description filled.
- Verified `scratchpad/tkshot/`: 4 active/2 archived; Tasks↔Hours toggle swaps bars; Assign modal adds a task (active 4→5); complete archives (5→4); Archived shows 3 + Restore; restore returns it (3→2); 0 overflow @1440/834/390 (mobile/tablet stack).

## Overview tab — two-row layout, Matches split into two cards (DONE, NOT deployed) 2026-07-22
Plan designed with Fable. All in `LeadScoutDashboard.tsx` `OverviewTab`.
- Split the single toggle **Matches** card into **two side-by-side cards**: "Most Recent Results" (Trophy icon, `RECENT_RESULTS`, scores) + "Upcoming Matches" (Calendar icon, `UPCOMING_MATCHES`). Removed `matchView` state + toggle. Rows still `navigate('/lead-scout/matches')` + ArrowRight.
- Layout (scrolling now OK): KPI strip taller (`KPI_CARD` `min-h-[160px]` `p-6`) → **Row 1** `grid lg:grid-cols-3 lg:items-stretch`: Target breakdown `lg:col-span-2 lg:min-h-[420px]` + Latest Videos `lg:col-span-1` (feed `max-h-[240px] lg:max-h-none lg:flex-1 lg:min-h-0`) → **Row 2** `grid lg:grid-cols-2`: Results + Upcoming. `min-w-0` on all four cards.
- User floated drag-to-rearrange cards, then said **do NOT implement for now** — skipped (deferred idea).
- Verified `scratchpad/ov7shot/`: two match cards side by side, toggle gone, 0 overflow @1440/834/390.

## Dashboard polish batch (DONE, NOT deployed) 2026-07-22
Plan designed w/ Fable. `LeadScoutDashboard.tsx` + `TopNav.tsx`; reuses `EditFormBlueprintModal`.
- **Radius:** all dashboard card radii → `rounded-[16px]` (was 24/32/36) in LeadScoutDashboard.tsx. App-wide left for later.
- **Sticky nav fix** (`TopNav.tsx`): was a translucent `bg-card/90` floating pill `sticky top-6` → content bled through/around. Now wrapped in a `sticky top-0 z-50 bg-background px-.. pt-4 pb-2` **opaque band** containing an opaque `bg-card rounded-[16px]` pill. Content no longer shows behind it. Applies to all dashboards.
- **Overview:** KPI cards taller (`min-h-[190px]`) + top-right ↗ arrow (link stays bottom-left, no pills). Target breakdown bars `h-4`→`h-6`, `space-y-3`. Layout = breakdown `col-span-2` (left) + right column [Latest Videos + combined **Matches** card: one card, `grid-cols-2` Recent Results | Upcoming, both visible]. Removed the two side-by-side match cards + `matchView`.
- **Reports:** 4 KPI tiles + Champion in ONE row (`grid lg:grid-cols-6`, tiles col-span-1 `justify-between`, champion col-span-2 `h-full`). **Champion redesigned** — no gold/primary: neutral `bg-card`, `scout-green` winner accent (Crown + ring + green-tint block), muted/accent runners; token-based so dark-safe. Search+filters → **table pill spec** (`InlineSel` text-[12px] pill + rounded-[16px] popover; search pl-9 text-[13px]). **View** button → opens `EditFormBlueprintModal` (same as Forms "Edit Form") + marks report opened. Report **3 states**: `status` unseen(blue ring)/seen(default)/opened(faded opacity-60). Removed toolbar **Add Report** (kept in top nav); **Refresh** now outline (transparent + primary border).
- **Tasks:** removed Hours toggle (`WEEK_HOURS` unused); weekly chart → **horizontal** stacked bars (row per weekday, count at right).
- **Filters unified this pass:** Reports search+filters to table spec (Analytics country tabs / Tasks toggle already segmented-pill style).
- Verified `scratchpad/bshot|finshot/`: all screens render; View modal opens (light+dark); champion green dark-safe; horizontal task bars; sticky nav opaque on scroll; 0 overflow @1440/834/390.
- Deferred: drag-to-rearrange Overview cards; app-wide radius.

### Reports refinement (2026-07-24)
- **KPI tiles compact:** `p-4 h-[135px] justify-between` (were tall/stretched); row `lg:items-start`.
- **Champion → floating (NO card):** removed `bg-card`/border/shadow — root is just `flex flex-col`, sits on the page bg. **Gold is back** (user reversed the earlier "remove gold"): 1st gold (`border-amber-400`, golden `Crown` fill, "1st" amber ribbon), 2nd silver (`border-slate-300`, "2nd"), 3rd bronze (`border-amber-700/60`, "3rd"); each shows name / role / "N Reports". Header keeps a green "Leads by N" badge (scout-green). No podium blocks now — avatar-centric.
- **Filter buttons outlined:** `InlineSel` default = `bg-transparent border border-primary/40 text-foreground hover:bg-card/60`; active = `bg-primary text-primary-foreground border-transparent` (solid blue pops). Search stays a solid white `bg-card` pill. (Diverges from last turn's table-pill styling for the reports filters, per new spec.)
- Verified `scratchpad/rfshot/`: compact tiles, floating gold podium, outlined filters + solid-blue active (Nene→2 cards), 0 overflow @1440.

## Design-system coherence pass (DONE, NOT deployed) 2026-07-24
Plan: `~/.claude/plans/reflective-splashing-balloon.md`. `LeadScoutDashboard.tsx` + `TopNav.tsx`.
**Global tokens:** card radius **16→20px** (dashboard + nav); card `<h3>` titles `font-black`→**`font-bold`** (copy Pipeline Overview weight); icon chips `bg-primary/10` + `text-foreground`; secondary/outline btn = `bg-transparent border border-primary text-foreground hover:bg-primary/10` (black text+icon); outlined filter pill = default `bg-transparent border border-primary/40`, active `bg-primary text-primary-foreground`; segmented toggle = table style (`bg-card border rounded-full p-1`, font-bold, active bg-primary); pills uniform `bg-primary/15 text-foreground`.
**Reports:** compact KPI tiles (`h-[135px] p-4`); **Champion = floating** (no card, `border-2 border-primary/40` transparent, KPI height), centered title, removed "Leads by"/"This cycle", **smiley** avatars (`Smile`, green) + **crown** on 1st, name+number only (normal black text), **1st primary-blue / 2nd silver `#cbd5e1` / 3rd soft-teal `#3fb4c0`**; search outlined+wider; report cards lost notes/divider/blue-dot (shorter); Refresh black text+icon; **Load more (651)** outline button.
**Analytics (rebuilt via subagent):** replaced Eyeball/Grade/Tracked with 4 cards — Row1 Conversion trend (3-line Long/Short/Moved + 6-stat row + "All countries" dropdown + footnote) `col-span-2` + Archived by stage (stacked Long/Short/Target + stats) `col-span-1`; Row2 Leaderboards (Top scouts/players toggle) `col-span-1` + Talent map (kept scatter) `col-span-2`.
**Overview:** lower grid `lg:grid-cols-3`→`lg:grid-cols-5`, breakdown `col-span-3` / right column `col-span-2` (right wider, breakdown narrower); matches card fonts confirmed.
**Tasks:** "Target Tasks"→**"Tasks"**; Assign = outline; **task rows → cards** (name+priority TL · assignee TR · Due BL · Allocated/Restore BR); `PriorityPill` uniform blue/black; Active/Archived toggle = table style; icon chip light-blue+black.
- Reversals this turn: gold back on champion medals (then refined to blue/silver/teal per this spec); search now outlined (was white pill).
- Verified `scratchpad/dsshot/`: all 4 tabs; 0 overflow @1440/390; build clean. Dark-safe (tokens).

## Reports/Analytics refinement (2026-07-24, in progress)
- **Filters + search:** default bg now the former hover fill (`bg-card/60`), new hover `hover:bg-card`; active filter still solid `bg-primary`.
- **Champion → far-right, one row (LATEST):** Reports top row is `grid grid-cols-2 lg:grid-cols-6 gap-4 lg:items-stretch` → **4 KPI tiles** (each `lg:col-span-1 h-[135px]`) **then ChampionPodium** (`col-span-2`, **far right**). ChampionPodium is compact (`min-h-[135px]`, `border-2 border-primary/40` transparent) with title **"Report Champion" top-LEFT** inside (`text-left`); podium = Smile avatars, crown on 1st, 1st primary-blue / 2nd silver `#cbd5e1` / 3rd teal `#3fb4c0`, name+count only.
- **Load more (WORKS):** `reports` state now = 6 named + **651 generated** = **657 total**; `visibleCount` state starts **6**; `filtered` = all matching, `shown = filtered.slice(0,visibleCount)`, `remaining = filtered.length - shown.length`. Button label **"Load more ({remaining} remaining)"** (initially **651 remaining**), `onClick` +9, hidden when `remaining<=0`. Verified label 651→ (after click) 639.
- **Analytics Leaderboards reworked (LATEST):** shows **top 10 players** + **top 10 scouts**. Scouts view subtitle = **"Ranked by highest shortlist submissions"** (not "top ten"); toggle labels **"Scouts" / "Top players"**. `SCOUT_BOARD` = 12 scouts across **senior+country+head** roles, ranked desc by count, role shown as plain text under name (**no pills**; removed the "Live" badge). Senior Scouts flagged `removable` — **David Mbugua/Nene/Brice ONLY** get an `X` remove button → `removedScouts` state filters them out (`.slice(0,10)`). Verified: exactly 3 remove buttons, 3→2 after one removal.
- **Analytics rows (DONE earlier):** Row1 **Leaderboards + Talent map**, Row2 **Conversion trend + Archived by stage**; interactive "All countries" dropdown drives 3 series + 6-stat row via `CONV_DATA`, SVG `<title>` tooltips.
- Verified this turn `scratchpad/reports-1440.png`, `analytics-scouts-1440.png`: 0 overflow @1440, build clean.

## NEXT (remaining)
- Awaiting review. NOT deployed — big backlog unshipped this session (Overview two-row layout, Latest Videos, Pipeline redesign + side-by-side, Reports tab, Analytics rebuild, Tasks tab). Ask before pushing.
- Deferred (user's idea, not now): drag-to-rearrange Overview cards.
0. **Dropdown UI consistency**: DONE earlier (MiniDropdown/Sel/NumIn/Country filters → pill). 
1. Optional Lead-dashboard follow-ups: richer deep-link FILTERS (e.g. Eyeball≥8, no-pathway) need new players-page filters; wire "Set pathway" + "→ Target" to real state; port Matchday into Packages/Overview if wanted.
1. **Guidelines.md** §4/§6 rewrite to the ratio system + **Figma** `Responsive` collection reconcile (read first via MCP, fileKey `qefpAyr3MEEklQRV96YlSv`) + 3 canonical frames.
2. Tune provisional jumper-spacing values per Vanessa's visual review; mobile bottom-padding polish for fixed elements.
3. **Redeploy** to qaza-2so.pages.dev once Vanessa approves (not yet redeployed).
4. Optional: minor `validateDOMNesting` warning (button-in-button) on /senior-scout — cosmetic console warning, not a crash.

## Open decisions / notes
- Spacing values PROVISIONAL — Vanessa reviewing density; she asked "tighter" twice.
- Live site `qaza-2so.pages.dev` NOT yet redeployed with these changes (deploy only on her go-ahead).
