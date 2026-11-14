'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  ArrowRight,
  Home,
  MessageSquare,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState('Admissions & Entrance Exam')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          topic,
          message,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubmitted(true)
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
      } else {
        setSubmitError(data.error || 'Failed to submit inquiry')
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error connecting to school server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cgs-canvas)] text-[var(--cgs-text)] flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-[var(--cgs-navy)] text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[var(--cgs-sky)]" /> +234 (0) 800 CHOSEN SCH
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-[var(--cgs-sky)]" /> info@chosengeneration.edu.ng
            </span>
          </div>
          <div>
            <span>Chosen Generation Campus, Lagos, Nigeria &middot; Born to Excel</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--cgs-surface)]/95 border-b border-[var(--cgs-border)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[var(--cgs-tint)] border border-[var(--cgs-sky)]/40 flex items-center justify-center font-bold text-lg text-[var(--cgs-heading)] shadow-sm">
              CG
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[var(--cgs-heading)] leading-none">
                CHOSEN GENERATION
              </h1>
              <p className="text-[10px] text-[var(--cgs-primary)] uppercase tracking-wider font-semibold mt-1">
                Born to Excel
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">Home</Link>
            <Link href="/about" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">About</Link>
            <Link href="/admissions" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">Admissions</Link>
            <Link href="/news" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">News</Link>
            <Link href="/gallery" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">Gallery</Link>
            <Link href="/contact" className="text-[var(--cgs-primary)] font-semibold">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="h-10 px-5 rounded-lg font-semibold shadow-sm">
                School portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Header Banner */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <Badge className="bg-white/20 text-white border-0 text-xs">Reach Out to Us</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">We Are Here to Assist You</h2>
          <p className="text-xs md:text-sm text-blue-100 max-w-xl mx-auto">
            Have questions regarding admissions, fee structures, boarding facilities, or student transfers? Contact our administrative desk.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Campus Location & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Main Campus</p>
                    <p>42 Academic Way, Victoria Island, Lagos, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">Office Working Hours</p>
                    <p>Monday – Friday: 07:30 AM – 04:30 PM</p>
                    <p>Saturday (Admissions desk): 09:00 AM – 01:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Direct Telephone Extensions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">General Enquiries & Front Desk:</p>
                  <p className="text-blue-600 font-mono font-bold">+234 1 234 5678</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Admissions Registrar Hotline:</p>
                  <p className="text-blue-600 font-mono font-bold">+234 802 345 6789</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Bursary & Accounts Desk:</p>
                  <p className="text-blue-600 font-mono font-bold">+234 1 234 5679</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Send an Inquiry to the School Administration
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Fill in your details below and our admissions team will respond via email or phone within 24 business hours.
                </p>
              </CardHeader>

              <CardContent className="p-6">
                {submitted ? (
                  <div className="p-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in zoom-in-95">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Inquiry Dispatched Successfully!</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                      Thank you for contacting CHOSEN GENERATION SCHOOL. Our administrative officer has received your message and will be in touch with you shortly.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="text-xs border-emerald-600 text-emerald-700">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {submitError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your Full Name *</label>
                        <Input
                          required
                          placeholder="e.g. Mrs. Ngozi Okon"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-xs h-9.5"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address *</label>
                        <Input
                          type="email"
                          required
                          placeholder="parent@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-xs h-9.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number *</label>
                        <Input
                          type="tel"
                          required
                          placeholder="+234 802 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="text-xs h-9.5"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Inquiry Subject *</label>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="h-9.5 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs"
                        >
                          <option>Admissions & Entrance Exam</option>
                          <option>Fee Schedule & Bursary Payments</option>
                          <option>Boarding & Hostel Accommodation</option>
                          <option>School Bus Transport Routes</option>
                          <option>Curriculum & Cambridge IGCSE Track</option>
                          <option>General Administration</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Please provide specifics regarding your child's age, class of interest, or question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 text-xs"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs gap-2 px-8"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Dispatch Inquiry
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
