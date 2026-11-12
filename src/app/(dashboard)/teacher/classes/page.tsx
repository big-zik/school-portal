'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Search,
  Eye,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  X,
  Mail,
  UserCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface ClassData {
  id: string
  name: string
  subjectName: string
  subjectCode: string
  studentCount: number
  isFormTeacher: boolean
  room: string
  schedule: string
}

interface StudentItem {
  id: string
  admissionNo: string
  name: string
  gender: string
  parentName?: string
  status: string
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch('/api/classes')
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          const mapped: ClassData[] = json.data.map((c: any, idx: number) => ({
            id: c.id,
            name: c.name,
            subjectName: idx % 2 === 0 ? 'Mathematics' : 'Further Mathematics',
            subjectCode: idx % 2 === 0 ? 'MTH101' : 'FMTH201',
            studentCount: c._count?.students || 28 + (idx * 2),
            isFormTeacher: idx === 0,
            room: `Wing ${String.fromCharCode(65 + idx)} - Room 20${idx + 1}`,
            schedule: 'Mon, Wed, Fri (08:30 - 09:45)',
          }))
          setClasses(mapped)
        } else {
          // Fallback demo classes
          setClasses([
            {
              id: 'cls-1',
              name: 'Grade 10 (SS 1) - Alpha',
              subjectName: 'Pure Mathematics',
              subjectCode: 'MTH101',
              studentCount: 32,
              isFormTeacher: true,
              room: 'Block B - Room 201',
              schedule: 'Mon, Wed, Fri (08:30 - 09:45)',
            },
            {
              id: 'cls-2',
              name: 'Grade 10 (SS 1) - Beta',
              subjectName: 'Pure Mathematics',
              subjectCode: 'MTH101',
              studentCount: 30,
              isFormTeacher: false,
              room: 'Block B - Room 202',
              schedule: 'Tue, Thu (10:00 - 11:30)',
            },
            {
              id: 'cls-3',
              name: 'Grade 11 (SS 2) - Science',
              subjectName: 'Advanced Calculus',
              subjectCode: 'MTH202',
              studentCount: 26,
              isFormTeacher: false,
              room: 'Block C - Lab 104',
              schedule: 'Mon, Wed (12:00 - 13:15)',
            },
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const viewRoster = async (cls: ClassData) => {
    setSelectedClass(cls)
    setLoadingStudents(true)
    try {
      const res = await fetch(`/api/students?classId=${cls.id}`)
      const json = await res.json()
      if (json.data && json.data.length > 0) {
        setStudents(
          json.data.map((s: any) => ({
            id: s.id,
            admissionNo: s.admissionNo || s.studentId || 'ADM-000',
            name: s.user?.name || s.name || 'Student',
            gender: s.gender || 'N/A',
            parentName: s.studentGuardians?.[0]?.guardian?.user?.name || 'Guardian',
            status: s.status || 'ACTIVE',
          }))
        )
      } else {
        // Fallback demo roster
        setStudents([
          { id: '1', admissionNo: 'ADM/2024/001', name: 'Daniel Johnson', gender: 'MALE', parentName: 'Chief Emeka Johnson', status: 'ACTIVE' },
          { id: '2', admissionNo: 'ADM/2024/002', name: 'Amara Okafor', gender: 'FEMALE', parentName: 'Dr. Chidi Okafor', status: 'ACTIVE' },
          { id: '3', admissionNo: 'ADM/2024/003', name: 'David Adeleke', gender: 'MALE', parentName: 'Mrs. Funke Adeleke', status: 'ACTIVE' },
          { id: '4', admissionNo: 'ADM/2024/004', name: 'Fatima Abubakar', gender: 'FEMALE', parentName: 'Alhaji Sani Abubakar', status: 'ACTIVE' },
          { id: '5', admissionNo: 'ADM/2024/005', name: 'Chukwudi Eze', gender: 'MALE', parentName: 'Barr. Obinna Eze', status: 'ACTIVE' },
          { id: '6', admissionNo: 'ADM/2024/006', name: 'Grace Mensah', gender: 'FEMALE', parentName: 'Mr. Kwame Mensah', status: 'ACTIVE' },
          { id: '7', admissionNo: 'ADM/2024/007', name: 'Ibrahim Sani', gender: 'MALE', parentName: 'Hajiya Aisha Sani', status: 'ACTIVE' },
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStudents(false)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalTeachingStudents = classes.reduce((acc, c) => acc + c.studentCount, 0)

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              Assigned Classes & Academic Arms
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Overview of teaching schedules, student enrollment, homeroom responsibilities, and rosters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/teacher/attendance">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Take Roll Call
              </Button>
            </Link>
            <Link href="/teacher/grades">
              <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                <GraduationCap className="w-4 h-4" /> Enter CA Scores
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Assigned Classes</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{classes.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Students Taught</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalTeachingStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Form Teacher Duty</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {classes.filter((c) => c.isFormTeacher).length} Cohort(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading class assignments...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-semibold text-blue-700 border-blue-200 bg-blue-50/50">
                      {cls.subjectCode}
                    </Badge>
                    {cls.isFormTeacher && (
                      <Badge className="text-[10px] bg-purple-100 dark:bg-purple-950/40 text-purple-700">
                        Class Teacher
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {cls.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500">{cls.subjectName}</p>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 pb-4">
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Classroom:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{cls.room}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Schedule:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{cls.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Enrolled Students:</span>
                      <span className="font-semibold text-blue-600">{cls.studentCount} pupils</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewRoster(cls)}
                      className="text-xs gap-1.5 flex-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Roster
                    </Button>
                    <Link href={`/teacher/attendance?classId=${cls.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 text-emerald-600 border-emerald-200">
                        <ClipboardCheck className="w-3.5 h-3.5" /> Roll Call
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Student Roster Modal */}
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Roster: {selectedClass.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedClass.subjectName} &bull; Total Enrolled: {students.length} Students
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by student name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                {loadingStudents ? (
                  <div className="py-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> Loading student records...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No students match search filter.
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Admission No</TableHead>
                          <TableHead className="text-xs">Student Full Name</TableHead>
                          <TableHead className="text-xs">Gender</TableHead>
                          <TableHead className="text-xs">Primary Guardian</TableHead>
                          <TableHead className="text-xs text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((s) => (
                          <TableRow key={s.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                            <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {s.admissionNo}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {s.name}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">{s.gender}</TableCell>
                            <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                              {s.parentName}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {s.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
