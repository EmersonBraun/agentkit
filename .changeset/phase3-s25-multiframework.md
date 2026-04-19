---
'@agentskit/vue': minor
'@agentskit/svelte': minor
'@agentskit/solid': minor
'@agentskit/react-native': minor
'@agentskit/angular': minor
---

Phase 3 sprint S25 — issues #184, #185, #186.

Five new packages, one per framework, each mirroring the
`@agentskit/react` contract (same `ChatReturn` surface, same
action methods, same headless `data-ak-*` attributes):

- `@agentskit/vue` — Vue 3 `useChat` composable + `ChatContainer`
  component (peer `vue ^3.4`).
- `@agentskit/svelte` — Svelte 5 `createChatStore` (peer `svelte ^5`).
- `@agentskit/solid` — Solid `useChat` hook (peer `solid-js ^1.8`).
- `@agentskit/react-native` — React Native / Expo `useChat` hook
  (peers `react ^18|^19`, `react-native *`). Pure React, Metro /
  Hermes safe.
- `@agentskit/angular` — `AgentskitChat` service exposing state as a
  Signal + RxJS Observable (peers `@angular/core ^18|^19|^20`,
  `rxjs ^7`).
