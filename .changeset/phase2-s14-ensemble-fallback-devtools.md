---
'@agentskit/adapters': minor
'@agentskit/observability': minor
---

Phase 2 sprint S14 — issues #146, #147, #148.

- `@agentskit/adapters` — `createEnsembleAdapter` fans a request out
  to N candidates in parallel and aggregates into one text output.
  Aggregators: `majority-vote` (weighted), `concat`, `longest`, or
  custom fn. Per-branch timeouts and `onBranches` observability.
- `@agentskit/adapters` — `createFallbackAdapter` takes an ordered
  list of adapters and falls through on open/first-chunk errors
  (or zero-chunk responses). Once committed, mid-stream errors
  propagate — no duplicate tool calls. `shouldRetry` and
  `onFallback` hooks.
- `@agentskit/observability` — `createDevtoolsServer` +
  `toSseFrame` form a transport-agnostic pub/sub hub for
  `AgentEvent`s. Plug the returned observer into a runtime and
  attach any client (SSE response / WebSocket / in-process sink).
  New clients receive a `hello` envelope, replay of the ring
  buffer, then the live feed — the contract a browser devtools
  extension speaks against.
