# @agentskit/react-native

React Native / Expo hook + headless chat components. Metro-safe (no DOM deps). Same `ChatReturn` contract every AgentsKit framework binding ships.

[![npm version](https://img.shields.io/npm/v/@agentskit/react-native?color=blue)](https://www.npmjs.com/package/@agentskit/react-native)
[![npm downloads](https://img.shields.io/npm/dm/@agentskit/react-native)](https://www.npmjs.com/package/@agentskit/react-native)
[![bundle size](https://img.shields.io/bundlejs/size/@agentskit/react-native?label=bundle)](https://bundlejs.com/?q=@agentskit/react-native)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![stability](https://img.shields.io/badge/stability-stable-brightgreen)](../../docs/STABILITY.md)
[![GitHub stars](https://img.shields.io/github/stars/AgentsKit-io/agentskit?style=social)](https://github.com/AgentsKit-io/agentskit)

**Tags:** `ai` · `agents` · `llm` · `agentskit` · `react-native` · `expo` · `mobile` · `chat` · `streaming`

## Why

- **One contract, every framework** — `useChat` returns the exact same shape as the web React / Vue / Svelte / Solid / Angular / Ink bindings.
- **Metro-safe** — no DOM APIs; works on iOS, Android, and Expo out of the box.
- **Native components** — `<ChatContainer>` wraps `ScrollView`, `<InputBar>` wraps `TextInput`, all theme-aware.
- **Streaming, tools, HITL** — all core features work identically to `@agentskit/react`.

## Install

```bash
npm install @agentskit/react-native @agentskit/adapters
```

Peers: `react`, `react-native`.

## Quick example

```tsx
import { useChat, ChatContainer, Message, InputBar } from '@agentskit/react-native'
import { anthropic } from '@agentskit/adapters'

export function Chat() {
  const chat = useChat({
    adapter: anthropic({ apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!, model: 'claude-sonnet-4-6' }),
  })

  return (
    <ChatContainer>
      {chat.messages.map((m) => <Message key={m.id} message={m} />)}
      <InputBar chat={chat} />
    </ChatContainer>
  )
}
```

## API

- `useChat(config)` — hook returning `ChatReturn` (DOM-free).
- Headless components: `ChatContainer`, `Message`, `InputBar`, `ToolCallView`, `ToolConfirmation`, `ThinkingIndicator`.

## Ecosystem

| Package | Role |
|---------|------|
| [@agentskit/core](https://www.npmjs.com/package/@agentskit/core) | `ChatReturn` contract |
| [@agentskit/adapters](https://www.npmjs.com/package/@agentskit/adapters) | LLM providers |
| [@agentskit/tools](https://www.npmjs.com/package/@agentskit/tools) | Built-in + integration tools |
| [@agentskit/memory](https://www.npmjs.com/package/@agentskit/memory) | Chat + vector backends |
| [@agentskit/react](https://www.npmjs.com/package/@agentskit/react) · [vue](https://www.npmjs.com/package/@agentskit/vue) · [svelte](https://www.npmjs.com/package/@agentskit/svelte) · [solid](https://www.npmjs.com/package/@agentskit/solid) · [angular](https://www.npmjs.com/package/@agentskit/angular) · [ink](https://www.npmjs.com/package/@agentskit/ink) | Same contract, different host |

## Contributors

<a href="https://github.com/AgentsKit-io/agentskit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AgentsKit-io/agentskit" alt="AgentsKit contributors" />
</a>

## License

MIT — see [LICENSE](../../LICENSE).

## Docs

[Full documentation](https://www.agentskit.io/docs/packages/react-native) · [GitHub](https://github.com/AgentsKit-io/agentskit)
