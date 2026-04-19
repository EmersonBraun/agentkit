import { describe, expect, it } from 'vitest'
import { createChatStore } from '../src'

describe('@agentskit/svelte', () => {
  it('exports createChatStore', () => {
    expect(typeof createChatStore).toBe('function')
  })
})
