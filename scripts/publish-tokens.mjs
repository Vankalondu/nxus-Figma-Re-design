#!/usr/bin/env node
/**
 * Publish the nxus-tokens package when — and only when — a token value changed.
 *
 *   node scripts/publish-tokens.mjs          # publish if needed (CI, needs NODE_AUTH_TOKEN)
 *   node scripts/publish-tokens.mjs --dry    # say what would happen
 *
 * Runs in the "make it live" deploy (CI & Deploy, workflow_dispatch), so the package
 * follows the same go-live rule as the site. npm versions must only ever go up, so the
 * content hash cannot be the version: the hash is stored in package.json under
 * `nxus.hash`, and a new patch version is published when it differs from the latest one.
 * Prints `published=<version>` or `published=` for the workflow to pick up.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PKG_DIR = 'packages/nxus-tokens';
const SRC = 'public/downloads/tokens';
const dry = process.argv.includes('--dry');
const out = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };

execSync('node scripts/build-tokens.mjs', { stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'));

let latest = null;
try {
  latest = JSON.parse(execSync(`npm view ${pkg.name} version nxus --json`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString());
} catch { /* E404: never published */ }

const publishedHash = latest?.nxus?.hash;
if (publishedHash === manifest.version) {
  console.log(`nxus-tokens ${latest.version} already carries tokens ${manifest.version} — nothing to publish.`);
  out('published', ''); process.exit(0);
}
const [maj, min, pat] = (latest?.version ?? '0.9.-1').split('.').map(Number);
const next = latest ? `${maj}.${min}.${pat + 1}` : '1.0.0';
console.log(`tokens ${publishedHash ?? '(none)'} -> ${manifest.version}: publishing ${pkg.name}@${next}`);

for (const f of pkg.files.filter((f) => f !== 'README.md')) fs.copyFileSync(path.join(SRC, f), path.join(PKG_DIR, f));
pkg.version = next; pkg.nxus = { hash: manifest.version, generated: manifest.generated };
fs.writeFileSync(path.join(PKG_DIR, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

if (dry) { console.log('--dry: not publishing.'); out('published', ''); process.exit(0); }
if (!process.env.NODE_AUTH_TOKEN) {
  console.log('::notice::NPM_TOKEN is not set, so nxus-tokens was not published. Add it under Settings > Secrets > Actions.');
  out('published', ''); process.exit(0);
}
execSync('npm publish --access public --provenance', { cwd: PKG_DIR, stdio: 'inherit' });
out('published', next);
