import Link from 'next/link'
import Image from 'next/image'
import { Lockup } from './SiteShell'

export const authInput =
  'mt-2 h-12 w-full rounded-lg font-normal border border-[var(--cgs-control)] bg-[var(--cgs-surface)] px-4 text-sm text-[var(--cgs-text)] placeholder:text-[var(--cgs-muted)]'
export const authLabel = 'block text-sm font-semibold text-[var(--cgs-navy)]'
export const authPrimary =
  'inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--cgs-primary)] text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)] disabled:opacity-60'
export const authSecondary =
  'inline-flex h-12 w-full items-center justify-center rounded-lg border border-[var(--cgs-primary)] bg-[var(--cgs-tint)] text-sm font-semibold text-[var(--cgs-navy)]'

export function BackToLogin() {
  return (
    <Link href="/login" className={authSecondary}>
      Back to login
    </Link>
  )
}

export function AuthSplit({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[var(--cgs-surface)] text-[var(--cgs-text)] lg:grid-cols-[45%_55%]">
      <aside className="hidden flex-col justify-between bg-[var(--cgs-navy)] p-[60px] text-white lg:flex">
        <div>
          <Link href="/" className="inline-block rounded-2xl bg-white p-3" aria-label="Chosen Generation School home">
            <Lockup />
          </Link>
          <Image src="/images/classroom.jpg" alt="Students and their teacher reading together" width={530} height={390} priority className="mt-[70px] h-[390px] w-full max-w-[530px] rounded-2xl object-cover" />
          <p className="mt-16 font-serif text-5xl font-semibold">Born to Excel.</p>
          <p className="mt-8 text-xl">A connected school. A supported child.</p>
        </div>
        <p className="text-sm">Chosen Generation School</p>
      </aside>
      <main className="flex flex-col justify-between px-6 py-12 sm:px-12 lg:px-[170px] lg:py-[100px]">
        <div className="w-full max-w-[500px]">
          <Link href="/" className="lg:hidden" aria-label="Chosen Generation School home"><Lockup /></Link>
          <div className="hidden lg:block"><Lockup /></div>
          <h1 className="mt-16 text-4xl font-semibold text-[var(--cgs-navy)] lg:mt-24">{title}</h1>
          {sub && <p className="mt-6 text-lg">{sub}</p>}
          <div className="mt-12">{children}</div>
        </div>
        <p className="mt-16 max-w-[500px] text-sm text-[var(--cgs-muted)]">
          Need help? Contact the school office.
          <br />
          Your account opens the dashboard for your assigned role.
        </p>
      </main>
    </div>
  )
}

export function Notice({ kind, children }: { kind: 'error' | 'success'; children: React.ReactNode }) {
  const c = kind === 'error'
    ? 'border-[var(--cgs-danger)] bg-[var(--cgs-danger-soft)] text-[var(--cgs-danger)]'
    : 'border-[var(--cgs-success)] bg-[var(--cgs-success-soft)] text-[var(--cgs-success)]'
  return <p role={kind === 'error' ? 'alert' : 'status'} className={`mb-6 rounded-lg border p-4 text-sm ${c}`}>{children}</p>
}
