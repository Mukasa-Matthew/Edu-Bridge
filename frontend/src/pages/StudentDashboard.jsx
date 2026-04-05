import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { apiJson } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { initialsFromName, formatUgx } from '../lib/dashboardFormat.js'
import {
  StudentFindTutors,
  StudentSessions,
  StudentStudyMaterials,
  StudentMaterialReader,
  StudentSubscription,
  StudentSettings,
  StudentNotifications,
} from './student/StudentSubpages.jsx'

const base = '/dashboard/student'

const ic = {
  home: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  search: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  cal: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  book: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h9a3 3 0 013 3v14l-6-3-6 3V7a3 3 0 013-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  card: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  gear: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  bell: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

const studentNav = [
  { to: base, label: 'Home', icon: ic.home },
  { to: `${base}/find-tutors`, label: 'Find Tutors', icon: ic.search },
  { to: `${base}/sessions`, label: 'My Sessions', icon: ic.cal },
  { to: `${base}/materials`, label: 'Study Materials', icon: ic.book },
  { to: `${base}/subscription`, label: 'My Subscription', icon: ic.card },
  { to: `${base}/notifications`, label: 'Notifications', icon: ic.bell },
  { to: `${base}/settings`, label: 'Settings', icon: ic.gear },
]

function StudentOverview() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loadErr, setLoadErr] = useState('')
  const [me, setMe] = useState(null)
  const [bookings, setBookings] = useState([])
  const [materials, setMaterials] = useState([])
  const [matSubRequired, setMatSubRequired] = useState(false)
  const [tutorList, setTutorList] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [authRes, bookRes, matRes, tutRes] = await Promise.all([
          apiJson('/api/auth/me'),
          apiJson('/api/students/me/bookings'),
          apiJson('/api/materials'),
          apiJson('/api/tutors'),
        ])
        if (cancelled) return
        setMe(authRes)
        setBookings(bookRes.bookings || [])
        setMaterials(matRes.materials || [])
        setMatSubRequired(Boolean(matRes.subscriptionRequired))
        setTutorList(tutRes.tutors || [])
      } catch (e) {
        if (e.status === 401) navigate('/login', { replace: true })
        else if (!cancelled) {
          const m = e.message || 'Could not load dashboard'
          setLoadErr(m)
          toast.error(m)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  const user = me?.user
  const sp = me?.studentProfile
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || 'Student'
  const now = new Date()
  const upcoming = bookings.filter((b) => {
    const t = new Date(b.scheduled_at)
    return t >= now && (b.status === 'pending' || b.status === 'accepted')
  })
  const next = upcoming.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0]
  const completed = bookings.filter((b) => b.status === 'completed')

  const subLabel =
    sp?.subscription_status === 'active'
      ? 'Active subscription'
      : sp?.subscription_status === 'inactive'
        ? 'No active subscription'
        : `Subscription: ${sp?.subscription_status || '—'}`

  if (loadErr) {
    return (
      <div className="p-6">
        <p className="font-sans text-red-600">{loadErr}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="font-sans text-mid">Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-navy sm:text-2xl">
            Good morning, {firstName} 👋
          </h1>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 font-heading text-xs font-semibold text-emerald-800">
            {subLabel}
          </span>
        </div>
      </header>

      {matSubRequired ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 font-sans text-sm text-amber-950">
          <p className="font-heading font-semibold text-navy">Unlock study materials</p>
          <p className="mt-1">
            An active subscription lets you read materials in the app (downloads are disabled for students).
          </p>
          <Link to={`${base}/subscription`} className="mt-2 inline-block font-heading text-sm font-semibold text-navy underline">
            My Subscription
          </Link>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Sessions Booked', String(bookings.length)],
          ['Upcoming Sessions', String(upcoming.length)],
          [
            'Materials available',
            matSubRequired ? 'Subscribe to unlock' : String(materials.length),
          ],
          ['Study streak', String(Math.min(completed.length, 30))],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="font-heading text-3xl font-bold text-navy">{val}</p>
            <p className="mt-1 font-sans text-sm text-mid">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-navy">Next Session</h2>
        {next ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white">
                {initialsFromName(next.tutor_name)}
              </div>
              <div>
                <p className="font-heading font-semibold text-navy">{next.tutor_name}</p>
                <p className="font-sans text-sm text-mid">{next.subject}</p>
                <p className="mt-1 font-sans text-sm text-mid">
                  {new Date(next.scheduled_at).toLocaleString()} · {next.session_mode}
                </p>
              </div>
            </div>
            {next.meeting_link ? (
              <a
                href={next.meeting_link}
                className="font-heading w-full rounded-lg bg-blue px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-sky sm:w-auto"
              >
                Join Session
              </a>
            ) : (
              <span className="font-sans text-sm text-mid">No meeting link yet</span>
            )}
          </div>
        ) : (
          <p className="mt-4 font-sans text-sm text-mid">No upcoming sessions.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-navy">Recommended Tutors</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {tutorList.length === 0 ? (
            <p className="font-sans text-sm text-mid">No tutors to show yet.</p>
          ) : (
            tutorList.slice(0, 6).map((t) => (
              <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-heading text-sm font-bold text-white">
                    {initialsFromName(t.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-navy">{t.full_name}</p>
                    <p className="font-sans text-xs text-mid">{t.primary_subject}</p>
                  </div>
                </div>
                <p className="mt-2 font-sans text-sm text-gold">★ {Number(t.average_rating || 0).toFixed(1)}</p>
                <p className="font-heading text-sm font-bold text-navy">
                  From UGX {formatUgx(t.one_on_one_rate_ugx)}
                </p>
                <Link
                  to={`${base}/find-tutors`}
                  className="font-heading mt-3 block w-full rounded-lg bg-blue py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Book
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold text-navy">Recent Activity</h2>
        <ul className="mt-4 space-y-3 font-sans text-sm text-mid">
          {completed.slice(0, 5).map((b) => (
            <li key={b.id} className="flex gap-2">
              <span className="text-emerald-600" aria-hidden="true">
                ✓
              </span>
              Session with {b.tutor_name} completed — {b.subject}
            </li>
          ))}
          {completed.length === 0 ? <li className="text-mid">No completed sessions yet.</li> : null}
        </ul>
      </section>
    </div>
  )
}

export default function StudentDashboard() {
  return (
    <DashboardLayout basePath={base} navItems={studentNav} notificationsPath={`${base}/notifications`}>
      <Routes>
        <Route index element={<StudentOverview />} />
        <Route path="find-tutors" element={<StudentFindTutors />} />
        <Route path="sessions" element={<StudentSessions />} />
        <Route path="materials/read/:id" element={<StudentMaterialReader />} />
        <Route path="materials" element={<StudentStudyMaterials />} />
        <Route path="subscription" element={<StudentSubscription />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="settings" element={<StudentSettings />} />
      </Routes>
    </DashboardLayout>
  )
}
