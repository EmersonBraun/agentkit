import { useState, useCallback, useRef } from 'react'
import type {
  ChatConfig, ChatReturn, Message, StreamStatus, StreamSource,
} from './types'

let nextId = 0
function generateId(): string {
  return `msg-${Date.now()}-${nextId++}`
}

export function useChat(config: ChatConfig): ChatReturn {
  const { adapter, onMessage, onError, initialMessages } = config
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [input, setInput] = useState('')
  const sourceRef = useRef<StreamSource | null>(null)
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const startStream = useCallback(async (allMessages: Message[], assistantId: string) => {
    const source = adapterRef.current.createSource(allMessages)
    sourceRef.current = source

    let accumulated = ''

    try {
      const iterator = source.stream()
      for await (const chunk of iterator) {
        if (chunk.type === 'text' && chunk.content) {
          accumulated += chunk.content
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, content: accumulated }
                : m
            )
          )
        } else if (chunk.type === 'tool_call' && chunk.toolCall) {
          setMessages(prev =>
            prev.map(m => {
              if (m.id !== assistantId) return m
              const existing = m.toolCalls ?? []
              return {
                ...m,
                toolCalls: [...existing, {
                  id: chunk.toolCall!.id,
                  name: chunk.toolCall!.name,
                  args: JSON.parse(chunk.toolCall!.args || '{}'),
                  result: chunk.toolCall!.result,
                  status: 'complete' as const,
                }],
              }
            })
          )
        } else if (chunk.type === 'error') {
          const err = new Error(chunk.content ?? 'Stream error')
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId
                ? { ...m, status: 'error' }
                : m
            )
          )
          setStatus('error')
          onErrorRef.current?.(err)
          return
        } else if (chunk.type === 'done') {
          break
        }
      }

      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === assistantId
            ? { ...m, status: 'complete' as const }
            : m
        )
        const completed = updated.find(m => m.id === assistantId)
        if (completed) onMessageRef.current?.(completed)
        return updated
      })
      setStatus('idle')
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, status: 'error' }
            : m
        )
      )
      setStatus('error')
      onErrorRef.current?.(error)
    }
  }, [])

  const send = useCallback((text: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      status: 'complete',
      createdAt: new Date(),
    }

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: new Date(),
    }

    setMessages(prev => {
      const updated = [...prev, userMessage, assistantMessage]
      startStream(updated, assistantMessage.id)
      return updated
    })

    setInput('')
    setStatus('streaming')
  }, [startStream])

  const stop = useCallback(() => {
    sourceRef.current?.abort()
  }, [])

  const retry = useCallback(() => {
    setMessages(prev => {
      if (prev.length < 2) return prev
      const lastAssistant = prev[prev.length - 1]
      const lastUser = prev[prev.length - 2]
      if (lastAssistant.role !== 'assistant' || lastUser.role !== 'user') return prev

      const withoutLast = prev.slice(0, -1)
      const newAssistant: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: new Date(),
      }
      const updated = [...withoutLast, newAssistant]
      startStream(updated, newAssistant.id)
      return updated
    })
    setStatus('streaming')
  }, [startStream])

  return { messages, send, stop, retry, status, input, setInput }
}
