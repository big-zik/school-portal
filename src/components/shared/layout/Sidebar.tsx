'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  BookOpen,
  FileText,
  CreditCard,
  MessageSquare,
  Users,
  Building,
  Bus,
  ShieldAlert,
  Settings,
  HelpCircle,
  X,
  Library,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

interface SidebarProps {
  role: UserRole
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    switch (role) {
      case 'STUDENT':
        return [
          {
            section: 'Academic',
            items: [
              { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
              { label: 'Class Timetable', href: '/student/timetable', icon: Calendar },
              { label: 'My Attendance', href: '/student/attendance', icon: ClipboardCheck },
              { label: 'Assignments', href: '/student/assignments', icon: FileText, badge: '2 Due' },
              { label: 'Grades & Results', href: '/student/grades', icon: GraduationCap },
              { label: 'Learning Resources', href: '/student/resources', icon: BookOpen },
            ],
          },
          {
            section: 'Communication & Finance',
            items: [
              { label: 'Fee Payments', href: '/student/fees', icon: CreditCard },
              { label: 'Messages', href: '/student/messages', icon: MessageSquare },
            ],
          },
        ]

      case 'PARENT':
        return [
          {
            section: 'Children Overview',
            items: [
              { label: 'Parent Dashboard', href: '/parent', icon: LayoutDashboard },
              { label: 'School Circulars', href: '/parent/announcements', icon: Bell, badge: 'New' },
              { label: 'Children Academic', href: '/parent/children', icon: Users },
              { label: 'Timetables & Exams', href: '/parent/timetables', icon: Calendar },
              { label: 'Attendance Records', href: '/parent/attendance', icon: ClipboardCheck },
              { label: 'Report Cards', href: '/parent/grades', icon: GraduationCap },
            ],
          },
          {
            section: 'Services & Fees',
            items: [
              { label: 'Fee Invoices & Pay', href: '/parent/fees', icon: CreditCard, badge: 'Pay / Upload' },
              { label: 'School Helpdesk & Info', href: '/parent/support', icon: HelpCircle },
              { label: 'Teacher Meetings', href: '/parent/meetings', icon: Calendar },
              { label: 'School Messages', href: '/parent/messages', icon: MessageSquare },
            ],
          },
        ]

      case 'TEACHER':
        return [
          {
            section: 'Instruction',
            items: [
              { label: 'Teacher Dashboard', href: '/teacher', icon: LayoutDashboard },
              { label: 'Assigned Classes', href: '/teacher/classes', icon: Users },
              { label: 'Take Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
              { label: 'Assignments & Tasks', href: '/teacher/assignments', icon: FileText },
              { label: 'Continuous Assessment', href: '/teacher/grades', icon: GraduationCap },
              { label: 'Upload Resources', href: '/teacher/resources', icon: BookOpen },
            ],
          },
          {
            section: 'Communication',
            items: [
              { label: 'Student & Parent Chat', href: '/teacher/messages', icon: MessageSquare },
            ],
          },
        ]

      case 'SUPER_ADMIN':
      case 'ADMIN':
      default:
        return [
          {
            section: 'Administration',
            items: [
              { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
              { label: 'Admissions Registry', href: '/admin/admissions', icon: GraduationCap },
              { label: 'Students', href: '/admin/students', icon: Users },
              { label: 'Teachers & Staff', href: '/admin/teachers', icon: Users },
              { label: 'Parents', href: '/admin/parents', icon: Users },
              { label: 'Classes & Sections', href: '/admin/classes', icon: Building },
              { label: 'Timetable Scheduling', href: '/admin/timetable', icon: Calendar },
            ],
          },
          {
            section: 'Operations & Finance',
            items: [
              { label: 'Fee Management', href: '/admin/fees', icon: CreditCard },
              { label: 'Attendance Analytics', href: '/admin/attendance', icon: ClipboardCheck },
              { label: 'Examinations & Reports', href: '/admin/reports', icon: GraduationCap },
              { label: 'Library Catalog', href: '/admin/library', icon: Library },
              { label: 'Transport Fleet', href: '/admin/transport', icon: Bus },
              { label: 'Hostel Boarding', href: '/admin/hostel', icon: Building },
            ],
          },
          {
            section: 'System & Security',
            items: [
              { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: ShieldAlert },
              { label: 'School Settings', href: '/admin/settings', icon: Settings },
            ],
          },
        ]
    }
  }

  const navSections = getNavItems()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200/80 bg-white dark:bg-gray-900 dark:border-gray-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200/80 dark:border-gray-800 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-gray-100">
                CHOSEN GENERATION
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                School Portal
              </span>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {sec.section}
              </h4>
              <div className="mt-1 space-y-0.5">
                {sec.items.map((item) => {
                  const isActive =
                    item.href === '/admin' || item.href === '/student' || item.href === '/teacher' || item.href === '/parent'
                      ? pathname === item.href
                      : pathname.startsWith(item.href)

                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm font-semibold'
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400')} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Help & Version info */}
        <div className="border-t border-gray-200/80 dark:border-gray-800 p-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-800/50 p-3 border border-blue-100/50 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Help & Support</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Need assistance? Contact admin office or IT desk.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
