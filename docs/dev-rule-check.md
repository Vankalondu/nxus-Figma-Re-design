# NXUS rule check — for the dev team's repo

A small automatic check the LightHouse devs add to their own repo. It reads the code in each
pull request and warns when a change breaks an NXUS rulebook rule. Decided 2 Nov 2026:
**it warns, it never blocks.**

## What it does

- Runs by itself on every pull request in the devs' repo.
- Looks **only at the lines that pull request adds or changes**. Old code that was already
  there is not flagged, so nobody gets 2,000 warnings on day one.
- Checks those lines against the rules that can be read from code:

| Rule | What it catches |
|---|---|
| **L-G1** Bind tokens, never raw values | A colour typed in by hand (`#304151`, `rgba(…)`, `bg-[#1E88E5]`) instead of an NXUS token |
| **L-C1** No white or black | `white`, `black`, `#fff`, `#000`, `bg-white`, `text-black/60` |
| **L-C2** No colour from outside the system | Tailwind's own colours (`text-gray-500`, `bg-blue-600`) |
| **L-C10** Retired token names | Old names that no longer exist (`text-foreground`, `bg-primary`) |
| **L-TY1** Two typefaces | Any font other than Figtree and Plus Jakarta Sans |
| **L-TY3** Use the type ramp | A fixed text size (`font-size: 15px`, `text-[28px]`, or a Tailwind size preset like `text-sm`) instead of a ramp class. `text-4xl` and up are allowed for KPI numerals |
| **L-TY5** Size is `type-*` | Old size class names (`text-h3`, `text-caption`) |
| **L-S1** 4-point grid | Padding, margin or gap that is not a multiple of 4px (`padding: 10px`, `p-[13px]`) |

It understands Vue files (template, script and `<style>`), React files, and CSS/SCSS.

- For each problem it puts a yellow **warning on that exact line** in the pull request's
  "Files changed" view.
- It keeps **one summary comment** on the pull request with every issue, what to do, and links
  to the rulebook and the Figma file. When the dev pushes a fix, the same comment updates
  itself, so there is never a pile of comments.

### What a warning looks like

On the line:

> ⚠️ **NXUS L-G1** — Breaks L-G1 (Bind tokens, never raw values): `background: #F4FAFF` — use an
> NXUS colour token (var(--…) from nxus-tokens, or the NXUS Tailwind class) instead of a literal
> colour. See the Figma file: https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv

In the summary comment:

> ### NXUS rule check
> ⚠️ **Warning only — this does not block the merge.** Please fix these, or, if a value is
> deliberate (for example colour that is data, like a team kit), add `nxus-ignore` in a comment
> on that line and say why.
>
> | Where | Rule | Found | What to do |
> |---|---|---|---|
> | `src/components/PlayerCard.vue:17` | L-G1 | `background: #F4FAFF` | use an NXUS colour token … |

## What it does NOT do

- **It cannot tell whether a screen looks like Figma.** Layout, what is on the page, the order
  of things, the wording: that still needs a person (Vanessa) to compare with the Figma file.
- **It never changes their code.** It only points.
- **It does not block merges** in warn mode. A dev can merge with warnings showing.
- **It only runs if the devs add it** to their repo. Nothing is installed from this side.
- It reads code, not the running app, so a colour that comes from the server or a database is
  not seen.

## How the devs add it (one file)

1. Copy [`docs/dev-rule-check/nxus-rule-check.yml`](dev-rule-check/nxus-rule-check.yml) into
   their repo as `.github/workflows/nxus-rule-check.yml`.
2. Commit it. The next pull request runs the check.

There are no secrets to set up. It uses the token GitHub gives every workflow, with only two
permissions: read the code, and write the one comment.

The file points at an **exact version** of the checker (a commit of this repo). The rules only
change on their side when they update that line, so nothing changes under them without notice.

**Skipping code that isn't theirs:** the `ignore:` line lists folders to skip (generated
files, third-party code). Add more, separated by commas.

**A deliberate exception:** a comment containing `nxus-ignore` on the line, or
`nxus-ignore-next-line` on the line above, skips that line. Use it only for agreed cases, such
as colour that is data (rule L-G2: team kits, medal colours), and say why in the comment.

## Switching to "block" later

When everyone is used to it, change `mode: warn` to `mode: block` in their workflow file. The
check then fails the pull request while issues remain. If they also turn on branch
protection for that check, it can no longer be merged until it's fixed. Don't do this until
Vanessa says so.

## For maintainers (this repo)

- The checker lives in `.github/actions/nxus-rule-check/`: `rules.mjs` holds the rules (they
  mirror `scripts/lint-tokens.mjs`), and `check.mjs` handles finding the changed lines, the
  warnings and the comment. It needs no extra packages.
- Self-test: `npm run test:rule-check`. It checks that the sample bad files in `test/fixtures/bad`
  get every expected warning, the clean ones get none, and only changed lines are reported.
- Try it on any folder: `node .github/actions/nxus-rule-check/check.mjs --all path/to/src`,
  or on changes since main: `… check.mjs --base origin/main`.
- When a rule changes, update `rules.mjs` and the test, then give the devs the new commit to
  pin.
