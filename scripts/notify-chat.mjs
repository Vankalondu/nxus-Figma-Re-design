#!/usr/bin/env node
/**
 * Post a message to a Google Chat space.
 *
 *   GOOGLE_CHAT_WEBHOOK=... node scripts/notify-chat.mjs "message text"
 *   node scripts/notify-chat.mjs --file message.txt
 *
 * The webhook URL is a repository SECRET (the repo is public; anyone holding the URL
 * can post into the space). Without it this prints a notice and exits 0 — a missing
 * notification must never fail a build or block a pull request. The URL is never logged.
 * Google Chat formatting: *bold*, _italic_, <url|label> links.
 */
import fs from 'fs';

const args = process.argv.slice(2);
const text = args[0] === '--file' ? fs.readFileSync(args[1], 'utf8') : args.join(' ');
const url = process.env.GOOGLE_CHAT_WEBHOOK;

if (!text.trim()) { console.error('notify-chat: no message given'); process.exit(2); }
if (!url) { console.log('::notice::GOOGLE_CHAT_WEBHOOK is not set — skipped the Google Chat message.'); process.exit(0); }

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify({ text: text.slice(0, 4000) }),
});
if (!res.ok) console.log(`::warning::Google Chat answered ${res.status}; the message was not delivered.`);
else console.log('Google Chat: message sent.');
