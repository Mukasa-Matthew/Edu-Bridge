const PREFIX = 'edubridge:sess:'
const TTL_SEC = 7 * 24 * 60 * 60

export function sessionKey(userId) {
  return `${PREFIX}${userId}`
}

export function sessionPayload(userRow) {
  return JSON.stringify({
    id: userRow.id,
    email: userRow.email,
    role: userRow.role,
    fullName: userRow.full_name,
  })
}

export async function cacheSession(redis, userRow) {
  await redis.setex(sessionKey(userRow.id), TTL_SEC, sessionPayload(userRow))
}

export async function getCachedSession(redis, userId) {
  const raw = await redis.get(sessionKey(userId))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function deleteSession(redis, userId) {
  await redis.del(sessionKey(userId))
}
