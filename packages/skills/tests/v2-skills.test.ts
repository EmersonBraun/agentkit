import { describe, it, expect } from 'vitest'
import { translator, translatorWithGlossary, researcher, dataAnalyst } from '../src/index'

describe('translator (v2 — glossary-aware)', () => {
  it('default exports the bare-glossary instance', () => {
    expect(translator.name).toBe('translator')
    expect(translator.systemPrompt).toMatch(/No glossary supplied/)
  })

  it('inlines glossary entries verbatim into the prompt', () => {
    const skill = translatorWithGlossary([
      { term: 'AgentsKit', translation: 'AgentsKit' },
      { term: 'agent', translation: 'agente', context: 'product UI only' },
    ])
    expect(skill.systemPrompt).toMatch(/"AgentsKit" → "AgentsKit"/)
    expect(skill.systemPrompt).toMatch(/"agent" → "agente"/)
    expect(skill.systemPrompt).toMatch(/product UI only/)
  })

  it('makes glossary the highest priority', () => {
    const skill = translatorWithGlossary([{ term: 'x', translation: 'y' }])
    expect(skill.systemPrompt).toMatch(/highest priority/i)
  })

  it('keeps formatting + register rules from v1', () => {
    expect(translator.systemPrompt).toMatch(/markdown.*code blocks/)
    expect(translator.systemPrompt).toMatch(/Match the source/)
  })
})

describe('researcher (v2 — citation-first)', () => {
  it('mandates inline citations', () => {
    expect(researcher.systemPrompt).toMatch(/[Ii]nline.*citations?|\[1\]/)
    expect(researcher.systemPrompt).toMatch(/[Ee]very.*claim.*citation/i)
  })

  it('prefers primary sources', () => {
    expect(researcher.systemPrompt).toMatch(/[Pp]rimary sources/)
  })

  it('flags contradictions instead of silently picking', () => {
    expect(researcher.systemPrompt).toMatch(/[Cc]ontradictions?/)
  })

  it('few-shot output uses inline numbered citations', () => {
    const example = researcher.examples?.[0]?.output ?? ''
    expect(example).toMatch(/\[1\]/)
    expect(example).toMatch(/## Sources/)
  })
})

describe('dataAnalyst (v2 — tabular-aware)', () => {
  it('inspects schema before writing SQL', () => {
    expect(dataAnalyst.systemPrompt).toMatch(/[Ii]nspect schema/)
  })

  it('prefers distributions over means', () => {
    expect(dataAnalyst.systemPrompt).toMatch(/[Dd]istributions? over means|median/i)
  })

  it('flags survivorship + selection bias', () => {
    expect(dataAnalyst.systemPrompt).toMatch(/[Ss]urvivorship/)
    expect(dataAnalyst.systemPrompt).toMatch(/[Ss]election bias/)
  })

  it('ships at least one tabular few-shot', () => {
    expect(dataAnalyst.examples).toBeDefined()
    expect(dataAnalyst.examples!.length).toBeGreaterThan(0)
  })
})
