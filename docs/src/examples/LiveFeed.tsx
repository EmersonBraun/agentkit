import React, { useState, useEffect, useRef } from 'react'

type EventType = 'deploy' | 'commit' | 'alert' | 'user-joined'

interface FeedItem {
  id: string
  timestamp: Date
  type: EventType
  message: string
  isNew: boolean
}

const EVENT_TYPES: EventType[] = ['deploy', 'commit', 'alert', 'user-joined']

const EVENT_MESSAGES: Record<EventType, string[]> = {
  deploy: [
    'Deployed v2.4.1 to production',
    'Rolled out canary release to 10% of users',
    'Deployed hotfix to staging environment',
    'Released feature branch to QA',
  ],
  commit: [
    'feat: add dark mode support',
    'fix: resolve memory leak in worker thread',
    'chore: bump dependencies to latest',
    'refactor: simplify auth middleware',
  ],
  alert: [
    'CPU usage exceeded 85% threshold',
    'Response time degraded on /api/search',
    'Failed health check on replica-3',
    'Error rate spike detected: 2.3%',
  ],
  'user-joined': [
    'alice@acme.com joined the workspace',
    'bob@example.com accepted the invite',
    'carol@startup.io signed up via OAuth',
    'dave@corp.com was added by an admin',
  ],
}

const BADGE_STYLES: Record<EventType, React.CSSProperties> = {
  deploy: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  commit: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
  },
  alert: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  'user-joined': {
    backgroundColor: '#fef9c3',
    color: '#a16207',
    border: '1px solid #fef08a',
  },
}

const BADGE_ICONS: Record<EventType, string> = {
  deploy: '🚀',
  commit: '📝',
  alert: '⚠️',
  'user-joined': '👤',
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateItem(): FeedItem {
  const type = randomItem(EVENT_TYPES)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(),
    type,
    message: randomItem(EVENT_MESSAGES[type]),
    isNew: true,
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const FADE_IN_KEYFRAMES = `
@keyframes livefeed-fadein {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

export function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>(() => [generateItem(), generateItem(), generateItem()])
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Inject keyframe animation once
  useEffect(() => {
    const styleId = 'livefeed-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = FADE_IN_KEYFRAMES
      document.head.appendChild(style)
    }
  }, [])

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setItems(prev => {
        const newItem = generateItem()
        const next = [newItem, ...prev].slice(0, 20)
        // Clear isNew flag after animation
        return next
      })
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  // Clear isNew after 600ms so the animation only plays once per item
  useEffect(() => {
    const timers = items
      .filter(item => item.isNew)
      .map(item =>
        setTimeout(() => {
          setItems(prev =>
            prev.map(i => (i.id === item.id ? { ...i, isNew: false } : i))
          )
        }, 600)
      )
    return () => timers.forEach(clearTimeout)
  }, [items])

  const containerStyle: React.CSSProperties = {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    maxWidth: 620,
    margin: '0 auto',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    background: '#fff',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #f3f4f6',
    background: '#fafafa',
  }

  const titleStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 15,
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const dotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: paused ? '#9ca3af' : '#22c55e',
    display: 'inline-block',
    boxShadow: paused ? 'none' : '0 0 0 3px rgba(34,197,94,0.2)',
    transition: 'background-color 0.3s, box-shadow 0.3s',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 7,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
  }

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: '8px 0',
    maxHeight: 420,
    overflowY: 'auto',
  }

  const itemBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '10px 20px',
    borderBottom: '1px solid #f9fafb',
    transition: 'background 0.15s',
  }

  const badgeBaseStyle: React.CSSProperties = {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    marginTop: 1,
  }

  const messageStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.5,
  }

  const timeStyle: React.CSSProperties = {
    flexShrink: 0,
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    whiteSpace: 'nowrap',
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>
          <span style={dotStyle} />
          Live Event Feed
        </span>
        <button
          style={buttonStyle}
          onClick={() => setPaused(p => !p)}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#fff'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'
          }}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      <ul style={listStyle}>
        {items.map(item => (
          <li
            key={item.id}
            style={{
              ...itemBaseStyle,
              animation: item.isNew ? 'livefeed-fadein 0.4s ease both' : 'none',
            }}
          >
            <span
              style={{
                ...badgeBaseStyle,
                ...BADGE_STYLES[item.type],
              }}
            >
              <span>{BADGE_ICONS[item.type]}</span>
              {item.type}
            </span>
            <span style={messageStyle}>{item.message}</span>
            <span style={timeStyle}>{formatTime(item.timestamp)}</span>
          </li>
        ))}
      </ul>

      <div
        style={{
          padding: '8px 20px',
          borderTop: '1px solid #f3f4f6',
          fontSize: 11,
          color: '#9ca3af',
          background: '#fafafa',
          textAlign: 'right',
        }}
      >
        {items.length} / 20 events · updates every 3s
      </div>
    </div>
  )
}
