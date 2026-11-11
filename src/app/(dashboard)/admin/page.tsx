import React from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  CreditCard,
  ClipboardCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await getServerUser()

  // Real database metrics with resilient error handling
  let studentCount = 0
  let teacherCount = 0
  let classCount = 0
  let feesBilled = 0
  let feesCollected = 0
  let feesOutstanding = 0
  let recentActivities: any[] = []
  let pendingAdmissions: any[] = []

  try {
    const [
      sCount,
      tCount,
      cCount,
      invoicesAggregate,
      recentLogs,
      admissions,
    ] = await Promise.all([
      prisma.student.count({ where: { deletedAt: null } }),
      prisma.teacher.count({ where: { deletedAt: null } }),
      prisma.class.count(),
      prisma.invoice.aggregate({
        _sum: {
          totalAmount: true,
          paidAmount: true,
          balanceAmount: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.admissionApplication.findMany({
        where: { status: 'PENDING' },
        take: 3,
        orderBy: { appliedAt: 'desc' },
        include: {
          appliedClass: { select: { name: true } },
        },
      }),
    ])

    studentCount = sCount
    teacherCount = tCount
    classCount = cCount
    feesBilled = invoicesAggregate._sum.totalAmount || 0
    feesCollected = invoicesAggregate._sum.paidAmount || 0
    feesOutstanding = invoicesAggregate._sum.balanceAmount || 0

    recentActivities = recentLogs.map((log) => ({
      action: `${log.action} ${log.entityType}`,
      detail: `Module: ${log.module} • ID: ${log.entityId || 'N/A'}`,
      time: formatRelativeTime(log.createdAt),
      user: log.user?.name || 'System Operator',
    }))

    pendingAdmissions = admissions.map((adm) => ({
      id: adm.id,
      type: 'Admission Application',
      applicant: adm.applicantName,
      targetClass: adm.appliedClass?.name || 'Class Unassigned',
      date: adm.appliedAt ? new Date(adm.appliedAt).toLocaleDateString() : 'Recent',
    }))
  } catch (err) {
    console.error('Failed to query live dashboard metrics from database:', err)
  }

  const collectionRate =
    feesBilled > 0 ? ((feesCollected / feesBilled) * 100).toFixed(1) : '100.0'

  return (
    <DashboardLayout user={user} role="ADMIN">
      <div className="space-y-6">
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 md:p-8 shadow-xl border border-blue-900/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-0 text-[11px]">
                School Operations & Governance
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-0 text-[11px]">
                Session Active
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Administrative Control Console 🏫
            </h1>
            <p className="text-xs md:text-sm text-gray-300">
              Campus overview for CHOSEN GENERATION SCHOOL • {studentCount} enrolled students across {classCount} active classes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/students">
              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 gap-1.5 font-semibold">
                <PlusCircle className="w-4 h-4" /> Enrol Student
              </Button>
            </Link>
            <Link href="/admin/fees">
              <Button size="sm" variant="secondary" className="text-xs gap-1.5 font-semibold">
                <CreditCard className="w-4 h-4" /> Manage Invoices
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core Quantitative Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Enrolment</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {studentCount}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live database record
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Teaching Faculty</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {teacherCount} Staff
                </h3>
                <span className="text-[11px] text-gray-500">Active instructors</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Classes & Divisions</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {classCount}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">Configured levels</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fee Collections</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {collectionRate}%
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {formatCurrency(feesCollected)} paid
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column: Recent Audit Activity & Action Approval Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent School Operations Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    School Activity & Audit Trail
                  </CardTitle>
                  <p className="text-xs text-gray-500">Live operational events logged with actor and timestamp</p>
                </div>
                <Link href="/super-admin/audit-logs">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                    All Logs <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentActivities.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-500">No operational audit records logged yet.</p>
                ) : (
                  recentActivities.map((act, idx) => (
                    <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {act.action}
                          </span>
                          <span className="text-[10px] text-gray-400">• {act.time}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{act.detail}</p>
                        <p className="text-[10px] text-gray-400">Actor: {act.user}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Logged
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Financial Overview Banner */}
            <Card className="border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Bursary & Financial Overview</span>
                  <Badge variant="default" className="text-[10px]">Active Session</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500">Total Billed Invoices</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {formatCurrency(feesBilled)}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">Generated student invoices</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-xs text-gray-500">Outstanding Balance</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {formatCurrency(feesOutstanding)}
                    </p>
                    <p className="text-[11px] text-amber-600 mt-1">Pending parent settlement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Pending Approvals & Module Quick Jump */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Pending Approvals
                </CardTitle>
                <Badge variant="warning" className="text-[10px]">
                  {pendingAdmissions.length} Action Items
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingAdmissions.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-500">No pending admission approvals.</p>
                ) : (
                  pendingAdmissions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {item.type}
                        </Badge>
                        <span className="text-[10px] text-gray-400">{item.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {item.applicant}
                      </p>
                      <p className="text-[11px] text-gray-500">Applying for: {item.targetClass}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Administrative Management Links */}
            <Card className="bg-slate-900 text-white border-0">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-sm font-semibold">Administrative Modules</h4>
                <div className="space-y-2">
                  <Link href="/admin/classes" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Classes, Sections & Subjects</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/admin/students" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Student Enrolment Directory</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/admin/fees" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Fee Structures & Invoices</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/admin/settings" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>School Settings & Configuration</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
