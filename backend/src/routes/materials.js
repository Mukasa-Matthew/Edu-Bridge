import { v4 as uuidv4 } from 'uuid'
import mime from 'mime-types'
import fs from 'fs/promises'
import path from 'path'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import {
  readUploadFile,
  mimeForMaterialFileType,
  studentSubscriptionActive,
} from '../lib/materialFile.js'

const TYPE_MAP = {
  past_paper: 'past_paper',
  revision_notes: 'revision_notes',
  practice_questions: 'practice_questions',
  video_notes: 'video_notes',
  textbook_summary: 'textbook_summary',
}

const PRIMARY_LEVELS = new Set(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'])
const SECONDARY_LEVELS = new Set(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'])
const UNIVERSITY_LEVELS = new Set(['Year_1', 'Year_2', 'Year_3', 'Year_4'])

/** True if `educationLevel` enum value belongs to the student’s stage (Primary / Secondary / University). */
function educationLevelMatchesCategory(educationLevel, levelCategory) {
  if (!educationLevel || !levelCategory) return false
  switch (levelCategory) {
    case 'Primary':
      return PRIMARY_LEVELS.has(educationLevel)
    case 'Secondary':
      return SECONDARY_LEVELS.has(educationLevel)
    case 'University':
      return UNIVERSITY_LEVELS.has(educationLevel)
    default:
      return false
  }
}

export default async function materialsRoutes(fastify) {
  fastify.get('/', async (request, reply) => {
    const q = request.query
    let user = null
    try {
      await request.jwtVerify()
      user = request.user
    } catch {
      user = null
    }

    const role = String(user?.role ?? '').toLowerCase()

    let studentCategory = null
    let studentProfile = null
    if (role === 'student') {
      const { rows } = await fastify.db.query(
        `SELECT level_category, subscription_status, subscription_expires_at FROM student_profiles WHERE user_id = $1`,
        [user.sub]
      )
      studentProfile = rows[0] || null
      studentCategory = studentProfile?.level_category || null
    }

    const params = []
    let i = 1
    let where = `m.approval_status = 'approved'`

    if (role === 'student') {
      if (!studentCategory) {
        return { materials: [] }
      }
      if (!studentSubscriptionActive(studentProfile)) {
        return { materials: [], subscriptionRequired: true }
      }
      where += ` AND m.level_category = $${i}::level_category`
      params.push(studentCategory)
      i++

      const levelFilter = q.educationLevel || null
      if (levelFilter) {
        if (!educationLevelMatchesCategory(levelFilter, studentCategory)) {
          return reply.status(400).send({
            error: 'Bad Request',
            message: 'educationLevel does not match your school stage (Primary, Secondary, or University).',
          })
        }
        where += ` AND m.education_level = $${i}::education_level`
        params.push(levelFilter)
        i++
      }
    }
    if (q.subject) {
      where += ` AND m.subject ILIKE $${i}`
      params.push(`%${q.subject}%`)
      i++
    }
    if (q.materialType) {
      where += ` AND m.material_type = $${i}::material_type`
      params.push(TYPE_MAP[q.materialType] || q.materialType)
      i++
    }
    if (q.search) {
      where += ` AND (m.title ILIKE $${i} OR m.description ILIKE $${i})`
      params.push(`%${q.search}%`)
      i++
    }

    const { rows } = await fastify.db.query(
      `SELECT m.id, m.title, m.description, m.material_type, m.subject, m.education_level, m.level_category,
              m.year, m.file_type, m.file_url, m.video_url, m.file_name, m.download_count, m.created_at
       FROM materials m
       WHERE ${where}
       ORDER BY m.created_at DESC
       LIMIT 200`,
      params
    )
    return { materials: rows }
  })

  /** In-app read: PDF/DOC streamed with Content-Disposition inline (students — subscription + level). */
  fastify.get('/:id/stream', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const role = String(request.user.role ?? '').toLowerCase()

    const { rows } = await fastify.db.query(
      `SELECT file_url, level_category, file_name, file_type FROM materials WHERE id = $1 AND approval_status = 'approved'`,
      [id]
    )
    if (!rows.length || !rows[0].file_url) {
      return reply.status(404).send({ error: 'Not Found', message: 'File not available' })
    }
    const mat = rows[0]

    if (role === 'student') {
      const { rows: sp } = await fastify.db.query(
        `SELECT level_category, subscription_status, subscription_expires_at FROM student_profiles WHERE user_id = $1`,
        [request.user.sub]
      )
      const profile = sp[0]
      if (!profile?.level_category || profile.level_category !== mat.level_category) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'This material is not available for your school stage.',
        })
      }
      if (!studentSubscriptionActive(profile)) {
        return reply.status(403).send({
          error: 'Forbidden',
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'An active subscription is required to read study materials.',
        })
      }
    } else if (role !== 'tutor' && role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not allowed' })
    }

    try {
      const { buf } = await readUploadFile(fastify.uploadRoot, mat.file_url)
      const name = (mat.file_name || 'material').replace(/[^\w.\- ()]/g, '_')
      const mimeType = mimeForMaterialFileType(mat.file_type)
      reply
        .type(mimeType)
        .header('Content-Disposition', `inline; filename="${name}"`)
        .header('Cache-Control', 'private, no-store')
        .send(buf)
    } catch (e) {
      if (e.statusCode === 400) {
        return reply.status(400).send({ error: 'Bad Request', message: e.message })
      }
      fastify.log.error({ err: e }, 'material stream')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not read file' })
    }
  })

  /** Tutors/admins only — students must use /stream (in-app). */
  fastify.get('/:id/download', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const role = String(request.user.role ?? '').toLowerCase()

    if (role === 'student') {
      return reply.status(403).send({
        error: 'Forbidden',
        message:
          'Downloads are not available for students. Read materials in the app with an active subscription so access stays with your account.',
      })
    }
    if (role !== 'tutor' && role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not allowed' })
    }

    const { rows } = await fastify.db.query(
      `SELECT file_url, file_name, file_type FROM materials WHERE id = $1 AND approval_status = 'approved'`,
      [id]
    )
    if (!rows.length || !rows[0].file_url) {
      return reply.status(404).send({ error: 'Not Found', message: 'File not available' })
    }
    const mat = rows[0]

    await fastify.db.query(`UPDATE materials SET download_count = download_count + 1 WHERE id = $1`, [id])

    try {
      const { buf } = await readUploadFile(fastify.uploadRoot, mat.file_url)
      const name = (mat.file_name || 'material').replace(/[^\w.\- ()]/g, '_')
      const mimeType = mimeForMaterialFileType(mat.file_type)
      reply
        .type(mimeType)
        .header('Content-Disposition', `attachment; filename="${name}"`)
        .send(buf)
    } catch (e) {
      if (e.statusCode === 400) {
        return reply.status(400).send({ error: 'Bad Request', message: e.message })
      }
      fastify.log.error({ err: e }, 'material download')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not read file' })
    }
  })

  /** Single material metadata (student: subscription + level; tutor/admin: any approved). */
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const role = String(request.user.role ?? '').toLowerCase()

    const { rows } = await fastify.db.query(
      `SELECT m.id, m.title, m.description, m.material_type, m.subject, m.education_level, m.level_category,
              m.year, m.file_type, m.file_url, m.video_url, m.file_name, m.download_count, m.created_at
       FROM materials m
       WHERE m.id = $1 AND m.approval_status = 'approved'`,
      [id]
    )
    if (!rows.length) {
      return reply.status(404).send({ error: 'Not Found', message: 'Material not found' })
    }
    const mat = rows[0]

    if (role === 'student') {
      const { rows: sp } = await fastify.db.query(
        `SELECT level_category, subscription_status, subscription_expires_at FROM student_profiles WHERE user_id = $1`,
        [request.user.sub]
      )
      const profile = sp[0]
      if (!profile?.level_category || profile.level_category !== mat.level_category) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'This material is not available for your school stage.',
        })
      }
      if (!studentSubscriptionActive(profile)) {
        return reply.status(403).send({
          error: 'Forbidden',
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'An active subscription is required to open study materials.',
        })
      }
    } else if (role !== 'tutor' && role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not allowed' })
    }

    return mat
  })

  fastify.post(
    '/',
    {
      preHandler: [authenticate, authorize('tutor', 'admin')],
    },
    async (request, reply) => {
      const maxBytes = fastify.materialUpload.maxBytes
      const parts = request.parts()
      const fields = {}
      let fileBuffer = null
      let origName = null
      let mimeType = null

      for await (const part of parts) {
        if (part.type === 'file') {
          fileBuffer = await part.toBuffer()
          origName = part.filename
          mimeType = part.mimetype
        } else {
          fields[part.fieldname] = part.value
        }
      }

      if (!fileBuffer) {
        return reply.status(400).send({ error: 'Bad Request', message: 'File is required' })
      }
      if (fileBuffer.length > maxBytes) {
        return reply.status(413).send({ error: 'Payload Too Large', message: 'File exceeds maximum size (10MB)' })
      }
      if (!fastify.materialUpload.allowedMime.has(mimeType)) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Only PDF, DOC, and DOCX files are allowed' })
      }

      if (!fields.educationLevel || !fields.levelCategory) {
        return reply.status(400).send({ error: 'Bad Request', message: 'educationLevel and levelCategory are required' })
      }
      if (!educationLevelMatchesCategory(fields.educationLevel, fields.levelCategory)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'educationLevel must match level category (e.g. P1–P7 for Primary, S1–S6 for Secondary, Year_1–Year_4 for University).',
        })
      }

      const ext = mime.extension(mimeType) || 'pdf'
      const subdir = 'pdf'
      const storedName = `${uuidv4()}.${ext}`
      const relPath = `materials/${subdir}/${storedName}`
      const destAbs = path.join(fastify.uploadRoot, 'materials', subdir, storedName)
      await fs.mkdir(path.dirname(destAbs), { recursive: true })
      await fs.writeFile(destAbs, fileBuffer)

      const matType = TYPE_MAP[fields.materialType] || fields.materialType || 'revision_notes'
      const userId = request.user.sub
      const role = request.user.role
      const approvalStatus = role === 'admin' ? 'approved' : 'pending'

      const { rows } = await fastify.db.query(
        `INSERT INTO materials (
          title, description, material_type, subject, education_level, level_category, year,
          file_type, file_url, file_size, file_name, uploaded_by, uploader_role, approval_status
        ) VALUES ($1, $2, $3::material_type, $4, $5::education_level, $6::level_category, $7,
          $8::material_file_type, $9, $10, $11, $12, $13::user_role, $14::material_approval_status)
        RETURNING id`,
        [
          fields.title || 'Untitled',
          fields.description || null,
          matType,
          fields.subject || 'General',
          fields.educationLevel,
          fields.levelCategory,
          fields.year ? Number(fields.year) : null,
          ext === 'pdf' ? 'pdf' : ext === 'doc' ? 'doc' : 'docx',
          relPath,
          fileBuffer.length,
          origName || storedName,
          userId,
          role,
          approvalStatus,
        ]
      )

      return reply.status(201).send({
        message:
          role === 'admin'
            ? 'Material published successfully (admin upload is live for students).'
            : 'Material uploaded and pending review',
        id: rows[0].id,
        approvalStatus,
      })
    }
  )
}
