'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Building,
  Mail,
  CreditCard,
  Lock,
  Save,
  CheckCircle2,
  Globe,
  Palette,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [schoolName, setSchoolName] = useState('CHOSEN GENERATION SCHOOL')
  const [officialEmail, setOfficialEmail] = useState('info@chosengenerationschool.edu')
  const [officePhone, setOfficePhone] = useState('+234 1 234 5678')
  const [physicalAddress, setPhysicalAddress] = useState('42 Academic Way, Victoria Island, Lagos')
  const [timezone, setTimezone] = useState('Africa/Lagos')
  const [currency, setCurrency] = useState('NGN')
  const [website, setWebsite] = useState('https://chosengenerationschool.edu')

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const json = await res.json()
          if (json.success && json.data) {
            const s = json.data
            if (s.name) setSchoolName(s.name)
            if (s.email) setOfficialEmail(s.email)
            if (s.phone) setOfficePhone(s.phone)
            if (s.address) setPhysicalAddress(s.address)
            if (s.timezone) setTimezone(s.timezone)
            if (s.currency) setCurrency(s.currency)
            if (s.website) setWebsite(s.website)
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schoolName,
          email: officialEmail,
          phone: officePhone,
          address: physicalAddress,
          timezone,
          currency,
          website,
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 5000)
      } else {
        setError(json.error || 'Failed to save settings')
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-blue-600" />
              School Configuration & System Settings
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Institution branding, contact biodata, academic terms, grading scales, and API gateways
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || loading}
              size="sm"
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </div>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>School parameters updated and synced across all modules.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading institution configuration...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Identity */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  School Identity & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">School Legal Name</label>
                  <Input
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Official Email</label>
                    <Input
                      type="email"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Office Telephone</label>
                    <Input
                      value={officePhone}
                      onChange={(e) => setOfficePhone(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Physical Campus Address</label>
                  <Input
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Timezone</label>
                    <Input
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Billing Currency</label>
                    <Input
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Official Website</label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Session & Grading System */}
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                  Active Academic Session & Term
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Current Academic Year</label>
                  <Input defaultValue="2025/2026 Academic Session" className="text-xs h-9" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Active Term</label>
                  <select className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs">
                    <option>Second Term (Spring 2026) - Active</option>
                    <option>First Term (Fall 2025) - Concluded</option>
                    <option>Third Term (Summer 2026) - Upcoming</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">
                    Standard Grading Scale Boundaries
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 border">
                      <p className="font-bold text-emerald-600">A+ (90-100)</p>
                      <p className="text-[10px] text-gray-400">4.00 GP</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 border">
                      <p className="font-bold text-blue-600">A (80-89)</p>
                      <p className="text-[10px] text-gray-400">3.75 GP</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 border">
                      <p className="font-bold text-amber-600">B (70-79)</p>
                      <p className="text-[10px] text-gray-400">3.00 GP</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50 dark:bg-gray-800 border">
                      <p className="font-bold text-red-600">F (0-49)</p>
                      <p className="text-[10px] text-gray-400">0.00 GP</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
