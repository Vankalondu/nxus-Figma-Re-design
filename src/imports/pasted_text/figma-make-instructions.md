-

> **Global Consistency Audit & Fix — Full Application**
>
> Before making any changes, read the file `guidelines/Guidelines.md` completely. Every decision in this prompt is governed by that file. Do not proceed without reading it first.
>
> This prompt audits the entire application against the Guidelines and fixes every inconsistency found. Do not add any new pages. Do not remove any existing pages. Do not change any data, routing, or functionality. Only apply visual and component consistency fixes as described below.
>
> ---
>
> **Fix 1 — Colour tokens**
> The `globals.css` file has already been updated with the correct tokens. Now audit every component, page, and utility class in the entire application for any remaining instances of the old blue primary colour `#1E88E5` or any variant of it used as an interactive, active, or brand colour. Replace every instance with `#FF5C00` (Electric Ember). This includes but is not limited to: active tab states, button fills, button borders, focus rings, toggle active states, selected states, link colours, and any badge or indicator that uses blue as a brand signal. The only blue permitted anywhere is inside the column group header rows of data tables where `#0F172A` Deep Midnight is used as a structural anchor — that is correct and must not be changed.
>
> **Fix 2 — Sidebar colour**
> Find the sidebar component. Ensure its background is exactly `#0F172A` in both light and dark mode. If it is currently any other value update it to `#0F172A`. The sidebar never changes colour between modes. Active nav item: `border-l-[3px] border-[#FF5C00] bg-[#FF5C00]/8 text-[#F8FAFC]`. Inactive nav item: `text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/5 transition-colors`.
>
> **Fix 3 — Page header standard**
> Every page in the application must use the Qaza signature header pattern as specified in Section 5 of Guidelines.md. The header consists of a large title line with a relevant icon inside an Electric Ember filled circle (`w-14 h-14 rounded-full bg-[#FF5C00] flex items-center justify-center shadow-sm shrink-0`) placed between the first word and the rest of the title — exactly as the dashboard "Welcome ☀️ Oluniyi" header does. The icon is `text-[#F8FAFC]` at `size={28}`. Below the title a subtitle line in `font-body font-medium text-[18px] text-muted-foreground mt-4`. Below that the tab row where applicable. Apply the correct icon and title format per page as follows:
>
> Dashboard: Sun icon — "Welcome ☀️ [First Name]"
> Players Country/Head: Users icon — "Qaza 👥 Players"
> Players Senior/Lead: Database icon — "Players 🗄 Database"
> Long List: List icon — "Long 📋 List"
> Short List: Star icon — "Short ⭐ List"
> Target List: Crosshair icon — "Target 🎯 List"
> Scope Settings: Target icon — "Scope 🎯 Settings"
> Matches: Calendar icon — "Competitions 📅"
> Admin: Settings icon — "Admin ⚙️ Panel"
> Player Profile: User icon — "Player 👤 Profile"
>
> **Fix 4 — Tab active states**
> Every tab row across the entire application must use the same pill component. Active tab: `bg-[#0F172A] text-[#F8FAFC] rounded-full px-6 py-2 font-body font-bold text-[14px] shadow-sm border border-[#0F172A]`. Inactive tab: `bg-white text-[#64748B] rounded-full px-6 py-2 font-body font-bold text-[14px] border border-white hover:border-[#0F172A] hover:text-[#0F172A] transition-colors`. Tab row container: `flex items-center gap-2 mt-8 mb-6`. Apply to every tab row on every page including Dashboard tabs, Players tabs, Admin tabs, Matches tabs, and Scope Settings tabs.
>
> **Fix 5 — Spacing audit**
> Audit every padding, margin, and gap value across every component and page in the application. Every spacing value must be a multiple of 2px. Replace any non-compliant value with the nearest compliant value while preserving visual intent. Pay particular attention to arbitrary values like `px-[18px]`, `py-[13px]`, `gap-[11px]` or any other non-multiple-of-2 value. The full approved spacing scale is in Section 6 of the guidelines.
>
> **Fix 6 — Typography audit**
> Audit every text element across the entire application. Every font must be Manrope (`font-heading`), Figtree (`font-body`), or JetBrains Mono (`font-mono`). Remove any instance of Plus Jakarta Sans or any other font not in this list. Apply the correct font per element type as specified in Section 4 of the guidelines. All text sizes must be even numbers. Replace any odd text size (11px, 13px, 15px etc) with the nearest even value from the approved scale: 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 56px.
>
> **Fix 7 — Button audit**
> Audit every button across the entire application. Only three button variants are permitted as specified in Section 8.1 of the guidelines: Primary Ember filled, Secondary Ember outline, Destructive Red outline. Replace every button that does not match one of these three variants with the appropriate variant based on its purpose. All buttons use `rounded-full`. No square buttons, no default browser styles, no grey filled buttons, no navy filled buttons on interactive actions.
>
> **Fix 8 — Full width table pages**
> Every page that contains a full-width data table must use `w-full max-w-none` on its content wrapper with no max-width constraint. Page horizontal padding on these pages is `px-8` (32px). This applies to the Players Database page Senior/Lead view, the Long List, Short List, Target List, and any Admin table pages. Standard non-table pages use `px-16` (64px) horizontal padding.
>
> **Fix 9 — Table consistency**
> Every data table across every page must follow the table standard in Section 8.6 of the guidelines. Column group header rows use `bg-[#0F172A] text-[#F8FAFC] font-heading font-bold text-[10px] uppercase tracking-widest px-4 py-3 text-center`. Column sub-header rows use `bg-[#F4F5F7] text-[#64748B] font-heading font-bold text-[10px] uppercase tracking-widest px-4 py-4`. Position group rows use `bg-[#0F172A] text-[#F8FAFC] font-heading font-bold text-[10px] uppercase tracking-widest px-6 py-3` with player count in parentheses next to the position name. Year separator rows have no background fill, show year number only with no YOB prefix and no player count, use `border-t border-gray-100 font-heading font-bold text-[10px] uppercase tracking-widest text-[#94A3B8] px-4 py-2`. Data rows use `border-b border-gray-100 hover:bg-gray-50 transition-colors py-3 px-4 font-body text-[14px]`. The table spacing from the Senior/Lead Players page is the standard for all tables in the application.
>
> **Fix 10 — Direct Ladder icon**
> In the Senior Scout and Lead Scout player tables only, players who were raised directly to the Long List by a Country Scout must display a Direct Ladder indicator in their identity cluster. This is an `ArrowUpRight` icon at `size={10}` in `text-[#FF5C00]` placed immediately after the player name in the identity cluster. This icon must never appear on Country Scout or Head Scout views — it is for Tier B visibility only so Senior and Lead Scouts can identify players who bypassed the normal pipeline. Add a tooltip on hover: "Raised directly to Long List". This icon is tracked via the existing `raisedPlayerIds` state already in the codebase.
>
> **Fix 11 — Videos cluster on Senior/Lead tables**
> The Videos cluster currently exists on Country Scout and Head Scout tables but is missing from Senior Scout and Lead Scout table views. Add the Videos cluster to every table view in `SeniorLeadPlayersPage.tsx`. The cluster consists of two badges per player row: an F{n} badge for match footage count using `bg-[#CCFF00]/20 text-[#0F172A] font-bold px-2 py-0.5 rounded text-[12px]` and an H{n} badge for highlight count using `bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded text-[12px]`. Both badges navigate to the player profile on click. Use the exact same implementation already in `CountryScoutDashboard.tsx` as the reference.
>
> **Fix 12 — Editable column headers on all tables**
> The right-click to rename column header functionality currently exists on some tables but not all. Ensure it is present on every table across every scout tier and every tab view. The implementation already exists in `TableColumns.tsx` via `useDynamicColumns` — apply it consistently to every table that does not currently have it.
>
> **Fix 13 — Archive restore action**
> The split button dropdown in the Senior/Lead Players table currently does not include a Restore option for archived players. Add Restore as an available option in the split button dropdown. It must appear only on rows where the player is currently in an archived state. Selecting Restore removes the player from the archived state, restores them to full opacity, and moves them back to their correct position group above the archived section inline — no page refresh, no navigation.
>
> **Fix 14 — Theme persistence**
> The dark/light mode toggle currently does not persist the user's preference across sessions. Update the theme toggle implementation to save the user's preference to `localStorage` under the key `qaza-theme-preference`. On application load read this value before rendering and apply the saved theme before the first paint to prevent any flash of the wrong theme. Light mode is the default if no saved preference exists.
>
> **Fix 15 — Page subtitles**
> Every page must have a subtitle below the page title as specified in Section 5 of the guidelines. The subtitle updates dynamically when the active tab changes to reflect the current view context. Apply the correct subtitle text per view using the subtitle table in Section 5 of the guidelines. Pages currently missing subtitles include the Matches page and the Admin page — add them. On pages where the subtitle does not currently update on tab change fix the subtitle to be reactive to the active tab state.
>
> **Fix 16 — Dashboard subtitle dynamic implementation**
> The dashboard subtitle is currently a static rotating array. Replace it with the dynamic API implementation specified in Section 12 of the guidelines. The subtitle fetches fresh football context via the Anthropic API with web search enabled on every dashboard load and re-visit. It must never show the same subtitle on two consecutive visits. It falls back gracefully to the existing fallback array if the API call fails. It never shows a loading spinner — it displays the previous subtitle or a fallback while the new one loads then swaps in with a fade transition.
>
> **Fix 17 — One dark card per dashboard screen**
> In light mode every dashboard screen must contain at least one `bg-[#0F172A]` dark card as specified in Section 2 of the guidelines. Audit the Country Scout dashboard, Head Scout dashboard, Senior Scout dashboard, and Lead Scout dashboard. Where a dark card is missing add one using appropriate existing content — the Top Prospect card or the Upcoming Matches card are the natural candidates as they already exist in dark card treatment on some dashboards.
>
> **Fix 18 — Admin and Matches page visual consistency**
> The Admin page currently uses `bg-card`, `bg-secondary`, and other CSS variable references that were resolving to the old blue theme. Now that `globals.css` has been updated these will resolve correctly — but audit the Admin page and Matches page specifically to confirm every element renders using the correct Qaza colour system. Any hardcoded blue values found on these pages must be replaced with the correct token from the guidelines. The three-dot action menus on both pages must use the ember hover treatment: `hover:bg-[#FF5C00]/10 hover:text-[#FF5C00]`.
>
> **Do not change:** any routing, any data structure, any page names in navigation, any existing functionality, any component logic beyond what is explicitly described above. Read `guidelines/Guidelines.md` before and after making changes to verify every fix aligns with the design system.