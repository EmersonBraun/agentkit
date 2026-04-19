import { writable, type Readable } from 'svelte/store'
import { createChatController } from '@agentskit/core'
import type { ChatConfig, ChatController, ChatState } from '@agentskit/core'

export interface SvelteChatStore extends Readable<ChatState> {
  send: ChatController['send']
  stop: ChatController['stop']
  retry: ChatController['retry']
  edit: ChatController['edit']
  regenerate: ChatController['regenerate']
  setInput: ChatController['setInput']
  clear: ChatController['clear']
  approve: ChatController['approve']
  deny: ChatController['deny']
  /** Tear down subscriptions when the store leaves scope. */
  destroy: () => void
}

/**
 * Svelte 5 chat store. Subscribes to a `ChatController`; Svelte's
 * `$store` auto-subscription exposes the current `ChatState`, while
 * the attached action methods drive the controller.
 *
 * Peer dep: `svelte ^5`.
 */
export function createChatStore(config: ChatConfig): SvelteChatStore {
  const controller = createChatController(config)
  const store = writable<ChatState>(controller.getState())
  const unsubscribe = controller.subscribe(() => store.set(controller.getState()))

  return {
    subscribe: store.subscribe,
    send: controller.send,
    stop: controller.stop,
    retry: controller.retry,
    edit: controller.edit,
    regenerate: controller.regenerate,
    setInput: controller.setInput,
    clear: controller.clear,
    approve: controller.approve,
    deny: controller.deny,
    destroy: unsubscribe,
  }
}
