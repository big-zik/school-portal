'use client'

import React, { useState, useEffect } from 'react'
import {
  Bell,
  Search,
  Pin,
  Calendar,
  User,
  Paperclip,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'
import { formatDate } from '@/lib/utils'

export default function ParentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'admin' | 'teachers'>('all')

  const fallbackAnnouncements = [
    {
      id: 'ann-1',
      title: 'Term 2 Mid-Term Break & Continuous Assessment (CA) Submission Guidelines',
      content:
        'Dear Parents and Guardians,\n\nPlease note that the Mid-Term Break for Second Term commences on Thursday, February 20th and classes resume on Monday, February 24th. Prior to the break, all students will complete their Continuous Assessment (CA 2) tests. Kindly ensure that your child revises the scheduled syllabi and all pending project work is submitted on time.\n\nThank you for your continuous partnership in academic excellence.',
      isPinned: true,
      publishedAt: '2025-02-10T08:00:00Z',
      author: { name: 'Principal Dr. Mrs. Adeleke', role: 'ADMIN' },
      category: 'Academic & Holidays',
      attachments: [{ name: 'MidTerm_CA2_Schedule_Circular.pdf', size: '245 KB' }],
    },
    {
      id: 'ann-2',
      title: 'Inter-House Sports Festival 2025: Date, Uniform Guidelines & Parent Attendance',
      content:
        'We are thrilled to invite all parents to our Annual Inter-House Athletics and Sports Championship scheduled for Saturday, March 15th at the Main Sports Complex. Students should arrive in their respective house sport t-shirts by 07:30 AM. Complimentary breakfast and refreshments will be provided for parents.\n\nPlease confirm your attendance via the school desk.',
      isPinned: true,
      publishedAt: '2025-02-08T10:30:00Z',
      author: { name: 'School Sports Directorate', role: 'ADMIN' },
      category: 'Extracurricular',
      attachments: [{ name: 'Sports_Day_Order_of_Events.pdf', size: '1.2 MB' }],
    },
    {
      id: 'ann-3',
      title: 'Grade 10 (SS 1) Science Track: Chemistry Lab Coat & Practical Workbook Notice',
      content:
        'To all SS 1 Science parents:\n\nBeginning next week Monday, students will commence their quantitative titration and qualitative analysis practicals. Please ensure your child has their standard white cotton lab coat and safety goggles as students without proper lab attire will not be admitted into the chemistry laboratory.',
      isPinned: false,
      publishedAt: '2025-02-05T14:15:00Z',
      author: { name: 'Dr. Robert Smith (Science Department)', role: 'TEACHER' },
      category: 'Class Instruction',
      attachments: [],
    },
    {
      id: 'ann-4',
      title: 'Third Term Tuition Billing & Flexible Instalment Payment Advisory',
      content:
        'The Bursary Department wishes to inform all parents that Third Term 2024/2025 fee structures and invoices have been published on the portal. Parents are encouraged to utilize our bank transfer teller upload feature or instant card payment. Partial instalment arrangements can be confirmed with the bursar before resumption.',
      isPinned: false,
      publishedAt: '2025-01-28T09:00:00Z',
      author: { name: 'Bursary Office', role: 'ADMIN' },
      category: 'Bursary & Fees',
      attachments: [{ name: 'Third_Term_Fee_Schedule.pdf', size: '380 KB' }],
    },
  ]

  useEffect(() => {
    async function loadAnnouncements() {
      setLoading(true)
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.length > 0) {
            setAnnouncements(json.data)
          } else {
            setAnnouncements(fallbackAnnouncements)
          }
        } else {
          setAnnouncements(fallbackAnnouncements)
        }
      } catch (e) {
        setAnnouncements(fallbackAnnouncements)
      } finally {
        setLoading(false)
      }
    }
    loadAnnouncements()
  }, [])

  const filtered = announcements.filter((ann) => {
    const q = search.toLowerCase()
    const matchesSearch =
      ann.title?.toLowerCase().includes(q) ||
      ann.content?.toLowerCase().includes(q) ||
      ann.author?.name?.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (filterType === 'pinned') return ann.isPinned
    if (filterType === 'admin') return ann.author?.role === 'ADMIN' || ann.author?.name?.includes('Principal')
    if (filterType === 'teachers') return ann.author?.role === 'TEACHER' || ann.author?.name?.includes('Department')
    return true
  })

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-blue-600" />
              School Updates & Official Circulars
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time notices, academic advisories, term calendar circulars, and teacher bulletins
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search circulars by keyword, teacher, or topic..."
                className="pl-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Button
                size="sm"
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className="text-xs h-8 whitespace-nowrap"
              >
                All Circulars
              </Button>
              <Button
                size="sm"
                variant={filterType === 'pinned' ? 'default' : 'outline'}
                onClick={() => setFilterType('pinned')}
                className="text-xs h-8 whitespace-nowrap gap-1 text-amber-600 border-amber-300 dark:border-amber-800"
              >
                <Pin className="w-3 h-3" /> Pinned
              </Button>
              <Button
                size="sm"
                variant={filterType === 'admin' ? 'default' : 'outline'}
                onClick={() => setFilterType('admin')}
                className="text-xs h-8 whitespace-nowrap"
              >
                From Admin / Principal
              </Button>
              <Button
                size="sm"
                variant={filterType === 'teachers' ? 'default' : 'outline'}
                onClick={() => setFilterType('teachers')}
                className="text-xs h-8 whitespace-nowrap"
              >
                From Class Teachers
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-2">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">No circulars found</p>
                <p className="text-xs text-gray-400">There are no school announcements matching your filter.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((item) => (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  item.isPinned
                    ? 'border-blue-300 dark:border-blue-900 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 dark:from-gray-900 dark:to-gray-900'
                    : ''
                }`}
              >
                <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.isPinned && (
                        <Badge className="bg-blue-600 text-white text-[10px] gap-1 font-semibold">
                          <Pin className="w-3 h-3 fill-current" /> Pinned Advisory
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                        {item.category || 'General Circular'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        {item.author?.name || 'School Administration'}
                      </span>
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 mt-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                    {item.content}
                  </div>

                  {/* Attached Documents */}
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" /> Official Attachments & Circulars
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((file: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 p-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                          >
                            <FileText className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{file.name || 'Circular.pdf'}</p>
                              {file.size && <span className="text-[10px] text-gray-400">{file.size}</span>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 ml-1 text-blue-600 hover:text-blue-700"
                              onClick={() => alert(`Downloading ${file.name || 'circular'}...`)}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
