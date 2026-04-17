---
"@agentskit/core": minor
"@agentskit/adapters": minor
"@agentskit/tools": minor
"@agentskit/ink": minor
"@agentskit/cli": minor
---

feat: web search fallback chain, fetch_url tool, session management, token counting

**tools**

- `webSearch()` now auto-picks the best available backend: Serper (if
  `SERPER_API_KEY` is set) → Tavily (if `TAVILY_API_KEY`) → unauthenticated
  DuckDuckGo HTML scrape. If the query is a URL, it's fetched directly
  without a search round-trip. Explicit `provider: 'serper' | 'tavily'`
  still requires its key and errors clearly if missing.
- New `fetchUrl()` tool: safely fetches a URL, caps response size, strips
  HTML by default.

**cli**

- `chat` without `--tools` now auto-registers `web_search` and `fetch_url`
  but wraps them with `requiresConfirmation: true`, matching the Claude
  Code permission-on-first-use pattern. `--tools web_search,fetch_url`
  opts in to auto-execution.
- Sessions are stored under `~/.agentskit/sessions/<cwd-hash>/` with per-
  session `<id>.json` + `<id>.meta.json` files. New flags: `--new` (fresh
  session), `--resume [id]` (resume specific or latest), `--list-sessions`.
  Default: resume latest session in cwd, create fresh if none.

**core**

- `ChatState.usage: TokenUsage` accumulates prompt/completion/total token
  counts across every LLM call in a session. Reset by `clear()`.
- New `StreamChunk` type: `'usage'`, carrying `{ promptTokens,
  completionTokens, totalTokens }`.
- `consumeStream` handler gains `onUsage`.
- Controller's agent loop now resumes after `approve`/`deny`, so
  confirmation-gated tools still round-trip to the model for a final
  answer (previously the loop stopped after user approval).

**adapters**

- OpenAI adapter now passes `stream_options: { include_usage: true }` and
  forwards the usage chunk.
- OpenAI / Anthropic / Gemini / Ollama parsers all emit a `usage` chunk
  when the provider surfaces token counts.

**ink**

- `StatusHeader` renders `session=…` and a live `↑ prompt / ↓ completion /
  total` token counter when usage is available.
