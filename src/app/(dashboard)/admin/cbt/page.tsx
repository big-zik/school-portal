'use client'

import React, { useState, useEffect } from 'react'
import {
  Laptop,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  Search,
  Filter,
  Trash2,
  Edit,
  Loader2,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface CBTExam {
  id: string
  title: string
  subjectName: string
  className: string
  durationMinutes: number
  passingScore: number
  totalMarks: number
  questionCount: number
  questions?: any[]
}

export default function AdminCBTPage() {
  const [exams, setExams] = useState<CBTExam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Exam Form
  const [title, setTitle] = useState('')
  const [subjectName, setSubjectName] = useState('Mathematics')
  const [className, setClassName] = useState('Grade 10 (SS 1)')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [passingScore, setPassingScore] = useState(50)
  const [questions, setQuestions] = useState([
    {
      questionText: 'What is the discriminant of the quadratic equation ax^2 + bx + c = 0?',
      options: { A: 'b^2 - 4ac', B: 'b^2 + 4ac', C: '4ac - b^2', D: '2b - 4ac' },
      correctOption: 'A',
      marks: 10,
      explanation: 'The discriminant determines the nature of the roots and is given by b^2 - 4ac.',
    },
    {
      questionText: 'Which organelle is universally referred to as the powerhouse of the cell?',
      options: { A: 'Ribosome', B: 'Endoplasmic Reticulum', C: 'Mitochondrion', D: 'Golgi Apparatus' },
      correctOption: 'C',
      marks: 10,
      explanation: 'Mitochondria generate cellular ATP via oxidative phosphorylation.',
    },
  ])

  const sampleExams: CBTExam[] = [
    {
      id: 'cbt-1',
      title: 'SS 1 Term 2 Mathematics Mid-Term CBT',
      subjectName: 'Pure Mathematics',
      className: 'Grade 10 (SS 1)',
      durationMinutes: 45,
      passingScore: 50,
      totalMarks: 50,
      questionCount: 25,
    },
    {
      id: 'cbt-2',
      title: 'WAEC / JAMB Biology Readiness Trial Quiz',
      subjectName: 'Biology',
      className: 'Grade 12 (SS 3)',
      durationMinutes: 60,
      passingScore: 60,
      totalMarks: 60,
      questionCount: 30,
    },
    {
      id: 'cbt-3',
      title: 'Junior Secondary Basic Science & Technology Test',
      subjectName: 'Basic Science',
      className: 'Grade 8 (JSS 2)',
      durationMinutes: 30,
      passingScore: 50,
      totalMarks: 40,
      questionCount: 20,
    },
  ]

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cbt/exams')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setExams(json.data)
      } else {
        setExams(sampleExams)
      }
    } catch (err) {
      console.error(err)
      setExams(sampleExams)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: { A: '', B: '', C: '', D: '' },
        correctOption: 'A',
        marks: 10,
        explanation: '',
      },
    ])
  }

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) return
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleQuestionChange = (idx: number, field: string, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q
        if (field.startsWith('opt_')) {
          const optKey = field.replace('opt_', '')
          return { ...q, options: { ...q.options, [optKey]: val } }
        }
        return { ...q, [field]: val }
      })
    )
  }

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/cbt/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subjectName,
          className,
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          totalMarks: questions.reduce((acc, q) => acc + (Number(q.marks) || 10), 0),
          questions,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        setTitle('')
        fetchExams()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create exam')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating exam')
    } finally {
      setCreating(false)
    }
  }

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Laptop className="w-6 h-6 text-indigo-600" />
              Computer-Based Testing (CBT) & Examination Engine
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Author timed digital quizzes, configure multiple-choice question banks, and monitor instant automated grading
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Author New CBT Exam
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Published CBT Exams</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{exams.length}</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Active Question Items</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">145 Questions</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Completed Attempts</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">324 Sessions</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Average Pass Rate</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">87.4%</p>
          </Card>
        </div>

        {/* Exams Roster */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Active Examinations Roster ({filteredExams.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search CBT title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading CBT exams...
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                No CBT tests found. Click "Author New CBT Exam" to publish your first assessment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Examination Title</TableHead>
                    <TableHead className="text-xs">Subject & Class</TableHead>
                    <TableHead className="text-xs text-center">Duration</TableHead>
                    <TableHead className="text-xs text-center">Questions</TableHead>
                    <TableHead className="text-xs text-center">Pass Mark</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((ex) => (
                    <TableRow key={ex.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {ex.title}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-gray-800 dark:text-gray-200">{ex.subjectName}</p>
                        <p className="text-[11px] text-gray-400">{ex.className}</p>
                      </TableCell>
                      <TableCell className="text-center text-xs font-mono text-gray-600 dark:text-gray-300">
                        {ex.durationMinutes} Mins
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-indigo-600">
                        {ex.questionCount} Items
                      </TableCell>
                      <TableCell className="text-center text-xs font-semibold text-emerald-600">
                        {ex.passingScore}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active & Timed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal: Author New CBT Exam */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-600" />
                  Author CBT Assessment & Question Bank
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleSaveExam}>
                <CardContent className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Assessment Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. SS 2 Term 2 Physics Mechanics & Optics Test"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Subject
                      </label>
                      <Input
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Target Class
                      </label>
                      <Input
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Timer (Minutes)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        max="180"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Pass Mark (%)
                      </label>
                      <Input
                        type="number"
                        min="30"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Question Builder */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        Question Bank Items ({questions.length})
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddQuestion}
                        className="text-xs gap-1 h-7 text-indigo-600"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </Button>
                    </div>

                    {questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            Question #{idx + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="text-gray-400 hover:text-red-600 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <Input
                            placeholder="Enter question text / problem statement..."
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                            className="text-xs bg-white dark:bg-gray-900"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                            <div key={opt} className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 w-4">{opt}:</span>
                              <Input
                                placeholder={`Option ${opt}`}
                                value={q.options[opt]}
                                onChange={(e) => handleQuestionChange(idx, `opt_${opt}`, e.target.value)}
                                className="text-xs bg-white dark:bg-gray-900 flex-1"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                              Correct Choice:
                            </span>
                            <select
                              value={q.correctOption}
                              onChange={(e) => handleQuestionChange(idx, 'correctOption', e.target.value)}
                              className="text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 font-bold text-emerald-600"
                            >
                              <option value="A">Option A</option>
                              <option value="B">Option B</option>
                              <option value="C">Option C</option>
                              <option value="D">Option D</option>
                            </select>
                          </div>

                          <Input
                            placeholder="Pedagogical explanation for review..."
                            value={q.explanation}
                            onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                            className="text-xs bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(false)}
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
                      Publish CBT Test
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
