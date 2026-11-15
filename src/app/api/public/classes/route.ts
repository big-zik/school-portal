import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Public, read-only list of classes for the admissions form (id, name, level only).
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      select: { id: true, name: true, level: true },
      orderBy: { level: 'asc' },
    })
    return NextResponse.json({ success: true, data: classes })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not load classes' }, { status: 500 })
  }
}
