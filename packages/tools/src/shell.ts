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
        currentProcess.kill('SIGKILL')
        currentProcess = null
      }
    },
    async *execute(args) {
      const command = String(args.command ?? '')
      if (!command) {
        yield 'Error: command is required'
        return
      }

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
      let timedOut = false

      const timer = setTimeout(() => {
        timedOut = true
        if (!proc.killed) proc.kill('SIGKILL')
      }, timeout)

      try {
        // Collect all output then yield — simpler and more reliable across platforms
        const chunks: string[] = []

        const onData = (prefix: string) => (data: Buffer) => {
          const text = data.toString()
          totalOutput += text.length
          if (totalOutput <= maxOutput) {
            chunks.push(prefix ? `${prefix}${text}` : text)
          } else if (!proc.killed) {
            proc.kill('SIGKILL')
          }
        }

        proc.stdout?.on('data', onData(''))
        proc.stderr?.on('data', onData('[stderr] '))

        // Wait for process to close
        const exitCode = await new Promise<number>((resolve) => {
          proc.on('close', (code) => resolve(code ?? -1))
          proc.on('error', () => resolve(-1))
        })

        // Yield all collected chunks
        for (const chunk of chunks) {
          yield chunk
        }

        if (timedOut) {
          yield `\n[killed: command timed out after ${timeout}ms]`
        } else if (totalOutput > maxOutput) {
          yield `\n[truncated: output exceeded ${maxOutput} bytes]`
        }

        yield `\n[exit code: ${exitCode}]`
      } finally {
        clearTimeout(timer)
        if (currentProcess && !currentProcess.killed) {
          currentProcess.kill('SIGKILL')
        }
        currentProcess = null
      }
    },
  }
}
