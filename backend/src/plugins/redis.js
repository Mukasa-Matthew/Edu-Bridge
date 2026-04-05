import fp from 'fastify-plugin'
import Redis from 'ioredis'

/** In-process cache when Redis is disabled (dev). Same API surface as ioredis for our usage. */
function createMemoryRedis() {
  const store = new Map()
  return {
    async get(key) {
      const v = store.get(key)
      if (!v) return null
      if (v.exp && Date.now() > v.exp) {
        store.delete(key)
        return null
      }
      return v.val
    },
    async setex(key, seconds, value) {
      store.set(key, { val: value, exp: Date.now() + seconds * 1000 })
      return 'OK'
    },
    async del(...keys) {
      let n = 0
      for (const k of keys) {
        if (store.delete(k)) n += 1
      }
      return n
    },
    async quit() {
      store.clear()
      return 'OK'
    },
    on() {},
  }
}

function redisEnabled() {
  const v = process.env.REDIS_ENABLED
  if (v === undefined || v === '') return true
  return !['false', '0', 'no', 'off'].includes(String(v).toLowerCase())
}

async function redisPlugin(fastify) {
  if (!redisEnabled()) {
    fastify.log.warn('Redis disabled (REDIS_ENABLED=false): using in-memory session cache (not for production).')
    const memory = createMemoryRedis()
    fastify.decorate('redis', memory)
    fastify.addHook('onClose', async () => {
      await memory.quit()
    })
    return
  }

  let host = process.env.REDIS_HOST || '127.0.0.1'
  if (host === 'localhost') host = '127.0.0.1'

  const password = process.env.REDIS_PASSWORD
  const redis = new Redis({
    host,
    port: Number(process.env.REDIS_PORT || 6379),
    family: 4,
    ...(password ? { password } : {}),
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      if (times > 10) {
        fastify.log.error('Redis: too many retries; set REDIS_ENABLED=false for local dev without Redis.')
        return null
      }
      const delay = Math.min(times * 500, 3000)
      fastify.log.warn({ times, delay }, 'Redis: retrying connection')
      return delay
    },
    enableOfflineQueue: true,
  })

  redis.on('connect', () => {
    fastify.log.info('Redis connected')
  })
  redis.on('error', (err) => {
    fastify.log.error({ err }, 'Redis connection error')
  })

  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    await redis.quit()
    fastify.log.info('Redis connection closed')
  })
}

export default fp(redisPlugin, { name: 'redis' })
