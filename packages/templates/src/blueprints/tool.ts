import { camelCase } from './utils'

export function generateToolSource(name: string): string {
  return `import type { ToolDefinition } from '@agentskit/core'

export function ${camelCase(name)}(): ToolDefinition {
  return {
    name: '${name}',
    description: 'TODO: describe what this tool does',
    tags: [],
    category: 'custom',
    schema: {
      type: 'object',
      properties: {
        // TODO: define input parameters
      },
      required: [],
    },
    execute: async (args) => {
      // TODO: implement tool logic
      return 'not implemented'
    },
  }
}
`
}

export function generateToolTest(name: string): string {
  return `import { describe, it, expect } from 'vitest'
import { ${camelCase(name)} } from '../src/index'

describe('${name}', () => {
  it('satisfies ToolDefinition contract', () => {
    const tool = ${camelCase(name)}()
    expect(tool.name).toBe('${name}')
    expect(tool.description).toBeTruthy()
    expect(tool.schema).toBeDefined()
    expect(tool.execute).toBeTypeOf('function')
  })
})
`
}
