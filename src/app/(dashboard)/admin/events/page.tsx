'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  FileCheck,
  Search,
  Filter,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface SchoolEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  type: string
  targetRoles?: string[]
  isPublished: boolean
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    type: 'ACADEMIC',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    requiresSlip: false,
  })

  const sampleEvents: SchoolEvent[] = [
    {
      id: 'ev-1',
      title: 'Inter-House Sports Athletics & Track Championship',
      description: 'Annual inter-house athletics competition featuring 100m, relay, high jump, and tug of war.',
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 5 + 3600000 * 6).toISOString(),
      location: 'Main Sports Complex & Athletics Field',
      type: 'SPORTS',
      targetRoles: ['PARENT', 'STUDENT', 'TEACHER'],
      isPublished: true,
    },
    {
      id: 'ev-2',
      title: 'Term 2 PTA General Assembly & Academic Review',
      description: 'Consultative meeting between school administration and parents regarding curriculum developments.',
      startDate: new Date(Date.now() + 86400000 * 12).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 12 + 3600000 * 3).toISOString(),
      location: 'School Multipurpose Auditorium',
      type: 'MEETING',
      targetRoles: ['PARENT', 'TEACHER'],
      isPublished: true,
    },
    {
      id: 'ev-3',
      title: 'Senior Secondary STEM Robotics & Space Excursion',
      description: 'Educational field trip to the National Space Research & Development Agency. Parental permission slip mandatory.',
      startDate: new Date(Date.now() + 86400000 * 18).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 18 + 3600000 * 8).toISOString(),
      location: 'NASRDA Center, Abuja',
      type: 'ACADEMIC',
      targetRoles: ['PARENT', 'STUDENT'],
      isPublished: true,
    },
  ]

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/events')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setEvents(json.data)
      } else {
        setEvents(sampleEvents)
      }
    } catch (err) {
      console.error(err)
      setEvents(sampleEvents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          location: formData.location,
          description: formData.description,
          isPublished: true,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          title: '',
          type: 'ACADEMIC',
          startDate: '',
          endDate: '',
          location: '',
          description: '',
          requiresSlip: false,
        })
        fetchEvents()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create event')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating event')
    } finally {
      setCreating(false)
    }
  }

  const filteredEvents = events.filter((e) => (filterType === 'ALL' ? true : e.type === filterType))

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SPORTS':
        return <Badge className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">Sports & Athletics</Badge>
      case 'MEETING':
        return <Badge className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">PTA / Assembly</Badge>
      case 'ACADEMIC':
        return <Badge className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Academic & Field Trip</Badge>
      case 'HOLIDAY':
        return <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Public Holiday</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>
    }
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-600" />
              School Calendar, Events & Permission Slips
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Institutional academic milestones, excursions, sports galas, and parent consent management
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Schedule New Event
          </Button>
        </div>

        {/* Filter Strip */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          {['ALL', 'ACADEMIC', 'SPORTS', 'MEETING', 'HOLIDAY'].map((t) => (
            <Button
              key={t}
              variant={filterType === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(t)}
              className={`text-xs ${filterType === t ? 'bg-indigo-600 text-white' : ''}`}
            >
              {t === 'ALL' ? 'All Events' : t}
            </Button>
          ))}
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 p-12 text-center text-sm text-gray-500">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
            No events found in this category. Click "Schedule New Event" to add one.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((ev) => (
              <Card
                key={ev.id}
                className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {getTypeBadge(ev.type)}
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(ev.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-2 line-clamp-2">
                    {ev.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 pb-4">
                  {ev.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                      {ev.description}
                    </p>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Target: {Array.isArray(ev.targetRoles) ? ev.targetRoles.join(', ') : 'All School'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Schedule Event Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Schedule School Event
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleCreate}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Event Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Inter-House Sports Gala 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Event Category *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACADEMIC">Academic / Excursion</option>
                        <option value="SPORTS">Sports & Athletics</option>
                        <option value="MEETING">PTA / Assembly</option>
                        <option value="HOLIDAY">Holiday / Break</option>
                        <option value="CULTURAL">Cultural Day</option>
                        <option value="OTHER">Other Institutional</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Campus Location
                      </label>
                      <Input
                        placeholder="e.g. Main Auditorium or External"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Start Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        End Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Event Summary & Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Outline schedule, dress code, parental requirements, or bus departure times..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      disabled={creating}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Publish to Calendar
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
