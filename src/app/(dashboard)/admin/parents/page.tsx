'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Mail,
  Phone,
  Briefcase,
  UserCheck,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface GuardianItem {
  id: string
  relationship: string
  occupation: string | null
  officeAddress: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
  }
  studentGuardians: Array<{
    isPrimary: boolean
    student: {
      id: string
      user: { name: string }
      currentClass: { name: string } | null
    }
  }>
}

interface StudentOption {
  id: string
  studentId: string
  user: {
    name: string
  }
  currentClass: {
    name: string
  } | null
}

const RELATIONSHIPS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Legal Guardian' },
  { value: 'UNCLE', label: 'Uncle' },
  { value: 'AUNT', label: 'Aunt' },
  { value: 'SIBLING', label: 'Sibling' },
  { value: 'OTHER', label: 'Other' },
]

export default function AdminParentsPage() {
  const [guardians, setGuardians] = useState<GuardianItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('FATHER')
  const [occupation, setOccupation] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')
  const [initialPassword, setInitialPassword] = useState('Parent@123')
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

  // Student search for linking
  const [studentsList, setStudentsList] = useState<StudentOption[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)

  const fetchParents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/parents?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setGuardians(json.data || [])
      }
    } catch (e) {
      console.error('Failed to load parents', e)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParents()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchParents])

  // Fetch available students when modal opens
  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await fetch('/api/students?limit=100')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setStudentsList(json.data)
      }
    } catch (e) {
      console.error('Failed to fetch students', e)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleOpenModal = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setRelationship('FATHER')
    setOccupation('')
    setOfficeAddress('')
    setInitialPassword('Parent@123')
    setSelectedStudentIds([])
    setStudentSearch('')
    setIsAddModalOpen(true)
    fetchStudents()
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full name and email address are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/parents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          relationship,
          occupation: occupation.trim() || undefined,
          officeAddress: officeAddress.trim() || undefined,
          password: initialPassword.trim() || undefined,
          studentIds: selectedStudentIds,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create parent account.')
      }

      setSuccessMsg('Parent account registered successfully!')
      fetchParents()
      setTimeout(() => {
        setIsAddModalOpen(false)
        setSuccessMsg(null)
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating parent.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredStudents = studentsList.filter((s) => {
    if (!studentSearch.trim()) return true
    const term = studentSearch.toLowerCase()
    return (
      s.user.name.toLowerCase().includes(term) ||
      (s.currentClass?.name && s.currentClass.name.toLowerCase().includes(term)) ||
      s.studentId.toLowerCase().includes(term)
    )
  })

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[var(--cgs-primary)]" />
              Parents & Guardians Directory
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              CHOSEN GENERATION SCHOOL — {guardians.length} registered guardians connected to students
            </p>
          </div>

          <Button
            onClick={handleOpenModal}
            className="flex items-center gap-2 w-fit bg-[var(--cgs-primary)] text-white hover:bg-[var(--cgs-primary-hover)] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Parent
          </Button>
        </div>

        <Card className="border border-gray-100 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guardian name, email, or job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent / Guardian</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Associated Student(s)</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      Loading parents directory...
                    </TableCell>
                  </TableRow>
                ) : guardians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      No guardians found
                    </TableCell>
                  </TableRow>
                ) : (
                  guardians.map((g) => (
                    <TableRow key={g.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--cgs-tint)] text-[var(--cgs-primary)] font-bold flex items-center justify-center text-xs">
                            {g.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {g.user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {g.relationship.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {g.studentGuardians.length === 0 ? (
                            <span className="text-xs text-gray-400 italic">No linked students</span>
                          ) : (
                            g.studentGuardians.map((sg, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs">
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {sg.student.user.name}
                                </span>
                                {sg.student.currentClass && (
                                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                                    {sg.student.currentClass.name}
                                  </span>
                                )}
                                {sg.isPrimary && (
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0">Primary</Badge>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                        {g.occupation || 'Self-Employed'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {g.user.email}
                          </p>
                          {g.user.phone && (
                            <p className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {g.user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px]">
                          Verified Guardian
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Add Parent Dialog Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--cgs-primary)]" />
                Register New Parent / Guardian
              </DialogTitle>
              <DialogDescription>
                Create a parent user account and link them to their children in the school.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateParent} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Chief Michael Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. parent.johnson@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <Input
                    placeholder="e.g. +234 803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full h-9 rounded-lg border border-[var(--cgs-control)] bg-[var(--cgs-surface)] px-3 text-xs text-[var(--cgs-text)] focus:outline-none focus:ring-2 focus:ring-[var(--cgs-primary)]"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Occupation
                  </label>
                  <Input
                    placeholder="e.g. Civil Engineer / Entrepreneur"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Default Initial Password
                  </label>
                  <Input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Parent@123"
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Residential / Office Address
                </label>
                <Input
                  placeholder="e.g. 14 Victoria Island Boulevard, Lagos"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Student Linking Section */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[var(--cgs-primary)]" />
                    Link Enrolled Student(s) ({selectedStudentIds.length} selected)
                  </label>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search student by name, ID or class..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <div className="border border-gray-200 dark:border-gray-800 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-1">
                  {loadingStudents ? (
                    <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading student roster...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No matching students found
                    </div>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id)
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleStudentSelection(s.id)}
                          className={`p-2 rounded flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--cgs-tint)] font-semibold text-[var(--cgs-primary)]'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent onClick
                              className="rounded border-gray-300 text-[var(--cgs-primary)] focus:ring-[var(--cgs-primary)]"
                            />
                            <span>{s.user.name}</span>
                            <span className="text-[10px] text-gray-400">({s.studentId})</span>
                          </div>
                          {s.currentClass && (
                            <Badge variant="outline" className="text-[10px]">
                              {s.currentClass.name}
                            </Badge>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="text-xs bg-[var(--cgs-primary)] text-white hover:bg-[var(--cgs-primary-hover)] flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register Parent
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
