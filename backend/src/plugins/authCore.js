import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'

async function authCorePlugin(fastify) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is required')
  }

  await fastify.register(cookie)
  await fastify.register(jwt, {
    secret,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  })
}

export default fp(authCorePlugin, { name: 'authCore' })
