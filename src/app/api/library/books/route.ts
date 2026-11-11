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
