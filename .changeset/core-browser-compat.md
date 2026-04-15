---
'@agentskit/core': major
'@agentskit/memory': minor
'@agentskit/cli': minor
'@agentskit/react': minor
'@agentskit/ink': minor
---

Remove Node-only code from `@agentskit/core` to restore browser compatibility.

**Breaking changes in `@agentskit/core`:**

- `createFileMemory(path)` removed. Use `fileChatMemory(path)` from `@agentskit/memory` instead.
- `loadConfig(options?)` and the `AgentsKitConfig` / `LoadConfigOptions` types removed. Use `loadConfig` / `AgentsKitConfig` / `LoadConfigOptions` from `@agentskit/cli` instead.

**Why:**

`@agentskit/core` must work in any environment (Node, Deno, edge, browser) per Manifesto principle 1. The previous implementation imported `node:fs/promises` at module load, crashing browser consumers at runtime. Closes #281.

**Migration:**

```diff
- import { createFileMemory } from '@agentskit/core'
+ import { fileChatMemory } from '@agentskit/memory'

- const memory = createFileMemory('./history.json')
+ const memory = fileChatMemory('./history.json')
```

```diff
- import { loadConfig } from '@agentskit/core'
+ import { loadConfig } from '@agentskit/cli'
```

`createInMemoryMemory` and `createLocalStorageMemory` remain in `@agentskit/core` — both are universal.
