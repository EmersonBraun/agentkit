import { camelCase } from './utils'

export function generateSkillSource(name: string): string {
  return `import type { SkillDefinition } from '@agentskit/core'

export const ${camelCase(name)}: SkillDefinition = {
  name: '${name}',
  description: 'TODO: describe what this skill does',
  systemPrompt: \`You are a ${name} assistant.

TODO: Add detailed behavioral instructions here.
\`,
  tools: [],
  delegates: [],
  examples: [
    {
      input: 'TODO: example input',
      output: 'TODO: example output',
    },
  ],
}
`
}

export function generateSkillTest(name: string): string {
  return `import { describe, it, expect } from 'vitest'
import { ${camelCase(name)} } from '../src/index'

describe('${name}', () => {
  it('satisfies SkillDefinition contract', () => {
    expect(${camelCase(name)}.name).toBe('${name}')
    expect(${camelCase(name)}.description).toBeTruthy()
    expect(${camelCase(name)}.systemPrompt.length).toBeGreaterThan(10)
  })
})
`
}
