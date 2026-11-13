'use client'

import React, { useState, useEffect } from 'react'
import { Building, Users, Shield, PlusCircle, CheckCircle2, Clock, Loader2, X, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

interface HostelData {
  id: string
  name: string
  warden: string
  wardenPhone?: string
  type: string
  capacity: number
  occupied: number
  availableBeds: number
  roomsCount: number
  termFee: number
  rooms?: Array<{ id: string; roomNumber: string; capacity: number; occupied: number }>
}

export default function AdminHostelPage() {
  const [hostels, setHostels] = useState<HostelData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [selectedHostelId, setSelectedHostelId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [bedNumber, setBedNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  const loadHostels = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hostel')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setHostels(json.data)
        }
      }
    } catch (err) {
      console.error('Error fetching hostels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHostels()
  }, [])

  const currentHostel = hostels.find((h) => h.id === selectedHostelId) || hostels[0]

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/hostel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'allocate',
          studentId,
          roomId: selectedRoomId || currentHostel?.rooms?.[0]?.id,
          bedNumber: bedNumber || undefined,
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setShowAllocateModal(false)
        setStudentId('')
        setBedNumber('')
        setNotification('Room and bed allocation successfully registered')
        setTimeout(() => setNotification(null), 4000)
        loadHostels()
      } else {
        setError(json.error || 'Failed to allocate room')
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Building className="w-6 h-6 text-purple-600" />
              Boarding House & Hostel Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Hostel dormitories, room allocations, boarding fees, warden assignments, and curfew attendance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (hostels.length > 0 && !selectedHostelId) {
                  setSelectedHostelId(hostels[0].id)
                  if (hostels[0].rooms && hostels[0].rooms.length > 0) {
                    setSelectedRoomId(hostels[0].rooms[0].id)
                  }
                }
                setShowAllocateModal(true)
              }}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Allocate Room
            </Button>
          </div>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading hostel facilities...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hostels.map((h) => (
              <Card key={h.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Badge variant={h.type === 'MALE' ? 'default' : 'secondary'} className="text-[10px]">
                      {h.type} HOSTEL
                    </Badge>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(h.termFee)} / term</span>
                  </div>
                  <CardTitle className="text-base font-bold mt-1">{h.name}</CardTitle>
                  <p className="text-xs text-gray-500">Warden: {h.warden}</p>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 text-[10px]">Occupancy</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">
                        {h.occupied} / {h.capacity}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-400 text-[10px]">Available Beds</p>
                      <p className="font-bold text-sm text-emerald-600 mt-0.5">
                        {h.availableBeds} Available
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Room Configuration</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {h.roomsCount} rooms with standard bunk facilities & study stations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Allocate Room */}
        {showAllocateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" /> Allocate Student Hostel Room
                </h3>
                <button onClick={() => setShowAllocateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleAllocate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Hostel *</label>
                  <select
                    value={selectedHostelId}
                    onChange={(e) => {
                      setSelectedHostelId(e.target.value)
                      const found = hostels.find((h) => h.id === e.target.value)
                      if (found?.rooms && found.rooms.length > 0) {
                        setSelectedRoomId(found.rooms[0].id)
                      }
                    }}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.availableBeds} beds free)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room *</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {(currentHostel?.rooms || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.occupied}/{r.capacity} allocated)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Student Admission No. or ID *</label>
                  <Input
                    required
                    placeholder="e.g. STU2024001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bed Designation</label>
                  <Input
                    placeholder="e.g. Bed A (Lower Bunk)"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllocateModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Confirm Allocation
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
