'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Sparkles,
  Camera,
  Layers,
  ArrowRight,
  Phone,
  Mail,
  Home,
  Building,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'stem' | 'sports' | 'campus' | 'arts'>('all')

  const galleryItems = [
    {
      title: 'Advanced STEM & Robotics Laboratory',
      category: 'stem',
      categoryLabel: 'STEM & Robotics',
      desc: 'Students programming autonomous robotics vehicles and micro-controllers.',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Senior Secondary Chemistry Practical Session',
      category: 'stem',
      categoryLabel: 'Sciences',
      desc: 'Qualitative and volumetric titration analysis in our ultra-modern laboratory.',
      color: 'from-cyan-600 to-blue-700',
    },
    {
      title: 'Annual Inter-House Athletics Championship',
      category: 'sports',
      categoryLabel: 'Athletics & Sports',
      desc: '100m sprint finals at the main campus stadium complex.',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      title: 'Olympic Swimming Pool & Aquatic Complex',
      category: 'sports',
      categoryLabel: 'Athletics & Sports',
      desc: 'Weekly swimming instruction and water safety lessons for both primary and secondary scholars.',
      color: 'from-sky-600 to-blue-800',
    },
    {
      title: 'Digital E-Library & Individual Study Pods',
      category: 'campus',
      categoryLabel: 'Campus Facilities',
      desc: 'Quiet reading halls equipped with interactive research computers and multimedia pods.',
      color: 'from-purple-600 to-indigo-800',
    },
    {
      title: 'Fine Arts & Cultural Orchestra Performance',
      category: 'arts',
      categoryLabel: 'Arts & Culture',
      desc: 'School symphony orchestra performing at the annual graduation valedictory dinner.',
      color: 'from-amber-600 to-orange-700',
    },
    {
      title: 'Executive Boarding Hostel Quarters',
      category: 'campus',
      categoryLabel: 'Campus Facilities',
      desc: 'Safe, air-conditioned and solar-powered boarding houses with 24/7 pastoral care.',
      color: 'from-slate-700 to-gray-900',
    },
    {
      title: 'Early Years & Primary Montessori Playpark',
      category: 'campus',
      categoryLabel: 'Early Years',
      desc: 'Safe rubber-padded adventure playground developing gross motor skills and collaboration.',
      color: 'from-pink-600 to-rose-700',
    },
  ]

  const filtered = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Top Bar */}
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
            <Link href="/about" className="hover:text-blue-600 transition">About Us</Link>
            <Link href="/gallery" className="text-blue-600 font-bold">Campus Gallery</Link>
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

      {/* Hero Header */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <Badge className="bg-white/20 text-white border-0 text-xs">Visual Tour</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Life at Chosen Generation</h2>
          <p className="text-xs md:text-sm text-blue-100 max-w-xl mx-auto">
            Explore our contemporary classrooms, science & robotics laboratories, sports centers, and vibrant extracurricular student life.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
            className="text-xs font-semibold h-8"
          >
            All Highlights ({galleryItems.length})
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'stem' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('stem')}
            className="text-xs font-semibold h-8"
          >
            STEM & Laboratories
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'sports' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('sports')}
            className="text-xs font-semibold h-8"
          >
            Sports & Aquatics
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'campus' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('campus')}
            className="text-xs font-semibold h-8"
          >
            Campus & Hostels
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'arts' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('arts')}
            className="text-xs font-semibold h-8"
          >
            Music & Performing Arts
          </Button>
        </div>
      </section>

      {/* Gallery Cards Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <Card key={idx} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Visual Presentation Block */}
              <div className={`h-48 bg-gradient-to-br ${item.color} p-5 flex flex-col justify-between text-white relative overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <Badge className="bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
                    {item.categoryLabel}
                  </Badge>
                  <Camera className="w-4 h-4 text-white/80" />
                </div>
                <div className="z-10">
                  <h3 className="font-bold text-base leading-tight drop-shadow-sm">{item.title}</h3>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
              </div>

              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center text-xs border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CHOSEN GENERATION SCHOOL. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admissions/apply" className="text-blue-400 hover:underline">Apply Online</Link>
            <Link href="/contact" className="text-blue-400 hover:underline">Contact Campus</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
