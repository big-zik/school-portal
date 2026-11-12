'use client'

import React, { useState, useEffect } from 'react'
import {
  Compass,
  Plus,
  Users,
  Calendar,
  Search,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  Award,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface SchoolClub {
  id: string
  name: string
  category: string
  patronTeacher: string
  meetingSchedule: string
  room: string
  description: string
  memberCount: number
  isRecruiting: boolean
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<SchoolClub[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'STEM_AND_INNOVATION',
    patronTeacher: 'Dr. Robert Smith',
    meetingSchedule: 'Wednesdays 15:30 - 17:00',
    room: 'STEM Robotics Center',
    description: '',
  })

  const sampleClubs: SchoolClub[] = [
    {
      id: 'clb-1',
      name: 'Junior Engineers, Technicians & Scientists (JETS Club)',
      category: 'STEM_AND_INNOVATION',
      patronTeacher: 'Dr. Robert Smith & Engr. Okon',
      meetingSchedule: 'Wednesdays 15:30 - 17:00',
      room: 'Physics & Robotics Lab',
      description: 'Hands-on rocketry, electronics prototyping, science Olympiad training, and regional STEM exhibitions.',
      memberCount: 42,
      isRecruiting: true,
    },
    {
      id: 'clb-2',
      name: 'Literary & Parliamentary Debate Society',
      category: 'HUMANITIES_AND_ARTS',
      patronTeacher: 'Mrs. Folashade Adebayo',
      meetingSchedule: 'Thursdays 15:00 - 16:30',
      room: 'Auditorium Lecture Hall',
      description: 'Public speaking eloquence, parliamentary debate championships, creative prose, and poetry recitals.',
      memberCount: 38,
      isRecruiting: true,
    },
    {
      id: 'clb-3',
      name: 'Red Cross & First Aid Emergency Cadet Corps',
      category: 'LEADERSHIP_AND_SERVICE',
      patronTeacher: 'Nurse Ngozi Okonkwo',
      meetingSchedule: 'Fridays 14:00 - 15:30',
      room: 'Campus Sick Bay Grounds',
      description: 'Emergency response drills, CPR certification, community health outreach, and school safety coordination.',
      memberCount: 31,
      isRecruiting: true,
    },
    {
      id: 'clb-4',
      name: 'Press & Media Broadcasting Club',
      category: 'HUMANITIES_AND_ARTS',
      patronTeacher: 'Mr. Jude Bello',
      meetingSchedule: 'Mondays 15:30 - 16:30',
      room: 'Digital Media Studio',
      description: 'Campus newsletter publishing, audio/video podcast production, and journalism reporting.',
      memberCount: 26,
      isRecruiting: true,
    },
  ]

  const fetchClubs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/clubs')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setClubs(json.data)
      } else {
        setClubs(sampleClubs)
      }
    } catch (err) {
      console.error(err)
      setClubs(sampleClubs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClubs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          name: '',
          category: 'STEM_AND_INNOVATION',
          patronTeacher: 'Dr. Robert Smith',
          meetingSchedule: 'Wednesdays 15:30 - 17:00',
          room: 'STEM Robotics Center',
          description: '',
        })
        fetchClubs()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to create club')
      }
    } catch (err: any) {
      alert(err.message || 'Error creating club')
    } finally {
      setSubmitting(false)
    }
  }

  const totalMembers = clubs.reduce((acc, c) => acc + c.memberCount, 0)

  const filteredClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patronTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-indigo-600" />
              Clubs, Societies & Extracurricular Activities
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Co-curricular student life, academic societies, leadership clubs, competitions, and staff patron supervision
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" /> Charter New Club
          </Button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Chartered Societies</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{clubs.length} Clubs</p>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Active Student Members</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{totalMembers} Pupils</p>
            <span className="text-[10px] text-emerald-600 font-medium">Over 65% cohort participation</span>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Faculty Patrons</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">12 Advisors</p>
            <span className="text-[10px] text-gray-400">Staff supervised sessions</span>
          </Card>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredClubs.map((club) => (
            <Card
              key={club.id}
              className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50">
                    {club.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {club.memberCount} Enrolled
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {club.name}
                </CardTitle>
                <p className="text-xs text-gray-500">Staff Patron: {club.patronTeacher}</p>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 pb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                  {club.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Meeting Schedule:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{club.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Meeting Venue:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{club.room}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal: Charter New Club */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Charter Extracurricular Club
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Club / Society Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Chess & Strategic Gaming Guild"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
                      >
                        <option value="STEM_AND_INNOVATION">STEM & Technology</option>
                        <option value="HUMANITIES_AND_ARTS">Humanities & Creative Arts</option>
                        <option value="LEADERSHIP_AND_SERVICE">Leadership & Civic Service</option>
                        <option value="SPORTS_AND_GAMES">Athletics & Board Games</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Staff Patron / Advisor
                      </label>
                      <Input
                        value={formData.patronTeacher}
                        onChange={(e) => setFormData({ ...formData, patronTeacher: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Meeting Schedule
                      </label>
                      <Input
                        value={formData.meetingSchedule}
                        onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Meeting Room
                      </label>
                      <Input
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Charter Mission & Activities
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Outline club objectives, projects, or annual championships..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5"
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
                      disabled={submitting}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Charter Club
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
