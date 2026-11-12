'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
  Loader2,
  X,
  Upload,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface Assignment {
  id: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalMarks: number
  isPublished: boolean
  class: { name: string; level?: number }
  subject: { name: string; code: string }
  _count?: { submissions: number }
  attachments?: any
}

interface Submission {
  id: string
  submittedAt: string
  isLate: boolean
  status: string
  remarks?: string
  files?: any
  student: {
    user: { name: string; email: string }
  }
  grade?: {
    marksObtained: number
    percentage: number
    letterGrade: string
    feedback?: string
  }
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('ALL')

  // Create Assignment Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    totalMarks: 20,
    description: '',
    instructions: '',
    attachmentUrl: '',
  })

  // Review Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradeScore, setGradeScore] = useState<number>(0)
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [savingGrade, setSavingGrade] = useState(false)

  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assignments')
      const json = await res.json()
      if (json.success && json.data) {
        setAssignments(json.data)
      }
    } catch (err) {
      console.error('Error fetching assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetadata = async () => {
    try {
      const [clsRes, subRes] = await Promise.all([fetch('/api/classes'), fetch('/api/subjects')])
      const clsJson = await clsRes.json()
      const subJson = await subRes.json()
      if (clsJson.data) setClasses(clsJson.data)
      if (subJson.data) setSubjects(subJson.data)
    } catch (err) {
      console.error('Error fetching metadata:', err)
    }
  }

  useEffect(() => {
    fetchAssignments()
    fetchMetadata()
  }, [])

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = {
        title: formData.title,
        classId: formData.classId || (classes[0]?.id ?? ''),
        subjectId: formData.subjectId || (subjects[0]?.id ?? ''),
        dueDate: new Date(formData.dueDate).toISOString(),
        totalMarks: Number(formData.totalMarks),
        description: formData.description,
        instructions: formData.instructions,
        isPublished: true,
        attachments: formData.attachmentUrl ? [{ name: 'Handout / Worksheet', url: formData.attachmentUrl }] : null,
      }

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setShowCreateModal(false)
        setFormData({
          title: '',
          classId: '',
          subjectId: '',
          dueDate: '',
          totalMarks: 20,
          description: '',
          instructions: '',
          attachmentUrl: '',
        })
        fetchAssignments()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create assignment')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating assignment')
    } finally {
      setCreating(false)
    }
  }

  const openSubmissionsReview = async (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setLoadingSubmissions(true)
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/submissions`)
      const json = await res.json()
      if (json.success && json.data) {
        setSubmissions(json.data)
      } else {
        setSubmissions([])
      }
    } catch (err) {
      console.error(err)
      setSubmissions([])
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleSelectSubmissionForGrading = (sub: Submission) => {
    setSelectedSubmission(sub)
    setGradeScore(sub.grade?.marksObtained ?? 0)
    setGradeFeedback(sub.grade?.feedback ?? '')
  }

  const handleSaveGrade = async () => {
    if (!selectedAssignment || !selectedSubmission) return
    setSavingGrade(true)
    try {
      const res = await fetch(`/api/assignments/${selectedAssignment.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GRADE',
          submissionId: selectedSubmission.id,
          studentId: (selectedSubmission as any).studentId,
          marksObtained: gradeScore,
          feedback: gradeFeedback,
        }),
      })

      if (res.ok) {
        // Refresh submissions
        openSubmissionsReview(selectedAssignment)
        setSelectedSubmission(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save grade')
      }
    } catch (err: any) {
      alert(err.message || 'Error saving grade')
    } finally {
      setSavingGrade(false)
    }
  }

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClassId === 'ALL' || a.class.name === selectedClassId
    return matchesSearch && matchesClass
  })

  const totalSubmissionsCount = assignments.reduce((acc, a) => acc + (a._count?.submissions || 0), 0)

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-600" />
              Assignments & Tasks Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create student coursework, publish instructions, review homework submissions, and enter grades
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Assignments</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{assignments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Submissions Received</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalSubmissionsCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Cohorts</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{classes.length || 3}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Subjects Handled</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{subjects.length || 4}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by assignment title or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-500 font-medium">Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Coursework Roster ({filteredAssignments.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                Loading assignments...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                No assignments found. Click "Create Assignment" above to assign coursework.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title & Subject</TableHead>
                    <TableHead className="text-xs">Target Class</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs">Total Marks</TableHead>
                    <TableHead className="text-xs">Submissions</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const isDuePast = new Date(assignment.dueDate) < new Date()
                    const subCount = assignment._count?.submissions || 0

                    return (
                      <TableRow key={assignment.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              {assignment.title}
                            </p>
                            <p className="text-[11px] text-gray-500">{assignment.subject?.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {assignment.class?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {isDuePast ? (
                              <Badge className="text-[9px] bg-red-100 dark:bg-red-950/40 text-red-700">Closed</Badge>
                            ) : (
                              <Badge className="text-[9px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700">Active</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {assignment.totalMarks} pts
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              subCount > 0
                                ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                            }`}
                          >
                            {subCount} submitted
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openSubmissionsReview(assignment)}
                            className="text-xs gap-1.5 h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            <Users className="w-3.5 h-3.5" /> Review & Grade
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

        {/* Create Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Create New Assignment
                </CardTitle>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleCreateAssignment}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Assignment Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Periodic Table & Chemical Bonding Homework"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Target Class *
                      </label>
                      <select
                        required
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Class...</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Subject...</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Submission Deadline *
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Maximum Score (Marks) *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Brief Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Summary of assignment objectives and topics covered..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Step-by-Step Instructions & Questions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed questions, format specifications, or instructions..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Resource Attachment Link / Document URL
                    </label>
                    <Input
                      placeholder="https://example.com/handout.pdf or uploaded file URL"
                      value={formData.attachmentUrl}
                      onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creating}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Publish Assignment
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}

        {/* Review Submissions Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Review Submissions: {selectedAssignment.title}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedAssignment.class?.name} &bull; {selectedAssignment.subject?.name} &bull; Max Score: {selectedAssignment.totalMarks} Marks
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedAssignment(null)
                    setSelectedSubmission(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {loadingSubmissions ? (
                  <div className="py-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Loading submissions...
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    <Clock className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                    No submissions have been turned in yet for this assignment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Submission list */}
                    <div className="md:col-span-7 space-y-2 max-h-96 overflow-y-auto pr-1">
                      {submissions.map((sub) => {
                        const isSelected = selectedSubmission?.id === sub.id
                        return (
                          <div
                            key={sub.id}
                            onClick={() => handleSelectSubmissionForGrading(sub)}
                            className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {sub.student?.user?.name || 'Student'}
                              </p>
                              {sub.grade ? (
                                <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  {sub.grade.marksObtained}/{selectedAssignment.totalMarks} ({sub.grade.letterGrade})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">
                                  Pending Grading
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span>Turned in: {new Date(sub.submittedAt).toLocaleString()}</span>
                              {sub.isLate && <span className="text-red-500 font-medium">(Late)</span>}
                            </div>
                            {sub.remarks && (
                              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 italic line-clamp-2">
                                "{sub.remarks}"
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Grading Form Drawer */}
                    <div className="md:col-span-5 border-l border-gray-100 dark:border-gray-800 pl-4 space-y-3">
                      {selectedSubmission ? (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Score & Feedback: {selectedSubmission.student?.user?.name}
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                Awarded Score (Out of {selectedAssignment.totalMarks})
                              </label>
                              <Input
                                type="number"
                                min="0"
                                max={selectedAssignment.totalMarks}
                                value={gradeScore}
                                onChange={(e) => setGradeScore(Number(e.target.value))}
                                className="text-xs"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                Teacher's Feedback
                              </label>
                              <textarea
                                rows={4}
                                placeholder="Praise strengths or suggest areas for correction..."
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <Button
                              onClick={handleSaveGrade}
                              disabled={savingGrade}
                              size="sm"
                              className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            >
                              {savingGrade && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              <CheckCircle2 className="w-3.5 h-3.5" /> Save Grade & Return
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-xs text-gray-400">
                          Select a student submission on the left to grade and provide feedback.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
