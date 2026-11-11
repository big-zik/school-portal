import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')
    const teacherId = searchParams.get('teacherId')

    const where: any = { deletedAt: null }
    if (classId) where.classId = classId
    if (subjectId) where.subjectId = subjectId
    if (teacherId) where.teacherId = teacherId

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true, level: true } },
        teacher: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { dueDate: 'desc' },
    })

    return NextResponse.json({ success: true, data: assignments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = session.user.roles || []
    const isTeacher = roles.includes('TEACHER')
    const isAdmin = roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')

    if (!isTeacher && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      instructions,
      classId,
      subjectId,
      dueDate,
      totalMarks,
      allowLateSubmission,
      latePenalty,
      isPublished,
      attachments,
    } = body

    if (!title || !classId || !subjectId || !dueDate || totalMarks === undefined) {
      return NextResponse.json({ error: 'Missing required assignment fields' }, { status: 400 })
    }

    // Resolve teacher record
    let teacherRecord = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
    })

    if (!teacherRecord && isAdmin) {
      teacherRecord = await prisma.teacher.findFirst()
    }

    if (!teacherRecord) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 400 })
    }

    // Resolve active term & academic year
    const activeTerm = await prisma.term.findFirst({
      where: { isCurrent: true },
      include: { academicYear: true },
    })

    const termId = activeTerm?.id || (await prisma.term.findFirst())?.id
    const academicYearId = activeTerm?.academicYearId || (await prisma.academicYear.findFirst())?.id

    if (!termId || !academicYearId) {
      return NextResponse.json({ error: 'Academic term or year not configured' }, { status: 400 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        instructions,
        classId,
        subjectId,
        teacherId: teacherRecord.id,
        termId,
        academicYearId,
        dueDate: new Date(dueDate),
        totalMarks: Number(totalMarks),
        allowLateSubmission: Boolean(allowLateSubmission),
        latePenalty: latePenalty ? Number(latePenalty) : null,
        isPublished: Boolean(isPublished),
        attachments: attachments || null,
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      module: 'ACADEMICS',
      entityType: 'Assignment',
      entityId: assignment.id,
      newValue: { title, classId, subjectId, totalMarks },
    })

    return NextResponse.json({ success: true, data: assignment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
