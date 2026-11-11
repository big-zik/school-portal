import React from 'react'
import { Bus, MapPin, Phone, Users, PlusCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function AdminTransportPage() {
  const routes = [
    {
      id: 'RT-01',
      name: 'Lekki - Ajah Express Route',
      vehicle: 'Toyota Coaster (LND-482-XA)',
      driver: 'Mr. Paul Babatunde',
      phone: '+234 802 333 4441',
      capacity: '32 / 32 Seats (Full)',
      termFee: 65000,
      stops: ['VGC Roundabout', 'Chevron Gate', 'Jakande', 'Admiralty Circle', 'Campus'],
    },
    {
      id: 'RT-02',
      name: 'Ikoyi - Victoria Island Shuttle',
      vehicle: 'Toyota HiAce (KJA-192-BC)',
      driver: 'Mr. Emmanuel Okon',
      phone: '+234 802 333 4442',
      capacity: '16 / 18 Seats',
      termFee: 55000,
      stops: ['Bourdillon Rd', 'Awolowo Way', 'Ahmadu Bello', 'Campus'],
    },
    {
      id: 'RT-03',
      name: 'Surulere - Mainland Line',
      vehicle: 'Toyota Coaster (APP-552-DE)',
      driver: 'Mr. Sunday Alabi',
      phone: '+234 802 333 4443',
      capacity: '28 / 32 Seats',
      termFee: 75000,
      stops: ['Stadium Hotel', 'Ojuelegba', 'Costain', 'Third Mainland', 'Campus'],
    },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Bus className="w-6 h-6 text-amber-600" />
              School Transport & Fleet Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Bus routes, pick-up/drop-off schedules, driver contacts, and student route allocation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Add Bus Route
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.map((rt) => (
            <Card key={rt.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">{rt.id}</Badge>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(rt.termFee)} / term</span>
                </div>
                <CardTitle className="text-base font-bold mt-1">{rt.name}</CardTitle>
                <p className="text-xs text-gray-500">{rt.vehicle}</p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Driver & Contact</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{rt.driver}</p>
                  <p className="text-gray-500 flex items-center gap-1 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-gray-400" /> {rt.phone}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Capacity</p>
                  <div className="flex items-center justify-between font-semibold">
                    <span>Assigned Students:</span>
                    <span className="text-blue-600">{rt.capacity}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase">Stops Route</p>
                  <div className="flex flex-wrap gap-1">
                    {rt.stops.map((stop, i) => (
                      <span key={i} className="inline-block rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Assigned Students
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
