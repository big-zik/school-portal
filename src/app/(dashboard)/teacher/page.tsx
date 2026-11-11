import React from 'react'
import Link from 'next/link'
import {
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  PlusCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const user = await getServerUser()

  const teacherData = {
    name: user?.name || 'Dr. Robert Smith',
    employeeId: 'TCH2024001',
    department: 'Sciences (Mathematics)',
    classesTeaching: [
      { name: 'Grade 10 - Alpha', subject: 'Pure Mathematics', students: 30, room: 'Room 201' },
      { name: 'Grade 10 - Beta', subject: 'Pure Mathematics', students: 28, room: 'Room 202' },
      { name: 'Grade 11 - Science', subject: 'Advanced Calculus', students: 25, room: 'Room 305' },
    ],
    todayClasses: [
      { class: 'Grade 10 Alpha', subject: 'Pure Mathematics', time: '08:00 - 09:20', room: 'Room 201', attendanceTaken: true },
      { class: 'Grade 10 Beta', subject: 'Pure Mathematics', time: '10:00 - 11:15', room: 'Room 202', attendanceTaken: false },
      { class: 'Grade 11 Science', subject: 'Advanced Calculus', time: '01:30 - 02:45', room: 'Room 305', attendanceTaken: false },
    ],
    pendingGrading: [
      {
        id: 'asg-1',
        title: 'Problem Set 4: Quadratic Equations',
        class: 'Grade 10 Alpha',
        submitted: 28,
        graded: 25,
        totalStudents: 30,
        due: 'Feb 18, 2025',
      },
      {
        id: 'asg-2',
        title: 'Polynomial Factorization Test',
        class: 'Grade 10 Beta',
        submitted: 27,
        graded: 10,
        totalStudents: 28,
        due: 'Feb 20, 2025',
      },
    ],
  }

  return (
    <DashboardLayout user={user} role="TEACHER">
      <div className="space-y-6">
        {/* Header greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-800 via-blue-800 to-slate-900 text-white p-6 md:p-8 shadow-lg">
          <div className="space-y-1.5">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[11px]">
              {teacherData.department}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, {teacherData.name} 👨‍🏫
            </h1>
            <p className="text-xs md:text-sm text-blue-100">
              You have 3 lecture periods scheduled today. Grade 10 Beta attendance is pending.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/teacher/assignments">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold">
                <PlusCircle className="w-4 h-4" /> New Assignment
              </Button>
            </Link>
            <Link href="/teacher/attendance">
              <Button variant="default" size="sm" className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700">
                <ClipboardCheck className="w-4 h-4" /> Mark Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">83</h3>
                <span className="text-[11px] text-gray-500">Across 3 classes</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today's Lectures</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">3 Periods</h3>
                <span className="text-[11px] text-emerald-600 font-medium">1 completed</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <Calendar className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">To Grade</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">20 Submissions</h3>
                <span className="text-[11px] text-amber-600 font-medium">Needs assessment</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Class Average</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">79.4%</h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +3.2% from Term 1
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2-Column: Today's Schedule & Grading Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Today's Teaching Schedule
                  </CardTitle>
                  <p className="text-xs text-gray-500">Direct attendance marking & student tracking</p>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-gray-100 dark:divide-gray-800">
                {teacherData.todayClasses.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        P{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {item.class} — {item.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.time} • <span className="font-medium text-blue-600">{item.room}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.attendanceTaken ? (
                        <Badge variant="success" className="text-xs gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Taken
                        </Badge>
                      ) : (
                        <Link href="/teacher/attendance">
                          <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                            Take Attendance
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grading Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Pending Grading & Assessment
                  </CardTitle>
                  <p className="text-xs text-gray-500">Submissions awaiting teacher marks and feedback</p>
                </div>
                <Link href="/teacher/grades">
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1">
                    Gradebook <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {teacherData.pendingGrading.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1">
                          {task.class}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {task.title}
                        </p>
                      </div>
                      <Link href="/teacher/grades">
                        <Button size="sm" variant="outline" className="text-xs shrink-0">
                          Grade Submissions
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <span>Submitted: {task.submitted} / {task.totalStudents}</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {task.graded} Graded ({task.submitted - task.graded} Remaining)
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Classes Taught & Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assigned Cohorts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teacherData.classesTeaching.map((cls, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{cls.name}</p>
                      <Badge variant="secondary" className="text-[10px]">{cls.students} students</Badge>
                    </div>
                    <p className="text-xs text-blue-600 font-medium">{cls.subject}</p>
                    <p className="text-[11px] text-gray-400">Assigned Room: {cls.room}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-sm font-semibold">Teacher Operations</h4>
                <div className="space-y-2">
                  <Link href="/teacher/grades" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Enter Continuous Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/teacher/resources" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Upload Lecture Notes / Slides</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/teacher/messages" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs border-white/20 hover:bg-white/10 text-white">
                      <span>Parent & Student Inquiries</span>
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
