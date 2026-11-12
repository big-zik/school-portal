'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Users,
  Calendar,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Loader2,
  Clock,
  Printer,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PublicAdmissionApplyPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  // Form State
  const [applicantName, setApplicantName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE')
  const [appliedClassId, setAppliedClassId] = useState('')

  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [address, setAddress] = useState('')
  const [previousSchool, setPreviousSchool] = useState('')

  // Documents
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; type: string }>>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docType, setDocType] = useState('Birth Certificate')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedData, setSubmittedData] = useState<any | null>(null)

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch('/api/classes')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setClasses(json.data)
            setAppliedClassId(json.data[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load classes', err)
      } finally {
        setLoadingClasses(false)
      }
    }
    loadClasses()
  }, [])

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingDoc(true)
    setErrorMsg('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'admissions-documents')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success && json.data?.url) {
        setDocuments((prev) => [
          ...prev,
          { name: file.name, url: json.data.url, type: docType },
        ])
      } else {
        setErrorMsg(json.error || 'Failed to upload document')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading file')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appliedClassId && classes.length > 0) {
      setErrorMsg('Please select the grade level or class applied for')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const payload = {
        applicantName,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        appliedClassId: appliedClassId || (classes[0]?.id ?? 'cls-default'),
        parentName,
        parentEmail,
        parentPhone,
        address,
        previousSchool: previousSchool || undefined,
        documents,
      }

      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (json.success) {
        setSubmittedData(json.data)
      } else {
        setErrorMsg(json.error || 'Failed to submit application. Please check all fields.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error contacting admissions server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/80 dark:border-gray-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-blue-950 dark:text-blue-100">
                CHOSEN GENERATION
              </span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                Online Admissions Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-semibold flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Portal Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {submittedData ? (
          /* SUCCESS SCREEN */
          <Card className="border-emerald-200 dark:border-emerald-900 shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-8 text-center text-white space-y-2">
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-100 animate-bounce" />
              <h2 className="text-2xl font-extrabold tracking-tight">Application Successfully Received!</h2>
              <p className="text-xs text-emerald-100 max-w-lg mx-auto">
                Thank you for applying to CHOSEN GENERATION SCHOOL. Your admission file has been logged in our registry.
              </p>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Application Reference Number</span>
                  <h3 className="text-2xl font-black font-mono text-blue-600">{submittedData.applicationNumber}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Applicant: <strong>{submittedData.applicantName}</strong></p>
                </div>
                <div className="text-right">
                  <Badge className="bg-amber-500 text-white text-xs">Under Review</Badge>
                  <p className="text-[11px] text-gray-400 mt-1">Submitted on {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  Next Steps in Your Admission Process
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">1</span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Document Verification</p>
                    <p className="text-[11px] text-gray-500">Our academic registrar reviews academic transcripts and birth certificate.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">2</span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Entrance Assessment</p>
                    <p className="text-[11px] text-gray-500">You will receive an email invite for the entrance interview and diagnostic test.</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">3</span>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Admission Letter</p>
                    <p className="text-[11px] text-gray-500">Upon acceptance, official student credentials and fee invoices are released.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
                  <Printer className="w-3.5 h-3.5" /> Print Application Slip
                </Button>
                <Link href="/">
                  <Button size="sm" className="text-xs bg-blue-900 hover:bg-blue-800 font-semibold gap-1.5">
                    Return to Homepage <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* APPLICATION FORM */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <Badge className="bg-blue-600 text-white text-[10px]">2025/2026 Academic Session</Badge>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-950 dark:text-blue-100">
                Student Admission Application
              </h1>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Complete all required biodata and attach supporting academic credentials for your child.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Candidate Biodata */}
              <Card>
                <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    1. Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Applicant Full Name (First Name, Middle Name, Surname) *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Chukwuemeka David Adeleke"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="text-xs h-9.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Date of Birth *
                      </label>
                      <Input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="text-xs h-9.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="h-9.5 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Class Applied For *
                      </label>
                      <select
                        value={appliedClassId}
                        onChange={(e) => setAppliedClassId(e.target.value)}
                        className="h-9.5 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs font-medium"
                      >
                        {classes.length > 0 ? (
                          classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} ({cls.level})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="cls-p1">Primary 1 (Lower Primary)</option>
                            <option value="cls-p4">Primary 4 (Upper Primary)</option>
                            <option value="cls-j1">JSS 1 (Junior Secondary)</option>
                            <option value="cls-10">Grade 10 / SS 1 (Senior Secondary)</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Parent / Guardian Biodata */}
              <Card>
                <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    2. Parent / Guardian Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Parent / Primary Guardian Full Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Engr. Babatunde Adeleke"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="text-xs h-9.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Email Address (Admission status updates will be sent here) *
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="parent@example.com"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        className="text-xs h-9.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Phone Number (SMS alerts) *
                      </label>
                      <Input
                        type="tel"
                        required
                        placeholder="+234 802 345 6789"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="text-xs h-9.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Residential Home Address *
                    </label>
                    <Input
                      required
                      placeholder="House number, Street name, Estate, City, State"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-xs h-9.5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Academic Background */}
              <Card>
                <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    3. Academic Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Previous School Attended (if applicable)
                    </label>
                    <Input
                      placeholder="e.g. Corona Primary School, Victoria Island"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      className="text-xs h-9.5"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Section 4: Document Attachments */}
              <Card>
                <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    4. Supporting Document Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-gray-500">
                    Upload birth certificates, passport photographs, and previous term report cards (PDF, JPG, PNG).
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                    >
                      <option>Birth Certificate</option>
                      <option>Previous Term Report Sheet</option>
                      <option>Passport Photograph</option>
                      <option>Immunization / Medical Record</option>
                    </select>

                    <div className="relative flex-1 w-full">
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={uploadingDoc}
                        onChange={handleDocumentUpload}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {uploadingDoc && (
                    <p className="text-xs text-blue-600 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading document to secure vault...
                    </p>
                  )}

                  {documents.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attached Documents ({documents.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <div className="truncate">
                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.name}</p>
                                <span className="text-[10px] text-gray-400">{doc.type}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400 shrink-0">Attached</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full sm:w-auto px-8 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
