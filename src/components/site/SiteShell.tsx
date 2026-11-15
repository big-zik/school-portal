import Link from 'next/link'

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
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--cgs-tint)] text-lg font-semibold text-[var(--cgs-navy)]">
        CG
      </span>
      <span className="flex flex-col leading-tight text-[var(--cgs-navy)]">
        <span className="text-[13px] font-semibold tracking-wide">CHOSEN</span>
        <span className="text-[13px] font-semibold tracking-wide">GENERATION</span>
        <span className="text-[11px]">Born to Excel</span>
      </span>
    </span>
  )
}

export function SiteHeader({ active }: { active: string }) {
  return (
    <>
      <div className="bg-[var(--cgs-navy)] text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <p>
            <span className="font-semibold">2026/2027 admissions are open</span>
            <span className="mx-2" aria-hidden>·</span>
            <span className="hidden sm:inline">Give your child a confident start</span>
          </p>
          <Link href="/admissions/apply" className="font-semibold hover:underline">
            Apply now →
          </Link>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[var(--cgs-border)] bg-[var(--cgs-surface)]">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Chosen Generation School home">
            <Lockup />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-10 text-sm md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active === n.href ? 'page' : undefined}
                className={
                  active === n.href
                    ? 'font-semibold text-[var(--cgs-primary)]'
                    : 'text-[var(--cgs-text)] hover:text-[var(--cgs-primary)]'
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-lg bg-[var(--cgs-primary)] px-6 text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]"
          >
            School portal
          </Link>
        </div>
        <nav aria-label="Primary mobile" className="flex gap-5 overflow-x-auto border-t border-[var(--cgs-border)] px-4 py-2 text-sm md:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={active === n.href ? 'font-semibold text-[var(--cgs-primary)]' : 'text-[var(--cgs-text)]'}>
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-[var(--cgs-navy)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="inline-block rounded-lg bg-white p-2.5">
            <Lockup />
          </div>
          <p className="mt-6 font-serif text-xl">Every child is born to excel.</p>
          <p className="mt-3 text-sm text-white/85">Learn with purpose. Grow with confidence.</p>
          <p className="mt-6 text-xs text-white/80">
            © 2026 Chosen Generation School · <Link href="/contact" className="hover:underline">Privacy</Link> ·{' '}
            <Link href="/contact" className="hover:underline">Accessibility</Link>
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            <li><Link href="/about" className="hover:underline">About our school</Link></li>
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
    <div className="flex min-h-screen flex-col bg-[var(--cgs-surface)] text-[var(--cgs-text)]">
      <SiteHeader active={active} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
