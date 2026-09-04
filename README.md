# AI Workshop — Demos & Dev Environment

A ready-to-use cloud dev environment for the workshop's **runnable demos**. Open it in
GitHub Codespaces (or clone it) and you get Node 22 plus the agent CLIs preinstalled — so
you, or an AI coding assistant (GitHub Copilot, Claude Code, Codex), can run the examples
and drive commands with no local setup.

> The workshop deck/course material is internal and lives elsewhere. This repo is just the
> demos and the environment to run them.

## Quick start (GitHub Codespaces)

1. Get a free **[OpenRouter](https://openrouter.ai/keys)** API key (no card).
2. Green **Code** button → **Codespaces** → **Create codespace**. It builds in ~1 min and
   installs the agent CLIs automatically.
3. Paste your key as the Codespace secret `OPENROUTER_API_KEY`.
4. Run a demo:

   ```bash
   node demos/manual-agent-loop/agent_loop.mjs
   ```

   Or start the triage board used by the Development track:

   ```bash
   cd demos/triage-board && npm install && npm start   # port 4000, forwarded automatically
   ```

## What's here

| Path | What it is |
|---|---|
| `demos/manual-agent-loop/` | "The human is the runtime" — a tool-call loop you drive by hand. All Node, no install. |
| `demos/triage-board/` | A small support-ticket app used by the Development track. Express + JSON storage, port 4000. |
| `.devcontainer/` | Codespaces setup: Node 22 + Claude Code + Codex, your API key as a secret. |

## Run it locally instead

Needs **Node 22+**. Put `OPENROUTER_API_KEY=sk-or-...` in a repo-root `.env` (see
`.env.example`), then:

```bash
node demos/manual-agent-loop/agent_loop.mjs
```

See [`demos/manual-agent-loop/README.md`](demos/manual-agent-loop/README.md) for the demo's
two paths (interactive + the by-hand `wire/` walkthrough) and provider options.
