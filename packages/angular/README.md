# @agentskit/angular

Angular 18+ service (Signal + RxJS) + headless chat components. Same `ChatReturn` contract every AgentsKit framework binding ships.

[![npm version](https://img.shields.io/npm/v/@agentskit/angular?color=blue)](https://www.npmjs.com/package/@agentskit/angular)
[![npm downloads](https://img.shields.io/npm/dm/@agentskit/angular)](https://www.npmjs.com/package/@agentskit/angular)
[![bundle size](https://img.shields.io/bundlejs/size/@agentskit/angular?label=bundle)](https://bundlejs.com/?q=@agentskit/angular)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![stability](https://img.shields.io/badge/stability-stable-brightgreen)](../../docs/STABILITY.md)
[![GitHub stars](https://img.shields.io/github/stars/AgentsKit-io/agentskit?style=social)](https://github.com/AgentsKit-io/agentskit)

**Tags:** `ai` · `agents` · `llm` · `agentskit` · `angular` · `signals` · `rxjs` · `chat` · `streaming`

## Why

- **One contract, every framework** — `AgentskitChat` service surfaces the exact same shape as the React / Vue / Svelte / Solid / RN / Ink bindings.
- **Angular-native reactivity** — state exposed as `Signal`; events as RxJS `Observable`.
- **Headless by default** — components emit `data-ak-*` attributes; style with your design system.
- **Streaming, tools, HITL** — all core features work identically to `@agentskit/react`.

## Install

```bash
npm install @agentskit/angular @agentskit/adapters
```

Peers: `@angular/core ^18 || ^19 || ^20`, `rxjs ^7`.

## Quick example

```ts
import { Component, inject } from '@angular/core'
import { AgentskitChat, ChatContainerComponent, MessageComponent, InputBarComponent } from '@agentskit/angular'
import { anthropic } from '@agentskit/adapters'

@Component({
  standalone: true,
  imports: [ChatContainerComponent, MessageComponent, InputBarComponent],
  template: `
    <ak-chat-container>
      @for (m of chat.messages(); track m.id) {
        <ak-message [message]="m" />
      }
      <ak-input-bar [chat]="chat" />
    </ak-chat-container>
  `,
})
export class ChatWidget {
  chat = inject(AgentskitChat).configure({
    adapter: anthropic({ apiKey: process.env.NG_APP_ANTHROPIC_API_KEY!, model: 'claude-sonnet-4-6' }),
  })
}
```

## API

- `AgentskitChat` service — DI-friendly; `configure(config)` returns `ChatReturn` with `Signal` state + RxJS events.
- Headless components: `<ak-chat-container>`, `<ak-message>`, `<ak-input-bar>`, `<ak-tool-call-view>`, `<ak-tool-confirmation>`, `<ak-thinking-indicator>`.

## Ecosystem

| Package | Role |
|---------|------|
| [@agentskit/core](https://www.npmjs.com/package/@agentskit/core) | `ChatReturn` contract |
| [@agentskit/adapters](https://www.npmjs.com/package/@agentskit/adapters) | LLM providers |
| [@agentskit/tools](https://www.npmjs.com/package/@agentskit/tools) | Built-in + integration tools |
| [@agentskit/memory](https://www.npmjs.com/package/@agentskit/memory) | Chat + vector backends |
| [@agentskit/react](https://www.npmjs.com/package/@agentskit/react) · [vue](https://www.npmjs.com/package/@agentskit/vue) · [svelte](https://www.npmjs.com/package/@agentskit/svelte) · [solid](https://www.npmjs.com/package/@agentskit/solid) · [react-native](https://www.npmjs.com/package/@agentskit/react-native) · [ink](https://www.npmjs.com/package/@agentskit/ink) | Same contract, different host |

## Contributors

<a href="https://github.com/AgentsKit-io/agentskit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AgentsKit-io/agentskit" alt="AgentsKit contributors" />
</a>

## License

MIT — see [LICENSE](../../LICENSE).

## Docs

[Full documentation](https://www.agentskit.io/docs/packages/angular) · [GitHub](https://github.com/AgentsKit-io/agentskit)
