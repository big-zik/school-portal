import React from 'react'
import { Building, Users, Shield, PlusCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function AdminHostelPage() {
  const hostels = [
    {
      id: 'HST-01',
      name: 'Nelson Mandela Hall (Boys Senior)',
      warden: 'Mr. Jude Bello',
      type: 'MALE',
      capacity: 120,
      occupied: 112,
      rooms: 30,
      termFee: 150000,
    },
    {
      id: 'HST-02',
      name: 'Queen Amina Hall (Girls Senior)',
      warden: 'Mrs. Folashade Adebayo',
      type: 'FEMALE',
      capacity: 120,
      occupied: 118,
      rooms: 30,
      termFee: 150000,
    },
    {
      id: 'HST-03',
      name: 'Junior Scholars Residence',
      warden: 'Mr. Andrew Clark',
      type: 'MIXED',
      capacity: 80,
      occupied: 72,
      rooms: 20,
      termFee: 135000,
    },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Building className="w-6 h-6 text-purple-600" />
              Boarding House & Hostel Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Hostel dormitories, room allocations, boarding fees, warden assignments, and curfew attendance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Allocate Room
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hostels.map((h) => (
            <Card key={h.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Badge variant={h.type === 'MALE' ? 'default' : 'secondary'} className="text-[10px]">
                    {h.type} HOSTEL
                  </Badge>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(h.termFee)} / term</span>
                </div>
                <CardTitle className="text-base font-bold mt-1">{h.name}</CardTitle>
                <p className="text-xs text-gray-500">Warden: {h.warden}</p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 text-[10px]">Occupancy</p>
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-0.5">
                      {h.occupied} / {h.capacity}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <p className="text-gray-400 text-[10px]">Available Beds</p>
                    <p className="font-bold text-sm text-emerald-600 mt-0.5">
                      {h.capacity - h.occupied} Available
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Room Configuration</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {h.rooms} quad rooms (4 students per room) with en-suite facilities.
                  </p>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Room Roster
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
