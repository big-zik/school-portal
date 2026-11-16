'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { AuthSplit, Notice, authInput, authLabel, authPrimary, } from '@/components/site/AuthSplit'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keep, setKeep] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'SessionExpired' ? 'Your session expired. Please sign in again.' : '',
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        setErrorMessage(res.error)
      } else if (callbackUrl) {
        router.push(callbackUrl)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to authenticate. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplit title="Welcome back" sub="Sign in to your school account.">
      <form onSubmit={handleSubmit}>
        {errorMessage && <Notice kind="error">{errorMessage}</Notice>}
        <label className={authLabel}>
          Email or admission number
          <input required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. CGS/2026/0142" className={authInput} />
        </label>
        <label className={`${authLabel} mt-8`}>
          Password
          <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} />
        </label>
        <div className="mt-8 flex items-center justify-between text-sm">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="h-4 w-4 accent-[var(--cgs-primary)]" />
            Keep me signed in
          </label>
          <Link href="/forgot-password" className="font-semibold text-[var(--cgs-primary)] hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className={`${authPrimary} mt-12`}>{loading ? 'Signing in…' : 'Sign in'}</button>
        <div className="mt-6"><Link href="/" className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-[var(--cgs-primary)] bg-[var(--cgs-tint)] text-sm font-semibold text-[var(--cgs-heading)]">Back to website</Link></div>
      </form>
    </AuthSplit>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginFormContent />
    </React.Suspense>
  )
}
