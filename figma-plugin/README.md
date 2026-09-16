# NXUS Token Export — Figma plugin

Reads the variable collections in `QAZA_FE` and emits the three sections
`scripts/figma-tokens.json` is built from: **Qaza**, **Mapped**, **Responsive**.

## Install it (once, ~30 seconds)

1. Figma → menu → **Plugins → Development → Import plugin from manifest…**
2. Pick `figma-plugin/manifest.json` from this repo.

It now appears under **Plugins → Development → NXUS Token Export**. Nothing is
published to the Figma community; it runs only for you, from these files.

## Use it

1. Open `QAZA_FE`, run the plugin.
2. **Copy JSON** (or **Save file**).
3. In the repo:

```bash
npm run figma:merge -- path/to/figma-export.json      # or pipe it on stdin
npm run verify:figma                                   # what moved, if anything
```

`figma:merge` replaces only Qaza, Mapped and Responsive. Everything else in
`figma-tokens.json` is human curation — the `_cssPair` map the drift check
depends on, the `_role` notes, the Allias family map, the `_verified`
provenance — and is left untouched. A partial export is refused rather than
merged, because a missing section would otherwise read as mass deletion.

To see what *would* change without writing anything:

```bash
node scripts/figma-merge.mjs export.json --check
```

## Why you can trust the output

This code was proven before it was packaged. The identical extraction was run
against `QAZA_FE` through the Figma MCP and its output diffed against the
committed snapshot:

```
IDENTICAL  Qaza          (10 groups, incl. the collapsed Fonts weight arrays)
IDENTICAL  Mapped        (54 light/dark pairs)
IDENTICAL  Responsive    (52 mobile/tablet/desktop triples)
```

Every value matched. So this is a transcription of something already verified,
not a first attempt.

## Two details that matter

**Output is sorted on merge, not on export.** Figma returns variables in an
internal order that is not stable across edits. Without sorting, every export
would produce a diff full of moved lines and no changed values — and a PR
nobody can read is a PR nobody reviews. Arrays are left alone: for a weight ramp
or a `[mobile, tablet, desktop]` triple, the order *is* the data.

**Alpha is preserved only when it does something.** `Color/Border/input` is navy
at zero alpha; dropping the alpha would quietly turn an invisible border into a
solid navy one.

## Send to GitHub (the one-click path)

Instead of copying JSON by hand, the plugin can post the export straight to
GitHub, which starts the `figma-sync` workflow.

**Set it up once:**

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
   - **Repository access:** Only select repositories → this repo
   - **Permissions → Repository permissions → Contents: Read and write**
     (that is the minimum `repository_dispatch` accepts — nothing else is needed)
2. In the plugin, open **GitHub settings**, enter the repository as
   `Vankalondu/nxus-Figma-Re-design`, paste the token, press **Save**.

**Then, every time:** run the plugin → **Send to GitHub**. The workflow checks
whether any token value actually moved; if it did, it pushes a `figma-sync`
branch and GitHub offers you a *Compare & pull request* button.

### Where the token lives

In `figma.clientStorage` — per-user, sandboxed to this plugin, on the machine
that typed it. **Never in these files.** This repository is public, so a
credential committed here would be a credential published. That is why the
plugin asks for it rather than shipping with one, and why there is a
**Forget token** button.

The manifest allows exactly one host, `https://api.github.com`. The plugin
cannot reach anywhere else.

### If GitHub refuses it

The panel reports the status and GitHub's own reason:

- **401** — the token is wrong or expired
- **403** — it lacks *Contents: write*
- **404** — the repository name is wrong, **or** the token cannot see it. GitHub
  deliberately returns 404 rather than 403 for repositories a token has no
  access to, so check the name and the repository-access setting together.
