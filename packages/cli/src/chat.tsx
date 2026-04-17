import React, { useEffect, useMemo, useRef } from 'react'
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
  const runtime = useMemo(() => resolveChatProvider(options), [
    options.apiKey,
    options.baseUrl,
    options.model,
    options.provider,
  ])

  const memory = useMemo(
    () => resolveMemory(options.memoryBackend, options.memoryPath ?? '.agentskit-history.json'),
    [options.memoryPath, options.memoryBackend]
  )
  const tools = useMemo(() => resolveTools(options.tools), [options.tools])
  const skills = useMemo(() => {
    if (!options.skill) return undefined
    const names = options.skill.split(',').map(s => s.trim())
    const resolved = names.map(n => skillRegistry[n]).filter(Boolean)
    if (resolved.length === 0) return undefined
    return resolved
  }, [options.skill])

  const chat = useChat({
    adapter: runtime.adapter,
    memory,
    systemPrompt: options.system,
    tools: tools.length > 0 ? tools : undefined,
    skills,
  })

  // Update session metadata on every message change so `--list-sessions`
  // shows accurate preview, counts, and last-updated time. Best-effort;
  // failures are swallowed so a read-only fs never breaks the UI.
  const sessionCreatedAtRef = useRef<string | undefined>(undefined)
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
        messageCount: chat.messages.length,
        preview: derivePreview(chat.messages),
        provider: runtime.provider,
        model: runtime.model,
      })
    } catch {
      // ignore
    }
  }, [options.sessionId, chat.messages, runtime.provider, runtime.model])

  const turns = useMemo(() => groupIntoTurns(chat.messages), [chat.messages])
  const toolNames = options.tools ? options.tools.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <Box flexDirection="column" gap={1}>
      <StatusHeader
        provider={runtime.provider}
        model={runtime.model}
        mode={runtime.mode}
        tools={toolNames}
        messageCount={chat.messages.length}
        sessionId={options.sessionId}
        usage={chat.usage}
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
                        {toolCall.status === 'requires_confirmation' ? (
                          <ToolConfirmation
                            toolCall={toolCall}
                            onApprove={chat.approve}
                            onDeny={chat.deny}
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

      <InputBar chat={chat} placeholder="Type a message and press Enter…" />
    </Box>
  )
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
