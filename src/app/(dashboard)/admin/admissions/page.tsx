'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Eye,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  Loader2,
  Phone,
  Mail,
  Filter,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatDate } from '@/lib/utils'

export default function AdminAdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Selected application for review modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionSuccess, setConversionSuccess] = useState<any | null>(null)
  const [actionMessage, setActionMessage] = useState('')

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admissions?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setApplications(json.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch admissions', e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications()
    }, 200)
    return () => clearTimeout(timer)
  }, [fetchApplications])

  const handleStatusUpdate = async (status: string) => {
    if (!selectedApp) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admissions/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNote }),
      })
      const json = await res.json()
      if (json.success) {
        setActionMessage(`Application status changed to ${status}`)
        setSelectedApp(json.data)
        fetchApplications()
      } else {
        alert(json.error || 'Failed to update status')
      }
    } catch (e: any) {
      alert(e.message || 'Error updating status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleConvertToStudent = async () => {
    if (!selectedApp) return
    setIsConverting(true)
    setConversionSuccess(null)
    try {
      const res = await fetch(`/api/admissions/${selectedApp.id}`, {
        method: 'POST',
      })
      const json = await res.json()
      if (json.success) {
        setConversionSuccess(json.data)
        fetchApplications()
      } else {
        alert(json.error || 'Failed to enroll applicant')
      }
    } catch (e: any) {
      alert(e.message || 'Error enrolling applicant')
    } finally {
      setIsConverting(false)
    }
  }

  const totalApps = applications.length
  const pendingApps = applications.filter((a) => a.status === 'PENDING').length
  const acceptedApps = applications.filter((a) => a.status === 'ACCEPTED').length
  const otherApps = totalApps - pendingApps - acceptedApps

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              Admissions Applications & Registry
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review prospective student files, inspect credentials, and convert accepted candidates to active student records
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/admissions/apply" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold">
                <ExternalLink className="w-3.5 h-3.5" /> View Public Application Form
              </Button>
            </a>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActionMessage('')} className="text-xs h-7">Dismiss</Button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Total Applications</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalApps}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Logged in candidate registry</p>
            </CardContent>
          </Card>

          <Card className={pendingApps > 0 ? "border-amber-300 dark:border-amber-800" : ""}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Pending Review</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingApps}</h3>
              <p className="text-[11px] text-amber-600 mt-1">Awaiting registrar screening</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Accepted & Enrolled</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{acceptedApps}</h3>
              <p className="text-[11px] text-emerald-600 mt-1">Converted to active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Under Review / Waitlist</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{otherApps}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Diagnostic test & interview</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates by name, parent phone, email..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="REVIEWING">Screening in Progress</option>
                <option value="ACCEPTED">Accepted / Enrolled</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Button size="sm" variant="outline" onClick={fetchApplications} className="text-xs">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500 space-y-2">
                <Users className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="font-semibold text-gray-800 dark:text-gray-200">No applications found</p>
                <p className="text-xs text-gray-400">Applications submitted from the public portal will appear here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Candidate Name</TableHead>
                    <TableHead className="text-xs">Class Applied</TableHead>
                    <TableHead className="text-xs">Parent / Guardian</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Documents</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Applied Date</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const docCount = Array.isArray(app.documents) ? app.documents.length : 0
                    return (
                      <TableRow key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <TableCell className="font-bold text-xs text-gray-900 dark:text-gray-100">
                          {app.applicantName}
                          <div className="text-[10px] font-normal text-gray-400 uppercase">{app.gender || 'N/A'}</div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-blue-600">
                          {app.appliedClass?.name || 'Class'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 dark:text-gray-300">
                          {app.parentName || 'Parent'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          <div>{app.parentPhone}</div>
                          <span className="text-[10px] text-gray-400">{app.parentEmail}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {docCount} File{docCount !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === 'ACCEPTED'
                                ? 'success'
                                : app.status === 'PENDING'
                                ? 'warning'
                                : app.status === 'REJECTED'
                                ? 'destructive'
                                : 'default'
                            }
                            className="text-[10px]"
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(app.appliedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApp(app)
                              setReviewNote(app.reviewNote || '')
                              setConversionSuccess(null)
                            }}
                            className="text-xs h-7 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal: Full Application Review & Conversion */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between bg-blue-50/40 dark:bg-blue-950/20">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Admission Application Review
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      REF: {selectedApp.id.slice(-6).toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Applying for: <strong>{selectedApp.appliedClass?.name || 'Class'}</strong>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto space-y-5 flex-1">
                {conversionSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                    <p className="font-bold flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" /> Student Successfully Enrolled!
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div>Admission No: <strong>{conversionSuccess.studentId}</strong></div>
                      <div>Login Email: <strong>{conversionSuccess.studentUser?.email}</strong></div>
                      <div className="col-span-2">Initial Password: <strong>{conversionSuccess.temporaryPassword}</strong></div>
                    </div>
                  </div>
                )}

                {/* Candidate & Parent Biodata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-wider text-blue-600">
                      Candidate Biodata
                    </p>
                    <p><strong>Full Name:</strong> {selectedApp.applicantName}</p>
                    <p><strong>Gender:</strong> {selectedApp.gender || 'Not specified'}</p>
                    <p><strong>Date of Birth:</strong> {selectedApp.dateOfBirth ? formatDate(selectedApp.dateOfBirth) : 'N/A'}</p>
                    <p><strong>Previous School:</strong> {selectedApp.previousSchool || 'None'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-wider text-emerald-600">
                      Parent / Guardian Information
                    </p>
                    <p><strong>Name:</strong> {selectedApp.parentName}</p>
                    <p><strong>Phone:</strong> {selectedApp.parentPhone}</p>
                    <p><strong>Email:</strong> {selectedApp.parentEmail}</p>
                    <p><strong>Address:</strong> {selectedApp.address}</p>
                  </div>
                </div>

                {/* Documents Attached */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Attached Supporting Documents ({Array.isArray(selectedApp.documents) ? selectedApp.documents.length : 0})
                  </p>
                  {Array.isArray(selectedApp.documents) && selectedApp.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedApp.documents.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs">
                          <div className="truncate mr-2">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.name || 'Document'}</p>
                            <span className="text-[10px] text-gray-400">{doc.type || 'Attachment'}</span>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px] shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No files attached with this application.</p>
                  )}
                </div>

                {/* Registrar Review Notes */}
                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Registrar Evaluation Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter interview notes, entrance exam score, or reason for status..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 text-xs"
                  />
                </div>

                {/* Status Switcher & Convert Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Update Status:</span>
                    <select
                      value={selectedApp.status}
                      disabled={isUpdatingStatus || selectedApp.status === 'ACCEPTED'}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="h-8 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 text-xs font-medium"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWING">REVIEWING</option>
                      <option value="WAITLISTED">WAITLISTED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {selectedApp.status !== 'ACCEPTED' ? (
                    <Button
                      onClick={handleConvertToStudent}
                      disabled={isConverting}
                      size="sm"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold text-white gap-1.5"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enrolling Student...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Accept & Convert to Enrolled Student
                        </>
                      )}
                    </Button>
                  ) : (
                    <Badge variant="success" className="text-xs py-1 px-3">
                      Enrolled in Active Student Directory
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
