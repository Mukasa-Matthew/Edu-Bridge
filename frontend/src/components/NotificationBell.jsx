import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import { formatRelativeTime } from '../lib/dashboardFormat.js'

/**
 * @param {{ fullPath: string }} props — e.g. /dashboard/student/notifications
 */
export default function NotificationBell({ fullPath }) {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  async function refreshCount() {
    try {
      const data = await apiJson('/api/notifications/unread-count')
      setCount(data.count ?? 0)
    } catch {
      setCount(0)
    }
  }

  async function loadPreview() {
    setLoading(true)
    try {
      const data = await apiJson('/api/notifications?limit=8&unreadOnly=false')
      setItems(data.notifications || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCount()
    const t = setInterval(refreshCount, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  async function markRead(id) {
    try {
      await apiJson(`/api/notifications/${id}/read`, { method: 'PATCH' })
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
      refreshCount()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) loadPreview()
        }}
        className="relative rounded-lg p-2 text-navy hover:bg-white/80"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 font-heading text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 pb-2">
            <span className="font-heading text-sm font-semibold text-navy">Notifications</span>
            <Link
              to={fullPath}
              className="font-heading text-xs font-medium text-blue hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 font-sans text-sm text-mid">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-4 font-sans text-sm text-mid">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => !n.read_at && markRead(n.id)}
                      className={`w-full px-3 py-2.5 text-left transition hover:bg-gray-50 ${n.read_at ? 'opacity-80' : 'bg-sky/5'}`}
                    >
                      <p className="font-heading text-sm font-semibold text-navy">{n.title}</p>
                      {n.body ? <p className="mt-0.5 font-sans text-xs text-mid line-clamp-2">{n.body}</p> : null}
                      <p className="mt-1 font-sans text-[10px] text-mid">{formatRelativeTime(n.created_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
