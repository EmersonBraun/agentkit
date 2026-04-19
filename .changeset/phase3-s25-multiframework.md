---
'@agentskit/framework-adapters': minor
---

Phase 3 sprint S25 — issues #184, #185, #186.

New package `@agentskit/framework-adapters` with per-framework
reactivity bindings for the shared `ChatController` plus a
shadcn/ui registry manifest.

- `@agentskit/framework-adapters/vue` — Vue 3 `useChat` composable
  (peer `vue ^3.4`).
- `@agentskit/framework-adapters/svelte` — Svelte 5 `createChatStore`
  (peer `svelte ^5`).
- `@agentskit/framework-adapters/solid` — Solid `useChat` hook
  (peer `solid-js ^1.8`).
- `@agentskit/framework-adapters/rn` — React Native / Expo `useChat`
  (peer `react ^18 || ^19`, `react-native *`). Mirrors the React
  hook without DOM-specific imports so Metro / Hermes can bundle it.
- `@agentskit/framework-adapters/shadcn/registry.json` — shadcn/ui
  v0.3 registry manifest exposing `agentskit-chat` as an installable
  component. Build step copies the JSON into `dist/shadcn/` so it's
  reachable via the package export.

All peers are optional — consumers install only the framework they
use.
