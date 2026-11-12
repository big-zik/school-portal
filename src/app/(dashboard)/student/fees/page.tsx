'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  ShieldCheck,
  Receipt,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface StudentFeeRecord {
  id: string
  termName: string
  totalKobo: number
  paidKobo: number
  status: 'PAID' | 'PARTIAL' | 'UNPAID'
  dueDate: string
  items: Array<{ name: string; amountKobo: number }>
}

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState<StudentFeeRecord[]>([
    {
      id: 'INV-2026-001',
      termName: '2nd Term 2025/2026',
      totalKobo: 25000000, // 250,000 NGN
      paidKobo: 25000000,
      status: 'PAID',
      dueDate: '2026-02-15',
      items: [
        { name: 'Tuition Fee (Senior Secondary)', amountKobo: 18000000 },
        { name: 'ICT & STEM Robotics Laboratory', amountKobo: 3500000 },
        { name: 'Library & E-Resources Development', amountKobo: 1500000 },
        { name: 'PTA & Sports Levy', amountKobo: 2000000 },
      ],
    },
    {
      id: 'INV-2025-003',
      termName: '1st Term 2025/2026',
      totalKobo: 24500000,
      paidKobo: 24500000,
      status: 'PAID',
      dueDate: '2025-10-10',
      items: [
        { name: 'Tuition Fee', amountKobo: 18000000 },
        { name: 'Textbooks & Study Materials', amountKobo: 4500000 },
        { name: 'Medical Retainership', amountKobo: 2000000 },
      ],
    },
  ])

  const totalBilled = invoices.reduce((acc, i) => acc + i.totalKobo, 0)
  const totalPaid = invoices.reduce((acc, i) => acc + i.paidKobo, 0)
  const totalBalance = totalBilled - totalPaid

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              School Fees & Clearance Status
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify your term billing records, bursary receipts, and examination clearance passes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Bursary Cleared
            </Badge>
          </div>
        </div>

        {/* Clearance Alert Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Account in Good Standing</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                All tuition and laboratory charges for the current academic session have been settled by your guardian. Examination result viewing is fully unlocked.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium">Total Session Charges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                ₦{(totalBilled / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium">Total Amount Paid</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₦{(totalPaid / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium">Outstanding Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                ₦{(totalBalance / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Term Invoices & Fee Statements
          </h2>

          {invoices.map((inv) => (
            <Card key={inv.id} className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {inv.termName}
                  </CardTitle>
                  <p className="text-[11px] text-gray-400 font-mono">Invoice Reference: {inv.id}</p>
                </div>
                <Badge className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {inv.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Fee Item Description</TableHead>
                      <TableHead className="text-xs text-right">Amount (NGN)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono text-gray-700 dark:text-gray-300">
                          ₦{(item.amountKobo / 100).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t font-bold">
                      <TableCell className="text-xs">Total Settled</TableCell>
                      <TableCell className="text-xs text-right text-emerald-600 font-mono">
                        ₦{(inv.paidKobo / 100).toLocaleString()}
                      </TableCell>
                    </TableRow>
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
