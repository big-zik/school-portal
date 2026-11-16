'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export function MobileNav({ items, active }: { items: { href: string; label: string }[]; active: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--cgs-border)] text-[var(--cgs-heading)]"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Primary mobile" className="absolute inset-x-0 top-full z-50 border-b border-[var(--cgs-border)] bg-[var(--cgs-surface)] px-4 py-3 shadow-lg">
          <ul className="grid gap-1">
            {items.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === n.href ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-3 text-base ${active === n.href ? 'bg-[var(--cgs-tint)] font-semibold text-[var(--cgs-heading)]' : 'text-[var(--cgs-text)]'}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
