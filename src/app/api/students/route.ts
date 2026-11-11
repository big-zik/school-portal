import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')

    const students = await prisma.student.findMany({
      where: classId ? { currentClassId: classId } : {},
      include: {
        user: { select: { name: true, email: true, phone: true } },
        currentClass: { select: { name: true, level: true } },
        currentSection: { select: { name: true, roomNumber: true } },
      },
      take: 50,
    })

    return NextResponse.json({ success: true, data: students })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
