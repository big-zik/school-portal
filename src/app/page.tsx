import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getServerUser()

  // If already authenticated, redirect to appropriate role portal
  if (user && user.roles?.length) {
    if (user.roles.includes('SUPER_ADMIN')) redirect('/super-admin')
    if (user.roles.includes('ADMIN')) redirect('/admin')
    if (user.roles.includes('TEACHER')) redirect('/teacher')
    if (user.roles.includes('PARENT')) redirect('/parent')
    if (user.roles.includes('STUDENT')) redirect('/student')
  }

  const portals = [
    {
      title: 'Student Portal',
      desc: 'Check class timetable, submit assignments, view marks, access e-resources and report cards.',
      role: 'student.daniel@school.com',
      badge: 'Academic',
      icon: GraduationCap,
      color: 'blue',
      href: '/login',
    },
    {
      title: 'Parent Portal',
      desc: 'Track your child’s attendance, view term results, pay school fees online, and book teacher meetings.',
      role: 'parent.johnson@school.com',
      badge: 'Family & Bursary',
      icon: Users,
      color: 'emerald',
      href: '/login',
    },
    {
      title: 'Teacher Portal',
      desc: 'Record daily attendance, upload notes, publish quizzes, score continuous assessments and enter exam marks.',
      role: 'teacher.smith@school.com',
      badge: 'Instruction',
      icon: BookOpen,
      color: 'purple',
      href: '/login',
    },
    {
      title: 'Admin Console',
      desc: 'Student admissions, fee invoices, class timetables, library, transport, hostels, and broad sheets.',
      role: 'admin@school.com',
      badge: 'Operations',
      icon: ShieldCheck,
      color: 'amber',
      href: '/login',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Top School Bar */}
      <div className="bg-blue-900 text-blue-100 py-2 px-4 text-xs border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +234 1 234 5678
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> admissions@staugustine.edu
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>2024/2025 Session • Term 2 (Spring)</span>
            <span className="text-emerald-400 font-semibold">● Portal Online</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/80 dark:border-gray-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                CHOSEN GENERATION SCHOOL
              </h1>
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                School Management & Learning Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-5">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-50/50 via-slate-50 to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-blue-200 text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40">
            ✨ Complete School Digital Infrastructure
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 max-w-3xl mx-auto leading-tight">
            One Unified Portal for Academics, Attendance, Fees & Administration
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Empowering students, teachers, parents, and school leadership with real-time academic records, instant fee payments, seamless attendance roll-call, and forensic audit security.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-sm font-bold gap-2 shadow-lg shadow-blue-500/25">
                Enter School Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Portals Gateway Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-1 mb-10">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Select Your Role Gateway
          </h3>
          <p className="text-xs text-gray-500">
            Role-based authorization ensures you access exactly what you are permitted to see
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((p, idx) => {
            const Icon = p.icon
            return (
              <Card key={idx} className="flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all border-gray-200/80 dark:border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {p.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Link href={`/login?role=${encodeURIComponent(p.role)}`}>
                      <Button variant="outline" className="w-full text-xs font-semibold justify-between">
                        <span>Access Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-14 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Enterprise School Standards
            </h3>
            <p className="text-xs text-gray-500">
              Built following WCAG 2.2 accessibility, zero-trust RBAC, and cloud-scale availability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Continuous Assessment & Broad Sheets</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Automatic computation of weighted averages, class percentiles, positions, and principal remarks with cryptographically signed PDF report cards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Online Bursary & Invoicing</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Paystack & Stripe multi-currency checkout, partial payment ledger, automated fee reminders, and instantaneous PDF receipt generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Security & Forensic Audit Trail</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Account lockout brute-force defense, bcrypt password hashing, TOTP MFA, and immutable audit logs capturing every login and grade modification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CHOSEN GENERATION SCHOOL. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">Staff Login</Link>
            <Link href="/login" className="hover:underline">Student Portal</Link>
            <Link href="/login" className="hover:underline">Privacy & Security Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
