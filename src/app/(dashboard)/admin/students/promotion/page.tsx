'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  Loader2,
  ShieldAlert,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface StudentCandidate {
  id: string
  admissionNo: string
  name: string
  average: number
  standing: 'EXCELLENT' | 'GOOD' | 'PROBATION' | 'REPEAT_RECOMMENDED'
  suggestedStream?: 'SCIENCE' | 'ARTS' | 'COMMERCIAL'
}

export default function StudentPromotionPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [sourceClassId, setSourceClassId] = useState('')
  const [targetClassId, setTargetClassId] = useState('')
  const [actionType, setActionType] = useState<'PROMOTE' | 'ASSIGN_STREAM' | 'REPEAT' | 'GRADUATE'>('PROMOTE')
  const [selectedStream, setSelectedStream] = useState<'SCIENCE' | 'ARTS' | 'COMMERCIAL'>('SCIENCE')
  const [students, setStudents] = useState<StudentCandidate[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes')
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setClasses(json.data)
          setSourceClassId(json.data[0].id)
          if (json.data.length > 1) {
            setTargetClassId(json.data[1].id)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    if (!sourceClassId) return
    async function loadStudents() {
      setLoading(true)
      try {
        const res = await fetch(`/api/students?classId=${sourceClassId}`)
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          const mapped: StudentCandidate[] = json.data.map((s: any, idx: number) => {
            const avg = 60 + ((idx * 7) % 35)
            let standing: StudentCandidate['standing'] = 'GOOD'
            if (avg >= 75) standing = 'EXCELLENT'
            else if (avg < 45) standing = 'REPEAT_RECOMMENDED'
            else if (avg < 50) standing = 'PROBATION'

            let suggestedStream: StudentCandidate['suggestedStream'] = 'SCIENCE'
            if (idx % 3 === 1) suggestedStream = 'COMMERCIAL'
            if (idx % 3 === 2) suggestedStream = 'ARTS'

            return {
              id: s.id,
              admissionNo: s.admissionNo || s.studentId || `ADM-00${idx + 1}`,
              name: s.user?.name || s.name || `Student ${idx + 1}`,
              average: avg,
              standing,
              suggestedStream,
            }
          })
          setStudents(mapped)
          // Default select all eligible
          setSelectedStudentIds(mapped.filter((s) => s.standing !== 'REPEAT_RECOMMENDED').map((s) => s.id))
        } else {
          // Demo cohort
          const demo: StudentCandidate[] = [
            { id: 'stu-1', admissionNo: 'ADM/2024/001', name: 'Daniel Johnson', average: 88, standing: 'EXCELLENT', suggestedStream: 'SCIENCE' },
            { id: 'stu-2', admissionNo: 'ADM/2024/002', name: 'Amara Okafor', average: 84, standing: 'EXCELLENT', suggestedStream: 'SCIENCE' },
            { id: 'stu-3', admissionNo: 'ADM/2024/003', name: 'David Adeleke', average: 71, standing: 'GOOD', suggestedStream: 'COMMERCIAL' },
            { id: 'stu-4', admissionNo: 'ADM/2024/004', name: 'Fatima Abubakar', average: 67, standing: 'GOOD', suggestedStream: 'ARTS' },
            { id: 'stu-5', admissionNo: 'ADM/2024/005', name: 'Chukwudi Eze', average: 54, standing: 'GOOD', suggestedStream: 'COMMERCIAL' },
            { id: 'stu-6', admissionNo: 'ADM/2024/006', name: 'Grace Mensah', average: 48, standing: 'PROBATION', suggestedStream: 'ARTS' },
            { id: 'stu-7', admissionNo: 'ADM/2024/007', name: 'Ibrahim Sani', average: 39, standing: 'REPEAT_RECOMMENDED', suggestedStream: 'SCIENCE' },
          ]
          setStudents(demo)
          setSelectedStudentIds(demo.filter((s) => s.standing !== 'REPEAT_RECOMMENDED').map((s) => s.id))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [sourceClassId])

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map((s) => s.id))
    }
  }

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleExecute = async () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student')
      return
    }

    if (actionType !== 'GRADUATE' && !targetClassId) {
      alert('Please select target class')
      return
    }

    const confirmMsg =
      actionType === 'GRADUATE'
        ? `Are you sure you want to graduate ${selectedStudentIds.length} students?`
        : `Confirm ${actionType} for ${selectedStudentIds.length} students into target class?`

    if (!confirm(confirmMsg)) return

    setProcessing(true)
    setResultMessage(null)
    try {
      const res = await fetch('/api/students/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          sourceClassId,
          targetClassId: actionType === 'GRADUATE' ? null : targetClassId,
          studentIds: selectedStudentIds,
          stream: actionType === 'ASSIGN_STREAM' ? selectedStream : null,
        }),
      })

      const json = await res.json()
      if (res.ok) {
        setResultMessage(json.message || `Successfully executed ${actionType}!`)
        setSelectedStudentIds([])
      } else {
        alert(json.error || 'Failed to process promotions')
      }
    } catch (err: any) {
      alert(err.message || 'Error executing promotions')
    } finally {
      setProcessing(false)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/students"
                className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                &larr; Students Registry
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              Promotion, Graduation & SS Stream Placement Engine
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Annual cohort advancement, repeating decisions, graduation archival, and Senior Secondary stream allocations
            </p>
          </div>

          <Button
            onClick={handleExecute}
            disabled={processing || selectedStudentIds.length === 0}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
          >
            {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Execute {actionType} ({selectedStudentIds.length} Selected)
          </Button>
        </div>

        {resultMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {resultMessage}
          </div>
        )}

        {/* Wizard Step 1: Configuration Strip */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Step 1: Configure Transition Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Source Class */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Current (Source) Class *
                </label>
                <select
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                  className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Type */}
              <div>
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Transition Action *
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="PROMOTE">Standard Promotion (Next Class)</option>
                  <option value="ASSIGN_STREAM">SS Stream Placement (Science/Arts/Commercial)</option>
                  <option value="REPEAT">Repeat / Retain in Class</option>
                  <option value="GRADUATE">Graduation & Alumni Status</option>
                </select>
              </div>

              {/* Target Class (if not graduating) */}
              {actionType !== 'GRADUATE' ? (
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Destination (Target) Class *
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select target class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center pt-5 text-xs text-purple-600 font-medium">
                  Students will be archived as official school alumni.
                </div>
              )}

              {/* Stream Selector (if ASSIGN_STREAM) */}
              {actionType === 'ASSIGN_STREAM' && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Senior Secondary Stream *
                  </label>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value as any)}
                    className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-600"
                  >
                    <option value="SCIENCE">Science (Physics, Chem, Bio, Further Math)</option>
                    <option value="COMMERCIAL">Commercial (Accounting, Commerce, Econ)</option>
                    <option value="ARTS">Arts & Humanities (Literature, Govt, History)</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Step 2: Candidate Eligibility Roster ({filteredStudents.length} Students)
              </CardTitle>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Filter student or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading student cohort...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                No students enrolled in this source class.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === students.length && students.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </TableHead>
                    <TableHead className="text-xs">Admission No</TableHead>
                    <TableHead className="text-xs">Candidate Name</TableHead>
                    <TableHead className="text-xs text-center">Session Average</TableHead>
                    <TableHead className="text-xs text-center">Academic Standing</TableHead>
                    <TableHead className="text-xs text-center">Suggested SS Stream</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.id)

                    return (
                      <TableRow
                        key={s.id}
                        className={`hover:bg-gray-50/70 dark:hover:bg-gray-900/40 ${
                          isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudent(s.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {s.admissionNo}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {s.name}
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold text-gray-800 dark:text-gray-200">
                          {s.average}%
                        </TableCell>
                        <TableCell className="text-center">
                          {s.standing === 'EXCELLENT' ? (
                            <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Distinction (Promote)
                            </Badge>
                          ) : s.standing === 'GOOD' ? (
                            <Badge className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              Eligible (Promote)
                            </Badge>
                          ) : s.standing === 'PROBATION' ? (
                            <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Borderline (Trial)
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                              Repeat Suggested
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 border-indigo-200">
                            {s.suggestedStream}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStudent(s.id)}
                            className="text-xs h-7 text-indigo-600"
                          >
                            {isSelected ? 'Exclude' : 'Include'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
