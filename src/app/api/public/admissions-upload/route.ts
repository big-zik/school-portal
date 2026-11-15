import { NextResponse } from 'next/server'
import { uploadFile } from '@/lib/storage'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'application/pdf']

// Public upload for admissions supporting documents only: fixed folder, JPG/PNG/PDF, max 5MB.
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Accepted files are JPG, PNG or PDF.' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Each file must be 5MB or smaller.' }, { status: 413 })
    }
    const result = await uploadFile(Buffer.from(await file.arrayBuffer()), file.name, file.type, 'admissions-documents')
    return NextResponse.json(
      { success: true, data: { url: result.url, key: result.key, name: file.name, size: file.size, type: file.type } },
      { status: 201 },
    )
  } catch {
    return NextResponse.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
