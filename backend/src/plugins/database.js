import fp from 'fastify-plugin'
import pg from 'pg'

async function databasePlugin(fastify) {
  const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  const pool = new pg.Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    max: 20,
    ssl,
  })

  pool.on('error', (err) => {
    fastify.log.error({ err }, 'Unexpected PostgreSQL pool error')
  })

  fastify.decorate('db', {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool,
  })

  fastify.addHook('onClose', async () => {
    await pool.end()
    fastify.log.info('PostgreSQL pool closed')
  })
}

export default fp(databasePlugin, { name: 'database' })
