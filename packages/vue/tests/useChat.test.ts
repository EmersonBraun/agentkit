import { describe, expect, it } from 'vitest'
import { useChat } from '../src'
import { ChatContainer } from '../src'

describe('@agentskit/vue', () => {
  it('exports useChat + ChatContainer', () => {
    expect(typeof useChat).toBe('function')
    expect(ChatContainer).toBeDefined()
  })
})
