import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { shadcnRegistry } from '../src/shadcn'

const here = dirname(fileURLToPath(import.meta.url))

describe('shadcnRegistry', () => {
  it('is a pass-through helper that preserves the manifest shape', () => {
    const cfg = { name: 'test', items: [] }
    expect(shadcnRegistry(cfg)).toBe(cfg)
  })

  it('the shipped registry.json is valid shadcn-compatible JSON', () => {
    const path = resolve(here, '../src/shadcn/registry.json')
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as {
      name: string
      items: Array<{ name: string; type: string; files: Array<{ content: string }> }>
    }
    expect(parsed.name).toBe('agentskit')
    expect(parsed.items.length).toBeGreaterThan(0)
    const chat = parsed.items.find(i => i.name === 'agentskit-chat')
    expect(chat).toBeDefined()
    expect(chat!.files[0]!.content).toContain('useChat')
  })
})
