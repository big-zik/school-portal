'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { SiteShell } from '@/components/site/SiteShell'
import { PageHead, FilterPills } from '@/components/site/PageHead'

const FILTERS = ['All moments', 'Classroom', 'Science', 'Sports']
const ITEMS = [
  { f: 'Classroom', title: 'Learning together', src: '/images/classroom.jpg', alt: 'Students and a teacher reading together' },
  { f: 'Science', title: 'Exploring science', src: '/images/science-lab.jpg', alt: 'Students doing a science experiment' },
  { f: 'Sports', title: 'Team spirit', src: '/images/football.jpg', alt: 'Students playing football' },
]

export default function GalleryPage() {
  const [filter, setFilter] = useState(FILTERS[0])
  const shown = filter === FILTERS[0] ? [...ITEMS, ...ITEMS] : ITEMS.filter((i) => i.f === filter)
  return (
    <SiteShell active="/gallery">
      <PageHead eyebrow="OUR GALLERY" title="Small moments. Lasting memories." sub="A glimpse of learning, friendship and life at our school." />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mt-10"><FilterPills items={FILTERS} value={filter} onChange={setFilter} /></div>
        <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
          {shown.map((i, n) => (
            <figure key={`${i.title}-${n}`}>
              <Image src={i.src} alt={i.alt} width={420} height={330} className="h-[330px] w-full rounded-2xl object-cover" />
              <figcaption className="mt-5 text-xl font-semibold text-[var(--cgs-heading)]">{i.title}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-16 text-sm text-[var(--cgs-muted)]">Photography shown is illustrative. Use only approved school photographs with guardian consent.</p>
      </div>
    </SiteShell>
  )
}
