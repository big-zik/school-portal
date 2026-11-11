import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  FileText,
  Bell,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const user = await getServerUser()

  // Sample real data context for Daniel Johnson
  const studentData = {
    name: user?.name || 'Daniel Johnson',
    studentId: 'STU2024001',
    className: 'Grade 10 (SS 1) - Alpha',
    term: 'Second Term (Spring 2025)',
    academicYear: '2024/2025',
    attendance: {
      percentage: 96.5,
      present: 42,
      absent: 1,
      late: 1,
      total: 44,
    },
    feeBalance: 0, // Fully paid
    timetableToday: [
      { subject: 'Pure Mathematics', time: '08:00 - 09:20', room: 'Room 201', teacher: 'Dr. Robert Smith' },
      { subject: 'English & Composition', time: '09:30 - 10:45', room: 'Room 201', teacher: 'Mr. Andrew Clark' },
      { subject: 'Chemistry Lab', time: '11:15 - 12:45', room: 'Science Lab B', teacher: 'Mrs. Folashade Adebayo' },
      { subject: 'Computer Science', time: '01:30 - 02:45', room: 'ICT Lab 1', teacher: 'Mr. Jude Bello' },
    ],
    upcomingAssignments: [
      {
        id: 'asg-1',
        title: 'Problem Set 4: Quadratic Equations & Graphing',
        subject: 'Pure Mathematics',
        due: 'Feb 18, 2025',
        marks: 50,
        status: 'GRADED',
        score: '46.5 / 50 (93%)',
      },
      {
        id: 'asg-2',
        title: 'Volumetric Analysis Lab Report',
        subject: 'General Chemistry',
        due: 'Feb 21, 2025',
        marks: 40,
        status: 'SUBMITTED',
        score: 'Pending Review',
      },
      {
        id: 'asg-3',
        title: 'Essay: Themes in Things Fall Apart',
        subject: 'English & Composition',
        due: 'Feb 25, 2025',
        marks: 30,
        status: 'PENDING',
        score: 'Not submitted',
      },
    ],
    recentAnnouncements: [
      {
        id: 'ann-1',
        title: 'Mid-Term Break Schedule & Science Excursion',
        date: 'Today, 09:00',
        author: 'Principal Vance',
        pinned: true,
      },
      {
        id: 'ann-2',
        title: 'Inter-House Sports Heat Trials Starting Friday',
        date: 'Yesterday',
        author: 'Sports Master',
        pinned: false,
      },
    ],
  }

  return (
    <DashboardLayout user={user} role="STUDENT">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <BookOpen className="w-64 h-64" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white text-[11px] border-0 backdrop-blur-md">
                {studentData.className}
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/30 text-blue-100 text-[11px] border-0">
                {studentData.term}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentData.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              You have 4 classes scheduled today and 1 assignment pending submission. Keep up the great attendance record!
            </p>
          </div>
        </div>

        {/* Top 4 Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Attendance */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Term Attendance</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {studentData.attendance.percentage}%
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Excellent standing
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 2: GPA / Average */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Average</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  91.2%
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> Grade A (Distinction)
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <Award className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 3: Assignments */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Assignments</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  1 Pending
                </h3>
                <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Due in 4 days
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          {/* Stat 4: Fee Balance */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Term 2 Fees</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(studentData.feeBalance)}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Fully Settled
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column Grid: Left (Timetable & Assignments), Right (Announcements & Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Today's Schedule + Assignments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Timetable */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Today's Class Schedule
                  </CardTitle>
                  <p className="text-xs text-gray-500">Tuesday, Senior Secondary 1 (Alpha)</p>
                </div>
                <Link href="/student/timetable">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                    Full Week <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                {studentData.timetableToday.map((period, index) => (
                  <div key={index} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        P{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {period.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {period.teacher} • <span className="text-blue-600 font-medium">{period.room}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {period.time}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Assignments & Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Assignments & Homework
                  </CardTitle>
                  <p className="text-xs text-gray-500">Current term submissions & feedback</p>
                </div>
                <Link href="/student/assignments">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentData.upcomingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          {asg.subject}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Due {asg.due}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {asg.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge
                          variant={
                            asg.status === 'GRADED'
                              ? 'success'
                              : asg.status === 'SUBMITTED'
                              ? 'default'
                              : 'warning'
                          }
                          className="text-[11px]"
                        >
                          {asg.status}
                        </Badge>
                        <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-1">
                          {asg.score}
                        </p>
                      </div>
                      <Link href={`/student/assignments`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          {asg.status === 'PENDING' ? 'Submit' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Attendance Card, Notices, Quick Links */}
          <div className="space-y-6">
            {/* Attendance Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Attendance Progress</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {studentData.attendance.percentage}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={studentData.attendance.percentage} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                    <p className="text-gray-500 text-[10px]">Present</p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
                      {studentData.attendance.present}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                    <p className="text-gray-500 text-[10px]">Late</p>
                    <p className="font-bold text-amber-700 dark:text-amber-300 text-base">
                      {studentData.attendance.late}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900">
                    <p className="text-gray-500 text-[10px]">Excused</p>
                    <p className="font-bold text-red-700 dark:text-red-300 text-base">
                      {studentData.attendance.absent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* School Announcements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  Notices & Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentData.recentAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {ann.pinned && (
                        <Badge variant="warning" className="text-[10px] py-0">
                          📌 Pinned
                        </Badge>
                      )}
                      <span className="text-[10px] text-gray-400">{ann.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {ann.title}
                    </p>
                    <p className="text-[11px] text-gray-500">By {ann.author}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Action Buttons */}
            <Card className="bg-gradient-to-br from-slate-900 to-blue-950 text-white">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-sm font-semibold">Student Shortcuts</h4>
                <div className="space-y-2">
                  <Link href="/student/grades" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Download Report Card</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/student/resources" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Access E-Library & Past Questions</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/student/messages" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Contact Class Teacher</span>
                      <ArrowUpRight className="w-4 h-4" />
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
