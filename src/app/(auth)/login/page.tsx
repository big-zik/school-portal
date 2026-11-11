'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'SessionExpired' ? 'Your session expired. Please log in again.' : ''
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
        // Redirect to callbackUrl or default dashboard
        if (callbackUrl) {
          router.push(callbackUrl)
        } else {
          // If logged in, check role or navigate to root which redirects to role dashboard
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

  // Quick Demo Logins
  const setDemoRole = (roleEmail: string) => {
    setEmail(roleEmail)
    setPassword('Password@123')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 p-4">
      {/* School Emblem / Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-3">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          St. Augustine International Academy
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          Unified School Management, Learning & Administration Portal
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl border-gray-200/80 dark:border-gray-800 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-center">Sign in to your portal</CardTitle>
          <CardDescription className="text-xs text-center">
            Enter your school credentials to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Login Picker */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center mb-2.5">
              🚀 1-Click Demo Accounts (Password: Password@123)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole('student.daniel@school.com')}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-all"
              >
                <span className="text-sm">🎓</span>
                <div>
                  <p className="font-semibold text-[11px]">Student</p>
                  <p className="text-[10px] text-gray-500 truncate">student.daniel</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('parent.johnson@school.com')}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-all"
              >
                <span className="text-sm">👨‍👧</span>
                <div>
                  <p className="font-semibold text-[11px]">Parent</p>
                  <p className="text-[10px] text-gray-500 truncate">parent.johnson</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('teacher.smith@school.com')}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-all"
              >
                <span className="text-sm">👨‍🏫</span>
                <div>
                  <p className="font-semibold text-[11px]">Teacher</p>
                  <p className="text-[10px] text-gray-500 truncate">teacher.smith</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('admin@school.com')}
                className="flex items-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-all"
              >
                <span className="text-sm">🏫</span>
                <div>
                  <p className="font-semibold text-[11px]">Admin</p>
                  <p className="text-[10px] text-gray-500 truncate">admin@school</p>
                </div>
              </button>
            </div>

            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setDemoRole('superadmin@school.com')}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                👑 Or sign in as Super Administrator (superadmin@school.com)
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4 text-xs text-gray-500">
          <span>St. Augustine International Academy © 2026. All rights reserved.</span>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading portal...</div>}>
      <LoginFormContent />
    </React.Suspense>
  )
}
