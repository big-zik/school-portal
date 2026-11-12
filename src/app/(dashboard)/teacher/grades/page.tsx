'use client'

import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  Save,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Users,
  Sparkles,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface StudentScoreRow {
  studentId: string
  admissionNo: string
  name: string
  ca1: number
  ca2: number
  examScore: number
  total: number
  grade: string
  position: number
  teacherRemark: string
}

function computeNigerianGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: 'A1', remark: 'Distinction' }
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' }
  if (total >= 65) return { grade: 'B3', remark: 'Good' }
  if (total >= 60) return { grade: 'C4', remark: 'Credit' }
  if (total >= 55) return { grade: 'C5', remark: 'Credit' }
  if (total >= 50) return { grade: 'C6', remark: 'Credit' }
  if (total >= 45) return { grade: 'D7', remark: 'Pass' }
  if (total >= 40) return { grade: 'E8', remark: 'Pass' }
  return { grade: 'F9', remark: 'Fail' }
}

export default function TeacherGradesEntryPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [scores, setScores] = useState<StudentScoreRow[]>([
    {
      studentId: 'stu-1',
      admissionNo: 'ADM/2024/001',
      name: 'Daniel Johnson',
      ca1: 18,
      ca2: 17,
      examScore: 54,
      total: 89,
      grade: 'A1',
      position: 1,
      teacherRemark: 'Outstanding mathematical acumen',
    },
    {
      studentId: 'stu-2',
      admissionNo: 'ADM/2024/002',
      name: 'Amara Okafor',
      ca1: 16,
      ca2: 18,
      examScore: 50,
      total: 84,
      grade: 'A1',
      position: 2,
      teacherRemark: 'Consistent excellence and analytical flair',
    },
    {
      studentId: 'stu-3',
      admissionNo: 'ADM/2024/003',
      name: 'David Adeleke',
      ca1: 14,
      ca2: 15,
      examScore: 42,
      total: 71,
      grade: 'B2',
      position: 3,
      teacherRemark: 'Good progress in problem solving',
    },
    {
      studentId: 'stu-4',
      admissionNo: 'ADM/2024/004',
      name: 'Fatima Abubakar',
      ca1: 15,
      ca2: 14,
      examScore: 38,
      total: 67,
      grade: 'B3',
      position: 4,
      teacherRemark: 'Active learner, capable of higher mastery',
    },
    {
      studentId: 'stu-5',
      admissionNo: 'ADM/2024/005',
      name: 'Chukwudi Eze',
      ca1: 12,
      ca2: 11,
      examScore: 32,
      total: 55,
      grade: 'C5',
      position: 5,
      teacherRemark: 'Needs reinforcement on algebraic concepts',
    },
  ])

  // Load initial dropdowns
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [clsRes, subRes] = await Promise.all([fetch('/api/classes'), fetch('/api/subjects')])
        const clsJson = await clsRes.json()
        const subJson = await subRes.json()
        if (clsJson.data && clsJson.data.length > 0) {
          setClasses(clsJson.data)
          setSelectedClassId(clsJson.data[0].id)
        }
        if (subJson.data && subJson.data.length > 0) {
          setSubjects(subJson.data)
          setSelectedSubjectId(subJson.data[0].id)
        }
      } catch (err) {
        console.error('Error loading metadata:', err)
      }
    }
    loadMetadata()
  }, [])

  // Fetch students & existing results when class changes
  useEffect(() => {
    if (!selectedClassId) return
    async function loadScores() {
      setLoading(true)
      try {
        const [stuRes, resRes] = await Promise.all([
          fetch(`/api/students?classId=${selectedClassId}`),
          fetch(`/api/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}`),
        ])

        const stuJson = await stuRes.json()
        const resJson = await resRes.json()

        if (stuJson.data && stuJson.data.length > 0) {
          const existingResultsMap = new Map<string, any>()
          if (resJson.data) {
            resJson.data.forEach((r: any) => existingResultsMap.set(r.studentId, r))
          }

          const mapped: StudentScoreRow[] = stuJson.data.map((s: any, idx: number) => {
            const existing = existingResultsMap.get(s.id)
            const caTotal = existing?.caScore || 30
            const ca1 = Math.round(caTotal / 2)
            const ca2 = caTotal - ca1
            const examScore = existing?.examScore || 45
            const total = existing?.totalScore || caTotal + examScore
            const grading = computeNigerianGrade(total)

            return {
              studentId: s.id,
              admissionNo: s.admissionNo || s.studentId || `ADM-00${idx + 1}`,
              name: s.user?.name || s.name || `Student ${idx + 1}`,
              ca1,
              ca2,
              examScore,
              total,
              grade: existing?.letterGrade || grading.grade,
              position: existing?.position || idx + 1,
              teacherRemark: existing?.teacherRemark || grading.remark,
            }
          })

          // Calculate rankings
          mapped.sort((a, b) => b.total - a.total)
          mapped.forEach((m, idx) => (m.position = idx + 1))
          setScores(mapped)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadScores()
  }, [selectedClassId, selectedSubjectId])

  const handleScoreChange = (
    studentId: string,
    field: 'ca1' | 'ca2' | 'examScore' | 'teacherRemark',
    val: string
  ) => {
    setSaveSuccess(false)
    setScores((prev) => {
      const updated = prev.map((row) => {
        if (row.studentId !== studentId) return row

        let ca1 = row.ca1
        let ca2 = row.ca2
        let examScore = row.examScore
        let teacherRemark = row.teacherRemark

        if (field === 'ca1') ca1 = Math.min(20, Math.max(0, parseFloat(val) || 0))
        if (field === 'ca2') ca2 = Math.min(20, Math.max(0, parseFloat(val) || 0))
        if (field === 'examScore') examScore = Math.min(60, Math.max(0, parseFloat(val) || 0))
        if (field === 'teacherRemark') teacherRemark = val

        const total = ca1 + ca2 + examScore
        const grading = computeNigerianGrade(total)

        return {
          ...row,
          ca1,
          ca2,
          examScore,
          total,
          grade: grading.grade,
          teacherRemark: field === 'teacherRemark' ? teacherRemark : (row.teacherRemark || grading.remark),
        }
      })

      // Re-rank based on total
      const sorted = [...updated].sort((a, b) => b.total - a.total)
      const rankMap = new Map<string, number>()
      sorted.forEach((item, index) => rankMap.set(item.studentId, index + 1))

      return updated.map((r) => ({ ...r, position: rankMap.get(r.studentId) || 1 }))
    })
  }

  const handleSaveScores = async () => {
    if (!selectedClassId || !selectedSubjectId) {
      alert('Please select class and subject')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          scores: scores.map((s) => ({
            studentId: s.studentId,
            ca1: s.ca1,
            ca2: s.ca2,
            caScore: s.ca1 + s.ca2,
            examScore: s.examScore,
            teacherRemark: s.teacherRemark,
          })),
        }),
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 5000)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save scores')
      }
    } catch (err: any) {
      alert(err.message || 'Error saving scores')
    } finally {
      setSaving(false)
    }
  }

  // Export CSV template
  const handleDownloadCSV = () => {
    const headers = ['Admission No', 'Student Name', 'CA 1 (20)', 'CA 2 (20)', 'Exam (60)', 'Remarks']
    const rows = scores.map((s) => [
      s.admissionNo,
      `"${s.name.replace(/"/g, '""')}"`,
      s.ca1,
      s.ca2,
      s.examScore,
      `"${s.teacherRemark.replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `CA_Scores_${selectedClassId}_Template.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Import CSV parser
  const handleUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length <= 1) return

      // Parse rows
      const updatedScores = [...scores]
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
        const admNo = cols[0]
        const ca1Val = parseFloat(cols[2]) || 0
        const ca2Val = parseFloat(cols[3]) || 0
        const examVal = parseFloat(cols[4]) || 0
        const remarkVal = cols[5] || ''

        const target = updatedScores.find((s) => s.admissionNo.toLowerCase() === admNo.toLowerCase())
        if (target) {
          target.ca1 = Math.min(20, Math.max(0, ca1Val))
          target.ca2 = Math.min(20, Math.max(0, ca2Val))
          target.examScore = Math.min(60, Math.max(0, examVal))
          target.total = target.ca1 + target.ca2 + target.examScore
          target.grade = computeNigerianGrade(target.total).grade
          target.teacherRemark = remarkVal || computeNigerianGrade(target.total).remark
        }
      }

      // Re-rank
      updatedScores.sort((a, b) => b.total - a.total)
      updatedScores.forEach((s, idx) => (s.position = idx + 1))
      setScores(updatedScores)
      alert(`Imported and populated scores for ${lines.length - 1} student records!`)
    }
    reader.readAsText(file)
  }

  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s.total, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.total)) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores.map((s) => s.total)) : 0

  const filteredScores = scores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Continuous Assessment (CA) & Exam Score Entry
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter CA 1 (20 Marks), CA 2 (20 Marks), and Terminal Exam (60 Marks) with live Nigerian grading & class positions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Download Excel/CSV
            </Button>

            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-200">
              <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload CSV
              <input type="file" accept=".csv" onChange={handleUploadCSV} className="hidden" />
            </label>

            <Button
              onClick={handleSaveScores}
              disabled={saving}
              size="sm"
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save & Lock Scores
            </Button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            All Continuous Assessment & Examination scores have been validated, ranked, and saved to the database.
          </div>
        )}

        {/* Filters & Selector Bar */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Select Class / Arm
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Search Candidate
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistical Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 p-3">
            <p className="text-[11px] text-gray-500 font-medium">Class Average</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{averageScore}%</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 p-3">
            <p className="text-[11px] text-gray-500 font-medium">Highest Mark</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{highestScore}%</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 p-3">
            <p className="text-[11px] text-gray-500 font-medium">Lowest Mark</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{lowestScore}%</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 p-3">
            <p className="text-[11px] text-gray-500 font-medium">Total Candidates</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-0.5">{scores.length}</p>
          </Card>
        </div>

        {/* Interactive Score Grid */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Score Entry Register ({filteredScores.length} Students)
              </CardTitle>
              <span className="text-[11px] text-gray-400">
                Formula: CA1 (20) + CA2 (20) + Exam (60) = 100%
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading class score sheet...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs">Pos</TableHead>
                    <TableHead className="w-32 text-xs">Admission No</TableHead>
                    <TableHead className="min-w-[180px] text-xs">Student Name</TableHead>
                    <TableHead className="w-24 text-center text-xs">CA 1 (20)</TableHead>
                    <TableHead className="w-24 text-center text-xs">CA 2 (20)</TableHead>
                    <TableHead className="w-28 text-center text-xs">Exam (60)</TableHead>
                    <TableHead className="w-24 text-center text-xs">Total (100)</TableHead>
                    <TableHead className="w-20 text-center text-xs">Grade</TableHead>
                    <TableHead className="min-w-[200px] text-xs">Teacher Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((row) => {
                    const isDistinction = row.grade === 'A1'
                    const isCredit = ['B2', 'B3', 'C4', 'C5', 'C6'].includes(row.grade)

                    return (
                      <TableRow key={row.studentId} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                        <TableCell className="text-center font-bold text-xs text-gray-600">
                          #{row.position}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {row.admissionNo}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {row.name}
                        </TableCell>

                        {/* CA 1 */}
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={row.ca1}
                            onChange={(e) => handleScoreChange(row.studentId, 'ca1', e.target.value)}
                            className="h-8 w-16 text-center text-xs mx-auto font-medium"
                          />
                        </TableCell>

                        {/* CA 2 */}
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={row.ca2}
                            onChange={(e) => handleScoreChange(row.studentId, 'ca2', e.target.value)}
                            className="h-8 w-16 text-center text-xs mx-auto font-medium"
                          />
                        </TableCell>

                        {/* Exam */}
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max="60"
                            value={row.examScore}
                            onChange={(e) => handleScoreChange(row.studentId, 'examScore', e.target.value)}
                            className="h-8 w-20 text-center text-xs mx-auto font-medium"
                          />
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-center">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {row.total}
                          </span>
                        </TableCell>

                        {/* Grade */}
                        <TableCell className="text-center">
                          <Badge
                            className={`text-[10px] font-bold ${
                              isDistinction
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isCredit
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {row.grade}
                          </Badge>
                        </TableCell>

                        {/* Remark */}
                        <TableCell>
                          <Input
                            value={row.teacherRemark}
                            onChange={(e) => handleScoreChange(row.studentId, 'teacherRemark', e.target.value)}
                            className="h-8 text-xs"
                            placeholder="Enter pedagogical remark..."
                          />
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
