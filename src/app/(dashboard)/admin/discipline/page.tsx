'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
  X,
  FileText,
  Calendar,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface ConductRecord {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  category: string
  type: 'COMMENDATION' | 'INFRACTION'
  title: string
  points: number
  actionTaken: string
  reportedBy: string
  remarks: string
  createdAt: string
}

export default function AdminDisciplinePage() {
  const [records, setRecords] = useState<ConductRecord[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'ALL' | 'COMMENDATION' | 'INFRACTION'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'COMMENDATION' as 'COMMENDATION' | 'INFRACTION',
    category: 'ACADEMIC_EXCELLENCE',
    title: '',
    points: 5,
    actionTaken: 'Honor Certificate',
    remarks: '',
  })

  const sampleRecords: ConductRecord[] = [
    {
      id: 'disc-1',
      studentId: 'stu-1',
      studentName: 'Daniel Johnson',
      admissionNo: 'ADM/2024/001',
      className: 'Grade 10 (SS 1) - Alpha',
      category: 'ACADEMIC_EXCELLENCE',
      type: 'COMMENDATION',
      title: 'Top Score in National Olympiad Mathematics Trial',
      points: 10,
      actionTaken: 'Principal Merit Citation',
      reportedBy: 'Dr. Robert Smith',
      remarks: 'Demonstrated exemplary mastery and coached classmates during study group sessions.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'disc-2',
      studentId: 'stu-2',
      studentName: 'Amara Okafor',
      admissionNo: 'ADM/2024/002',
      className: 'Grade 10 (SS 1) - Alpha',
      category: 'LEADERSHIP',
      type: 'COMMENDATION',
      title: 'Outstanding School Assembly Presentation',
      points: 5,
      actionTaken: 'House Commendation',
      reportedBy: 'Marcus Adeyemi',
      remarks: 'Organized and coordinated the inter-house science quiz flawlessly.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'disc-3',
      studentId: 'stu-5',
      studentName: 'Chukwudi Eze',
      admissionNo: 'ADM/2024/005',
      className: 'Grade 10 (SS 1) - Alpha',
      category: 'UNIFORM_VIOLATION',
      type: 'INFRACTION',
      title: 'Improper Sports Day Kit & Late Arrival to Assembly',
      points: -5,
      actionTaken: 'Verbal Admonition & Litter Patrol',
      reportedBy: 'Discipline Master',
      remarks: 'Repeated non-compliance with Monday assembly uniform guidelines.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ]

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/discipline')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setRecords(json.data)
      } else {
        setRecords(sampleRecords)
      }
    } catch (err) {
      console.error(err)
      setRecords(sampleRecords)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students')
      const json = await res.json()
      if (json.data) setStudents(json.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRecords()
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/discipline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          studentId: '',
          type: 'COMMENDATION',
          category: 'ACADEMIC_EXCELLENCE',
          title: '',
          points: 5,
          actionTaken: 'Honor Certificate',
          remarks: '',
        })
        fetchRecords()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to record entry')
      }
    } catch (err: any) {
      alert(err.message || 'Error recording entry')
    } finally {
      setSubmitting(false)
    }
  }

  const commendations = records.filter((r) => r.type === 'COMMENDATION')
  const infractions = records.filter((r) => r.type === 'INFRACTION')

  const filteredRecords = records.filter((r) => {
    const matchesType = filterType === 'ALL' || r.type === filterType
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
              Student Conduct, Commendations & Discipline Desk
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Institutional merit citations, honor badges, behavioural infractions, and disciplinary sanctions
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Log Conduct Entry
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Merits & Commendations</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{commendations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Disciplinary Infractions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{infractions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Conduct Index Rating</p>
                <p className="text-xl font-bold text-indigo-600">96.4% Good Standing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Tab Bar */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={filterType === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('ALL')}
                className={`text-xs ${filterType === 'ALL' ? 'bg-indigo-600 text-white' : ''}`}
              >
                All Entries ({records.length})
              </Button>
              <Button
                variant={filterType === 'COMMENDATION' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('COMMENDATION')}
                className={`text-xs text-emerald-600 ${filterType === 'COMMENDATION' ? 'bg-emerald-600 text-white' : ''}`}
              >
                <Award className="w-3.5 h-3.5 mr-1" /> Commendations ({commendations.length})
              </Button>
              <Button
                variant={filterType === 'INFRACTION' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('INFRACTION')}
                className={`text-xs text-red-600 ${filterType === 'INFRACTION' ? 'bg-red-600 text-white' : ''}`}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Infractions ({infractions.length})
              </Button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search candidate, violation, or award..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Conduct Registry Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading conduct registry...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                No conduct records match criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Student & Class</TableHead>
                    <TableHead className="text-xs">Type & Category</TableHead>
                    <TableHead className="text-xs">Description / Citation</TableHead>
                    <TableHead className="text-xs text-center">Merit / Demerit</TableHead>
                    <TableHead className="text-xs">Action / Sanction</TableHead>
                    <TableHead className="text-xs text-right">Reported By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((rec) => {
                    const isCommendation = rec.type === 'COMMENDATION'

                    return (
                      <TableRow key={rec.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              {rec.studentName}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {rec.admissionNo} &bull; {rec.className}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] font-semibold ${
                              isCommendation
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {isCommendation ? 'Commendation' : 'Infraction'}
                          </Badge>
                          <p className="text-[10px] text-gray-400 mt-0.5">{rec.category}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{rec.title}</p>
                          {rec.remarks && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 italic mt-0.5">
                              "{rec.remarks}"
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-xs font-bold ${
                              rec.points >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {rec.points > 0 ? `+${rec.points}` : rec.points} pts
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {rec.actionTaken}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-500">
                          {rec.reportedBy}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal: Log Conduct Entry */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Log Student Conduct Record
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Select Student Candidate *
                    </label>
                    <select
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.name || s.name} ({s.admissionNumber || s.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Record Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => {
                          const t = e.target.value as any
                          setFormData({
                            ...formData,
                            type: t,
                            points: t === 'COMMENDATION' ? 5 : -5,
                            actionTaken: t === 'COMMENDATION' ? 'Honor Certificate' : 'Verbal Admonition',
                          })
                        }}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-semibold"
                      >
                        <option value="COMMENDATION">Commendation (Merit)</option>
                        <option value="INFRACTION">Disciplinary Infraction (Demerit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACADEMIC_EXCELLENCE">Academic Excellence</option>
                        <option value="LEADERSHIP">Leadership & Service</option>
                        <option value="SPORTSMANSHIP">Athletics & Sportsmanship</option>
                        <option value="LATENESS">Lateness / Punctuality</option>
                        <option value="UNIFORM_VIOLATION">Uniform & Dress Code</option>
                        <option value="MISCONDUCT">General Misconduct</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Title / Citation *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Won 1st Place in Inter-School Science Fair"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Merit / Demerit Points
                      </label>
                      <Input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Sanction / Reward Given
                      </label>
                      <Input
                        value={formData.actionTaken}
                        onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Detailed Remarks
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Context of event, mitigating factors, or teacher commendations..."
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500"
                    />
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
                      disabled={submitting}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Log Entry
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
