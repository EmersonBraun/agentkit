import { describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AdapterFactory, StreamChunk } from '@agentskit/core'
import type { AgentSchema } from '@agentskit/core/agent-schema'
import { scaffoldAgent, writeScaffold, createAdapterPlanner } from '../src/ai'

const minimalSchema: AgentSchema = {
  name: 'echo-bot',
  description: 'Repeats the last user message',
  systemPrompt: 'You echo the user.',
  model: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  tools: [
    { name: 'search', description: 'web search', schema: { type: 'object' } },
    { name: 'send_email', description: 'send an email', requiresConfirmation: true },
  ],
  skills: ['researcher'],
}

function fakeAdapter(text: string): AdapterFactory {
  return {
    createSource: () => ({
      abort: () => {},
      stream: async function* () {
        yield { type: 'text', content: text } as StreamChunk
        yield { type: 'done' } as StreamChunk
      },
    }),
  }
}

describe('scaffoldAgent', () => {
  it('emits agent.json, agent.ts, README, and one tool stub each', () => {
    const files = scaffoldAgent(minimalSchema)
    const paths = files.map(f => f.path).sort()
    expect(paths).toEqual(['README.md', 'agent.json', 'agent.ts', 'tools/search.ts', 'tools/send_email.ts'])
  })

  it('agent.json round-trips the schema', () => {
    const [json] = scaffoldAgent(minimalSchema)
    const parsed = JSON.parse(json!.content) as AgentSchema
    expect(parsed.name).toBe('echo-bot')
    expect(parsed.tools).toHaveLength(2)
  })

  it('tool stubs reference defineTool with the declared name', () => {
    const files = scaffoldAgent(minimalSchema)
    const search = files.find(f => f.path === 'tools/search.ts')!
    expect(search.content).toContain("name: 'search'")
    expect(search.content).toContain('defineTool')
  })

  it('includes requiresConfirmation when set', () => {
    const files = scaffoldAgent(minimalSchema)
    const email = files.find(f => f.path === 'tools/send_email.ts')!
    expect(email.content).toContain('requiresConfirmation: true')
  })

  it('agent.ts imports and wires every tool', () => {
    const files = scaffoldAgent(minimalSchema)
    const ts = files.find(f => f.path === 'agent.ts')!
    expect(ts.content).toContain("from './tools/search'")
    expect(ts.content).toContain('sendEmail')
  })
})

describe('writeScaffold', () => {
  it('writes files to disk and reports them', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ak-ai-'))
    try {
      const files = scaffoldAgent(minimalSchema)
      const written = await writeScaffold(files, dir)
      expect(written).toHaveLength(5)
      expect(existsSync(join(dir, 'agent.json'))).toBe(true)
      expect(existsSync(join(dir, 'tools/search.ts'))).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('skips existing files unless overwrite is set', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ak-ai-'))
    try {
      await writeScaffold([{ path: 'README.md', content: 'original' }], dir)
      await writeScaffold([{ path: 'README.md', content: 'new' }], dir)
      expect(readFileSync(join(dir, 'README.md'), 'utf8')).toBe('original')
      await writeScaffold([{ path: 'README.md', content: 'overwritten' }], dir, { overwrite: true })
      expect(readFileSync(join(dir, 'README.md'), 'utf8')).toBe('overwritten')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('createAdapterPlanner', () => {
  it('parses a well-formed JSON response into AgentSchema', async () => {
    const planner = createAdapterPlanner(fakeAdapter(JSON.stringify(minimalSchema)))
    const schema = await planner('an echo bot')
    expect(schema.name).toBe('echo-bot')
  })

  it('strips markdown code fences', async () => {
    const wrapped = '```json\n' + JSON.stringify(minimalSchema) + '\n```'
    const planner = createAdapterPlanner(fakeAdapter(wrapped))
    const schema = await planner('x')
    expect(schema.model.provider).toBe('anthropic')
  })

  it('throws when response has no JSON object', async () => {
    const planner = createAdapterPlanner(fakeAdapter('sorry, cannot do that'))
    await expect(planner('x')).rejects.toThrow(/did not contain a JSON object/)
  })

  it('validates the parsed schema', async () => {
    const planner = createAdapterPlanner(fakeAdapter('{"name":"bad!!!"}'))
    await expect(planner('x')).rejects.toThrow(/Invalid agent schema/)
  })
})
