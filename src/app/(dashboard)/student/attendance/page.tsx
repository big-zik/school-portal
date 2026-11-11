import React from 'react'
import { ClipboardCheck, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const user = await getServerUser()

  const attendanceLog = [
    { date: 'Friday, Feb 14, 2025', subject: 'Pure Mathematics', status: 'PRESENT', time: '08:02 AM', teacher: 'Dr. Robert Smith' },
    { date: 'Thursday, Feb 13, 2025', subject: 'General Chemistry', status: 'PRESENT', time: '08:00 AM', teacher: 'Mrs. Folashade Adebayo' },
    { date: 'Wednesday, Feb 12, 2025', subject: 'Pure Mathematics', status: 'PRESENT', time: '07:58 AM', teacher: 'Dr. Robert Smith' },
    { date: 'Tuesday, Feb 11, 2025', subject: 'Computer Science', status: 'LATE', time: '08:18 AM', remarks: 'Bus delay on Lekki Expressway', teacher: 'Mr. Jude Bello' },
    { date: 'Monday, Feb 10, 2025', subject: 'Homeroom Roll-Call', status: 'PRESENT', time: '07:55 AM', teacher: 'Dr. Robert Smith' },
    { date: 'Friday, Feb 07, 2025', subject: 'French Language', status: 'EXCUSED', time: '-', remarks: 'Doctor clinic appointment', teacher: 'Mme. Claire Dubois' },
  ]

  return (
    <DashboardLayout user={user} role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            Attendance History & Summary
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Detailed daily and subject-level attendance log with timestamp records
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Overall Attendance</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">96.5%</h3>
              <p className="text-[11px] text-gray-400 mt-1">Required Minimum: 85.0%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Total School Days</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">44 Days</h3>
              <p className="text-[11px] text-emerald-600 mt-1">42 Present • 1 Late • 1 Excused</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Absence Standing</p>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-1">Clean Record</h3>
              <p className="text-[11px] text-gray-400 mt-1">Zero unexcused truant absences</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Attendance Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject / Session</TableHead>
                  <TableHead>Recorded Time</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLog.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                      {log.date}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                      {log.subject}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">{log.time}</TableCell>
                    <TableCell className="text-xs text-gray-500">{log.teacher}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'PRESENT'
                            ? 'success'
                            : log.status === 'LATE'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 italic">
                      {log.remarks || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
