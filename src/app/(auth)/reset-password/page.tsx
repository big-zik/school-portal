'use client'

import React, { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, Lock, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <p className="text-xs font-bold text-red-900">Missing reset link</p>
        <p className="text-[11px] text-gray-600">
          Open the link from your email, or{' '}
          <Link href="/forgot-password" className="text-blue-600 underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

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
        return
      }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
        <p className="text-xs font-bold text-emerald-900">Password updated</p>
        <Link href="/login" className="text-xs text-blue-600 underline">
          Continue to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <p className="text-[11px] text-gray-500">
          At least 8 characters with an uppercase letter, a number and a special character.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
        <Input
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="text-xs"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}{' '}
          {/expired|invalid/i.test(error) && (
            <Link href="/forgot-password" className="underline">
              Request a new link
            </Link>
          )}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full text-xs font-semibold">
        {loading ? 'Updating…' : 'Set New Password'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
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
          <CardTitle className="text-2xl font-bold text-[var(--cgs-heading)]">Choose a New Password</CardTitle>
          <CardDescription className="text-xs text-[var(--cgs-subdued)]">Enter a new password for your account.</CardDescription>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<p className="text-xs text-gray-500 text-center">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
