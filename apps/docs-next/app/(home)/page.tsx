import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
        AgentsKit
      </h1>
      <p className="mb-2 max-w-2xl text-xl text-fd-muted-foreground">
        The complete toolkit for building AI agents in JavaScript.
      </p>
      <p className="mb-10 max-w-2xl text-base text-fd-muted-foreground">
        Chat UIs, autonomous agents, tools, skills, memory, RAG, and observability —
        from prototype to production.
      </p>
      <div className="flex gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-fd-primary px-5 py-2 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
        >
          Get started →
        </Link>
        <a
          href="https://github.com/EmersonBraun/agentskit"
          className="rounded-md border border-fd-border px-5 py-2 text-sm font-medium hover:bg-fd-accent"
        >
          GitHub
        </a>
      </div>
      <div className="mt-16 grid max-w-3xl grid-cols-1 gap-4 text-left md:grid-cols-3">
        <Feature
          title="10KB core"
          desc="Zero-dependency foundation. Tree-shakable, edge-ready, predictable."
        />
        <Feature
          title="Plug-and-play"
          desc="Every package works alone or together. No framework lock-in."
        />
        <Feature
          title="Agent-first"
          desc="ReAct loops, tools, skills, delegation, memory — first-class, not afterthoughts."
        />
      </div>
    </main>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-fd-border p-4">
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-fd-muted-foreground">{desc}</p>
    </div>
  )
}
