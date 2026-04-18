import { describe, expect, it } from 'vitest'
import {
  parseAgentSchema,
  renderAgentSchemaModule,
  validateAgentSchema,
} from '../src/agent-schema'

const minimal = {
  name: 'my-agent',
  model: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
}

describe('validateAgentSchema', () => {
  it('accepts a minimal schema', () => {
    const s = validateAgentSchema(minimal)
    expect(s.name).toBe('my-agent')
    expect(s.model.provider).toBe('anthropic')
  })

  it('accepts a full schema', () => {
    const full = {
      name: 'full',
      description: 'does stuff',
      systemPrompt: 'be kind',
      model: { provider: 'openai', model: 'gpt-5', temperature: 0.5, maxTokens: 1000, baseUrl: 'https://x.y' },
      tools: [
        {
          name: 'search',
          description: 'search',
          schema: { type: 'object' },
          implementation: 'fetch(...)',
          requiresConfirmation: true,
          tags: ['web'],
        },
      ],
      memory: { kind: 'localStorage', key: 'sess', options: { maxAge: 3600 } },
      skills: ['researcher'],
      metadata: { owner: 'me' },
    }
    const s = validateAgentSchema(full)
    expect(s.tools?.[0]!.name).toBe('search')
    expect(s.memory?.kind).toBe('localStorage')
  })

  it('rejects non-object root', () => {
    expect(() => validateAgentSchema(42)).toThrow(/root must be an object/)
  })

  it('rejects invalid name', () => {
    expect(() => validateAgentSchema({ ...minimal, name: '1bad!' })).toThrow(/name must match/)
  })

  it('rejects missing model', () => {
    expect(() => validateAgentSchema({ name: 'x' })).toThrow(/model is required/)
  })

  it('rejects bad model.provider', () => {
    expect(() => validateAgentSchema({ ...minimal, model: {} })).toThrow(/provider is required/)
  })

  it('rejects duplicate tool names', () => {
    expect(() =>
      validateAgentSchema({
        ...minimal,
        tools: [{ name: 'x' }, { name: 'x' }],
      }),
    ).toThrow(/duplicate tool name/)
  })

  it('rejects malformed tool name', () => {
    expect(() =>
      validateAgentSchema({
        ...minimal,
        tools: [{ name: '' }],
      }),
    ).toThrow(/name must match/)
  })

  it('rejects invalid memory.kind', () => {
    expect(() =>
      validateAgentSchema({ ...minimal, memory: { kind: 'redis' } }),
    ).toThrow(/memory.kind/)
  })

  it('rejects wrong-typed fields', () => {
    expect(() => validateAgentSchema({ ...minimal, description: 42 })).toThrow(/description/)
    expect(() => validateAgentSchema({ ...minimal, systemPrompt: [] })).toThrow(/systemPrompt/)
    expect(() => validateAgentSchema({ ...minimal, tools: 'x' })).toThrow(/tools must be/)
    expect(() => validateAgentSchema({ ...minimal, skills: [1, 2] })).toThrow(/skills must be/)
    expect(() => validateAgentSchema({ ...minimal, metadata: 'x' })).toThrow(/metadata/)
  })

  it('validates nested model fields', () => {
    expect(() =>
      validateAgentSchema({ ...minimal, model: { provider: 'x', temperature: 'hot' } }),
    ).toThrow(/temperature/)
  })
})

describe('parseAgentSchema', () => {
  it('parses JSON by default', () => {
    const s = parseAgentSchema(JSON.stringify(minimal))
    expect(s.name).toBe('my-agent')
  })

  it('uses a custom parser', () => {
    const s = parseAgentSchema('whatever', { parser: () => minimal })
    expect(s.model.provider).toBe('anthropic')
  })
})

describe('renderAgentSchemaModule', () => {
  it('returns a TS module string', () => {
    const s = validateAgentSchema(minimal)
    const src = renderAgentSchemaModule(s)
    expect(src).toContain('export const agent =')
    expect(src).toContain('satisfies AgentSchema')
    expect(src).toContain('my-agent')
  })
})
