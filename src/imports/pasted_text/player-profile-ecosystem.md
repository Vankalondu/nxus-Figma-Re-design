Player Profile Ecosystem
Target Workspace Context: Players Ecosystem ➔ Master Player Profile View & Edit Player Subsystem

CRITICAL ARCHITECTURAL DIRECTIVE FOR THE AGENT: You are constructing the entire frontend cockpit for a single Player Profile view alongside its modal editing workflow layer. You must strictly isolate your code to this profile directory framework. You are required to retain and fully execute 100% of the legacy platform's tracking datasets (including multi-category career history logs, match statistics panels, and tag filters) while updating the layout to use our premium design tokens. Ensure there is zero dead space at the bottom of containers, matching the equal-height structural alignment rules of the main platform.

── 1. The Master Profile View Header Deck ──
Construct a full-width background container card panel spanning the top of the viewport canvas to lock down player identity:

The Image Framework: On the absolute left margin of the header card, implement a dedicated, high-fidelity Player Image Upload Box with a smooth corner radius. If no image portrait asset is supplied, fall back to a clean background circle displaying the player's uppercase initials utilizing bold Manrope typography.

Metadata & Navigation Rows: To the immediate right of the image frame, mount the player name string, chronological tracking details (Age, DOB), country flags, and tactical position text indicators.

Global Call-to-Action Buttons: Anchor the outline [Edit Profile] button directly next to the primary focus colored [Add to Shortlist] capsule button. Lock this cluster flush against the far-right header margin.

Context Grid Ribbon: Directly underneath the primary identity text layout, arrange a horizontal row grid of four low-profile status summary boxes: [Current Team] ➔ [Contract Ends] ➔ [Matches Scouted] ➔ [Videos]. These boxes provide a 3-second macro overview of the player's status.

── 2. The Lower Canvas Viewport Tab Switcher ──
Directly beneath the header deck, introduce an inline segmented tab selector tracking exactly four layout states: [Videos & Highlights], [Statistics], [Career History], and [Notes]. Active selection states are cleanly underlined with our primary active brand accent blue (#095fbb). Switching states completely clears the lower workspace viewport to mount the selected dataset full-width with generous internal padding:

Tab A: [Videos & Highlights] Active Canvas
The Control Track: Mount our custom single-row capsule control strip at the top to filter items inline: [See All Videos] | [See Only Highlights] | [See Only Matches]. These capsule buttons use soft, light-tinted backgrounds with zero heavy fills.

Video Asset Grid: Arrange video highlight tiles underneath within a multi-column card layout grid. Each thumbnail container features rounded corners, an integrated camera icon overlay, clear title text strings, and historical metadata tags aligned neatly to the bottom margin.

Tab B: [Statistics] Active Canvas
Group the player's dense numerical tracking metrics into three vertically stacked, wide-plane card containers resting flat on the page surface: Playing Time, Goals & Assists, and Discipline.

Grid Presentation: Inside each card, lay out individual performance parameters (e.g., Apps, Starts, Minutes, G/90, Yellow Cards) inside clean, side-by-side data boxes.

Typography Token Mapping: Use large, high-contrast numbers formatted in Figtree typography for the metric values, paired with light, all-caps micro-labels underneath. This presents deep statistical matrices in a scannable structure without overstimulating the user with complex, crowded diagrams.

Tab C: [Career History] Active Canvas
Display the player's entire chronological registration track as a clean vertical list divided into four structural pipeline lanes: Club | Academy | National | School.

The Blended History Row: Completely avoid floating tags or blocks. Each historical registration entry renders as a single-line horizontal row spanning full-width across its card category.

Position date ranges on the far-left margin, organization strings and verification current-team checkmarks (✓) in the center, and administrative inline actions ([+] Add New, [✏️ Edit], [🗑️ Delete]) flush against the far-right margin. Separate rows with ultra-faint rule dividers (1px stroke, rgba(0, 0, 0, 0.04)).

Tab D: [Notes] Active Canvas
The Search Strip Capsule: A light horizontal navigation filter bar housing an inline dropdown menu (All Notes, Technical Logs, Physical Flags) paired immediately side-by-side with an inner white input field tracking: Search notes....

The Directory Feed: Display raw text observation inputs using our flat Blended Row structure. Mount notes and scouting summaries as unbordered horizontal strips resting flat directly on the card surface, separated by an ultra-faint 1px stroke, rgba(0, 0, 0, 0.04) rule line to optimize scan speeds.

── 3. The Backdrop-Blur Edit Player Overlay Modal ──
Clicking the [Edit Profile] button container inside the master header panel must alter the local UI state to mount a centered modal configuration sheet directly on top of the active profile view page layer.

┌────────────────────────────────────────────────────────┐
│  Edit player                                       [×] │
│  (Required fields marked with *)                       │
├────────────────────────────────────────────────────────┤
│                       [  ME  ]                         │
│                                                        │
│  Name:* [ Mohamed Etoo Tamboura                      ] │
│  DOB:   [ 10/10/2007                                📅] │
│                                                        │
│  Nationality: [ Select Country                     ▾ ] │
│               [ Côte d'Ivoire × ]                      │
│                                                        │
│  Positions:   Primary:      Secondary:    Tertiary:    │
│               [ RW     ▾ ]  [ LW     ▾ ]  [        ▾ ] │
│                                                        │
│  Preferred foot: [ Left                            ▾ ] │
│  Height (cm):    [ 185   ]   Weight (kg):  [ 78    ]   │
├────────────────────────────────────────────────────────┤
│                                            [ Update ]  │
└────────────────────────────────────────────────────────┘
A. Background Masking & Window Controls
The Backdrop Layer: Render a fixed full-screen mask utilizing our premium frosted glass design token (bg-[#061B2E]/60 with active backdrop-blur-sm filter parameters).

Modal Sheet Card: Center the configuration surface card on the viewport axis (max-w-3xl). Give it smooth, rounded corners (rounded-[24px]), card surface background coloring, and a fixed shadow layer.

Header Tier: Place the window title string "Edit player" flush left in bold Manrope typography, backed by the subtitle string "(Required fields marked with *)". Position a clean close vector cross icon (×) flush right to handle component unmounting logic.

B. Interior Layout Form Elements
Inside the modal scroll container body, arrange the data inputs sequentially from top to bottom, using space-saving row groupings to avoid endless vertical scrolling:

The Central Avatar Selector: Position a large, circular Player Profile Image Upload Frame centered horizontally. If an image file is absent, fall back to displaying the blue-tinted text circle showing the player's uppercase initials (ME) inside a smooth slate background layout.

Primary Identity Fields:

Row 1 (Full Width): Name:* text input lane backed by bold font metrics.

Row 2 (Full Width): DOB: data line integrated with our custom popover Calendar Widget 📅 picker mechanism.

The Nationality Chip Collector Row:

Render a standard dropdown lookup selector labeled Nationality:.

Directly beneath this input lane, provide a horizontal wrapping block area where selected countries render as independent, borderless Location Tags (e.g., Côte d'Ivoire ×). Tapping the × glyph on a tag handles instant item removal from the active selection array.

The 3-Column Position Matrix Track:

Implement a 3-column horizontal split tracking tactical positions: Primary: | Secondary: | Tertiary:.

Each column contains its own independent dropdown cell managing the platform's professional acronym keys (RW, LW, ST, CB, etc.).

Physical & Mechanical Metrics:

Row 1 (Full Width Dropdown): Preferred foot ▾ selector field (Left, Right, Ambidextrous).

Row 2 (2-Column Inline Pair): Place the numerical value input field for Height (cm): immediately side-by-side with the numerical input box for Weight (kg):.

C. Sticky Action Baseline
The Action Dock: Lock a sticky action footer baseline row to the absolute bottom of the modal card.

The Update Trigger: Position a full-width or right-aligned primary focus colored button inside this row lane labeled: Update set in crisp bold Manrope typography. Clicking this target triggers an immediate database rewrite operation and smoothly unmounts the modal window layer.