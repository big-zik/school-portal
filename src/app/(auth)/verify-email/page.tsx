'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthSplit, BackToLogin, authPrimary } from '@/components/site/AuthSplit'

type Status = 'verifying' | 'success' | 'error'

function VerifyEmailBody() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const address = params.get('email') ?? ''
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        setStatus(res.ok ? 'success' : 'error')
        setMessage(res.ok ? json.message || 'Email verified successfully' : json.error || 'Verification failed')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
        setMessage('Network error. Please try again.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // No token: the "check your email" holding screen
  if (!token) {
    return (
      <AuthSplit title="Check your email" sub={`We sent a verification link${address ? ` to ${address}` : ''}.`}>
        <div className="rounded-2xl bg-[var(--cgs-tint)] p-6">
          <p className="text-xl font-semibold text-[var(--cgs-heading)]">Open the link to activate your account.</p>
          <p className="mt-8">Check your spam folder too. The link expires in 24 hours. You can request another below.</p>
        </div>
        <div className="mt-24 space-y-6">
          <Link href="/contact" className={authPrimary}>Ask the school office to resend</Link>
          <BackToLogin />
        </div>
      </AuthSplit>
    )
  }

  const title = status === 'verifying' ? 'Verifying your email' : status === 'success' ? 'Email verified' : 'Verification failed'
  return (
    <AuthSplit title={title} sub={status === 'verifying' ? 'One moment…' : message}>
      <div className="space-y-6" aria-live="polite">
        {status === 'success' ? <Link href="/login" className={authPrimary}>Continue to sign in</Link> : <BackToLogin />}
      </div>
    </AuthSplit>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VerifyEmailBody />
    </Suspense>
  )
}
