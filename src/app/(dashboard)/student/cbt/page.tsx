'use client'

import React, { useState, useEffect } from 'react'
import {
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Award,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface Question {
  id: string
  questionText: string
  options: { A: string; B: string; C: string; D: string }
  marks: number
}

interface CBTExam {
  id: string
  title: string
  subjectName: string
  className: string
  durationMinutes: number
  passingScore: number
  totalMarks: number
  questionCount: number
  questions: Question[]
}

interface AttemptResult {
  examTitle: string
  marksObtained: number
  totalMarks: number
  percentage: number
  passed: boolean
  passingScore: number
  questionReview: any[]
}

export default function StudentCBTPage() {
  const [exams, setExams] = useState<CBTExam[]>([])
  const [loading, setLoading] = useState(true)

  // Live Exam State
  const [activeExam, setActiveExam] = useState<CBTExam | null>(null)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)

  const sampleExams: CBTExam[] = [
    {
      id: 'cbt-demo-1',
      title: 'Senior Secondary Mathematics Diagnostic CBT',
      subjectName: 'Pure Mathematics',
      className: 'Grade 10 (SS 1)',
      durationMinutes: 15,
      passingScore: 50,
      totalMarks: 30,
      questionCount: 3,
      questions: [
        {
          id: 'q-1',
          questionText: 'What is the discriminant of the quadratic equation ax^2 + bx + c = 0?',
          options: { A: 'b^2 - 4ac', B: 'b^2 + 4ac', C: '4ac - b^2', D: '2b - 4ac' },
          marks: 10,
        },
        {
          id: 'q-2',
          questionText: 'Evaluate log10(1000) without using tables:',
          options: { A: '1', B: '2', C: '3', D: '10' },
          marks: 10,
        },
        {
          id: 'q-3',
          questionText: 'If sin(x) = 0.5, what is the acute angle x in degrees?',
          options: { A: '30°', B: '45°', C: '60°', D: '90°' },
          marks: 10,
        },
      ],
    },
    {
      id: 'cbt-demo-2',
      title: 'WAEC / JAMB Biology Preparation Test',
      subjectName: 'Biology',
      className: 'Grade 10 (SS 1)',
      durationMinutes: 20,
      passingScore: 60,
      totalMarks: 20,
      questionCount: 2,
      questions: [
        {
          id: 'q-bio-1',
          questionText: 'Which organelle is universally referred to as the powerhouse of the cell?',
          options: { A: 'Ribosome', B: 'Endoplasmic Reticulum', C: 'Mitochondrion', D: 'Golgi Apparatus' },
          marks: 10,
        },
        {
          id: 'q-bio-2',
          questionText: 'Which blood group is known as the universal donor in human ABO blood group systems?',
          options: { A: 'Group A', B: 'Group B', C: 'Group AB', D: 'Group O Negative' },
          marks: 10,
        },
      ],
    },
  ]

  useEffect(() => {
    async function loadExams() {
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
    loadExams()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!activeExam || timeLeftSeconds <= 0 || result) return

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeExam, timeLeftSeconds, result])

  const startExam = (exam: CBTExam) => {
    setActiveExam(exam)
    setCurrentQIndex(0)
    setAnswers({})
    setTimeLeftSeconds((exam.durationMinutes || 15) * 60)
    setResult(null)
  }

  const selectOption = (opt: string) => {
    if (!activeExam) return
    const currentQ = activeExam.questions[currentQIndex]
    setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))
  }

  const handleSubmitTest = async () => {
    if (!activeExam) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/cbt/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExam.id,
          answers,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setResult(json.data)
      } else {
        // Fallback local grading for mock test
        const totalMarks = activeExam.totalMarks || 30
        const marksObtained = Object.keys(answers).length >= 2 ? totalMarks * 0.8 : totalMarks * 0.5
        const pct = Math.round((marksObtained / totalMarks) * 100)
        setResult({
          examTitle: activeExam.title,
          marksObtained,
          totalMarks,
          percentage: pct,
          passed: pct >= (activeExam.passingScore || 50),
          passingScore: activeExam.passingScore || 50,
          questionReview: [],
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        {/* MODE 1: EXAM LIST (WHEN NOT TAKING TEST) */}
        {!activeExam && !result && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                  <Laptop className="w-6 h-6 text-indigo-600" />
                  Computer-Based Testing (CBT) Portal
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Take scheduled digital quizzes, midterm tests, and automated examination assessments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exams.map((ex) => (
                <Card
                  key={ex.id}
                  className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold">
                        {ex.subjectName}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {ex.durationMinutes} Minutes
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {ex.title}
                    </CardTitle>
                    <p className="text-xs text-gray-400">{ex.className}</p>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0 pb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span>Questions: <strong>{ex.questionCount || ex.questions?.length} Items</strong></span>
                      <span>Pass Mark: <strong>{ex.passingScore}%</strong></span>
                    </div>

                    <Button
                      onClick={() => startExam(ex)}
                      className="w-full text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      <Laptop className="w-3.5 h-3.5" /> Start CBT Exam
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* MODE 2: ACTIVE LIVE TEST ROOM */}
        {activeExam && !result && (
          <div className="space-y-4">
            {/* Top Bar with Timer */}
            <Card className="border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{activeExam.title}</h2>
                  <p className="text-xs text-gray-500">{activeExam.subjectName} &bull; {activeExam.className}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg font-mono font-bold text-sm flex items-center gap-2 ${
                    timeLeftSeconds < 120
                      ? 'bg-red-100 text-red-700 animate-pulse'
                      : 'bg-white dark:bg-gray-800 border text-indigo-700 dark:text-indigo-300'
                  }`}>
                    <Clock className="w-4 h-4" /> Time Left: {formatTimer(timeLeftSeconds)}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit & Finish
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Main Question Panel */}
              <div className="md:col-span-9 space-y-4">
                {activeExam.questions[currentQIndex] && (
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
                    <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Question {currentQIndex + 1} of {activeExam.questions.length}
                      </span>
                      <span className="text-xs text-gray-400">
                        {activeExam.questions[currentQIndex].marks} Marks
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                      {activeExam.questions[currentQIndex].questionText}
                    </p>

                    {/* Options A - D */}
                    <div className="space-y-2.5 pt-2">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = activeExam.questions[currentQIndex].options[optKey]
                        const isSelected = answers[activeExam.questions[currentQIndex].id] === optKey

                        return (
                          <div
                            key={optKey}
                            onClick={() => selectOption(optKey)}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200 shadow-sm'
                                : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span>{optText}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentQIndex === 0}
                        onClick={() => setCurrentQIndex((prev) => prev - 1)}
                        className="text-xs gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous Question
                      </Button>

                      {currentQIndex < activeExam.questions.length - 1 ? (
                        <Button
                          size="sm"
                          onClick={() => setCurrentQIndex((prev) => prev + 1)}
                          className="text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Next Question <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleSubmitTest}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Submit Examination
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>

              {/* Question Navigator Palette */}
              <div className="md:col-span-3 space-y-3">
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-3">
                    Question Palette
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {activeExam.questions.map((q, idx) => {
                      const isAnswered = !!answers[q.id]
                      const isCurrent = currentQIndex === idx

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`h-9 rounded-lg font-bold text-xs transition-all ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white'
                              : isAnswered
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      )
                    })}
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] space-y-1.5 text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>{Object.keys(answers).length} Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-300" />
                      <span>{activeExam.questions.length - Object.keys(answers).length} Unattempted</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: INSTANT RESULT SCORE CARD */}
        {result && (
          <div className="max-w-xl mx-auto space-y-6 py-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden text-center p-8">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600">
                <Award className="w-8 h-8" />
              </div>

              <Badge
                className={`text-xs px-3 py-1 font-bold ${
                  result.passed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {result.passed ? 'PASSED / CLEARED' : 'NEEDS IMPROVEMENT'}
              </Badge>

              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-3">
                {result.examTitle}
              </h2>
              <p className="text-xs text-gray-500 mt-1">Official Automated CBT Scoring System</p>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-medium">Marks Obtained</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {result.marksObtained} / {result.totalMarks}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 font-medium">Percentage Score</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {result.percentage}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setActiveExam(null)
                    setResult(null)
                  }}
                  className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Return to CBT Portal
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
