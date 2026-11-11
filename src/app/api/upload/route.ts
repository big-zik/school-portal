import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadFile } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type, folder)

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
