import type { AdapterFactory, AdapterRequest, Message } from '@agentskit/core'
import { validateAgentSchema, type AgentSchema } from '@agentskit/core/agent-schema'

export type AgentPlanner = (description: string) => Promise<AgentSchema>

const PLANNER_SYSTEM_PROMPT = `You design AI agents for the AgentsKit framework.
Given a user's plain-language description, return a single JSON object
matching the AgentsKit AgentSchema type. Do not include commentary or
markdown fences — emit raw JSON only.

Schema:
{
  "name": "kebab-or-snake-case",
  "description": "short summary",
  "systemPrompt": "you are...",
  "model": { "provider": "anthropic"|"openai"|"gemini"|..., "model": "..." },
  "tools": [{ "name": "search", "description": "...", "schema": {...}, "implementation": "fetch('/api/search?q=...')" }],
  "memory": { "kind": "inMemory"|"localStorage", "key": "..." },
  "skills": ["researcher", "critic"]
}

Prefer fewer well-scoped tools over many overlapping ones. Name tools
in snake_case.`

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/)
  const raw = fenced?.[1] ?? text
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('Planner response did not contain a JSON object')
  return raw.slice(start, end + 1)
}

/**
 * Turn an `AdapterFactory` into an `AgentPlanner`. The planner drives
 * the model with a fixed system prompt that asks for a JSON AgentSchema,
 * then validates the result.
 */
export function createAdapterPlanner(adapter: AdapterFactory): AgentPlanner {
  return async (description: string) => {
    const messages: Message[] = [
      { id: 'sys', role: 'system', content: PLANNER_SYSTEM_PROMPT, status: 'complete', createdAt: new Date(0) },
      { id: 'user', role: 'user', content: description, status: 'complete', createdAt: new Date(0) },
    ]
    const request: AdapterRequest = { messages, context: { temperature: 0 } }
    const source = adapter.createSource(request)
    let text = ''
    for await (const chunk of source.stream()) {
      if (chunk.type === 'text' && chunk.content) text += chunk.content
    }
    const json = extractJson(text)
    return validateAgentSchema(JSON.parse(json))
  }
}
