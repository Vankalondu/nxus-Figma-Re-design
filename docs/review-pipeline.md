# The NXUS review pipeline

How a change gets from Figma or a developer into the product, who approves it, and who
hears about it. Built 15 Oct 2026 in the NXUS prototype, to be proven here and then
copied into the real app.

## The two ways a change starts

**1. A design-token change starts in Figma (Vanessa).**

1. Vanessa changes a variable in Figma and presses **Send** in the NXUS Token Export plugin.
2. GitHub opens a pull request, **Figma token update** (label `figma-sync`). It carries the
   new values into the record of Figma *and* into the app's stylesheet (`globals.css`).
3. The PM is asked to review, and Google Chat says so.
4. The **Visual check** posts its summary on the pull request (see below).
5. The PM approves and merges.
6. The developers are tagged on GitHub and told in Google Chat.
7. On the next **make it live**, the app, Storybook and the `nxus-tokens` package update.

**2. Everything else starts with a developer.**

1. A developer opens a pull request.
2. The **Visual check** and the other checks run.
3. The PM reads the summary, approves or asks for changes, and it is merged.
4. Google Chat hears about the merge. It goes live on the next **make it live**.

## The Visual check

Every pull request gets screenshots of all Storybook components (131) and four key screens
at 390 / 834 / 1440, compared pixel for pixel with the approved images in
`tests-visual/__screenshots__`. One comment on the pull request, updated on every push:

- a verdict: **safe to approve**, **needs a decision**, or **failed to render**;
- counts: unchanged, changed, new, failed;
- the design-rule lint and the Figma-match check;
- for every change, the approved image, the new image and the differences in red.

It can tell **that** something changed, never **whether it was meant to**. That is the
PM's call. If every change is intended, add the label **`accept-visuals`**: the approved
images update and the check runs again and passes.

Rendering is made identical run to run: seeded random data, a frozen clock, web fonts
loaded before the screenshot, and fixed Chrome text rendering. Four consecutive runs on an
unchanged `main` were 143 of 143 identical; a deliberate corner-radius change was caught
on 51 screenshots. Approved images are only ever made on GitHub's runner, never on a laptop.

## Settings to fill in (Settings > Secrets and variables > Actions)

Every part skips quietly until its setting exists, so these can be added one at a time.

| Name | Kind | What it does |
|---|---|---|
| `PM_USERNAME` | Variable | The PM's GitHub username (no @). Asked to review every pull request. |
| `DEV_USERNAMES` | Variable | Developers' GitHub usernames, space-separated. Tagged when a Figma token update merges. |
| `GOOGLE_CHAT_WEBHOOK` | Secret | A Google Chat space > Apps & integrations > Webhooks > Add. Paste the URL. If the option is missing, a Workspace admin has turned webhooks off. |
| `NPM_TOKEN` | Secret | An npm granular access token that can publish `nxus-tokens`. Until it exists, make-it-live skips the package. |

**One repo switch:** Settings > Actions > General > Workflow permissions > tick **Allow
GitHub Actions to create and approve pull requests**. Without it, the Figma flow still
works, but the Chat message carries a link to open the pull request by hand.

## Once the PM is on the repo: make their approval required

Do this only after the PM has accepted the collaborator invitation. A required review
with no other reviewer would stop Vanessa from merging her own pull requests, because
GitHub never lets authors approve themselves.

Settings > Branches > Add rule for `main`:

- Require a pull request before merging, **1 approval**.
- Require status checks to pass: **Visual status** (the commit stamp, which also covers re-checks started by accept or by the Figma sync), **Build & E2E tests**, **Token lint + Figma drift**.

Optionally add a `CODEOWNERS` file (`* @pm-username`) so GitHub requests the PM automatically
on every pull request, not only through `PM_USERNAME`.

## Copying this into the real app

The pieces are separate files, so they move one at a time:

- `tests-visual/` and `.github/workflows/visual.yml`: the Visual check. Point the screen
  list at the real app's routes and replace the Storybook build with theirs.
- `scripts/visual-summary.mjs`: the pull-request summary. No changes needed.
- `.github/workflows/notify-merged.yml` and `scripts/notify-chat.mjs`: notifications.
- `scripts/lint-tokens.mjs`: the design rules.
- Tokens: the real app installs `nxus-tokens` rather than copying values.

The prototype keeps its own live link for user testing and for trying changes before
they go into Figma. The real app's release process replaces **make it live** there.
