'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
  Loader2,
  X,
  Upload,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface EResource {
  id: string
  title: string
  description?: string
  type: 'PDF' | 'VIDEO' | 'LINK' | 'DOCUMENT'
  url?: string
  file?: string
  subject?: { name: string }
  class?: { name: string }
  uploadedBy?: { name: string }
  createdAt: string
}

export default function TeacherResourcesPage() {
  const [resources, setResources] = useState<EResource[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')

  // Upload Modal
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'PDF',
    classId: '',
    subjectId: '',
    description: '',
    url: '',
    file: '',
  })

  const fetchResources = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/resources')
      const json = await res.json()
      if (json.success && json.data) {
        setResources(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetadata = async () => {
    try {
      const [clsRes, subRes] = await Promise.all([fetch('/api/classes'), fetch('/api/subjects')])
      const clsJson = await clsRes.json()
      const subJson = await subRes.json()
      if (clsJson.data) setClasses(clsJson.data)
      if (subJson.data) setSubjects(subJson.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchResources()
    fetchMetadata()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })
      const json = await res.json()
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, file: json.data.url }))
      } else {
        alert(json.error || 'Failed to upload document')
      }
    } catch (err: any) {
      alert(err.message || 'Upload error')
    } finally {
      setFileUploading(false)
    }
  }

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          classId: formData.classId || null,
          subjectId: formData.subjectId || null,
          description: formData.description,
          url: formData.url || null,
          file: formData.file || null,
        }),
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          title: '',
          type: 'PDF',
          classId: '',
          subjectId: '',
          description: '',
          url: '',
          file: '',
        })
        fetchResources()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save resource')
      }
    } catch (err: any) {
      alert(err.message || 'Error saving resource')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this learning resource?')) return
    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'ALL' || r.type === selectedType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'VIDEO':
        return <Video className="w-5 h-5 text-blue-500" />
      case 'LINK':
        return <LinkIcon className="w-5 h-5 text-emerald-500" />
      default:
        return <BookOpen className="w-5 h-5 text-purple-500" />
    }
  }

  return (
    <DashboardLayout role="TEACHER">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-purple-600" />
              E-Learning Curriculum & Notes Repository
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish lecture slides, syllabus guides, PDF lesson notes, past questions, and video links for students
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Learning Resource
          </Button>
        </div>

        {/* Filter Strip */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search resources, topics, past questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-gray-500 font-medium">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Formats</option>
                  <option value="PDF">PDF Documents</option>
                  <option value="VIDEO">Video Tutorials</option>
                  <option value="DOCUMENT">Lesson Notes</option>
                  <option value="LINK">External References</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" /> Loading learning materials...
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 p-12 text-center text-sm text-gray-500">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            No e-learning resources found. Click "Upload Learning Resource" to share course materials.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((res) => {
              const targetUrl = res.file || res.url
              return (
                <Card
                  key={res.id}
                  className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        {getTypeIcon(res.type)}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        {res.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mt-2">
                      {res.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {res.subject && (
                        <Badge className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-normal">
                          {res.subject.name}
                        </Badge>
                      )}
                      {res.class && (
                        <Badge variant="outline" className="text-[10px] text-gray-600 dark:text-gray-400">
                          {res.class.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    {res.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {res.description}
                      </p>
                    )}

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {targetUrl && (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100"
                          >
                            <ExternalLink className="w-3 h-3" /> View / Download
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(res.id)}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Upload Resource Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Publish Learning Material
                </CardTitle>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleCreateResource}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Resource Title *
                    </label>
                    <Input
                      required
                      placeholder="e.g. SS 2 Term 2 Organic Chemistry Notes & Schemes"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Format / Type *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="PDF">PDF Document / Handout</option>
                        <option value="DOCUMENT">Lesson Scheme / Word Doc</option>
                        <option value="VIDEO">Video Tutorial</option>
                        <option value="LINK">Web Link / Reference</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Subject
                      </label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">General / All Subjects</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Target Class
                    </label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'VIDEO' || formData.type === 'LINK' ? (
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Video / External URL *
                      </label>
                      <Input
                        required
                        placeholder="https://youtube.com/watch?v=... or https://khanacademy.org/..."
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        Upload Document / PDF File
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          onChange={handleFileUpload}
                          className="text-xs"
                        />
                        {fileUploading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
                      </div>
                      {formData.file && (
                        <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                          File uploaded: {formData.file}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Description / Learning Objectives
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Summary of topics covered, prerequisites, or required readings..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploading || fileUploading}
                      size="sm"
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                    >
                      {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Publish Resource
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
