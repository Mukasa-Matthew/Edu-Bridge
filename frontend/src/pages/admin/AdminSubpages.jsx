import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiJson } from '../../api/client.js'
import { formatUgx, formatRelativeTime, initialsFromName } from '../../lib/dashboardFormat.js'
import { useToast } from '../../context/ToastContext.jsx'
import {
  UserCompositionPie,
  RevenueSourcePie,
  MonthlyRevenueBar,
  OperationsBar,
} from '../../components/admin/PlatformStatsCharts.jsx'
import AdminMaterialUploadForm from './AdminMaterialUploadForm.jsx'

function TabBtn({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold sm:text-sm ${
        active ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

const STAT_ACCENT = [
  'border-l-4 border-l-blue',
  'border-l-4 border-l-emerald-500',
  'border-l-4 border-l-sky',
  'border-l-4 border-l-gold',
  'border-l-4 border-l-navy',
  'border-l-4 border-l-blue',
  'border-l-4 border-l-emerald-500',
  'border-l-4 border-l-sky',
]

export function AdminHomeOverview() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [rev, setRev] = useState([])
  const [err, setErr] = useState('')
  const [me, setMe] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [s, a, r, u] = await Promise.all([
          apiJson('/api/admin/stats'),
          apiJson('/api/admin/activity'),
          apiJson('/api/admin/stats/revenue-monthly'),
          apiJson('/api/auth/me'),
        ])
        setStats(s)
        setActivity(a)
        setRev(r.monthly || [])
        setMe(u)
      } catch (e) {
        if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
        else {
          const m = e.message || 'Could not load dashboard'
          setErr(m)
          toast.error(m)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast stable; avoid re-fetch loops
  }, [navigate])

  const fn = (n) => (n == null ? '—' : Number(n).toLocaleString('en-UG'))
  const first = me?.user?.full_name?.trim().split(/\s+/)[0] || 'Admin'
  const maxR = Math.max(1, ...rev.map((x) => Number(x.subscription_ugx) + Number(x.bookings_ugx)))

  const statCards = [
    ['Students', fn(stats?.totalStudents)],
    ['Approved tutors', fn(stats?.approvedTutors)],
    ['Sessions booked', fn(stats?.totalBookings)],
    ['Platform revenue (UGX)', fn(stats?.totalRevenueUgx)],
    ['Active subscriptions', fn(stats?.activeSubscriptions)],
    ['Pending tutor apps', fn(stats?.pendingTutorApplications)],
    ['Materials pending', fn(stats?.pendingMaterials)],
    ['Platform fee %', `${stats?.platformFeePercent ?? 20}%`],
  ]

  const shortcuts = [
    {
      to: '/dashboard/admin/applications',
      title: 'Tutor applications',
      desc: 'Review pending profiles, approve or reject with a reason.',
      chip: 'Moderation',
    },
    {
      to: '/dashboard/admin/materials',
      title: 'Materials',
      desc: 'Moderate tutor uploads or publish your own resources.',
      chip: 'Content',
    },
    {
      to: '/dashboard/admin/bookings',
      title: 'Bookings',
      desc: 'See all sessions, payments, and platform fee splits.',
      chip: 'Operations',
    },
    {
      to: '/dashboard/admin/payments',
      title: 'Payments',
      desc: 'Subscription and session payment ledger.',
      chip: 'Finance',
    },
    {
      to: '/dashboard/admin/analytics',
      title: 'Statistics',
      desc: 'Charts for users, revenue, and monthly trends.',
      chip: 'Insights',
    },
    {
      to: '/dashboard/admin/notify',
      title: 'Broadcast',
      desc: 'Push in-app notifications to students or tutors.',
      chip: 'Comms',
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2138] via-[#153a5c] to-[#1d4ed8] px-5 py-7 text-white shadow-xl ring-1 ring-white/10 sm:px-8 sm:py-8">
        {/* Dot grid + glows (decorative) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-400/30 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-12 right-1/4 h-40 w-40 rounded-full bg-blue-400/25 blur-3xl" aria-hidden />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="max-w-2xl rounded-xl border border-white/20 bg-navy/35 p-5 shadow-lg backdrop-blur-md sm:p-6">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Admin control centre
            </p>
            {/* text-white: global base styles set h1 to navy — must override for dark hero */}
            <h1 className="mt-3 font-heading text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
              Welcome back, {first}
            </h1>
            <p className="mt-3 font-sans text-sm leading-relaxed text-white/90">
              Monitor tutors, study materials, bookings, and revenue. Use the shortcuts below to jump straight into each
              workflow.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 font-heading text-xs font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" aria-hidden />
              Full administrator access
            </span>
          </div>

          <div
            className="hidden shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 text-center backdrop-blur-sm lg:flex lg:w-[188px]"
            aria-hidden
          >
            <svg className="h-12 w-12 text-sky-200/95" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-white/75">
              Live overview
            </span>
          </div>
        </div>
      </div>

      {err ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(([label, val], i) => (
          <div
            key={label}
            className={`rounded-xl border border-gray-100/80 bg-white p-5 shadow-sm ring-1 ring-black/5 ${STAT_ACCENT[i % STAT_ACCENT.length]}`}
          >
            <p className="font-heading text-2xl font-bold text-navy">{val}</p>
            <p className="mt-1 font-sans text-xs text-mid">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-semibold text-navy">Revenue trend</h2>
            <p className="mt-0.5 font-sans text-xs text-mid">Last 6 months — subscriptions vs session payments</p>
          </div>
          <Link to="/dashboard/admin/analytics" className="font-heading text-xs font-semibold text-blue hover:underline">
            Open full statistics →
          </Link>
        </div>
        <div className="mt-6 flex h-40 items-end gap-1.5 sm:h-44">
          {rev.length === 0 ? (
            <p className="w-full py-8 text-center font-sans text-sm text-mid">No monthly revenue data yet.</p>
          ) : (
            rev.map((row) => (
              <div key={String(row.month)} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full max-w-[48px] gap-px overflow-hidden rounded-t-md shadow-sm">
                  <div
                    className="flex-1 bg-emerald-500 transition-all"
                    style={{
                      height: `${(Number(row.subscription_ugx) / maxR) * 100}%`,
                      minHeight: Number(row.subscription_ugx) ? '4px' : 0,
                    }}
                  />
                  <div
                    className="flex-1 bg-blue transition-all"
                    style={{
                      height: `${(Number(row.bookings_ugx) / maxR) * 100}%`,
                      minHeight: Number(row.bookings_ugx) ? '4px' : 0,
                    }}
                  />
                </div>
                <span className="text-[10px] font-medium text-mid">
                  {new Date(row.month).toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="mt-3 font-sans text-xs text-mid">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" aria-hidden /> Subscriptions{' '}
          <span className="ml-3 inline-block h-2 w-2 rounded-sm bg-blue" aria-hidden /> Session payments
        </p>
      </section>

      {stats ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <UserCompositionPie stats={stats} />
          <OperationsBar stats={stats} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shortcuts.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:border-sky/40 hover:shadow-md"
          >
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-mid group-hover:bg-sky/15 group-hover:text-navy">
              {s.chip}
            </span>
            <h3 className="mt-3 font-heading text-base font-bold text-navy group-hover:text-blue">{s.title}</h3>
            <p className="mt-1 font-sans text-sm text-mid">{s.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 font-heading text-xs font-semibold text-blue opacity-0 transition group-hover:opacity-100">
              Open <span aria-hidden>→</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-navy">Recent registrations</h2>
          <ul className="mt-4 divide-y divide-gray-100">
            {(activity?.recentRegistrations || []).length === 0 ? (
              <li className="py-4 font-sans text-sm text-mid">No recent sign-ups.</li>
            ) : (
              (activity?.recentRegistrations || []).map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2 py-3 font-sans text-sm">
                  <span className="font-medium text-navy">{u.full_name}</span>
                  <span className="text-mid">
                    {u.role} · {formatRelativeTime(u.created_at)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-navy">Recent bookings</h2>
          <ul className="mt-4 divide-y divide-gray-100">
            {(activity?.recentBookings || []).length === 0 ? (
              <li className="py-4 font-sans text-sm text-mid">No bookings yet.</li>
            ) : (
              (activity?.recentBookings || []).map((b) => (
                <li key={b.id} className="py-3 font-sans text-sm text-mid">
                  <span className="font-medium text-navy">{b.student_name}</span>
                  <span className="text-mid"> → {b.tutor_name}</span>
                  <span className="block text-xs text-mid/90">{b.subject}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}

export function AdminTutorApplications() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [rows, setRows] = useState([])
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')

  async function load() {
    try {
      if (tab === 'pending') {
        const d = await apiJson('/api/admin/tutors/pending')
        setRows(d.applications || [])
      } else {
        const d = await apiJson(`/api/admin/tutors/by-status?status=${tab}`)
        setRows(d.tutors || [])
      }
    } catch (e) {
      if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load applications')
    }
  }

  useEffect(() => {
    load()
  }, [navigate, tab])

  async function approve(id) {
    try {
      await apiJson(`/api/admin/tutors/${id}/approve`, { method: 'POST' })
      toast.success('Tutor approved successfully.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Approve failed')
    }
  }

  async function reject(id) {
    try {
      await apiJson(`/api/admin/tutors/${id}/reject`, { method: 'POST', body: { reason } })
      setRejectId(null)
      setReason('')
      toast.success('Application rejected.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Reject failed')
    }
  }

  async function suspend(id) {
    if (!window.confirm('Suspend this tutor account?')) return
    try {
      await apiJson(`/api/admin/tutors/${id}/suspend`, { method: 'POST' })
      toast.success('Tutor suspended.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Suspend failed')
    }
  }

  async function reconsider(id) {
    try {
      await apiJson(`/api/admin/tutors/${id}/reconsider`, { method: 'POST' })
      toast.success('Application moved back to pending.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not update')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Tutor applications</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')}>
          Pending
        </TabBtn>
        <TabBtn active={tab === 'approved'} onClick={() => setTab('approved')}>
          Approved
        </TabBtn>
        <TabBtn active={tab === 'rejected'} onClick={() => setTab('rejected')}>
          Rejected
        </TabBtn>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map((t) => (
          <div key={t.user_id || t.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                  {initialsFromName(t.full_name)}
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy">{t.full_name}</p>
                  <p className="font-sans text-xs text-mid">
                    {t.email} · {t.phone}
                  </p>
                  <p className="font-sans text-xs">
                    {t.primary_subject} / {t.secondary_subject} · {t.district}
                  </p>
                  <p className="font-sans text-xs text-mid line-clamp-2">{t.bio}</p>
                  {t.rejection_reason ? <p className="mt-1 text-xs text-red-600">Reason: {t.rejection_reason}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === 'pending' ? (
                  <>
                    <button type="button" onClick={() => approve(t.user_id || t.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white">
                      Approve
                    </button>
                    <button type="button" onClick={() => setRejectId(t.user_id || t.id)} className="rounded-lg border-2 border-red-500 px-3 py-1.5 text-sm text-red-600">
                      Reject
                    </button>
                  </>
                ) : null}
                {tab === 'approved' ? (
                  <button type="button" onClick={() => suspend(t.user_id || t.id)} className="rounded-lg border border-amber-600 px-3 py-1.5 text-sm text-amber-800">
                    Suspend
                  </button>
                ) : null}
                {tab === 'rejected' ? (
                  <button type="button" onClick={() => reconsider(t.user_id || t.id)} className="rounded-lg border px-3 py-1.5 text-sm">
                    Reconsider
                  </button>
                ) : null}
              </div>
            </div>
            {rejectId === (t.user_id || t.id) ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <textarea className="rounded border px-2 py-1 text-sm" placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                <button type="button" onClick={() => reject(t.user_id || t.id)} className="w-fit rounded bg-red-600 px-3 py-1.5 text-sm text-white">
                  Confirm reject
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {rows.length === 0 ? <p className="text-mid">No rows.</p> : null}
      </div>
    </div>
  )
}

export function AdminStudentsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])

  async function load() {
    try {
      const d = await apiJson(`/api/admin/students?${new URLSearchParams({ q })}`)
      setRows(d.students || [])
    } catch (e) {
      if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load students')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Manage students</h1>
      <div className="mt-4 flex gap-2">
        <input className="flex-1 rounded border px-3 py-2 text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, school" />
        <button type="button" onClick={load} className="rounded-lg bg-navy px-4 py-2 text-sm text-white">
          Search
        </button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">School</th>
              <th className="p-2">District</th>
              <th className="p-2">Subscription</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-gray-50">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs text-white">{initialsFromName(s.full_name)}</span>
                    <div>
                      <p className="font-medium">{s.full_name}</p>
                      <p className="text-xs text-mid">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-2">{s.school_name}</td>
                <td className="p-2">{s.district}</td>
                <td className="p-2">{s.subscription_status}</td>
                <td className="p-2">
                  <button
                    type="button"
                    className="text-xs text-red-600 underline"
                    onClick={async () => {
                      if (!window.confirm('Delete this student account permanently?')) return
                      try {
                        await apiJson(`/api/admin/users/${s.id}`, { method: 'DELETE' })
                        toast.success('Student account removed.')
                        await load()
                      } catch (e) {
                        toast.error(e.message || 'Delete failed')
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminTutorsManagePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [rows, setRows] = useState([])

  async function load() {
    try {
      const d = await apiJson('/api/admin/tutors/manage')
      setRows(d.tutors || [])
    } catch (e) {
      if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load tutors')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Manage tutors</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs">
            <tr>
              <th className="p-2">Tutor</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Rating</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-gray-50">
                <td className="p-2">{t.full_name}</td>
                <td className="p-2">{t.primary_subject}</td>
                <td className="p-2">{Number(t.average_rating || 0).toFixed(1)}</td>
                <td className="p-2">{t.tutor_status}</td>
                <td className="p-2 space-x-2">
                  {t.tutor_status === 'suspended' ? (
                    <button
                      type="button"
                      className="text-xs text-blue-600 underline"
                      onClick={async () => {
                        try {
                          await apiJson(`/api/admin/tutors/${t.id}/reactivate`, { method: 'POST' })
                          toast.success('Tutor reactivated.')
                          await load()
                        } catch (e) {
                          toast.error(e.message || 'Failed')
                        }
                      }}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-amber-700 underline"
                      onClick={async () => {
                        try {
                          await apiJson(`/api/admin/tutors/${t.id}/suspend`, { method: 'POST' })
                          toast.success('Tutor suspended.')
                          await load()
                        } catch (e) {
                          toast.error(e.message || 'Failed')
                        }
                      }}
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminMaterialsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [rows, setRows] = useState([])
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason] = useState('')

  async function load() {
    try {
      const d = await apiJson(`/api/admin/materials/by-status?status=${tab}`)
      setRows(d.materials || [])
    } catch (e) {
      if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load materials')
    }
  }

  useEffect(() => {
    load()
  }, [navigate, tab])

  async function approveMaterial(id) {
    try {
      await apiJson(`/api/admin/materials/${id}/approve`, { method: 'POST' })
      toast.success('Material approved.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Approve failed')
    }
  }

  async function rejectMaterial(id) {
    try {
      await apiJson(`/api/admin/materials/${id}/reject`, { method: 'POST', body: { reason } })
      setRejectId(null)
      setReason('')
      toast.success('Material rejected.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Reject failed')
    }
  }

  async function reconsiderMaterial(id) {
    try {
      await apiJson(`/api/admin/materials/${id}/reconsider`, { method: 'POST' })
      toast.success('Moved back to pending.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not update')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl">
        <h1 className="font-heading text-2xl font-bold text-navy">Study materials</h1>
        <p className="mt-1 font-sans text-sm text-mid">
          Publish resources directly or review tutor submissions (pending / approved / rejected).
        </p>
      </div>

      <div className="mt-8 max-w-4xl">
        <AdminMaterialUploadForm onUploaded={() => load()} />
      </div>

      <h2 className="mt-10 font-heading text-lg font-semibold text-navy">Moderation queue</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected'].map((t) => (
          <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </TabBtn>
        ))}
      </div>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <li className="rounded-xl border border-dashed border-gray-200 bg-white/80 py-10 text-center font-sans text-sm text-mid">No materials in this tab.</li>
        ) : null}
        {rows.map((m) => (
          <li key={m.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="font-heading font-semibold text-navy">{m.title}</p>
            <p className="font-sans text-xs text-mid">
              {m.material_type?.replace(/_/g, ' ')} · {m.subject} · Uploaded by {m.uploader_name}
              {m.uploader_role ? ` (${m.uploader_role})` : ''}
            </p>
            {m.rejection_reason ? <p className="mt-1 text-xs text-red-600">Reason: {m.rejection_reason}</p> : null}
            <div className="mt-2 flex flex-wrap gap-2">
              {m.file_url ? (
                <a href={`/api/admin/materials/${m.id}/file`} className="text-sm font-medium text-blue underline" target="_blank" rel="noreferrer">
                  Preview / download
                </a>
              ) : null}
              {tab === 'pending' ? (
                <>
                  <button type="button" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white" onClick={() => approveMaterial(m.id)}>
                    Approve
                  </button>
                  <button type="button" className="rounded-lg border border-red-500 px-3 py-1.5 text-sm font-semibold text-red-600" onClick={() => setRejectId(m.id)}>
                    Reject
                  </button>
                </>
              ) : null}
              {tab === 'rejected' ? (
                <button type="button" className="text-sm font-medium text-navy underline" onClick={() => reconsiderMaterial(m.id)}>
                  Reconsider
                </button>
              ) : null}
            </div>
            {rejectId === m.id ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row">
                <input
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Rejection reason for the tutor"
                />
                <button type="button" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => rejectMaterial(m.id)}>
                  Confirm reject
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AdminBookingsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])

  useEffect(() => {
    apiJson('/api/admin/bookings')
      .then((d) => setRows(d.bookings || []))
      .catch((e) => {
        if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      })
  }, [navigate])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Bookings overview</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs">
            <tr>
              <th className="p-2">When</th>
              <th className="p-2">Student</th>
              <th className="p-2">Tutor</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Paid</th>
              <th className="p-2">Fee</th>
              <th className="p-2">Tutor</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-gray-50">
                <td className="p-2 whitespace-nowrap">{new Date(b.scheduled_at).toLocaleString()}</td>
                <td className="p-2">{b.student_name}</td>
                <td className="p-2">{b.tutor_name}</td>
                <td className="p-2">{b.subject}</td>
                <td className="p-2">{formatUgx(b.amount_student_pays)}</td>
                <td className="p-2">{formatUgx(b.platform_fee)}</td>
                <td className="p-2">{formatUgx(b.tutor_earnings)}</td>
                <td className="p-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminPaymentsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])

  useEffect(() => {
    apiJson('/api/admin/payments')
      .then((d) => setRows(d.payments || []))
      .catch((e) => {
        if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      })
  }, [navigate])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Payments & revenue</h1>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">User</th>
              <th className="p-2">Type</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Method</th>
              <th className="p-2">Ref</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="p-2">{new Date(p.created_at).toLocaleString()}</td>
                <td className="p-2">
                  {p.user_name} ({p.user_role})
                </td>
                <td className="p-2">{p.payment_type}</td>
                <td className="p-2">{formatUgx(p.amount)}</td>
                <td className="p-2">{p.payment_method}</td>
                <td className="p-2 font-mono text-xs">{p.payment_reference}</td>
                <td className="p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminStatsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [s, m] = await Promise.all([apiJson('/api/admin/stats'), apiJson('/api/admin/stats/revenue-monthly')])
        setStats(s)
        setMonthly(m.monthly || [])
      } catch (e) {
        if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
        else setErr(e.message || 'Could not load statistics')
      }
    })()
  }, [navigate])

  function exportCsv() {
    try {
      const traffic = stats?.websiteTraffic || {}
      const lines = [
        ['Metric', 'Value'],
        ['Total users', stats?.totalUsers],
        ['Students', stats?.totalStudents],
        ['Approved tutors', stats?.approvedTutors],
        ['Total bookings', stats?.totalBookings],
        ['Total revenue UGX', stats?.totalRevenueUgx],
        ['Subscription revenue UGX', stats?.subscriptionRevenueUgx],
        ['Platform booking fees UGX', stats?.platformBookingFeesUgx],
        ['Platform fee %', stats?.platformFeePercent],
        ['Website page views (30d)', traffic.pageViews30d],
        ['Website unique visitors (30d)', traffic.uniqueVisitors30d],
        ['Avg bounce rate % (30d)', traffic.avgBounceRate30d],
        ['Avg session seconds (30d)', traffic.avgSessionSeconds30d],
      ]
      const csv = lines.map((r) => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'platform-stats.csv'
      a.click()
      toast.success('CSV export started.')
    } catch {
      toast.error('Could not export CSV.')
    }
  }

  const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-UG'))
  const traffic = stats?.websiteTraffic || {}
  const topPages = traffic.topPages || []
  const dailyTraffic = traffic.dailyTrend || []
  const maxDailyViews = Math.max(1, ...dailyTraffic.map((d) => Number(d.pageViews || 0)))
  const sessionMins = traffic.avgSessionSeconds30d
    ? `${Math.floor(traffic.avgSessionSeconds30d / 60)}m ${traffic.avgSessionSeconds30d % 60}s`
    : '0m 0s'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">Platform statistics</h1>
          <p className="mt-1 font-sans text-sm text-mid">Visual overview of users, revenue, and activity.</p>
        </div>
        <button type="button" onClick={exportCsv} className="rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-navy/5">
          Export CSV
        </button>
      </div>

      {err ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {err}
        </p>
      ) : null}

      {stats ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Total users', fmt(stats.totalUsers)],
              ['Students', fmt(stats.totalStudents)],
              ['Approved tutors', fmt(stats.approvedTutors)],
              ['Total bookings', fmt(stats.totalBookings)],
              ['Active subscriptions', fmt(stats.activeSubscriptions)],
              ['Total revenue (UGX)', fmt(stats.totalRevenueUgx)],
              ['Pending tutor apps', fmt(stats.pendingTutorApplications)],
              ['Materials pending', fmt(stats.pendingMaterials)],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="font-heading text-2xl font-bold text-navy">{val}</p>
                <p className="mt-1 font-sans text-xs text-mid">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <UserCompositionPie stats={stats} />
            <RevenueSourcePie stats={stats} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MonthlyRevenueBar monthly={monthly} />
            </div>
            <OperationsBar stats={stats} />
          </div>

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-semibold text-navy">Website traffic analytics</h2>
                <p className="mt-0.5 font-sans text-xs text-mid">Last 30 days (demo-seeded, admin-view only)</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Page views (30d)', fmt(traffic.pageViews30d)],
                ['Unique visitors (30d)', fmt(traffic.uniqueVisitors30d)],
                ['Avg bounce rate', `${Number(traffic.avgBounceRate30d || 0).toFixed(1)}%`],
                ['Avg session duration', sessionMins],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <p className="font-heading text-xl font-bold text-navy">{val}</p>
                  <p className="mt-1 font-sans text-xs text-mid">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-heading text-sm font-semibold text-navy">Top pages</h3>
                {topPages.length === 0 ? (
                  <p className="mt-3 font-sans text-sm text-mid">No website traffic rows yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {topPages.map((p) => (
                      <li
                        key={p.pagePath}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 font-sans text-sm"
                      >
                        <span className="font-medium text-navy">{p.pagePath}</span>
                        <span className="text-mid">
                          {fmt(p.pageViews)} views · {fmt(p.uniqueVisitors)} visitors
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="font-heading text-sm font-semibold text-navy">14-day traffic trend</h3>
                {dailyTraffic.length === 0 ? (
                  <p className="mt-3 font-sans text-sm text-mid">No trend data yet.</p>
                ) : (
                  <div className="mt-4 flex h-40 items-end gap-1.5">
                    {dailyTraffic.map((d) => (
                      <div key={String(d.day)} className="flex flex-1 flex-col items-center gap-1.5">
                        <div
                          className="w-full max-w-[24px] rounded-t-sm bg-blue/90"
                          style={{
                            height: `${Math.max(5, (Number(d.pageViews || 0) / maxDailyViews) * 100)}%`,
                          }}
                          title={`${d.day}: ${fmt(d.pageViews)} views`}
                        />
                        <span className="text-[10px] text-mid">
                          {new Date(d.day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <details className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">Raw JSON (debug)</summary>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-gray-100 p-3 font-mono text-xs text-mid">{JSON.stringify(stats, null, 2)}</pre>
          </details>
        </>
      ) : !err ? (
        <p className="mt-8 font-sans text-mid">Loading statistics…</p>
      ) : null}
    </div>
  )
}

export function AdminNotifyPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [audience, setAudience] = useState('all_students')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [sending, setSending] = useState(false)

  async function send(e) {
    e.preventDefault()
    setSending(true)
    try {
      const body = { audience, title, message }
      if (audience === 'user') body.userId = userId
      const r = await apiJson('/api/admin/notifications/broadcast', { method: 'POST', body })
      toast.success(`Notification sent to ${r.sent} user(s).`)
      setTitle('')
      setMessage('')
      setUserId('')
    } catch (err) {
      toast.error(err.message || 'Broadcast failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Send notification</h1>
      <p className="mt-1 font-sans text-sm text-mid">Deliver in-app notifications to students, tutors, or one user by ID.</p>
      <form onSubmit={send} className="mt-6 max-w-lg space-y-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="all_students">All students</option>
          <option value="all_tutors">All tutors</option>
          <option value="user">Specific user</option>
        </select>
        {audience === 'user' ? (
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="User UUID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        ) : null}
        <input
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit" disabled={sending} className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {sending ? 'Sending…' : 'Send notification'}
        </button>
      </form>
    </div>
  )
}

export function AdminSettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [s, setS] = useState(null)
  const [form, setForm] = useState({})

  async function load() {
    try {
      const d = await apiJson('/api/admin/settings/platform')
      setS(d.settings)
      setForm(d.settings || {})
    } catch (e) {
      if (e.status === 401 || e.status === 403) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load settings')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  async function save(e) {
    e.preventDefault()
    try {
      await apiJson('/api/admin/settings/platform', {
        method: 'PATCH',
        body: {
          platformFeePercent: Number(form.platform_fee_percent),
          subscriptionPriceUgx: Number(form.subscription_price_ugx),
          maxUploadBytes: Number(form.max_upload_bytes),
          allowedFileTypes: form.allowed_file_types,
        },
      })
      toast.success('Platform settings saved.')
      await load()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Admin settings</h1>
      <p className="mt-1 font-sans text-sm text-mid">Fees, subscription price, and upload rules apply to new bookings and uploads.</p>
      {s ? (
        <form onSubmit={save} className="mt-6 max-w-md space-y-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <label className="text-xs font-semibold text-navy">Platform fee %</label>
          <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.platform_fee_percent ?? ''} onChange={(e) => setForm((f) => ({ ...f, platform_fee_percent: e.target.value }))} />
          <label className="text-xs font-semibold text-navy">Subscription price (UGX)</label>
          <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.subscription_price_ugx ?? ''} onChange={(e) => setForm((f) => ({ ...f, subscription_price_ugx: e.target.value }))} />
          <label className="text-xs font-semibold text-navy">Max upload bytes</label>
          <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.max_upload_bytes ?? ''} onChange={(e) => setForm((f) => ({ ...f, max_upload_bytes: e.target.value }))} />
          <label className="text-xs font-semibold text-navy">Allowed file types</label>
          <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.allowed_file_types ?? ''} onChange={(e) => setForm((f) => ({ ...f, allowed_file_types: e.target.value }))} />
          <button type="submit" className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white">
            Save platform settings
          </button>
        </form>
      ) : (
        <p className="mt-6 text-mid">Loading…</p>
      )}
      <section className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-navy">System information</h2>
        <ul className="mt-2 font-sans text-sm text-mid">
          <li>API: check /api/health</li>
          <li>Database / Redis: configured on server</li>
          <li>Upload storage: local uploads directory</li>
        </ul>
      </section>
    </div>
  )
}
