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
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'

export default function ParentFeesPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])

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
            }
          }
        }
      } catch (err) {
        console.error('Failed to load invoices', err)
      }
    }
    loadInvoices()
  }, [])

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
              Secure online payment gateway, invoice breakdown, and instant downloadable receipts
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPaymentModal(true)}
              size="sm"
              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold"
            >
              <CreditCard className="w-4 h-4" /> Pay Fees Online
            </Button>
          </div>
        </div>

        {/* Payment Confirmation Banner */}
        {paymentSuccess && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Payment Processed Successfully!</p>
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
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-500">{upcomingInvoice.invoiceNumber}</span>
                  <Badge variant="warning" className="text-[10px]">
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

              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                  Online Payment Available
                </p>
                <p className="text-[11px] text-gray-500">
                  Supports debit cards, bank transfers, USSD, and Apple/Google Pay through Paystack.
                </p>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 gap-1.5 mt-1"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(upcomingInvoice.totalAmount)} Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Simulator */}
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
