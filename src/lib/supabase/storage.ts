import { createServerSupabaseClient } from './server'

const RECEIPT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_RECEIPTS || 'receipts'
const DOCS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET_DOCS || 'documents'

export interface StorageUploadResult {
  success: boolean
  url: string
  path: string
  error?: string
}

/**
 * Uploads a file buffer to Supabase Storage bucket.
 * Returns public or signed URL.
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string = 'application/octet-stream',
  isPublic: boolean = false
): Promise<StorageUploadResult> {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      url: '',
      path: '',
      error: 'Supabase storage is not configured (missing URL or Service Key)',
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.error('[Supabase Storage] Upload error:', error)
      return { success: false, url: '', path: '', error: error.message }
    }

    if (isPublic) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path)

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: data.path,
      }
    }

    // For private buckets (like bank receipts), generate a signed URL valid for 24 hours
    const { data: signedData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(data.path, 86400) // 24 hours

    if (signError || !signedData) {
      return {
        success: true,
        url: data.path,
        path: data.path,
      }
    }

    return {
      success: true,
      url: signedData.signedUrl,
      path: data.path,
    }
  } catch (err: any) {
    console.error('[Supabase Storage] Unexpected error:', err)
    return { success: false, url: '', path: '', error: err.message }
  }
}

/**
 * Upload a payment receipt to the private receipts bucket
 */
export async function uploadPaymentReceipt(
  fileName: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string
): Promise<StorageUploadResult> {
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `receipts/${Date.now()}_${sanitized}`
  return uploadToSupabaseStorage(RECEIPT_BUCKET, path, fileBuffer, contentType, false)
}

/**
 * Generate a fresh signed URL for a private receipt file
 */
export async function getReceiptSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .createSignedUrl(filePath, expiresInSeconds)

    if (error || !data) return null
    return data.signedUrl
  } catch {
    return null
  }
}
