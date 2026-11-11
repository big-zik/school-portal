'use client'

import React, { useState } from 'react'
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { AttendanceStatus } from '@/types'

export default function TeacherAttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Grade 10 (SS 1) - Alpha')
  const [selectedDate, setSelectedDate] = useState('2025-02-15')
  const [isSaved, setIsSaved] = useState(false)

  // Students roster
  const [students, setStudents] = useState([
    { id: 'STU2024001', name: 'Daniel Johnson', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024002', name: 'Amara Okafor', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024003', name: 'David Adeleke', status: 'LATE' as AttendanceStatus, remarks: 'Arrived 08:15 (bus traffic)' },
    { id: 'STU2024004', name: 'Fatima Abubakar', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024005', name: 'Chukwudi Eze', status: 'EXCUSED' as AttendanceStatus, remarks: 'Sick bay visit' },
    { id: 'STU2024006', name: 'Grace Mensah', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024007', name: 'Ibrahim Sani', status: 'PRESENT' as AttendanceStatus, remarks: '' },
  ])

  const setStudentStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )
    setIsSaved(false)
  }

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'PRESENT' })))
    setIsSaved(false)
  }

  const handleSaveAttendance = () => {
    setIsSaved(true)
  }

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              Class Attendance Register
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily period roll-call with automated absence notification triggers to parents
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllPresent}
              className="text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Mark All Present
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAttendance}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              <Save className="w-3.5 h-3.5" /> Save Attendance
            </Button>
          </div>
        </div>

        {/* Saved Banner */}
        {isSaved && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Attendance saved successfully!</strong> Automated SMS/email alerts dispatched for absent and late students.
              </span>
            </div>
            <Badge variant="success" className="text-[10px]">Synced</Badge>
          </div>
        )}

        {/* Selector Filters */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">Class & Cohort</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
              >
                <option>Grade 10 (SS 1) - Alpha</option>
                <option>Grade 10 (SS 1) - Beta</option>
                <option>Grade 11 (SS 2) - Science</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">Subject</label>
              <select className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs">
                <option>Pure Mathematics (MTH101)</option>
                <option>Homeroom Roll-Call</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Student Roster Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Enrolled Students ({students.length})
            </CardTitle>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                ● {students.filter((s) => s.status === 'PRESENT').length} Present
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                ● {students.filter((s) => s.status === 'LATE').length} Late
              </span>
              <span className="flex items-center gap-1 text-red-600 font-semibold">
                ● {students.filter((s) => s.status === 'EXCUSED' || s.status === 'ABSENT').length} Excused/Absent
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Attendance Status</TableHead>
                  <TableHead>Remarks / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((st) => (
                  <TableRow key={st.id}>
                    <TableCell className="font-mono text-xs text-gray-500">{st.id}</TableCell>
                    <TableCell className="font-medium text-xs text-gray-900 dark:text-gray-100">
                      {st.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {(['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'] as AttendanceStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStudentStatus(st.id, status)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              st.status === status
                                ? status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : status === 'LATE'
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : status === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-red-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={st.remarks}
                        onChange={(e) => {
                          const val = e.target.value
                          setStudents((prev) =>
                            prev.map((s) => (s.id === st.id ? { ...s, remarks: val } : s))
                          )
                        }}
                        className="h-8 w-full max-w-xs rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-2 text-xs focus:outline-none focus:border-blue-500"
                      />
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
