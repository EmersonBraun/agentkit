'use client'

import { useEffect, useRef, useState } from 'react'

export type GifEmbedProps = {
  src: string
  alt: string
  /** Optional still-frame PNG shown before playback + for reduced-motion. */
  poster?: string
  /** Auto-play on viewport intersect (default: true). */
  autoplay?: boolean
  width?: number
  height?: number
  caption?: string
}

/**
 * Accessible GIF embed.
 * - Respects prefers-reduced-motion — shows the poster instead.
 * - Defers loading until in view (reduces bandwidth).
 * - Exposes data-ak-gif so the theme can style it uniformly.
 */
export function GifEmbed({
  src,
  alt,
  poster,
  autoplay = true,
  width,
  height,
  caption,
}: GifEmbedProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shouldPlay, setShouldPlay] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!autoplay || reducedMotion || shouldPlay) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShouldPlay(true)
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoplay, reducedMotion, shouldPlay])

  const showStatic = reducedMotion || (!shouldPlay && !!poster)
  const imgSrc = showStatic && poster ? poster : src

  return (
    <figure data-ak-gif ref={ref} className="my-6">
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg border border-ak-border"
      />
      {caption ? (
        <figcaption className="mt-2 text-center font-mono text-xs text-ak-graphite">
          {caption}
        </figcaption>
      ) : null}
      {reducedMotion && poster ? (
        <p className="mt-1 text-center font-mono text-[11px] text-ak-graphite">
          Motion disabled by system preference. <a href={src} className="underline decoration-dotted underline-offset-2 hover:text-ak-blue">view the animation</a>.
        </p>
      ) : null}
    </figure>
  )
}
