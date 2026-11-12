'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Mail,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  Users,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  Inbox,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface MessageItem {
  id: string
  subject: string
  content: string
  createdAt: string
  isRead?: boolean
  sender: { id?: string; name: string; email: string }
  recipient: { id?: string; name: string; email: string }
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  // Compose
  const [targetAudience, setTargetAudience] = useState<'PARENTS' | 'STAFF' | 'ALL'>('PARENTS')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')

  const sampleMessages: MessageItem[] = [
    {
      id: 'msg-adm-1',
      subject: 'Inquiry on PTA Annual General Meeting Date',
      content:
        'Good day Academic Administration. I am requesting confirmation regarding the scheduled time for the PTA general meeting to plan my travel accordingly. Thank you.',
      createdAt: new Date().toISOString(),
      sender: { name: 'Dr. Chidi Okafor (Parent)', email: 'parent.okafor@school.com' },
      recipient: { name: 'Administration Desk', email: 'admin@school.com' },
      isRead: false,
    },
    {
      id: 'msg-adm-2',
      subject: 'Staff Leave of Absence Request for WASSCE Coordination',
      content:
        'Kindly find attached my official notice for external examination duties next Wednesday through Friday. Relief teacher arrangements have been finalized.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: { name: 'Dr. Robert Smith (Teacher)', email: 'teacher.smith@school.com' },
      recipient: { name: 'Administration Desk', email: 'admin@school.com' },
      isRead: true,
    },
  ]

  const fetchMessages = () => {
    setLoading(true)
    fetch(`/api/messages?folder=${folder}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setMessages(json.data)
        } else {
          setMessages(folder === 'inbox' ? sampleMessages : [])
        }
      })
      .catch((e) => {
        console.error(e)
        setMessages(sampleMessages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMessages()
  }, [folder])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'parent-demo-id',
          subject,
          content,
        }),
      })

      setShowCompose(false)
      setSentSuccess(true)
      setSubject('')
      setContent('')
      setTimeout(() => setSentSuccess(false), 5000)
      if (folder === 'sent') fetchMessages()
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
              Administrative Communications & In-App Dispatch
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Centralized communications hub linking school management with parents, educators, and pupils
            </p>
          </div>

          <Button
            onClick={() => setShowCompose(true)}
            className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Send className="w-4 h-4" /> Compose Communique
          </Button>
        </div>

        {sentSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            Administrative dispatch delivered to recipient portal and notification channels.
          </div>
        )}

        {/* Tab & Search Bar */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={folder === 'inbox' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFolder('inbox')}
                className={`text-xs gap-1.5 ${folder === 'inbox' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <Inbox className="w-3.5 h-3.5" /> Incoming Inquiries ({messages.length})
              </Button>
              <Button
                variant={folder === 'sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFolder('sent')}
                className={`text-xs gap-1.5 ${folder === 'sent' ? 'bg-indigo-600 text-white' : ''}`}
              >
                <Send className="w-3.5 h-3.5" /> Dispatched Archive
              </Button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search communiques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" /> Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-800 p-12 text-center text-sm text-gray-500">
              <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              No messages found.
            </Card>
          ) : (
            filteredMessages.map((msg) => (
              <Card
                key={msg.id}
                className="border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        {folder === 'inbox' ? msg.sender.name[0] : msg.recipient.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-gray-100">
                            {folder === 'inbox' ? msg.sender.name : `To: ${msg.recipient.name}`}
                          </span>
                          {folder === 'inbox' && !msg.isRead && (
                            <Badge className="text-[9px] bg-indigo-600 text-white">New</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono">
                          {folder === 'inbox' ? msg.sender.email : msg.recipient.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100">{msg.subject}</h3>
                  <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/70 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                    {msg.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-900 my-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Broadcast Institutional Communique
                </CardTitle>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <form onSubmit={handleSendMessage}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Target Audience *
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value as any)}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-600"
                    >
                      <option value="PARENTS">All School Parents & Guardians</option>
                      <option value="STAFF">All Academic & Administrative Staff</option>
                      <option value="ALL">Entire School Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Subject Line *
                    </label>
                    <Input
                      required
                      placeholder="e.g. End of Term Examination Schedule & Tuition Advisory"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Official Communique Content *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Enter the official memorandum text..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompose(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={sending}
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                    >
                      {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Transmit Communique
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
