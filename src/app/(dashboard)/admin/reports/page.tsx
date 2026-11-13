'use client'

import React, { useState } from 'react'
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
  DollarSign,
  PieChart,
  ClipboardCheck,
  CreditCard,
  Building,
  GraduationCap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'BROADSHEET' | 'ENROLMENT' | 'ATTENDANCE' | 'FEES' | 'PERFORMANCE'>('BROADSHEET')

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Executive Analytics, Broad Sheets & Institutional Reports
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              School-wide enrolment metrics, attendance patterns, fee collections, and subject academic performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href="/api/results/report-card/pdf" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 font-semibold shadow-sm text-white">
                <Download className="w-3.5 h-3.5" /> Bulk Export All PDFs
              </Button>
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <Button
            variant={activeTab === 'BROADSHEET' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('BROADSHEET')}
            className={`text-xs gap-1.5 ${activeTab === 'BROADSHEET' ? 'bg-purple-600 text-white' : ''}`}
          >
            <FileText className="w-3.5 h-3.5" /> Result Broad Sheets
          </Button>

          <Button
            variant={activeTab === 'ENROLMENT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ENROLMENT')}
            className={`text-xs gap-1.5 ${activeTab === 'ENROLMENT' ? 'bg-purple-600 text-white' : ''}`}
          >
            <Users className="w-3.5 h-3.5" /> Enrolment Demographics
          </Button>

          <Button
            variant={activeTab === 'ATTENDANCE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`text-xs gap-1.5 ${activeTab === 'ATTENDANCE' ? 'bg-purple-600 text-white' : ''}`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Attendance Trends
          </Button>

          <Button
            variant={activeTab === 'FEES' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('FEES')}
            className={`text-xs gap-1.5 ${activeTab === 'FEES' ? 'bg-purple-600 text-white' : ''}`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Fee Collections
          </Button>

          <Button
            variant={activeTab === 'PERFORMANCE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('PERFORMANCE')}
            className={`text-xs gap-1.5 ${activeTab === 'PERFORMANCE' ? 'bg-purple-600 text-white' : ''}`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Subject Performance
          </Button>
        </div>

        {/* TAB 1: BROADSHEET */}
        {activeTab === 'BROADSHEET' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableExports.map((rep, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{rep.format}</Badge>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{rep.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2">{rep.desc}</p>
                    <div className="pt-2">
                      <a href="/api/results/report-card/pdf" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full text-xs h-7 gap-1">
                          <Download className="w-3 h-3" /> Export Report
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Term 1 Result Broad Sheet — Grade 10 (SS 1) Alpha
                  </CardTitle>
                  <p className="text-xs text-gray-400">Class Average: 87.2% &bull; 100% Promotion Eligibility</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  <Printer className="w-3.5 h-3.5" /> Print Sheet
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs">Cohort</TableHead>
                      <TableHead className="text-center text-xs">Term GPA</TableHead>
                      <TableHead className="text-center text-xs">Average Score</TableHead>
                      <TableHead className="text-center text-xs">Class Rank</TableHead>
                      <TableHead className="text-center text-xs">Approval Status</TableHead>
                      <TableHead className="text-right text-xs">Action</TableHead>
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
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
        )}

        {/* TAB 2: ENROLMENT DEMOGRAPHICS */}
        {activeTab === 'ENROLMENT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Total Active Pupils</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">428</p>
                <span className="text-[10px] text-emerald-600 font-medium">+8.2% from previous session</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Primary Section</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">214 Pupils</p>
                <span className="text-[10px] text-gray-400">Nursery 1 to Primary 6</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Secondary Section</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">214 Students</p>
                <span className="text-[10px] text-gray-400">JSS 1 to SS 3</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Gender Distribution</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">52% F / 48% M</p>
                <span className="text-[10px] text-gray-400">Balanced parity</span>
              </Card>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                Class-by-Class Enrolment Roster
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Class / Section</TableHead>
                    <TableHead className="text-xs text-center">Male</TableHead>
                    <TableHead className="text-xs text-center">Female</TableHead>
                    <TableHead className="text-xs text-center">Capacity</TableHead>
                    <TableHead className="text-xs text-right">Occupancy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'Nursery & Pre-Primary', m: 18, f: 22, cap: 45, occ: '88%' },
                    { name: 'Primary 1 - 3', m: 45, f: 47, cap: 100, occ: '92%' },
                    { name: 'Primary 4 - 6', m: 42, f: 40, cap: 90, occ: '91%' },
                    { name: 'Junior Secondary (JSS 1 - 3)', m: 54, f: 58, cap: 120, occ: '93%' },
                    { name: 'Senior Secondary (SS 1 - 3)', m: 46, f: 56, cap: 110, occ: '92%' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.name}</TableCell>
                      <TableCell className="text-xs text-center">{row.m}</TableCell>
                      <TableCell className="text-xs text-center">{row.f}</TableCell>
                      <TableCell className="text-xs text-center">{row.cap}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-purple-600">{row.occ}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 3: ATTENDANCE TRENDS */}
        {activeTab === 'ATTENDANCE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Term Attendance Average</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">94.8%</p>
                <span className="text-[10px] text-gray-400">Institutional benchmark &gt; 90%</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Late Arrivals Recorded</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">38 Incidents</p>
                <span className="text-[10px] text-gray-400">Primarily bus traffic delays</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Chronic Absenteeism Flag</p>
                <p className="text-2xl font-bold text-red-600 mt-1">2 Students</p>
                <span className="text-[10px] text-red-500 font-medium">Under counselor review</span>
              </Card>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
                Day-of-Week Attendance Compliance
              </h3>
              <div className="space-y-3 pt-2">
                {[
                  { day: 'Monday (Full Assembly)', rate: 98, color: 'bg-emerald-500' },
                  { day: 'Tuesday', rate: 96, color: 'bg-emerald-500' },
                  { day: 'Wednesday (Mid-Week)', rate: 95, color: 'bg-emerald-500' },
                  { day: 'Thursday', rate: 93, color: 'bg-blue-500' },
                  { day: 'Friday (Sports / Clubs)', rate: 91, color: 'bg-blue-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                      <span>{item.day}</span>
                      <span className="font-bold">{item.rate}% Present</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: FEE COLLECTIONS */}
        {activeTab === 'FEES' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Total Billed Tuition</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">₦107,000,000</p>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Reconciled Collections</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">₦94,160,000</p>
                <span className="text-[10px] text-emerald-600 font-medium">88% Recovery rate</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Outstanding Balances</p>
                <p className="text-2xl font-bold text-red-600 mt-1">₦12,840,000</p>
                <span className="text-[10px] text-red-500">Debtors list active</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Paystack Gateway Share</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">72.4%</p>
                <span className="text-[10px] text-gray-400">Card & Instant Transfer</span>
              </Card>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                Revenue Breakdown by Academic Section
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Section</TableHead>
                    <TableHead className="text-xs text-right">Invoiced Amount</TableHead>
                    <TableHead className="text-xs text-right">Collected (NGN)</TableHead>
                    <TableHead className="text-xs text-right">Outstanding (NGN)</TableHead>
                    <TableHead className="text-xs text-right">Clearance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { section: 'Primary Section (P1 - P6)', billed: '₦48,000,000', paid: '₦43,200,000', due: '₦4,800,000', pct: '90%' },
                    { section: 'Junior Secondary (JSS 1 - 3)', billed: '₦27,000,000', paid: '₦23,760,000', due: '₦3,240,000', pct: '88%' },
                    { section: 'Senior Secondary (SS 1 - 3)', billed: '₦32,000,000', paid: '₦27,200,000', due: '₦4,800,000', pct: '85%' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.section}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{row.billed}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-emerald-600">{row.paid}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-red-600">{row.due}</TableCell>
                      <TableCell className="text-xs text-right font-bold text-purple-600">{row.pct}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 5: SUBJECT PERFORMANCE */}
        {activeTab === 'PERFORMANCE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Top Performing Subject</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">Mathematics (89.4%)</p>
                <span className="text-[10px] text-gray-400">Dr. Robert Smith (Instructor)</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Most Improved Cohort</p>
                <p className="text-xl font-bold text-blue-600 mt-1">Grade 11 Science</p>
                <span className="text-[10px] text-emerald-600 font-medium">+14.2% in Chemistry</span>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 font-medium">Subject Pass Rate</p>
                <p className="text-xl font-bold text-purple-600 mt-1">96.8% Above Credit (C4+)</p>
                <span className="text-[10px] text-gray-400">WAEC / BECE Standard</span>
              </Card>
            </div>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                Subject Comparative Pass & Distinction Rates
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Subject Name</TableHead>
                    <TableHead className="text-xs">Lead Teacher</TableHead>
                    <TableHead className="text-xs text-center">Cohort Average</TableHead>
                    <TableHead className="text-xs text-center">Distinction (A1)</TableHead>
                    <TableHead className="text-xs text-center">Credit Rate (C6+)</TableHead>
                    <TableHead className="text-xs text-right">Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { sub: 'Pure Mathematics', teacher: 'Dr. Robert Smith', avg: '89.4%', dist: '42%', cred: '98%', remark: 'Excellent' },
                    { sub: 'English Language & Literature', teacher: 'Mrs. Victoria Adeleke', avg: '85.2%', dist: '35%', cred: '96%', remark: 'Very Good' },
                    { sub: 'Chemistry & Practical Physics', teacher: 'Engr. Daniel Okon', avg: '83.7%', dist: '31%', cred: '94%', remark: 'Good' },
                    { sub: 'Biology & Agricultural Science', teacher: 'Dr. Fatima Yusuf', avg: '86.1%', dist: '38%', cred: '97%', remark: 'Very Good' },
                    { sub: 'Financial Accounting & Commerce', teacher: 'Mr. Anthony Kalu', avg: '82.0%', dist: '28%', cred: '92%', remark: 'Good' },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">{row.sub}</TableCell>
                      <TableCell className="text-xs text-gray-500">{row.teacher}</TableCell>
                      <TableCell className="text-xs text-center font-bold text-purple-600">{row.avg}</TableCell>
                      <TableCell className="text-xs text-center text-emerald-600 font-semibold">{row.dist}</TableCell>
                      <TableCell className="text-xs text-center font-semibold text-blue-600">{row.cred}</TableCell>
                      <TableCell className="text-xs text-right">
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {row.remark}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
