'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Users, PlusCircle, Search, Mail, Phone, BookOpen, GraduationCap, Building2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface TeacherItem {
  id: string
  employeeId: string
  qualification: string | null
  specialization: string | null
  employmentType: string
  department?: { id: string; name: string } | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
    isActive: boolean
  }
  classSubjects?: Array<{
    class: { id: string; name: string }
    subject: { id: string; name: string; code: string }
  }>
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    qualification: '',
    specialization: '',
  })

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedDept) params.set('departmentId', selectedDept)

      const res = await fetch(`/api/teachers?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setTeachers(json.data || [])
      }
    } catch (e) {
      console.error('Failed to load teachers', e)
    } finally {
      setLoading(false)
    }
  }, [search, selectedDept])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchTeachers])

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create teacher')
      }

      setSuccessMsg(`Teacher ${formData.name} added successfully! Default password is Password@123`)
      setShowAddModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        qualification: '',
        specialization: '',
      })
      fetchTeachers()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      setFormError(err.message || 'Error creating teacher')
    } finally {
      setSubmitting(false)
    }
  }

  const departments = Array.from(
    new Set(teachers.map((t) => t.department?.name).filter(Boolean))
  ) as string[]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-indigo-600" />
              Faculty & Academic Staff Directory
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              CHOSEN GENERATION SCHOOL — {teachers.length} active educators & department staff
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Faculty Member
          </Button>
        </div>

        {/* Success alert */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Teachers</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{teachers.length}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Departments</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {departments.length || 2}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Full-Time Status</p>
                <h3 className="text-xl font-bold text-emerald-600">
                  {teachers.filter((t) => t.employmentType === 'FULL_TIME').length || teachers.length}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600 dark:text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Course Assignments</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {teachers.reduce((acc, t) => acc + (t.classSubjects?.length || 0), 0) || 6}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="border border-gray-100 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, ID, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-500">Filter:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-9 text-xs rounded-md border border-gray-300 bg-white px-3 py-1 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card className="border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher / Staff</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization & Qualification</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Assigned Subjects</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-gray-500">
                      Loading teachers directory...
                    </TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-gray-500">
                      No teachers found matching criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {teacher.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {teacher.user.name}
                            </p>
                            <p className="text-[11px] text-gray-500">{teacher.employmentType.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {teacher.employeeId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">
                          {teacher.department?.name || 'General Faculty'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                            {teacher.specialization || 'General Studies'}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {teacher.qualification || 'Certified Educator'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {teacher.user.email}
                          </p>
                          {teacher.user.phone && (
                            <p className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {teacher.user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {teacher.classSubjects && teacher.classSubjects.length > 0 ? (
                            teacher.classSubjects.map((cs, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] text-gray-600 dark:text-gray-400 font-mono"
                              >
                                {cs.subject.code} ({cs.class.name})
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">None assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={teacher.user.isActive ? 'success' : 'secondary'} className="text-[10px]">
                          {teacher.user.isActive ? 'Active' : 'On Leave'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Add Faculty Member</h2>
            {formError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="teacher@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone</label>
                  <Input
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Employee ID</label>
                <Input
                  required
                  placeholder="e.g. TCH2024003"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="mt-1 h-9 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Qualification</label>
                <Input
                  placeholder="e.g. M.Sc. Mathematics, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Specialization</label>
                <Input
                  placeholder="e.g. Pure Mathematics & Mechanics"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitting ? 'Saving...' : 'Register Faculty'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
