'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
      if (!res.ok) {
        setError(json.error || 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <CardTitle className="text-2xl font-bold text-[var(--cgs-heading)]">Reset Password</CardTitle>
          <CardDescription className="text-xs text-[var(--cgs-subdued)]">
            Enter your registered school email to receive a secure password recovery link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Password Recovery Link Dispatched
              </p>
              <p className="text-[11px] text-gray-500">
                If an active account exists for <strong>{email}</strong>, you will receive an encrypted reset link valid for 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  School Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    required
                    placeholder="name@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-red-600">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full text-xs font-semibold gap-1.5">
                {loading ? 'Sending…' : 'Send Recovery Instructions'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
