'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Calendar,
  User,
  ArrowRight,
  Phone,
  Mail,
  Search,
  BookOpen,
  Sparkles,
  Trophy,
  Tag,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const articles = [
    {
      id: 'news-1',
      title: 'Chosen Generation STEM Robotics Team Clinches 1st Prize in Lagos Robotics Olympiad',
      date: 'Feb 10, 2025',
      category: 'STEM & Innovation',
      author: 'Academic Directorate',
      readTime: '3 min read',
      excerpt:
        'Our Senior Secondary Grade 10 and 11 robotics scholars engineered an autonomous flood-detection robot to claim the top trophy among 48 competing private schools across the state.',
      content:
        'Competing against 48 international schools, our robotics contingent demonstrated exceptional prowess in Python micro-controller programming, sensor calibration, and 3D prototyping. The team will proceed to represent Nigeria in the Pan-African Youth Science Exhibition in Nairobi later this year.',
    },
    {
      id: 'news-2',
      title: 'Term 2 Mid-Term Assessment Schedule & Continuous Assessment Submission Advisory',
      date: 'Feb 06, 2025',
      category: 'Academic Calendar',
      author: 'Office of the Principal',
      readTime: '2 min read',
      excerpt:
        'Continuous Assessment tests (CA 2) will be conducted from February 17th to 19th prior to the mid-term recess. Parents are advised to review revision topics on the portal.',
      content:
        'All continuous assessment test timetables have been published under the Parent Portal. Please ensure students complete their term revision projects and arrive promptly at their designated examination halls.',
    },
    {
      id: 'news-3',
      title: 'Annual Inter-House Athletics & Swimming Gala: Sapphire Blue House Takes Gold',
      date: 'Jan 30, 2025',
      category: 'Sports & Athletics',
      author: 'Sports Department',
      readTime: '4 min read',
      excerpt:
        'Over 1,200 parents and supporters witnessed an electrifying day of sprints, relays, high jump, and 50m aquatic butterfly strokes at our Olympic complex.',
      content:
        'Sapphire Blue House led the medal table with 18 Gold, 12 Silver, and 9 Bronze medals, closely pursued by Ruby Red House. Outstanding athlete awards were presented to Daniel Johnson (SS 1) and Amara Okafor (SS 1).',
    },
    {
      id: 'news-4',
      title: 'School Board Commissions 100kVA Solar Clean Energy Microgrid for Boarding Quarters',
      date: 'Jan 15, 2025',
      category: 'Campus Facilities',
      author: 'Board of Governors',
      readTime: '3 min read',
      excerpt:
        'In line with our sustainable campus policy, the school has completed the installation of a 100kVA hybrid lithium solar microgrid delivering 24/7 silent, uninterrupted power.',
      content:
        'The transition to clean solar energy guarantees 24-hour air conditioning, water heating, and ICT digital library power across all boarding halls while reducing carbon emissions by 65%.',
    },
    {
      id: 'news-5',
      title: 'Cambridge IGCSE & WAEC May/June Registration Guidelines for Senior Secondary Scholars',
      date: 'Jan 08, 2025',
      category: 'Admissions & Exams',
      author: 'Registrar',
      readTime: '3 min read',
      excerpt:
        'Subject selection verification and bio-metric capturing for Grade 12 valedictory students has commenced at the ICT CBT center.',
      content:
        'Parents of SS 3 students are advised to confirm candidate subjects with the academic dean before the deadline to ensure error-free index number issuance.',
    },
  ]

  const categories = ['All', 'STEM & Innovation', 'Academic Calendar', 'Sports & Athletics', 'Campus Facilities', 'Admissions & Exams']

  const filtered = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || art.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory
    return matchesSearch && matchesCat
  })

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
            <Link href="/gallery" className="hover:text-blue-600 transition">Campus Gallery</Link>
            <Link href="/news" className="text-blue-600 font-bold">News & Circulars</Link>
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

      {/* Header Banner */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <Badge className="bg-white/20 text-white border-0 text-xs">Official School Bulletins</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Campus News & Press Releases</h2>
          <p className="text-xs md:text-sm text-blue-100 max-w-xl mx-auto">
            Stay updated with academic milestones, sports celebrations, international recognitions, and school calendar announcements.
          </p>
        </div>
      </section>

      {/* Search and Category Filter */}
      <section className="py-6 px-4 max-w-7xl mx-auto w-full space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search news articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="text-xs h-8 whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <Card key={art.id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <Badge variant="outline" className="text-[10px] text-blue-600 font-semibold border-blue-200">
                    {art.category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" /> {art.readTime}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                  {art.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                  <span>{art.date}</span>
                  <span>•</span>
                  <span>{art.author}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert(`Full Article:\n\n${art.title}\n\n${art.content}`)}
                    className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 font-semibold gap-1"
                  >
                    Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
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
            <Link href="/about" className="text-blue-400 hover:underline">About School</Link>
            <Link href="/admissions/apply" className="text-blue-400 hover:underline">Online Admissions</Link>
            <Link href="/contact" className="text-blue-400 hover:underline">Contact Campus</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
