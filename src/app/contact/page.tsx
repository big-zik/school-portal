'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SiteShell } from '@/components/site/SiteShell'
import { PageHead } from '@/components/site/PageHead'

const field =
  'mt-2 h-12 w-full rounded-lg font-normal border border-[var(--cgs-control)] bg-[var(--cgs-surface)] px-4 text-sm text-[var(--cgs-text)] placeholder:text-[var(--cgs-muted)] focus-visible:outline-2 focus-visible:outline-offset-2'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic: topic || 'General enquiry', message }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setTopic('')
        setMessage('')
      } else setError(data.error || 'Failed to send your message')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the school server')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SiteShell active="/contact">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <PageHead eyebrow="CONTACT US" title="Let’s talk about your child’s future." sub="Ask a question, arrange a visit or get help with the school portal." />
        <div className="mt-16 grid items-start gap-8 lg:grid-cols-[1.74fr_1fr]">
          <form onSubmit={submit} className="rounded-3xl bg-[var(--cgs-tint)]/50 p-8" noValidate={false}>
            <h2 className="text-3xl font-semibold text-[var(--cgs-navy)]">Send a message</h2>
            {submitted && (
              <p role="status" className="mt-6 rounded-lg border border-[var(--cgs-success)] bg-[var(--cgs-success-soft)] p-4 text-sm text-[var(--cgs-success)]">
                Thank you. Your message has been sent and the school office will reply soon.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-6 rounded-lg border border-[var(--cgs-danger)] bg-[var(--cgs-danger-soft)] p-4 text-sm text-[var(--cgs-danger)]">{error}</p>
            )}
            <label className="mt-8 block text-sm font-semibold text-[var(--cgs-navy)]">
              Your name *
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={field} />
            </label>
            <label className="mt-8 block text-sm font-semibold text-[var(--cgs-navy)]">
              Email address *
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
            </label>
            <label className="mt-8 block text-sm font-semibold text-[var(--cgs-navy)]">
              What can we help with? *
              <input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Admissions / school portal / general enquiry" className={field} />
            </label>
            <label className="mt-8 block text-sm font-semibold text-[var(--cgs-navy)]">
              Message *
              <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us how we can help" className={`${field} h-auto py-3`} />
            </label>
            <p className="mt-12 text-sm text-[var(--cgs-text)]">We use your details only to respond to this enquiry.</p>
            <button type="submit" disabled={busy} className="mt-10 inline-flex h-12 w-full max-w-[300px] items-center justify-center rounded-lg bg-[var(--cgs-primary)] text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)] disabled:opacity-60">
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </form>
          <aside className="rounded-3xl bg-[var(--cgs-tint)] p-8">
            <h2 className="text-3xl font-semibold text-[var(--cgs-navy)]">Visit our school</h2>
            <p className="mt-8 text-lg text-[var(--cgs-text)]">Arrange a visit through the school office. We will confirm the address and a suitable time.</p>
            <h3 className="mt-16 text-xl font-semibold text-[var(--cgs-navy)]">Office hours</h3>
            <p className="mt-6 text-lg text-[var(--cgs-text)]">Monday – Friday<br />8:00am – 4:00pm (WAT)</p>
            <h3 className="mt-16 text-xl font-semibold text-[var(--cgs-navy)]">Already a parent?</h3>
            <p className="mt-6 text-lg text-[var(--cgs-text)]">Sign in to send a private message about fees, attendance or your child’s learning.</p>
            <Link href="/login" className="mt-12 inline-flex h-12 w-full max-w-[340px] items-center justify-center rounded-lg bg-[var(--cgs-primary)] text-sm font-semibold text-[var(--cgs-on-primary)] hover:bg-[var(--cgs-primary-hover)]">
              Open school portal
            </Link>
          </aside>
        </div>
      </div>
    </SiteShell>
  )
}
