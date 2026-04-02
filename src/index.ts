// Core hooks
export { useStream, useReactive, useChat } from './core'

// Core types (Message type exported as MessageType to avoid collision with Message component)
export type {
  StreamStatus,
  MessageRole,
  MessageStatus,
  ToolCallStatus,
  ToolCall,
  Message as MessageType,
  StreamChunk,
  StreamSource,
  UseStreamOptions,
  UseStreamReturn,
  ChatConfig,
  ChatReturn,
  AdapterFactory,
} from './core'

// Components
export {
  ChatContainer,
  Message,
  InputBar,
  Markdown,
  CodeBlock,
  ToolCallView,
  ThinkingIndicator,
} from './components'

// Component types
export type {
  ChatContainerProps,
  MessageProps,
  InputBarProps,
  MarkdownProps,
  CodeBlockProps,
  ToolCallViewProps,
  ThinkingIndicatorProps,
} from './components'
