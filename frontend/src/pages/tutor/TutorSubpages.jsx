import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiJson } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'
import { initialsFromName, formatUgx, formatRelativeTime } from '../../lib/dashboardFormat.js'

function TabBtn({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 font-heading text-sm font-semibold transition ${
        active ? 'bg-navy text-white' : 'bg-white text-navy ring-1 ring-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

export function TutorSchedule() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [view, setView] = useState('list')
  const [filterStatus, setFilterStatus] = useState('')

  async function load() {
    try {
      const data = await apiJson('/api/tutors/me/bookings')
      setBookings(data.bookings || [])
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load schedule')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  const filtered = useMemo(() => {
    let b = bookings
    if (filterStatus) b = b.filter((x) => x.status === filterStatus)
    return b
  }, [bookings, filterStatus])

  const byDate = useMemo(() => {
    const m = {}
    for (const b of filtered) {
      const d = new Date(b.scheduled_at).toDateString()
      if (!m[d]) m[d] = []
      m[d].push(b)
    }
    return m
  }, [filtered])

  async function complete(id) {
    try {
      await apiJson(`/api/bookings/${id}/complete`, { method: 'PATCH' })
      toast.success('Session marked complete.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not complete session')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">My Schedule</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TabBtn active={view === 'list'} onClick={() => setView('list')}>
          List view
        </TabBtn>
        <TabBtn active={view === 'calendar'} onClick={() => setView('calendar')}>
          Calendar view
        </TabBtn>
        <select
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {view === 'list' ? (
        <div className="mt-6 space-y-6">
          {Object.keys(byDate).length === 0 ? (
            <p className="text-mid">No sessions match filters.</p>
          ) : (
            Object.entries(byDate).map(([date, rows]) => (
              <section key={date} className="rounded-xl bg-white p-4 shadow-sm">
                <h2 className="font-heading font-semibold text-navy">{date}</h2>
                <ul className="mt-3 space-y-3">
                  {rows.map((b) => (
                    <li key={b.id} className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                          {initialsFromName(b.student_name)}
                        </div>
                        <div>
                          <p className="font-heading text-sm font-semibold text-navy">{b.student_name}</p>
                          <p className="font-sans text-xs text-mid">
                            {b.subject} · {b.session_type} · {new Date(b.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                            {b.duration_minutes}m · {b.session_mode}
                          </p>
                          <p className="font-heading text-xs text-emerald-700">You earn UGX {formatUgx(b.tutor_earnings)}</p>
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase">{b.status}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.session_mode === 'online' && b.status === 'accepted' ? (
                          <a
                            href={b.meeting_link || '#'}
                            className={`rounded-lg px-3 py-1.5 font-heading text-xs font-semibold text-white ${b.meeting_link ? 'bg-blue' : 'cursor-not-allowed bg-gray-400'}`}
                          >
                            Start session
                          </a>
                        ) : null}
                        {b.status === 'accepted' ? (
                          <button
                            type="button"
                            onClick={() => complete(b.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 font-heading text-xs font-semibold text-white"
                          >
                            Mark complete
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="font-sans text-sm text-mid">
            Calendar grid: each day shows session count. Click a day in the list above for detail.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <div key={d} className="font-heading font-semibold text-navy">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1
              const count = bookings.filter((b) => new Date(b.scheduled_at).getDate() === day && new Date(b.scheduled_at).getMonth() === new Date().getMonth()).length
              return (
                <div
                  key={i}
                  className={`rounded border p-2 ${count ? 'bg-blue/20 font-semibold text-navy' : 'border-gray-100 text-mid'}`}
                >
                  {day}
                  {count ? <span className="block text-[10px]">{count} sess.</span> : null}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function TutorRequests() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('pending')

  async function load() {
    try {
      const data = await apiJson('/api/tutors/me/bookings')
      setBookings(data.bookings || [])
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load requests')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  const list = bookings.filter((b) => {
    if (tab === 'pending') return b.status === 'pending'
    if (tab === 'accepted') return b.status === 'accepted'
    if (tab === 'declined') return b.status === 'declined'
    return false
  })

  async function respond(id, decision) {
    let declineReason
    if (decision === 'decline') {
      declineReason = window.prompt('Optional decline reason') || undefined
    }
    try {
      await apiJson(`/api/bookings/${id}/tutor-response`, {
        method: 'PATCH',
        body: { decision, declineReason },
      })
      toast.success(decision === 'accept' ? 'Booking accepted.' : 'Booking declined.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not update booking')
    }
  }

  async function addLink(id) {
    const link = window.prompt('Meeting link URL')
    if (!link) return
    try {
      await apiJson(`/api/bookings/${id}/meeting-link`, { method: 'PATCH', body: { meetingLink: link } })
      toast.success('Meeting link saved.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not save link')
    }
  }

  async function complete(id) {
    try {
      await apiJson(`/api/bookings/${id}/complete`, { method: 'PATCH' })
      toast.success('Session marked complete.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not complete session')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Student Requests</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <TabBtn active={tab === 'pending'} onClick={() => setTab('pending')}>
          Pending
        </TabBtn>
        <TabBtn active={tab === 'accepted'} onClick={() => setTab('accepted')}>
          Accepted
        </TabBtn>
        <TabBtn active={tab === 'declined'} onClick={() => setTab('declined')}>
          Declined
        </TabBtn>
      </div>
      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-mid shadow-sm">Nothing here yet.</p>
        ) : (
          list.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-heading text-sm font-bold text-white">
                  {initialsFromName(b.student_name)}
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy">{b.student_name}</p>
                  <p className="font-sans text-sm text-mid">{b.subject}</p>
                  <p className="font-sans text-xs text-mid">
                    {new Date(b.scheduled_at).toLocaleString()} · {b.session_type} · {b.session_mode}
                  </p>
                  <p className="font-heading text-sm text-navy">Student pays UGX {formatUgx(b.amount_student_pays)}</p>
                  <p className="font-sans text-xs text-emerald-700">Your earnings (80%): UGX {formatUgx(b.tutor_earnings)}</p>
                  <p className="font-sans text-[10px] text-mid">Received {formatRelativeTime(b.created_at)}</p>
                  {b.notes ? <p className="mt-1 font-sans text-xs text-mid">Notes: {b.notes}</p> : null}
                  {b.status === 'declined' && b.decline_reason ? (
                    <p className="mt-1 font-sans text-xs text-red-600">Reason: {b.decline_reason}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {b.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => respond(b.id, 'accept')}
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-heading text-sm font-semibold text-white"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => respond(b.id, 'decline')}
                      className="rounded-lg border-2 border-red-500 px-4 py-2 font-heading text-sm font-semibold text-red-600"
                    >
                      Decline
                    </button>
                    <a href={`mailto:${b.student_email}`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">
                      Message student
                    </a>
                  </>
                ) : null}
                {b.status === 'accepted' ? (
                  <>
                    {b.session_mode === 'online' ? (
                      <button type="button" onClick={() => addLink(b.id)} className="rounded-lg bg-blue px-3 py-2 text-sm text-white">
                        Add meeting link
                      </button>
                    ) : null}
                    <button type="button" onClick={() => complete(b.id)} className="rounded-lg bg-navy px-3 py-2 text-sm text-white">
                      Mark as completed
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function TutorEarnings() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [bookings, setBookings] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [wForm, setWForm] = useState({ amountUgx: '', method: 'mtn_momo', accountDetail: '' })

  useEffect(() => {
    ;(async () => {
      try {
        const [e, m, b, w] = await Promise.all([
          apiJson('/api/tutors/me/earnings'),
          apiJson('/api/tutors/me/earnings/monthly?months=6'),
          apiJson('/api/tutors/me/bookings'),
          apiJson('/api/tutors/me/withdrawals'),
        ])
        setSummary(e.summary)
        setMonthly(m.monthly || [])
        setBookings((b.bookings || []).filter((x) => x.status === 'completed'))
        setWithdrawals(w.withdrawals || [])
      } catch (err) {
        if (err.status === 401) navigate('/login', { replace: true })
        else toast.error(err.message || 'Could not load earnings')
      }
    })()
  }, [navigate])

  const thisMonth = new Date().getMonth()
  const monthBookings = bookings.filter((b) => new Date(b.scheduled_at).getMonth() === thisMonth)

  async function requestW(e) {
    e.preventDefault()
    try {
      await apiJson('/api/tutors/me/withdrawals', {
        method: 'POST',
        body: {
          amountUgx: Number(wForm.amountUgx),
          method: wForm.method,
          accountDetail: wForm.accountDetail,
        },
      })
      const w = await apiJson('/api/tutors/me/withdrawals')
      setWithdrawals(w.withdrawals || [])
      setWForm({ amountUgx: '', method: 'mtn_momo', accountDetail: '' })
      toast.success('Withdrawal request submitted.')
    } catch (err) {
      toast.error(err.message || 'Withdrawal request failed')
    }
  }

  const maxBar = Math.max(1, ...monthly.map((x) => Number(x.tutor_earnings_ugx)))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">My Earnings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['This month (your 80%)', formatUgx(monthBookings.reduce((s, b) => s + Number(b.tutor_earnings || 0), 0))],
          ['Platform fees (month est.)', formatUgx(monthBookings.reduce((s, b) => s + Number(b.platform_fee || 0), 0))],
          ['Sessions this month', String(monthBookings.length)],
          ['All-time earnings', formatUgx(summary?.total_earnings_ugx)],
        ].map(([a, b]) => (
          <div key={a} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="font-heading text-xl font-bold text-navy">{b}</p>
            <p className="mt-1 font-sans text-xs text-mid">{a}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-heading font-semibold text-navy">Last 6 months</h2>
        <div className="mt-4 flex h-40 items-end gap-2">
          {monthly.map((row) => (
            <div key={String(row.month)} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-blue"
                style={{ height: `${(Number(row.tutor_earnings_ugx) / maxBar) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-[9px] text-mid">{new Date(row.month).toLocaleDateString(undefined, { month: 'short' })}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
        <h2 className="p-4 font-heading font-semibold text-navy">Completed sessions</h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Student</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Type</th>
              <th className="p-2">Paid</th>
              <th className="p-2">Fee</th>
              <th className="p-2">You</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 50).map((b) => (
              <tr key={b.id} className="border-b border-gray-50">
                <td className="p-2">{new Date(b.scheduled_at).toLocaleDateString()}</td>
                <td className="p-2">{b.student_name}</td>
                <td className="p-2">{b.subject}</td>
                <td className="p-2">{b.session_type}</td>
                <td className="p-2">{formatUgx(b.amount_student_pays)}</td>
                <td className="p-2">{formatUgx(b.platform_fee)}</td>
                <td className="p-2 font-semibold text-emerald-700">{formatUgx(b.tutor_earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-navy">Request withdrawal</h2>
        <p className="mt-1 font-sans text-sm text-mid">Available balance (info only): UGX {formatUgx(summary?.total_earnings_ugx)}</p>
        <form onSubmit={requestW} className="mt-4 max-w-md space-y-2">
          <input
            type="number"
            required
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Amount UGX"
            value={wForm.amountUgx}
            onChange={(e) => setWForm((f) => ({ ...f, amountUgx: e.target.value }))}
          />
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={wForm.method}
            onChange={(e) => setWForm((f) => ({ ...f, method: e.target.value }))}
          >
            <option value="mtn_momo">MTN MoMo</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="bank_transfer">Bank</option>
          </select>
          <input
            required
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Phone / account number"
            value={wForm.accountDetail}
            onChange={(e) => setWForm((f) => ({ ...f, accountDetail: e.target.value }))}
          />
          <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            Request withdrawal
          </button>
        </form>
        <h3 className="mt-6 font-heading text-sm font-semibold">Withdrawal history</h3>
        <ul className="mt-2 space-y-1 font-sans text-xs text-mid">
          {withdrawals.map((w) => (
            <li key={w.id}>
              UGX {formatUgx(w.amount_ugx)} · {w.method} · {w.status} · {new Date(w.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

const QUAL_OPTS = ['Certificate', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other']
const EXP_OPTS = ['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', '10+ years']

export function TutorProfilePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [me, setMe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({})

  async function load() {
    try {
      const auth = await apiJson('/api/auth/me')
      setMe(auth)
      const tp = auth.tutorProfile
      const u = auth.user
      setForm({
        fullName: u.full_name || '',
        email: u.email || '',
        phone: u.phone || '',
        bio: tp?.bio || '',
        primarySubject: tp?.primary_subject || '',
        secondarySubject: tp?.secondary_subject || '',
        district: tp?.district || '',
        groupRateUgx: tp?.group_session_rate_ugx,
        oneOnOneRateUgx: tp?.one_on_one_rate_ugx,
        institution: tp?.institution_attended || '',
        graduationYear: tp?.graduation_year,
        currentEmployer: tp?.current_employer || '',
        qualification: QUAL_OPTS[0],
        yearsExperience: EXP_OPTS[2],
        sessionMode: tp?.session_mode === 'in_person' ? 'in_person' : tp?.session_mode || 'online',
        teachingLevels: tp?.teaching_levels || [],
      })
      if (u?.id) {
        const r = await apiJson(`/api/tutors/${u.id}/reviews`)
        setReviews(r.reviews || [])
      }
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load profile')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  async function save(e) {
    e.preventDefault()
    try {
      await apiJson('/api/tutors/me', {
        method: 'PATCH',
        body: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          bio: form.bio,
          primarySubject: form.primarySubject,
          secondarySubject: form.secondarySubject,
          district: form.district,
          groupRateUgx: Number(form.groupRateUgx),
          oneOnOneRateUgx: Number(form.oneOnOneRateUgx),
          institution: form.institution,
          graduationYear: Number(form.graduationYear),
          currentEmployer: form.currentEmployer,
          qualification: form.qualification,
          yearsExperience: form.yearsExperience,
          sessionMode: form.sessionMode,
          teachingLevels: form.teachingLevels,
        },
      })
      await load()
      toast.success('Profile saved.')
    } catch (err) {
      toast.error(err.message || 'Could not save profile')
    }
  }

  function toggleLevel(lv) {
    setForm((f) => {
      const s = new Set(f.teachingLevels || [])
      if (s.has(lv)) s.delete(lv)
      else s.add(lv)
      return { ...f, teachingLevels: [...s] }
    })
  }

  if (!me?.user) return <p className="p-6">Loading…</p>
  const tp = me.tutorProfile
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">My Profile</h1>
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="font-heading text-lg font-semibold text-navy">Preview (as students see you)</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
            {initialsFromName(me.user.full_name)}
          </div>
          <div>
            <p className="font-heading font-bold text-navy">{me.user.full_name}</p>
            <p className="text-sm text-mid">
              {tp?.primary_subject} · ★ {Number(tp?.average_rating || 0).toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold">Edit profile</h2>
        {['fullName', 'email', 'phone', 'district', 'bio', 'primarySubject', 'secondarySubject'].map((k) => (
          <div key={k}>
            <label className="text-xs font-semibold">{k}</label>
            {k === 'bio' ? (
              <textarea
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                rows={3}
                maxLength={2000}
                value={form[k] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            ) : (
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={form[k] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            )}
            {k === 'bio' ? (
              <p className="text-xs text-mid">{(form.bio || '').length} / 2000</p>
            ) : null}
          </div>
        ))}
        <div>
          <label className="text-xs font-semibold">Qualification</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={form.qualification}
            onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
          >
            {QUAL_OPTS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold">Institution & year</label>
          <div className="mt-1 flex gap-2">
            <input
              className="flex-1 rounded border px-3 py-2 text-sm"
              value={form.institution}
              onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
            />
            <input
              type="number"
              className="w-24 rounded border px-3 py-2 text-sm"
              value={form.graduationYear}
              onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold">Current employer</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={form.currentEmployer}
            onChange={(e) => setForm((f) => ({ ...f, currentEmployer: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Experience</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={form.yearsExperience}
            onChange={(e) => setForm((f) => ({ ...f, yearsExperience: e.target.value }))}
          >
            {EXP_OPTS.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-xs font-semibold">Teaching levels</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {['O-Level', 'A-Level', 'University'].map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => toggleLevel(lv)}
                className={`rounded-full px-3 py-1 text-xs ${form.teachingLevels?.includes(lv) ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold">Session mode</label>
          <select
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={form.sessionMode}
            onChange={(e) => setForm((f) => ({ ...f, sessionMode: e.target.value }))}
          >
            <option value="online">Online</option>
            <option value="in_person">In person</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-semibold">Group rate UGX</label>
            <input
              type="number"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={form.groupRateUgx}
              onChange={(e) => setForm((f) => ({ ...f, groupRateUgx: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold">One-on-one UGX</label>
            <input
              type="number"
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              value={form.oneOnOneRateUgx}
              onChange={(e) => setForm((f) => ({ ...f, oneOnOneRateUgx: e.target.value }))}
            />
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-blue px-4 py-2 font-heading text-sm font-semibold text-white">
          Save changes
        </button>
      </form>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold text-navy">Reviews</h2>
        <p className="mt-2 font-heading text-2xl text-gold">
          ★ {Number(tp?.average_rating || 0).toFixed(1)} <span className="text-sm text-mid">({tp?.total_reviews || 0})</span>
        </p>
        <ul className="mt-4 space-y-1 text-xs text-mid">
          {breakdown.map((b) => (
            <li key={b.star}>
              {b.star}★ — {b.pct}% ({b.n})
            </li>
          ))}
        </ul>
        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                  {initialsFromName(r.student_name)}
                </div>
                <span className="text-gold">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-mid">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 font-sans text-sm text-mid">{r.comment || '—'}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export function TutorSettingsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [pw, setPw] = useState({ c: '', n: '', x: '' })
  const [msg, setMsg] = useState('')

  async function savePw(e) {
    e.preventDefault()
    if (pw.n !== pw.x) {
      setMsg('Mismatch')
      toast.error('New passwords do not match')
      return
    }
    try {
      await apiJson('/api/auth/me/password', { method: 'PATCH', body: { currentPassword: pw.c, newPassword: pw.n } })
      setMsg('Updated')
      toast.success('Password updated.')
    } catch (err) {
      setMsg(err.message)
      toast.error(err.message || 'Could not update password')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Settings</h1>
      <p className="mt-2 font-sans text-sm text-mid">Use My Profile for teaching details. Here: security and account.</p>
      <form onSubmit={savePw} className="mt-6 max-w-md space-y-3 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold">Change password</h2>
        {msg ? <p className="text-sm text-mid">{msg}</p> : null}
        <input type="password" className="w-full rounded border px-3 py-2 text-sm" placeholder="Current" value={pw.c} onChange={(e) => setPw((p) => ({ ...p, c: e.target.value }))} />
        <input type="password" className="w-full rounded border px-3 py-2 text-sm" placeholder="New" value={pw.n} onChange={(e) => setPw((p) => ({ ...p, n: e.target.value }))} />
        <input type="password" className="w-full rounded border px-3 py-2 text-sm" placeholder="Confirm" value={pw.x} onChange={(e) => setPw((p) => ({ ...p, x: e.target.value }))} />
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm text-white">
          Update password
        </button>
      </form>
      <div className="mt-8 max-w-md rounded-xl border border-amber-100 bg-amber-50/50 p-6">
        <p className="font-sans text-sm text-mid">Request account deactivation: contact admin or support.</p>
      </div>
    </div>
  )
}

export function TutorNotificationsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [items, setItems] = useState([])
  async function load() {
    try {
      const data = await apiJson('/api/notifications?limit=100')
      setItems(data.notifications || [])
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load notifications')
    }
  }
  useEffect(() => {
    load()
  }, [navigate])

  async function readAll() {
    try {
      await apiJson('/api/notifications/read-all', { method: 'POST' })
      toast.success('All notifications marked read.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not mark all read')
    }
  }

  async function clearAll() {
    if (!window.confirm('Clear all notifications?')) return
    try {
      await apiJson('/api/notifications', { method: 'DELETE' })
      toast.success('Notifications cleared.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not clear notifications')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Notifications</h1>
      <div className="mt-4 flex gap-2">
        <button type="button" className="rounded border px-3 py-1 text-sm" onClick={readAll}>
          Mark all read
        </button>
        <button type="button" className="rounded border px-3 py-1 text-sm text-red-700" onClick={clearAll}>
          Clear all
        </button>
      </div>
      <ul className="mt-6 space-y-2">
        {items.length === 0 ? (
          <li className="rounded-xl bg-white p-8 text-center text-mid shadow-sm">No notifications.</li>
        ) : (
          items.map((n) => (
            <li key={n.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-heading font-semibold">{n.title}</p>
              <p className="text-sm text-mid">{n.body}</p>
              <p className="mt-1 text-xs text-mid">{formatRelativeTime(n.created_at)}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
