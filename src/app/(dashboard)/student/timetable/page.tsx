import React from 'react'
import { Calendar, Clock, Printer, MapPin, User, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function StudentTimetablePage() {
  const user = await getServerUser()

  const schedule = [
    {
      day: 'Monday',
      periods: [
        { time: '08:00 - 09:20', subject: 'Pure Mathematics', teacher: 'Dr. Robert Smith', room: 'Room 201', color: 'blue' },
        { time: '09:30 - 10:45', subject: 'English & Composition', teacher: 'Mr. Andrew Clark', room: 'Room 201', color: 'indigo' },
        { time: '11:15 - 12:45', subject: 'General Chemistry', teacher: 'Mrs. Folashade Adebayo', room: 'Science Lab B', color: 'purple' },
        { time: '01:30 - 02:45', subject: 'Physics & Mechanics', teacher: 'Engr. David Adeleke', room: 'Physics Lab', color: 'amber' },
      ],
    },
    {
      day: 'Tuesday',
      periods: [
        { time: '08:00 - 09:20', subject: 'Pure Mathematics', teacher: 'Dr. Robert Smith', room: 'Room 201', color: 'blue' },
        { time: '09:30 - 10:45', subject: 'English & Composition', teacher: 'Mr. Andrew Clark', room: 'Room 201', color: 'indigo' },
        { time: '11:15 - 12:45', subject: 'Chemistry Lab', teacher: 'Mrs. Folashade Adebayo', room: 'Science Lab B', color: 'purple' },
        { time: '01:30 - 02:45', subject: 'Computer Science', teacher: 'Mr. Jude Bello', room: 'ICT Lab 1', color: 'emerald' },
      ],
    },
    {
      day: 'Wednesday',
      periods: [
        { time: '08:00 - 09:20', subject: 'Biology & Physiology', teacher: 'Dr. Chika Okeke', room: 'Biology Lab', color: 'emerald' },
        { time: '09:30 - 10:45', subject: 'Pure Mathematics', teacher: 'Dr. Robert Smith', room: 'Room 201', color: 'blue' },
        { time: '11:15 - 12:45', subject: 'Economics', teacher: 'Mrs. Grace Balogun', room: 'Room 201', color: 'amber' },
        { time: '01:30 - 02:45', subject: 'Civic Education & Ethics', teacher: 'Mr. Andrew Clark', room: 'Room 201', color: 'indigo' },
      ],
    },
    {
      day: 'Thursday',
      periods: [
        { time: '08:00 - 09:20', subject: 'Physics Lab', teacher: 'Engr. David Adeleke', room: 'Physics Lab', color: 'amber' },
        { time: '09:30 - 10:45', subject: 'General Chemistry', teacher: 'Mrs. Folashade Adebayo', room: 'Science Lab B', color: 'purple' },
        { time: '11:15 - 12:45', subject: 'English Literature', teacher: 'Mr. Andrew Clark', room: 'Room 201', color: 'indigo' },
        { time: '01:30 - 02:45', subject: 'Technical Drawing', teacher: 'Arch. Tayo Johnson', room: 'Studio 3', color: 'slate' },
      ],
    },
    {
      day: 'Friday',
      periods: [
        { time: '08:00 - 09:20', subject: 'Pure Mathematics Quiz', teacher: 'Dr. Robert Smith', room: 'Room 201', color: 'blue' },
        { time: '09:30 - 10:45', subject: 'French Language', teacher: 'Mme. Claire Dubois', room: 'Room 201', color: 'pink' },
        { time: '11:15 - 12:30', subject: 'Physical & Health Education', teacher: 'Coach Ibrahim', room: 'Sports Complex', color: 'emerald' },
      ],
    },
  ]

  return (
    <DashboardLayout user={user} role="STUDENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-blue-600" />
              Weekly Class Timetable
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Grade 10 (Senior Secondary 1) Alpha Cohort • Term 2 (Spring 2025)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print Timetable
            </Button>
          </div>
        </div>

        {/* Schedule Grid by Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedule.map((dayPlan) => (
            <Card key={dayPlan.day} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="py-3 px-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dayPlan.day}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {dayPlan.periods.length} Periods
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {dayPlan.periods.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                        {p.subject}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{p.time}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" /> {p.teacher}
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {p.room}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
