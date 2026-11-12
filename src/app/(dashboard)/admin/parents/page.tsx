'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Users, Search, Mail, Phone, Briefcase, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface GuardianItem {
  id: string
  relationship: string
  occupation: string | null
  officeAddress: string | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
  }
  studentGuardians: Array<{
    isPrimary: boolean
    student: {
      id: string
      user: { name: string }
      currentClass: { name: string } | null
    }
  }>
}

export default function AdminParentsPage() {
  const [guardians, setGuardians] = useState<GuardianItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchParents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/parents?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setGuardians(json.data || [])
      }
    } catch (e) {
      console.error('Failed to load parents', e)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParents()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchParents])

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600" />
            Parents & Guardians Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            CHOSEN GENERATION SCHOOL — {guardians.length} registered guardians connected to students
          </p>
        </div>

        <Card className="border border-gray-100 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search guardian name, email, or job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent / Guardian</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Associated Student(s)</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      Loading parents directory...
                    </TableCell>
                  </TableRow>
                ) : guardians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-gray-500">
                      No guardians found
                    </TableCell>
                  </TableRow>
                ) : (
                  guardians.map((g) => (
                    <TableRow key={g.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {g.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {g.user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {g.relationship.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {g.studentGuardians.map((sg, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs">
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {sg.student.user.name}
                              </span>
                              {sg.student.currentClass && (
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
                                  {sg.student.currentClass.name}
                                </span>
                              )}
                              {sg.isPrimary && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">Primary</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {g.occupation || 'Self-Employed'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {g.user.email}
                          </p>
                          {g.user.phone && (
                            <p className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {g.user.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" className="text-[10px]">
                          Verified Guardian
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
