---
'@agentskit/core': minor
'@agentskit/adapters': minor
'@agentskit/cli': minor
---

Phase 2 sprint S13 — issues #143, #144, #145.

- `@agentskit/core` — `AgentSchema` + `validateAgentSchema` +
  `parseAgentSchema` (JSON by default, bring-your-own YAML parser via
  `options.parser`) + `renderAgentSchemaModule`. Declarative,
  diffable agent definitions with per-field validation.
- `@agentskit/cli` — new `agentskit ai "<description>"` command and
  programmatic helpers (`scaffoldAgent`, `writeScaffold`,
  `createAdapterPlanner`) that turn a natural-language description
  into a validated `AgentSchema`, `agent.json` / `agent.ts`, per-tool
  stubs, and a README.
- `@agentskit/adapters` — `createRouter({ candidates, policy,
  classify, onRoute })` builds an `AdapterFactory` that picks one of
  N candidates per request. Built-in policies: `cheapest` / `fastest`
  / `capability-match`; accepts a custom sync or async picker.
  Filters by request capabilities (e.g. tools) before ranking.
