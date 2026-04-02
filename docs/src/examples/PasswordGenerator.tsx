import React, { useState, useEffect, useCallback } from 'react'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

function generatePassword(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
): string {
  let charset = ''
  if (useUppercase) charset += UPPERCASE
  if (useLowercase) charset += LOWERCASE
  if (useNumbers) charset += NUMBERS
  if (useSymbols) charset += SYMBOLS

  if (charset === '') return ''

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

type Strength = 'weak' | 'medium' | 'strong' | 'very strong'

function getStrength(
  length: number,
  useUppercase: boolean,
  useLowercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean,
): Strength {
  const charsetCount = [useUppercase, useLowercase, useNumbers, useSymbols].filter(Boolean).length

  if (charsetCount === 0) return 'weak'
  if (length < 10 || charsetCount === 1) return 'weak'
  if (length < 14 || charsetCount === 2) return 'medium'
  if (length < 20 || charsetCount === 3) return 'strong'
  return 'very strong'
}

const STRENGTH_CONFIG: Record<Strength, { color: string; width: string; label: string }> = {
  weak: { color: '#ef4444', width: '25%', label: 'Weak' },
  medium: { color: '#f97316', width: '50%', label: 'Medium' },
  strong: { color: '#22c55e', width: '75%', label: 'Strong' },
  'very strong': { color: '#16a34a', width: '100%', label: 'Very Strong' },
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, useUppercase, useLowercase, useNumbers, useSymbols))
    setCopied(false)
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols])

  useEffect(() => {
    regenerate()
  }, [regenerate])

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = getStrength(length, useUppercase, useLowercase, useNumbers, useSymbols)
  const strengthConfig = STRENGTH_CONFIG[strength]

  const containerStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: 480,
    margin: '0 auto',
    padding: '28px 32px',
    borderRadius: 16,
    background: '#1e1e2e',
    color: '#cdd6f4',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    cursor: 'pointer',
    userSelect: 'none',
  }

  const checkboxStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    accentColor: '#89b4fa',
    cursor: 'pointer',
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#cba6f7' }}>
        Password Generator
      </h2>

      {/* Password output */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#181825',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 24,
          border: '1px solid #313244',
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: 'monospace',
            fontSize: 15,
            letterSpacing: '0.04em',
            color: password ? '#a6e3a1' : '#585b70',
            wordBreak: 'break-all',
          }}
        >
          {password || 'Select at least one character type'}
        </span>
        <button
          onClick={handleCopy}
          disabled={!password}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: copied ? '#a6e3a1' : '#89b4fa',
            color: '#1e1e2e',
            fontWeight: 600,
            fontSize: 13,
            cursor: password ? 'pointer' : 'not-allowed',
            opacity: password ? 1 : 0.5,
            transition: 'background 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Strength bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: 13,
            color: '#a6adc8',
          }}
        >
          <span>Strength</span>
          <span style={{ color: strengthConfig.color, fontWeight: 600 }}>
            {strengthConfig.label}
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: '#313244',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: strengthConfig.width,
              background: strengthConfig.color,
              borderRadius: 999,
              transition: 'width 0.35s ease, background 0.35s ease',
            }}
          />
        </div>
      </div>

      {/* Length slider */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: 14,
            color: '#a6adc8',
          }}
        >
          <span>Length</span>
          <span style={{ color: '#89b4fa', fontWeight: 600 }}>{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: '#89b4fa',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#585b70',
            marginTop: 2,
          }}
        >
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Toggles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Uppercase (A–Z)', value: useUppercase, setter: setUseUppercase },
          { label: 'Lowercase (a–z)', value: useLowercase, setter: setUseLowercase },
          { label: 'Numbers (0–9)', value: useNumbers, setter: setUseNumbers },
          { label: 'Symbols (!@#…)', value: useSymbols, setter: setUseSymbols },
        ].map(({ label, value, setter }) => (
          <label key={label} style={labelStyle}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setter(e.target.checked)}
              style={checkboxStyle}
            />
            <span style={{ fontSize: 13, color: '#cdd6f4' }}>{label}</span>
          </label>
        ))}
      </div>

      {/* Regenerate button */}
      <button
        onClick={regenerate}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 10,
          border: '1.5px solid #89b4fa',
          background: 'transparent',
          color: '#89b4fa',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = '#89b4fa'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#1e1e2e'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = '#89b4fa'
        }}
      >
        Regenerate
      </button>
    </div>
  )
}
