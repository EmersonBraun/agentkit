import React, { useState, useEffect, useRef } from 'react'

type Mode = 'work' | 'break'

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  break: 5 * 60,
}

const COLORS: Record<Mode, string> = {
  work: '#e05c5c',
  break: '#4caf7d',
}

const SIZE = 120
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('work')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = DURATIONS[mode]
  const progress = timeLeft / total
  const dashOffset = CIRCUMFERENCE * (1 - progress)
  const color = COLORS[mode]

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            const nextMode: Mode = mode === 'work' ? 'break' : 'work'
            setMode(nextMode)
            setTimeLeft(DURATIONS[nextMode])
            return DURATIONS[nextMode]
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, mode])

  function handleReset() {
    setRunning(false)
    setTimeLeft(DURATIONS[mode])
  }

  function handleModeSwitch(next: Mode) {
    setRunning(false)
    setMode(next)
    setTimeLeft(DURATIONS[next])
  }

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '32px 40px',
    borderRadius: '16px',
    background: '#1a1a2e',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    userSelect: 'none',
  }

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  }

  function tabStyle(active: boolean, tabColor: string): React.CSSProperties {
    return {
      padding: '6px 18px',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      background: active ? tabColor : 'transparent',
      color: active ? '#fff' : '#888',
      outline: active ? `2px solid ${tabColor}` : '2px solid transparent',
      transition: 'all 0.2s',
    }
  }

  const ringWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: SIZE,
    height: SIZE,
  }

  const timeTextStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 700,
    color: '#f0f0f0',
    letterSpacing: '1px',
  }

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
  }

  function btnStyle(primary: boolean): React.CSSProperties {
    return {
      padding: '9px 22px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 600,
      background: primary ? color : '#2e2e4a',
      color: primary ? '#fff' : '#aaa',
      transition: 'opacity 0.15s, transform 0.1s',
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  }

  return (
    <div style={containerStyle}>
      <div style={tabsStyle}>
        <button
          style={tabStyle(mode === 'work', COLORS.work)}
          onClick={() => handleModeSwitch('work')}
        >
          Work
        </button>
        <button
          style={tabStyle(mode === 'break', COLORS.break)}
          onClick={() => handleModeSwitch('break')}
        >
          Break
        </button>
      </div>

      <div style={ringWrapperStyle}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#2e2e4a"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.4s' }}
          />
        </svg>
        <div style={timeTextStyle}>{formatTime(timeLeft)}</div>
      </div>

      <div style={actionsStyle}>
        <button style={btnStyle(true)} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Start'}
        </button>
        <button style={btnStyle(false)} onClick={handleReset}>
          Reset
        </button>
      </div>

      <div style={labelStyle}>{mode === 'work' ? 'Focus time' : 'Short break'}</div>
    </div>
  )
}
