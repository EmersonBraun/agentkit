'use client'

import { useState } from 'react'

export type CodeSandboxEmbedProps = {
  /** Sandbox id (e.g. `abcd123`) or `github/owner/repo/tree/branch/path`. */
  sandbox: string
  file?: string
  height?: number
  title?: string
  lazy?: boolean
}

function buildUrl({ sandbox, file }: Pick<CodeSandboxEmbedProps, 'sandbox' | 'file'>) {
  const isGithub = sandbox.startsWith('github/')
  const base = isGithub
    ? `https://codesandbox.io/embed/${sandbox}`
    : `https://codesandbox.io/embed/${sandbox}`
  const params = new URLSearchParams({
    theme: 'dark',
    ...(file ? { module: file } : {}),
    fontsize: '14',
    hidenavigation: '1',
  })
  return `${base}?${params.toString()}`
}

export function CodeSandboxEmbed({
  sandbox,
  file,
  height = 520,
  title,
  lazy = true,
}: CodeSandboxEmbedProps) {
  const [open, setOpen] = useState(!lazy)
  const url = buildUrl({ sandbox, file })
  const safeTitle = title ?? `CodeSandbox — ${sandbox}${file ? ` / ${file}` : ''}`

  if (!open) {
    return (
      <div
        data-ak-codesandbox-placeholder
        className="my-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-ak-border bg-ak-surface p-8 text-center"
      >
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-ak-graphite">
          Live sandbox
        </div>
        <p className="max-w-md text-sm text-ak-foam">
          Click to load the CodeSandbox for{' '}
          <code className="rounded bg-ak-midnight px-1.5 py-0.5 font-mono text-xs">
            {sandbox}
          </code>
          .
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-ak-foam px-4 py-2 text-sm font-semibold text-ak-midnight transition hover:bg-white"
        >
          Load sandbox →
        </button>
      </div>
    )
  }

  return (
    <iframe
      data-ak-codesandbox
      src={url}
      title={safeTitle}
      height={height}
      style={{ width: '100%', border: 0, borderRadius: 12 }}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      loading="lazy"
    />
  )
}
