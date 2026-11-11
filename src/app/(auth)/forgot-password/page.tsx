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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200/80 dark:border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-xs">
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

              <Button type="submit" className="w-full text-xs font-semibold gap-1.5">
                Send Recovery Instructions <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
