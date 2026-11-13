'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Send, Search, User, Paperclip, CheckCircle2, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface MessageThread {
  id: string
  recipientId: string
  sender: string
  role: string
  subject: string
  preview: string
  time: string
  unread: boolean
  messages: Array<{
    id: string
    sender: string
    text: string
    time: string
    isMe: boolean
  }>
}

const DEFAULT_THREADS: MessageThread[] = [
  {
    id: 't-1',
    recipientId: 'teacher-smith',
    sender: 'Dr. Robert Smith (Mathematics)',
    role: 'Teacher',
    subject: 'Clarification on Problem Set 4 Proofs',
    preview: 'Hello Daniel, excellent work on the coordinate transformation...',
    time: '10:30 AM',
    unread: true,
    messages: [
      {
        id: 'm-1',
        sender: 'Dr. Robert Smith',
        text: 'Hello Daniel, I reviewed your proof for question 18. You used an elegant algebraic substitution that was very insightful. Just remember to state the domain restrictions for real numbers.',
        time: '10:30 AM',
        isMe: false,
      },
    ],
  },
  {
    id: 't-2',
    recipientId: 'teacher-adebayo',
    sender: 'Mrs. Folashade Adebayo (Chemistry)',
    role: 'Teacher',
    subject: 'Lab Apparatus Preparation',
    preview: 'Please bring your lab safety goggles for Thursday...',
    time: 'Yesterday',
    unread: false,
    messages: [
      {
        id: 'm-2',
        sender: 'Mrs. Folashade Adebayo',
        text: 'Please remember to bring your approved laboratory coat and safety goggles for Thursday morning volumetric titration experiment.',
        time: 'Yesterday 03:15 PM',
        isMe: false,
      },
    ],
  },
  {
    id: 't-3',
    recipientId: 'admin-marcus',
    sender: 'Marcus Adeyemi (Academic Office)',
    role: 'Administrator',
    subject: 'National Science Olympiad Registration',
    preview: 'You have been shortlisted to represent Grade 10...',
    time: 'Feb 12',
    unread: false,
    messages: [
      {
        id: 'm-3',
        sender: 'Marcus Adeyemi',
        text: 'Congratulations Daniel, based on your First Term examination standing, you have been registered for the National Science Olympiad.',
        time: 'Feb 12 09:00 AM',
        isMe: false,
      },
    ],
  },
]

export default function StudentMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>(DEFAULT_THREADS)
  const [activeThread, setActiveThread] = useState('t-1')
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Group received/sent messages by contact
          const dbThreads: MessageThread[] = json.data.map((m: any) => ({
            id: m.id,
            recipientId: m.senderId,
            sender: m.sender?.name || 'School Staff',
            role: 'Staff',
            subject: m.subject || 'Message',
            preview: m.content?.slice(0, 60) + '...',
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: !m.isRead,
            messages: [
              {
                id: m.id,
                sender: m.sender?.name || 'Sender',
                text: m.content,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: false,
              },
            ],
          }))
          setThreads(dbThreads)
          setActiveThread(dbThreads[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const current = threads.find((t) => t.id === activeThread) || threads[0]

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const text = replyText.trim()
    setIsSending(true)

    // Add optimistically to current thread UI
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'Me',
      text,
      time: 'Just now',
      isMe: true,
    }

    setThreads((prev) =>
      prev.map((th) => (th.id === current.id ? { ...th, messages: [...th.messages, newMsg] } : th))
    )
    setReplyText('')

    try {
      // If thread has a valid backend recipientId, call POST /api/messages
      if (current.recipientId && !current.recipientId.startsWith('teacher-') && !current.recipientId.startsWith('admin-')) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: current.recipientId,
            subject: `Re: ${current.subject}`,
            content: text,
            parentMessageId: current.id.startsWith('t-') ? undefined : current.id,
          }),
        })
      } else {
        // Find first admin or teacher to send real message to
        const usersRes = await fetch('/api/teachers')
        if (usersRes.ok) {
          const teachersJson = await usersRes.json()
          const firstTeacher = teachersJson.data?.[0]?.userId || teachersJson.data?.[0]?.id
          if (firstTeacher) {
            await fetch('/api/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipientId: firstTeacher,
                subject: `Re: ${current.subject}`,
                content: text,
              }),
            })
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setIsSending(false)
    }
  }

  const filteredThreads = threads.filter(
    (th) =>
      th.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            School Messages & Communication
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Internal direct communication between students, teachers, and school administrators
          </p>
        </div>

        {/* 2-Column Chat Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Thread List */}
          <Card className="flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  className="pl-8 text-xs h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {filteredThreads.map((th) => (
                <div
                  key={th.id}
                  onClick={() => setActiveThread(th.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    activeThread === th.id
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate">
                      {th.sender}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{th.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                    {th.subject}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{th.preview}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Conversation Pane */}
          <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">{current.sender}</CardTitle>
                <p className="text-xs text-gray-500">{current.subject}</p>
              </div>
              <Badge variant="outline" className="text-[10px]">{current.role}</Badge>
            </CardHeader>

            <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
              {current.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${
                    msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </CardContent>

            <form onSubmit={handleSendReply} className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Input
                placeholder="Type your response..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="text-xs h-9"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSending}
                className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 gap-1.5"
              >
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5" />} Send
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
