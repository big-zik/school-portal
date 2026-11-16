import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { SiteShell } from '@/components/site/SiteShell'
import { HeroSchools } from '@/components/site/HeroSchools'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

const SCHOOLS = [
  { code: 'CGS', name: 'Chosen Generation School', level: 'Primary', range: 'Pre-school to Primary 6', body: 'Play, discovery and strong foundations, with teachers who know every child by name.', apply: 'Apply to CGS' },
  { code: 'CGHS', name: 'Chosen Generation High School', level: 'Secondary', range: 'JSS 1 to SS 3', body: 'Focused teaching, practical science and the confidence to lead into university and beyond.', apply: 'Apply to CGHS' },
]

const LIFE = [
  { src: '/images/science-lab.jpg', tag: 'Learning', title: 'Science, curiosity and discovery', alt: 'Students and a teacher working on a science experiment' },
  { src: '/images/classroom.jpg', tag: 'Community', title: 'Learning together, every day', alt: 'Students and a teacher sharing books in a classroom' },
  { src: '/images/football.jpg', tag: 'Beyond the classroom', title: 'Finding joy in sport', alt: 'Students playing football on the school field' },
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
      <HeroSchools />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 data-reveal className="font-serif text-4xl font-bold text-[var(--cgs-heading)]">Two schools, one standard of care.</h2>
        <p data-reveal="1" className="mt-3 max-w-2xl text-[var(--cgs-subdued)]">Choose the stage that fits your child. Both share the same values and the same open door.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {SCHOOLS.map((c, i) => (
            <article key={c.code} data-reveal={i} className="rule-draw flex min-h-[260px] flex-col justify-between rounded-2xl border border-[var(--cgs-border)] bg-[var(--cgs-surface)] p-8">
              <div>
                <p className="text-sm font-semibold text-[var(--cgs-subdued)]">{c.level} · {c.range}</p>
                <h3 className="mt-4 font-serif text-3xl font-bold text-[var(--cgs-heading)]">{c.name} ({c.code})</h3>
                <p className="mt-4 max-w-md text-[var(--cgs-text)]">{c.body}</p>
              </div>
              <Link href="/admissions/apply" className="mt-8 inline-flex h-11 w-max items-center rounded-lg bg-[var(--cgs-primary)] px-6 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]">
                {c.apply}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div data-reveal className="arch-frame mx-auto w-full max-w-[420px]">
          <div className="arch">
            <Image src="/images/science-lab.jpg" alt="Students and a teacher working on a science experiment" width={610} height={437} />
          </div>
        </div>
        <div data-reveal="1" className="lg:pl-10">
          <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--cgs-heading)]">
            A place to belong.
            <br />A reason to aim higher.
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-[var(--cgs-text)]">
            We work with families to nurture capable, thoughtful young people. Learning goes beyond lessons: students build friendships, explore new interests and learn to contribute.
          </p>
          <Link href="/about" className="mt-8 inline-flex h-11 items-center rounded-lg border border-[var(--cgs-primary)] px-8 text-sm font-semibold text-[var(--cgs-primary)] hover:bg-[var(--cgs-tint)]">
            Meet our schools
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 data-reveal className="font-serif text-4xl font-bold text-[var(--cgs-heading)]">Life at Chosen Generation</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {LIFE.map((l, i) => (
            <figure key={l.title} data-reveal={i}>
              <div className="arch-frame arch-sm">
                <div className="arch">
                  <Image src={l.src} alt={l.alt} width={420} height={420} />
                </div>
              </div>
              <figcaption className="mt-5">
                <p className="text-sm font-semibold text-[var(--cgs-subdued)]">{l.tag}</p>
                <p className="mt-1 text-lg font-semibold text-[var(--cgs-heading)]">{l.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="band-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p data-reveal className="font-serif text-3xl font-bold text-white">Your child’s next chapter starts here.</p>
          <Link href="/admissions/apply" className="btn-gold inline-flex h-[50px] items-center rounded-[10px] px-8 text-[15px] font-semibold">
            Apply for admission
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}
