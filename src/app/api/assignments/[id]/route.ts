import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'
import { logAudit } from '@/lib/auth/audit'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true, level: true } },
        teacher: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
            grade: true,
          },
        },
      },
    })

    if (!assignment || assignment.deletedAt) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: assignment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    const existing = await prisma.assignment.findUnique({ where: { id } })
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(classId !== undefined && { classId }),
        ...(subjectId !== undefined && { subjectId }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(totalMarks !== undefined && { totalMarks: parseFloat(totalMarks) }),
        ...(allowLateSubmission !== undefined && { allowLateSubmission }),
        ...(latePenalty !== undefined && { latePenalty: latePenalty ? parseFloat(latePenalty) : null }),
        ...(isPublished !== undefined && { isPublished }),
        ...(attachments !== undefined && { attachments }),
      },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    })

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE',
      module: 'ACADEMICS',
      entityType: 'Assignment',
      entityId: id,
      newValue: { title: updated.title, dueDate: updated.dueDate },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updated = await prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await logAudit({
      userId: session.user.id,
      action: 'DELETE',
      module: 'ACADEMICS',
      entityType: 'Assignment',
      entityId: id,
    })

    return NextResponse.json({ success: true, message: 'Assignment deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
