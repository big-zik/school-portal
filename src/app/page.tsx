import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Compass,
  Trophy,
  Heart,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getServerUser } from '@/lib/auth/helpers'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getServerUser()

  // If already authenticated, redirect to appropriate role portal
  if (user && user.roles?.length) {
    if (user.roles.includes('SUPER_ADMIN')) redirect('/super-admin')
    if (user.roles.includes('ADMIN')) redirect('/admin')
    if (user.roles.includes('TEACHER')) redirect('/teacher')
    if (user.roles.includes('PARENT')) redirect('/parent')
    if (user.roles.includes('STUDENT')) redirect('/student')
  }

  const portals = [
    {
      title: 'Student Portal',
      desc: 'Check class timetable, submit assignments, view marks, access CBT exam room, and report cards.',
      role: 'student.daniel@school.com',
      badge: 'Academic',
      icon: GraduationCap,
      href: '/login',
    },
    {
      title: 'Parent Portal',
      desc: 'Track attendance, view terminal results with QR verify, pay fees via Paystack, and upload bank slips.',
      role: 'parent.johnson@school.com',
      badge: 'Family & Bursary',
      icon: Users,
      href: '/login',
    },
    {
      title: 'Teacher Desk',
      desc: 'Continuous assessment desk, mark attendance, enter CA & exam scores, and upload lesson resources.',
      role: 'teacher.smith@school.com',
      badge: 'Instruction',
      icon: BookOpen,
      href: '/login',
    },
    {
      title: 'Admin Console',
      desc: 'Manage admissions, broadsheets, fee reconciliation, inventory, timetable, hostel, and transport.',
      role: 'admin@school.com',
      badge: 'Operations',
      icon: ShieldCheck,
      href: '/login',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--cgs-canvas)] text-[var(--cgs-text)] flex flex-col font-sans selection:bg-[var(--cgs-tint)] selection:text-[var(--cgs-primary)]">
      {/* 1. Admissions Announcement Bar (Figma Node 2:305) */}
      <div className="bg-[var(--cgs-navy)] text-white py-2 px-4 sm:px-6 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="tracking-wide text-center sm:text-left">
            2026/2027 admissions are open &middot; Give your child a confident start
          </p>
          <Link
            href="/admissions/apply"
            className="inline-flex items-center gap-1 font-semibold text-[var(--cgs-sky)] hover:underline whitespace-nowrap transition-colors"
          >
            Apply now &rarr;
          </Link>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[var(--cgs-surface)]/95 border-b border-[var(--cgs-border)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Lockup (Figma Node 2:159) */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-[var(--cgs-tint)] border border-[var(--cgs-sky)]/40 flex items-center justify-center text-[var(--cgs-heading)] font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
              CG
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[var(--cgs-heading)] leading-none">
                CHOSEN GENERATION
              </span>
              <span className="text-[11px] font-semibold text-[var(--cgs-primary)] tracking-wider uppercase mt-1">
                Born to Excel
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-[var(--cgs-primary)] font-semibold">
              Home
            </Link>
            <Link href="/about" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">
              About
            </Link>
            <Link href="/admissions" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">
              Admissions
            </Link>
            <Link href="/news" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">
              News
            </Link>
            <Link href="/gallery" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">
              Gallery
            </Link>
            <Link href="/contact" className="text-[var(--cgs-subdued)] hover:text-[var(--cgs-text)] transition-colors">
              Contact
            </Link>
          </nav>

          {/* School Portal CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="h-11 px-5 rounded-lg font-semibold shadow-sm">
                School portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Figma Node 2:321 Hero wash) */}
      <section className="bg-[var(--cgs-tint)] border-b border-[var(--cgs-sky)]/30 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--cgs-surface)]/80 border border-[var(--cgs-sky)] text-xs font-semibold text-[var(--cgs-heading)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[var(--cgs-primary)]" />
                WELCOME TO CHOSEN GENERATION
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--cgs-heading)] leading-[1.12]">
                A bright future <br />
                <span className="text-[var(--cgs-primary)]">begins here.</span>
              </h1>

              <p className="text-lg sm:text-xl text-[var(--cgs-subdued)] leading-relaxed max-w-2xl">
                A caring school where curiosity grows, character matters, and every child is encouraged to excel academically, morally, and spiritually.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link href="/admissions/apply">
                  <Button size="lg" className="h-13 px-8 text-base font-semibold w-full sm:w-auto">
                    Start an application &rarr;
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="h-13 px-8 text-base font-semibold w-full sm:w-auto border-[var(--cgs-primary)]/40 text-[var(--cgs-primary)] hover:bg-[var(--cgs-surface)]">
                    Explore our school
                  </Button>
                </Link>
              </div>

              {/* Motto Banner */}
              <div className="pt-4 flex items-center gap-3">
                <div className="bg-[var(--cgs-gold)] text-[var(--cgs-text)] font-bold text-sm tracking-wide px-4 py-2 rounded-lg shadow-sm">
                  Born to Excel
                </div>
                <span className="text-xs font-medium text-[var(--cgs-subdued)]">
                  Approved & Accredited Primary & Junior Secondary Institution
                </span>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cgs-sky)]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--cgs-border)] pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--cgs-subdued)]">
                      2026/2027 Academic Year
                    </span>
                    <Badge variant="gold">Open for Enrolment</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--cgs-surface-subtle)] border border-[var(--cgs-border)]">
                      <p className="text-xs font-semibold text-[var(--cgs-primary)] uppercase">Early Years & Primary</p>
                      <p className="text-sm font-bold text-[var(--cgs-heading)] mt-0.5">Creche, Nursery 1-2, Basic 1-5</p>
                      <p className="text-xs text-[var(--cgs-subdued)] mt-1">Foundational literacy, numeracy, and character development.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--cgs-surface-subtle)] border border-[var(--cgs-border)]">
                      <p className="text-xs font-semibold text-[var(--cgs-primary)] uppercase">Junior Secondary</p>
                      <p className="text-sm font-bold text-[var(--cgs-heading)] mt-0.5">JSS 1 &middot; JSS 2 &middot; JSS 3 (BECE Prep)</p>
                      <p className="text-xs text-[var(--cgs-subdued)] mt-1">Hands-on STEM labs, ICT coding, CBT exam readiness.</p>
                    </div>
                  </div>

                  <Link href="/admissions" className="block text-center text-xs font-semibold text-[var(--cgs-primary)] hover:underline pt-2">
                    View complete admissions criteria & fees &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Pillars Section (Figma Nodes 2:332 - 2:337) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm space-y-3">
            <span className="text-3xl font-bold text-[var(--cgs-primary)]">01</span>
            <h3 className="text-xl font-bold text-[var(--cgs-heading)]">Purposeful learning</h3>
            <p className="text-sm text-[var(--cgs-subdued)] leading-relaxed">
              Curriculum rooted in sound pedagogy, encouraging inquiry, practical experimentation, and lifelong mastery.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm space-y-3">
            <span className="text-3xl font-bold text-[var(--cgs-primary)]">02</span>
            <h3 className="text-xl font-bold text-[var(--cgs-heading)]">A caring community</h3>
            <p className="text-sm text-[var(--cgs-subdued)] leading-relaxed">
              Every child is known by name. We partner closely with guardians to ensure emotional, moral, and physical wellbeing.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm space-y-3">
            <span className="text-3xl font-bold text-[var(--cgs-primary)]">03</span>
            <h3 className="text-xl font-bold text-[var(--cgs-heading)]">Confidence for life</h3>
            <p className="text-sm text-[var(--cgs-subdued)] leading-relaxed">
              Developing leadership, articulate public expression, and ethical resilience to thrive in tomorrow&apos;s world.
            </p>
          </div>
        </div>
      </section>

      {/* 5. More than a classroom (Figma Nodes 2:338 - 2:354) */}
      <section className="py-16 bg-[var(--cgs-surface-subtle)] border-y border-[var(--cgs-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--cgs-heading)]">
              More than a classroom.
            </h2>
            <p className="text-base sm:text-lg text-[var(--cgs-subdued)] mt-2">
              The foundations for a life of learning across every developmental stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Early Years Card */}
            <div className="p-6 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--cgs-primary)] tracking-wider uppercase">EARLY YEARS</span>
                <h4 className="text-xl font-bold text-[var(--cgs-heading)] mt-2">A joyful first step</h4>
                <p className="text-sm text-[var(--cgs-subdued)] mt-2 leading-relaxed">
                  Play, discovery and strong foundations in early reading, numeracy, and expressive arts.
                </p>
              </div>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--cgs-primary)] hover:underline mt-6">
                Discover more &rarr;
              </Link>
            </div>

            {/* Primary School Card */}
            <div className="p-6 rounded-2xl bg-[var(--cgs-tint)] border border-[var(--cgs-sky)]/40 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--cgs-primary)] tracking-wider uppercase">PRIMARY SCHOOL</span>
                <h4 className="text-xl font-bold text-[var(--cgs-heading)] mt-2">Curious minds grow</h4>
                <p className="text-sm text-[var(--cgs-subdued)] mt-2 leading-relaxed">
                  Building deep academic skills, critical problem solving, digital literacy, and good character.
                </p>
              </div>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--cgs-primary)] hover:underline mt-6">
                Discover more &rarr;
              </Link>
            </div>

            {/* Secondary School Card */}
            <div className="p-6 rounded-2xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--cgs-primary)] tracking-wider uppercase">JUNIOR SECONDARY</span>
                <h4 className="text-xl font-bold text-[var(--cgs-heading)] mt-2">Ready for what comes next</h4>
                <p className="text-sm text-[var(--cgs-subdued)] mt-2 leading-relaxed">
                  Focused STEM learning, humanities, CBT examination confidence, and leadership coaching.
                </p>
              </div>
              <Link href="/about" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--cgs-primary)] hover:underline mt-6">
                Discover more &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Unified Digital Day / Direct Role Portals */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="default" className="mb-3">Connected Campus</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--cgs-heading)]">
            One school. Every role. A calmer digital day.
          </h2>
          <p className="text-sm sm:text-base text-[var(--cgs-subdued)] mt-3">
            Access your personalized workspace with live attendance, fee reconciliation, online CBT examination, and verified terminal report cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((p, idx) => {
            const Icon = p.icon
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[var(--cgs-tint)] flex items-center justify-center text-[var(--cgs-primary)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">{p.badge}</Badge>
                  </div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-[var(--cgs-subdued)] leading-relaxed">{p.desc}</p>
                  <Link href={p.href} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between text-xs font-semibold">
                      <span>Access portal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* 7. Admissions Call to Action Banner (Figma Node 2:370) */}
      <section className="bg-[var(--cgs-tint)] border-t border-[var(--cgs-border)] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[var(--cgs-surface)] border border-[var(--cgs-border)] p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--cgs-heading)]">
                Your child&apos;s next chapter starts here.
              </h3>
              <p className="text-sm text-[var(--cgs-subdued)] max-w-xl">
                Enrolment for the 2026/2027 academic session is actively underway. Schedule a campus tour or apply online today.
              </p>
            </div>
            <Link href="/admissions/apply" className="shrink-0">
              <Button size="lg" className="h-12 px-8 font-semibold shadow-sm">
                Apply for admission &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer (Figma Node 2:374) */}
      <footer className="bg-[var(--cgs-navy)] text-white pt-16 pb-12 mt-auto border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-blue-900/60">
            {/* Logo & Motto */}
            <div className="space-y-4 md:col-span-1">
              <div className="inline-flex items-center gap-2.5 bg-white p-2.5 rounded-xl">
                <div className="h-9 w-9 rounded-lg bg-[var(--cgs-navy)] text-white font-bold flex items-center justify-center text-base">
                  CG
                </div>
                <div className="flex flex-col text-[var(--cgs-heading)]">
                  <span className="text-xs font-bold leading-tight">CHOSEN GENERATION</span>
                  <span className="text-[10px] font-semibold text-[var(--cgs-primary)]">Born to Excel</span>
                </div>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed">
                Every child is born to excel. Learn with purpose. Grow with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cgs-sky)] mb-3">Explore</h4>
              <ul className="space-y-2 text-xs text-blue-100">
                <li><Link href="/about" className="hover:text-white transition-colors">About our school</Link></li>
                <li><Link href="/admissions" className="hover:text-white transition-colors">Admissions process</Link></li>
                <li><Link href="/news" className="hover:text-white transition-colors">News &amp; announcements</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">Campus gallery</Link></li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cgs-sky)] mb-3">Portals</h4>
              <ul className="space-y-2 text-xs text-blue-100">
                <li><Link href="/login" className="hover:text-white transition-colors">Student login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Parent portal</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Staff assessment desk</Link></li>
                <li><Link href="/verify/results" className="hover:text-white transition-colors">Verify certificate / result</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--cgs-sky)] mb-3">Get in touch</h4>
              <ul className="space-y-2.5 text-xs text-blue-100">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--cgs-sky)] shrink-0 mt-0.5" />
                  <span>Chosen Generation Campus, Lagos, Nigeria</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[var(--cgs-sky)] shrink-0" />
                  <span>+234 (0) 800 CHOSEN SCH</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[var(--cgs-sky)] shrink-0" />
                  <span>info@chosengeneration.edu.ng</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-300">
            <p>&copy; 2026 Chosen Generation School &middot; All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/contact" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
