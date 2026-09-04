// JSON-file store. Loaded on boot from data.json, falling back to the seed fixture.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FILE = new URL('../data.json', import.meta.url);
const SEED = new URL('../fixtures/seed.json', import.meta.url);

let rows = [];
let persist = true;

export function load() {
  const src = existsSync(FILE) ? FILE : SEED;
  rows = JSON.parse(readFileSync(src, 'utf8'));
}

export function flush() {
  if (persist) writeFileSync(FILE, JSON.stringify(rows, null, 2));
}

export function all() {
  return rows;
}

export function insert(row) {
  rows.push(row);
  flush();
  return row;
}

export function nextId() {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

// Test hook: swap the rows and stop writing to disk.
export function reset(seed = []) {
  rows = seed;
  persist = false;
}
