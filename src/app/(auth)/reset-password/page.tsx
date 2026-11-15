'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthSplit, Notice, BackToLogin, authInput, authLabel, authPrimary } from '@/components/site/AuthSplit'

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = json.errors ? (Object.values(json.errors).flat()[0] as string | undefined) : undefined
        setError(first || json.error || 'Could not reset password')
      } else setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const type = show ? 'text' : 'password'
  return (
    <AuthSplit title="Set a new password" sub="Choose a password you have not used before.">
      {!token && (
        <Notice kind="error">
          This reset link is missing or incomplete. Open the link from your email, or <Link href="/forgot-password" className="font-semibold underline">request a new one</Link>.
        </Notice>
      )}
      {done && <Notice kind="success">Password updated. You can now sign in with your new password.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      <form onSubmit={handleSubmit}>
        <label className={authLabel}>
          New password
          <input required minLength={12} type={type} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 12 characters" className={authInput} />
        </label>
        <label className={`${authLabel} mt-8`}>
          Confirm new password
          <input required minLength={12} type={type} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Enter password again" className={authInput} />
        </label>
        <p className="mt-8 text-sm text-[var(--cgs-muted)]">Use 12+ characters. Avoid your name or admission number.</p>
        <label className="mt-1 flex items-center gap-3 text-sm text-[var(--cgs-muted)]">
          Show password
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-[var(--cgs-primary)]" />
        </label>
        <div className="mt-8 space-y-6">
          <button type="submit" disabled={loading || !token || done} className={authPrimary}>{loading ? 'Saving…' : 'Save new password'}</button>
          <BackToLogin />
        </div>
      </form>
    </AuthSplit>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
