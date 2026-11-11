'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Download,
  Paperclip,
  Calendar,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

const defaultAssignments = [
  {
    id: 'asg-3',
    title: 'Essay: Themes of Colonial Resistance in Things Fall Apart',
    subject: 'English & Composition',
    teacher: 'Mr. Andrew Clark',
    due: 'Feb 25, 2025 at 11:59 PM',
    totalMarks: 30,
    status: 'PENDING',
    instructions:
      'Write a 1,500-word critical essay examining Okonkwo’s inner conflict against the British colonial administration. Focus on chapters 15 through 22. Adhere to MLA 9th edition citation format.',
    attachment: 'Things_Fall_Apart_Essay_Rubric.pdf',
  },
  {
    id: 'asg-2',
    title: 'Volumetric Analysis & Titration Lab Report',
    subject: 'General Chemistry',
    teacher: 'Mrs. Folashade Adebayo',
    due: 'Feb 21, 2025',
    totalMarks: 40,
    status: 'SUBMITTED',
    submittedDate: 'Feb 19, 2025 at 04:15 PM',
    myFile: 'Daniel_Johnson_Chemistry_Titration_Lab.pdf',
    instructions:
      'Complete the quantitative table for hydrochloric acid standardization with anhydrous sodium carbonate. Calculate molar concentrations.',
  },
  {
    id: 'asg-1',
    title: 'Problem Set 4: Quadratic Equations & Graphing Proofs',
    subject: 'Pure Mathematics',
    teacher: 'Dr. Robert Smith',
    due: 'Feb 15, 2025',
    totalMarks: 50,
    status: 'GRADED',
    score: 46.5,
    percentage: 93,
    grade: 'A',
    feedback:
      'Superb work on vertex form and discriminant derivations. Review question 14 coordinate transformation.',
    myFile: 'Daniel_Johnson_Math_PS4.pdf',
  },
]

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'graded'>('pending')
  const [selectedAsg, setSelectedAsg] = useState<string | null>('asg-3')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [assignments, setAssignments] = useState(defaultAssignments)

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await fetch('/api/assignments')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            const mapped = json.data.map((a: any) => ({
              id: a.id,
              title: a.title,
              subject: a.subject?.name || 'General Subject',
              teacher: a.teacher?.user?.name || 'Course Instructor',
              due: new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              totalMarks: a.totalMarks,
              status: 'PENDING',
              instructions: a.description || 'Complete all requirements according to the course rubric.',
              attachment: a.attachmentUrl || undefined,
            }))
            setAssignments(mapped)
            setSelectedAsg(mapped[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load assignments', err)
      }
    }
    loadAssignments()
  }, [])

  const current = assignments.find((a) => a.id === selectedAsg) || assignments[0]

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-blue-600" />
              Assignments & Coursework
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Coursework deadlines, digital file uploads, and teacher assessment feedback
            </p>
          </div>
        </div>

        {uploadSuccess && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Assignment submitted successfully!</strong> Time-stamped and sent to instructor for grading.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Coursework Queue ({assignments.length})
            </h3>
            <div className="space-y-2.5">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => {
                    setSelectedAsg(asg.id)
                    setUploadSuccess(false)
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedAsg === asg.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                      : 'border-gray-200/80 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                      {asg.subject}
                    </span>
                    <Badge
                      variant={
                        asg.status === 'GRADED'
                          ? 'success'
                          : asg.status === 'SUBMITTED'
                          ? 'default'
                          : 'warning'
                      }
                      className="text-[10px]"
                    >
                      {asg.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {asg.title}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>Due: {asg.due.split(' at ')[0]}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {asg.totalMarks} Marks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Details & Submission Workspace */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {current.subject} • {current.totalMarks} Total Marks
                  </Badge>
                  <Badge
                    variant={
                      current.status === 'GRADED'
                        ? 'success'
                        : current.status === 'SUBMITTED'
                        ? 'default'
                        : 'warning'
                    }
                    className="text-xs"
                  >
                    {current.status}
                  </Badge>
                </div>

                <CardTitle className="text-lg font-bold mt-2">{current.title}</CardTitle>
                <p className="text-xs text-gray-500">Instructor: {current.teacher} • Deadline: {current.due}</p>
              </CardHeader>

              <CardContent className="p-6 space-y-6 flex-1">
                {/* Instructions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Task Instructions
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    {current.instructions}
                  </p>
                </div>

                {/* Teacher attachments if any */}
                {current.attachment && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Teacher Attached Resources
                    </h4>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
                      <span className="flex items-center gap-2 font-medium">
                        <Paperclip className="w-4 h-4 text-blue-600" />
                        {current.attachment}
                      </span>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* Graded Feedback Box */}
                {current.status === 'GRADED' && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                        Teacher Grade & Remarks
                      </h4>
                      <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300">
                        Score: {current.score} / {current.totalMarks} ({current.percentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                      "{current.feedback}"
                    </p>
                  </div>
                )}

                {/* Submission Zone */}
                {current.status === 'PENDING' && (
                  <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                      Submit Your Work
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center space-y-3 hover:border-blue-500 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          Click to select or drag and drop your completed document
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Accepted: PDF, DOCX, XLSX (Max 50MB)
                        </p>
                      </div>
                      <Button
                        onClick={() => setUploadSuccess(true)}
                        size="sm"
                        className="text-xs font-semibold bg-blue-600 hover:bg-blue-700"
                      >
                        Upload & Submit Assignment
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
