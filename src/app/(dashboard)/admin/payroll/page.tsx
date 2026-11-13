'use client'

import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Download,
  Plus,
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Building,
  Loader2,
  X,
  Search,
  Sparkles,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { calculateNigerianPAYE } from '@/lib/utils/payroll'

interface Payslip {
  teacherId: string
  staffName: string
  staffNo: string
  department: string
  baseSalaryKobo: number
  housingKobo: number
  transportKobo: number
  grossKobo: number
  pensionKobo: number
  taxKobo: number
  totalDeductionsKobo: number
  netPayKobo: number
}

interface PayrollRun {
  id: string
  month: string
  staffCount: number
  totalGrossKobo: number
  totalDeductionsKobo: number
  totalNetKobo: number
  slips: Payslip[]
}

export default function AdminPayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('February 2026')
  const [activeSlip, setActiveSlip] = useState<Payslip | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fallback demo payroll run with genuine Nigerian PITA progressive PAYE tax computation
  const demoTeachers = [
    { id: 't-1', name: 'Dr. Robert Smith', staffNo: 'TCH2024001', dept: 'Sciences (Mathematics)', base: 25000000 },
    { id: 't-2', name: 'Mrs. Folashade Adebayo', staffNo: 'TCH2024002', dept: 'Languages & Arts', base: 27500000 },
    { id: 't-3', name: 'Mr. Emmanuel Okon', staffNo: 'TCH2024003', dept: 'Commercial Studies', base: 24000000 },
  ]

  const fallbackSlips: Payslip[] = demoTeachers.map((t) => {
    const housingKobo = Math.round(t.base * 0.2)
    const transportKobo = Math.round(t.base * 0.1)
    const grossKobo = t.base + housingKobo + transportKobo
    const pensionKobo = Math.round(t.base * 0.08)
    const paye = calculateNigerianPAYE(grossKobo, pensionKobo)
    const taxKobo = paye.monthlyTaxKobo
    const totalDeductionsKobo = pensionKobo + taxKobo
    const netPayKobo = grossKobo - totalDeductionsKobo

    return {
      teacherId: t.id,
      staffName: t.name,
      staffNo: t.staffNo,
      department: t.dept,
      baseSalaryKobo: t.base,
      housingKobo,
      transportKobo,
      grossKobo,
      pensionKobo,
      taxKobo,
      totalDeductionsKobo,
      netPayKobo,
    }
  })

  const sampleRun: PayrollRun = {
    id: 'pay-feb-2026',
    month: 'February 2026',
    staffCount: fallbackSlips.length,
    totalGrossKobo: fallbackSlips.reduce((acc, s) => acc + s.grossKobo, 0),
    totalDeductionsKobo: fallbackSlips.reduce((acc, s) => acc + s.totalDeductionsKobo, 0),
    totalNetKobo: fallbackSlips.reduce((acc, s) => acc + s.netPayKobo, 0),
    slips: fallbackSlips,
  }

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payroll')
      const json = await res.json()
      if (json.success && json.data && json.data.length > 0) {
        setRuns(json.data)
      } else {
        setRuns([sampleRun])
      }
    } catch (err) {
      console.error(err)
      setRuns([sampleRun])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayroll()
  }, [])

  const handleGeneratePayroll = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      })

      if (res.ok) {
        fetchPayroll()
        alert('Monthly payroll processed and dispatches recorded!')
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to generate payroll')
      }
    } catch (err: any) {
      alert(err.message || 'Error generating payroll')
    } finally {
      setGenerating(false)
    }
  }

  const latestRun = runs[0] || sampleRun
  const filteredSlips = (latestRun.slips || []).filter(
    (s) =>
      s.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              Staff Payroll, Allowances & Remittances Ledger
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Monthly faculty remuneration, statutory 8% pension contributions, PAYE tax withholding, and bank payment schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5"
            >
              <option value="February 2026">February 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="April 2026">April 2026</option>
            </select>

            <Button
              onClick={handleGeneratePayroll}
              disabled={generating}
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Payroll Run
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total Gross Remuneration</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              ₦{(latestRun.totalGrossKobo / 100).toLocaleString()}
            </p>
            <span className="text-[10px] text-gray-400">Basic + Housing + Transport</span>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Statutory Deductions (Pension + Tax)</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ₦{(latestRun.totalDeductionsKobo / 100).toLocaleString()}
            </p>
            <span className="text-[10px] text-red-500 font-medium">8% Pension & PAYE</span>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Total Net Pay Commitment</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₦{(latestRun.totalNetKobo / 100).toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">Ready for Bank Export</span>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium">Salaried Staff Members</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {latestRun.staffCount} Personnel
            </p>
            <span className="text-[10px] text-gray-400">{latestRun.month}</span>
          </Card>
        </div>

        {/* Staff Payslip Table */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Staff Remuneration Registry & Payslips ({filteredSlips.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search staff or staff ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Staff ID</TableHead>
                  <TableHead className="text-xs">Faculty Name</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs text-right">Basic (NGN)</TableHead>
                  <TableHead className="text-xs text-right">Allowances</TableHead>
                  <TableHead className="text-xs text-right">Deductions</TableHead>
                  <TableHead className="text-xs text-right">Net Pay (NGN)</TableHead>
                  <TableHead className="text-xs text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlips.map((s) => (
                  <TableRow key={s.staffNo} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40">
                    <TableCell className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {s.staffNo}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {s.staffName}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{s.department}</TableCell>
                    <TableCell className="text-xs text-right font-mono">
                      ₦{(s.baseSalaryKobo / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-600">
                      +₦{((s.housingKobo + s.transportKobo) / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-red-600">
                      -₦{(s.totalDeductionsKobo / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-right font-bold text-gray-900 dark:text-gray-100 font-mono">
                      ₦{(s.netPayKobo / 100).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSlip(s)}
                        className="text-xs h-7 text-emerald-600 border-emerald-200"
                      >
                        Payslip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payslip View Modal */}
        {activeSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Official Staff Payslip: {activeSlip.staffName}
                  </CardTitle>
                  <p className="text-xs text-gray-400">
                    {activeSlip.staffNo} &bull; {latestRun.month}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSlip(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Basic Monthly Salary:</span>
                    <span className="font-mono font-medium">₦{(activeSlip.baseSalaryKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Housing Allowance (20%):</span>
                    <span className="font-mono text-emerald-600">+₦{(activeSlip.housingKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transport Allowance (10%):</span>
                    <span className="font-mono text-emerald-600">+₦{(activeSlip.transportKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Total Gross Earnings:</span>
                    <span className="font-mono">₦{(activeSlip.grossKobo / 100).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Statutory Deductions:</p>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pension Scheme (8%):</span>
                    <span className="font-mono text-red-600">-₦{(activeSlip.pensionKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">PAYE Income Tax:</span>
                    <span className="font-mono text-red-600">-₦{(activeSlip.taxKobo / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-red-600">-₦{(activeSlip.totalDeductionsKobo / 100).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg flex justify-between items-center text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  <span>Net Salary Payable:</span>
                  <span className="font-mono">₦{(activeSlip.netPayKobo / 100).toLocaleString()}</span>
                </div>

                <div className="pt-2 text-right">
                  <Button
                    size="sm"
                    onClick={() => setActiveSlip(null)}
                    className="text-xs bg-gray-900 text-white"
                  >
                    Close Slip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
