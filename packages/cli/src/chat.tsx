import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Text } from 'ink'
import {
  ChatContainer,
  InputBar,
  Message,
  StatusHeader,
  ThinkingIndicator,
  ToolCallView,
  ToolConfirmation,
  useChat,
} from '@agentskit/ink'
import type { Message as ChatMessage, ToolCall } from '@agentskit/core'
import { resolveChatProvider } from './providers'
import { resolveTools, resolveMemory, skillRegistry } from './resolve'
import { derivePreview, writeSessionMeta } from './sessions'
import {
  builtinSlashCommands,
  createSlashRegistry,
  parseSlashCommand,
  type FeedbackKind,
  type SlashCommand,
  type SlashCommandContext,
} from './slash-commands'

import type { AgentsKitConfig } from './config'

export interface ChatCommandOptions {
  provider: string
  model?: string
  system?: string
  memoryPath?: string
  sessionId?: string
  apiKey?: string
  baseUrl?: string
  tools?: string
  skill?: string
  memoryBackend?: string
  agentsKitConfig?: AgentsKitConfig
  /**
   * Extra slash commands appended to the built-ins. Later entries with
   * the same name override earlier ones, so consumers can replace a
   * built-in by re-registering its name.
   */
  slashCommands?: SlashCommand[]
}

/**
 * Group messages into user turns. A "turn" starts at a user message and
 * contains every assistant/tool message that followed until the next user
 * input. Each assistant message inside a turn is one agent-loop iteration,
 * so we can render a `step i/n` badge.
 */
function groupIntoTurns(messages: ChatMessage[]): ChatMessage[][] {
  const turns: ChatMessage[][] = []
  let current: ChatMessage[] = []
  for (const message of messages) {
    if (message.role === 'user') {
      if (current.length > 0) turns.push(current)
      current = [message]
    } else if (message.role === 'system') {
      // System messages live outside turns for display purposes.
      if (current.length > 0) turns.push(current)
      turns.push([message])
      current = []
    } else {
      current.push(message)
    }
  }
  if (current.length > 0) turns.push(current)
  return turns
}

export function ChatApp(options: ChatCommandOptions) {
  // Mutable runtime — slash commands like `/model foo` update these without
  // restarting the chat. `useChat` re-reads its config every render, so
  // re-memoizing the adapter/tools below threads the change through to the
  // controller via `updateConfig`.
  const [provider, setProvider] = useState(options.provider)
  const [model, setModel] = useState(options.model)
  const [apiKey, setApiKey] = useState(options.apiKey)
  const [baseUrl, setBaseUrl] = useState(options.baseUrl)
  const [toolsFlag, setToolsFlag] = useState<string | undefined>(options.tools)
  const [skillFlag, setSkillFlag] = useState<string | undefined>(options.skill)

  const runtime = useMemo(
    () => resolveChatProvider({ provider, model, apiKey, baseUrl }),
    [provider, model, apiKey, baseUrl],
  )

  const memory = useMemo(
    () => resolveMemory(options.memoryBackend, options.memoryPath ?? '.agentskit-history.json'),
    [options.memoryPath, options.memoryBackend]
  )
  const tools = useMemo(() => resolveTools(toolsFlag), [toolsFlag])
  const skills = useMemo(() => {
    if (!skillFlag) return undefined
    const names = skillFlag.split(',').map(s => s.trim())
    const resolved = names.map(n => skillRegistry[n]).filter(Boolean)
    if (resolved.length === 0) return undefined
    return resolved
  }, [skillFlag])

  const chat = useChat({
    adapter: runtime.adapter,
    memory,
    systemPrompt: options.system,
    tools: tools.length > 0 ? tools : undefined,
    skills,
  })

  // Tool names the user has allowed for the rest of this session. Subsequent
  // `requires_confirmation` calls for these tools are auto-approved so the
  // agent can keep working without re-prompting.
  const [sessionAllowed, setSessionAllowed] = useState<Set<string>>(new Set())
  const autoApprovedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (sessionAllowed.size === 0) return
    for (const message of chat.messages) {
      for (const call of message.toolCalls ?? []) {
        if (
          call.status === 'requires_confirmation' &&
          sessionAllowed.has(call.name) &&
          !autoApprovedRef.current.has(call.id)
        ) {
          autoApprovedRef.current.add(call.id)
          void chat.approve(call.id)
        }
      }
    }
  }, [chat.messages, sessionAllowed, chat.approve])

  const handleApproveAlways = (toolCallId: string, toolName: string) => {
    setSessionAllowed(prev => {
      if (prev.has(toolName)) return prev
      const next = new Set(prev)
      next.add(toolName)
      return next
    })
    autoApprovedRef.current.add(toolCallId)
    void chat.approve(toolCallId)
  }

  // Persist session metadata when the message count changes — not on every
  // token update. Writing synchronously to disk on each streamed chunk
  // blocks the event loop and makes the UI stutter. Keying the effect on
  // length + first message id keeps it to one write per new turn.
  const sessionCreatedAtRef = useRef<string | undefined>(undefined)
  const messageCount = chat.messages.length
  const firstUserContent = chat.messages.find(m => m.role === 'user')?.content ?? ''

  useEffect(() => {
    const sessionId = options.sessionId
    if (!sessionId || sessionId === 'custom') return
    if (!sessionCreatedAtRef.current) {
      sessionCreatedAtRef.current = new Date().toISOString()
    }
    try {
      writeSessionMeta({
        id: sessionId,
        cwd: process.cwd(),
        createdAt: sessionCreatedAtRef.current,
        updatedAt: new Date().toISOString(),
        messageCount,
        preview: derivePreview(chat.messages),
        provider: runtime.provider,
        model: runtime.model,
      })
    } catch {
      // ignore
    }
    // derivePreview reads chat.messages but only produces the first user
    // message's content — safe to key on its length + the first user text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.sessionId, messageCount, firstUserContent, runtime.provider, runtime.model])

  const turns = useMemo(() => groupIntoTurns(chat.messages), [chat.messages])
  const toolNames = toolsFlag ? toolsFlag.split(',').map(s => s.trim()).filter(Boolean) : []

  // Slash-command feedback line (e.g. "Model → gpt-4o"). Cleared when the
  // user sends their next non-command input.
  const [feedback, setFeedback] = useState<{ message: string; kind: FeedbackKind } | null>(null)

  const slashCommands = useMemo<SlashCommand[]>(
    () => [...builtinSlashCommands, ...(options.slashCommands ?? [])],
    [options.slashCommands],
  )
  const slashRegistry = useMemo(() => createSlashRegistry(slashCommands), [slashCommands])

  const handleSubmitInput = async (raw: string): Promise<boolean> => {
    const parsed = parseSlashCommand(raw)
    if (!parsed) {
      setFeedback(null)
      return false
    }
    const cmd = slashRegistry.get(parsed.name)
    if (!cmd) {
      setFeedback({
        message: `Unknown command: /${parsed.name}. Type /help for the list.`,
        kind: 'error',
      })
      return true
    }
    const ctx: SlashCommandContext = {
      chat,
      runtime: {
        provider: runtime.provider,
        model: runtime.model,
        mode: runtime.mode,
        baseUrl,
        tools: toolsFlag,
        skill: skillFlag,
      },
      setProvider,
      setModel,
      setApiKey,
      setBaseUrl,
      setTools: setToolsFlag,
      setSkill: setSkillFlag,
      feedback: (message, kind = 'info') => setFeedback({ message, kind }),
      commands: slashCommands,
    }
    try {
      await cmd.run(ctx, parsed.args)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setFeedback({ message: `/${parsed.name} failed: ${message}`, kind: 'error' })
    }
    return true
  }

  // True while any tool call is awaiting user approval. Disables the input
  // bar so its arrow-key history navigation doesn't fight ToolConfirmation
  // for the same key presses.
  const awaitingConfirmation = useMemo(
    () => chat.messages.some(message =>
      message.toolCalls?.some(
        call => call.status === 'requires_confirmation' && !sessionAllowed.has(call.name)
      )
    ),
    [chat.messages, sessionAllowed]
  )

  return (
    <Box flexDirection="column" gap={1}>
      <StatusHeader
        provider={runtime.provider}
        model={runtime.model}
        mode={runtime.mode}
        tools={toolNames}
        messageCount={chat.messages.length}
        sessionId={options.sessionId}
      />

      <ChatContainer>
        {turns.map((turn, turnIdx) => {
          const assistantSteps = turn.filter(m => m.role === 'assistant').length
          let stepIndex = 0
          return (
            <Box key={`turn-${turnIdx}`} flexDirection="column" gap={1}>
              {turn.map(message => {
                const showStep = message.role === 'assistant' && assistantSteps > 1
                if (showStep) stepIndex++
                return (
                  <Box key={message.id} flexDirection="column">
                    {showStep ? (
                      <Text dimColor>↻ step {stepIndex}/{assistantSteps}</Text>
                    ) : null}
                    <Message message={message} />
                    {message.toolCalls?.map((toolCall: ToolCall) => (
                      <Box key={toolCall.id} flexDirection="column">
                        <ToolCallView toolCall={toolCall} expanded />
                        {toolCall.status === 'requires_confirmation' &&
                        !sessionAllowed.has(toolCall.name) ? (
                          <ToolConfirmation
                            toolCall={toolCall}
                            onApprove={chat.approve}
                            onDeny={chat.deny}
                            onApproveAlways={handleApproveAlways}
                          />
                        ) : null}
                      </Box>
                    ))}
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </ChatContainer>

      <ThinkingIndicator
        visible={chat.status === 'streaming'}
        label={toolNames.length > 0 ? 'agent working' : 'thinking'}
      />

      {chat.error ? (
        <Box borderStyle="round" borderColor="red" paddingX={1} flexDirection="column">
          <Text color="red" bold>✗ {chat.error.name || 'Error'}</Text>
          <Text color="red">{chat.error.message}</Text>
        </Box>
      ) : null}

      {feedback ? (
        <Box borderStyle="round" borderColor={feedbackBorder(feedback.kind)} paddingX={1}>
          <Text color={feedbackBorder(feedback.kind)}>{feedback.message}</Text>
        </Box>
      ) : null}

      <InputBar
        chat={chat}
        placeholder="Type a message or /help for commands"
        disabled={awaitingConfirmation}
        onSubmitInput={handleSubmitInput}
      />
    </Box>
  )
}

function feedbackBorder(kind: FeedbackKind): string {
  switch (kind) {
    case 'error':
      return 'red'
    case 'warn':
      return 'yellow'
    case 'success':
      return 'green'
    case 'info':
    default:
      return 'cyan'
  }
}

export function renderChatHeader(options: ChatCommandOptions): string {
  const runtime = resolveChatProvider(options)
  const parts = [`provider=${runtime.provider}`]
  if (runtime.model) parts.push(`model=${runtime.model}`)
  parts.push(`mode=${runtime.mode}`)
  if (options.tools) parts.push(`tools=${options.tools}`)
  if (options.skill) parts.push(`skill=${options.skill}`)
  if (options.memoryBackend) parts.push(`memory=${options.memoryBackend}`)
  return parts.join(' ')
}
