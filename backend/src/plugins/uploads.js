import fp from 'fastify-plugin'
import fs from 'fs/promises'
import path from 'path'

async function ensureUploadDirs(rootDir) {
  const base = path.resolve(rootDir)
  await fs.mkdir(path.join(base, 'materials', 'pdf'), { recursive: true })
  await fs.mkdir(path.join(base, 'materials', 'videos'), { recursive: true })
}

async function uploadsPlugin(fastify) {
  const uploadDir = process.env.UPLOAD_DIR || './uploads'
  const resolved = path.isAbsolute(uploadDir) ? uploadDir : path.resolve(process.cwd(), uploadDir)
  await ensureUploadDirs(resolved)
  fastify.decorate('uploadRoot', resolved)
}

export default fp(uploadsPlugin, { name: 'uploads' })
