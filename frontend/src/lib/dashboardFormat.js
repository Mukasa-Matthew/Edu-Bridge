export function initialsFromName(name) {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function formatUgx(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-UG')
}

export function formatRelativeTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString()
}
