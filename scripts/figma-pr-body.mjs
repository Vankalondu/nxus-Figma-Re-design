#!/usr/bin/env node
/**
 * Builds the body for the figma-sync pull request.
 *
 * This is a FILE rather than an inline `node -e` in the workflow for a reason
 * that cost a failed run: the prose contains an apostrophe ("Figma's"), which
 * terminated the single-quoted shell string and made node parse the rest as
 * code. Anything with human text in it belongs in a script, not in YAML.
 *
 *   node scripts/figma-pr-body.mjs merge.log diff.log lint.log > pr-body.md
 */
import fs from 'fs';

const read = (f) => {
  if (!f) return '(not run)';
  try {
    const t = fs.readFileSync(f, 'utf8').trim();
    return t || '(no output)';
  } catch {
    return '(not run)';
  }
};

const [mergeLog, diffLog, lintLog] = process.argv.slice(2);

const fence = (s) => '```\n' + read(s) + '\n```';

process.stdout.write([
  'A Figma export changed the committed token snapshot.',
  '',
  '**What to decide:** whether Figma is right and the CSS should follow, or the code is',
  'right and Figma should be corrected. Naming and structure belong to Figma; values',
  'belong to the code. A script cannot tell a deliberate correction from an accidental',
  'nudge, which is why this is a pull request and not a push.',
  '',
  '### What the merge changed',
  fence(mergeLog),
  '',
  '### Figma against the CSS, after the merge',
  fence(diffLog),
  '',
  '### Token lint',
  fence(lintLog),
  '',
  '---',
  '',
  'These checks ran inside the sync workflow. A pull request opened with GITHUB_TOKEN',
  'does not start further workflows, so the results are inlined here rather than',
  'appearing as PR checks.',
  '',
  'Merging updates the snapshot only. If the change is accepted, `src/styles/globals.css`',
  'may need to follow — see `docs/figma-sync.md`.',
  '',
].join('\n'));
