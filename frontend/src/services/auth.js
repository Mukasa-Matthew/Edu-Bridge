/**
 * Auth API — wire `VITE_API_BASE_URL` (e.g. https://api.edubridge.ug) in `.env`.
 *
 * Expected POST `${API_BASE}/auth/login` body: { email, password, rememberMe }
 * Expected JSON response on success:
 *   { role?: 'student'|'tutor'|'admin', redirectUrl?: string, token?: string }
 * The backend decides the account type from credentials; use `redirectUrl` when provided.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function isAuthApiConfigured() {
  return Boolean(API_BASE)
}

/**
 * @param {{ email: string, password: string, rememberMe: boolean }} payload
 */
export async function loginUser(payload) {
  if (!API_BASE) {
    const err = new Error(
      'Sign-in service is not configured. Set VITE_API_BASE_URL in your .env file and restart the dev server.'
    )
    err.code = 'NO_API'
    throw err
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: payload.email.trim(),
      password: payload.password,
      rememberMe: payload.rememberMe,
    }),
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const msg =
      data.message ||
      data.error ||
      (res.status === 401 ? 'Invalid email or password.' : 'Sign-in failed. Please try again.')
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  return data
}

/** Map API payload to a client route; prefers server-driven redirectUrl. */
export function getPostLoginPath(data) {
  if (data?.redirectUrl && typeof data.redirectUrl === 'string') {
    const u = data.redirectUrl.trim()
    if (u.startsWith('/')) return u
  }
  const role = String(data?.role || '').toLowerCase()
  if (role === 'tutor') return '/dashboard/tutor'
  if (role === 'admin' || role === 'administrator') return '/dashboard/admin'
  if (role === 'student') return '/dashboard/student'
  return '/dashboard/student'
}
