import { describe, it, expect } from 'vitest'
import { shell } from '../src/shell'
import { executeToolCall } from '@agentskit/core'
import type { ToolCall } from '@agentskit/core'

const baseCall: ToolCall = { id: '1', name: 'shell', args: {}, status: 'running' }
const ctx = { messages: [], call: baseCall }

describe('shell', () => {
  it('satisfies ToolDefinition contract', () => {
    const tool = shell()
    expect(tool.name).toBe('shell')
    expect(tool.description).toBeTruthy()
    expect(tool.schema).toBeDefined()
    expect(tool.tags).toContain('shell')
    expect(tool.category).toBe('execution')
    expect(tool.execute).toBeDefined()
  })

  it('executes a simple command via executeToolCall (streaming)', async () => {
    const tool = shell()
    const result = await executeToolCall(tool, { command: 'echo hello' }, ctx)
    expect(result).toContain('hello')
    expect(result).toContain('[exit code: 0]')
  })

  it('captures stderr', async () => {
    const tool = shell()
    const result = await executeToolCall(tool, { command: 'echo error >&2' }, ctx)
    expect(result).toContain('[stderr]')
    expect(result).toContain('error')
  })

  it('streams output incrementally', async () => {
    const tool = shell()
    const partials: string[] = []
    await executeToolCall(
      tool,
      { command: 'echo line1 && echo line2' },
      ctx,
      (partial) => { partials.push(partial) },
    )
    // Should have received incremental updates
    expect(partials.length).toBeGreaterThanOrEqual(1)
  })

  it('returns error for empty command', async () => {
    const tool = shell()
    const result = await executeToolCall(tool, { command: '' }, ctx)
    expect(result).toContain('Error')
  })

  it('rejects commands not in allow list', async () => {
    const tool = shell({ allowed: ['ls', 'echo'] })
    const result = await executeToolCall(tool, { command: 'rm -rf /' }, ctx)
    expect(result).toContain('not allowed')
    expect(result).toContain('ls, echo')
  })

  it('allows commands in allow list', async () => {
    const tool = shell({ allowed: ['echo'] })
    const result = await executeToolCall(tool, { command: 'echo allowed' }, ctx)
    expect(result).toContain('allowed')
    expect(result).toContain('[exit code: 0]')
  })

  it('enforces timeout', async () => {
    const tool = shell({ timeout: 500 })
    const result = await executeToolCall(tool, { command: 'sleep 10' }, ctx)
    expect(result).toContain('timed out')
  }, 10_000)

  it('reports non-zero exit code', async () => {
    const tool = shell()
    const result = await executeToolCall(tool, { command: 'exit 42' }, ctx)
    expect(result).toContain('[exit code: 42]')
  })

  it('dispose kills running process', async () => {
    const tool = shell()
    // Start a long-running command
    const promise = executeToolCall(tool, { command: 'sleep 60' }, ctx)
    // Give it time to start
    await new Promise(r => setTimeout(r, 100))
    // Dispose should kill it
    await tool.dispose!()
    const result = await promise
    expect(result).toBeTruthy()
  }, 10_000)
})
