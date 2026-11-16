'use client'

import React, { useEffect, useState } from 'react'

type Palette = 'classic' | 'calm' | 'evening'
const OPTIONS: { id: Palette; label: string; swatch: string }[] = [
  { id: 'classic', label: 'Classic', swatch: '#FBF7EE' },
  { id: 'calm', label: 'Calm', swatch: '#DDEFF4' },
  { id: 'evening', label: 'Evening', swatch: '#0A192C' },
]

function apply(p: Palette) {
  const d = document.documentElement
  d.removeAttribute('data-palette')
  d.classList.remove('dark')
  if (p === 'calm') d.setAttribute('data-palette', 'calm')
  if (p === 'evening') d.classList.add('dark')
}

export function PaletteSwitch({ inverse = false }: { inverse?: boolean }) {
  const [value, setValue] = useState<Palette>('classic')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cgs-palette') as Palette | null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage after mount
      if (saved === 'calm' || saved === 'evening') setValue(saved)
    } catch {}
  }, [])

  const choose = (p: Palette) => {
    setValue(p)
    apply(p)
    try {
      localStorage.setItem('cgs-palette', p)
    } catch {}
  }

  const base = inverse ? 'border-white/30 bg-white/10 text-white' : 'border-[var(--cgs-border)] bg-[var(--cgs-surface)] text-[var(--cgs-subdued)]'
  const on = inverse ? 'bg-white text-[#0B2A4A]' : 'bg-[var(--cgs-heading)] text-[var(--cgs-canvas)]'
  return (
    <div role="group" aria-label="Colour palette" className={`inline-flex rounded-full border p-[3px] ${base}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => choose(o.id)}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${value === o.id ? on : ''}`}
        >
          <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-current" style={{ background: o.swatch }} />
          {o.label}
        </button>
      ))}
    </div>
  )
}
