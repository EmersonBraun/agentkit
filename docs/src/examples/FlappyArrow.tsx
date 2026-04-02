import React, { useEffect, useRef, useCallback, useState } from 'react'

const WIDTH = 400
const HEIGHT = 600
const GRAVITY = 0.5
const FLAP_STRENGTH = -9
const PIPE_WIDTH = 52
const PIPE_GAP = 160
const PIPE_SPEED = 2.8
const PIPE_INTERVAL = 90 // frames between pipe spawns
const ARROW_X = 80
const ARROW_SIZE = 22

type GameState = 'idle' | 'playing' | 'dead'

interface Pipe {
  x: number
  topHeight: number
  passed: boolean
}

interface GameData {
  state: GameState
  arrowY: number
  arrowVY: number
  pipes: Pipe[]
  score: number
  frame: number
}

function makeInitialData(): GameData {
  return {
    state: 'idle',
    arrowY: HEIGHT / 2,
    arrowVY: 0,
    pipes: [],
    score: 0,
    frame: 0,
  }
}

function randomTopHeight(): number {
  const min = 80
  const max = HEIGHT - PIPE_GAP - 80
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function collides(arrowY: number, pipes: Pipe[]): boolean {
  // Ground / ceiling
  if (arrowY + ARROW_SIZE / 2 >= HEIGHT || arrowY - ARROW_SIZE / 2 <= 0) return true

  for (const pipe of pipes) {
    const inXRange =
      ARROW_X + ARROW_SIZE / 2 > pipe.x + 4 && ARROW_X - ARROW_SIZE / 2 < pipe.x + PIPE_WIDTH - 4
    if (!inXRange) continue
    const inTopPipe = arrowY - ARROW_SIZE / 2 < pipe.topHeight
    const inBottomPipe = arrowY + ARROW_SIZE / 2 > pipe.topHeight + PIPE_GAP
    if (inTopPipe || inBottomPipe) return true
  }
  return false
}

function drawArrow(ctx: CanvasRenderingContext2D, y: number, vy: number) {
  const tilt = Math.max(-30, Math.min(30, vy * 3))
  ctx.save()
  ctx.translate(ARROW_X, y)
  ctx.rotate((tilt * Math.PI) / 180)

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 6

  // Arrow body (shaft)
  ctx.strokeStyle = '#f5d142'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-ARROW_SIZE + 2, 0)
  ctx.lineTo(ARROW_SIZE - 8, 0)
  ctx.stroke()

  // Arrowhead
  ctx.fillStyle = '#f5d142'
  ctx.beginPath()
  ctx.moveTo(ARROW_SIZE, 0)
  ctx.lineTo(ARROW_SIZE - 10, -6)
  ctx.lineTo(ARROW_SIZE - 10, 6)
  ctx.closePath()
  ctx.fill()

  // Tail fletching
  ctx.strokeStyle = '#e07b30'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-ARROW_SIZE + 2, 0)
  ctx.lineTo(-ARROW_SIZE + 10, -7)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-ARROW_SIZE + 2, 0)
  ctx.lineTo(-ARROW_SIZE + 10, 7)
  ctx.stroke()

  ctx.restore()
}

function drawPipes(ctx: CanvasRenderingContext2D, pipes: Pipe[]) {
  for (const pipe of pipes) {
    const x = pipe.x

    // Top pipe
    const topGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0)
    topGrad.addColorStop(0, '#3a8c3f')
    topGrad.addColorStop(0.5, '#5cbf62')
    topGrad.addColorStop(1, '#2d6e31')
    ctx.fillStyle = topGrad
    ctx.fillRect(x, 0, PIPE_WIDTH, pipe.topHeight)

    // Top pipe cap
    ctx.fillStyle = '#4aae50'
    ctx.fillRect(x - 5, pipe.topHeight - 24, PIPE_WIDTH + 10, 24)

    // Bottom pipe
    const botY = pipe.topHeight + PIPE_GAP
    const botGrad = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0)
    botGrad.addColorStop(0, '#3a8c3f')
    botGrad.addColorStop(0.5, '#5cbf62')
    botGrad.addColorStop(1, '#2d6e31')
    ctx.fillStyle = botGrad
    ctx.fillRect(x, botY, PIPE_WIDTH, HEIGHT - botY)

    // Bottom pipe cap
    ctx.fillStyle = '#4aae50'
    ctx.fillRect(x - 5, botY, PIPE_WIDTH + 10, 24)
  }
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  skyGrad.addColorStop(0, '#1a1a3e')
  skyGrad.addColorStop(1, '#2d2d5e')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  // Ground
  ctx.fillStyle = '#3a2e1e'
  ctx.fillRect(0, HEIGHT - 20, WIDTH, 20)
  ctx.fillStyle = '#5a4a30'
  ctx.fillRect(0, HEIGHT - 20, WIDTH, 5)
}

function drawScore(ctx: CanvasRenderingContext2D, score: number) {
  ctx.save()
  ctx.font = 'bold 36px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.fillText(String(score), WIDTH / 2 + 2, 60 + 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(String(score), WIDTH / 2, 60)
  ctx.restore()
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  score: number,
) {
  if (state === 'idle') {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.textAlign = 'center'
    ctx.font = 'bold 44px monospace'
    ctx.fillStyle = '#f5d142'
    ctx.shadowColor = '#e07b30'
    ctx.shadowBlur = 12
    ctx.fillText('Flappy Arrow', WIDTH / 2, HEIGHT / 2 - 50)

    ctx.font = '20px monospace'
    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 0
    ctx.fillText('Click or press Space to start', WIDTH / 2, HEIGHT / 2 + 10)
    ctx.restore()
  }

  if (state === 'dead') {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.textAlign = 'center'
    ctx.font = 'bold 44px monospace'
    ctx.fillStyle = '#e05c5c'
    ctx.shadowColor = '#900'
    ctx.shadowBlur = 14
    ctx.fillText('Game Over', WIDTH / 2, HEIGHT / 2 - 60)

    ctx.font = 'bold 28px monospace'
    ctx.fillStyle = '#f5d142'
    ctx.shadowBlur = 0
    ctx.fillText(`Score: ${score}`, WIDTH / 2, HEIGHT / 2 - 10)

    ctx.font = '18px monospace'
    ctx.fillStyle = '#cccccc'
    ctx.fillText('Click to restart', WIDTH / 2, HEIGHT / 2 + 38)
    ctx.restore()
  }
}

export function FlappyArrow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<GameData>(makeInitialData())
  const rafRef = useRef<number>(0)
  const [, forceUpdate] = useState(0)

  const tick = useCallback(() => {
    const g = gameRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (g.state === 'playing') {
      // Physics
      g.arrowVY += GRAVITY
      g.arrowY += g.arrowVY
      g.frame++

      // Spawn pipes
      if (g.frame % PIPE_INTERVAL === 0) {
        g.pipes.push({ x: WIDTH, topHeight: randomTopHeight(), passed: false })
      }

      // Move pipes
      for (const pipe of g.pipes) {
        pipe.x -= PIPE_SPEED
      }

      // Remove off-screen pipes
      g.pipes = g.pipes.filter((p) => p.x + PIPE_WIDTH > -10)

      // Score
      for (const pipe of g.pipes) {
        if (!pipe.passed && pipe.x + PIPE_WIDTH < ARROW_X - ARROW_SIZE / 2) {
          pipe.passed = true
          g.score++
        }
      }

      // Collision
      if (collides(g.arrowY, g.pipes)) {
        g.state = 'dead'
        forceUpdate((n) => n + 1)
      }
    }

    // Draw
    drawBackground(ctx)
    drawPipes(ctx, g.pipes)
    drawArrow(ctx, g.arrowY, g.arrowVY)
    if (g.state === 'playing') drawScore(ctx, g.score)
    drawOverlay(ctx, g.state, g.score)

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  const handleInteract = useCallback(() => {
    const g = gameRef.current
    if (g.state === 'idle') {
      g.state = 'playing'
      g.arrowVY = FLAP_STRENGTH
    } else if (g.state === 'playing') {
      g.arrowVY = FLAP_STRENGTH
    } else if (g.state === 'dead') {
      gameRef.current = makeInitialData()
      gameRef.current.state = 'playing'
      gameRef.current.arrowVY = FLAP_STRENGTH
      forceUpdate((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleInteract()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleInteract])

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-block',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    userSelect: 'none',
    lineHeight: 0,
  }

  return (
    <div style={wrapperStyle} onClick={handleInteract}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: 'block', width: WIDTH, height: HEIGHT }}
      />
    </div>
  )
}
