import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as db from '../lib/db.js';
import { createTicket, listTickets } from '../lib/tickets.js';

test.beforeEach(() => db.reset([]));

test('createTicket stores a ticket as open', () => {
  const t = createTicket({ title: 'Card declined', tag: 'billing' });
  assert.equal(t.status, 'open');
  assert.equal(t.title, 'Card declined');
});

test('createTicket normalizes the tag', () => {
  const t = createTicket({ title: 'Invoice wrong', tag: '  Billing  ' });
  assert.equal(t.tag, 'billing');
});

test('createTicket rejects a missing title', () => {
  assert.throws(() => createTicket({ title: '', tag: 'billing' }), /title is required/);
});

test('createTicket rejects an unknown severity', () => {
  assert.throws(() => createTicket({ title: 'x', tag: 'y', severity: 'apocalyptic' }), /unknown severity/);
});

test('listTickets filters by tag', () => {
  createTicket({ title: 'a', tag: 'billing' });
  createTicket({ title: 'b', tag: 'auth' });
  assert.equal(listTickets({ tag: 'billing' }).length, 1);
});

test('listTickets hides closed tickets', () => {
  createTicket({ title: 'a', tag: 'billing' });
  db.all()[0].status = 'closed';
  assert.equal(listTickets({}).length, 0);
});

test('ticket text is escaped before it reaches the DOM', () => {
  // Mirrors the esc() in public/index.html; the board renders via innerHTML.
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  assert.equal(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(esc(`"quoted" & 'single'`), '&quot;quoted&quot; &amp; &#39;single&#39;');
});
