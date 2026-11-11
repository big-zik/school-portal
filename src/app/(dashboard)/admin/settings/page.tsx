'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
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
              size="sm"
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </div>
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>School parameters updated and synced across all modules.</span>
          </div>
        )}

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
                <label className="text-xs font-semibold text-gray-600">School Legal Name</label>
                <Input defaultValue="CHOSEN GENERATION SCHOOL" className="text-xs h-9" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Official Email</label>
                  <Input defaultValue="info@chosengenerationschool.edu" className="text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Office Telephone</label>
                  <Input defaultValue="+234 1 234 5678" className="text-xs h-9" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Physical Campus Address</label>
                <Input defaultValue="42 Academic Way, Victoria Island, Lagos" className="text-xs h-9" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Timezone</label>
                  <Input defaultValue="Africa/Lagos (GMT+1)" className="text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Billing Currency</label>
                  <Input defaultValue="NGN (Nigerian Naira - ₦)" className="text-xs h-9" />
                </div>
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
                <label className="text-xs font-semibold text-gray-600">Current Academic Year</label>
                <Input defaultValue="2024/2025 Academic Session" className="text-xs h-9" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Active Term</label>
                <select className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs">
                  <option>Second Term (Spring 2025) - Active</option>
                  <option>First Term (Fall 2024) - Concluded</option>
                  <option>Third Term (Summer 2025) - Upcoming</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
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
      </div>
    </DashboardLayout>
  )
}
