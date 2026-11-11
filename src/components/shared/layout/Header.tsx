'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bell, MessageSquare, Search, Moon, Sun, LogOut, User, ShieldCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'
import { SessionUser } from '@/types'

interface HeaderProps {
  user?: SessionUser | null
  onToggleSidebar?: () => void
}

export function Header({ user, onToggleSidebar }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark')
    }
  }

  const primaryRole = user?.roles?.[0] || 'STUDENT'

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200/80 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search classes, students, notices..."
            className="h-9 w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-4 text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Messages, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Messages */}
        <Link
          href={`/${primaryRole.toLowerCase().replace('_', '-')}/messages`}
          className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          title="Messages"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-gray-900" />
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-4 z-50 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold">Notifications</span>
                <Badge variant="default" className="text-[10px]">3 New</Badge>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
                <div className="py-2.5">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Term 2 Exam Schedule Published</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Please check timetable for timetable updates.</p>
                  <span className="text-[10px] text-gray-400">10m ago</span>
                </div>
                <div className="py-2.5">
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Assignment Grade Released</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Dr. Smith graded Quadratic Equations (46.5/50).</p>
                  <span className="text-[10px] text-gray-400">2h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100">
                {user?.name || 'Academic User'}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                {primaryRole.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{primaryRole}</span>
                </div>
              </div>
              <Link
                href={`/${primaryRole.toLowerCase().replace('_', '-')}/profile`}
                className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile & Settings</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
