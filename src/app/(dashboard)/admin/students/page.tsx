'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Users, PlusCircle, Search, Download, Trash2, Edit, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { StudentModal } from '@/components/shared/modals/StudentModal'
import { ConfirmDialog } from '@/components/shared/modals/ConfirmDialog'
import { StudentProfile, ClassSummary } from '@/types'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      const json = await res.json()
      if (json.success) {
        setClasses(json.data || [])
      }
    } catch (e) {
      console.error('Failed to load classes', e)
    }
  }

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedClassId) params.set('classId', selectedClassId)

      const res = await fetch(`/api/students?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setStudents(json.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch students', e)
    } finally {
      setLoading(false)
    }
  }, [search, selectedClassId])

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchStudents])

  const handleDelete = async () => {
    if (!studentToDelete) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteConfirmOpen(false)
        setStudentToDelete(null)
        fetchStudents()
      }
    } catch (e) {
      console.error('Failed to delete student', e)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              Student Information & Enrolment Directory
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {students.length} actively registered students in current database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setSelectedStudent(null)
                setModalOpen(true)
              }}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Admit New Student
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or admission ID..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading student records...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                No student records found. Click "Admit New Student" to add your first student.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Class / Section</TableHead>
                    <TableHead className="text-xs">Gender</TableHead>
                    <TableHead className="text-xs">Email / Contact</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <TableCell className="font-mono text-xs font-semibold text-blue-600">
                        {student.studentId || student.admissionNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {student.fullName}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {student.currentClass?.name || 'Unassigned'}
                        {student.currentSection?.name ? ` - ${student.currentSection.name}` : ''}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {student.gender || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {student.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === 'ACTIVE' ? 'success' : 'outline'}
                          className="text-[10px]"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setSelectedStudent(student)
                              setModalOpen(true)
                            }}
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setStudentToDelete(student)
                              setDeleteConfirmOpen(true)
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Student Modal */}
      <StudentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        student={selectedStudent}
        classes={classes}
        onSuccess={() => {
          fetchStudents()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Withdraw Student"
        description={`Are you sure you want to withdraw student ${studentToDelete?.fullName}? This will archive their profile.`}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  )
}
