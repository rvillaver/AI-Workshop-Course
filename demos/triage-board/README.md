# Triage Board

A small internal app for triaging support tickets. Express API, JSON file storage, no build step.

## Run it

> **Note:** BlitzPi ships its own Bun but does not add it to your shell PATH. Either add it once
> (`export PATH="$HOME/Library/Application Support/BlitzPi/bun/bin:$PATH"` on macOS,
> `$HOME/.local/share/blitzpi/bun/bin` on Linux), or run these inside a `blitzpi` session so the
> sandbox applies.

```bash
bun install
bun run start      # http://localhost:4000
bun test           # existing suite
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
