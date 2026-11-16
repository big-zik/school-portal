import React from 'react'

// Navy page band with a gold foil rule. Place above the page's content container.
export function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="band-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="rise text-xs font-semibold uppercase tracking-wider text-white/85" style={{ ['--d' as string]: '.05s' }}>{eyebrow}</p>
        <h1 className="rise mt-5 max-w-4xl font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[58px]" style={{ ['--d' as string]: '.15s' }}>
          {title}
        </h1>
        {sub && (
          <p className="rise mt-5 max-w-2xl text-lg text-white/95" style={{ ['--d' as string]: '.28s' }}>
            {sub}
          </p>
        )}
      </div>
    </section>
  )
}

export function FilterPills({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-3">
      {items.map((i) => (
        <button
          key={i}
          role="tab"
          aria-selected={value === i}
          onClick={() => onChange(i)}
          className={`h-12 min-w-[150px] rounded-lg px-5 text-left text-sm font-semibold transition-colors ${
            value === i ? 'foil-bg text-[var(--cgs-on-foil)] shadow-sm' : 'bg-[var(--cgs-tint)] text-[var(--cgs-heading)] hover:brightness-95'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  )
}
