import React, { useState } from 'react'

interface Color {
  hex: string
  hsl: [number, number, number]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette(): Color[] {
  const baseHue = Math.floor(Math.random() * 360)
  const saturation = 60 + Math.floor(Math.random() * 25)

  const hueOffsets = [0, 30, -30, 180, 150]
  const lightnesses = [35, 50, 65, 45, 55]

  return hueOffsets.map((offset, i) => {
    const h = (baseHue + offset + 360) % 360
    const s = saturation
    const l = lightnesses[i]
    return { hex: hslToHex(h, s, l), hsl: [h, s, l] }
  })
}

export function ColorPalette() {
  const [colors, setColors] = useState<Color[]>(generatePalette)
  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerate = () => {
    setColors(generatePalette())
    setCopied(null)
  }

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(hex)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  const copyAll = async () => {
    const allHex = colors.map((c) => c.hex).join(', ')
    await copyToClipboard(allHex)
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        maxWidth: '640px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={handleGenerate}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8')
          }
          onMouseOut={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = '#2563eb')
          }
        >
          Generate
        </button>

        <button
          onClick={copyAll}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            border: '1.5px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseOver={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = '#9ca3af'
            btn.style.background = '#f9fafb'
          }}
          onMouseOut={(e) => {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = '#d1d5db'
            btn.style.background = '#fff'
          }}
        >
          {copied && copied.includes(',') ? 'Copied!' : 'Copy All'}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'nowrap',
        }}
      >
        {colors.map((color, i) => (
          <div
            key={i}
            onClick={() => copyToClipboard(color.hex)}
            title={`Click to copy ${color.hex}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1.4',
                background: color.hex,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                border: copied === color.hex ? '2.5px solid #2563eb' : '2.5px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-4px) scale(1.04)'
                el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.16)'
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'none'
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)'
              }}
            >
              {copied === color.hex && (
                <span
                  style={{
                    fontSize: '22px',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
                  }}
                >
                  ✓
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6b7280',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                userSelect: 'all',
              }}
            >
              {color.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
