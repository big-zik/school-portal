'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

type Status = 'verifying' | 'success' | 'error'

function VerifyEmailStatus() {
  const token = useSearchParams().get('token') ?? ''
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error')
  const [message, setMessage] = useState(token ? '' : 'Missing verification link. Open the link from your email.')

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
        if (res.ok) {
          setStatus('success')
          setMessage(json.message || 'Email verified successfully')
        } else {
          setStatus('error')
          setMessage(json.error || 'Verification failed')
        }
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

  if (status === 'verifying') {
    return (
      <div className="text-center space-y-2 py-2">
        <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
        <p className="text-xs text-gray-600">Verifying your email…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
        <p className="text-xs font-bold text-emerald-900">{message}</p>
      </div>
    )
  }

  return (
    <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
      <p className="text-xs font-bold text-red-900">{message}</p>
      <p className="text-[11px] text-gray-600">Sign in and request a new verification email from your profile.</p>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--cgs-canvas)] text-[var(--cgs-text)] p-4">
      {/* Brand Badge */}
      <Link href="/" className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[var(--cgs-border)] mb-6">
        <div className="h-9 w-9 rounded-xl bg-[var(--cgs-navy)] text-white font-bold flex items-center justify-center text-sm">
          CG
        </div>
        <div className="flex flex-col text-[var(--cgs-heading)]">
          <span className="text-xs font-bold leading-tight">CHOSEN GENERATION</span>
          <span className="text-[10px] font-semibold text-[var(--cgs-primary)]">Born to Excel</span>
        </div>
      </Link>

      <Card className="w-full max-w-md shadow-lg border-[var(--cgs-border)] bg-[var(--cgs-surface)]">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[var(--cgs-heading)]">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-xs text-gray-500 text-center">Loading…</p>}>
            <VerifyEmailStatus />
          </Suspense>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
          <Link href="/login" className="text-xs text-blue-600 hover:underline font-medium">
            Go to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
