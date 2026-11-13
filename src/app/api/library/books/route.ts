import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import type { ApiResponse } from '@/types'

// GET /api/library/books — list library books with search & category filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')

    const where: any = { deletedAt: null }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { isbn: { contains: query, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: 'asc' },
      take: 100,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: books,
    })
  } catch (error: any) {
    console.error('GET /api/library/books error:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}

// POST /api/library/books — add a new book to catalog
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userRoles = ((session.user as any).roles || []) as string[]
    const allowed = ['SUPER_ADMIN', 'ADMIN', 'LIBRARIAN', 'TEACHER']
    if (!allowed.some((role) => userRoles.includes(role))) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { title, author, isbn, publisher, publishedYear, category, totalCopies, location, description } = body

    if (!title || !author) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Title and author are required' },
        { status: 400 }
      )
    }

    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'School not configured' }, { status: 400 })
    }

    const copiesCount = Number(totalCopies) > 0 ? Number(totalCopies) : 1

    const book = await prisma.book.create({
      data: {
        schoolId: school.id,
        title: title.trim(),
        author: author.trim(),
        isbn: isbn ? isbn.trim() : null,
        publisher: publisher ? publisher.trim() : null,
        publishYear: publishedYear ? Number(publishedYear) : null,
        category: category ? category.trim() : 'General',
        totalCopies: copiesCount,
        availableCopies: copiesCount,
        location: location ? location.trim() : null,
        description: description ? description.trim() : null,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: book,
        message: 'Book added to library catalog successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST /api/library/books error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A book with this ISBN already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json<ApiResponse>({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
