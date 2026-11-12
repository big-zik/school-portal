'use client'

import React, { useState, useEffect } from 'react'
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Building,
  User,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Loader2,
  Info,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatDate } from '@/lib/utils'

export default function ParentSupportPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Academic & Assessment')
  const [childName, setChildName] = useState('Daniel Johnson (Grade 10)')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [description, setDescription] = useState('')

  const fallbackTickets = [
    {
      id: 't-101',
      subject: 'Clarification regarding Chemistry Titration Practical Schedule',
      description: '[Category: Academic & Assessment] [Child: Daniel Johnson (Grade 10)]\n\nGood day, I would like to confirm if the lab coat specified in the circular must carry the school crest, or if a standard plain white cotton coat is acceptable. Thank you.',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      createdAt: '2025-02-06T11:00:00Z',
      reply: 'Plain white cotton laboratory coats are acceptable as long as they reach the knee and are 100% cotton. — Academic Office',
    },
    {
      id: 't-102',
      subject: 'School Bus Morning Pickup Time Adjustment for Lekki Route',
      description: '[Category: Transport & Bus Route] [Child: Daniel Johnson (Grade 10)]\n\nThe bus driver has been arriving at 06:40 AM which is 20 minutes earlier than scheduled. Kindly confirm if the route timetable has changed.',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: '2025-02-10T08:30:00Z',
    },
  ]

  useEffect(() => {
    async function loadTickets() {
      setLoading(true)
      try {
        const res = await fetch('/api/support/tickets')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setTickets(json.data)
          } else {
            setTickets(fallbackTickets)
          }
        } else {
          setTickets(fallbackTickets)
        }
      } catch (e) {
        setTickets(fallbackTickets)
      } finally {
        setLoading(false)
      }
    }
    loadTickets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg('')
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          category,
          childName,
          priority,
          description,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setShowNewModal(false)
        setSuccessMsg('Your inquiry has been submitted! The administration desk will respond shortly.')
        setTickets((prev) => [json.data || { id: `t-${Date.now()}`, subject, description, status: 'OPEN', priority, createdAt: new Date().toISOString() }, ...prev])
        setSubject('')
        setDescription('')
      } else {
        alert(json.error || 'Failed to submit issue')
      }
    } catch (err: any) {
      alert(err.message || 'Error contacting support server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              School Helpdesk, Inquiries & Directory
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit issues or questions directly to school administration, track resolutions, and find official school contact lines
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowNewModal(true)}
            className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            <PlusCircle className="w-4 h-4" /> Submit Issue or Inquiry
          </Button>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="text-xs h-7">Dismiss</Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Tickets Log */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="py-3 px-5 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    My Submitted Inquiries & Issues
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px]">{tickets.length} Records</Badge>
              </CardHeader>
              <CardContent className="p-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400">
                    No active inquiries submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/80 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{t.subject}</h4>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                t.status === 'RESOLVED'
                                  ? 'success'
                                  : t.status === 'IN_PROGRESS'
                                  ? 'default'
                                  : 'warning'
                              }
                              className="text-[10px]"
                            >
                              {t.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {t.priority}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {t.description}
                        </p>

                        {t.reply && (
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200 mt-2 space-y-1">
                            <p className="font-bold flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Official School Response:
                            </p>
                            <p>{t.reply}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50 dark:border-gray-800">
                          <span>Ticket #{t.id}</span>
                          <span>Submitted on {formatDate(t.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Official School Directory Contacts */}
          <div className="space-y-4">
            <Card className="border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:to-gray-900">
              <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900 dark:text-blue-200">
                  <Building className="w-4 h-4 text-blue-600" />
                  Official School Directory
                </CardTitle>
                <p className="text-[11px] text-gray-500">Working Hours: Mon – Fri (07:30 AM – 04:30 PM)</p>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Principal Desk */}
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Office of the Principal</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-blue-600" /> +234 1 234 5678 (Ext 101)
                  </p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-blue-600" /> principal@chosengenerationschool.edu
                  </p>
                </div>

                {/* Bursar Desk */}
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Bursary & Accounts Desk</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-600" /> +234 1 234 5679 (Ext 104)
                  </p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-emerald-600" /> bursar@chosengenerationschool.edu
                  </p>
                </div>

                {/* Transport Coordinator */}
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">School Transport Officer</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-amber-600" /> +234 802 333 4441 (Hotline)
                  </p>
                </div>

                {/* Sick Bay / Nurse */}
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">Medical Clinic & Sick Bay</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-red-600" /> +234 1 234 5680 (24/7 Boarding Line)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal: Submit New Inquiry */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95">
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" /> Submit School Issue / Inquiry
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Your message will be routed directly to the appropriate department desk
                </p>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                      >
                        <option>Academic & Assessment</option>
                        <option>Bursary & Fee Discrepancy</option>
                        <option>Transport & Bus Service</option>
                        <option>Medical & Sick Bay Welfare</option>
                        <option>Disciplinary & Behavior</option>
                        <option>General Feedback & Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Urgency Level</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium / Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Related Child</label>
                    <Input
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subject Summary</label>
                    <Input
                      required
                      placeholder="e.g. Bus pickup time confirmation for Lekki route"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Detailed Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Provide full details of your concern or question so our team can assist promptly..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2.5 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowNewModal(false)} className="text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="text-xs bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
