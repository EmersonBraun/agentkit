import React, { useState, useEffect, useRef, useCallback } from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

// ─── Floating Keywords Background ───
const KEYWORDS = [
  'useChat()', 'useStream()', 'useReactive()', 'adapter', 'streaming',
  'ChatContainer', 'Message', 'InputBar', '<5KB', 'anthropic()',
  'openai()', 'send()', 'stop()', 'retry()', 'data-ak-*',
  'onMessage', 'onChunk', 'headless', 'theme', 'hooks',
]

function FloatingKeywords() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {KEYWORDS.map((kw, i) => (
        <span
          key={i}
          className="floating-keyword"
          style={{
            left: `${(i * 5.2) % 100}%`,
            animationDuration: `${12 + (i % 8) * 3}s`,
            animationDelay: `${(i * 1.7) % 10}s`,
            fontSize: `${11 + (i % 4) * 2}px`,
          }}
        >
          {kw}
        </span>
      ))}
    </div>
  )
}

// ─── Copy Install Command ───
function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const cmd = 'npm install @agentkit-react/core'

  const copy = () => {
    navigator.clipboard?.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} className="install-cmd" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <span className="dollar">$</span>
      <span>{cmd}</span>
      <span style={{
        marginLeft: 8,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
        color: copied ? '#22c55e' : '#94a3b8',
        transition: 'all 0.2s',
        minWidth: 52,
        textAlign: 'center',
      }}>
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  )
}

// ─── Live Interactive Widgets (rendered inside chat) ───
function WidgetColorPicker() {
  const [hue, setHue] = useState(210)
  const colors = [0, 60, 120, 180, 240].map(offset => `hsl(${(hue + offset) % 360}, 72%, 58%)`)

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 40, height: 40, borderRadius: 8, background: c, cursor: 'pointer', transition: 'transform 0.15s', border: '2px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            onClick={() => navigator.clipboard?.writeText(c)}
          />
        ))}
      </div>
      <input type="range" min={0} max={360} value={hue} onChange={e => setHue(Number(e.target.value))}
        style={{ width: '100%', accentColor: `hsl(${hue}, 72%, 58%)` }}
      />
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Drag to shift hue &middot; Click swatch to copy</div>
    </div>
  )
}

function WidgetTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const pct = (seconds % 60) / 60
  const r = 28
  const circ = 2 * Math.PI * r

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle cx={36} cy={36} r={r} fill="none" stroke="#3b82f6" strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.3s' }}
        />
        <text x={36} y={38} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight={700}
          style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </text>
      </svg>
      <div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setRunning(!running)} style={{ background: running ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: running ? '#ef4444' : '#22c55e', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
            {running ? 'Pause' : 'Resume'}
          </button>
          <button onClick={() => { setSeconds(0); setRunning(true) }} style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
            Reset
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Live timer — reactive state updates</div>
      </div>
    </div>
  )
}

function WidgetPoll() {
  const [votes, setVotes] = useState([
    { label: 'React', count: 42 },
    { label: 'Vue', count: 28 },
    { label: 'Svelte', count: 18 },
    { label: 'Solid', count: 12 },
  ])
  const total = votes.reduce((s, v) => s + v.count, 0)

  const vote = (i: number) => {
    setVotes(prev => prev.map((v, j) => j === i ? { ...v, count: v.count + 1 } : v))
  }

  return (
    <div style={{ marginTop: 10 }}>
      {votes.map((v, i) => {
        const pct = Math.round((v.count / total) * 100)
        return (
          <div key={v.label} onClick={() => vote(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer', padding: '4px 0' }}>
            <div style={{ width: 60, fontSize: 12, fontWeight: 600 }}>{v.label}</div>
            <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: `hsl(${210 + i * 30}, 70%, 55%)`, borderRadius: 6, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ width: 36, fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>{pct}%</div>
          </div>
        )
      })}
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Click to vote &middot; {total} total votes</div>
    </div>
  )
}

// ─── Conversation Script ───
type MsgItem = { role: 'user' | 'assistant'; content: string; widget?: React.ReactNode }

const SCRIPT: Array<{ role: 'user' | 'assistant'; text: string; widget?: () => React.ReactNode; delay: number }> = [
  { role: 'user', text: 'Generate a color palette', delay: 0 },
  { role: 'assistant', text: 'Here\'s an interactive palette — drag the slider to shift the hue, click any swatch to copy:', delay: 600, widget: () => <WidgetColorPicker /> },
  { role: 'user', text: 'Now create a live timer', delay: 2000 },
  { role: 'assistant', text: 'Done! A reactive timer with SVG progress ring — all powered by useReactive:', delay: 600, widget: () => <WidgetTimer /> },
  { role: 'user', text: 'Show me a live poll', delay: 2500 },
  { role: 'assistant', text: 'Interactive poll with reactive bar charts — click to vote and watch the bars update instantly:', delay: 600, widget: () => <WidgetPoll /> },
]

// ─── Live Chat Demo ───
function LiveChatDemo() {
  const [messages, setMessages] = useState<MsgItem[]>([])
  const [streamText, setStreamText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [input, setInput] = useState('')
  const [demoFinished, setDemoFinished] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  const scroll = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  useEffect(scroll, [messages, streamText])

  const streamMessage = useCallback(async (text: string, widget?: React.ReactNode) => {
    setIsStreaming(true)
    setStreamText('')
    for (let i = 0; i < text.length; i++) {
      await new Promise(r => setTimeout(r, 15))
      setStreamText(text.slice(0, i + 1))
    }
    setIsStreaming(false)
    setStreamText('')
    setMessages(prev => [...prev, { role: 'assistant', content: text, widget }])
  }, [])

  const runDemo = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true

    await new Promise(r => setTimeout(r, 1200))

    for (const step of SCRIPT) {
      await new Promise(r => setTimeout(r, step.delay))
      if (step.role === 'user') {
        setMessages(prev => [...prev, { role: 'user', content: step.text }])
      } else {
        await streamMessage(step.text, step.widget?.())
      }
    }
    setDemoFinished(true)
  }, [streamMessage])

  useEffect(() => { runDemo() }, [runDemo])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    const text = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setTimeout(async () => {
      const responses = [
        { text: 'That\'s a great question! With AgentKit, you can build any interactive UI with just 3 hooks. The streaming architecture means updates render instantly as they arrive.', widget: undefined },
        { text: 'AgentKit handles all the complexity — streaming, state management, provider switching — so you focus on your product, not boilerplate.', widget: undefined },
        { text: 'Try it yourself: npm install @agentkit-react/core. You\'ll have a working AI chat in under a minute.', widget: undefined },
      ]
      const resp = responses[Math.floor(Math.random() * responses.length)]
      await streamMessage(resp.text, resp.widget)
    }, 400)
  }

  return (
    <div className="demo-window" style={{ maxWidth: 520, width: '100%' }}>
      <div className="demo-titlebar">
        <div className="demo-dot" style={{ background: '#ef4444' }} />
        <div className="demo-dot" style={{ background: '#eab308' }} />
        <div className="demo-dot" style={{ background: '#22c55e' }} />
        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8, fontFamily: 'monospace' }}>AgentKit Demo</span>
        <span className="live-badge">LIVE</span>
      </div>
      <div ref={scrollRef} className="demo-messages" style={{ maxHeight: 420, minHeight: 420, overflow: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`demo-msg demo-msg-${msg.role}`}>
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            {msg.widget}
          </div>
        ))}
        {isStreaming && streamText && (
          <div className="demo-msg demo-msg-assistant">
            <span style={{ whiteSpace: 'pre-wrap' }}>{streamText}</span>
            <span className="cursor" style={{ marginLeft: 1 }}>|</span>
          </div>
        )}
        {messages.length === 0 && (
          <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>⚡</div>
            Starting demo...
          </div>
        )}
      </div>
      <form onSubmit={e => { e.preventDefault(); handleSend() }} className="demo-input-bar">
        <input
          className="demo-input"
          placeholder={demoFinished ? 'Type anything — try it!' : 'Watching demo...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={!demoFinished}
          style={{ opacity: demoFinished ? 1 : 0.5 }}
        />
        <button type="submit" className="demo-send" disabled={!demoFinished || !input.trim() || isStreaming}>Send</button>
      </form>
    </div>
  )
}

// ─── Inline Live Examples ───
function InlineTodoDemo() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Try AgentKit', done: true },
    { id: 2, text: 'Build AI chat', done: false },
    { id: 3, text: 'Ship to production', done: false },
  ])
  const [input, setInput] = useState('')

  const add = () => {
    if (!input.trim()) return
    setTodos(prev => [...prev, { id: Date.now(), text: input, done: false }])
    setInput('')
  }

  return (
    <div style={{ background: 'var(--ak-code-bg)', borderRadius: 12, padding: 20, color: '#e2e8f0', maxWidth: 360 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#94a3b8' }}>useReactive Todo</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add todo..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
        />
        <button onClick={add} style={{ background: 'var(--ak-accent)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>Add</button>
      </div>
      {todos.map(t => (
        <div key={t.id} onClick={() => setTodos(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer', fontSize: 13 }}>
          <span style={{ width: 18, height: 18, borderRadius: 4, border: '2px solid ' + (t.done ? '#3b82f6' : 'rgba(255,255,255,0.2)'), background: t.done ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', flexShrink: 0 }}>{t.done ? '✓' : ''}</span>
          <span style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>{todos.filter(t => !t.done).length} items left</div>
    </div>
  )
}

function InlineCounterDemo() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ background: 'var(--ak-code-bg)', borderRadius: 12, padding: 20, color: '#e2e8f0', maxWidth: 360, textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#94a3b8' }}>useReactive Counter</div>
      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--ak-accent)', marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={() => setCount(c => c - 1)} style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>-</button>
        <button onClick={() => setCount(0)} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Reset</button>
        <button onClick={() => setCount(c => c + 1)} style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 16, cursor: 'pointer' }}>+</button>
      </div>
      <div style={{ fontSize: 11, marginTop: 12, color: '#64748b' }}>state.count++ triggers re-render</div>
    </div>
  )
}

// ─── Code Comparison ───
const BEFORE_CODE = `const [messages, setMessages] = useState([])
const [input, setInput] = useState('')
const [streaming, setStreaming] = useState(false)
const abortRef = useRef(null)

const send = async () => {
  setStreaming(true)
  const userMsg = { role: 'user', content: input }
  setMessages(prev => [...prev, userMsg])
  const res = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [...messages, userMsg] }),
    signal: abortRef.current?.signal,
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value)
    setMessages(prev => [...prev.slice(0,-1),
      { role: 'assistant', content: text }])
  }
  setStreaming(false)
}
// + error handling, auto-scroll, cleanup...`

const AFTER_CODE = `import { useChat, ChatContainer, Message, InputBar }
  from '@agentkit-react/core'
import { anthropic } from '@agentkit-react/core/adapters'
import '@agentkit-react/core/theme'

function Chat() {
  const chat = useChat({
    adapter: anthropic({ model: 'claude-sonnet-4-6' })
  })
  return (
    <ChatContainer>
      {chat.messages.map(msg =>
        <Message key={msg.id} message={msg} />
      )}
      <InputBar chat={chat} />
    </ChatContainer>
  )
}`

// ─── Examples Data ───
const EXAMPLES = [
  { emoji: '✅', name: 'Todo List', desc: 'Reactive arrays & filtering', href: '/docs/examples/todo-list' },
  { emoji: '🍅', name: 'Pomodoro', desc: 'SVG timer & intervals', href: '/docs/examples/pomodoro-timer' },
  { emoji: '🎨', name: 'Color Palette', desc: 'HSL harmonies & copy', href: '/docs/examples/color-palette' },
  { emoji: '🔐', name: 'Passwords', desc: 'Generator & strength meter', href: '/docs/examples/password-generator' },
  { emoji: '📂', name: 'Accordion', desc: 'Animated expand/collapse', href: '/docs/examples/accordion' },
  { emoji: '📡', name: 'Live Feed', desc: 'Auto-updating stream', href: '/docs/examples/live-feed' },
  { emoji: '📊', name: 'Data Table', desc: 'Sortable columns', href: '/docs/examples/data-table' },
  { emoji: '📑', name: 'Tabs', desc: 'ARIA & keyboard nav', href: '/docs/examples/tabs' },
  { emoji: '🖼️', name: 'Gallery', desc: 'Lightbox & keyboard', href: '/docs/examples/photo-gallery' },
  { emoji: '🐦', name: 'Flappy Arrow', desc: 'Canvas game loop', href: '/docs/examples/flappy-arrow' },
  { emoji: '🎭', name: 'MUI Chat', desc: 'Material UI integration', href: '/docs/examples/mui-chat' },
  { emoji: '✨', name: 'shadcn Chat', desc: 'shadcn/ui integration', href: '/docs/examples/shadcn-chat' },
]

// ─── Main Page ───
export default function Home(): React.JSX.Element {
  return (
    <Layout title="AgentKit" description="Ship AI chat in 10 lines of React">
      {/* ══════════ HERO ══════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <FloatingKeywords />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', width: '100%' }}>
          {/* Left: Copy */}
          <div>
            <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'var(--ak-accent-glow)', border: '1px solid var(--ak-accent)', color: 'var(--ak-accent)', fontSize: 13, fontWeight: 600, marginBottom: '1.5rem' }}>
              3 hooks &middot; Any provider &middot; Zero opinions
            </div>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.08, margin: '0 0 1.5rem 0', color: 'var(--ak-text)' }}>
              Ship AI chat in<br />
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto' }}>
                10 lines of React
              </span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--ak-text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: 480 }}>
              Drop-in hooks and components for streaming AI interfaces.
              Works with Claude, GPT, Vercel AI SDK, or any LLM.
              So simple an AI agent can write it for you.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start" style={{ borderRadius: 10 }}>
                Get Started
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/examples" style={{ borderRadius: 10 }}>
                Examples
              </Link>
            </div>

            <InstallCommand />
          </div>

          {/* Right: Live Demo */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LiveChatDemo />
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>

        {/* ══════════ PROVIDERS ══════════ */}
        <section style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ak-text-muted)', marginBottom: '1rem' }}>
            Works with every provider
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Anthropic', 'OpenAI', 'Vercel AI SDK', 'Any ReadableStream'].map(p => (
              <span key={p} className="provider-pill">{p}</span>
            ))}
          </div>
        </section>

        {/* ══════════ BEFORE / AFTER ══════════ */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="section-title">Stop writing boilerplate</h2>
          <p className="section-subtitle">50 lines of stream parsing &rarr; 10 lines with AgentKit</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="code-panel" style={{ opacity: 0.7 }}>
              <div className="code-panel-header" style={{ color: '#ef4444' }}>Before &mdash; ~50 lines</div>
              <pre style={{ maxHeight: 320 }}><code>{BEFORE_CODE}</code></pre>
            </div>
            <div className="code-panel" style={{ borderColor: 'var(--ak-accent)' }}>
              <div className="code-panel-header" style={{ color: 'var(--ak-accent)' }}>After &mdash; 10 lines with AgentKit</div>
              <pre style={{ maxHeight: 320 }}><code>{AFTER_CODE}</code></pre>
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="section-title">Why AgentKit?</h2>
          <p className="section-subtitle">Everything you need, nothing you don't</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: '🪝', title: '3 Hooks', desc: 'useStream, useReactive, useChat — that\'s the entire API. Learn it in 5 minutes.' },
              { icon: '⚡', title: '<5KB Bundle', desc: 'Tiny footprint. No virtual DOM overhead. Just reactive streams wired to the DOM.' },
              { icon: '🔌', title: 'Any Provider', desc: 'Claude, GPT, Vercel AI SDK, or bring your own ReadableStream. Swap in one line.' },
              { icon: '🎨', title: 'Headless + Theme', desc: 'Components ship with data-ak-* attributes. Import the theme or style your way.' },
              { icon: '🤖', title: 'Agent-Friendly', desc: 'Entire API fits in 2K tokens. AI agents generate correct AgentKit code first try.' },
              { icon: '🌍', title: 'Works Everywhere', desc: 'Next.js, Vite, Remix, TanStack Start — any React 18+ app. Zero config.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: 16 }}>{f.title}</h4>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--ak-text-muted)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ LIVE INLINE EXAMPLES ══════════ */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="section-title">Try it live</h2>
          <p className="section-subtitle">Interactive demos &mdash; no install required</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <InlineTodoDemo />
            <InlineCounterDemo />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--ak-text-muted)', fontSize: 14 }}>
            Built with <code>useReactive</code> — the same reactive primitives that power the chat hooks.{' '}
            <Link to="/docs/examples">See all 12 examples &rarr;</Link>
          </p>
        </section>

        {/* ══════════ EXAMPLES GRID ══════════ */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="section-title">12 Interactive Examples</h2>
          <p className="section-subtitle">From todo lists to Flappy Bird &mdash; all built with AgentKit</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {EXAMPLES.map(ex => (
              <Link key={ex.name} to={ex.href} className="example-card">
                <span className="example-emoji">{ex.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ak-text-muted)' }}>{ex.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════ API OVERVIEW ══════════ */}
        <section style={{ padding: '4rem 0' }}>
          <h2 className="section-title">The entire API</h2>
          <p className="section-subtitle">Three hooks. Seven components. That's it.</p>

          <div className="code-panel" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="code-panel-header" style={{ color: 'var(--ak-accent)' }}>Everything you need</div>
            <pre><code>{`// Hooks
const { text, status } = useStream(source)
const state = useReactive({ count: 0 })
const chat = useChat({ adapter })

// Components
<ChatContainer>
<Message message={m} />
<InputBar chat={chat} />
<Markdown content={s} />
<CodeBlock code={s} language="ts" copyable />
<ToolCallView toolCall={tc} />
<ThinkingIndicator visible />

// Theme (optional)
import '@agentkit-react/core/theme'`}</code></pre>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section style={{ padding: '4rem 0 6rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ak-text)', marginBottom: '1rem' }}>
            Ready to ship?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--ak-text-muted)', marginBottom: '2rem' }}>
            Get from zero to AI chat in under a minute.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button button--primary button--lg" to="/docs/getting-started/quick-start" style={{ borderRadius: 10 }}>
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/getting-started/for-ai-agents" style={{ borderRadius: 10 }}>
              For AI Agents
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ak-text-muted)', marginTop: '2rem' }}>
            Inspired by <a href="https://arrow-js.com/" target="_blank" rel="noopener noreferrer">Arrow.js</a> — the first UI framework for the agentic era.
          </p>
        </section>
      </main>
    </Layout>
  )
}
