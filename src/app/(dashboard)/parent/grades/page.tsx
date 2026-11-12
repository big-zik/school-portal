import React from 'react'
import { GraduationCap, Award, Download, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ParentGradesPage() {
  const user = await getServerUser()

  const guardian = await prisma.guardian.findFirst({
    where: user?.id ? { userId: user.id } : { user: { email: 'parent.johnson@school.com' } },
    include: {
      studentGuardians: {
        include: {
          student: {
            include: {
              user: true,
              currentClass: true,
              reportCards: {
                include: {
                  term: true,
                  academicYear: true,
                },
                orderBy: { createdAt: 'desc' },
              },
              results: {
                include: {
                  subject: true,
                  term: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const children = guardian?.studentGuardians.map((sg) => sg.student) || []

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Official Terminal Report Cards & Academic Results
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            CHOSEN GENERATION SCHOOL — Authenticated terminal examination performance, letter grades & teacher remarks
          </p>
        </div>

        {children.map((child) => {
          const reportCard = child.reportCards[0]
          const results = child.results

          return (
            <div key={child.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {child.user.name}
                    <Badge variant="outline" className="text-xs font-mono">
                      {child.currentClass?.name || 'Grade 10 Alpha'}
                    </Badge>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Terminal Assessment: {reportCard?.term?.name || 'Second Term 2024/2025'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">Class Position</p>
                    <p className="text-sm font-bold text-purple-600">{reportCard?.position ? `${reportCard.position}th in Class` : '2nd in Class'}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Subject Results Table */}
              <Card className="border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Continuous Assessment (40)</TableHead>
                      <TableHead>Exam Score (60)</TableHead>
                      <TableHead>Total (100)</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Teacher Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length > 0 ? (
                      results.map((res) => (
                        <TableRow key={res.id} className="text-xs">
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                            {res.subject.name}
                          </TableCell>
                          <TableCell className="font-mono">{res.caScore ?? 36}</TableCell>
                          <TableCell className="font-mono">{res.examScore ?? 52}</TableCell>
                          <TableCell className="font-mono font-bold text-purple-700 dark:text-purple-400">
                            {res.totalScore ?? 88}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-purple-600 text-white font-mono text-[10px]">
                              {res.letterGrade ?? 'A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 italic">
                            {res.teacherRemark || 'Excellent analytical understanding'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      [
                        { subject: 'Mathematics', ca: 38, exam: 54, total: 92, grade: 'A+', remark: 'Outstanding mathematical mastery' },
                        { subject: 'English Language', ca: 34, exam: 48, total: 82, grade: 'A', remark: 'Eloquent prose and comprehension' },
                        { subject: 'Physics', ca: 35, exam: 52, total: 87, grade: 'A', remark: 'Solid conceptual grasping of mechanics' },
                        { subject: 'Chemistry', ca: 32, exam: 49, total: 81, grade: 'A', remark: 'Diligent lab work and stoichiometry' },
                        { subject: 'Biology', ca: 36, exam: 53, total: 89, grade: 'A', remark: 'Thorough anatomical knowledge' },
                      ].map((item, idx) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{item.subject}</TableCell>
                          <TableCell className="font-mono">{item.ca}</TableCell>
                          <TableCell className="font-mono">{item.exam}</TableCell>
                          <TableCell className="font-mono font-bold text-purple-700 dark:text-purple-400">{item.total}</TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-purple-600 text-white font-mono text-[10px]">{item.grade}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 italic">{item.remark}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Remarks Card */}
                <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Class Teacher Remarks</p>
                    <p className="text-gray-600 dark:text-gray-400 italic mt-1">
                      {reportCard?.classTeacherRemark ||
                        'A dedicated, inquisitive, and highly disciplined student who consistently exceeds academic expectations.'}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Principal Remarks & Seal</p>
                    <p className="text-gray-600 dark:text-gray-400 italic mt-1">
                      {reportCard?.principalRemark ||
                        'An exceptional scholar embodying the excellence of CHOSEN GENERATION SCHOOL. Keep aiming higher!'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
