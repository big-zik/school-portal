export function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cgs-primary)]">{eyebrow}</p>
      <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight text-[var(--cgs-navy)] sm:text-5xl lg:text-[56px]">{title}</h1>
      {sub && <p className="mt-6 max-w-3xl text-lg text-[var(--cgs-text)]">{sub}</p>}
    </div>
  )
}

export function FilterPills({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-4">
      {items.map((i) => (
        <button
          key={i}
          role="tab"
          aria-selected={value === i}
          onClick={() => onChange(i)}
          className={`h-12 min-w-[150px] rounded-lg px-5 text-left text-sm font-semibold ${
            value === i ? 'bg-[var(--cgs-navy)] text-white' : 'bg-[var(--cgs-tint)] text-[var(--cgs-navy)] hover:bg-[var(--cgs-sky)]/40'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  )
}
