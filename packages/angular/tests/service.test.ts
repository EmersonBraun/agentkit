import { describe, expect, it } from 'vitest'
import { AgentskitChat } from '../src'

describe('@agentskit/angular', () => {
  it('exports AgentskitChat service', () => {
    expect(AgentskitChat).toBeDefined()
  })
})
