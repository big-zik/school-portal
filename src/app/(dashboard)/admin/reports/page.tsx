import React from 'react'
import {
  FileText,
  Download,
  Filter,
  Printer,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function AdminReportsPage() {
  const reportCards = [
    { id: 'RC-001', student: 'Daniel Johnson', class: 'Grade 10 Alpha', gpa: '3.92', average: '91.5%', position: '2nd / 30', status: 'APPROVED' },
    { id: 'RC-002', student: 'Amara Okafor', class: 'Grade 10 Alpha', gpa: '3.98', average: '94.2%', position: '1st / 30', status: 'APPROVED' },
    { id: 'RC-003', student: 'David Adeleke', class: 'Grade 10 Alpha', gpa: '3.65', average: '84.8%', position: '5th / 30', status: 'APPROVED' },
    { id: 'RC-004', student: 'Fatima Abubakar', class: 'Grade 10 Alpha', gpa: '3.82', average: '88.5%', position: '3rd / 30', status: 'APPROVED' },
    { id: 'RC-005', student: 'Chukwudi Eze', class: 'Grade 10 Alpha', gpa: '3.50', average: '81.2%', position: '7th / 30', status: 'APPROVED' },
  ]

  const availableExports = [
    { title: 'Terminal Broad Sheet (All Classes)', desc: 'Consolidated spreadsheet of all student CA and exam scores', format: 'Excel (XLSX)' },
    { title: 'Class Performance & Percentile Distribution', desc: 'Subject averages, standard deviations, and rank statistics', format: 'PDF' },
    { title: 'School-Wide Attendance & Truancy Report', desc: 'Detailed absence rates, sick leaves, and unexcused counts', format: 'CSV' },
    { title: 'Bursary Collection & Defaulter Audit Report', desc: 'Class-by-class fee revenue, discounts, and balances', format: 'Excel (XLSX)' },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-purple-600" />
              Academic Reports, Broad Sheets & Analytics
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Generate, approve, export, and publish authenticated terminal report cards and transcripts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 font-semibold">
              <Download className="w-3.5 h-3.5" /> Bulk Export All PDFs
            </Button>
          </div>
        </div>

        {/* 4 Available Official Downloads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableExports.map((rep, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-2">
                <Badge variant="outline" className="text-[10px] font-mono">{rep.format}</Badge>
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{rep.title}</h4>
                <p className="text-[11px] text-gray-500 line-clamp-2">{rep.desc}</p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs h-7 gap-1">
                    <Download className="w-3 h-3" /> Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grade 10 Alpha Broad Sheet Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Term 1 Result Broad Sheet — Grade 10 (SS 1) Alpha
              </CardTitle>
              <p className="text-xs text-gray-400">Class Average: 87.2% • 100% Promotion Eligibility</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <Printer className="w-3.5 h-3.5" /> Print Sheet
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead className="text-center">Term GPA</TableHead>
                  <TableHead className="text-center">Average Score</TableHead>
                  <TableHead className="text-center">Class Rank</TableHead>
                  <TableHead className="text-center">Approval Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportCards.map((rc) => (
                  <TableRow key={rc.id}>
                    <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                      {rc.student}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{rc.class}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-blue-600">{rc.gpa}</TableCell>
                    <TableCell className="text-center font-mono text-xs font-bold text-emerald-600">{rc.average}</TableCell>
                    <TableCell className="text-center font-medium text-xs">{rc.position}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="success" className="text-[10px]">
                        {rc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-xs h-7 text-purple-600">
                        View Report
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
