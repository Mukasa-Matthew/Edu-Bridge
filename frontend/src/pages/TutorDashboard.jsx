import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { apiJson } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import { initialsFromName, formatUgx } from '../lib/dashboardFormat.js'
import {
  TutorSchedule,
  TutorRequests,
  TutorEarnings,
  TutorProfilePage,
  TutorSettingsPage,
  TutorNotificationsPage,
} from './tutor/TutorSubpages.jsx'

const base = '/dashboard/tutor'

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
  cal: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  inbox: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6zm0 4l8 5 8-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  money: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v10M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M6 20a6 6 0 0112 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  gear: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2"
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

const tutorNav = [
  { to: base, label: 'Dashboard Overview', icon: ic.home },
  { to: `${base}/schedule`, label: 'My Schedule', icon: ic.cal },
  { to: `${base}/requests`, label: 'Student Requests', icon: ic.inbox },
  { to: `${base}/earnings`, label: 'My Earnings', icon: ic.money },
  { to: `${base}/profile`, label: 'My Profile', icon: ic.user },
  { to: `${base}/notifications`, label: 'Notifications', icon: ic.bell },
  { to: `${base}/settings`, label: 'Settings', icon: ic.gear },
]

function TutorOverview() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loadErr, setLoadErr] = useState('')
  const [me, setMe] = useState(null)
  const [bookings, setBookings] = useState([])
  const [earnings, setEarnings] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [authRes, bookRes, earnRes] = await Promise.all([
          apiJson('/api/auth/me'),
          apiJson('/api/tutors/me/bookings'),
          apiJson('/api/tutors/me/earnings'),
        ])
        if (cancelled) return
        setMe(authRes)
        setBookings(bookRes.bookings || [])
        setEarnings(earnRes.summary)
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
  const tp = me?.tutorProfile
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || 'Tutor'
  const pending = bookings.filter((b) => b.status === 'pending')
  const accepted = bookings.filter((b) => b.status === 'accepted')
  const totalBilled = bookings
    .filter((b) => b.status === 'completed')
    .reduce((s, b) => s + Number(b.amount_student_pays || 0), 0)
  const tutorShare = Number(earnings?.total_earnings_ugx || 0)
  const platformShare = Number(earnings?.total_platform_fees_ugx || 0)

  async function respondBooking(id, decision) {
    try {
      setLoadErr('')
      let declineReason
      if (decision === 'decline') {
        declineReason = window.prompt('Optional reason for declining') || undefined
      }
      await apiJson(`/api/bookings/${id}/tutor-response`, {
        method: 'PATCH',
        body: { decision, declineReason },
      })
      const bookRes = await apiJson('/api/tutors/me/bookings')
      setBookings(bookRes.bookings || [])
      toast.success(decision === 'accept' ? 'Booking accepted.' : 'Booking declined.')
    } catch (e) {
      const m = e.message || 'Could not update booking'
      setLoadErr(m)
      toast.error(m)
    }
  }

  if (loadErr && !user) {
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
      {loadErr ? (
        <p className="mb-4 font-sans text-sm text-amber-700" role="status">
          {loadErr}
        </p>
      ) : null}
      <div className="lg:grid lg:grid-cols-[1fr_minmax(260px,300px)] lg:gap-8">
        <div>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-xl font-bold text-navy sm:text-2xl">
                Good morning, {firstName} 👋
              </h1>
              <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 font-heading text-xs font-semibold text-emerald-800">
                {tp?.tutor_status === 'approved' ? 'Verified Tutor ✓' : `Status: ${tp?.tutor_status || '—'}`}
              </span>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ['Total Students (est.)', String(tp?.total_students ?? '—')],
              ['Sessions (all time)', String(bookings.length)],
              ['Total Earnings (UGX)', formatUgx(tutorShare)],
              ['Rating', `${Number(tp?.average_rating || 0).toFixed(1)}★`],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-heading text-xl font-bold text-navy sm:text-2xl">{val}</p>
                <p className="mt-1 font-sans text-sm text-mid">{label}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-navy">Completed sessions — revenue split</h2>
            <ul className="mt-4 space-y-2 font-sans text-sm text-mid">
              <li className="flex justify-between">
                <span>Total billed (completed)</span>
                <span className="font-heading font-semibold text-navy">UGX {formatUgx(totalBilled)}</span>
              </li>
              <li className="flex justify-between">
                <span>EduBridge fee (20%)</span>
                <span className="text-red-600">UGX {formatUgx(platformShare)}</span>
              </li>
              <li className="flex justify-between border-t border-gray pt-2">
                <span className="font-medium text-navy">Your earnings (80%)</span>
                <span className="font-heading text-lg font-bold text-emerald-600">UGX {formatUgx(tutorShare)}</span>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-navy">New Booking Requests</h2>
            <div className="mt-4 space-y-4">
              {pending.length === 0 ? (
                <p className="font-sans text-sm text-mid">No pending requests.</p>
              ) : (
                pending.map((b) => (
                  <div key={b.id} className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="font-heading font-semibold text-navy">
                      {b.student_name} · {b.subject}
                    </p>
                    <p className="font-sans text-sm text-mid">
                      {new Date(b.scheduled_at).toLocaleString()} · {b.session_type} · UGX{' '}
                      {formatUgx(b.amount_student_pays)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => respondBooking(b.id, 'accept')}
                        className="rounded-lg bg-emerald-600 px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => respondBooking(b.id, 'decline')}
                        className="rounded-lg border-2 border-red-500 px-4 py-2 font-heading text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-navy">Upcoming Sessions</h2>
            <ul className="mt-4 list-none p-0">
              {accepted.length === 0 ? (
                <li className="font-sans text-sm text-mid">No upcoming sessions.</li>
              ) : (
                accepted.map((b) => (
                  <li
                    key={b.id}
                    className="mb-3 flex flex-row items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 last:mb-0"
                  >
                    <div>
                      <p className="font-heading text-sm font-semibold text-navy">{b.student_name}</p>
                      <p className="mt-0.5 font-sans text-xs text-mid">
                        {new Date(b.scheduled_at).toLocaleString()} · {b.session_mode}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 font-heading text-sm font-semibold text-blue-700">
                      UGX {formatUgx(b.amount_student_pays)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <aside className="mt-8 hidden lg:mt-0 lg:block">
          <div className="sticky top-4 rounded-xl bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy font-heading text-2xl font-bold text-white">
              {initialsFromName(user.full_name)}
            </div>
            <p className="mt-4 text-center font-heading text-lg font-semibold text-navy">{user.full_name}</p>
            <p className="mt-1 text-center font-sans text-sm text-mid">
              Primary Subject: {tp?.primary_subject || '—'}
            </p>
            <p className="text-center font-sans text-sm text-mid">
              Secondary Subject: {tp?.secondary_subject || '—'}
            </p>
            <p className="mt-3 text-center font-sans text-sm text-gold">
              ★ {Number(tp?.average_rating || 0).toFixed(1)} ({tp?.total_reviews || 0} reviews)
            </p>
            <div className="mt-4 border-t border-gray pt-4 font-sans text-sm text-mid">
              <p>
                <span className="font-heading font-semibold text-navy">Group:</span> UGX{' '}
                {formatUgx(tp?.group_session_rate_ugx)}/student
              </p>
              <p className="mt-1">
                <span className="font-heading font-semibold text-navy">One-on-one:</span> UGX{' '}
                {formatUgx(tp?.one_on_one_rate_ugx)}/session
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function TutorDashboard() {
  return (
    <DashboardLayout basePath={base} navItems={tutorNav} notificationsPath={`${base}/notifications`}>
      <Routes>
        <Route index element={<TutorOverview />} />
        <Route path="schedule" element={<TutorSchedule />} />
        <Route path="requests" element={<TutorRequests />} />
        <Route path="earnings" element={<TutorEarnings />} />
        <Route path="profile" element={<TutorProfilePage />} />
        <Route path="notifications" element={<TutorNotificationsPage />} />
        <Route path="settings" element={<TutorSettingsPage />} />
      </Routes>
    </DashboardLayout>
  )
}
