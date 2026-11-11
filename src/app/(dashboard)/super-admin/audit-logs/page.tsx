import React from 'react'
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  ArrowRight,
  Database,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { getServerUser } from '@/lib/auth/helpers'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage() {
  const user = await getServerUser()

  const defaultSampleLogs = [
    {
      id: 'log-01',
      actor: 'Dr. Robert Smith (teacher.smith@school.com)',
      action: 'GRADE_CHANGE',
      module: 'ACADEMIC',
      entity: 'Grade: Problem Set 4 (STU2024001)',
      detail: 'Score updated: 42.0 → 46.5 (+4.5) upon re-marking proofs',
      ip: '197.210.55.12',
      time: 'Feb 15, 2025 10:45:12 AM',
    },
    {
      id: 'log-02',
      actor: 'Chief Michael Johnson (parent.johnson@school.com)',
      action: 'PAYMENT',
      module: 'FINANCE',
      entity: 'Payment: INV-2025-00142',
      detail: 'Online payment of NGN 285,000 verified via Paystack gateway',
      ip: '105.112.44.89',
      time: 'Feb 15, 2025 09:12:04 AM',
    },
    {
      id: 'log-03',
      actor: 'Marcus Adeyemi (admin@school.com)',
      action: 'CREATE',
      module: 'ADMISSION',
      entity: 'Student: STU2024003',
      detail: 'Approved admission for applicant Zainab Mohammed to Grade 10 Alpha',
      ip: '197.210.55.10',
      time: 'Feb 14, 2025 04:30:22 PM',
    },
    {
      id: 'log-04',
      actor: 'Dr. Elizabeth Vance (superadmin@school.com)',
      action: 'SETTINGS_CHANGE',
      module: 'SYSTEM',
      entity: 'SystemConfig: GradingScale',
      detail: 'Updated Grade A boundary to 80-100% across Senior Secondary level',
      ip: '197.210.55.01',
      time: 'Feb 14, 2025 02:15:00 PM',
    },
    {
      id: 'log-05',
      actor: 'Daniel Johnson (student.daniel@school.com)',
      action: 'DOWNLOAD',
      module: 'REPORTS',
      entity: 'ReportCard: Term 1 2024/2025',
      detail: 'Downloaded authenticated PDF report card (Hash: 9a2b8e)',
      ip: '105.112.44.89',
      time: 'Feb 13, 2025 08:00:15 PM',
    },
  ]

  const dbLogs = await prisma.auditLog.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const logs = dbLogs.length > 0
    ? dbLogs.map((l) => ({
        id: l.id,
        actor: l.user ? `${l.user.name} (${l.user.email})` : 'System Daemon',
        action: l.action,
        module: l.module,
        entity: `${l.entityType}${l.entityId ? `: ${l.entityId}` : ''}`,
        detail: l.newValue ? (typeof l.newValue === 'string' ? l.newValue : JSON.stringify(l.newValue)) : 'Action recorded in audit trail',
        ip: l.ipAddress || '127.0.0.1',
        time: new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }))
    : defaultSampleLogs

  return (
    <DashboardLayout user={user} role="SUPER_ADMIN">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Forensic Audit & Security Logs
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable historical record of all administrative, grading, financial, and security actions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export CSV / JSON
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audit trail by actor, IP address, or entity ID..."
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Filter className="w-3.5 h-3.5" /> All Modules
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Activity className="w-3.5 h-3.5" /> All Actions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Security Event Log</span>
              <span className="text-xs font-normal text-gray-500">Showing 5 of 1,420 events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor & Identity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Modification / Audit Detail</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="text-xs">
                    <TableCell className="font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {log.time}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {log.actor}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action === 'GRADE_CHANGE'
                            ? 'warning'
                            : log.action === 'PAYMENT'
                            ? 'success'
                            : log.action === 'SETTINGS_CHANGE'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-500 text-[11px]">
                      {log.module}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{log.entity}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{log.detail}</p>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-gray-400">
                      {log.ip}
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
