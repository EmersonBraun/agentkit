import React from 'react'
import { Box, Text, useInput } from 'ink'
import type { ToolCall } from '@agentskit/core'

export interface ToolConfirmationProps {
  toolCall: ToolCall
  onApprove: (toolCallId: string) => void
  onDeny: (toolCallId: string, reason?: string) => void
}

export function ToolConfirmation({ toolCall, onApprove, onDeny }: ToolConfirmationProps) {
  useInput((input) => {
    if (toolCall.status !== 'requires_confirmation') return
    if (input.toLowerCase() === 'y') onApprove(toolCall.id)
    if (input.toLowerCase() === 'n') onDeny(toolCall.id)
  })

  if (toolCall.status !== 'requires_confirmation') return null

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1} borderColor="yellow">
      <Text color="yellow" bold>
        Confirm: {toolCall.name}
      </Text>
      <Text dimColor>{JSON.stringify(toolCall.args)}</Text>
      <Text color="yellow">Allow? (y/n)</Text>
    </Box>
  )
}
