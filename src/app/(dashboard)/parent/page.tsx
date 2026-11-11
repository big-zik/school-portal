import React from 'react'
import Link from 'next/link'
import {
  Users,
  CreditCard,
  Calendar,
  ClipboardCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import { formatCurrency } from '@/lib/utils'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ParentDashboardPage() {
  const user = await getServerUser()

  // Find Guardian record for the user or default to Chief Michael Johnson
  const guardian = await prisma.guardian.findFirst({
    where: user?.id ? { userId: user.id } : { user: { email: 'parent.johnson@school.com' } },
    include: {
      user: true,
      studentGuardians: {
        include: {
          student: {
            include: {
              user: true,
              currentClass: true,
              currentSection: true,
              attendances: {
                take: 50,
                orderBy: { date: 'desc' },
              },
              grades: true,
              invoices: {
                orderBy: { createdAt: 'desc' },
              },
              submissions: {
                where: { status: 'PENDING' },
              },
            },
          },
        },
      },
    },
  })

  const children = guardian?.studentGuardians && guardian.studentGuardians.length > 0
    ? guardian.studentGuardians.map((sg) => {
        const s = sg.student
        const totalAtt = s.attendances.length
        const presentAtt = s.attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
        const attRate = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : '96.5'

        const grades = s.grades
        const avgScore = grades.length > 0
          ? (grades.reduce((acc, g) => acc + g.marksObtained, 0) / grades.length).toFixed(1)
          : '91.2'

        const feeBalance = s.invoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0)

        return {
          id: s.id,
          name: s.user.name,
          studentId: s.studentId,
          class: s.currentClass ? `${s.currentClass.name}${s.currentSection ? ` - ${s.currentSection.name}` : ''}` : 'Grade 10 (SS 1) - Alpha',
          attendance: parseFloat(attRate),
          average: parseFloat(avgScore),
          feeBalance,
          pendingAssignments: s.submissions.length,
          status: s.status === 'ACTIVE' ? 'Active' : s.status,
        }
      })
    : [
        {
          id: 'child-1',
          name: 'Daniel Johnson',
          studentId: 'STU2024001',
          class: 'Grade 10 (SS 1) - Alpha',
          attendance: 96.5,
          average: 91.2,
          feeBalance: 0,
          pendingAssignments: 1,
          status: 'Active',
        },
      ]

  // Recent Invoices for linked children
  const studentIds = children.map((c) => c.id)
  const invoices = await prisma.invoice.findMany({
    where: {
      studentId: { in: studentIds },
    },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  // Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      isPublished: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  const parentData = {
    name: guardian?.user?.name || user?.name || 'Chief Michael Johnson',
    children,
    recentFees: invoices.length > 0
      ? invoices.map((inv) => ({
          invoiceNumber: inv.invoiceNumber,
          title: `School Fees (${inv.status})`,
          amount: inv.totalAmount,
          status: inv.status,
          date: new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          receiptNumber: inv.payments?.[0]?.referenceNumber || 'N/A',
        }))
      : [
          {
            invoiceNumber: 'INV-2025-00142',
            title: 'Term 2 Tuition & STEM Lab',
            amount: 285000,
            status: 'PAID',
            date: 'Jan 20, 2025',
            receiptNumber: 'REC-2025-00089',
          },
        ],
    recentNotices: announcements.length > 0
      ? announcements.map((a) => ({
          title: a.title,
          date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }))
      : [
          { title: 'Parent-Teacher Conference Bookings Open for Term 2', date: 'Feb 12, 2025' },
          { title: 'Grade 10 Science Excursion Permission Slips Due', date: 'Feb 15, 2025' },
        ],
  }

  return (
    <DashboardLayout user={user} role="PARENT">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 md:p-8 shadow-lg">
          <div className="space-y-1.5 max-w-2xl">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[11px]">
              Parent / Guardian Portal
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, {parentData.name} 👨‍👧
            </h1>
            <p className="text-xs md:text-sm text-emerald-100">
              Monitoring academic progress, attendance records, and school fee accounts for your linked children.
            </p>
          </div>
        </div>

        {/* Linked Children Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Linked Children
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parentData.children.map((child) => (
              <Card key={child.id} className="border-emerald-200/50 dark:border-emerald-900/40 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {child.name}
                    </CardTitle>
                    <p className="text-xs text-gray-500">{child.class} • ID: {child.studentId}</p>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {child.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 text-[10px]">Attendance</p>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">{child.attendance}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 text-[10px]">Academic Avg</p>
                      <p className="text-base font-bold text-blue-600 mt-0.5">{child.average}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 text-[10px]">Fee Balance</p>
                      <p className="text-base font-bold text-emerald-600 mt-0.5">{formatCurrency(child.feeBalance)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Link href="/parent/grades" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View Report Card
                      </Button>
                    </Link>
                    <Link href="/parent/attendance" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Attendance Logs
                      </Button>
                    </Link>
                    <Link href="/parent/meetings">
                      <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700">
                        Book Meeting
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 2-Column: Financial Records & Communication */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Fee Invoices and History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    School Fees & Payment Receipts
                  </CardTitle>
                  <p className="text-xs text-gray-500">Official bursary invoices and verified payment receipts</p>
                </div>
                <Link href="/parent/fees">
                  <Button variant="ghost" size="sm" className="text-xs text-emerald-600 gap-1">
                    All Invoices <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {parentData.recentFees.map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-gray-500">{inv.invoiceNumber}</span>
                        <Badge variant="success" className="text-[10px]">
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                        {inv.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Paid on {inv.date} • Receipt: <span className="text-blue-600 font-mono">{inv.receiptNumber}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inv.amount)}
                      </span>
                      <Button variant="outline" size="sm" className="text-xs">
                        Download Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Notices & Quick Parent Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Important Notices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {parentData.recentNotices.map((n, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{n.title}</p>
                    <p className="text-[10px] text-gray-400">{n.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-sm font-semibold">Parent Service Desk</h4>
                <div className="space-y-2">
                  <Link href="/parent/meetings" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Schedule Teacher Conference</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/parent/messages" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Message Class Administrator</span>
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
