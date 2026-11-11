import React from 'react'
import { BookOpen, Download, FileText, Video, ExternalLink, Search, Filter } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function StudentResourcesPage() {
  const materials = [
    {
      id: 'res-1',
      title: 'Quadratic Equations Comprehensive Lecture Slides & Proofs',
      subject: 'Pure Mathematics',
      teacher: 'Dr. Robert Smith',
      type: 'PDF',
      size: '4.8 MB',
      date: 'Feb 10, 2025',
    },
    {
      id: 'res-2',
      title: 'Volumetric Analysis & Titration Chemistry Guide',
      subject: 'General Chemistry',
      teacher: 'Mrs. Folashade Adebayo',
      type: 'PDF',
      size: '2.1 MB',
      date: 'Feb 08, 2025',
    },
    {
      id: 'res-3',
      title: 'Things Fall Apart: Chapter 1-14 Discussion Recording',
      subject: 'English & Composition',
      teacher: 'Mr. Andrew Clark',
      type: 'VIDEO',
      size: '142 MB',
      date: 'Feb 05, 2025',
    },
    {
      id: 'res-4',
      title: 'WAEC & Cambridge Past Questions (2018 - 2024 Pack)',
      subject: 'Cross-Disciplinary',
      teacher: 'Academic Directorate',
      type: 'ZIP',
      size: '34 MB',
      date: 'Jan 20, 2025',
    },
  ]

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Lesson Notes & Digital Learning Repository
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Teacher lecture notes, revision worksheets, past examination questions, and video recordings
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input placeholder="Search learning materials by title, subject, or keyword..." className="pl-9 text-xs" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="text-xs">
                All Subjects
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Past Questions
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                    {m.type === 'VIDEO' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{m.subject}</span>
                      <Badge variant="secondary" className="text-[10px]">{m.type}</Badge>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 line-clamp-2">
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded by {m.teacher} • {m.size} • {m.date}
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="text-xs shrink-0 gap-1.5 h-8">
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
