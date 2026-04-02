import type { AdapterFactory, Message, StreamSource, StreamChunk } from '../core/types'

export interface OpenAIConfig {
  apiKey: string
  model: string
  baseUrl?: string
}

export function openai(config: OpenAIConfig): AdapterFactory {
  const { apiKey, model, baseUrl = 'https://api.openai.com' } = config

  return {
    createSource: (messages: Message[]): StreamSource => {
      let abortController: AbortController | null = new AbortController()

      return {
        stream: async function* (): AsyncIterableIterator<StreamChunk> {
          try {
            const body = {
              model,
              messages: messages.map(m => ({ role: m.role, content: m.content })),
              stream: true,
            }

            const response = await fetch(`${baseUrl}/v1/chat/completions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify(body),
              signal: abortController?.signal,
            })

            if (!response.ok) {
              yield { type: 'error', content: `OpenAI API error: ${response.status}` }
              return
            }

            const reader = response.body!.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() ?? ''

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const data = line.slice(6)
                if (data === '[DONE]') {
                  yield { type: 'done' }
                  return
                }

                try {
                  const event = JSON.parse(data)
                  const delta = event.choices?.[0]?.delta?.content
                  if (delta) {
                    yield { type: 'text', content: delta }
                  }
                } catch {
                  // skip malformed JSON lines
                }
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
