# Triage Board

A small internal app for triaging support tickets. Express API, JSON file storage, no build step.

## Run it

```bash
npm install
npm start          # http://localhost:4000
npm test           # existing suite
```

State lives in `data.json`, created from `fixtures/seed.json` on first boot. Delete it to start over.

## API

| Route | What it does |
|---|---|
| `GET /api/tickets` | Open tickets. `?tag=billing` filters by tag |
| `POST /api/tickets` | Create one. Body: `{ title, tag, severity }` |

`severity` is one of `low`, `normal`, `high`, `urgent`. See [API.md](API.md) before changing how any field is
validated: an external consumer pins to this contract.

## Layout

- `lib/tickets.js` gives you `createTicket()` and `listTickets()`
- `lib/db.js` is the store: `all()`, `insert()`, `nextId()`
- `public/index.html` is the whole front end, plain JS
- `fixtures/` holds the seed plus sample CSVs from the support team
