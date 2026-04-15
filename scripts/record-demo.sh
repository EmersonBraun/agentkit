#!/usr/bin/env bash
# Record a real asciinema demo and convert it to GIF.
# Optional — the animated SVG at apps/docs-next/public/demo-init.svg is the default.
#
# Prereqs:
#   brew install asciinema agg            # macOS
#   # or: cargo install --git https://github.com/asciinema/agg  (any OS)
#
# Usage:
#   ./scripts/record-demo.sh
#
# Output: apps/docs-next/public/demo-init.gif

set -euo pipefail

OUT_DIR="apps/docs-next/public"
CAST="$OUT_DIR/demo-init.cast"
GIF="$OUT_DIR/demo-init.gif"

command -v asciinema >/dev/null || { echo "Install asciinema: brew install asciinema"; exit 1; }
command -v agg >/dev/null || { echo "Install agg: brew install agg"; exit 1; }

echo "Recording. Run these commands, then type 'exit' to stop:"
echo ""
echo "   npx @agentskit/cli init     # pick react / openai / file / pnpm"
echo "   cd my-agent && pnpm dev"
echo ""
echo "Press Enter to start recording..."
read -r

asciinema rec -i 1.5 --overwrite "$CAST"

echo ""
echo "Converting to GIF..."
agg \
  --cols 100 \
  --rows 28 \
  --font-family "SF Mono,Menlo,monospace" \
  --font-size 14 \
  --theme 0d1117,e6edf3,161b22,f85149,2ea043,d29922,58a6ff,a371f7,39c5cf,e6edf3,6e7681,f85149,2ea043,d29922,58a6ff,a371f7,39c5cf,e6edf3 \
  "$CAST" "$GIF"

echo ""
echo "✓ Demo written to $GIF"
