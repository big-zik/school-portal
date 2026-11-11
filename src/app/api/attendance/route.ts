import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { classId, subjectId, date, records } = body

    if (!classId || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Save attendance batch
    const results = []
    for (const r of records) {
      const rec = await prisma.attendance.upsert({
        where: {
          studentId_classId_subjectId_date: {
            studentId: r.studentId,
            classId,
            subjectId: subjectId || '',
            date: new Date(date || Date.now()),
          },
        },
        update: {
          status: r.status,
          remarks: r.remarks,
        },
        create: {
          studentId: r.studentId,
          classId,
          subjectId,
          date: new Date(date || Date.now()),
          status: r.status,
          remarks: r.remarks,
          markedById: session.user.id,
          termId: r.termId || 'term-2-2025',
          academicYearId: r.academicYearId || 'ay-2024-2025',
        },
      })
      results.push(rec)
    }

    // Audit log
    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'ATTENDANCE',
      entityType: 'AttendanceRegister',
      entityId: classId,
      newValue: { count: records.length, date },
    })

    return NextResponse.json({ success: true, count: results.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
