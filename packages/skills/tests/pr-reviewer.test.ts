import { describe, it, expect } from 'vitest'
import { prReviewer } from '../src/pr-reviewer'

describe('prReviewer', () => {
  it('satisfies the SkillDefinition contract', () => {
    expect(prReviewer.name).toBe('pr-reviewer')
    expect(prReviewer.description).toBeTruthy()
    expect(prReviewer.systemPrompt).toBeTruthy()
    expect(prReviewer.systemPrompt.length).toBeGreaterThan(200)
    expect(Array.isArray(prReviewer.tools)).toBe(true)
    expect(Array.isArray(prReviewer.delegates)).toBe(true)
  })

  it('encodes the Manifesto rules in the system prompt', () => {
    const prompt = prReviewer.systemPrompt
    expect(prompt).toMatch(/@agentskit\/core/)
    expect(prompt).toMatch(/any/)
    expect(prompt).toMatch(/Named exports/)
    expect(prompt).toMatch(/headless/)
    expect(prompt).toMatch(/data-ak-/)
  })

  it('ships the three failure-mode few-shots', () => {
    expect(prReviewer.examples).toBeDefined()
    expect(prReviewer.examples!.length).toBeGreaterThanOrEqual(3)
    for (const example of prReviewer.examples!) {
      expect(example.input).toBeTruthy()
      expect(example.output).toBeTruthy()
    }
  })

  it('suggests read_file as a tool dependency', () => {
    expect(prReviewer.tools).toContain('read_file')
  })
})
