import React, { useEffect, useRef, useState } from 'react'
import { Box, Text, useInput } from 'ink'
import type { ChatReturn } from '@agentskit/core'

export interface InputBarProps {
  chat: ChatReturn
  placeholder?: string
  disabled?: boolean
  /**
   * Prior messages to cycle through with arrow up/down. Typically the user
   * messages from `chat.messages`, most recent last. Omitted → derived
   * from `chat.messages`.
   */
  history?: string[]
}

const CURSOR_MS = 500

function deriveHistory(chat: ChatReturn): string[] {
  return chat.messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
}

export function InputBar({
  chat,
  placeholder = 'Type a message...',
  disabled = false,
  history,
}: InputBarProps) {
  const isBusy = disabled || chat.status === 'streaming'
  const [cursorOn, setCursorOn] = useState(true)

  // Pointer into history. -1 = live input. 0..N-1 = pointing at history[i].
  const [historyIndex, setHistoryIndex] = useState(-1)
  // Snapshot of the in-progress input so the user can scroll back to it.
  const liveDraftRef = useRef<string>('')

  const effectiveHistory = history ?? deriveHistory(chat)

  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), CURSOR_MS)
    return () => clearInterval(id)
  }, [])

  useInput((input, key) => {
    if (isBusy) return

    if (key.upArrow) {
      if (effectiveHistory.length === 0) return
      if (historyIndex === -1) liveDraftRef.current = chat.input
      const nextIndex = historyIndex === -1
        ? effectiveHistory.length - 1
        : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      chat.setInput(effectiveHistory[nextIndex])
      return
    }

    if (key.downArrow) {
      if (historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= effectiveHistory.length) {
        setHistoryIndex(-1)
        chat.setInput(liveDraftRef.current)
      } else {
        setHistoryIndex(nextIndex)
        chat.setInput(effectiveHistory[nextIndex])
      }
      return
    }

    if (key.return) {
      if (chat.input.trim()) {
        setHistoryIndex(-1)
        liveDraftRef.current = ''
        void chat.send(chat.input)
      }
      return
    }

    if (key.backspace || key.delete) {
      // Any edit exits history navigation so subsequent text builds a new
      // draft, not a mutation of the recalled message.
      if (historyIndex !== -1) setHistoryIndex(-1)
      chat.setInput(chat.input.slice(0, -1))
      return
    }

    if (input && !key.ctrl && !key.meta) {
      if (historyIndex !== -1) setHistoryIndex(-1)
      chat.setInput(`${chat.input}${input}`)
    }
  })

  const hint = isBusy
    ? chat.status === 'streaming'
      ? 'streaming response... press Ctrl+C to abort'
      : 'input disabled'
    : effectiveHistory.length > 0
      ? `${placeholder}  ·  ↑/↓ to recall previous messages`
      : placeholder

  return (
    <Box flexDirection="column">
      <Text dimColor>{hint}</Text>
      <Box>
        <Text color={isBusy ? 'gray' : 'cyan'} bold>
          ❯{' '}
        </Text>
        <Text color={isBusy ? 'gray' : 'white'}>
          {chat.input}
          {!isBusy && cursorOn ? <Text inverse> </Text> : null}
        </Text>
      </Box>
    </Box>
  )
}
