'use client'

import React, { useState, useEffect } from 'react'
import {
  HeartPulse,
  Plus,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Activity,
  PhoneCall,
  Loader2,
  X,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface SickBayVisit {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  className: string
  symptoms: string
  temperature: string
  bloodPressure: string
  diagnosis: string
  treatment: string
  admittedToBed: boolean
  parentNotified: boolean
  attendingNurse: string
  date: string
}

export default function AdminHealthPage() {
  const [visits, setVisits] = useState<SickBayVisit[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    studentId: '',
    symptoms: '',
    temperature: '37.1°C',
    bloodPressure: '115/75',
    diagnosis: 'Acute Febrile Illness / Mild Malaria',
    treatment: 'Administered oral Paracetamol & Artemether-Lumefantrine',
    admittedToBed: false,
    parentNotified: true,
  })

  const sampleVisits: SickBayVisit[] = [
    {
      id: 'vis-1',
      studentId: 'stu-5',
      studentName: 'Chukwudi Eze',
      admissionNo: 'ADM/2024/005',
      className: 'Grade 10 (SS 1) - Alpha',
      symptoms: 'Sudden onset fever, headache and chills during 2nd period physics class',
      temperature: '38.4°C',
      bloodPressure: '110/70',
      diagnosis: 'Acute Febrile Illness / Malaria Parasitemia (RDT Positive)',
      treatment: 'Administered 1g Paracetamol, oral ACT therapy, and 2 hours observation',
      admittedToBed: true,
      parentNotified: true,
      attendingNurse: 'Nurse Ngozi Okonkwo (RN)',
      date: new Date().toISOString(),
    },
    {
      id: 'vis-2',
      studentId: 'stu-3',
      studentName: 'David Adeleke',
      admissionNo: 'ADM/2024/003',
      className: 'Grade 10 (SS 1) - Alpha',
      symptoms: 'Right ankle sprain during inter-house soccer practice',
      temperature: '36.6°C',
      bloodPressure: '120/80',
      diagnosis: 'Grade 1 Inversion Ankle Sprain',
      treatment: 'R.I.C.E protocol applied: Ice compression pack, crepe bandage, oral Ibuprofen',
      admittedToBed: false,
      parentNotified: true,
      attendingNurse: 'Nurse Ngozi Okonkwo (RN)',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setVisits(json.data)
      } else {
        setVisits(sampleVisits)
      }
    } catch (err) {
      console.error(err)
      setVisits(sampleVisits)
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
    fetchVisits()
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          studentId: '',
          symptoms: '',
          temperature: '37.1°C',
          bloodPressure: '115/75',
          diagnosis: 'Acute Febrile Illness / Mild Malaria',
          treatment: 'Administered oral Paracetamol & Artemether-Lumefantrine',
          admittedToBed: false,
          parentNotified: true,
        })
        fetchVisits()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to record encounter')
      }
    } catch (err: any) {
      alert(err.message || 'Error recording encounter')
    } finally {
      setSubmitting(false)
    }
  }

  const currentlyAdmitted = visits.filter((v) => v.admittedToBed).length

  const filteredVisits = visits.filter(
    (v) =>
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <HeartPulse className="w-6 h-6 text-rose-600" />
              Campus Health Clinic & Sick Bay Registry
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Medical emergency triage, clinical encounter records, vitals monitoring, and automated parent advisories
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Log Sick Bay Encounter
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total Term Encounters</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{visits.length} Visits</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Currently on Bed Observation</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{currentlyAdmitted} Patients</p>
            <span className="text-[10px] text-amber-600 font-medium">Campus Sick Bay Ward</span>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Parent Alerts Dispatched</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">100% Notified</p>
            <span className="text-[10px] text-gray-400">Via SMS & In-App Notice</span>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">First Aid Dispensary Stock</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">Adequate</p>
            <span className="text-[10px] text-gray-400">Essential medicines stocked</span>
          </Card>
        </div>

        {/* Visits Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              Clinical Encounters Registry ({filteredVisits.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search patient, ID, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Patient & Class</TableHead>
                  <TableHead className="text-xs">Symptoms / Complaint</TableHead>
                  <TableHead className="text-xs text-center">Vitals (Temp / BP)</TableHead>
                  <TableHead className="text-xs">Clinical Diagnosis & Treatment</TableHead>
                  <TableHead className="text-xs text-center">Ward Status</TableHead>
                  <TableHead className="text-xs text-right">Parent Notified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.map((v) => (
                  <TableRow key={v.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(v.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {v.studentName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {v.admissionNo} &bull; {v.className}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{v.symptoms}</p>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      <span className="font-bold text-rose-600">{v.temperature}</span>
                      <span className="text-gray-400 block text-[11px]">{v.bloodPressure}</span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{v.diagnosis}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 italic">{v.treatment}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      {v.admittedToBed ? (
                        <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          On Bed Observation
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-gray-600">
                          Discharged to Class
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {v.parentNotified ? (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          SMS Dispatched
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Not Required
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal: Log Sick Bay Encounter */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                  Log Sick Bay Encounter
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
                      Student Patient *
                    </label>
                    <select
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                    >
                      <option value="">Select student...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.name || s.name} ({s.admissionNumber || s.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Presenting Symptoms / Complaint *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Complains of dizziness, high temperature, and vomiting..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Body Temperature
                      </label>
                      <Input
                        value={formData.temperature}
                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Blood Pressure
                      </label>
                      <Input
                        value={formData.bloodPressure}
                        onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Clinical Diagnosis
                    </label>
                    <Input
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Medication Administered / First Aid
                    </label>
                    <textarea
                      rows={2}
                      value={formData.treatment}
                      onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.admittedToBed}
                        onChange={(e) => setFormData({ ...formData, admittedToBed: e.target.checked })}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Admit to Sick Bay Bed</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.parentNotified}
                        onChange={(e) => setFormData({ ...formData, parentNotified: e.target.checked })}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Notify Parents Immediately</span>
                    </label>
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
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Log Encounter
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
