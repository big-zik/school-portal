'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SCHOOLS = {
  cgs: {
    tab: 'Primary',
    h: 'A bright future begins here.',
    lede: 'Where curiosity is the first lesson and every child is known by name.',
    name: 'Chosen Generation School (CGS)',
    stage: 'Nursery to Primary 6',
    apply: 'Apply to CGS',
    seal: 'CGS',
    img: '/images/classroom.jpg',
    alt: 'Students and their teacher reading together in a bright classroom',
  },
  cghs: {
    tab: 'Secondary',
    h: 'Aim higher. Prepare for what comes next.',
    lede: 'Focused teaching, practical science and the confidence to lead.',
    name: 'Chosen Generation High School (CGHS)',
    stage: 'JSS 1 to SS 3',
    apply: 'Apply to CGHS',
    seal: 'CGHS',
    img: '/images/science-lab.jpg',
    alt: 'Students and a teacher working on a science experiment',
  },
} as const
type Key = keyof typeof SCHOOLS

const d = (s: string) => ({ ['--d' as string]: s })

export function HeroSchools() {
  const [key, setKey] = useState<Key>('cgs')
  const s = SCHOOLS[key]
  return (
    <section className="hero-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-14">
        <div>
          <div role="group" aria-label="Choose a school" className="rise inline-flex max-w-full gap-2 rounded-2xl border border-white/20 bg-white/10 p-[5px]" style={d('.05s')}>
            {(Object.keys(SCHOOLS) as Key[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={key === k}
                onClick={() => setKey(k)}
                className={`grid rounded-xl px-5 py-2.5 text-left text-sm font-semibold leading-tight ${key === k ? 'foil-bg text-[var(--cgs-on-foil)] shadow-md' : 'text-white'}`}
              >
                {SCHOOLS[k].tab}
                <small className="text-xs font-normal opacity-90">{k.toUpperCase()}</small>
              </button>
            ))}
          </div>
          <h1 className="rise mt-8 min-h-[2.1em] font-serif text-[40px] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[68px]" style={d('.15s')} aria-live="polite">
            {s.h}
          </h1>
          <p className="rise mt-5 max-w-[32em] text-lg leading-relaxed text-white/95 sm:text-[19px] lg:min-h-[3.3em]" style={d('.28s')}>
            {s.lede}
          </p>
          <p className="rise mt-6 text-[15px] font-semibold tracking-wide" style={d('.38s')}>
            <span className="foil text-[17px] font-bold">{s.name}</span>
            <span className="ml-3 font-normal text-white/90">{s.stage}</span>
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3.5" style={d('.48s')}>
            <Link href="/admissions/apply" className="btn-gold inline-flex h-[50px] items-center rounded-[10px] px-7 text-[15px] font-semibold">
              {s.apply}
            </Link>
            <Link href="/contact" className="inline-flex h-[50px] items-center rounded-[10px] border-[1.5px] border-white/55 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
              Book a school visit
            </Link>
          </div>
          <p className="foil mt-8 w-max font-serif text-[28px] font-bold">Born to Excel</p>
        </div>

        <div className="rise relative mx-auto w-full max-w-[430px]" style={d('.2s')}>
          <div className="arch-frame">
            <div className="arch" data-parallax>
              <Image key={s.img} src={s.img} alt={s.alt} width={600} height={457} priority className="transition-opacity" />
            </div>
          </div>
          <div data-seal className="seal foil-bg absolute -left-2 bottom-5 grid h-[104px] w-[104px] place-items-center rounded-full sm:-left-14 sm:bottom-12 sm:h-[132px] sm:w-[132px]" aria-hidden>
            <svg viewBox="0 0 132 132">
              <defs>
                <path id="seal-path" d="M66,66 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
              </defs>
              <text>
                <textPath href="#seal-path">BORN TO EXCEL · CHOSEN GENERATION · </textPath>
              </text>
            </svg>
            <b className="font-serif text-[22px] font-bold text-[var(--cgs-on-foil)] sm:text-[28px]">{s.seal}</b>
          </div>
        </div>
      </div>
    </section>
  )
}
