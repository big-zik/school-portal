'use client'

import React, { useState, useEffect } from 'react'
import {
  Compass,
  Users,
  Calendar,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
}

export default function StudentClubsPage() {
  const [clubs, setClubs] = useState<SchoolClub[]>([])
  const [loading, setLoading] = useState(true)
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>(['clb-1'])
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const sampleClubs: SchoolClub[] = [
    {
      id: 'clb-1',
      name: 'Junior Engineers, Technicians & Scientists (JETS Club)',
      category: 'STEM_AND_INNOVATION',
      patronTeacher: 'Dr. Robert Smith',
      meetingSchedule: 'Wednesdays 15:30 - 17:00',
      room: 'Physics & Robotics Lab',
      description: 'Hands-on rocketry, electronics prototyping, science Olympiad training, and regional STEM exhibitions.',
      memberCount: 43,
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
    },
  ]

  useEffect(() => {
    async function load() {
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
        setClubs(sampleClubs)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleJoin = async (clubId: string) => {
    setJoiningId(clubId)
    try {
      await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'JOIN', clubId }),
      })
      setJoinedClubIds((prev) => [...prev, clubId])
    } catch (err) {
      console.error(err)
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-indigo-600" />
              Student Clubs & Extracurricular Societies
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Join student-led clubs, hone leadership skills, and participate in inter-school competitions
            </p>
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {clubs.map((c) => {
            const hasJoined = joinedClubIds.includes(c.id)
            const isJoining = joiningId === c.id

            return (
              <Card
                key={c.id}
                className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50">
                      {c.category.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {c.memberCount} Members
                    </Badge>
                  </div>

                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {c.name}
                  </CardTitle>
                  <p className="text-xs text-gray-400">Patron: {c.patronTeacher}</p>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 pb-4">
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                    {c.description}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.meetingSchedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.room}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {hasJoined ? (
                      <Button
                        disabled
                        size="sm"
                        className="w-full text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Active Member
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isJoining}
                        onClick={() => handleJoin(c.id)}
                        className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                      >
                        {isJoining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Join Club
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
