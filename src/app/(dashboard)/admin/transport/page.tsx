'use client'

import React, { useState, useEffect } from 'react'
import { Bus, MapPin, Phone, Users, PlusCircle, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

interface RouteData {
  id: string
  name: string
  vehicle: string
  driver: string
  phone: string
  capacity: string
  assignedCount: number
  maxCapacity: number
  termFee: number
  stops: string[]
}

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // Form states
  const [routeName, setRouteName] = useState('')
  const [vehicleModel, setVehicleModel] = useState('Toyota Coaster')
  const [numberPlate, setNumberPlate] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [seatCapacity, setSeatCapacity] = useState('32')
  const [termFee, setTermFee] = useState('65000')
  const [stopsString, setStopsString] = useState('')

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/transport')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setRoutes(json.data)
        }
      }
    } catch (err) {
      console.error('Error fetching transport routes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const stops = stopsString
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const res = await fetch('/api/transport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: routeName,
          vehicleModel,
          numberPlate,
          driverName,
          driverPhone,
          capacity: parseInt(seatCapacity, 10) || 30,
          fare: parseFloat(termFee) || 50000,
          stops,
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setShowAddModal(false)
        setRouteName('')
        setNumberPlate('')
        setDriverName('')
        setDriverPhone('')
        setStopsString('')
        setNotification('Transport bus route created successfully')
        setTimeout(() => setNotification(null), 4000)
        loadRoutes()
      } else {
        setError(json.error || 'Failed to create route')
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
              <Bus className="w-6 h-6 text-amber-600" />
              School Transport & Fleet Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Bus routes, pick-up/drop-off schedules, driver contacts, and student route allocation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Add Bus Route
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
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
            Loading transport routes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routes.map((rt) => (
              <Card key={rt.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {rt.id.slice(0, 8)}
                    </Badge>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(rt.termFee)} / term</span>
                  </div>
                  <CardTitle className="text-base font-bold mt-1">{rt.name}</CardTitle>
                  <p className="text-xs text-gray-500">{rt.vehicle}</p>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Driver & Contact</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{rt.driver}</p>
                    <p className="text-gray-500 flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-gray-400" /> {rt.phone}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Capacity</p>
                    <div className="flex items-center justify-between font-semibold">
                      <span>Assigned Students:</span>
                      <span className="text-blue-600">{rt.capacity}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Stops Route</p>
                    <div className="flex flex-wrap gap-1">
                      {rt.stops.map((stop, i) => (
                        <span key={i} className="inline-block rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                          {stop}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Add Bus Route */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-amber-600" /> Add School Bus Route
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateRoute} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Route Name *</label>
                  <Input
                    required
                    placeholder="e.g. Lekki - Ajah Express Route"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vehicle Model</label>
                    <Input
                      placeholder="e.g. Toyota Coaster"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Plate Number *</label>
                    <Input
                      required
                      placeholder="e.g. LND-482-XA"
                      value={numberPlate}
                      onChange={(e) => setNumberPlate(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Driver Name *</label>
                    <Input
                      required
                      placeholder="e.g. Mr. Paul Babatunde"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Driver Phone *</label>
                    <Input
                      required
                      placeholder="e.g. +234 802 333 4441"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Seat Capacity</label>
                    <Input
                      type="number"
                      min="1"
                      value={seatCapacity}
                      onChange={(e) => setSeatCapacity(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Term Fare (₦) *</label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={termFee}
                      onChange={(e) => setTermFee(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Stops (comma separated)</label>
                  <Input
                    placeholder="e.g. VGC, Chevron Gate, Jakande, Admiralty, Campus"
                    value={stopsString}
                    onChange={(e) => setStopsString(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Save Route
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
