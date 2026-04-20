# @agentskit/vue

Vue 3 composable + headless chat components. Same `ChatReturn` contract every AgentsKit framework binding ships — swap frameworks without changing your agent.

[![npm version](https://img.shields.io/npm/v/@agentskit/vue?color=blue)](https://www.npmjs.com/package/@agentskit/vue)
[![npm downloads](https://img.shields.io/npm/dm/@agentskit/vue)](https://www.npmjs.com/package/@agentskit/vue)
[![bundle size](https://img.shields.io/bundlejs/size/@agentskit/vue?label=bundle)](https://bundlejs.com/?q=@agentskit/vue)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![stability](https://img.shields.io/badge/stability-stable-brightgreen)](../../docs/STABILITY.md)
[![GitHub stars](https://img.shields.io/github/stars/AgentsKit-io/agentskit?style=social)](https://github.com/AgentsKit-io/agentskit)

**Tags:** `ai` · `agents` · `llm` · `agentskit` · `vue` · `vue3` · `composable` · `chat` · `streaming`

## Why

- **One contract, every framework** — `useChat` returns the exact same shape as the React / Svelte / Solid / Angular / RN / Ink bindings.
- **Composition API native** — values surface as `ref`s; drops into `<script setup>` with zero glue.
- **Headless by default** — components emit `data-ak-*` attributes; bring your own styling.
- **Streaming, tools, HITL** — all core features work identically to `@agentskit/react`.

## Install

```bash
npm install @agentskit/vue @agentskit/adapters
```

Peers: `vue ^3.4`.

## Quick example

```vue
<script setup lang="ts">
import { useChat, ChatContainer, Message, InputBar } from '@agentskit/vue'
import { anthropic } from '@agentskit/adapters'

const chat = useChat({
  adapter: anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY, model: 'claude-sonnet-4-6' }),
})
</script>

<template>
  <ChatContainer>
    <Message v-for="m in chat.messages.value" :key="m.id" :message="m" />
    <InputBar :chat="chat" />
  </ChatContainer>
</template>
```

## API

- `useChat(config)` — composable returning `ChatReturn` (messages, status, send, retry, stop, clear, approve, deny, edit).
- Headless components: `<ChatContainer>`, `<Message>`, `<InputBar>`, `<ToolCallView>`, `<ToolConfirmation>`, `<ThinkingIndicator>`.

## Ecosystem

| Package | Role |
|---------|------|
| [@agentskit/core](https://www.npmjs.com/package/@agentskit/core) | `ChatReturn` contract |
| [@agentskit/adapters](https://www.npmjs.com/package/@agentskit/adapters) | LLM providers |
| [@agentskit/tools](https://www.npmjs.com/package/@agentskit/tools) | Built-in + integration tools |
| [@agentskit/memory](https://www.npmjs.com/package/@agentskit/memory) | Chat + vector backends |
| [@agentskit/react](https://www.npmjs.com/package/@agentskit/react) · [svelte](https://www.npmjs.com/package/@agentskit/svelte) · [solid](https://www.npmjs.com/package/@agentskit/solid) · [react-native](https://www.npmjs.com/package/@agentskit/react-native) · [angular](https://www.npmjs.com/package/@agentskit/angular) · [ink](https://www.npmjs.com/package/@agentskit/ink) | Same contract, different host |

## Contributors

<a href="https://github.com/AgentsKit-io/agentskit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AgentsKit-io/agentskit" alt="AgentsKit contributors" />
</a>

## License

MIT — see [LICENSE](../../LICENSE).

## Docs

[Full documentation](https://www.agentskit.io/docs/packages/vue) · [GitHub](https://github.com/AgentsKit-io/agentskit)
