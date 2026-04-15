import { describe, it, expect } from 'vitest'
import { createInMemoryMemory } from '../src/memory'
import type { Message } from '../src/types'

const sampleMessage: Message = {
  id: 'test-1',
  role: 'user',
  content: 'hello',
  status: 'complete',
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

describe('createInMemoryMemory', () => {
  it('starts empty by default', async () => {
    const mem = createInMemoryMemory()
    expect(await mem.load()).toEqual([])
  })

  it('starts with initial messages', async () => {
    const mem = createInMemoryMemory([sampleMessage])
    const loaded = await mem.load()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].content).toBe('hello')
  })

  it('save then load round-trips', async () => {
    const mem = createInMemoryMemory()
    await mem.save([sampleMessage])
    const loaded = await mem.load()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('test-1')
  })

  it('clear empties messages', async () => {
    const mem = createInMemoryMemory([sampleMessage])
    await mem.clear!()
    expect(await mem.load()).toEqual([])
  })

  it('returns copies, not references', async () => {
    const mem = createInMemoryMemory([sampleMessage])
    const loaded1 = await mem.load()
    const loaded2 = await mem.load()
    expect(loaded1).not.toBe(loaded2)
  })
})
