'use client'

import React, { useState } from 'react'
import {
  Library,
  BookOpen,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books')

  const books = [
    { id: 'BK-001', title: 'New General Mathematics for SS 1', author: 'M.F. Macrae et al.', isbn: '978-978-08-0382-7', category: 'Mathematics', copies: 40, available: 38, location: 'Shelf M-02' },
    { id: 'BK-002', title: 'Comprehensive Certificate Chemistry', author: 'G.N.C. Ohia & F.A. Adebayo', isbn: '978-978-12-8901-2', category: 'Sciences', copies: 25, available: 22, location: 'Shelf S-05' },
    { id: 'BK-003', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', category: 'Literature', copies: 50, available: 45, location: 'Shelf L-01' },
    { id: 'BK-004', title: 'College Physics: Principles with Applications', author: 'Douglas C. Giancoli', isbn: '978-0321762429', category: 'Physics', copies: 20, available: 16, location: 'Shelf P-03' },
    { id: 'BK-005', title: 'Modern Biology for Senior Secondary Schools', author: 'Sarojini T. Ramalingam', isbn: '978-978-175-012-3', category: 'Biology', copies: 30, available: 29, location: 'Shelf B-01' },
  ]

  const activeLoans = [
    { loanId: 'LN-2025-042', book: 'Things Fall Apart', student: 'Daniel Johnson (STU2024001)', issuedDate: 'Feb 05, 2025', dueDate: 'Feb 19, 2025', status: 'ACTIVE' },
    { loanId: 'LN-2025-039', book: 'College Physics', student: 'Amara Okafor (STU2024002)', issuedDate: 'Jan 28, 2025', dueDate: 'Feb 11, 2025', status: 'OVERDUE' },
  ]

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
              <Library className="w-6 h-6 text-blue-600" />
              Library & E-Resource Catalog
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Physical inventory management, digital resource links, and student book circulation loans
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold">
              <PlusCircle className="w-4 h-4" /> Add New Book
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'books'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Book Inventory (165 titles)
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Active Book Loans (23 active)
          </button>
        </div>

        {/* Table View */}
        {activeTab === 'books' ? (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Book Repository</CardTitle>
              <div className="w-64">
                <Input placeholder="Search by title, author, or ISBN..." className="text-xs h-8" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book ID</TableHead>
                    <TableHead>Title & Details</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Total Copies</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs text-gray-500">{b.id}</TableCell>
                      <TableCell>
                        <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">{b.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ISBN: {b.isbn}</p>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-300">{b.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{b.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold">{b.copies}</TableCell>
                      <TableCell className="text-center text-xs font-bold text-emerald-600">{b.available}</TableCell>
                      <TableCell className="text-xs font-mono text-gray-500">{b.location}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Student Book Circulation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.map((l) => (
                    <TableRow key={l.loanId}>
                      <TableCell className="font-mono text-xs text-gray-500">{l.loanId}</TableCell>
                      <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">{l.book}</TableCell>
                      <TableCell className="text-xs text-gray-600">{l.student}</TableCell>
                      <TableCell className="text-xs text-gray-500">{l.issuedDate}</TableCell>
                      <TableCell className="text-xs text-gray-500 font-semibold">{l.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={l.status === 'OVERDUE' ? 'destructive' : 'success'} className="text-[10px]">
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Return Book
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
