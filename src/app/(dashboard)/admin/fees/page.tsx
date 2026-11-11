import React from 'react'
import { CreditCard, Download, PlusCircle, Search, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function AdminFeesManagementPage() {
  const invoices = [
    { invoiceNumber: 'INV-2025-00142', student: 'Daniel Johnson (STU2024001)', class: 'Grade 10 Alpha', amount: 285000, paid: 285000, balance: 0, status: 'PAID', date: 'Jan 20, 2025' },
    { invoiceNumber: 'INV-2025-00143', student: 'Amara Okafor (STU2024002)', class: 'Grade 10 Alpha', amount: 285000, paid: 285000, balance: 0, status: 'PAID', date: 'Jan 22, 2025' },
    { invoiceNumber: 'INV-2025-00144', student: 'David Adeleke (STU2024003)', class: 'Grade 10 Alpha', amount: 285000, paid: 150000, balance: 135000, status: 'PARTIAL', date: 'Jan 25, 2025' },
    { invoiceNumber: 'INV-2025-00145', student: 'Fatima Abubakar (STU2024004)', class: 'Grade 10 Alpha', amount: 285000, paid: 0, balance: 285000, status: 'OVERDUE', date: 'Jan 15, 2025' },
    { invoiceNumber: 'INV-2025-00146', student: 'Chukwudi Eze (STU2024005)', class: 'Grade 10 Alpha', amount: 285000, paid: 285000, balance: 0, status: 'PAID', date: 'Jan 18, 2025' },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Fee Structures & Invoicing Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create class fee bundles, generate bulk term invoices, verify bank settlements, and dispatch automated payment reminders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Create Fee Package
            </Button>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Total Billed Invoices</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(52700000)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">485 student packages generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Collected Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(48500000)}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1">92.0% collection rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Outstanding Balance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {formatCurrency(4200000)}
              </h3>
              <p className="text-[11px] text-amber-600 mt-1">Automated parent reminders sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Filter & Table */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Term 2 Student Invoices</CardTitle>
            <div className="w-64">
              <Input placeholder="Search invoice or student name..." className="text-xs h-8" />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Billed Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.invoiceNumber}>
                    <TableCell className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {inv.student}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{inv.class}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 font-bold">{formatCurrency(inv.paid)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-amber-600 font-bold">{formatCurrency(inv.balance)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'PARTIAL'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-xs h-7 text-blue-600">
                        View
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
