import Link from 'next/link'
import Image from 'next/image'
import { SiteShell } from '@/components/site/SiteShell'
import { PageHead } from '@/components/site/PageHead'

const VALUES = [
  { t: 'Care', b: 'Every child deserves to feel safe and valued.' },
  { t: 'Character', b: 'We practise respect, responsibility and integrity.' },
  { t: 'Excellence', b: 'We celebrate effort, progress and achievement.' },
]

export default function AboutPage() {
  return (
    <SiteShell active="/about">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PageHead eyebrow="OUR SCHOOL" title="Every child. Every possibility." sub="An education rooted in care, purpose and the belief that every child can excel." />
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1.35fr_1fr]">
          <Image src="/images/classroom.jpg" alt="Students and their teacher reading together in a bright classroom" width={600} height={457} className="h-auto w-full rounded-3xl object-cover" />
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[var(--cgs-navy)]">Our purpose</h2>
            <p className="mt-8 text-xl leading-relaxed text-[var(--cgs-text)]">
              To nurture curious minds and strong character in a school community where children feel seen, supported and challenged.
            </p>
            <p className="mt-24 text-sm font-semibold text-[var(--cgs-primary)]">Our motto</p>
            <p className="mt-6 font-serif text-4xl font-semibold text-[var(--cgs-navy)]">Born to Excel</p>
          </div>
        </div>
        <h2 className="mt-24 font-serif text-4xl font-semibold text-[var(--cgs-navy)]">What guides us</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.t} className="min-h-[210px] rounded-2xl bg-[var(--cgs-tint)] p-6">
              <h3 className="text-2xl font-semibold text-[var(--cgs-navy)]">{v.t}</h3>
              <p className="mt-6 text-lg text-[var(--cgs-text)]">{v.b}</p>
            </div>
          ))}
        </div>
        <Link href="/contact" className="mt-12 inline-flex h-12 items-center rounded-lg bg-[var(--cgs-primary)] px-12 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]">
          Book a school visit
        </Link>
      </div>
    </SiteShell>
  )
}
