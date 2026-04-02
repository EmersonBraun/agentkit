import React, { useState, useEffect, useCallback } from 'react'

const PHOTOS = [
  { id: 1, label: 'Photo 1', gradient: 'linear-gradient(135deg, #f06, #4a90e2)' },
  { id: 2, label: 'Photo 2', gradient: 'linear-gradient(135deg, #f90, #e24a4a)' },
  { id: 3, label: 'Photo 3', gradient: 'linear-gradient(135deg, #0f9, #4a90e2)' },
  { id: 4, label: 'Photo 4', gradient: 'linear-gradient(135deg, #90f, #f06)' },
  { id: 5, label: 'Photo 5', gradient: 'linear-gradient(135deg, #0af, #0f9)' },
  { id: 6, label: 'Photo 6', gradient: 'linear-gradient(135deg, #ff0, #f90)' },
  { id: 7, label: 'Photo 7', gradient: 'linear-gradient(135deg, #f0f, #4a90e2)' },
  { id: 8, label: 'Photo 8', gradient: 'linear-gradient(135deg, #0ff, #90f)' },
  { id: 9, label: 'Photo 9', gradient: 'linear-gradient(135deg, #fa0, #0af)' },
]

export function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  const openPhoto = (index: number) => {
    setActiveIndex(index)
    setVisible(true)
  }

  const closePhoto = useCallback(() => {
    setVisible(false)
    setTimeout(() => setActiveIndex(null), 200)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex(prev => prev === null ? 0 : (prev + 1) % PHOTOS.length)
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex(prev => prev === null ? 0 : (prev - 1 + PHOTOS.length) % PHOTOS.length)
  }, [])

  useEffect(() => {
    if (activeIndex === null) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhoto()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeIndex, closePhoto, goNext, goPrev])

  const activePhoto = activeIndex !== null ? PHOTOS[activeIndex] : null

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}>
        {PHOTOS.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openPhoto(index)}
            aria-label={`Open ${photo.label}`}
            style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '75%',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              overflow: 'hidden',
              background: photo.gradient,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.04)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <span style={{
              position: 'absolute',
              bottom: '10px',
              left: '0',
              right: '0',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              {photo.label}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto?.label}
          onClick={closePhoto}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {/* Centered image area */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(90vw, 520px)',
              aspectRatio: '4 / 3',
              borderRadius: '14px',
              overflow: 'hidden',
              background: activePhoto?.gradient,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Label */}
            <span style={{
              position: 'absolute',
              bottom: '20px',
              left: '0',
              right: '0',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.2rem',
              textShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>
              {activePhoto?.label}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={closePhoto}
            aria-label="Close lightbox"
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#fff',
              fontSize: '1.3rem',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
              zIndex: 1001,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ×
          </button>

          {/* Left arrow */}
          <button
            onClick={e => { e.stopPropagation(); goPrev() }}
            aria-label="Previous photo"
            style={{
              position: 'fixed',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#fff',
              fontSize: '1.4rem',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
              zIndex: 1001,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ‹
          </button>

          {/* Right arrow */}
          <button
            onClick={e => { e.stopPropagation(); goNext() }}
            aria-label="Next photo"
            style={{
              position: 'fixed',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#fff',
              fontSize: '1.4rem',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
              zIndex: 1001,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            ›
          </button>

          {/* Counter */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.85rem',
            fontWeight: 500,
            zIndex: 1001,
          }}>
            {activeIndex + 1} / {PHOTOS.length}
          </div>
        </div>
      )}
    </div>
  )
}
