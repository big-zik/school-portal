'use client'

import * as React from 'react'
import type { AttendanceInput } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2 } from 'lucide-react'

export interface AttendanceFormProps {
  students: { id: string; name: string }[]
  onSubmit: (data: AttendanceInput) => Promise<void>
  isLoading?: boolean
  classId?: string
  date?: string
}

type StatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK'

interface StudentEntryState {
  studentId: string
  status: StatusType
  remarks: string
}

const STATUS_OPTIONS: { label: string; value: StatusType; color: string }[] = [
  { label: 'Present', value: 'PRESENT', color: 'text-emerald-600' },
  { label: 'Absent', value: 'ABSENT', color: 'text-rose-600' },
  { label: 'Late', value: 'LATE', color: 'text-amber-600' },
  { label: 'Excused', value: 'EXCUSED', color: 'text-blue-600' },
  { label: 'Sick', value: 'SICK', color: 'text-purple-600' },
]

export function AttendanceForm({
  students,
  onSubmit,
  isLoading = false,
  classId: propClassId,
  date: propDate,
}: AttendanceFormProps) {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    propDate || new Date().toISOString().split('T')[0],
  )
  const [entries, setEntries] = React.useState<Record<string, StudentEntryState>>(
    {},
  )
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Initialize or update entries when students prop changes
  React.useEffect(() => {
    setEntries((prev) => {
      const next: Record<string, StudentEntryState> = {}
      students.forEach((s) => {
        next[s.id] = prev[s.id] || {
          studentId: s.id,
          status: 'PRESENT',
          remarks: '',
        }
      })
      return next
    })
  }, [students])

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, remarks: '' }),
        status,
      },
    }))
  }

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, status: 'PRESENT' }),
        remarks,
      },
    }))
  }

  const handleMarkAllPresent = () => {
    setEntries((prev) => {
      const updated: Record<string, StudentEntryState> = {}
      Object.keys(prev).forEach((id) => {
        updated[id] = {
          ...prev[id],
          status: 'PRESENT',
        }
      })
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const classId = propClassId || '00000000-0000-0000-0000-000000000000'

    const entriesList = Object.values(entries).map((item) => ({
      studentId: item.studentId,
      status: item.status,
      remarks: item.remarks ? item.remarks : undefined,
    }))

    if (entriesList.length === 0) {
      setError('At least one student entry is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        date: selectedDate,
        classId,
        entries: entriesList,
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to submit attendance')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormLoading = isLoading || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <Label htmlFor="attendance-date" className="whitespace-nowrap font-medium">
            Date:
          </Label>
          <Input
            id="attendance-date"
            type="date"
            className="w-auto"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isFormLoading}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleMarkAllPresent}
          disabled={isFormLoading || students.length === 0}
          className="flex items-center gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Mark All Present
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Student List Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3 w-40">Status</th>
              <th className="px-4 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No students found for this class.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const entry = entries[student.id] || {
                  studentId: student.id,
                  status: 'PRESENT',
                  remarks: '',
                }

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {student.name}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={entry.status}
                        onValueChange={(val: StatusType) =>
                          handleStatusChange(student.id, val)
                        }
                        disabled={isFormLoading}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={opt.color}>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder="Optional remarks"
                        className="h-8 text-xs"
                        value={entry.remarks}
                        onChange={(e) =>
                          handleRemarksChange(student.id, e.target.value)
                        }
                        disabled={isFormLoading}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isFormLoading || students.length === 0}>
          {isFormLoading ? 'Submitting...' : 'Save Attendance'}
        </Button>
      </div>
    </form>
  )
}
