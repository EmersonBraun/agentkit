import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const MIDNIGHT = '#0D1117'
const FOAM = '#E6EDF3'
const GRAPHITE = '#6E7681'
const BLUE = '#58A6FF'
const GREEN = '#2EA043'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: MIDNIGHT,
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(88,166,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(46,160,67,0.06) 0%, transparent 50%)`,
          color: FOAM,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${FOAM}08 1px, transparent 1px), linear-gradient(90deg, ${FOAM}08 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Logo (three circles forming a triangle) */}
        <div
          style={{
            width: 440,
            height: 630,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* connecting lines */}
            <line x1="140" y1="60" x2="50" y2="220" stroke={FOAM} strokeOpacity="0.35" strokeWidth="2" />
            <line x1="140" y1="60" x2="230" y2="220" stroke={FOAM} strokeOpacity="0.35" strokeWidth="2" />
            <line x1="50" y1="220" x2="230" y2="220" stroke={FOAM} strokeOpacity="0.35" strokeWidth="2" />
            {/* circles */}
            <circle cx="140" cy="60" r="38" fill={MIDNIGHT} stroke={FOAM} strokeWidth="4" />
            <circle cx="50" cy="220" r="38" fill={MIDNIGHT} stroke={FOAM} strokeWidth="4" />
            <circle cx="230" cy="220" r="38" fill={MIDNIGHT} stroke={FOAM} strokeWidth="4" />
          </svg>
        </div>

        {/* Copy */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: 72,
            paddingLeft: 16,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontFamily: 'monospace',
              color: BLUE,
              letterSpacing: '0.08em',
              marginBottom: 16,
              display: 'flex',
            }}
          >
            @agentskit/core
          </div>

          <div
            style={{
              fontSize: 168,
              fontWeight: 800,
              color: FOAM,
              lineHeight: 1,
              marginBottom: 28,
              display: 'flex',
              letterSpacing: '-0.04em',
            }}
          >
            v1.0
          </div>

          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: FOAM,
              lineHeight: 1.2,
              marginBottom: 32,
              display: 'flex',
              maxWidth: 620,
            }}
          >
            The JavaScript agent toolkit that doesn't lock you in.
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              fontFamily: 'monospace',
              fontSize: 20,
              color: GREEN,
            }}
          >
            <span style={{ display: 'flex' }}>5.17 KB gzipped</span>
            <span style={{ display: 'flex', color: GRAPHITE }}>·</span>
            <span style={{ display: 'flex' }}>zero deps</span>
            <span style={{ display: 'flex', color: GRAPHITE }}>·</span>
            <span style={{ display: 'flex' }}>6 pinned contracts</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
