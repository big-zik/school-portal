import React from 'react'
import {
  GraduationCap,
  Award,
  Download,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Printer,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function StudentGradesPage() {
  const user = await getServerUser()

  const reportData = {
    term: 'First Term (Fall 2024)',
    academicYear: '2024/2025',
    studentName: 'Daniel Johnson',
    studentId: 'STU2024001',
    class: 'Grade 10 (SS 1) - Alpha',
    position: '2nd',
    outOf: 30,
    totalScore: 732,
    maximumScore: 800,
    average: 91.5,
    gpa: '3.92 / 4.00',
    principalRemark: 'An exceptional scholar with stellar quantitative aptitude and commendable character.',
    classTeacherRemark: 'Consistent excellence throughout the term. Active participation in STEM competitions.',
    subjects: [
      { name: 'Pure Mathematics', caScore: 38, examScore: 57, total: 95, grade: 'A+', position: '1st', remark: 'Outstanding mathematical acumen' },
      { name: 'General Chemistry', caScore: 36, examScore: 54, total: 90, grade: 'A', position: '2nd', remark: 'Thorough grasp of reaction stoichiometry' },
      { name: 'English & Composition', caScore: 35, examScore: 52, total: 87, grade: 'A', position: '3rd', remark: 'Very good vocabulary and essay structure' },
      { name: 'Physics & Mechanics', caScore: 37, examScore: 56, total: 93, grade: 'A+', position: '1st', remark: 'Brilliant kinematics problem solving' },
      { name: 'Computer Science', caScore: 39, examScore: 58, total: 97, grade: 'A+', position: '1st', remark: 'Top in class in algorithm implementation' },
      { name: 'Biology & Physiology', caScore: 34, examScore: 51, total: 85, grade: 'A', position: '4th', remark: 'Good laboratory diagrams and notes' },
      { name: 'Economics', caScore: 35, examScore: 50, total: 85, grade: 'A', position: '4th', remark: 'Strong understanding of price elasticity' },
    ],
  }

  return (
    <DashboardLayout user={user} role="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Academic Results & Report Card
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified terminal report card, continuous assessment marks, and subject rankings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button size="sm" className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 font-semibold">
              <Download className="w-3.5 h-3.5" /> Download PDF Report Card
            </Button>
          </div>
        </div>

        {/* Report Summary Header Card */}
        <Card className="border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-purple-600 text-white text-[10px]">
                    Official Report Card
                  </Badge>
                  <span className="text-xs text-gray-500">{reportData.term}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {reportData.studentName} ({reportData.studentId})
                </h3>
                <p className="text-xs text-gray-500">{reportData.class} • Session {reportData.academicYear}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Class Rank</p>
                  <p className="text-xl font-extrabold text-purple-600 mt-0.5">{reportData.position}</p>
                  <p className="text-[10px] text-gray-400">out of {reportData.outOf}</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Average</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{reportData.average}%</p>
                  <p className="text-[10px] text-gray-400">732 / 800</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Term GPA</p>
                  <p className="text-xl font-extrabold text-blue-600 mt-0.5">3.92</p>
                  <p className="text-[10px] text-gray-400">Scale of 4.0</p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Status</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </p>
                  <p className="text-[10px] text-gray-400">Clear Standing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Broad Sheet Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Subject Performance Breakdown</span>
              <span className="text-xs text-gray-400 font-normal">Grading Scale: A+ (90-100) • A (80-89) • B (70-79)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Title</TableHead>
                  <TableHead className="text-center">CA (40%)</TableHead>
                  <TableHead className="text-center">Exam (60%)</TableHead>
                  <TableHead className="text-center">Total (100%)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Position</TableHead>
                  <TableHead>Teacher Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.subjects.map((sub, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                      {sub.name}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{sub.caScore}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{sub.examScore}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-gray-900 dark:text-gray-100">
                      {sub.total}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={sub.grade === 'A+' ? 'success' : 'default'}
                        className="text-[10px] font-bold"
                      >
                        {sub.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-xs text-gray-600 dark:text-gray-300">
                      {sub.position}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 italic">{sub.remark}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Remarks Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Class Teacher Remark
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                "{reportData.classTeacherRemark}"
              </p>
              <p className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 mt-2">
                — Dr. Robert Smith (Senior Secondary Form Tutor)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Principal Remark & Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                "{reportData.principalRemark}"
              </p>
              <p className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 mt-2">
                — Dr. Elizabeth Vance (Principal & Head of School)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
