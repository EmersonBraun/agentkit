---
'@agentskit/adapters': patch
'@agentskit/angular': patch
'@agentskit/cli': patch
'@agentskit/core': patch
'@agentskit/eval': patch
'@agentskit/ink': patch
'@agentskit/memory': patch
'@agentskit/observability': patch
'@agentskit/rag': patch
'@agentskit/react': patch
'@agentskit/react-native': patch
'@agentskit/runtime': patch
'@agentskit/sandbox': patch
'@agentskit/skills': patch
'@agentskit/solid': patch
'@agentskit/svelte': patch
'@agentskit/templates': patch
'@agentskit/tools': patch
'@agentskit/vue': patch
---

Add `license`, `homepage`, `repository`, `bugs`, `author` fields to every package.json (fixes "license missing" badge on npm). Swap bundlephobia badges for bundlejs (bundlephobia is rate-limited). Create READMEs for `vue`, `svelte`, `solid`, `react-native`, `angular`. Expand `tools` and `memory` READMEs to cover all currently shipped built-ins + wrappers (composer, self-debug, mandatory-sandbox; virtualized + auto-summarize memory).
