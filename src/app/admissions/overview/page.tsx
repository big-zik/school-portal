import React from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Admissions | Chosen Generation School',
  description: 'Admissions criteria, guidelines, and application for Chosen Generation School.',
}

export default function AdmissionsOverviewPage() {
  const steps = [
    {
      num: '01',
      title: 'Online Application',
      desc: 'Complete the student and guardian registration form and upload academic transcripts and birth certificates.',
    },
    {
      num: '02',
      title: 'Entrance Evaluation & Interview',
      desc: 'Applicants participate in an age-appropriate cognitive assessment and an interview with academic heads.',
    },
    {
      num: '03',
      title: 'Offer of Admission & Bursary',
      desc: 'Successful candidates receive provisional admission letters with fee schedules and acceptance vouchers.',
    },
    {
      num: '04',
      title: 'Enrolment & Welcome Pack',
      desc: 'Fee clearance, uniform fitting, digital portal orientation, and class placement confirmation.',
    },
  ]

  const classes = [
    { name: 'Pre-School / Creche', age: '3 months – 2 years', desc: 'Nurturing sensory play, motor skill foundation, and responsive care.' },
    { name: 'Nursery (1 & 2)', age: '3 – 4 years', desc: 'Phonics, numeracy fundamentals, social collaboration, and discovery.' },
    { name: 'Basic 1 to 5 (Primary)', age: '5 – 10 years', desc: 'Rigorous national curriculum enriched with STEM, ICT coding, French, and leadership.' },
    { name: 'Junior Secondary (JSS 1–3)', age: '10 – 14 years', desc: 'Pre-BECE coaching, computer science, practical laboratory science, and sports.' },
  ]

  return (
    <div className="min-h-screen bg-[var(--cgs-canvas)] text-[var(--cgs-text)] flex flex-col font-sans">
      {/* Top School Bar */}
      <div className="bg-[var(--cgs-navy)] text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[var(--cgs-sky)]" /> +234 (0) 800 CHOSEN SCH
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-[var(--cgs-sky)]" /> admissions@chosengeneration.edu.ng
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
            <Link href="/admissions" className="text-[var(--cgs-primary)] font-semibold">Admissions</Link>
            <Link href="/news" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">News</Link>
            <Link href="/gallery" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">Gallery</Link>
            <Link href="/contact" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">Contact</Link>
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

      {/* Hero Banner */}
      <section className="bg-[var(--cgs-tint)] border-b border-[var(--cgs-sky)]/30 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <Badge variant="gold" className="mb-4">2026/2027 Admissions Open</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--cgs-heading)]">
            Begin Your Child&apos;s Journey to Excellence
          </h1>
          <p className="text-base sm:text-lg text-[var(--cgs-subdued)] mt-4 leading-relaxed">
            We welcome learners from Creche through Junior Secondary School into a nurturing, academically ambitious community.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/admissions/apply">
              <Button size="lg" className="h-12 px-8 font-semibold shadow-sm">
                Apply online now &rarr;
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="h-12 px-8 font-semibold">
                Book a campus tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Four Steps Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-[var(--cgs-heading)]">
            The Admissions Journey
          </h2>
          <p className="text-sm text-[var(--cgs-subdued)] mt-2">
            A transparent, supportive 4-step process designed for parents and scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <Card key={i} className="p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-3xl font-bold text-[var(--cgs-primary)]">{st.num}</span>
                <h3 className="text-lg font-bold text-[var(--cgs-heading)]">{st.title}</h3>
                <p className="text-xs text-[var(--cgs-subdued)] leading-relaxed">{st.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Available Classes */}
      <section className="py-16 bg-[var(--cgs-surface-subtle)] border-y border-[var(--cgs-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-bold text-[var(--cgs-heading)]">
              Available Grade Levels
            </h2>
            <p className="text-sm text-[var(--cgs-subdued)] mt-1">
              Tailored age divisions supporting progressive cognitive development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((c, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm space-y-3">
                <span className="text-[10px] font-bold text-[var(--cgs-primary)] uppercase tracking-wider">{c.age}</span>
                <h4 className="text-lg font-bold text-[var(--cgs-heading)]">{c.name}</h4>
                <p className="text-xs text-[var(--cgs-subdued)] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/admissions/apply">
              <Button size="lg" className="h-12 px-8 font-semibold shadow-sm">
                Start an application today &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--cgs-navy)] text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200">
          <p>&copy; 2026 Chosen Generation School &middot; Born to Excel</p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-white">Contact Admissions</Link>
            <Link href="/login" className="hover:text-white">Portal Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
