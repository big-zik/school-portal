'use client'

import React, { useState } from 'react'
import { AuthSplit, Notice, BackToLogin, authInput, authLabel, authPrimary } from '@/components/site/AuthSplit'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) setError(json.error || 'Something went wrong. Please try again.')
      else setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplit title="Forgot your password?" sub="Enter your registered email. We’ll send a reset link.">
      <form onSubmit={handleSubmit} className="flex min-h-[340px] flex-col">
        {error && <Notice kind="error">{error}</Notice>}
        {submitted && <Notice kind="success">If that email is registered, a reset link is on its way. Check your inbox and spam folder.</Notice>}
        <label className={authLabel}>
          Email address
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={authInput} />
        </label>
        <div className="mt-auto space-y-6 pt-12">
          <button type="submit" disabled={loading} className={authPrimary}>{loading ? 'Sending…' : 'Send reset link'}</button>
          <BackToLogin />
        </div>
      </form>
    </AuthSplit>
  )
}
