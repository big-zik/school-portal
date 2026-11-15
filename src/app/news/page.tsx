'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SiteShell } from '@/components/site/SiteShell'
import { PageHead, FilterPills } from '@/components/site/PageHead'

const FILTERS = ['All updates', 'School life', 'Academics', 'Events']

const STORIES = [
  { cat: 'Admissions', filter: 'Academics', title: 'Applications open for 2026/2027', src: '/images/classroom.jpg', alt: 'Students learning together in a classroom' },
  { cat: 'School life', filter: 'School life', title: 'A day of teamwork and sport', src: '/images/football.jpg', alt: 'Students playing football' },
  { cat: 'Community', filter: 'Events', title: 'Working together with our parents', src: '/images/classroom.jpg', alt: 'Students and a teacher reading together' },
]

export default function NewsPage() {
  const [filter, setFilter] = useState(FILTERS[0])
  const shown = filter === FILTERS[0] ? STORIES : STORIES.filter((s) => s.filter === filter)
  return (
    <SiteShell active="/news">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PageHead eyebrow="NEWS & EVENTS" title="Good things are happening." />
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
          <Image src="/images/science-lab.jpg" alt="Students and a teacher working on a science experiment" width={610} height={437} className="h-auto w-full rounded-3xl object-cover" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cgs-primary)]">School life · 12 Nov 2026</p>
            <h2 className="mt-8 font-serif text-4xl font-semibold leading-snug text-[var(--cgs-navy)]">Curiosity takes centre stage at Science Week</h2>
            <p className="mt-12 text-lg text-[var(--cgs-text)]">Students explore practical science through questions, experiments and teamwork.</p>
            <Link href="/gallery" className="mt-12 inline-flex h-12 items-center rounded-lg border border-[var(--cgs-primary)] bg-[var(--cgs-tint)] px-14 text-sm font-semibold text-[var(--cgs-navy)]">Read story</Link>
          </div>
        </div>
        <div className="mt-16"><FilterPills items={FILTERS} value={filter} onChange={setFilter} /></div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {shown.map((s) => (
            <article key={s.title}>
              <Image src={s.src} alt={s.alt} width={420} height={230} className="h-[230px] w-full rounded-2xl object-cover" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[var(--cgs-primary)]">{s.cat}</p>
              <h3 className="mt-3 text-2xl font-semibold leading-snug text-[var(--cgs-navy)]">{s.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
