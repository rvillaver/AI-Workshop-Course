#!/usr/bin/env bash
# Runs once on Codespace create. Installs the agent CLIs so an AI assistant (Claude
# Code / Codex / Copilot) can drive the environment. The demos themselves need no
# install — they use Node built-ins only.
set -e

echo "▸ Installing agent CLIs (Claude Code, Codex)…"
npm install -g @anthropic-ai/claude-code @openai/codex

echo ""
echo "✅ Ready. Quick start:"
echo "   • Agent demo:  node demos/manual-agent-loop/agent_loop.mjs"
echo "   • Claude Code: claude       |   Codex: codex"
echo ""
if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "ℹ️  Set OPENROUTER_API_KEY (Codespace secret) to run the free-model agent demo."
fi
