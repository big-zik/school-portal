'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Printer,
  Download,
  BookOpen,
  MapPin,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface TimetableSlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string | null
  subject: { name: string; code: string }
  teacher: { user: { name: string } }
}

export default function ParentTimetablePage() {
  const [activeTab, setActiveTab] = useState<'ca' | 'exam' | 'weekly'>('weekly')
  const [selectedChild, setSelectedChild] = useState('Daniel Johnson (Grade 10 - Alpha)')
  const [slots, setSlots] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)

  const children = [
    { name: 'Daniel Johnson (Grade 10 - Alpha)', class: 'Grade 10 (SS 1) - Alpha', level: 'Senior Secondary' },
  ]

  // CA (Continuous Assessment) Test Timetable
  const caSchedules = [
    {
      date: 'Monday, Feb 17, 2025',
      time: '08:30 AM - 09:30 AM',
      subject: 'Pure Mathematics',
      code: 'MTH-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Quadratic Equations, Simultaneous Linear & Quadratic, Indices',
      room: 'Room 201',
      examiner: 'Dr. Robert Smith',
    },
    {
      date: 'Monday, Feb 17, 2025',
      time: '11:00 AM - 12:00 PM',
      subject: 'English Language & Composition',
      code: 'ENG-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Formal Letter Writing, Comprehension Passages, Pronouns & Clauses',
      room: 'Room 201',
      examiner: 'Mrs. Grace Balogun',
    },
    {
      date: 'Tuesday, Feb 18, 2025',
      time: '08:30 AM - 09:30 AM',
      subject: 'General Chemistry',
      code: 'CHM-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Stoichiometry, Chemical Reactions, Mole Concept & Gas Laws',
      room: 'Chemistry Lab',
      examiner: 'Dr. Mrs. Adebayo',
    },
    {
      date: 'Tuesday, Feb 18, 2025',
      time: '11:00 AM - 12:00 PM',
      subject: 'Physics & Mechanics',
      code: 'PHY-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Kinematics, Equations of Uniform Motion, Projectiles',
      room: 'Room 201',
      examiner: 'Engr. David Adeleke',
    },
    {
      date: 'Wednesday, Feb 19, 2025',
      time: '08:30 AM - 09:30 AM',
      subject: 'Biology & Physiology',
      code: 'BIO-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Cellular Respiration, Plant Nutrition & Transport System',
      room: 'Biology Lab',
      examiner: 'Dr. Chika Okeke',
    },
    {
      date: 'Wednesday, Feb 19, 2025',
      time: '11:00 AM - 12:00 PM',
      subject: 'Computer Science & ICT',
      code: 'CSC-SS1',
      assessment: 'CA Test 2 (20 Marks)',
      topics: 'Algorithm Flowcharts, Introduction to Python Data Types',
      room: 'ICT STEM Center',
      examiner: 'Mr. Emmanuel Okon',
    },
  ]

  // Terminal Examination Timetable
  const examSchedules = [
    {
      date: 'Monday, March 24, 2025',
      time: '09:00 AM - 11:30 AM',
      subject: 'General Mathematics (Paper 1 & Paper 2)',
      duration: '2.5 Hours',
      hall: 'Main Assembly Examination Hall',
      requirements: 'Mathematical Sets, Non-programmable Scientific Calculator',
      maxScore: '60 Marks',
    },
    {
      date: 'Tuesday, March 25, 2025',
      time: '09:00 AM - 12:00 PM',
      subject: 'English Language (Essay, Comprehension & Lexis)',
      duration: '3.0 Hours',
      hall: 'Main Assembly Examination Hall',
      requirements: 'Blue / Black Ballpoint Pens only',
      maxScore: '60 Marks',
    },
    {
      date: 'Wednesday, March 26, 2025',
      time: '09:00 AM - 11:00 AM',
      subject: 'Chemistry (Theory & Practical Interpretation)',
      duration: '2.0 Hours',
      hall: 'Science Wing Hall A',
      requirements: 'Scientific Calculator, Periodic Table Provided',
      maxScore: '60 Marks',
    },
    {
      date: 'Thursday, March 27, 2025',
      time: '09:00 AM - 11:00 AM',
      subject: 'Physics (Mechanics, Waves & Practical Component)',
      duration: '2.0 Hours',
      hall: 'Science Wing Hall A',
      requirements: 'Scientific Calculator, 30cm Ruler',
      maxScore: '60 Marks',
    },
    {
      date: 'Friday, March 28, 2025',
      time: '09:00 AM - 11:00 AM',
      subject: 'Biology (Cell Biology, Physiology & Ecology)',
      duration: '2.0 Hours',
      hall: 'Main Assembly Examination Hall',
      requirements: 'Sharp HB Pencils for Anatomical Diagrams',
      maxScore: '60 Marks',
    },
    {
      date: 'Monday, March 31, 2025',
      time: '09:00 AM - 11:00 AM',
      subject: 'Computer Studies (CBT Objective & Algorithm Theory)',
      duration: '2.0 Hours',
      hall: 'ICT CBT Lab 1',
      requirements: 'Student ID Card for Workstation Login',
      maxScore: '60 Marks',
    },
  ]

  // Default fallback weekly periods
  const defaultWeeklyPeriods = [
    { time: '08:00 - 08:45', mon: 'Mathematics', tue: 'Chemistry', wed: 'Physics', thu: 'Mathematics', fri: 'English' },
    { time: '08:45 - 09:30', mon: 'Mathematics', tue: 'Chemistry', wed: 'Physics', thu: 'Economics', fri: 'English' },
    { time: '09:30 - 10:15', mon: 'English', tue: 'Physics', wed: 'Biology', thu: 'Biology', fri: 'Computer' },
    { time: '10:15 - 10:45', mon: 'BREAK / RECESS', tue: 'BREAK / RECESS', wed: 'BREAK / RECESS', thu: 'BREAK / RECESS', fri: 'BREAK / RECESS' },
    { time: '10:45 - 11:30', mon: 'Chemistry', tue: 'Biology', wed: 'English', thu: 'Civic Edu', fri: 'Library Period' },
    { time: '11:30 - 12:15', mon: 'Economics', tue: 'English', wed: 'Computer Lab', thu: 'Chemistry Lab', fri: 'Clubs & Societies' },
    { time: '12:15 - 01:00', mon: 'Civic Education', tue: 'Pure Maths', wed: 'Computer Lab', thu: 'Chemistry Lab', fri: 'Sports' },
  ]

  useEffect(() => {
    async function loadTimetable() {
      try {
        const res = await fetch('/api/timetable')
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setSlots(json.data)
          }
        }
      } catch (err) {
        console.error('Failed to load parent timetable:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTimetable()
  }, [])

  // Build weekly table from API slots if available
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const times = ['08:00 - 08:45', '08:45 - 09:30', '09:30 - 10:15', '10:45 - 11:30', '11:30 - 12:15', '12:15 - 01:00']

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-purple-600" />
              Academic Schedules & Assessment Timetables
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Continuous Assessment (CA) test schedules, terminal examination calendars, and regular weekly class timetables
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print Timetable
            </Button>
          </div>
        </div>

        {/* Child Selector & Mode Tabs */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Child:</span>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs font-medium"
              >
                {children.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">Grade 10 Alpha</Badge>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Button
                size="sm"
                variant={activeTab === 'weekly' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('weekly')}
                className={`text-xs font-semibold h-8 gap-1.5 ${activeTab === 'weekly' ? 'bg-purple-600 text-white' : ''}`}
              >
                <Calendar className="w-3.5 h-3.5" /> Weekly Classes
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'ca' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('ca')}
                className={`text-xs font-semibold h-8 gap-1.5 ${activeTab === 'ca' ? 'bg-purple-600 text-white' : ''}`}
              >
                <BookOpen className="w-3.5 h-3.5" /> CA Test Schedule
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'exam' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('exam')}
                className={`text-xs font-semibold h-8 gap-1.5 ${activeTab === 'exam' ? 'bg-purple-600 text-white' : ''}`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Exam Timetable
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TAB 1: REGULAR WEEKLY TIMETABLE */}
        {activeTab === 'weekly' && (
          <Card>
            <CardHeader className="py-3 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Standard Weekly Class Schedule — Grade 10 Alpha</CardTitle>
                <p className="text-xs text-gray-500">Live academic timetable from portal schedule database</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {slots.length > 0 ? `${slots.length} Scheduled Periods` : 'Standard Schedule'}
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                  Loading student timetable...
                </div>
              ) : slots.length > 0 ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                  {DAYS.map((day) => {
                    const daySlots = slots.filter((s) => s.dayOfWeek === day)
                    return (
                      <div key={day} className="space-y-2">
                        <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold text-xs uppercase px-2 py-1.5 rounded text-center">
                          {day}
                        </div>
                        {daySlots.length === 0 ? (
                          <div className="p-3 text-[11px] text-gray-400 border border-dashed rounded text-center">
                            No class
                          </div>
                        ) : (
                          daySlots.map((s) => (
                            <div key={s.id} className="p-2.5 rounded-lg border bg-white dark:bg-gray-800 shadow-xs space-y-1">
                              <p className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">{s.subject.name}</p>
                              <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <span>{s.startTime} - {s.endTime}</span>
                                {s.room && <span className="font-mono">{s.room}</span>}
                              </div>
                              <p className="text-[10px] text-purple-600 truncate">{s.teacher.user.name}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Period Time</TableHead>
                      <TableHead className="text-xs">Monday</TableHead>
                      <TableHead className="text-xs">Tuesday</TableHead>
                      <TableHead className="text-xs">Wednesday</TableHead>
                      <TableHead className="text-xs">Thursday</TableHead>
                      <TableHead className="text-xs">Friday</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaultWeeklyPeriods.map((wp, i) => (
                      <TableRow
                        key={i}
                        className={wp.mon.includes('BREAK') ? 'bg-amber-50/50 dark:bg-amber-950/20 font-bold text-amber-800' : ''}
                      >
                        <TableCell className="font-mono text-xs font-semibold whitespace-nowrap text-gray-500">
                          {wp.time}
                        </TableCell>
                        <TableCell className="text-xs">{wp.mon}</TableCell>
                        <TableCell className="text-xs">{wp.tue}</TableCell>
                        <TableCell className="text-xs">{wp.wed}</TableCell>
                        <TableCell className="text-xs">{wp.thu}</TableCell>
                        <TableCell className="text-xs">{wp.fri}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: CA TEST TIMETABLE */}
        {activeTab === 'ca' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="font-bold">Term 2 Continuous Assessment (CA 2) Test Week</p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                    Tests will hold from Monday Feb 17 to Wednesday Feb 19, 2025. Please review the tested topic areas with your child.
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white text-[10px]">Upcoming</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caSchedules.map((ca, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="py-3 px-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        {ca.subject}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">{ca.code}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{ca.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{ca.time}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Syllabus Coverage:
                      </p>
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-snug">{ca.topics}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {ca.room}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                        <User className="w-3 h-3 text-purple-500" /> {ca.examiner}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TERMINAL EXAM TIMETABLE */}
        {activeTab === 'exam' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold">Term 2 Final Examination Timetable — Senior Secondary</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                    Official terminal exams commence on March 24, 2025. Students must be seated in their designated hall 15 minutes before start time.
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white text-[10px]">Official Release</Badge>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Time & Duration</TableHead>
                      <TableHead className="text-xs">Subject & Paper</TableHead>
                      <TableHead className="text-xs">Exam Venue / Hall</TableHead>
                      <TableHead className="text-xs">Special Instructions & Tools</TableHead>
                      <TableHead className="text-xs text-right">Max Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examSchedules.map((ex, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100">
                          {ex.date}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {ex.time} ({ex.duration})
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          {ex.subject}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {ex.hall}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {ex.requirements}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-800 dark:text-gray-200 text-right">
                          {ex.maxScore}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
