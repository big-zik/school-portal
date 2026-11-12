'use client'

import React, { useState, useEffect } from 'react'
import {
  Building,
  Users,
  BookOpen,
  PlusCircle,
  X,
  Loader2,
  CheckCircle,
  Sparkles,
  School,
  AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface Section {
  id: string
  name: string
  room?: string | null
  capacity?: number | null
}

interface ClassItem {
  id: string
  name: string
  level?: number | null
  capacity?: number | null
  description?: string | null
  sections: Section[]
  _count?: {
    students: number
  }
}

const PRESET_CLASSES = [
  { name: 'Pre-School', level: 0, category: 'Early Years' },
  { name: 'Pre-Nursery', level: 1, category: 'Early Years' },
  { name: 'Nursery 1', level: 2, category: 'Nursery' },
  { name: 'Nursery 2', level: 3, category: 'Nursery' },
  { name: 'Basic 1', level: 4, category: 'Primary' },
  { name: 'Basic 2', level: 5, category: 'Primary' },
  { name: 'Basic 3', level: 6, category: 'Primary' },
  { name: 'Basic 4', level: 7, category: 'Primary' },
  { name: 'Basic 5', level: 8, category: 'Primary' },
  { name: 'JSS 1', level: 9, category: 'Junior Secondary' },
  { name: 'JSS 2', level: 10, category: 'Junior Secondary' },
]

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form states
  const [className, setClassName] = useState('')
  const [level, setLevel] = useState('1')
  const [capacity, setCapacity] = useState('35')
  const [sectionName, setSectionName] = useState('Section A')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/classes')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setClasses(json.data)
      }
    } catch (err) {
      console.error('Failed to load classes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPreset = (preset: { name: string; level: number }) => {
    setClassName(preset.name)
    setLevel(String(preset.level))
    if (!description) {
      setDescription(`Official academic tier for ${preset.name}`)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!className.trim()) {
      setFeedback({ type: 'error', message: 'Class name is required' })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className.trim(),
          level: parseInt(level, 10) || 1,
          capacity: parseInt(capacity, 10) || 35,
          sectionName: sectionName.trim() || 'Section A',
          description: description.trim(),
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create class')
      }

      setFeedback({ type: 'success', message: `Class "${className}" created successfully!` })
      
      // Reset form & refresh list
      setClassName('')
      setDescription('')
      setIsModalOpen(false)
      fetchClasses()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Something went wrong' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTierBadge = (name: string, level?: number | null) => {
    const lower = name.toLowerCase()
    if (lower.includes('pre') || lower.includes('nursery')) {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Early Years / Nursery</Badge>
    }
    if (lower.includes('basic') || lower.includes('primary')) {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Basic / Primary</Badge>
    }
    if (lower.includes('jss')) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Junior Secondary</Badge>
    }
    if (lower.includes('ss') || lower.includes('grade 1')) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Senior Secondary</Badge>
    }
    return <Badge variant="outline">Tier {level ?? 'General'}</Badge>
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Building className="w-6 h-6 text-blue-600" />
              Classes, Arms & Grade Levels
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage classroom tiers: Pre-School, Nursery, Basic 1–5, and JSS 1–2
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                setFeedback(null)
                setIsModalOpen(true)
              }}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add New Class
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Classes List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading school classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <Card className="text-center py-12 px-4 border-dashed">
            <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900">No Classes Registered Yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Click &quot;Add New Class&quot; above to register your school&apos;s grades from Pre-School up to JSS 2.
            </p>
            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Add First Class
            </Button>
          </Card>
        ) : (
          <div className="space-y-5">
            {classes.map((cls) => {
              const enrolled = cls._count?.students || 0
              const cap = cls.capacity || 35
              const pct = Math.min(100, Math.round((enrolled / cap) * 100))

              return (
                <Card key={cls.id} className="overflow-hidden shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="bg-gray-50/70 dark:bg-gray-800/50 py-3.5 px-6 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {cls.name}
                        </CardTitle>
                        {getTierBadge(cls.name, cls.level)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {enrolled} Enrolled / {cap} Maximum Capacity ({pct}% Capacity)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900">
                        {cls.sections?.length || 0} {cls.sections?.length === 1 ? 'Arm / Section' : 'Arms / Sections'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Arm / Section Name</TableHead>
                          <TableHead className="text-xs">Classroom / Room</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-right text-xs">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cls.sections && cls.sections.length > 0 ? (
                          cls.sections.map((sec) => (
                            <TableRow key={sec.id}>
                              <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                                {sec.name}
                              </TableCell>
                              <TableCell className="text-xs font-mono text-blue-600">
                                {sec.room || 'General Classroom'}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Active Arm
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="text-xs h-7 text-blue-600">
                                  View Roster
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-xs text-gray-400">
                              No section assigned yet. Default Section A active.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal: Add New Class */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-blue-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Add New School Class</h2>
                    <p className="text-xs text-gray-500">Configure new grade level and initial classroom arm</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="p-6 space-y-4">
                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Quick Pick (Available School Classes):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_CLASSES.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`px-2.5 py-1 text-[11px] rounded-md font-medium border transition-colors ${
                          className === p.name
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Basic 1, Nursery 2, JSS 1"
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Level Order & Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Academic Level Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Student Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Initial Arm / Section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Arm / Section Name
                  </label>
                  <input
                    type="text"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g. Section A, Gold, Diamond"
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Description / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Early foundational learning cohort"
                    className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save & Create Class
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
