import fp from 'fastify-plugin'

const ALLOWED_DOC = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

async function fileUploadPlugin(fastify) {
  fastify.decorate('materialUpload', {
    maxBytes: Number(process.env.MAX_FILE_SIZE_BYTES || 10485760),
    allowedMime: ALLOWED_DOC,
  })
}

export default fp(fileUploadPlugin, { name: 'materialUploadConfig' })
