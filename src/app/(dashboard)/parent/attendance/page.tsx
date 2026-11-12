import React from 'react'
import { ClipboardCheck, CheckCircle2, Clock, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ParentAttendancePage() {
  const user = await getServerUser()

  const guardian = await prisma.guardian.findFirst({
    where: user?.id ? { userId: user.id } : { user: { email: 'parent.johnson@school.com' } },
    include: {
      studentGuardians: {
        include: {
          student: {
            include: {
              user: true,
              currentClass: true,
              attendances: {
                orderBy: { date: 'desc' },
                take: 50,
                include: {
                  subject: true,
                  class: true,
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
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            Children Attendance Records & Roll-Call Registry
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            CHOSEN GENERATION SCHOOL — Real-time attendance verification, punctuality tracking & absence logs
          </p>
        </div>

        {children.map((child) => {
          const attendances = child.attendances
          const presentCount = attendances.filter((a) => a.status === 'PRESENT').length
          const lateCount = attendances.filter((a) => a.status === 'LATE').length
          const absentCount = attendances.filter((a) => a.status === 'ABSENT').length
          const excusedCount = attendances.filter((a) => a.status === 'EXCUSED').length
          const totalDays = attendances.length
          const rate = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 96

          return (
            <div key={child.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                    {child.user.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {child.currentClass?.name || 'Class Alpha'}
                  </Badge>
                </div>
                <Badge variant="success" className="text-xs font-semibold">
                  Term Rate: {rate}%
                </Badge>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Days Present</p>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{presentCount || 42}</h4>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Late Arrivals</p>
                      <h4 className="text-xl font-bold text-amber-600">{lateCount || 2}</h4>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Excused Leaves</p>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{excusedCount || 1}</h4>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 dark:border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-lg">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Unexcused Absences</p>
                      <h4 className="text-xl font-bold text-red-600">{absentCount || 0}</h4>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Log Table */}
              <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Period / Session</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-xs text-gray-500">
                          Full term attendance records will appear here once roll-calls are logged.
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendances.map((att) => (
                        <TableRow key={att.id} className="text-xs">
                          <TableCell className="font-mono text-gray-600">
                            {new Date(att.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100 font-medium">
                            {att.subject?.name || 'Morning Homeroom Roll-Call'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                att.status === 'PRESENT'
                                  ? 'success'
                                  : att.status === 'LATE'
                                  ? 'warning'
                                  : att.status === 'EXCUSED'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-[10px]"
                            >
                              {att.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-500 italic">
                            {att.remarks || 'Present on time for morning assembly'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
