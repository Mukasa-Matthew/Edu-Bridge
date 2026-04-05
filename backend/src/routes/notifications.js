import { authenticate } from '../middleware/authenticate.js'

export default async function notificationRoutes(fastify) {
  fastify.addHook('preHandler', authenticate)

  fastify.get('/', async (request) => {
    const userId = request.user.sub
    const { limit = '50', unreadOnly } = request.query
    const lim = Math.min(100, Math.max(1, Number(limit) || 50))
    const params = [userId]
    let sql = `SELECT * FROM notifications WHERE user_id = $1`
    if (unreadOnly === 'true' || unreadOnly === '1') {
      sql += ` AND read_at IS NULL`
    }
    sql += ` ORDER BY created_at DESC LIMIT ${lim}`
    const { rows } = await fastify.db.query(sql, params)
    return { notifications: rows }
  })

  fastify.get('/unread-count', async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    )
    return { count: rows[0].c }
  })

  fastify.patch('/:id/read', async (request, reply) => {
    const userId = request.user.sub
    const { id } = request.params
    const { rows } = await fastify.db.query(
      `UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ ok: true })
  })

  fastify.post('/read-all', async (request) => {
    const userId = request.user.sub
    await fastify.db.query(
      `UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    )
    return { ok: true }
  })

  fastify.delete('/', async (request) => {
    const userId = request.user.sub
    await fastify.db.query(`DELETE FROM notifications WHERE user_id = $1`, [userId])
    return { ok: true }
  })
}
