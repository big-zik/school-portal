'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, PlusCircle, AlertCircle, Loader2, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface MeetingItem {
  id: string
  title: string
  teacherName: string
  childName: string
  date: string
  time: string
  mode: 'IN_PERSON' | 'VIRTUAL'
  locationOrLink: string
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED'
}

export default function ParentMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newTeacher, setNewTeacher] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('02:00 PM - 02:45 PM')
  const [newMode, setNewMode] = useState<'VIRTUAL' | 'IN_PERSON'>('VIRTUAL')

  const loadMeetings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/meetings')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setMeetings(json.data)
        }
      }
    } catch (err) {
      console.error('Failed to load meetings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeetings()
  }, [])

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle || 'Academic Performance Inquiry',
          teacherName: newTeacher || 'Class Homeroom Teacher',
          childName: 'Daniel Johnson',
          date: newDate || undefined,
          time: newTime,
          mode: newMode,
          locationOrLink: newMode === 'VIRTUAL' ? 'https://meet.google.com/cgs-academic-progress' : 'Admin Block Conference Rm 2',
        }),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setShowModal(false)
        setNewTitle('')
        setNewTeacher('')
        setRequestSubmitted(true)
        setTimeout(() => setRequestSubmitted(false), 5000)
        loadMeetings()
      } else {
        setError(json.error || 'Failed to book meeting')
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Teacher Consultations & PTA Conferences
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              CHOSEN GENERATION SCHOOL — Direct 1-on-1 educator check-ins and academic consultation bookings
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Request Teacher Meeting
          </Button>
        </div>

        {requestSubmitted && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Meeting consultation request submitted and saved to calendar! The faculty will confirm your slot within 24 hours.
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading meeting schedule...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <Card key={m.id} className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{m.title}</h3>
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">{m.teacherName}</p>
                    </div>
                    <Badge variant={m.status === 'CONFIRMED' ? 'default' : 'secondary'} className="text-[10px]">
                      {m.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{m.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{m.time}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      {m.mode === 'VIRTUAL' ? (
                        <Video className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="font-medium text-[11px] truncate max-w-[200px]">{m.locationOrLink}</span>
                    </div>

                    {m.mode === 'VIRTUAL' && m.locationOrLink.startsWith('http') && (
                      <a href={m.locationOrLink} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="text-[11px] h-7 text-indigo-600">
                          Join Meeting
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Book Meeting */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" /> Request Teacher Consultation
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleBookMeeting} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subject / Discussion Topic *</label>
                  <Input
                    required
                    placeholder="e.g. Mathematics Mid-Term Progress Discussion"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Teacher / Faculty Member *</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Robert Smith (Mathematics)"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Preferred Date</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Consultation Mode</label>
                    <select
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value as any)}
                      className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="VIRTUAL">Virtual (Google Meet)</option>
                      <option value="IN_PERSON">In-Person (Campus Office)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Preferred Time Slot</label>
                  <Input
                    placeholder="e.g. 02:00 PM - 02:45 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
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
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Submit Request
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
