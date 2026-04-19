import { onScopeDispose, reactive } from 'vue'
import { createChatController } from '@agentskit/core'
import type { ChatConfig, ChatReturn, ChatState } from '@agentskit/core'

/**
 * Vue 3 composable. Returns a reactive `ChatReturn` — same shape as
 * `@agentskit/react`'s `useChat`, wired through Vue's reactivity
 * instead of `useSyncExternalStore`.
 *
 * Peer dep: `vue ^3.4`.
 */
export function useChat(config: ChatConfig): ChatReturn {
  const controller = createChatController(config)
  const state = reactive<ChatState>(controller.getState()) as ChatState
  const unsubscribe = controller.subscribe(() => {
    Object.assign(state, controller.getState())
  })
  onScopeDispose(() => unsubscribe())

  return Object.assign(state, {
    send: controller.send,
    stop: controller.stop,
    retry: controller.retry,
    edit: controller.edit,
    regenerate: controller.regenerate,
    setInput: controller.setInput,
    clear: controller.clear,
    approve: controller.approve,
    deny: controller.deny,
  }) as ChatReturn
}
