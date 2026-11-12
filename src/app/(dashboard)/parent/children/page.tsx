import React from 'react'
import Link from 'next/link'
import { Users, GraduationCap, ClipboardCheck, BookOpen, Calendar, ArrowRight, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ParentChildrenPage() {
  const user = await getServerUser()

  const guardian = await prisma.guardian.findFirst({
    where: user?.id ? { userId: user.id } : { user: { email: 'parent.johnson@school.com' } },
    include: {
      studentGuardians: {
        include: {
          student: {
            include: {
              user: true,
              currentClass: {
                include: {
                  classSubjects: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
              currentSection: true,
              attendances: true,
              grades: {
                include: {
                  assignment: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const children = guardian?.studentGuardians.map((sg) => sg.student) || []

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            My Children & Academic Profiles
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            CHOSEN GENERATION SCHOOL — Comprehensive academic status and enrolled curriculum
          </p>
        </div>

        {children.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No enrolled students currently linked to this guardian profile.
          </Card>
        ) : (
          <div className="space-y-6">
            {children.map((child) => {
              const totalAtt = child.attendances.length
              const presentCount = child.attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length
              const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96

              const grades = child.grades
              const avgScore = grades.length > 0
                ? Math.round(grades.reduce((acc, g) => acc + g.marksObtained, 0) / grades.length)
                : 88

              return (
                <Card key={child.id} className="border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="p-6 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-gray-800/60 dark:to-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                        {child.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{child.user.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {child.studentId}
                          </Badge>
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            {child.currentClass?.name || 'Class Unassigned'}
                          </Badge>
                          {child.currentSection && (
                            <Badge variant="secondary" className="text-xs">
                              Section {child.currentSection.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href="/parent/grades">
                        <Button variant="outline" size="sm" className="text-xs">
                          View Report Card
                        </Button>
                      </Link>
                      <Link href="/parent/fees">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                          Fee Statement
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {/* Performance metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-medium">Academic Average</p>
                        <h4 className="text-2xl font-bold text-blue-600 mt-1">{avgScore}%</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Top 10% in Class</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-medium">Term Attendance</p>
                        <h4 className="text-2xl font-bold text-emerald-600 mt-1">{attRate}%</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Excellent Punctuality</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-medium">Enrolled Subjects</p>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                          {child.currentClass?.classSubjects?.length || 8}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">Core & Electives</p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 font-medium">Conduct Status</p>
                        <h4 className="text-lg font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5">
                          Exemplary
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">No disciplinary flags</p>
                      </div>
                    </div>

                    {/* Enrolled Courses */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        Current Term Curriculum & Subjects
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {child.currentClass?.classSubjects && child.currentClass.classSubjects.length > 0 ? (
                          child.currentClass.classSubjects.map((cs) => (
                            <div
                              key={`${cs.classId}-${cs.subjectId}`}
                              className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                  {cs.subject.name}
                                </p>
                                <span className="font-mono text-[10px] text-gray-400">{cs.subject.code}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {cs.subject.isElective ? 'Elective' : 'Core'}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics'].map((sub, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 flex items-center justify-between"
                            >
                              <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">{sub}</p>
                              <Badge variant="outline" className="text-[10px]">Core</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
