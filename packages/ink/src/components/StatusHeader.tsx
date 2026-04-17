import React from 'react'
import { Box, Text } from 'ink'
import type { TokenUsage } from '@agentskit/core'

export interface StatusHeaderProps {
  title?: string
  provider?: string
  model?: string
  tools?: string[]
  mode?: 'demo' | 'live'
  messageCount?: number
  sessionId?: string
  usage?: TokenUsage
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`
  return `${(n / 1_000_000).toFixed(2)}m`
}

export function StatusHeader({
  title = 'AgentsKit CLI',
  provider,
  model,
  tools,
  mode,
  messageCount,
  sessionId,
  usage,
}: StatusHeaderProps) {
  const segments: Array<{ label: string; value: string; color?: string }> = []

  if (provider) segments.push({ label: 'provider', value: provider, color: 'cyan' })
  if (model) segments.push({ label: 'model', value: model, color: 'magenta' })
  if (mode) segments.push({ label: 'mode', value: mode, color: mode === 'live' ? 'green' : 'yellow' })
  if (tools && tools.length > 0) {
    segments.push({ label: 'tools', value: tools.join(','), color: 'blue' })
  }
  if (typeof messageCount === 'number') {
    segments.push({ label: 'msgs', value: String(messageCount), color: 'gray' })
  }
  if (sessionId) {
    // Short-form: first 12 chars; full id available via --list-sessions.
    segments.push({ label: 'session', value: sessionId.slice(0, 12), color: 'gray' })
  }

  const hasTokens = usage && usage.totalTokens > 0

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1}>
      <Text color="cyan" bold>
        ✦ {title}
      </Text>
      {segments.length > 0 ? (
        <Box>
          {segments.map((seg, i) => (
            <Box key={seg.label}>
              {i > 0 ? <Text dimColor>  ·  </Text> : null}
              <Text dimColor>{seg.label}=</Text>
              <Text color={seg.color ?? 'white'}>{seg.value}</Text>
            </Box>
          ))}
        </Box>
      ) : null}
      {hasTokens && usage ? (
        <Box>
          <Text dimColor>tokens  </Text>
          <Text color="green">↑ {formatTokens(usage.promptTokens)}</Text>
          <Text dimColor>  </Text>
          <Text color="yellow">↓ {formatTokens(usage.completionTokens)}</Text>
          <Text dimColor>  ·  </Text>
          <Text color="white">total {formatTokens(usage.totalTokens)}</Text>
        </Box>
      ) : null}
    </Box>
  )
}
