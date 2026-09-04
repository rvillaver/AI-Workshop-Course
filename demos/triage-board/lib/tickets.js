import * as db from './db.js';

const SEVERITIES = ['low', 'normal', 'high', 'urgent'];

function normalizeTag(tag) {
  return String(tag ?? '').trim().toLowerCase();
}

export function createTicket({ title, tag, severity = 'normal' }) {
  if (!title || !String(title).trim()) throw new Error('title is required');
  if (!SEVERITIES.includes(severity)) throw new Error(`unknown severity: ${severity}`);

  return db.insert({
    id: db.nextId(),
    title: String(title).trim(),
    tag: normalizeTag(tag),
    severity,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
}

export function listTickets({ tag } = {}) {
  const rows = db.all().filter((r) => r.status === 'open');
  if (!tag) return rows;
  const wanted = normalizeTag(tag);
  return rows.filter((r) => r.tag === wanted);
}
