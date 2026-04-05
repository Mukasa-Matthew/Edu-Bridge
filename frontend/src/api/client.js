/**
 * API base: empty string uses Vite dev proxy (/api → backend).
 * Override with VITE_API_BASE_URL for direct calls (must enable CORS + cookies on backend).
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const { headers = {}, body, ...rest } = options
  const isJsonBody = body !== undefined && typeof body === 'object' && !(body instanceof FormData)
  return fetch(url, {
    credentials: 'include',
    headers: {
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: isJsonBody ? JSON.stringify(body) : body,
    ...rest,
  })
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options)
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || 'Request failed')
    Object.assign(err, { status: res.status, data })
    throw err
  }
  return data
}

/**
 * POST multipart form; returns parsed JSON. Throws like apiJson on error.
 * @param {string} path
 * @param {FormData} formData
 */
export async function apiFormJson(path, formData) {
  const res = await apiFetch(path, { method: 'POST', body: formData })
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || 'Request failed')
    Object.assign(err, { status: res.status, data })
    throw err
  }
  return data
}
