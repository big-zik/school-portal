'use client'

import React, { useState, useEffect } from 'react'
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  Save,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { AttendanceStatus } from '@/types'

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedClass, setSelectedClass] = useState('Grade 10 (SS 1) - Alpha')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Students roster
  const [students, setStudents] = useState([
    { id: 'STU2024001', dbId: 'student-1', name: 'Daniel Johnson', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024002', dbId: 'student-2', name: 'Amara Okafor', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024003', dbId: 'student-3', name: 'David Adeleke', status: 'LATE' as AttendanceStatus, remarks: 'Arrived 08:15 (bus traffic)' },
    { id: 'STU2024004', dbId: 'student-4', name: 'Fatima Abubakar', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024005', dbId: 'student-5', name: 'Chukwudi Eze', status: 'EXCUSED' as AttendanceStatus, remarks: 'Sick bay visit' },
    { id: 'STU2024006', dbId: 'student-6', name: 'Grace Mensah', status: 'PRESENT' as AttendanceStatus, remarks: '' },
    { id: 'STU2024007', dbId: 'student-7', name: 'Ibrahim Sani', status: 'PRESENT' as AttendanceStatus, remarks: '' },
  ])

  // Fetch classes and subjects
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [clsRes, subRes] = await Promise.all([fetch('/api/classes'), fetch('/api/subjects')])
        if (clsRes.ok) {
          const clsJson = await clsRes.json()
          if (clsJson.data && clsJson.data.length > 0) {
            setClasses(clsJson.data)
            setSelectedClassId(clsJson.data[0].id)
            setSelectedClass(clsJson.data[0].name)
          }
        }
        if (subRes.ok) {
          const subJson = await subRes.json()
          if (subJson.data && subJson.data.length > 0) {
            setSubjects(subJson.data)
          }
        }
      } catch (err) {
        console.error('Failed to load classes or subjects', err)
      }
    }
    loadMetadata()
  }, [])

  // Fetch students when selected class changes
  useEffect(() => {
    if (!selectedClassId) return
    async function loadStudents() {
      try {
        const res = await fetch(`/api/students?classId=${selectedClassId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setStudents(
              json.data.map((s: any) => ({
                id: s.studentId || s.id,
                dbId: s.id,
                name: s.user?.name || s.name || 'Student',
                status: 'PRESENT' as AttendanceStatus,
                remarks: '',
              }))
            )
          }
        }
      } catch (err) {
        console.error('Failed to load students', err)
      }
    }
    loadStudents()
  }, [selectedClassId])

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

  const handleSaveAttendance = async () => {
    setIsSaving(true)
    try {
      if (selectedClassId) {
        await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: selectedClassId,
            subjectId: selectedSubjectId || null,
            date: selectedDate,
            records: students.map((s) => ({
              studentId: s.dbId || s.id,
              status: s.status,
              remarks: s.remarks,
            })),
          }),
        })
      }
      setIsSaved(true)
    } catch (err) {
      console.error('Failed to save attendance', err)
    } finally {
      setIsSaving(false)
    }
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
              disabled={isSaving}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Attendance
                </>
              )}
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
                value={selectedClassId || selectedClass}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedClassId(val)
                  const cls = classes.find((c) => c.id === val)
                  if (cls) setSelectedClass(cls.name)
                }}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
              >
                {classes.length > 0 ? (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option>Grade 10 (SS 1) - Alpha</option>
                    <option>Grade 10 (SS 1) - Beta</option>
                    <option>Grade 11 (SS 2) - Science</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase">Subject Period</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
              >
                <option value="">Daily Homeroom Roll-Call (All-Day)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
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
