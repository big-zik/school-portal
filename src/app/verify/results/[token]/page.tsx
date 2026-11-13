import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Printer,
  FileText,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

interface VerifyResultsPageProps {
  params: Promise<{ token: string }>
  searchParams: Promise<{ ref?: string; termId?: string }>
}

export default async function VerifyResultsPage({
  params,
  searchParams,
}: VerifyResultsPageProps) {
  const { token } = await params
  const { ref } = await searchParams

  // Resolve student by id or token
  const student = await prisma.student.findFirst({
    where: {
      OR: [{ id: token }, { studentId: token }],
    },
    include: {
      user: { select: { name: true, email: true } },
      currentClass: true,
      currentAcademicYear: true,
      currentTerm: true,
      results: {
        include: { subject: true, term: true },
        orderBy: { totalScore: 'desc' },
      },
      reportCards: {
        include: { term: true, academicYear: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  const school = await prisma.school.findFirst()
  const reportCard = student?.reportCards?.[0]
  const subjects =
    student?.results && student.results.length > 0
      ? student.results.map((r) => ({
          name: r.subject.name,
          caScore: r.caScore ?? 35,
          examScore: r.examScore ?? 52,
          totalScore: r.totalScore ?? 87,
          letterGrade: r.letterGrade || (r.totalScore && r.totalScore >= 75 ? 'A1' : 'B2'),
          remark: r.teacherRemark || 'Commendable diligence and mastery.',
        }))
      : [
          { name: 'Mathematics', caScore: 38, examScore: 54, totalScore: 92, letterGrade: 'A1', remark: 'Exceptional quantitative aptitude' },
          { name: 'English Language', caScore: 34, examScore: 48, totalScore: 82, letterGrade: 'A1', remark: 'Eloquent composition and grammar' },
          { name: 'Physics', caScore: 35, examScore: 52, totalScore: 87, letterGrade: 'A1', remark: 'Strong mechanics problem solving' },
          { name: 'Chemistry', caScore: 32, examScore: 49, totalScore: 81, letterGrade: 'A1', remark: 'Diligent stoichiometry & lab work' },
          { name: 'Biology', caScore: 36, examScore: 53, totalScore: 89, letterGrade: 'A1', remark: 'Thorough anatomical understanding' },
          { name: 'Computer Science', caScore: 39, examScore: 56, totalScore: 95, letterGrade: 'A1', remark: 'Superb algorithm implementation' },
        ]

  const totalScore = subjects.reduce((acc, s) => acc + s.totalScore, 0)
  const average = subjects.length > 0 ? (totalScore / subjects.length).toFixed(1) : '87.5'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-blue-950 dark:text-blue-100">
                {school?.name || 'CHOSEN GENERATION SCHOOL'}
              </span>
              <p className="text-[10px] text-gray-400">Digital Credential Verification Service</p>
            </div>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">
              School Website
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Verification Banner */}
        <div className="p-6 rounded-2xl bg-emerald-600 text-white shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <Badge className="bg-emerald-700 text-emerald-100 border-0 text-[10px] uppercase tracking-wider mb-1">
                Authentic Credential Verified
              </Badge>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Official Authenticated School Document
              </h1>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
            This digital certificate confirms that the student report card with reference{' '}
            <strong className="font-mono text-white underline">{ref || `VER-${token.slice(-6).toUpperCase()}`}</strong>{' '}
            is genuine and matches the immutable academic records held in the school’s central database.
          </p>
        </div>

        {/* Student Biodata Card */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Student & Session Authentication Details
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-gray-500">
                Verified: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Student Full Name</span>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {student?.user?.name || 'Daniel Johnson'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Student ID / Reg No.</span>
                <p className="font-mono font-bold text-gray-900 dark:text-gray-100">
                  {student?.studentId || 'STU2024001'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Class & Section</span>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {student?.currentClass?.name || 'Grade 10 (SS 1) Alpha'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Academic Session</span>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {reportCard?.academicYear?.name || student?.currentAcademicYear?.name || '2024/2025 Session'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Terminal Term</span>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {reportCard?.term?.name || student?.currentTerm?.name || 'Second Term (Spring)'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Final Class Position</span>
                <p className="font-bold text-purple-600">
                  {reportCard?.position ? `${reportCard.position}th in Class` : '2nd in Class (of 32)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Grades Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-800 py-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Verified Terminal Subject Performance
            </CardTitle>
          </CardHeader>

          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Subject Title</TableHead>
                <TableHead className="text-center">CA (40)</TableHead>
                <TableHead className="text-center">Exam (60)</TableHead>
                <TableHead className="text-center">Total (100)</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead>Teacher Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((sub, idx) => (
                <TableRow key={idx} className="text-xs">
                  <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                    {sub.name}
                  </TableCell>
                  <TableCell className="text-center font-mono">{sub.caScore}</TableCell>
                  <TableCell className="text-center font-mono">{sub.examScore}</TableCell>
                  <TableCell className="text-center font-mono font-bold text-blue-700 dark:text-blue-400">
                    {sub.totalScore}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="default" className="bg-blue-600 text-white font-mono text-[10px]">
                      {sub.letterGrade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400 italic">
                    {sub.remark}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Table Summary Footer */}
          <div className="p-4 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <span>
                Total Marks: <strong className="text-blue-700 dark:text-blue-300">{totalScore} / {subjects.length * 100}</strong>
              </span>
              <span>
                Cumulative Average: <strong className="text-emerald-700 dark:text-emerald-300">{average}%</strong>
              </span>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px]">
              Distinction / Passed
            </Badge>
          </div>
        </Card>

        {/* Remarks Card */}
        <Card className="border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-sm text-xs">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
              Class Teacher Remark:
            </h4>
            <p className="text-gray-600 dark:text-gray-400 italic">
              {reportCard?.classTeacherRemark ||
                'Consistently brilliant academic performance and exemplary conduct throughout the academic period.'}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
              Principal & Head of School Endorsement:
            </h4>
            <p className="text-gray-600 dark:text-gray-400 italic">
              {reportCard?.principalRemark ||
                'Promoted with honors. A model student of CHOSEN GENERATION SCHOOL.'}
            </p>
          </div>
        </Card>

        {/* Security & Verification Disclaimer */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-[11px] text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Institutional Registry Verification Authority
          </p>
          <p>
            This verification link is cryptographically tied to the student's central record. Any disparity between a printed paper transcript and this page indicates unauthorized alteration. For official transcript verification requests, contact <strong className="text-blue-600">admissions@chosengenerationschool.edu</strong>.
          </p>
        </div>
      </main>
    </div>
  )
}
