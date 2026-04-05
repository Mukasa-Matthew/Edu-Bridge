import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'

import authCore from './plugins/authCore.js'
import database from './plugins/database.js'
import redisPlugin from './plugins/redis.js'
import uploadsPlugin from './plugins/uploads.js'
import fileUploadPlugin from './plugins/fileUpload.js'

import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import tutorRoutes from './routes/tutors.js'
import materialsRoutes from './routes/materials.js'
import bookingRoutes from './routes/bookings.js'
import adminRoutes from './routes/admin.js'
import notificationRoutes from './routes/notifications.js'

async function buildApp() {
  const logger =
    process.env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
          },
        }
      : true

  const fastify = Fastify({ logger, trustProxy: true })

  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })

  await fastify.register(authCore)

  await fastify.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
  })

  await fastify.register(multipart, {
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 10485760),
    },
  })

  await fastify.register(uploadsPlugin)
  await fastify.register(fileUploadPlugin)
  const uploadRoot = fastify.uploadRoot

  await fastify.register(fastifyStatic, {
    root: uploadRoot,
    prefix: '/uploads/',
    decorateReply: true,
  })

  /** Study files must go through /api/materials/:id/stream (auth), not direct URLs. */
  fastify.addHook('onRequest', async (request, reply) => {
    const url = (request.url || '').split('?')[0]
    if (url.startsWith('/uploads/materials/')) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Study materials are only available through the app.',
      })
    }
  })

  await fastify.register(database)
  await fastify.register(redisPlugin)

  fastify.get('/api/health', async () => ({
    ok: true,
    service: 'edubridge-api',
    time: new Date().toISOString(),
  }))

  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(studentRoutes, { prefix: '/api/students' })
  await fastify.register(tutorRoutes, { prefix: '/api/tutors' })
  await fastify.register(materialsRoutes, { prefix: '/api/materials' })
  await fastify.register(bookingRoutes, { prefix: '/api/bookings' })
  await fastify.register(adminRoutes, { prefix: '/api/admin' })
  await fastify.register(notificationRoutes, { prefix: '/api/notifications' })

  fastify.setErrorHandler((err, request, reply) => {
    request.log.error({ err }, 'request error')
    if (reply.sent) return
    const status = err.statusCode && err.statusCode < 600 ? err.statusCode : 500
    reply.status(status).send({
      error: status >= 500 ? 'Internal Server Error' : err.name || 'Error',
      message: status >= 500 ? 'Something went wrong' : err.message,
    })
  })

  return fastify
}

const port = Number(process.env.PORT || 3001)
const host = '0.0.0.0'

buildApp()
  .then((app) =>
    app.listen({ port, host }).then(() => {
      app.log.info(`EduBridge API listening on http://${host}:${port}`)
    })
  )
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
