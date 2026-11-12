'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Mail, User, Clock, CheckCircle2, Loader2 } from 'lucide-react'
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
  sender: { name: string; email: string }
  recipient: { name: string; email: string }
}

export default function ParentMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [showCompose, setShowCompose] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('teacher.smith@school.com')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const fetchMessages = () => {
    setLoading(true)
    fetch(`/api/messages?folder=${folder}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setMessages(json.data)
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMessages()
  }, [folder])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      // In demo environment, default recipientId to admin or teacher
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'admin-seed-id',
          subject,
          content,
        }),
      })
      setShowCompose(false)
      setSentSuccess(true)
      setSubject('')
      setContent('')
      setTimeout(() => setSentSuccess(false), 5000)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const sampleMessages: MessageItem[] = [
    {
      id: 'msg-1',
      subject: 'Academic Commendation - Daniel Johnson in Grade 10 Alpha',
      content:
        'Dear Chief Johnson, Daniel demonstrated stellar mastery on the recent Calculus midterm test, scoring top marks in the cohort. Keep encouraging his home study routine!',
      createdAt: new Date().toISOString(),
      sender: { name: 'Dr. Robert Smith', email: 'teacher.smith@school.com' },
      recipient: { name: 'Chief Michael Johnson', email: 'parent.johnson@school.com' },
    },
    {
      id: 'msg-2',
      subject: 'Notice: Mid-Term Exeat & STEM Exhibition Day',
      content:
        'Please be reminded that the CHOSEN GENERATION SCHOOL Science & Arts Exhibition will hold next Thursday. Parents are cordially invited to witness students project defenses.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      sender: { name: 'Marcus Adeyemi (Dean of Studies)', email: 'admin@school.com' },
      recipient: { name: 'Chief Michael Johnson', email: 'parent.johnson@school.com' },
    },
  ]

  const displayList = messages.length > 0 ? messages : sampleMessages

  return (
    <DashboardLayout role="PARENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Teacher & Administration Messaging
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              CHOSEN GENERATION SCHOOL — Two-way verified communication channel with educators
            </p>
          </div>

          <Button
            onClick={() => setShowCompose(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <Send className="w-4 h-4" />
            Send New Message
          </Button>
        </div>

        {sentSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Message successfully delivered to faculty dispatch queue!
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <Button
            variant={folder === 'inbox' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFolder('inbox')}
            className="text-xs"
          >
            Inbox ({displayList.length})
          </Button>
          <Button
            variant={folder === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFolder('sent')}
            className="text-xs"
          >
            Sent Messages
          </Button>
        </div>

        {/* Message Feed */}
        <div className="space-y-3">
          {displayList.map((msg) => (
            <Card key={msg.id} className="border border-gray-200 dark:border-gray-800 hover:border-blue-400 transition-colors shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {msg.sender.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-gray-100">{msg.sender.name}</span>
                      <span className="text-[11px] text-gray-400 ml-1.5 font-mono">({msg.sender.email})</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100">{msg.subject}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50/60 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                  {msg.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-lg p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Send Message to Educator</h2>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recipient</label>
                  <select
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full mt-1 h-9 text-xs rounded-md border border-gray-300 bg-white px-3 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="teacher.smith@school.com">Dr. Robert Smith (Senior Secondary Math)</option>
                    <option value="teacher.adebayo@school.com">Mrs. Folashade Adebayo (Chemistry Lead)</option>
                    <option value="admin@school.com">Marcus Adeyemi (Dean of Academic Affairs)</option>
                    <option value="accountant@school.com">Beatrice Okonjo (Bursary & Accounts)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subject</label>
                  <Input
                    required
                    placeholder="e.g. Inquiry regarding upcoming practical examination"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Message Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your message clearly here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full mt-1 p-2.5 text-xs rounded-md border border-gray-300 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending} className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    {sending ? 'Sending...' : 'Send Message'}
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
