'use client'

import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react'
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
  const [meetings, setMeetings] = useState<MeetingItem[]>([
    {
      id: 'm-1',
      title: 'Term 2 Academic & STEM Progress Consultation',
      teacherName: 'Dr. Robert Smith (Mathematics)',
      childName: 'Daniel Johnson',
      date: 'Feb 22, 2025',
      time: '02:30 PM - 03:00 PM',
      mode: 'VIRTUAL',
      locationOrLink: 'https://meet.google.com/cgs-academic-progress',
      status: 'CONFIRMED',
    },
    {
      id: 'm-2',
      title: 'Parent-Teacher Association (PTA) General Assembly',
      teacherName: 'Executive PTA Council',
      childName: 'All Children',
      date: 'Mar 01, 2025',
      time: '10:00 AM - 12:30 PM',
      mode: 'IN_PERSON',
      locationOrLink: 'CHOSEN GENERATION SCHOOL Main Auditorium',
      status: 'CONFIRMED',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTeacher, setNewTeacher] = useState('')
  const [newDate, setNewDate] = useState('')

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    setMeetings([
      ...meetings,
      {
        id: `m-${Date.now()}`,
        title: newTitle || 'Academic Performance Inquiry',
        teacherName: newTeacher || 'Class Homeroom Teacher',
        childName: 'Daniel Johnson',
        date: newDate || 'Next Available Slot',
        time: 'TBD by Faculty',
        mode: 'VIRTUAL',
        locationOrLink: 'Link will be sent via school messages',
        status: 'PENDING',
      },
    ])
    setShowModal(false)
    setRequestSubmitted(true)
    setTimeout(() => setRequestSubmitted(false), 5000)
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
            Meeting consultation request submitted! The faculty will confirm your slot within 24 hours.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <Card key={m.id} className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant={m.status === 'CONFIRMED' ? 'success' : 'warning'} className="text-[10px]">
                      {m.status}
                    </Badge>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-2">{m.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{m.teacherName}</p>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    Student: {m.childName}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{m.date}</span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{m.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.mode === 'VIRTUAL' ? (
                      <Video className="w-4 h-4 text-blue-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="truncate">{m.locationOrLink}</span>
                  </div>
                </div>

                {m.status === 'CONFIRMED' && m.mode === 'VIRTUAL' && (
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs mt-2"
                    onClick={() => window.open(m.locationOrLink, '_blank')}
                  >
                    Join Video Conference
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Schedule Consultation</h2>
              <form onSubmit={handleBookMeeting} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Topic / Concern</label>
                  <Input
                    required
                    placeholder="e.g. Mathematics Calculus performance review"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Teacher / Subject</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Robert Smith (Senior Secondary Math)"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Preferred Date</label>
                  <Input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
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
