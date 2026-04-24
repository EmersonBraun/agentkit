'use client'

import { useState } from 'react'

export type StackblitzEmbedProps = {
  /** GitHub path (`owner/repo/tree/branch/path`) or Stackblitz project id. */
  project: string
  /** File to open (e.g. `src/App.tsx`). */
  file?: string
  /** Optional height in px (default 520). */
  height?: number
  /** Iframe title for a11y. */
  title?: string
  /** Show on load, or wait for user click (lighter LCP). */
  lazy?: boolean
}

function buildUrl({ project, file }: Pick<StackblitzEmbedProps, 'project' | 'file'>) {
  const isGithub = project.includes('/')
  const base = isGithub
    ? `https://stackblitz.com/github/${project}`
    : `https://stackblitz.com/edit/${project}`
  const params = new URLSearchParams({
    embed: '1',
    theme: 'dark',
    view: 'both',
    ...(file ? { file } : {}),
    ctl: '1',
  })
  return `${base}?${params.toString()}`
}

export function StackblitzEmbed({
  project,
  file,
  height = 520,
  title,
  lazy = true,
}: StackblitzEmbedProps) {
  const [open, setOpen] = useState(!lazy)
  const url = buildUrl({ project, file })
  const safeTitle = title ?? `Stackblitz — ${project}${file ? ` / ${file}` : ''}`

  if (!open) {
    return (
      <div
        data-ak-stackblitz-placeholder
        className="my-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-ak-border bg-ak-surface p-8 text-center"
      >
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-ak-graphite">
          Live sandbox
        </div>
        <p className="max-w-md text-sm text-ak-foam">
          Click to load the editable Stackblitz for{' '}
          <code className="rounded bg-ak-midnight px-1.5 py-0.5 font-mono text-xs">
            {project}
          </code>
          {file ? ` (${file})` : ''}.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md bg-ak-foam px-4 py-2 text-sm font-semibold text-ak-midnight transition hover:bg-white"
        >
          Load sandbox →
        </button>
        <a
          href={url.replace('embed=1', 'embed=0')}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-ak-graphite underline decoration-dotted underline-offset-2 hover:text-ak-blue"
        >
          open in new tab
        </a>
      </div>
    )
  }

  return (
    <iframe
      data-ak-stackblitz
      src={url}
      title={safeTitle}
      height={height}
      style={{ width: '100%', border: 0, borderRadius: 12 }}
      allow="cross-origin-isolated; clipboard-read; clipboard-write"
      loading="lazy"
    />
  )
}
