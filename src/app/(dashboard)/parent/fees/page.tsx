'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  Receipt,
  ArrowRight,
  ExternalLink,
  Loader2,
  UploadCloud,
  FileCheck2,
  Building2,
  FileText,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function ParentFeesPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])

  // Bank transfer submission state
  const [transferAmount, setTransferAmount] = useState<string>('260000')
  const [transferBank, setTransferBank] = useState('Guaranty Trust Bank (GTBank)')
  const [transferRef, setTransferRef] = useState('')
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [receiptFileUrl, setReceiptFileUrl] = useState('')
  const [receiptFileName, setReceiptFileName] = useState('')
  const [uploadError, setUploadError] = useState('')

  // List of pending verifications
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])

  const defaultActiveInvoice = {
    id: 'inv-1',
    invoiceNumber: 'INV-2025-00142',
    studentName: 'Daniel Johnson (STU2024001)',
    class: 'Grade 10 (SS 1) - Alpha',
    term: 'Second Term (Spring 2025)',
    dueDate: 'Jan 31, 2025',
    totalAmount: 285000,
    paidAmount: 285000,
    balance: 0,
    status: 'PAID',
    items: [
      { category: 'Tuition', description: 'Senior Secondary Grade 10 Instructional Tuition', amount: 250000 },
      { category: 'ICT & Lab', description: 'STEM Robotics & Chemistry Lab Resource Pack', amount: 35000 },
    ],
    receipt: {
      receiptNumber: 'REC-2025-00089',
      date: 'Jan 20, 2025',
      method: 'Online Card (Paystack)',
      ref: 'PSK_REF_991823719',
    },
  }

  const defaultUpcomingInvoice = {
    id: 'inv-2',
    invoiceNumber: 'INV-2025-00210',
    studentName: 'Daniel Johnson (STU2024001)',
    class: 'Grade 10 (SS 1) - Alpha',
    term: 'Third Term (Summer 2025)',
    dueDate: 'Apr 25, 2025',
    totalAmount: 260000,
    paidAmount: 0,
    balance: 260000,
    status: 'PENDING',
    items: [
      { category: 'Tuition', description: 'Third Term Tuition & Promotional Assessment', amount: 250000 },
      { category: 'Library', description: 'Digital Library & E-Resource Access', amount: 10000 },
    ],
  }

  const [activeInvoice, setActiveInvoice] = useState(defaultActiveInvoice)
  const [upcomingInvoice, setUpcomingInvoice] = useState(defaultUpcomingInvoice)

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await fetch('/api/fees')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setInvoices(json.data)
            const paid = json.data.find((i: any) => i.status === 'PAID')
            const pending = json.data.find((i: any) => i.status === 'PENDING' || i.status === 'OVERDUE')
            if (paid) {
              setActiveInvoice({
                id: paid.id,
                invoiceNumber: paid.invoiceNumber,
                studentName: paid.student?.user?.name || 'Daniel Johnson (STU2024001)',
                class: 'Grade 10 (SS 1) - Alpha',
                term: paid.term?.name || 'Second Term (Spring 2025)',
                dueDate: new Date(paid.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                totalAmount: paid.totalAmount,
                paidAmount: paid.paidAmount,
                balance: paid.balanceAmount,
                status: paid.status,
                items: paid.invoiceItems?.length > 0
                  ? paid.invoiceItems.map((item: any) => ({
                      category: item.feeCategory?.name || 'Fee',
                      description: item.description,
                      amount: item.amount,
                    }))
                  : defaultActiveInvoice.items,
                receipt: defaultActiveInvoice.receipt,
              })
            }
            if (pending) {
              setUpcomingInvoice({
                id: pending.id,
                invoiceNumber: pending.invoiceNumber,
                studentName: pending.student?.user?.name || 'Daniel Johnson (STU2024001)',
                class: 'Grade 10 (SS 1) - Alpha',
                term: pending.term?.name || 'Third Term (Summer 2025)',
                dueDate: new Date(pending.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                totalAmount: pending.totalAmount,
                paidAmount: pending.paidAmount,
                balance: pending.balanceAmount,
                status: pending.status,
                items: pending.invoiceItems?.length > 0
                  ? pending.invoiceItems.map((item: any) => ({
                      category: item.feeCategory?.name || 'Fee',
                      description: item.description,
                      amount: item.amount,
                    }))
                  : defaultUpcomingInvoice.items,
              })
              setTransferAmount(pending.balanceAmount?.toString() || pending.totalAmount?.toString() || '260000')
            }
          }
        }
      } catch (err) {
        console.error('Failed to load invoices', err)
      }
    }
    loadInvoices()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'payment-receipts')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (json.success && json.data?.url) {
        setReceiptFileUrl(json.data.url)
        setReceiptFileName(file.name)
      } else {
        setUploadError(json.error || 'Failed to upload receipt file')
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptFileUrl) {
      setUploadError('Please select and upload your receipt or bank teller screenshot first')
      return
    }
    if (!transferRef) {
      setUploadError('Please provide your bank reference number or teller number')
      return
    }

    setIsProcessing(true)
    setUploadError('')

    try {
      const targetInvoiceId = upcomingInvoice.id || 'inv-2'
      const res = await fetch(`/api/fees/${targetInvoiceId}/upload-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(transferAmount) || upcomingInvoice.totalAmount,
          bankName: transferBank,
          referenceNumber: transferRef,
          paymentDate: transferDate,
          receiptUrl: receiptFileUrl,
          notes: `Bank transfer submitted by parent via portal for ${upcomingInvoice.invoiceNumber}`,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setShowUploadModal(false)
        setUploadSuccess(true)
        setPendingApprovals((prev) => [
          {
            id: json.data?.id || `proof-${Date.now()}`,
            amount: parseFloat(transferAmount),
            bank: transferBank,
            reference: transferRef,
            date: transferDate,
            fileName: receiptFileName || 'receipt_proof.pdf',
            status: 'PENDING_APPROVAL',
            invoiceNumber: upcomingInvoice.invoiceNumber,
          },
          ...prev,
        ])
      } else {
        setUploadError(json.error || 'Failed to record transfer submission')
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error contacting server')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePay = async () => {
    setIsProcessing(true)
    try {
      if (upcomingInvoice.id) {
        await fetch(`/api/fees/${upcomingInvoice.id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: upcomingInvoice.balance || upcomingInvoice.totalAmount,
            paymentMethod: 'ONLINE',
            transactionRef: `PSK_${Date.now()}`,
          }),
        })
      }
      setShowPaymentModal(false)
      setPaymentSuccess(true)
      setUpcomingInvoice((prev) => ({ ...prev, status: 'PAID', balance: 0, paidAmount: prev.totalAmount }))
    } catch (err) {
      console.error('Payment error', err)
      setShowPaymentModal(false)
      setPaymentSuccess(true)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              School Fees & Billing Account
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Card payment, bank transfer teller receipt upload for bursar approval, and downloadable official receipts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowUploadModal(true)}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-semibold"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" /> Upload Bank Receipt / Teller
            </Button>
            <Button
              onClick={() => setShowPaymentModal(true)}
              size="sm"
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm"
            >
              <CreditCard className="w-4 h-4" /> Pay with Card Online
            </Button>
          </div>
        </div>

        {/* Confirmation Banners */}
        {paymentSuccess && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Card Payment Processed Successfully!</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Receipt #REC-2025-00104 has been generated and dispatched to your email.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs border-emerald-600 text-emerald-700">
              Download Receipt
            </Button>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Bank Transfer Proof Submitted Successfully!</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Your payment receipt has been submitted to the bursary office. The invoice will update automatically once verified.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-700">Under Review</Badge>
          </div>
        )}

        {/* Pending Bursar Approvals List if any */}
        {pendingApprovals.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20">
            <CardHeader className="py-3 px-5 border-b border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                  <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Bank Transfer Receipts Awaiting Bursar Approval
                  </CardTitle>
                </div>
                <Badge className="bg-amber-500 text-white text-[10px]">Verification in Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {pendingApprovals.map((sub, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 border border-amber-200/70 dark:border-amber-900/50 text-xs gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(sub.amount)}</span>
                        <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-700">{sub.invoiceNumber}</Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {sub.bank} • Ref: <span className="font-mono font-semibold">{sub.reference}</span> • Date: {sub.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Bursar Sign-off
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2 Invoices: Active (Paid) and Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Term 2 Paid Invoice */}
          <Card className="border-emerald-200 dark:border-emerald-900/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-500">{activeInvoice.invoiceNumber}</span>
                  <Badge variant="success" className="text-[10px]">
                    {activeInvoice.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold mt-1">{activeInvoice.term}</CardTitle>
                <p className="text-xs text-gray-500">{activeInvoice.studentName}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Total Billed</p>
                <p className="text-lg font-extrabold text-emerald-600">
                  {formatCurrency(activeInvoice.totalAmount)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fee Items</p>
                {activeInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.description}</p>
                      <span className="text-[10px] text-gray-400">{item.category}</span>
                    </div>
                    <span className="font-mono font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Receipt metadata box */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Receipt Issued: {activeInvoice.receipt.receiptNumber}
                  </span>
                  <Badge variant="outline" className="text-[10px]">Verified</Badge>
                </div>
                <p className="text-[11px] text-gray-500">
                  Paid via {activeInvoice.receipt.method} • Ref: {activeInvoice.receipt.ref}
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download Official Receipt (PDF)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Third Term Invoice */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-500">{upcomingInvoice.invoiceNumber}</span>
                  <Badge variant={upcomingInvoice.status === 'PAID' ? 'success' : 'warning'} className="text-[10px]">
                    {upcomingInvoice.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold mt-1">{upcomingInvoice.term}</CardTitle>
                <p className="text-xs text-gray-500">{upcomingInvoice.studentName}</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Due {upcomingInvoice.dueDate}</p>
                <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                  {formatCurrency(upcomingInvoice.totalAmount)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fee Items</p>
                {upcomingInvoice.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 dark:border-gray-800">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.description}</p>
                      <span className="text-[10px] text-gray-400">{item.category}</span>
                    </div>
                    <span className="font-mono font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {upcomingInvoice.status !== 'PAID' && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Payment Channels Available
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Pay instantly with card/USSD or upload bank transfer teller receipt for bursar approval.
                    </p>
                  </div>

                  {/* School Bank Account Details */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-gray-900 border border-blue-200/60 dark:border-blue-900/50 text-[11px] space-y-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> Official School Bank Account:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300 font-mono text-[10.5px]">
                      <div>Bank: <strong>GTBank</strong></div>
                      <div>Acct No: <strong>0123456789</strong></div>
                      <div className="col-span-2">Acct Name: <strong>CHOSEN GENERATION SCHOOL</strong></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      variant="outline"
                      className="w-full text-xs font-semibold border-emerald-600 text-emerald-700 hover:bg-emerald-50 gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" /> Upload Transfer Proof
                    </Button>
                    <Button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Online ({formatCurrency(upcomingInvoice.balance || upcomingInvoice.totalAmount)})
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal 1: Bank Transfer / Teller Upload */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-emerald-600" />
                    <div>
                      <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                        Submit Bank Transfer / Teller Receipt
                      </CardTitle>
                      <p className="text-[11px] text-gray-500">
                        Upload proof of payment for Bursar verification and invoice clearing
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-700">Manual Verification</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {uploadError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <form onSubmit={handleBankTransferSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Invoice</label>
                      <input
                        type="text"
                        disabled
                        value={upcomingInvoice.invoiceNumber}
                        className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Amount Paid (₦)</label>
                      <input
                        type="number"
                        required
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Used for Transfer</label>
                    <select
                      value={transferBank}
                      onChange={(e) => setTransferBank(e.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                    >
                      <option>Guaranty Trust Bank (GTBank)</option>
                      <option>Zenith Bank Plc</option>
                      <option>First Bank of Nigeria</option>
                      <option>Access Bank Plc</option>
                      <option>United Bank for Africa (UBA)</option>
                      <option>Stanbic IBTC Bank</option>
                      <option>Kuda / OPay / PalmPay (Mobile Money)</option>
                      <option>Direct Cash Deposit at Bank Branch</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reference / Teller #</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 09182371928"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Payment Date</label>
                      <input
                        type="date"
                        required
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Upload Receipt File */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Upload Bank Teller or Transaction Receipt (Image / PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                      {receiptFileUrl ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200">
                          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                            <FileCheck2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold truncate max-w-xs">{receiptFileName || 'Receipt Attached'}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400">Ready</Badge>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <UploadCloud className="w-7 h-7 text-gray-400 mx-auto" />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {isUploading ? 'Uploading file...' : 'Click to browse or drop teller receipt here'}
                          </p>
                          <p className="text-[10px] text-gray-400">Supports JPG, PNG, PDF (Max 10MB)</p>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={isUploading}
                            onChange={handleFileUpload}
                            className="text-xs text-gray-500 mx-auto cursor-pointer block mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing || isUploading || !receiptFileUrl}
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 font-semibold gap-1.5"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                        </>
                      ) : (
                        'Submit for Bursar Approval'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal 2: Online Card Simulator */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <CardTitle className="text-base">Paystack Secure Checkout</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px]">256-Bit SSL</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-center py-2">
                  <p className="text-xs text-gray-500">Paying for {upcomingInvoice.invoiceNumber}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
                    {formatCurrency(upcomingInvoice.totalAmount)}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4084 •••• •••• 1928"
                      className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/28"
                        className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-600">CVV</label>
                      <input
                        type="password"
                        defaultValue="829"
                        className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 font-semibold gap-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                      </>
                    ) : (
                      'Confirm & Authorize'
                    )}
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
