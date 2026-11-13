'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, BookOpen, PlusCircle, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { ClassSummary } from '@/types'

interface TimetableSlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string | null
  class: { id: string; name: string }
  subject: { id: string; name: string; code: string }
  teacher: {
    id: string
    user: { name: string; email: string }
  }
}

interface SubjectItem {
  id: string
  name: string
  code: string
}

interface TeacherItem {
  id: string
  user: { name: string; email: string }
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)

  // Add slot modal state
  const [showModal, setShowModal] = useState(false)
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  const [formDay, setFormDay] = useState('MONDAY')
  const [formSubjectId, setFormSubjectId] = useState('')
  const [formTeacherId, setFormTeacherId] = useState('')
  const [formStartTime, setFormStartTime] = useState('08:00')
  const [formEndTime, setFormEndTime] = useState('08:45')
  const [formRoom, setFormRoom] = useState('Room 101')

  const loadSlots = (classId: string) => {
    if (!classId) return
    setLoading(true)
    fetch(`/api/timetable?classId=${classId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSlots(json.data || [])
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setClasses(json.data)
          setSelectedClassId(json.data[0].id)
        }
      })
      .catch((e) => console.error(e))

    // Preload subjects and teachers for the slot creator
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setSubjects(json.data)
      })
      .catch((e) => console.error(e))

    fetch('/api/teachers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setTeachers(json.data)
      })
      .catch((e) => console.error(e))
  }, [])

  useEffect(() => {
    loadSlots(selectedClassId)
  }, [selectedClassId])

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          subjectId: formSubjectId,
          teacherId: formTeacherId,
          dayOfWeek: formDay,
          startTime: formStartTime,
          endTime: formEndTime,
          room: formRoom || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setShowModal(false)
        setNotification('Timetable period scheduled successfully!')
        setTimeout(() => setNotification(null), 4000)
        loadSlots(selectedClassId)
      } else {
        setError(data.error || 'Failed to schedule timetable period')
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
              <Calendar className="w-6 h-6 text-blue-600" />
              Academic Master Timetable & Class Schedules
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              CHOSEN GENERATION SCHOOL — Real-time period breakdown by class level
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Select Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-9 text-xs font-semibold rounded-md border border-gray-300 bg-white px-3 py-1 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              onClick={() => {
                if (subjects.length > 0 && !formSubjectId) setFormSubjectId(subjects[0].id)
                if (teachers.length > 0 && !formTeacherId) setFormTeacherId(teachers[0].id)
                setShowModal(true)
              }}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Add Period Slot
            </Button>
          </div>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.map((day) => {
            const daySlots = slots.filter((s) => s.dayOfWeek === day)
            return (
              <div key={day} className="space-y-3">
                <div className="bg-gray-100 dark:bg-gray-800/80 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 text-center">
                  {day}
                </div>

                <div className="space-y-2.5">
                  {loading ? (
                    <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
                  ) : daySlots.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 border border-dashed rounded-lg">
                      No periods scheduled
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card key={slot.id} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-400 transition-colors">
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] font-mono font-bold">
                              {slot.subject.code}
                            </Badge>
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Clock className="w-3 h-3" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          <p className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">
                            {slot.subject.name}
                          </p>

                          <div className="pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
                            <span className="flex items-center gap-1 truncate max-w-[110px]">
                              <User className="w-3 h-3" />
                              {slot.teacher.user.name}
                            </span>
                            {slot.room && (
                              <span className="flex items-center gap-0.5 text-[10px]">
                                <MapPin className="w-3 h-3" />
                                {slot.room}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal: Add Period Slot */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Schedule Timetable Period
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

              <form onSubmit={handleCreateSlot} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Day of Week *</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subject *</label>
                  <select
                    required
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="">-- Choose Subject --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Teacher *</label>
                  <select
                    required
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="">-- Choose Teacher --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user.name} ({t.user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Time *</label>
                    <Input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">End Time *</label>
                    <Input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room / Hall</label>
                  <Input
                    placeholder="e.g. Science Lab 1 or Room 201"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
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
                    disabled={submitting}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Save Slot
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
