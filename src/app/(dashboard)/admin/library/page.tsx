'use client'

import React, { useState, useEffect } from 'react'
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
  Loader2,
  X,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout'

interface BookItem {
  id: string
  title: string
  author: string
  isbn?: string | null
  category?: string | null
  totalCopies: number
  availableCopies: number
  location?: string | null
}

interface LoanItem {
  id: string
  book: { id: string; title: string; author: string }
  student: { id: string; admissionNumber: string; user: { name: string } }
  issuedDate: string
  dueDate: string
  status: string
}

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'loans'>('books')
  const [books, setBooks] = useState<BookItem[]>([])
  const [loans, setLoans] = useState<LoanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Add Book Modal State
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [isSubmittingBook, setIsSubmittingBook] = useState(false)
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookIsbn, setBookIsbn] = useState('')
  const [bookCategory, setBookCategory] = useState('Mathematics')
  const [bookCopies, setBookCopies] = useState('10')
  const [bookLocation, setBookLocation] = useState('Shelf A-01')
  const [bookError, setBookError] = useState('')

  // Issue Loan Modal State
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState('')
  const [studentIdentifier, setStudentIdentifier] = useState('')
  const [loanDueDate, setLoanDueDate] = useState('')
  const [loanError, setLoanError] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const defaultBooks: BookItem[] = [
    { id: 'BK-001', title: 'New General Mathematics for SS 1', author: 'M.F. Macrae et al.', isbn: '978-978-08-0382-7', category: 'Mathematics', totalCopies: 40, availableCopies: 38, location: 'Shelf M-02' },
    { id: 'BK-002', title: 'Comprehensive Certificate Chemistry', author: 'G.N.C. Ohia & F.A. Adebayo', isbn: '978-978-12-8901-2', category: 'Sciences', totalCopies: 25, availableCopies: 22, location: 'Shelf S-05' },
    { id: 'BK-003', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', category: 'Literature', totalCopies: 50, availableCopies: 45, location: 'Shelf L-01' },
    { id: 'BK-004', title: 'College Physics: Principles with Applications', author: 'Douglas C. Giancoli', isbn: '978-0321762429', category: 'Physics', totalCopies: 20, availableCopies: 16, location: 'Shelf P-03' },
    { id: 'BK-005', title: 'Modern Biology for Senior Secondary Schools', author: 'Sarojini T. Ramalingam', isbn: '978-978-175-012-3', category: 'Biology', totalCopies: 30, availableCopies: 29, location: 'Shelf B-01' },
  ]

  const loadData = async () => {
    setLoading(true)
    try {
      const [booksRes, loansRes] = await Promise.all([
        fetch('/api/library/books'),
        fetch('/api/library/loans'),
      ])

      if (booksRes.ok) {
        const booksData = await booksRes.json()
        if (booksData.success && Array.isArray(booksData.data) && booksData.data.length > 0) {
          setBooks(booksData.data)
        } else {
          setBooks(defaultBooks)
        }
      } else {
        setBooks(defaultBooks)
      }

      if (loansRes.ok) {
        const loansData = await loansRes.json()
        if (loansData.success && Array.isArray(loansData.data)) {
          setLoans(loansData.data)
        }
      }
    } catch (err) {
      console.error('Error loading library data:', err)
      setBooks(defaultBooks)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookError('')
    setIsSubmittingBook(true)

    try {
      const res = await fetch('/api/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn || undefined,
          category: bookCategory,
          totalCopies: parseInt(bookCopies, 10) || 1,
          location: bookLocation,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setShowAddBookModal(false)
        setBookTitle('')
        setBookAuthor('')
        setBookIsbn('')
        setNotification({ type: 'success', message: 'Book successfully registered into catalog' })
        setTimeout(() => setNotification(null), 4000)
        loadData()
      } else {
        setBookError(data.error || 'Failed to add book')
      }
    } catch (err: any) {
      setBookError(err.message || 'Network error occurred')
    } finally {
      setIsSubmittingBook(false)
    }
  }

  const handleIssueLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoanError('')
    setIsSubmittingLoan(true)

    try {
      const res = await fetch('/api/library/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue',
          bookId: selectedBookId,
          studentId: studentIdentifier,
          dueDate: loanDueDate || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setShowIssueModal(false)
        setStudentIdentifier('')
        setSelectedBookId('')
        setNotification({ type: 'success', message: 'Book loan issued successfully' })
        setTimeout(() => setNotification(null), 4000)
        loadData()
      } else {
        setLoanError(data.error || 'Failed to issue loan')
      }
    } catch (err: any) {
      setLoanError(err.message || 'Network error occurred')
    } finally {
      setIsSubmittingLoan(false)
    }
  }

  const handleReturnLoan = async (loanId: string) => {
    try {
      const res = await fetch('/api/library/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return', loanId }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: 'Book returned and inventory updated' })
        setTimeout(() => setNotification(null), 4000)
        loadData()
      } else {
        alert(data.error || 'Failed to return loan')
      }
    } catch (err: any) {
      alert(err.message || 'Network error')
    }
  }

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowIssueModal(true)}
              className="text-xs gap-1.5 font-semibold"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" /> Issue Loan
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddBookModal(true)}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              <PlusCircle className="w-4 h-4" /> Add New Book
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {notification && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

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
            Book Inventory ({books.length} titles)
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Active Book Loans ({loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length} active)
          </button>
        </div>

        {/* Table View */}
        {activeTab === 'books' ? (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Book Repository</CardTitle>
              <div className="w-64">
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  className="text-xs h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-xs text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
                        Loading catalog...
                      </TableCell>
                    </TableRow>
                  ) : filteredBooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-xs text-gray-500">
                        No books found matching query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBooks.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs text-gray-500">{b.id.slice(0, 10)}</TableCell>
                        <TableCell>
                          <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">{b.title}</p>
                          {b.isbn && <p className="text-[10px] text-gray-400 font-mono">ISBN: {b.isbn}</p>}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-300">{b.author}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{b.category || 'General'}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold">{b.totalCopies}</TableCell>
                        <TableCell className="text-center text-xs font-bold text-emerald-600">{b.availableCopies}</TableCell>
                        <TableCell className="text-xs font-mono text-gray-500">{b.location || 'Library'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-xs text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-blue-600" />
                        Loading loan records...
                      </TableCell>
                    </TableRow>
                  ) : loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-xs text-gray-500">
                        No active book loans on record.
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-mono text-xs text-gray-500">{l.id.slice(0, 10)}</TableCell>
                        <TableCell className="font-semibold text-xs text-gray-900 dark:text-gray-100">{l.book?.title}</TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {l.student?.user?.name} ({l.student?.admissionNumber})
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{new Date(l.issuedDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs text-gray-500 font-semibold">{new Date(l.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={l.status === 'OVERDUE' ? 'destructive' : l.status === 'RETURNED' ? 'outline' : 'default'}
                            className="text-[10px]"
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {l.status !== 'RETURNED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturnLoan(l.id)}
                              className="text-xs h-7 text-blue-600 hover:text-blue-700"
                            >
                              Return Book
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Modal: Add New Book */}
        {showAddBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" /> Add Book to Catalog
                </h3>
                <button onClick={() => setShowAddBookModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {bookError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {bookError}
                </div>
              )}

              <form onSubmit={handleAddBook} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Book Title *</label>
                  <Input
                    required
                    placeholder="e.g. New General Mathematics for SS 1"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Author *</label>
                    <Input
                      required
                      placeholder="e.g. M.F. Macrae"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">ISBN</label>
                    <Input
                      placeholder="e.g. 978-978-08-0382-7"
                      value={bookIsbn}
                      onChange={(e) => setBookIsbn(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
                    <Input
                      value={bookCategory}
                      onChange={(e) => setBookCategory(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total Copies</label>
                    <Input
                      type="number"
                      min="1"
                      value={bookCopies}
                      onChange={(e) => setBookCopies(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Location</label>
                    <Input
                      value={bookLocation}
                      onChange={(e) => setBookLocation(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddBookModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingBook}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmittingBook ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Save Book
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Issue Loan */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" /> Issue Book Loan
                </h3>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loanError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                  {loanError}
                </div>
              )}

              <form onSubmit={handleIssueLoan} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Book *</label>
                  <select
                    required
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(e.target.value)}
                    className="w-full text-xs h-9 rounded-md border border-gray-300 bg-white px-3 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="">-- Choose Book from Catalog --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                        {b.title} ({b.availableCopies} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Student Admission Number or ID *
                  </label>
                  <Input
                    required
                    placeholder="e.g. STU2024001"
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Due Date</label>
                  <Input
                    type="date"
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    className="text-xs h-9"
                  />
                  <p className="text-[10px] text-gray-400">Defaults to 14 days from today if left empty.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIssueModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingLoan}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSubmittingLoan ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Issue Loan
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
