Great point. Mobile responsiveness for a data-dense platform like Qaza needs a specific strategy — you can't just shrink the desktop view. Here's my thinking before I add it to the prompt:

---

## The Mobile Strategy for Qaza

**The reality:** Qaza is primarily a desktop tool. Scouts use it on laptops and monitors. But mobile matters for quick checks — a scout at a match wanting to look up a player, check their pipeline status, or log a note.

**The approach — Progressive Disclosure:**
On mobile, you don't show everything. You show what a scout needs on the go:

| Desktop | Mobile equivalent |
|---|---|
| Full data table with 15+ columns | Card view with key stats only |
| Dark filter bar with all filters | Single filter button that opens a bottom sheet |
| Left sidebar tabs | Bottom navigation bar |
| Full top nav | Compact top bar — search + avatar only |
| Multi-column dashboard grid | Single column stacked cards |
| Wide KPI cards row | Horizontally scrollable KPI row |

**Breakpoints to use:**
- Mobile: `< 768px` (sm)
- Tablet: `768px - 1024px` (md) — partial desktop, partial mobile treatment
- Desktop: `> 1024px` (lg) — full experience

---

Here is the full updated prompt with mobile responsiveness added:

---

> **Layout, Table, Filter Consistency & Mobile Responsiveness Fix — Full Application**
>
> Read `guidelines/Guidelines.md` before making any changes. Do not add or remove any pages, features, or functionality.
>
> **Fix 1 — Remove max-width constraint globally**
> In `CountryScoutDashboard.tsx` find the line that reads:
> `className={\`w-full flex flex-col h-full ${(activePage === 'players' && isSeniorOrLead) ? 'max-w-none' : 'max-w-[1440px]'}\`}`
> Replace it with:
> `className="w-full flex flex-col h-full max-w-none"`
>
> Find the line that reads:
> `className={\`pb-12 ${(activePage === 'players' && isSeniorOrLead) ? 'px-8' : 'px-[64px]'}\`}`
> Replace it with:
> `className="pb-12 px-4 md:px-8"`
>
> Apply the same fix to `HeadScoutDashboard.tsx` and `SeniorScoutDashboard.tsx` if they contain equivalent `max-w-[1440px]` or `px-[64px]` constraints — remove them and replace with `max-w-none` and `px-4 md:px-8` respectively.
>
> Apply the same fix to `MatchesView.tsx` and `AdminView.tsx` — these pages must also use `w-full max-w-none` with no width cap and `px-4 md:px-8` horizontal padding.
>
> **Fix 2 — Country/Head Players table visual treatment**
> The Country Scout and Head Scout Players page currently has filters in a left sidebar panel and a plain table. Redesign the visual treatment to match the Senior/Lead Players page while keeping all existing functionality intact.
>
> Move the filter controls from the left sidebar panel to a dark filter bar that runs full width above the table — exactly like the dark `bg-[#0F172A]` filter bar on the Senior/Lead Database view. The filter bar contains the existing filter options (BIO filters: Foot, Ht, Age; TECH filters: Pos, Profile, Scout; Apply button; Active/Audit toggle) laid out horizontally in the same style as the Senior/Lead filter bar. The filter bar uses `bg-[#0F172A] rounded-[24px] px-6 py-4` with filter labels and inputs in `text-[#F8FAFC]` and `text-[14px]`.
>
> Keep the left sidebar panel for the tab navigation (Players in Scope, Top 10, Reserve List, Combined Top 10), the position filter (All, Strikers, Wingers, Midfielders, Full Backs, Centre Backs), and the Bento Toolkit — these stay exactly as they are. Only the data filters move to the top bar.
>
> The table itself must use the same column group header treatment as the Senior/Lead table: `bg-[#0F172A] text-[#F8FAFC]` group headers spanning related columns. The table spacing, row height, and column widths must match the Senior/Lead table exactly.
>
> **Fix 3 — Filter bar text size**
> Every filter bar across the entire application must use `font-body text-[14px]` for all filter labels, dropdown values, and input text. Update every instance of `text-xs` or `text-[12px]` or `text-[11px]` in filter bars to `text-[14px]` throughout.
>
> **Fix 4 — Table column header text size**
> Every table column sub-header row (ACTION, PLAYER, NAT, CTRY, FT, HT, PROFILE, SCOUT, APP, GLS, PEN, AST) must use `font-heading font-bold text-[12px] uppercase tracking-widest`. The group header row (BIO DATA, GAME STATS, VIDEOS, PLAYER IDENTIFICATION) keeps `text-[10px]`. Only column name sub-headers increase to `text-[12px]`.
>
> **Fix 5 — Top navigation bar horizontal margins**
> Update the top navigation bar margin from `mx-[64px]` to `mx-4 md:mx-8` to stay consistent with the updated page padding across all screen sizes.
>
> **Fix 6 — Mobile responsiveness**
> Qaza is primarily a desktop tool but scouts need mobile access for quick field checks. Apply responsive behaviour using these three breakpoints: mobile below 768px (`sm`), tablet 768px to 1024px (`md`), desktop above 1024px (`lg`). The full desktop experience is unchanged. Only mobile and tablet layouts are added as responsive layers on top.
>
> **Mobile — Top navigation bar (below 768px):**
> Hide the This Week button text — show icon only. Hide the Add Player button text — show plus icon only. Hide the role indicator pill text — show the ember dot only. Keep search, bell, and avatar visible. The nav bar uses `mx-4` on mobile.
>
> **Mobile — Sidebar (below 768px):**
> The sidebar collapses to a bottom navigation bar fixed to the bottom of the screen. It shows only the four navigation icons (Dashboard, Players, Matches, Admin) without labels. The bottom bar uses `bg-[#0F172A]` with ember active state. The sidebar toggle button appears as a hamburger icon in the top nav on mobile — tapping it slides out the full sidebar as an overlay from the left with a dark backdrop. The overlay sidebar shows all sidebar content including the theme toggle and user profile.
>
> **Mobile — Dashboard page (below 768px):**
> Stack all content in a single column. The KPI cards row becomes a horizontally scrollable row — cards are `min-w-[240px]` and scroll horizontally with `overflow-x-auto`. The Scout Leaderboard and Top Prospect cards stack vertically, each full width. The Upcoming Matches card stacks below. Page title reduces to `text-[36px]` on mobile. All card padding reduces to `p-6` on mobile.
>
> **Mobile — Players page (below 768px):**
> The left sidebar panel (tab navigation and position filter) becomes a horizontal scrollable pill row at the top of the content area — the same pills but laid out horizontally with `overflow-x-auto`. The Bento Toolkit collapses into a single Filter button that opens a bottom sheet overlay containing all the toolkit options. The data table switches to card view automatically on mobile regardless of the desktop view mode toggle. Each player card shows: initials circle, name, age, position badge, nationality flag, and the three key stats (Gls, Ast, App). Action buttons (Raise, Reserve, Top 10) appear as a horizontal row at the bottom of each card. The view mode toggle (table/card) is hidden on mobile — card view is always used.
>
> **Mobile — Filter bar (below 768px):**
> The dark horizontal filter bar collapses to a single row with a Filter button on the left (opens a bottom sheet with all filter options) and the Active/Audit toggle on the right. The bottom sheet uses `bg-[#0F172A] rounded-t-[32px]` with all filter controls stacked vertically, each full width, with a prominent Apply button at the bottom and a Close handle at the top.
>
> **Mobile — Matches page (below 768px):**
> The competition cards stack in a single column full width. The search and filter controls stack vertically. Match fixture cards within each competition stack vertically. All text sizes remain readable at `text-[14px]` minimum.
>
> **Mobile — Admin page (below 768px):**
> The tab row (Bodies, Competitions, Teams, Players, Transfers) becomes a horizontally scrollable pill row. The data tables switch to a card-per-row layout where each row renders as a compact card showing the key fields. The three-dot action menu remains on each card. The search bar goes full width.
>
> **Tablet — 768px to 1024px:**
> The sidebar remains visible but collapses to icon-only width (`w-16`) with tooltips on hover showing the label. The top nav shows all elements but at slightly reduced padding. Dashboard KPI cards show in a 2-column grid instead of 4. Players page shows the left sidebar panel collapsed to icon pills. Tables remain in table view but with reduced column padding `px-2` instead of `px-4`.
>
> **Do not change:** any tab sets, any action buttons (Raise, Reserve, Top 10), any pipeline logic, any data, any routing, any modal content, or any functionality on any page. The desktop experience must be completely unchanged by these mobile additions.