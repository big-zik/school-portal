import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            currentClass: { select: { name: true } },
          },
        },
        invoiceItems: true,
        payments: true,
      },
      take: 50,
      orderBy: { generatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: invoices })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
