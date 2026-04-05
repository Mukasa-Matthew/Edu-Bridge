import fs from 'fs/promises'
import path from 'path'

/**
 * Resolve and read a file under upload root. Throws if path escapes root.
 * @param {string} uploadRoot
 * @param {string} relRaw — e.g. materials/pdf/uuid.pdf
 */
export async function readUploadFile(uploadRoot, relRaw) {
  const rel = relRaw.replace(/^\/+/, '').replace(/\\/g, '/')
  const abs = path.join(uploadRoot, rel)
  const root = path.resolve(uploadRoot)
  if (!abs.startsWith(root)) {
    const err = new Error('Invalid path')
    err.statusCode = 400
    throw err
  }
  const buf = await fs.readFile(abs)
  return { abs, buf, rel }
}

const MIME = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export function mimeForMaterialFileType(fileType) {
  if (!fileType) return 'application/octet-stream'
  const k = String(fileType).toLowerCase()
  return MIME[k] || 'application/octet-stream'
}

/** Active paid access for materials (student_profiles). */
export function studentSubscriptionActive(profile) {
  if (!profile) return false
  if (String(profile.subscription_status || '').toLowerCase() !== 'active') return false
  const exp = profile.subscription_expires_at
  if (!exp) return false
  return new Date(exp) > new Date()
}
