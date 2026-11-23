#!/usr/bin/env node
// Builds the public visit counter file (stats.json) from the web server's
// own access logs. Meant to run on the server from cron, for example hourly:
//
//   node visit-stats.mjs --state /var/lib/start-stats/state.json \
//     --out /var/lib/start-stats/stats.json /var/log/nginx/access.log*
//
// - Reads plain and .gz (rotated) logs in nginx/Apache "combined" format.
// - Skips bots, assets, and failed requests; counts page views and visits
//   (one browser on one day).
// - The state file keeps per-day totals only, so counts survive log
//   rotation. No addresses or user agents are written anywhere.
//
// Setup and the nginx snippet are in docs/visit-stats.md.

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { countDays, mergeDays, summarize } from './visit-stats-lib.mjs';

function usage(message) {
  if (message) console.error(`visit-stats: ${message}`);
  console.error('usage: visit-stats.mjs --state <state.json> --out <stats.json> <access.log>...');
  process.exit(2);
}

const args = process.argv.slice(2);
let statePath;
let outPath;
const logs = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--state') statePath = args[(i += 1)];
  else if (args[i] === '--out') outPath = args[(i += 1)];
  else logs.push(args[i]);
}
if (!statePath || !outPath) usage('--state and --out are required');
if (logs.length === 0) usage('give at least one access log file');

function readLog(path) {
  const raw = readFileSync(path);
  return (path.endsWith('.gz') ? gunzipSync(raw) : raw).toString('utf8').split('\n');
}

function writeAtomic(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

const lines = [];
for (const log of logs) {
  try {
    lines.push(...readLog(log));
  } catch (error) {
    console.error(`visit-stats: skipping ${log}: ${error.message}`);
  }
}

const saved = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')).days ?? {} : {};
const days = mergeDays(saved, countDays(lines));
const summary = summarize(days);

writeAtomic(statePath, `${JSON.stringify({ days }, null, 2)}\n`);
writeAtomic(outPath, `${JSON.stringify(summary)}\n`);
console.log(`visit-stats: ${summary.views} page views, ${summary.visits} visits since ${summary.since}`);
