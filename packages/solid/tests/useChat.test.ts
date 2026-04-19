import { describe, expect, it } from 'vitest'
import { useChat } from '../src'

describe('@agentskit/solid', () => {
  it('exports useChat', () => {
    expect(typeof useChat).toBe('function')
  })
})
