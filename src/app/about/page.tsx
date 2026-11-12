import React from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Building,
  Award,
  Users,
  Compass,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  Heart,
  Target,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  const leadership = [
    {
      name: 'Dr. Mrs. Folashade Adeleke',
      title: 'Principal & Head of School',
      bio: 'Ph.D. in Educational Leadership (Oxford), with over 24 years leading top international academies across West Africa and the UK.',
      role: 'Leadership',
    },
    {
      name: 'Mr. Jude Bello',
      title: 'Vice Principal (Academics - Secondary)',
      bio: 'M.Sc. Applied Mathematics, former WAEC chief examiner, leading our STEM integration and Cambridge IGCSE track.',
      role: 'Academics',
    },
    {
      name: 'Mrs. Grace Balogun',
      title: 'Head of Primary & Early Years',
      bio: 'Postgraduate Diploma in Montessori & Early Childhood Education, cultivating foundational literacy and numeracy.',
      role: 'Primary Section',
    },
    {
      name: 'Chief Emmanuel Okon',
      title: 'Bursar & Director of Finance',
      bio: 'FCA, Chartered Accountant overseeing institutional fiscal governance, automated billing, and scholarship trust funds.',
      role: 'Finance & Bursary',
    },
  ]

  const facilities = [
    { title: 'STEM & Robotics Hub', desc: 'Equipped with 3D printers, micro-controllers, and coding workstations for secondary students.' },
    { title: 'Science Laboratories', desc: 'Dedicated, purpose-built chemistry, physics, and biology laboratories meeting WAEC/NECO standards.' },
    { title: 'Digital E-Library', desc: 'Over 15,000 physical volumes complemented by EBSCO and JSTOR academic digital journals.' },
    { title: 'Sports & Olympic Complex', desc: 'Full football pitch, tartan running track, covered basketball and tennis courts, and swimming pool.' },
    { title: 'Air-Conditioned Transit Fleet', desc: 'GPS-tracked luxury school coasters serving major mainland and island routes daily.' },
    { title: 'Executive Boarding Hostels', desc: 'Comfortable, warden-monitored single and double en-suite rooms with 24/7 solar backup power.' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Top School Bar */}
      <div className="bg-blue-900 text-blue-100 py-2 px-4 text-xs border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +234 1 234 5678
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> info@chosengenerationschool.edu
            </span>
          </div>
          <div>
            <span>42 Academic Way, Victoria Island, Lagos</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/80 dark:border-gray-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-blue-950 dark:text-blue-100">
                CHOSEN GENERATION SCHOOL
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                Nursery • Primary • Secondary
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/about" className="text-blue-600 font-bold">About Us</Link>
            <Link href="/gallery" className="hover:text-blue-600 transition">Campus Gallery</Link>
            <Link href="/news" className="hover:text-blue-600 transition">News & Circulars</Link>
            <Link href="/contact" className="hover:text-blue-600 transition">Contact</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/admissions/apply">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shadow-sm">
                Apply for Admission
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-white/20 text-white border-0 text-xs px-3 py-1 font-semibold">
            Founded 2002 • 24 Years of Distinction
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Nurturing Visionary Leaders with Character and Intellect
          </h2>
          <p className="text-sm md:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            CHOSEN GENERATION SCHOOL is a premier co-educational day and boarding institution delivering world-class Nigerian and British curriculum from early years to university entrance.
          </p>
        </div>
      </section>

      {/* Vision, Mission, Motto */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Our Vision</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                To be West Africa’s benchmark center of excellence, developing future-ready global leaders grounded in moral integrity, scientific inquiry, and civic responsibility.
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-900 shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Our Mission</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Providing personalized, rigorous education within a state-of-the-art technological ecosystem, empowering each student to discover their passions and excel globally.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-900 shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Our Core Motto</h3>
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300 italic">
                &ldquo;Knowledge, Character & Service&rdquo;
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Instilling discipline, academic honesty, empathy, and service to society in every scholar who passes through our gates.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-12 px-4 bg-gray-50/70 dark:bg-gray-900/50 border-y border-gray-200/80 dark:border-gray-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs">World-Class Infrastructure</Badge>
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Campus Facilities Built for Modern Learning
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{fac.title}</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed pl-6">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs">Faculty Leadership</Badge>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Meet Our Governing Leadership & Deans
          </h3>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Experienced international educators committed to safeguarding, academic excellence, and student wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((lead, idx) => (
            <Card key={idx} className="hover:shadow-md transition">
              <CardContent className="p-5 space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {lead.name.split(' ').slice(1, 3).map(n => n[0]).join('')}
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">{lead.role}</Badge>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{lead.name}</h4>
                  <p className="text-xs font-semibold text-blue-600">{lead.title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{lead.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-blue-950 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold">Begin Your Child’s Journey at Chosen Generation</h3>
          <p className="text-xs text-blue-200">
            Admissions for the upcoming 2025/2026 academic year are now open across all grade cohorts.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/admissions/apply">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold gap-2">
                Apply for Admission Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
