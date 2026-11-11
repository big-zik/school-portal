/**
 * File Storage Service - src/lib/storage/index.ts
 *
 * Unified file storage service supporting:
 *   - LOCAL  : Writes files to the local filesystem (dev / simple deployments)
 *   - S3     : AWS S3 (or any S3-compatible service, e.g. MinIO)
 *   - R2     : Cloudflare R2 (uses AWS SDK v3 with a custom endpoint)
 *
 * Provider selection is controlled by the STORAGE_PROVIDER environment variable.
 */

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime-types";

// ---------------------------------------------------------------------------
// Configuration helpers
// ---------------------------------------------------------------------------

type StorageProvider = "local" | "s3" | "r2";

function getProvider(): StorageProvider {
  const p = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  if (p === "s3" || p === "r2" || p === "local") return p as StorageProvider;
  console.warn(
    `[storage] Unknown STORAGE_PROVIDER "${p}", falling back to "local".`
  );
  return "local";
}

const PROVIDER = getProvider();
const LOCAL_DIR = process.env.LOCAL_UPLOAD_DIR ?? "./public/uploads";
const LOCAL_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getS3Client(): S3Client {
  const isR2 = PROVIDER === "r2";
  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    endpoint: isR2 ? process.env.CLOUDFLARE_R2_ENDPOINT : undefined,
    forcePathStyle: isR2 ? true : false,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });
}

function getBucket(): string {
  return process.env.AWS_S3_BUCKET ?? "";
}

// ---------------------------------------------------------------------------
// Upload result type
// ---------------------------------------------------------------------------

export interface UploadResult {
  /** Publicly accessible URL (or signed URL for private buckets). */
  url: string;
  /** Storage key / relative path used to reference the file later. */
  key: string;
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload a file buffer to the configured storage backend.
 *
 * @param file       Raw file buffer.
 * @param filename   Safe filename (use `generateSafeFilename` first).
 * @param folder     Logical sub-directory / S3 prefix (e.g. "avatars", "assignments").
 * @param mimeType   MIME type of the file.
 * @returns          Object containing `url` and `key`.
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  folder: string,
  mimeType: string
): Promise<UploadResult> {
  const key = `${folder}/${filename}`.replace(/\/+/g, "/");

  if (PROVIDER === "local") {
    return uploadLocal(file, key);
  }
  return uploadS3(file, key, mimeType);
}

async function uploadLocal(file: Buffer, key: string): Promise<UploadResult> {
  const dest = path.join(/*turbopackIgnore: true*/ process.cwd(), LOCAL_DIR, key);
  const dir = path.dirname(dest);

  if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(dest, file);

  // Strip the leading "." from the public dir path so the URL is correct.
  const publicPath = LOCAL_DIR.replace(/^\./, "");
  const url = `${LOCAL_BASE_URL}${publicPath}/${key}`;

  return { url, key };
}

async function uploadS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const client = getS3Client();
  const bucket = getBucket();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  // For public buckets return a direct URL; callers can generate signed URLs for private.
  const isR2 = PROVIDER === "r2";
  let url: string;
  if (isR2 && process.env.CLOUDFLARE_R2_ENDPOINT) {
    // Cloudflare R2 public bucket URL pattern (if public domain configured separately)
    url = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${bucket}/${key}`;
  } else {
    url = `https://${bucket}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
  }

  return { url, key };
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete a file from the configured storage backend.
 *
 * @param key  The storage key returned by `uploadFile`.
 */
export async function deleteFile(key: string): Promise<void> {
  if (PROVIDER === "local") {
    const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), LOCAL_DIR, key);
    if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  const client = getS3Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}

// ---------------------------------------------------------------------------
// Signed URL
// ---------------------------------------------------------------------------

/**
 * Generate a pre-signed URL giving temporary access to a private object.
 *
 * For LOCAL provider this falls back to a plain public URL (dev only).
 *
 * @param key              Storage key of the object.
 * @param expiresInSeconds Seconds until the URL expires.
 */
export async function getSignedUrl(
  key: string,
  expiresInSeconds: number
): Promise<string> {
  if (PROVIDER === "local") {
    // Local storage doesn't have access control — return a plain URL.
    const publicPath = LOCAL_DIR.replace(/^\./, "");
    return `${LOCAL_BASE_URL}${publicPath}/${key}`;
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  return awsGetSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

/** MIME type → accepted file extensions mapping for spoofing prevention. */
const MIME_EXTENSION_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "video/mp4": [".mp4"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "application/zip": [".zip"],
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file upload against configured limits and security rules.
 *
 * Checks performed:
 *  1. File size ≤ MAX_FILE_SIZE_MB.
 *  2. MIME type is in ALLOWED_FILE_TYPES.
 *  3. File extension matches the declared MIME type (prevents spoofing).
 */
export function validateFileUpload(file: {
  size: number;
  mimetype: string;
  originalname: string;
}): ValidationResult {
  // --- Size check ---
  const maxMb = Number(process.env.MAX_FILE_SIZE_MB ?? 50);
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed limit of ${maxMb} MB.`,
    };
  }

  // --- MIME type check ---
  const allowedTypes = (
    process.env.ALLOWED_FILE_TYPES ??
    "image/jpeg,image/png,image/webp,application/pdf"
  )
    .split(",")
    .map((t) => t.trim().toLowerCase());

  const incomingMime = file.mimetype.trim().toLowerCase();
  if (!allowedTypes.includes(incomingMime)) {
    return {
      valid: false,
      error: `File type "${file.mimetype}" is not permitted. Allowed types: ${allowedTypes.join(", ")}.`,
    };
  }

  // --- Extension vs MIME spoofing check ---
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ext) {
    return { valid: false, error: "File must have a valid extension." };
  }

  const allowedExtensions = MIME_EXTENSION_MAP[incomingMime];
  if (allowedExtensions && !allowedExtensions.includes(ext)) {
    // Also check via mime-types library for broader coverage.
    const derivedMime = mime.lookup(ext);
    if (!derivedMime || derivedMime !== incomingMime) {
      return {
        valid: false,
        error: `File extension "${ext}" does not match the declared MIME type "${file.mimetype}". This file may have been tampered with.`,
      };
    }
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Safe filename generation
// ---------------------------------------------------------------------------

/**
 * Sanitise an original filename and prepend a timestamp + UUID prefix
 * to guarantee uniqueness and prevent directory traversal attacks.
 *
 * @example
 * generateSafeFilename("My Report (Final).docx")
 * // => "1715000000000-3f2a...b1c2-my-report-final.docx"
 */
export function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    // Replace anything that's not alphanumeric, dash, or dot with a dash.
    .replace(/[^a-z0-9.\-]/gi, "-")
    // Collapse consecutive dashes.
    .replace(/-+/g, "-")
    // Trim leading/trailing dashes.
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60); // cap base length

  const timestamp = Date.now();
  const uid = uuidv4().replace(/-/g, "").slice(0, 12);

  return `${timestamp}-${uid}-${base || "file"}${ext}`;
}
