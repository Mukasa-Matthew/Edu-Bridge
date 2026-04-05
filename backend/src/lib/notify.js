export async function notifyUser(fastify, userId, { type, title, body = '', metadata = {} }) {
  await fastify.db.query(
    `INSERT INTO notifications (user_id, type, title, body, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [userId, type, title, body, JSON.stringify(metadata)]
  )
}
