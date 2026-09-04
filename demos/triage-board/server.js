import express from 'express';
import { fileURLToPath } from 'node:url';
import * as db from './lib/db.js';
import { createTicket, listTickets } from './lib/tickets.js';

const PORT = process.env.PORT || 4000;

db.load();

const app = express();
app.use(express.json());
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

app.get('/api/tickets', (req, res) => {
  res.json(listTickets({ tag: req.query.tag }));
});

app.post('/api/tickets', (req, res) => {
  try {
    res.status(201).json(createTicket(req.body));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`triage-board on http://localhost:${PORT}`));
