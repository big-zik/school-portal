import React from 'react'
import { Users, PlusCircle, Search, Filter, Download, MoreHorizontal, UserCheck, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminStudentsPage() {
  const students = [
    { studentId: 'STU2024001', name: 'Daniel Johnson', class: 'Grade 10 Alpha', gender: 'Male', guardian: 'Chief Michael Johnson', phone: '+234 803 222 0001', status: 'ACTIVE' },
    { studentId: 'STU2024002', name: 'Amara Okafor', class: 'Grade 10 Alpha', gender: 'Female', guardian: 'Dr. Chidi Okafor', phone: '+234 803 222 0002', status: 'ACTIVE' },
    { studentId: 'STU2024003', name: 'David Adeleke', class: 'Grade 10 Alpha', gender: 'Male', guardian: 'Alhaji Adeleke', phone: '+234 803 222 0003', status: 'ACTIVE' },
    { studentId: 'STU2024004', name: 'Fatima Abubakar', class: 'Grade 10 Alpha', gender: 'Female', guardian: 'Col. Abubakar', phone: '+234 803 222 0004', status: 'ACTIVE' },
    { studentId: 'STU2024005', name: 'Chukwudi Eze', class: 'Grade 10 Alpha', gender: 'Male', guardian: 'Barr. Eze', phone: '+234 803 222 0005', status: 'ACTIVE' },
    { studentId: 'STU2024006', name: 'Grace Mensah', class: 'Grade 10 Beta', gender: 'Female', guardian: 'Mrs. Mensah', phone: '+234 803 222 0006', status: 'ACTIVE' },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-600" />
              Student Information & Enrolment Directory
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              485 actively enrolled students across Senior and Junior Secondary divisions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Admit New Student
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search students by name, admission number, or guardian..." className="pl-9 text-xs" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs">
                <option>All Classes</option>
                <option>Grade 10 Alpha</option>
                <option>Grade 10 Beta</option>
                <option>Grade 11 Science</option>
              </select>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Enrolled Students</CardTitle>
            <Badge variant="secondary" className="text-[10px]">Active Academic Session</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Class / Section</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Primary Guardian</TableHead>
                  <TableHead>Emergency Phone</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((st) => (
                  <TableRow key={st.studentId}>
                    <TableCell className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                      {st.studentId}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                      {st.name}
                    </TableCell>
                    <TableCell className="text-xs text-blue-600 font-medium">{st.class}</TableCell>
                    <TableCell className="text-xs text-gray-500">{st.gender}</TableCell>
                    <TableCell className="text-xs text-gray-700 dark:text-gray-300">{st.guardian}</TableCell>
                    <TableCell className="text-xs font-mono text-gray-500">{st.phone}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success" className="text-[10px]">
                        {st.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-xs h-7 text-blue-600">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
