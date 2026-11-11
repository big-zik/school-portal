'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { CreditCard, Download, Search, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminFeesManagementPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchFees = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/fees?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setInvoices(json.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch fees', e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  const filteredInvoices = invoices.filter((inv) => {
    if (!search) return true
    const q = search.toLowerCase()
    const invNum = inv.invoiceNumber?.toLowerCase() || ''
    const stuName = inv.student?.user?.name?.toLowerCase() || ''
    return invNum.includes(q) || stuName.includes(q)
  })

  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0)
  const totalPaid = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0)
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.balanceAmount || 0), 0)

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
              View student fee records, track settlement status, and monitor collection rate
            </p>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Total Billed Invoices</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(totalBilled)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">{invoices.length} invoices generated</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Collected Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(totalPaid)}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1">
                {totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : 0}% collection rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Outstanding Balance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {formatCurrency(totalOutstanding)}
              </h3>
              <p className="text-[11px] text-amber-600 mt-1">Pending parent settlement</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices by student name or invoice number..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partially Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading fee records...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                No invoices found matching current criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Invoice #</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Paid</TableHead>
                    <TableHead className="text-xs">Balance</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <TableCell className="font-mono text-xs font-semibold text-blue-600">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {inv.student?.user?.name || 'Unknown Student'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {inv.student?.currentClass?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-emerald-600">
                        {formatCurrency(inv.paidAmount)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-amber-600">
                        {formatCurrency(inv.balanceAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            inv.status === 'PAID'
                              ? 'success'
                              : inv.status === 'PARTIAL'
                              ? 'warning'
                              : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
