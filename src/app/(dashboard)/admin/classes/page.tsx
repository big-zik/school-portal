import React from 'react'
import { Building, Users, BookOpen, PlusCircle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminClassesPage() {
  const classes = [
    {
      id: 'cls-10',
      name: 'Grade 10 (SS 1)',
      level: 'Senior Secondary',
      sections: [
        { name: 'Section Alpha', room: 'Room 201', students: 30, formTutor: 'Dr. Robert Smith' },
        { name: 'Section Beta', room: 'Room 202', students: 28, formTutor: 'Mr. Andrew Clark' },
      ],
      totalStudents: 58,
      capacity: 60,
    },
    {
      id: 'cls-11',
      name: 'Grade 11 (SS 2)',
      level: 'Senior Secondary',
      sections: [
        { name: 'Science Cohort', room: 'Room 305', students: 25, formTutor: 'Mrs. Folashade Adebayo' },
        { name: 'Arts & Commercial', room: 'Room 306', students: 27, formTutor: 'Mrs. Grace Balogun' },
      ],
      totalStudents: 52,
      capacity: 60,
    },
    {
      id: 'cls-12',
      name: 'Grade 12 (SS 3 - Valedictory)',
      level: 'Senior Secondary',
      sections: [
        { name: 'Section Alpha', room: 'Hall 401', students: 28, formTutor: 'Engr. David Adeleke' },
        { name: 'Section Beta', room: 'Hall 402', students: 26, formTutor: 'Dr. Chika Okeke' },
      ],
      totalStudents: 54,
      capacity: 60,
    },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Building className="w-6 h-6 text-blue-600" />
              Classes, Sections & Subject Curriculum
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage academic grade levels, classroom allocations, form tutors, and student capacities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Add New Class
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50/70 dark:bg-gray-800/50 py-3.5 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {cls.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {cls.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {cls.totalStudents} Enrolled / {cls.capacity} Capacity ({Math.round((cls.totalStudents / cls.capacity) * 100)}% Occupancy)
                  </p>
                </div>

                <Button variant="outline" size="sm" className="text-xs">
                  Manage Class
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section Name</TableHead>
                      <TableHead>Assigned Homeroom</TableHead>
                      <TableHead>Form Tutor</TableHead>
                      <TableHead className="text-center">Enrolled Students</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cls.sections.map((sec, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                          {sec.name}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-blue-600 font-semibold">
                          {sec.room}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                          {sec.formTutor}
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">
                          {sec.students} Students
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-blue-600">
                            View Roster
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
