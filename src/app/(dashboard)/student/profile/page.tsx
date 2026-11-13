'use client'

import React, { useState } from 'react'
import {
  User,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Heart,
  Save,
  Lock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function StudentProfilePage() {
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const student = {
    fullName: 'Daniel Johnson',
    studentId: 'STU2024001',
    email: 'student.daniel@school.com',
    phone: '+234 803 333 0001',
    dateOfBirth: 'April 14, 2009',
    gender: 'Male',
    bloodGroup: 'O+',
    nationality: 'Nigerian',
    address: '15 Admiralty Way, Lekki Phase 1, Lagos State',
    class: 'Grade 10 (Senior Secondary 1) - Alpha',
    admissionDate: 'September 01, 2024',
    guardian: {
      name: 'Chief Michael Johnson',
      relationship: 'Father',
      phone: '+234 803 222 0001',
      email: 'parent.johnson@school.com',
      occupation: 'Senior Geologist, Shell Nigeria',
    },
    medical: {
      allergies: 'None recorded',
      chronicConditions: 'None',
      emergencyHospital: 'St. Nicholas Hospital, Lagos',
    },
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSaved(false)
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, password: newPassword, confirmPassword }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const first = json.errors ? (Object.values(json.errors).flat()[0] as string | undefined) : undefined
        setPasswordError(first || json.error || 'Could not update password')
        return
      }
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('Network error. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <User className="w-6 h-6 text-blue-600" />
            Student Profile & Personal File
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Official academic biodata, guardian emergency contacts, medical records, and account security
          </p>
        </div>

        {/* Profile Card Banner */}
        <Card className="overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800" />
          <CardContent className="relative px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 gap-4">
              <div className="flex items-end gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-900 text-xl font-bold shadow-lg">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">DJ</AvatarFallback>
                </Avatar>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                      {student.fullName}
                    </h2>
                    <Badge variant="success" className="text-[10px]">Active Enrolment</Badge>
                  </div>
                  <p className="text-xs text-gray-500">{student.class} • ID: {student.studentId}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Biodata & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Biodata & Guardian Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold">Personal Biodata</CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Date of Birth</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Gender & Blood Group</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.gender} • {student.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Nationality</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.nationality}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Enrolment Date</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.admissionDate}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Residential Address</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {student.address}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold">Primary Guardian & Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Guardian Name</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    {student.guardian.name} ({student.guardian.relationship})
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Occupation</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                    {student.guardian.occupation}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Emergency Phone</p>
                  <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {student.guardian.phone}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Guardian Email</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {student.guardian.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Medical & Clinic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Known Allergies</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.medical.allergies}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Designated Hospital</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{student.medical.emergencyHospital}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Security (Change Password) */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {passwordSaved && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Password updated successfully.</span>
                  </div>
                )}

                {passwordError && (
                  <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Current Password</label>
                    <Input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">New Password</label>
                    <Input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Confirm New Password</label>
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="text-xs h-9"
                    />
                  </div>

                  <Button type="submit" size="sm" disabled={passwordLoading} className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 mt-2">
                    {passwordLoading ? 'Updating…' : 'Update Security Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Assignment Alerts</p>
                    <p className="text-[11px] text-gray-400">Notified 24h before deadline</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Grade Releases</p>
                    <p className="text-[11px] text-gray-400">Alerts when marks are posted</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
