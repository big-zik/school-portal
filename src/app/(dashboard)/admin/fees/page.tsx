'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileCheck2,
  Eye,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  Building,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminFeesManagementPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'approvals' | 'debtors'>('invoices')
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Bank Transfer Approvals State
  const [approvals, setApprovals] = useState<any[]>([])
  const [approvalsLoading, setApprovalsLoading] = useState(false)
  const [selectedProof, setSelectedProof] = useState<any | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string>('')
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

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

  const fetchApprovals = useCallback(async () => {
    setApprovalsLoading(true)
    try {
      const res = await fetch('/api/fees/approvals?status=PENDING')
      const json = await res.json()
      if (json.success) {
        setApprovals(json.data || [])
      }
    } catch (e) {
      console.error('Failed to fetch approvals', e)
    } finally {
      setApprovalsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFees()
    fetchApprovals()
  }, [fetchFees, fetchApprovals])

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId)
    setActionSuccess('')
    try {
      const res = await fetch('/api/fees/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action: 'APPROVE' }),
      })
      const json = await res.json()
      if (json.success) {
        setActionSuccess(`Payment approved! Official Receipt #${json.data.receipt?.receiptNumber || ''} generated.`)
        fetchApprovals()
        fetchFees()
      } else {
        alert(json.error || 'Failed to approve payment')
      }
    } catch (e: any) {
      alert(e.message || 'Error processing approval')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectingPayment) return
    setProcessingId(rejectingPayment.id)
    try {
      const res = await fetch('/api/fees/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: rejectingPayment.id,
          action: 'REJECT',
          notes: rejectionReason || 'Payment proof could not be verified on school bank statement',
        }),
      })
      const json = await res.json()
      if (json.success) {
        setRejectionModalOpen(false)
        setRejectingPayment(null)
        setRejectionReason('')
        setActionSuccess('Payment proof rejected. The parent has been notified.')
        fetchApprovals()
      } else {
        alert(json.error || 'Failed to reject payment')
      }
    } catch (e: any) {
      alert(e.message || 'Error processing rejection')
    } finally {
      setProcessingId(null)
    }
  }

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
  const debtors = invoices.filter((inv) => (inv.balanceAmount || 0) > 0)

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Fee Structures & Bursary Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review invoices, verify parent bank transfer teller uploads, and issue official receipts
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Button
              onClick={() => setActiveTab('invoices')}
              size="sm"
              variant={activeTab === 'invoices' ? 'default' : 'ghost'}
              className="text-xs font-semibold h-8"
            >
              All Invoices ({invoices.length})
            </Button>
            <Button
              onClick={() => setActiveTab('approvals')}
              size="sm"
              variant={activeTab === 'approvals' ? 'default' : 'ghost'}
              className="text-xs font-semibold h-8 gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Teller Approvals
              {approvals.length > 0 && (
                <Badge variant="warning" className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-amber-500 text-white">
                  {approvals.length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => setActiveTab('debtors')}
              size="sm"
              variant={activeTab === 'debtors' ? 'default' : 'ghost'}
              className="text-xs font-semibold h-8 gap-1.5 text-amber-600"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Debtors List ({debtors.length})
            </Button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActionSuccess('')} className="text-xs h-7">Dismiss</Button>
          </div>
        )}

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Total Billed Invoices</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(totalBilled)}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">{invoices.length} active invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Verified Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(totalPaid)}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1">
                {totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : 0}% settled collection
              </p>
            </CardContent>
          </Card>

          <Card className={approvals.length > 0 ? "border-amber-300 dark:border-amber-800" : ""}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-gray-500">Awaiting Bursar Verification</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {approvals.length} Pending
              </h3>
              <p className="text-[11px] text-amber-600 mt-1">
                {approvals.length > 0 ? 'Action required in Approvals Queue' : 'All teller receipts cleared'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TAB 1: ALL INVOICES */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
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
                    <Download className="w-3.5 h-3.5" /> Export Excel
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
                        <TableHead className="text-xs">Billed</TableHead>
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
        )}

        {/* TAB 2: BANK TRANSFER APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-amber-600" />
                    Pending Bank Transfer & Teller Verifications
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Compare parent submitted teller references against bank statement before issuing official receipts
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={fetchApprovals} className="text-xs gap-1.5">
                  Refresh Queue
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                {approvalsLoading ? (
                  <div className="flex items-center justify-center py-12 text-sm text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading pending submissions...
                  </div>
                ) : approvals.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-500 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-gray-800 dark:text-gray-200">No Pending Bank Transfers</p>
                    <p className="text-xs text-gray-400">All submitted proof of payment receipts have been reviewed.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Invoice & Date</TableHead>
                        <TableHead className="text-xs">Student & Class</TableHead>
                        <TableHead className="text-xs">Parent / Depositor</TableHead>
                        <TableHead className="text-xs">Amount Paid</TableHead>
                        <TableHead className="text-xs">Bank & Reference #</TableHead>
                        <TableHead className="text-xs">Teller Proof</TableHead>
                        <TableHead className="text-xs text-right">Bursar Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvals.map((pay) => {
                        let meta: any = {}
                        try {
                          meta = JSON.parse(pay.gatewayRef || '{}')
                        } catch {}

                        return (
                          <TableRow key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                            <TableCell>
                              <div className="font-mono text-xs font-bold text-blue-600">{pay.invoice?.invoiceNumber}</div>
                              <span className="text-[10px] text-gray-400">{formatDate(pay.paymentDate)}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                {pay.student?.user?.name}
                              </div>
                              <span className="text-[11px] text-gray-500">{pay.student?.currentClass?.name || 'Class'}</span>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                                {meta.submittedByName || pay.paidBy?.name || 'Parent'}
                              </div>
                              <span className="text-[10px] text-gray-400">{pay.paidBy?.email || pay.paidBy?.phone}</span>
                            </TableCell>
                            <TableCell className="font-extrabold text-xs text-emerald-600">
                              {formatCurrency(pay.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                {meta.bankName || 'Bank Transfer'}
                              </div>
                              <span className="font-mono text-[11px] text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {pay.referenceNumber || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {meta.receiptUrl ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedProof({ ...pay, meta })}
                                  className="text-[11px] h-7 gap-1 border-blue-400 text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="w-3 h-3" /> View Teller
                                </Button>
                              ) : (
                                <span className="text-[10px] text-gray-400">No Image</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  disabled={processingId === pay.id}
                                  onClick={() => handleApprove(pay.id)}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1 px-2.5"
                                >
                                  {processingId === pay.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingId === pay.id}
                                  onClick={() => {
                                    setRejectingPayment(pay)
                                    setRejectionModalOpen(true)
                                  }}
                                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50 gap-1 px-2"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: DEBTORS & DEFAULTERS LIST */}
        {activeTab === 'debtors' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    School Fee Debtors & Defaulters Registry
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Students with active unpaid balances across all academic cohorts ({debtors.length} total defaulters)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert(`Broadcasting payment reminder SMS to ${debtors.length} debtor parents...`)}
                    className="text-xs font-semibold gap-1.5 border-amber-400 text-amber-800 hover:bg-amber-50"
                  >
                    Send Bulk SMS Reminders
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export Debtors Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {debtors.length === 0 ? (
                  <div className="text-center py-12 text-sm text-gray-500 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Zero Outstanding Debtors</p>
                    <p className="text-xs text-gray-400">All student invoices have been fully cleared and verified.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Student Name</TableHead>
                        <TableHead className="text-xs">Class Arm</TableHead>
                        <TableHead className="text-xs">Invoice #</TableHead>
                        <TableHead className="text-xs">Total Billed</TableHead>
                        <TableHead className="text-xs">Paid</TableHead>
                        <TableHead className="text-xs">Outstanding Debt</TableHead>
                        <TableHead className="text-xs">Due Date</TableHead>
                        <TableHead className="text-xs text-right">Reminder Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debtors.map((debtor) => (
                        <TableRow key={debtor.id} className="hover:bg-amber-50/30 dark:hover:bg-gray-800/40">
                          <TableCell className="font-bold text-xs text-gray-900 dark:text-gray-100">
                            {debtor.student?.user?.name || 'Student'}
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                            {debtor.student?.currentClass?.name || 'Class'}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-blue-600">
                            {debtor.invoiceNumber}
                          </TableCell>
                          <TableCell className="text-xs text-gray-800 dark:text-gray-200 font-semibold">
                            {formatCurrency(debtor.totalAmount)}
                          </TableCell>
                          <TableCell className="text-xs text-emerald-600 font-medium">
                            {formatCurrency(debtor.paidAmount)}
                          </TableCell>
                          <TableCell className="text-xs font-black text-red-600 font-mono">
                            {formatCurrency(debtor.balanceAmount)}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {formatDate(debtor.dueDate || debtor.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alert(`Payment reminder notification dispatched to parent of ${debtor.student?.user?.name || 'student'}.`)}
                              className="h-7 text-[11px] font-semibold border-amber-400 text-amber-700 hover:bg-amber-50"
                            >
                              Send Reminder
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal: View Receipt / Teller Document */}
        {selectedProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
              <CardHeader className="py-3 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">Bank Transfer Proof Document</CardTitle>
                  <p className="text-[11px] text-gray-500">
                    {selectedProof.student?.user?.name} • Ref: {selectedProof.referenceNumber} • {formatCurrency(selectedProof.amount)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedProof(null)} className="h-7 w-7 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                {selectedProof.meta?.receiptUrl?.endsWith('.pdf') ? (
                  <iframe
                    src={selectedProof.meta.receiptUrl}
                    className="w-full h-96 rounded-lg border border-gray-200"
                    title="Receipt PDF"
                  />
                ) : (
                  <img
                    src={selectedProof.meta?.receiptUrl}
                    alt="Proof of Payment"
                    className="max-h-[60vh] max-w-full rounded-lg object-contain border border-gray-200 shadow-md"
                  />
                )}
                <div className="w-full pt-3 flex items-center justify-between text-xs">
                  <a
                    href={selectedProof.meta?.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open full size in new tab
                  </a>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const id = selectedProof.id
                        setSelectedProof(null)
                        handleApprove(id)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm & Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal: Rejection Reason */}
        {rejectionModalOpen && rejectingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Reject Payment Proof
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Provide reason for rejecting transfer ref <strong>{rejectingPayment.referenceNumber}</strong> ({formatCurrency(rejectingPayment.amount)})
                </p>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Rejection Reason (Parent will see this)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 text-xs"
                    placeholder="e.g. Transaction reference not found on school bank statement; please re-upload clear proof."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setRejectionModalOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleRejectConfirm} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
                    Confirm Rejection
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
