'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SessionUser, UserRole } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: SessionUser | null
  role?: UserRole
}

export function DashboardLayout({ children, user, role = 'STUDENT' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Use primary role from user if available
  const effectiveRole = user?.roles?.[0] || role

  return (
    <div className="flex min-h-screen bg-gray-50/60 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        role={effectiveRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
