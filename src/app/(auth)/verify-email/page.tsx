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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200/80 dark:border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
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
