import type { AdapterFactory, Message, StreamSource, StreamChunk } from '../core/types'

export interface VercelAIConfig {
  api: string
  headers?: Record<string, string>
}

export function vercelAI(config: VercelAIConfig): AdapterFactory {
  const { api, headers = {} } = config

  return {
    createSource: (messages: Message[]): StreamSource => {
      let abortController: AbortController | null = new AbortController()

      return {
        stream: async function* (): AsyncIterableIterator<StreamChunk> {
          try {
            const response = await fetch(api, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: JSON.stringify({
                messages: messages.map(m => ({ role: m.role, content: m.content })),
              }),
              signal: abortController?.signal,
            })

            if (!response.ok) {
              yield { type: 'error', content: `API error: ${response.status}` }
              return
            }

            const reader = response.body!.getReader()
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              const text = decoder.decode(value, { stream: true })
              if (text) {
                yield { type: 'text', content: text }
              }
            }

            yield { type: 'done' }
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return
            yield {
              type: 'error',
              content: err instanceof Error ? err.message : String(err),
            }
          }
        },
        abort: () => {
          abortController?.abort()
          abortController = null
        },
      }
    },
  }
}
