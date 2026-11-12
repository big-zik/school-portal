'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)

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
  }, [])

  useEffect(() => {
    if (!selectedClassId) return
    setLoading(true)
    fetch(`/api/timetable?classId=${selectedClassId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSlots(json.data || [])
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [selectedClassId])

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
          </div>
        </div>

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
      </div>
    </DashboardLayout>
  )
}
