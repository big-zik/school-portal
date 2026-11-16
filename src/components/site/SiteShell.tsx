import Link from 'next/link'
import { MobileNav } from './MobileNav'
import { PaletteSwitch } from './PaletteSwitch'
import { ScrollFx } from './ScrollFx'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/admissions', label: 'Admissions' },
  { href: '/news', label: 'News' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
]

export function Lockup() {
  return (
    <span className="flex items-center gap-3">
      <span className="foil-bg grid h-[46px] w-[46px] place-items-center rounded-[13px] font-serif text-lg font-bold text-[var(--cgs-on-foil)] shadow-[inset_0_0_0_1px_rgb(255_255_255/.45),0_2px_8px_rgb(124_90_20/.28)]">
        CG
      </span>
      <span className="flex flex-col text-[12.5px] font-semibold leading-tight tracking-[0.07em] text-[var(--cgs-heading)]">
        CHOSEN GENERATION
        <small className="text-[11px] font-normal tracking-normal text-[var(--cgs-subdued)]">Born to Excel</small>
      </span>
    </span>
  )
}

export function SiteHeader({ active }: { active: string }) {
  return (
    <>
      <div className="bg-[var(--cgs-sidebar)] text-[13px] text-[var(--cgs-on-sidebar)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <p>
            <span className="font-semibold">2027 entry applications are open</span>
            <span className="hidden sm:inline"> &nbsp;·&nbsp; CGS (primary) and CGHS (secondary)</span>
          </p>
          <Link href="/admissions/apply" className="font-semibold hover:underline">
            Apply now →
          </Link>
        </div>
      </div>
      <header className="relative border-b border-[var(--cgs-border)] bg-[var(--cgs-surface)]">
        <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Chosen Generation home">
            <Lockup />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-9 text-[15px] md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active === n.href ? 'page' : undefined}
                className={`relative py-7 ${active === n.href ? 'font-semibold text-[var(--cgs-heading)] after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-[image:var(--cgs-foil)] after:content-[""]' : 'text-[var(--cgs-text)] hover:text-[var(--cgs-primary)]'}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg bg-[var(--cgs-primary)] px-5 text-sm font-semibold text-[var(--cgs-on-primary)] transition-colors hover:bg-[var(--cgs-primary-hover)] sm:px-6"
            >
              School portal
            </Link>
            <MobileNav items={NAV} active={active} />
          </div>
        </div>
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-[var(--cgs-sidebar)] text-[var(--cgs-on-sidebar)]">
      <div aria-hidden className="foil-bg absolute inset-x-0 top-0 h-[3px]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="foil w-max font-serif text-2xl font-bold">Every child is born to excel.</p>
          <p className="mt-3 text-sm text-white/90">
            Chosen Generation School (CGS) for primary
            <br />
            Chosen Generation High School (CGHS) for secondary
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/90">
            <span>Appearance</span>
            <PaletteSwitch inverse />
          </div>
          <p className="mt-6 text-xs text-white/85">
            © 2026 Chosen Generation · <Link href="/contact" className="underline underline-offset-2">Privacy</Link> ·{' '}
            <Link href="/contact" className="underline underline-offset-2">Accessibility</Link>
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li><Link href="/about" className="hover:underline">About our schools</Link></li>
            <li><Link href="/admissions" className="hover:underline">Admissions</Link></li>
            <li><Link href="/news" className="hover:underline">News &amp; events</Link></li>
            <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Get in touch</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li><Link href="/contact" className="hover:underline">Contact the school office</Link></li>
            <li><Link href="/contact" className="hover:underline">Book a school visit</Link></li>
            <li><Link href="/contact" className="hover:underline">Parent support</Link></li>
            <li><Link href="/login" className="hover:underline">School portal</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export function SiteShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--cgs-canvas)] text-[var(--cgs-text)]">
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollFx />
      <SiteHeader active={active} />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
