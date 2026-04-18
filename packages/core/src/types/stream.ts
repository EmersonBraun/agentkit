export type StreamStatus = 'idle' | 'streaming' | 'complete' | 'error'

export interface StreamToolCallPayload {
  id: string
  name: string
  args: string
  result?: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'reasoning' | 'usage' | 'error' | 'done'
  content?: string
  toolCall?: StreamToolCallPayload
  usage?: TokenUsage
  metadata?: Record<string, unknown>
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
