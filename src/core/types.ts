export type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error'

export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

export type ToolCallStatus = 'pending' | 'running' | 'complete' | 'error'

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
  result?: string
  status: ToolCallStatus
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  status: MessageStatus
  toolCalls?: ToolCall[]
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'error' | 'done'
  content?: string
  toolCall?: {
    id: string
    name: string
    args: string
    result?: string
  }
}

export interface StreamSource {
  stream: () => AsyncIterableIterator<StreamChunk>
  abort: () => void
}

export interface UseStreamOptions {
  onChunk?: (chunk: StreamChunk) => void
  onComplete?: (text: string) => void
  onError?: (error: Error) => void
}

export interface UseStreamReturn {
  data: StreamChunk | null
  text: string
  status: StreamStatus
  error: Error | null
  stop: () => void
}

export interface ChatConfig {
  adapter: AdapterFactory
  onMessage?: (message: Message) => void
  onError?: (error: Error) => void
  initialMessages?: Message[]
}

export interface ChatReturn {
  messages: Message[]
  send: (text: string) => void
  stop: () => void
  retry: () => void
  status: StreamStatus
  input: string
  setInput: (value: string) => void
}

export type AdapterFactory = {
  createSource: (messages: Message[]) => StreamSource
}
