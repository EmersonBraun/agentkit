import { describe, expect, it } from 'vitest'
import { useChat } from '../src'

describe('@agentskit/react-native', () => {
  it('exports useChat', () => {
    expect(typeof useChat).toBe('function')
  })
})
