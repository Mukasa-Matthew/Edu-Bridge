/**
 * Verifies JWT from httpOnly cookie (configured in @fastify/jwt).
 */
export async function authenticate(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    request.log.warn({ err: err.message }, 'authenticate: JWT missing or invalid')
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid session. Please log in again.',
    })
  }
}
