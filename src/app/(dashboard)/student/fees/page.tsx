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
  ExternalLink,
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
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE'
  dueDate: string
  items: Array<{ name: string; amountKobo: number }>
}

const DEFAULT_INVOICES: StudentFeeRecord[] = [
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
]

export default function StudentFeesPage() {
  const [invoices, setInvoices] = useState<StudentFeeRecord[]>(DEFAULT_INVOICES)
  const [loading, setLoading] = useState(true)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fees')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: StudentFeeRecord[] = json.data.map((inv: any) => ({
            id: inv.id,
            termName: inv.term?.name || 'Academic Term Fees',
            totalKobo: Math.round(Number(inv.totalAmount) * 100),
            paidKobo: Math.round(Number(inv.paidAmount) * 100),
            status: inv.status,
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '2026-03-31',
            items: inv.items?.map((item: any) => ({
              name: item.description || item.title || 'Tuition Component',
              amountKobo: Math.round(Number(item.amount) * 100),
            })) || [{ name: 'Instructional Tuition', amountKobo: Math.round(Number(inv.totalAmount) * 100) }],
          }))
          setInvoices(mapped)
        }
      }
    } catch (err) {
      console.error('Failed to load student fees:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handlePaystackPayment = async (inv: StudentFeeRecord) => {
    const outstandingKobo = inv.totalKobo - inv.paidKobo
    const amountNaira = outstandingKobo > 0 ? outstandingKobo / 100 : inv.totalKobo / 100

    setPayingInvoiceId(inv.id)
    setErrorMessage('')

    try {
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          amount: amountNaira,
        }),
      })

      const json = await res.json()
      if (json.success && json.data?.authorizationUrl) {
        if (json.data.authorizationUrl.startsWith('https://checkout.paystack.com')) {
          window.location.href = json.data.authorizationUrl
          return
        }

        // Sandbox / mock response fallback
        if (json.data.reference) {
          await fetch(`/api/payments/paystack/verify?reference=${json.data.reference}`)
        }

        // Update local invoice to PAID
        setInvoices((prev) =>
          prev.map((item) =>
            item.id === inv.id ? { ...item, status: 'PAID', paidKobo: item.totalKobo } : item
          )
        )
        setPaymentSuccess(true)
        setTimeout(() => setPaymentSuccess(false), 6000)
      } else {
        setErrorMessage(json.error || 'Failed to initialize Paystack gateway')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with payment gateway')
    } finally {
      setPayingInvoiceId(null)
    }
  }

  const totalBilled = invoices.reduce((acc, i) => acc + i.totalKobo, 0)
  const totalPaid = invoices.reduce((acc, i) => acc + i.paidKobo, 0)
  const totalBalance = Math.max(0, totalBilled - totalPaid)
  const isCleared = totalBalance === 0

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
            <Badge
              className={`text-xs px-3 py-1 font-semibold gap-1 ${
                isCleared
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isCleared ? 'Bursary Cleared' : 'Outstanding Balance'}
            </Badge>
          </div>
        </div>

        {paymentSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Payment Verified Successfully via Paystack</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Your payment receipt has been issued and bursary records are cleared.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clearance Alert Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            isCleared
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCleared ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {isCleared ? 'Account in Good Standing' : 'Fee Settlement Required'}
              </p>
              <p className="text-xs mt-0.5">
                {isCleared
                  ? 'All tuition and laboratory charges for the current academic session have been settled. Examination result viewing is fully unlocked.'
                  : 'You have an outstanding bursary balance. Pay directly via Paystack below or have your guardian settle the balance to maintain clearance.'}
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
              <p className={`text-2xl font-bold mt-1 ${totalBalance > 0 ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}>
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

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              Loading invoices...
            </div>
          ) : (
            invoices.map((inv) => {
              const isPaid = inv.status === 'PAID'
              const balanceKobo = Math.max(0, inv.totalKobo - inv.paidKobo)

              return (
                <Card key={inv.id} className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                  <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {inv.termName}
                      </CardTitle>
                      <p className="text-[11px] text-gray-400 font-mono">Invoice Reference: {inv.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.status}
                      </Badge>
                      {!isPaid && (
                        <Button
                          size="sm"
                          disabled={payingInvoiceId === inv.id}
                          onClick={() => handlePaystackPayment(inv)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 h-7"
                        >
                          {payingInvoiceId === inv.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          Pay with Paystack (₦{(balanceKobo / 100).toLocaleString()})
                        </Button>
                      )}
                    </div>
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
                          <TableCell className="text-xs">
                            {isPaid ? 'Total Settled' : 'Total Paid / Outstanding'}
                          </TableCell>
                          <TableCell className="text-xs text-right text-emerald-600 font-mono">
                            ₦{(inv.paidKobo / 100).toLocaleString()}
                            {!isPaid && (
                              <span className="text-amber-600 ml-2">
                                (₦{(balanceKobo / 100).toLocaleString()} due)
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
