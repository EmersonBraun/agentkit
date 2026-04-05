import { spawn, type ChildProcess } from 'node:child_process'
import type { ToolDefinition } from '@agentskit/core'

export interface ShellConfig {
  timeout?: number
  allowed?: string[]
  maxOutput?: number
}

export function shell(config: ShellConfig = {}): ToolDefinition {
  const { timeout = 30_000, allowed, maxOutput = 1_000_000 } = config
  let currentProcess: ChildProcess | null = null

  return {
    name: 'shell',
    description: 'Execute a shell command and stream the output. Returns stdout and stderr.',
    tags: ['shell', 'command'],
    category: 'execution',
    schema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The shell command to execute' },
      },
      required: ['command'],
    },
    dispose: async () => {
      if (currentProcess && !currentProcess.killed) {
        currentProcess.kill('SIGTERM')
        currentProcess = null
      }
    },
    async *execute(args) {
      const command = String(args.command ?? '')
      if (!command) {
        yield 'Error: command is required'
        return
      }

      // Check allow list
      if (allowed) {
        const firstWord = command.trim().split(/\s+/)[0]
        if (!allowed.includes(firstWord)) {
          yield `Error: command "${firstWord}" is not allowed. Allowed: ${allowed.join(', ')}`
          return
        }
      }

      const proc = spawn(command, {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      currentProcess = proc

      let totalOutput = 0
      let killed = false

      // Timeout
      const timer = setTimeout(() => {
        if (!proc.killed) {
          killed = true
          proc.kill('SIGTERM')
        }
      }, timeout)

      try {
        // Merge stdout and stderr into a single async iterable
        const output: string[] = []
        let resolveNext: (() => void) | null = null
        let done = false

        const push = (chunk: string) => {
          totalOutput += chunk.length
          if (totalOutput > maxOutput) {
            if (!proc.killed) {
              killed = true
              proc.kill('SIGTERM')
            }
            return
          }
          output.push(chunk)
          resolveNext?.()
        }

        proc.stdout?.on('data', (data: Buffer) => push(data.toString()))
        proc.stderr?.on('data', (data: Buffer) => push(`[stderr] ${data.toString()}`))

        proc.on('close', () => {
          done = true
          resolveNext?.()
        })

        while (!done) {
          if (output.length > 0) {
            yield output.shift()!
          } else {
            await new Promise<void>(r => { resolveNext = r })
            resolveNext = null
          }
        }

        // Flush remaining
        while (output.length > 0) {
          yield output.shift()!
        }

        if (killed && totalOutput > maxOutput) {
          yield `\n[truncated: output exceeded ${maxOutput} bytes]`
        } else if (killed) {
          yield `\n[killed: command timed out after ${timeout}ms]`
        }

        const exitCode = proc.exitCode ?? -1
        yield `\n[exit code: ${exitCode}]`
      } finally {
        clearTimeout(timer)
        currentProcess = null
      }
    },
  }
}
