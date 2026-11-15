'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'SessionExpired' ? 'Your session expired. Please sign in again.' : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          router.push('/')
          router.refresh()
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Logins for verification
  const setDemoRole = (roleEmail: string) => {
    setEmail(roleEmail)
    setPassword('Password@123')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[var(--cgs-canvas)] text-[var(--cgs-text)]">
      {/* Left Brand Panel (Figma Node 2:676 Brand panel) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[var(--cgs-navy)] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--cgs-sky)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--cgs-primary)]/20 rounded-full blur-3xl pointer-events-none" />

        {/* White Crest Tile (Figma Node 2:677) */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-md">
            <div className="h-10 w-10 rounded-xl bg-[var(--cgs-navy)] text-white font-bold flex items-center justify-center text-lg">
              CG
            </div>
            <div className="flex flex-col text-[var(--cgs-navy)]">
              <span className="text-sm font-bold leading-tight">CHOSEN GENERATION</span>
              <span className="text-[11px] font-semibold text-[var(--cgs-navy)]/80 tracking-wider uppercase">Born to Excel</span>
            </div>
          </Link>
        </div>

        {/* Center Editorial Visual Card (Figma Node 2:683) */}
        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[var(--cgs-gold)] text-[var(--cgs-text)] font-bold flex items-center justify-center text-xl shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
              Born to Excel.
            </h2>
            <p className="text-base text-blue-100 leading-relaxed">
              A connected school. A supported child. Empowering teachers, engaging parents, and elevating students.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-blue-200/80">
          <p>Chosen Generation School &middot; Academic Portal v2.0</p>
          <p className="mt-0.5">&copy; 2026 All rights reserved.</p>
        </div>
      </div>

      {/* Right Sign-in Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="inline-flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[var(--cgs-border)]">
              <div className="h-10 w-10 rounded-xl bg-[var(--cgs-navy)] text-white font-bold flex items-center justify-center text-lg">
                CG
              </div>
              <div className="flex flex-col text-[var(--cgs-navy)]">
                <span className="text-sm font-bold leading-tight">CHOSEN GENERATION</span>
                <span className="text-[11px] font-semibold text-[var(--cgs-navy)]/80">Born to Excel</span>
              </div>
            </Link>
          </div>

          {/* Form Header (Figma Nodes 2:692 - 2:693) */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--cgs-heading)]">
              Welcome back
            </h1>
            <p className="text-sm text-[var(--cgs-subdued)]">
              Sign in to your school account with your email or admission number.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--cgs-danger-soft)] border border-[var(--cgs-danger)]/30 p-3.5 text-xs text-[var(--cgs-danger)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field: Email or admission number (Figma Node 2:694) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--cgs-heading)] block">
                Email or admission number
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--cgs-subdued)]" />
                <Input
                  type="text"
                  placeholder="e.g. CGS/2026/0142 or parent.johnson@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--cgs-surface)] border-[var(--cgs-border)] text-sm focus:border-[var(--cgs-primary)] focus:ring-[var(--cgs-primary)]"
                  required
                />
              </div>
            </div>

            {/* Field: Password (Figma Node 2:697) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--cgs-heading)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[var(--cgs-primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--cgs-subdued)]" />
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--cgs-surface)] border-[var(--cgs-border)] text-sm focus:border-[var(--cgs-primary)] focus:ring-[var(--cgs-primary)]"
                  required
                />
              </div>
            </div>

            {/* Remember Me (Figma Node 2:700) */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--cgs-border)] text-[var(--cgs-primary)] focus:ring-[var(--cgs-primary)]"
              />
              <label htmlFor="remember" className="text-xs text-[var(--cgs-subdued)] cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Submit Primary Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Verifying credentials...' : 'Sign in →'}
            </Button>
          </form>

          {/* Role Quick Selector */}
          <div className="pt-4 border-t border-[var(--cgs-border)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--cgs-subdued)] uppercase tracking-wider">
                Instant Demo Access
              </span>
              <span className="text-[10px] text-[var(--cgs-subdued)]">All: Password@123</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoRole('student.daniel@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('parent.johnson@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('teacher.smith@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('admin@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('accountant@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('superadmin@school.com')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--cgs-surface)] border border-[var(--cgs-border)] hover:border-[var(--cgs-primary)] text-left truncate transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          {/* Help & Support Note (Figma Node 2:706) */}
          <div className="text-center pt-2">
            <p className="text-xs text-[var(--cgs-subdued)]">
              Need help? Contact the school office &middot; Your account opens the dashboard for your assigned role.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[var(--cgs-canvas)] flex items-center justify-center">Loading...</div>}>
      <LoginFormContent />
    </React.Suspense>
  )
}
