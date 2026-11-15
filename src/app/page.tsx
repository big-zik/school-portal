import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SiteShell } from '@/components/site/SiteShell'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

const STAGES = [
  { tag: 'EARLY YEARS', title: 'A joyful first step', body: 'Play, discovery and strong foundations.', tint: false },
  { tag: 'PRIMARY SCHOOL', title: 'Curious minds grow', body: 'Building skills, confidence and character.', tint: true },
  { tag: 'SECONDARY SCHOOL', title: 'Ready for what comes next', body: 'Focused learning with a broader outlook.', tint: false },
]

const LIFE = [
  { src: '/images/science-lab.jpg', tag: 'LEARNING', title: 'Science, curiosity and discovery', alt: 'Students and a teacher working on a science experiment' },
  { src: '/images/classroom.jpg', tag: 'COMMUNITY', title: 'Learning together, every day', alt: 'Students and a teacher sharing books in a classroom' },
  { src: '/images/football.jpg', tag: 'BEYOND THE CLASSROOM', title: 'Finding joy in sport', alt: 'Students playing football on the school field' },
]

export default async function HomePage() {
  const user = await getServerUser()

  // If already authenticated, redirect to appropriate role portal
  if (user && user.roles?.length) {
    if (user.roles.includes('SUPER_ADMIN')) redirect('/super-admin')
    if (user.roles.includes('ADMIN')) redirect('/admin')
    if (user.roles.includes('TEACHER')) redirect('/teacher')
    if (user.roles.includes('PARENT')) redirect('/parent')
    if (user.roles.includes('STUDENT')) redirect('/student')
  }

  return (
    <SiteShell active="/">
      {/* Hero */}
      <section className="bg-[var(--cgs-tint)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-[34px]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cgs-navy)]">Welcome to Chosen Generation</p>
            <h1 className="mt-10 font-serif text-5xl font-semibold leading-[1.3] text-[var(--cgs-navy)] lg:text-[56px]">
              A bright future
              <br />
              begins here.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--cgs-text)]">
              A caring school where curiosity grows, character matters, and every child is encouraged to excel.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link href="/admissions/apply" className="inline-flex h-12 items-center rounded-lg bg-[var(--cgs-primary)] px-9 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]">
                Start an application
              </Link>
              <Link href="/about" className="inline-flex h-12 items-center rounded-lg border border-[var(--cgs-primary)] px-9 text-sm font-semibold text-[var(--cgs-primary)] hover:bg-[var(--cgs-surface)]">
                Explore our school
              </Link>
            </div>
          </div>
          <div className="relative pb-8">
            <Image src="/images/classroom.jpg" alt="Students and their teacher reading together in a bright classroom" width={600} height={457} priority className="h-[360px] w-full rounded-3xl object-cover lg:h-[400px]" />
            <div className="absolute bottom-0 left-[41%] rounded-xl bg-[var(--cgs-gold)] px-6 py-4 font-serif text-xl text-[var(--cgs-on-accent)] shadow-sm">
              Born to Excel
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {['Purposeful learning', 'A caring community', 'Confidence for life'].map((t, i) => (
            <div key={t}>
              <p className="text-lg font-medium text-[var(--cgs-primary)]">{`0${i + 1}`}</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--cgs-primary)]">{t}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* More than a classroom */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="font-serif text-4xl font-semibold text-[var(--cgs-navy)]">More than a classroom.</h2>
        <p className="mt-3 text-[var(--cgs-muted)]">The foundations for a life of learning.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STAGES.map((c) => (
            <div key={c.tag} className={`flex min-h-[236px] flex-col justify-between rounded-2xl p-6 ${c.tint ? 'bg-[var(--cgs-tint)]' : 'bg-[var(--cgs-tint)]/50'}`}>
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-[var(--cgs-primary)]">{c.tag}</p>
                <h3 className="mt-6 text-2xl font-semibold text-[var(--cgs-navy)]">{c.title}</h3>
                <p className="mt-4 text-sm text-[var(--cgs-text)]">{c.body}</p>
              </div>
              <Link href="/about" className="text-sm font-semibold text-[var(--cgs-primary)] hover:underline">Discover more →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Belong */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Image src="/images/science-lab.jpg" alt="Students and a teacher working on a science experiment" width={610} height={437} className="h-auto w-full rounded-2xl object-cover" />
        <div className="lg:pl-12">
          <h2 className="font-serif text-4xl font-semibold leading-snug text-[var(--cgs-navy)]">
            A place to belong.
            <br />A reason to aim higher.
          </h2>
          <p className="mt-8 max-w-xl leading-relaxed text-[var(--cgs-text)]">
            We work with families to nurture capable, thoughtful young people. Learning goes beyond lessons: students build friendships, explore new interests and learn to contribute.
          </p>
          <Link href="/about" className="mt-14 inline-flex h-11 items-center rounded-lg border border-[var(--cgs-primary)] bg-[var(--cgs-tint)] px-8 text-sm font-semibold text-[var(--cgs-primary)]">
            Meet our school
          </Link>
        </div>
      </section>

      {/* Life */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="font-serif text-4xl font-semibold text-[var(--cgs-navy)]">Life at Chosen Generation</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {LIFE.map((l) => (
            <figure key={l.title}>
              <Image src={l.src} alt={l.alt} width={420} height={210} className="h-[146px] w-full rounded-2xl object-cover sm:h-[210px]" />
              <figcaption className="mt-5">
                <p className="text-[11px] font-semibold tracking-wider text-[var(--cgs-primary)]">{l.tag}</p>
                <p className="mt-3 text-lg font-semibold text-[var(--cgs-navy)]">{l.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[var(--cgs-tint)] px-8 py-8 sm:flex-row sm:items-center">
          <p className="font-serif text-2xl text-[var(--cgs-navy)]">Your child’s next chapter starts here.</p>
          <Link href="/admissions/apply" className="inline-flex h-12 items-center rounded-lg bg-[var(--cgs-primary)] px-9 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]">
            Apply for admission
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}
