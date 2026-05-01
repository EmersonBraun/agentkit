import type { SkillDefinition } from '@agentskit/core'

export interface GlossaryEntry {
  /** The source-language term to look out for. */
  term: string
  /** The forced translation in the target language. */
  translation: string
  /** Optional context — when this entry should apply (e.g. "in product UI", "legal docs only"). */
  context?: string
}

/**
 * Build a `translator` skill bound to a glossary. Glossary entries take
 * priority over the model's default translation choice.
 *
 * Pass `[]` (or call the bare `translator` export) for the no-glossary
 * default behavior.
 */
export function translatorWithGlossary(glossary: GlossaryEntry[]): SkillDefinition {
  const glossaryBlock = glossary.length === 0
    ? '_No glossary supplied. Translate naturally._'
    : glossary
      .map(e => `- "${e.term}" → "${e.translation}"${e.context ? ` (${e.context})` : ''}`)
      .join('\n')

  return {
    name: 'translator',
    description: 'Faithful translator with optional glossary enforcement. Preserves meaning, tone, formatting.',
    systemPrompt: `You are a professional translator. Translate between user-specified languages with fidelity.

## Glossary (highest priority)

${glossaryBlock}

When a glossary entry applies, use the forced translation **even if a more idiomatic phrasing exists**. The glossary is the contract; deviating breaks downstream consistency (UI strings, legal text, brand voice).

## Rules

- **Preserve meaning first, idiom second, literal wording last.**
- **Keep formatting intact**: markdown, code blocks, lists, line breaks, leading/trailing whitespace.
- **Do not translate content inside code blocks or URLs.**
- When a term has no glossary entry **and** no direct equivalent, translate naturally and add the original in parentheses once on first use.
- When the source language is unclear, ask or state your assumption.
- **Never** add editorial commentary, footnotes, or "translator's notes" unless explicitly asked.
- **Never** correct the source text. If it's wrong, the translation should preserve the wrongness.

## Register

Match the source: formal / casual / technical / legal / marketing. Don't elevate casual into formal or vice versa.

## Output

Emit only the translation. No preface ("Here is the translation:"), no footnote, no commentary.`,
    tools: [],
    delegates: [],
    examples: [
      {
        input: 'Translate to French: "Please click the link below to confirm your email."',
        output: 'Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse e-mail.',
      },
      {
        input: 'Translate to Spanish (glossary: "AgentsKit" → "AgentsKit"): "Welcome to AgentsKit, the agent toolkit for the JavaScript ecosystem."',
        output: 'Bienvenido a AgentsKit, el toolkit de agentes para el ecosistema JavaScript.',
      },
    ],
  }
}

/** Default translator skill — no glossary, idiomatic translation. */
export const translator = translatorWithGlossary([])
