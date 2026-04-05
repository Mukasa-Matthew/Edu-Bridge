import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom'
import { apiJson } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'
import { initialsFromName, formatUgx, formatRelativeTime } from '../../lib/dashboardFormat.js'
import { youtubeUrlToEmbedSrc } from '../../lib/youtube.js'

const FEE_PCT = 20

const MATERIAL_TYPES = [
  { value: '', label: 'All types' },
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'revision_notes', label: 'Revision Notes' },
  { value: 'practice_questions', label: 'Practice Questions' },
  { value: 'video_notes', label: 'Video Notes' },
  { value: 'textbook_summary', label: 'Textbook Summary' },
]

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

export function StudentFindTutors() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [district, setDistrict] = useState('')
  const [sessionMode, setSessionMode] = useState('')
  const [minPrice, setMinPrice] = useState(3000)
  const [maxPrice, setMaxPrice] = useState(30000)
  const [minRating, setMinRating] = useState('')
  const [detail, setDetail] = useState(null)
  const [reviews, setReviews] = useState([])
  const [booking, setBooking] = useState(null)
  const [bookForm, setBookForm] = useState({
    sessionType: 'one_on_one',
    sessionMode: 'online',
    scheduledAt: '',
    durationMinutes: 60,
    paymentMethod: 'mtn_momo',
    notes: '',
  })
  const [bookMsg, setBookMsg] = useState('')
  const [bookOk, setBookOk] = useState(false)

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const q = new URLSearchParams()
      if (search.trim()) q.set('search', search.trim())
      if (subject.trim()) q.set('subject', subject.trim())
      if (level) q.set('level', level)
      if (district.trim()) q.set('district', district.trim())
      if (sessionMode) q.set('sessionMode', sessionMode)
      if (minRating) q.set('minRating', minRating)
      q.set('minPrice', String(minPrice))
      q.set('maxPrice', String(maxPrice))
      const data = await apiJson(`/api/tutors?${q}`)
      setTutors(data.tutors || [])
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else {
        const m = e.message || 'Could not load tutors'
        setErr(m)
        toast.error(m)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openDetail(t, openBook = false) {
    setDetail(t)
    setBookMsg('')
    setBookOk(false)
    if (openBook) setBooking(true)
    try {
      const [one, revRes] = await Promise.all([
        apiJson(`/api/tutors/${t.id}`),
        apiJson(`/api/tutors/${t.id}/reviews`),
      ])
      setDetail(one.tutor)
      setReviews(revRes.reviews || [])
    } catch {
      setReviews([])
      toast.error('Could not load tutor details.')
    }
  }

  const rateForBooking = useMemo(() => {
    if (!detail || !bookForm.sessionType) return 0
    return bookForm.sessionType === 'group' ? detail.group_session_rate_ugx : detail.one_on_one_rate_ugx
  }, [detail, bookForm.sessionType])

  const feeBreakdown = useMemo(() => {
    const total = Number(rateForBooking) || 0
    const fee = Math.floor((total * FEE_PCT) / 100)
    return { sessionRate: total, platformFee: fee, totalPay: total }
  }, [rateForBooking])

  async function submitBooking(e) {
    e.preventDefault()
    if (!detail) return
    setBookMsg('')
    try {
      const iso = bookForm.scheduledAt ? new Date(bookForm.scheduledAt).toISOString() : ''
      await apiJson('/api/bookings', {
        method: 'POST',
        body: {
          tutorId: detail.user_id || detail.id,
          subject: detail.primary_subject,
          sessionType: bookForm.sessionType,
          sessionMode: bookForm.sessionMode,
          scheduledAt: iso,
          durationMinutes: Number(bookForm.durationMinutes) || 60,
          amountStudentPays: feeBreakdown.totalPay,
          paymentMethod: bookForm.paymentMethod,
          notes: bookForm.notes || undefined,
        },
      })
      setBookOk(true)
      setBookMsg('Booking submitted. Your tutor will confirm soon.')
      toast.success('Booking submitted. Your tutor will confirm soon.')
    } catch (ex) {
      const m = ex.message || 'Booking failed'
      setBookMsg(m)
      toast.error(m)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Find Tutors</h1>
      <p className="mt-1 font-sans text-sm text-mid">Search and filter verified tutors, then book a session.</p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-4 rounded-xl bg-white p-4 shadow-sm lg:w-72">
          <label className="block font-heading text-xs font-semibold text-navy">Search</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            placeholder="Name or subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="block font-heading text-xs font-semibold text-navy">Subject</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label className="block font-heading text-xs font-semibold text-navy">Education level</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Any</option>
            <option value="O-Level">O-Level</option>
            <option value="A-Level">A-Level</option>
            <option value="University">University</option>
          </select>
          <label className="block font-heading text-xs font-semibold text-navy">District</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <label className="block font-heading text-xs font-semibold text-navy">Session mode</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            value={sessionMode}
            onChange={(e) => setSessionMode(e.target.value)}
          >
            <option value="">Any</option>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
          </select>
          <label className="block font-heading text-xs font-semibold text-navy">
            Price (UGX): {formatUgx(minPrice)} — {formatUgx(maxPrice)}
          </label>
          <input
            type="range"
            min={3000}
            max={30000}
            step={500}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
          />
          <input
            type="range"
            min={3000}
            max={30000}
            step={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <label className="block font-heading text-xs font-semibold text-navy">Minimum rating</label>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 font-sans text-sm"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Any</option>
            <option value="3">3★ and above</option>
            <option value="4">4★ and above</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="w-full rounded-lg bg-blue py-2.5 font-heading text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply filters
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          {loading ? (
            <p className="font-sans text-mid">Loading tutors…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tutors.map((t) => (
                <div key={t.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-sm font-bold text-white">
                      {initialsFromName(t.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-navy">{t.full_name}</p>
                      <p className="font-sans text-xs text-mid">
                        {t.primary_subject}
                        {t.secondary_subject ? ` · ${t.secondary_subject}` : ''}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(t.teaching_levels || []).map((lv) => (
                          <span key={lv} className="rounded bg-gray-100 px-2 py-0.5 font-heading text-[10px] text-navy">
                            {lv}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 font-sans text-xs text-gold">
                        ★ {Number(t.average_rating || 0).toFixed(1)} ({t.total_reviews || 0})
                      </p>
                      <p className="font-sans text-xs text-mid">{t.district}</p>
                      <span className="mt-1 inline-block rounded-full bg-sky/20 px-2 py-0.5 font-heading text-[10px] text-navy">
                        {t.session_mode?.replace('_', ' ')}
                      </span>
                      <p className="mt-2 font-heading text-xs text-navy">
                        Group UGX {formatUgx(t.group_session_rate_ugx)} · 1:1 UGX {formatUgx(t.one_on_one_rate_ugx)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(t)}
                      className="flex-1 rounded-lg border border-navy py-2 font-heading text-xs font-semibold text-navy hover:bg-navy/5"
                    >
                      View profile
                    </button>
                    <button
                      type="button"
                      onClick={() => openDetail(t, true)}
                      className="flex-1 rounded-lg bg-blue py-2 font-heading text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Book session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {detail && !booking ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex justify-between gap-4">
              <h2 className="font-heading text-lg font-bold text-navy">{detail.full_name}</h2>
              <button
                type="button"
                className="text-mid hover:text-navy"
                onClick={() => {
                  setDetail(null)
                  setBooking(false)
                }}
              >
                ✕
              </button>
            </div>
            <p className="mt-2 font-sans text-sm text-mid">{detail.bio}</p>
            <p className="mt-2 font-sans text-xs text-mid">
              Qualification: {detail.highest_qualification} · {detail.institution_attended}
            </p>
            <p className="font-sans text-xs text-mid">Employer: {detail.current_employer}</p>
            <h3 className="mt-4 font-heading text-sm font-semibold text-navy">Reviews</h3>
            <ul className="mt-2 max-h-32 space-y-2 overflow-y-auto font-sans text-xs text-mid">
              {reviews.length === 0 ? <li>No reviews yet.</li> : null}
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-2">
                  <span className="text-gold">{'★'.repeat(r.rating)}</span> {r.student_name} — {r.comment || '—'}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setBooking(true)
                setBookOk(false)
                setBookMsg('')
              }}
              className="mt-4 w-full rounded-lg bg-blue py-2.5 font-heading text-sm font-semibold text-white"
            >
              Book a session
            </button>
          </div>
        </div>
      ) : null}

      {detail && booking ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg font-bold text-navy">Book session</h3>
            {bookOk ? (
              <p className="mt-4 font-sans text-sm text-emerald-700">{bookMsg}</p>
            ) : (
              <form onSubmit={submitBooking} className="mt-4 space-y-3">
                <label className="block font-heading text-xs font-semibold">Session type</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={bookForm.sessionType}
                  onChange={(e) => setBookForm((f) => ({ ...f, sessionType: e.target.value }))}
                >
                  <option value="one_on_one">One-on-one</option>
                  <option value="group">Group</option>
                </select>
                <label className="block font-heading text-xs font-semibold">Mode</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={bookForm.sessionMode}
                  onChange={(e) => setBookForm((f) => ({ ...f, sessionMode: e.target.value }))}
                >
                  <option value="online">Online</option>
                  <option value="in_person">In person</option>
                </select>
                <label className="block font-heading text-xs font-semibold">Date & time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={bookForm.scheduledAt}
                  onChange={(e) => setBookForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
                <label className="block font-heading text-xs font-semibold">Duration (minutes)</label>
                <input
                  type="number"
                  min={30}
                  step={15}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={bookForm.durationMinutes}
                  onChange={(e) => setBookForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                />
                <div className="rounded-lg bg-gray-50 p-3 font-sans text-sm">
                  <p>Session rate: UGX {formatUgx(feeBreakdown.sessionRate)}</p>
                  <p>Platform fee ({FEE_PCT}%): UGX {formatUgx(feeBreakdown.platformFee)}</p>
                  <p className="font-heading font-semibold text-navy">Total you pay: UGX {formatUgx(feeBreakdown.totalPay)}</p>
                </div>
                <label className="block font-heading text-xs font-semibold">Payment method</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={bookForm.paymentMethod}
                  onChange={(e) => setBookForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                >
                  <option value="mtn_momo">MTN MoMo</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="bank_transfer">Bank</option>
                </select>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Notes for tutor (optional)"
                  value={bookForm.notes}
                  onChange={(e) => setBookForm((f) => ({ ...f, notes: e.target.value }))}
                />
                {bookMsg ? <p className="text-sm text-red-600">{bookMsg}</p> : null}
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-blue py-2.5 font-heading text-sm font-semibold text-white">
                    Confirm booking
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border px-4 py-2 text-sm"
                    onClick={() => setBooking(false)}
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
            <button
              type="button"
              className="mt-4 w-full text-sm text-mid underline"
              onClick={() => {
                setBooking(false)
                setDetail(null)
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function StudentSessions() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [err, setErr] = useState('')
  const [reviewFor, setReviewFor] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewErr, setReviewErr] = useState('')

  async function load() {
    try {
      const data = await apiJson('/api/students/me/bookings')
      setBookings(data.bookings || [])
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else {
        const m = e.message || 'Could not load'
        setErr(m)
        toast.error(m)
      }
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  const now = new Date()
  const upcoming = bookings.filter(
    (b) =>
      (b.status === 'pending' || b.status === 'accepted') && new Date(b.scheduled_at) >= now
  )
  const completed = bookings.filter((b) => b.status === 'completed')
  const cancelled = bookings.filter((b) => b.status === 'cancelled' || b.status === 'declined')

  const list =
    tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : cancelled

  async function cancelBooking(id) {
    const reason = window.prompt('Cancellation reason (optional)') || ''
    try {
      await apiJson(`/api/bookings/${id}/cancel`, { method: 'PATCH', body: { reason } })
      toast.success('Session cancelled.')
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not cancel')
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    if (!reviewFor) return
    setReviewErr('')
    try {
      await apiJson(`/api/bookings/${reviewFor.id}/review`, {
        method: 'POST',
        body: { rating: Number(rating), comment: comment || undefined },
      })
      setReviewFor(null)
      toast.success('Thanks — your review was posted.')
      await load()
    } catch (e) {
      const m = e.message || 'Failed'
      setReviewErr(m)
      toast.error(m)
    }
  }

  function SessionCard({ b }) {
    const isUpcoming = tab === 'upcoming'
    const hours =
      (new Date(b.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60)
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-heading text-xs font-bold text-white">
            {initialsFromName(b.tutor_name)}
          </div>
          <div>
            <p className="font-heading font-semibold text-navy">{b.tutor_name}</p>
            <p className="font-sans text-sm text-mid">{b.subject}</p>
            <p className="font-sans text-xs text-mid">
              {new Date(b.scheduled_at).toLocaleString()} · {b.session_type} · {b.session_mode}
            </p>
            <p className="font-heading text-xs text-navy">UGX {formatUgx(b.amount_student_pays)}</p>
            <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 font-heading text-[10px] uppercase">
              {b.status}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {isUpcoming && b.session_mode === 'online' && b.meeting_link ? (
            <a
              href={b.meeting_link}
              className="rounded-lg bg-blue px-3 py-1.5 font-heading text-xs font-semibold text-white"
            >
              Join session
            </a>
          ) : null}
          {isUpcoming && (b.status === 'pending' || (b.status === 'accepted' && hours > 24)) ? (
            <button
              type="button"
              onClick={() => cancelBooking(b.id)}
              className="rounded-lg border border-red-300 px-3 py-1.5 font-heading text-xs font-semibold text-red-600"
            >
              Cancel session
            </button>
          ) : null}
          {tab === 'completed' && !b.review_id ? (
            <button
              type="button"
              onClick={() => setReviewFor(b)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-heading text-xs font-semibold text-white"
            >
              Leave a review
            </button>
          ) : null}
          {b.review_id ? (
            <p className="font-sans text-xs text-gold">Your review: {'★'.repeat(Number(b.review_rating || 0))}</p>
          ) : null}
          {tab === 'cancelled' ? (
            <Link
              to="/dashboard/student/find-tutors"
              className="rounded-lg border border-navy px-3 py-1.5 font-heading text-xs font-semibold text-navy"
            >
              Rebook
            </Link>
          ) : null}
        </div>
        {tab === 'cancelled' && b.cancellation_reason ? (
          <p className="mt-2 font-sans text-xs text-mid">Reason: {b.cancellation_reason}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">My Sessions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <TabBtn active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
          Upcoming
        </TabBtn>
        <TabBtn active={tab === 'completed'} onClick={() => setTab('completed')}>
          Completed
        </TabBtn>
        <TabBtn active={tab === 'cancelled'} onClick={() => setTab('cancelled')}>
          Cancelled / Declined
        </TabBtn>
      </div>
      {err ? <p className="mt-4 text-red-600">{err}</p> : null}
      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center font-sans text-mid shadow-sm">No sessions in this tab.</p>
        ) : (
          list.map((b) => <SessionCard key={b.id} b={b} />)
        )}
      </div>

      {reviewFor ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitReview} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-heading font-bold text-navy">Review {reviewFor.tutor_name}</h3>
            <label className="mt-3 block text-xs font-semibold">Rating</label>
            <select
              className="mt-1 w-full rounded border px-3 py-2"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>
            <label className="mt-3 block text-xs font-semibold">Comment</label>
            <textarea
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {reviewErr ? <p className="text-sm text-red-600">{reviewErr}</p> : null}
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-navy py-2 text-sm font-semibold text-white">
                Submit
              </button>
              <button type="button" className="rounded-lg border px-4" onClick={() => setReviewFor(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

const STUDENT_DASH = '/dashboard/student'

export function StudentMaterialReader() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [detail, setDetail] = useState(null)
  const [loadErr, setLoadErr] = useState('')

  const fallbackTitle = location.state?.title || 'Study material'

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const m = await apiJson(`/api/materials/${id}`)
        if (!cancelled) {
          setDetail(m)
          setLoadErr('')
        }
      } catch (e) {
        if (e.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        const msg = e.message || 'Could not load material'
        if (!cancelled) {
          setLoadErr(msg)
          setDetail(null)
          toast.error(msg)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, navigate, toast])

  const title = detail?.title || fallbackTitle
  const pdfSrc = detail?.file_url ? `/api/materials/${id}/stream` : null
  const embedSrc = detail?.video_url ? youtubeUrlToEmbedSrc(detail.video_url) : null
  const rawVideo = detail?.video_url && !embedSrc ? detail.video_url : null

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`${STUDENT_DASH}/materials`)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-heading text-sm font-semibold text-navy shadow-sm hover:bg-gray-50"
        >
          ← Back to library
        </button>
        <div>
          <h1 className="font-heading text-lg font-bold text-navy sm:text-xl">{title}</h1>
          {detail?.subject ? (
            <p className="font-sans text-xs text-mid">
              {detail.subject} · {detail.material_type?.replace(/_/g, ' ')}
              {detail.education_level ? ` · ${detail.education_level}` : ''}
            </p>
          ) : null}
        </div>
      </div>

      {!id ? (
        <p className="text-mid">Invalid material.</p>
      ) : loadErr ? (
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">{loadErr}</p>
      ) : !detail ? (
        <p className="text-mid">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {embedSrc ? (
            <section>
              <h2 className="mb-2 font-heading text-sm font-semibold text-navy">Video lesson</h2>
              <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-black shadow-sm">
                <iframe
                  title={title}
                  src={embedSrc}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </section>
          ) : rawVideo ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">This link is not a YouTube video we can play in the app.</p>
              <a href={rawVideo} target="_blank" rel="noreferrer" className="mt-2 inline-block text-navy underline">
                Open in browser
              </a>
            </section>
          ) : null}

          {pdfSrc ? (
            <section>
              <h2 className="mb-2 font-heading text-sm font-semibold text-navy">Document</h2>
              <iframe
                title={`${title} (document)`}
                src={pdfSrc}
                className="min-h-[70vh] w-full flex-1 rounded-xl border border-gray-200 bg-gray-50 shadow-inner"
              />
            </section>
          ) : null}

          {!embedSrc && !rawVideo && !pdfSrc ? (
            <p className="text-mid">No viewable content for this item.</p>
          ) : null}
        </div>
      )}

      <p className="mt-6 font-sans text-xs text-mid">
        Content is for your account only. Copying or redistributing materials may violate our terms and your
        subscription.
      </p>
    </div>
  )
}

export function StudentStudyMaterials() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [materials, setMaterials] = useState([])
  const [me, setMe] = useState(null)
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  const [subject, setSubject] = useState('')
  const [materialType, setMaterialType] = useState('')
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')

  async function load() {
    try {
      const auth = await apiJson('/api/auth/me')
      setMe(auth)
      const q = new URLSearchParams()
      if (subject) q.set('subject', subject)
      if (materialType) q.set('materialType', materialType)
      if (search) q.set('search', search)
      if (level) q.set('educationLevel', level)
      const data = await apiJson(`/api/materials?${q}`)
      setMaterials(data.materials || [])
      setSubscriptionRequired(Boolean(data.subscriptionRequired))
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load materials')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sp = me?.studentProfile
  const filters = [subject, materialType, search, level].filter(Boolean).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Study Materials</h1>
      <p className="mt-1 font-sans text-sm text-mid">
        Your class: <strong>{sp?.class_level || '—'}</strong> ({sp?.level_category || '—'}). With an active subscription
        you can open PDFs and subject-linked YouTube lessons inside the app (no file downloads).
      </p>
      {subscriptionRequired ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 font-sans text-sm text-amber-950">
          <p className="font-heading font-semibold text-navy">Subscription required</p>
          <p className="mt-1 text-amber-900">
            Renew your plan to unlock study materials. Reading stays inside the app so access stays with your paid
            account.
          </p>
          <Link
            to={`${STUDENT_DASH}/subscription`}
            className="mt-2 inline-block font-heading text-sm font-semibold text-navy underline"
          >
            Go to My Subscription
          </Link>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 rounded-xl bg-white p-4 shadow-sm">
        <input
          className="min-w-[140px] flex-1 rounded border px-3 py-2 text-sm"
          placeholder="Search title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="min-w-[120px] rounded border px-3 py-2 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
        >
          {MATERIAL_TYPES.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={load}
          className="rounded-lg bg-blue px-4 py-2 font-heading text-sm font-semibold text-white"
        >
          Apply
        </button>
      </div>
      {filters > 0 ? (
        <p className="mt-2 font-sans text-xs text-mid">{filters} active filter(s)</p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.length === 0 ? (
          <p className="col-span-full rounded-xl bg-white p-8 text-center text-mid shadow-sm">No materials match.</p>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="font-heading font-semibold text-navy">{m.title}</p>
              <p className="font-sans text-xs text-mid">
                {m.subject} · {m.material_type?.replace(/_/g, ' ')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.file_url || m.video_url ? (
                  <Link
                    to={`${STUDENT_DASH}/materials/read/${m.id}`}
                    state={{ title: m.title }}
                    className="rounded-lg bg-navy px-3 py-1.5 font-heading text-xs text-white"
                  >
                    {m.file_url && m.video_url
                      ? 'Open in app'
                      : m.file_url
                        ? 'Read in app'
                        : 'Watch in app'}
                  </Link>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function StudentSubscription() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [data, setData] = useState(null)
  const [payments, setPayments] = useState([])
  const [method, setMethod] = useState('mtn_momo')
  const [hint, setHint] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      const [sub, pay] = await Promise.all([
        apiJson('/api/students/me/subscription'),
        apiJson('/api/students/me/payments'),
      ])
      setData(sub)
      setPayments((pay.payments || []).filter((p) => p.payment_type === 'subscription'))
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load subscription')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  const ps = data?.profileSubscription
  const exp = ps?.subscription_expires_at ? new Date(ps.subscription_expires_at) : null
  const now = new Date()
  const daysLeft =
    exp && exp > now ? Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const pct = exp && exp > now ? Math.min(100, Math.round((daysLeft / 30) * 100)) : 0

  async function renew(e) {
    e.preventDefault()
    setMsg('')
    try {
      const res = await apiJson('/api/students/me/subscription/renew', {
        method: 'POST',
        body: { paymentMethod: method, accountHint: hint || undefined },
      })
      const ok = `Success! Active until ${new Date(res.subscriptionExpiresAt).toLocaleDateString()}`
      setMsg(ok)
      toast.success('Subscription renewed.')
      await load()
    } catch (ex) {
      const m = ex.message || 'Failed'
      setMsg(m)
      toast.error(m)
    }
  }

  async function cancelSub() {
    if (!window.confirm('Cancel subscription?')) return
    try {
      await apiJson('/api/students/me/subscription/cancel', { method: 'POST' })
      toast.success('Subscription cancelled.')
      await load()
    } catch (ex) {
      toast.error(ex.message || 'Could not cancel')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">My Subscription</h1>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold">Student Subscription</h2>
        <p className="mt-2 font-heading text-2xl font-bold text-navy">UGX 10,000 / month</p>
        <p className="mt-2 font-sans text-sm">
          Status:{' '}
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-heading text-xs font-semibold text-emerald-800">
            {ps?.subscription_status || '—'}
          </span>
        </p>
        {exp ? <p className="font-sans text-sm text-mid">Expires: {exp.toLocaleDateString()}</p> : null}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-blue transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 font-sans text-xs text-mid">{daysLeft ? `${daysLeft} days remaining` : 'Renew to continue access'}</p>
        <form onSubmit={renew} className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          <p className="font-heading text-sm font-semibold">Renew</p>
          <select className="w-full rounded border px-3 py-2 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="bank_transfer">Bank</option>
          </select>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="Mobile money number (optional)"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />
          {msg ? <p className="text-sm text-mid">{msg}</p> : null}
          <button type="submit" className="rounded-lg bg-blue px-4 py-2 font-heading text-sm font-semibold text-white">
            Renew subscription
          </button>
        </form>
        <button type="button" className="mt-3 font-sans text-sm text-red-600 underline" onClick={cancelSub}>
          Cancel subscription
        </button>
      </div>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="font-heading font-semibold text-navy">What&apos;s included</h3>
        <ul className="mt-2 list-inside list-disc font-sans text-sm text-mid">
          <li>Unlimited past papers</li>
          <li>Revision notes and resources</li>
          <li>Practice questions</li>
          <li>Textbook summaries</li>
          <li>Video notes</li>
        </ul>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <h3 className="p-4 font-heading font-semibold text-navy">Payment history</h3>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b bg-gray-50 font-heading text-xs">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="p-3">{new Date(p.created_at).toLocaleString()}</td>
                <td className="p-3">UGX {formatUgx(p.amount)}</td>
                <td className="p-3">{p.payment_method}</td>
                <td className="p-3 font-mono text-xs">{p.payment_reference}</td>
                <td className="p-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 ? <p className="p-4 text-mid">No subscription payments yet.</p> : null}
      </div>
    </div>
  )
}

export function StudentSettings() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      const data = await apiJson('/api/students/me/profile')
      setProfile(data)
      const u = data.user
      const p = data.profile
      setForm({
        fullName: u?.full_name || '',
        email: u?.email || '',
        phone: u?.phone || '',
        schoolName: p?.school_name || '',
        district: p?.district || '',
        physicalAddress: p?.physical_address || '',
        parentGuardianName: p?.parent_guardian_name || '',
        parentGuardianPhone: p?.parent_guardian_phone || '',
        subjectsOfInterest: (p?.subjects_of_interest || []).join(', '),
      })
    } catch (e) {
      if (e.status === 401) navigate('/login', { replace: true })
      else toast.error(e.message || 'Could not load profile')
    }
  }

  useEffect(() => {
    load()
  }, [navigate])

  async function saveProfile(e) {
    e.preventDefault()
    setMsg('')
    try {
      await apiJson('/api/students/me/profile', {
        method: 'PATCH',
        body: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          schoolName: form.schoolName,
          district: form.district,
          physicalAddress: form.physicalAddress,
          parentGuardianName: form.parentGuardianName,
          parentGuardianPhone: form.parentGuardianPhone,
          subjectsOfInterest: form.subjectsOfInterest
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      })
      setMsg('Profile saved.')
      toast.success('Profile saved.')
    } catch (ex) {
      const m = ex.message || 'Error'
      setMsg(m)
      toast.error(m)
    }
  }

  async function savePw(e) {
    e.preventDefault()
    if (pw.next !== pw.confirm) {
      setMsg('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }
    setMsg('')
    try {
      await apiJson('/api/auth/me/password', {
        method: 'PATCH',
        body: { currentPassword: pw.current, newPassword: pw.next },
      })
      setMsg('Password updated.')
      setPw({ current: '', next: '', confirm: '' })
      toast.success('Password updated.')
    } catch (ex) {
      const m = ex.message || 'Error'
      setMsg(m)
      toast.error(m)
    }
  }

  async function delAccount() {
    if (!window.confirm('Permanently delete your account?')) return
    try {
      await apiJson('/api/auth/me/account', { method: 'DELETE' })
      toast.success('Account deleted.')
      navigate('/')
    } catch (ex) {
      toast.error(ex.message || 'Could not delete account')
    }
  }

  if (!profile) return <p className="p-6">Loading…</p>

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-heading text-2xl font-bold text-navy">Settings</h1>
      {msg ? <p className="mt-2 text-sm text-mid">{msg}</p> : null}
      <form onSubmit={saveProfile} className="mt-6 max-w-xl space-y-3 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold">Personal information</h2>
        {['fullName', 'email', 'phone', 'schoolName', 'district', 'physicalAddress', 'parentGuardianName', 'parentGuardianPhone'].map(
          (k) => (
            <div key={k}>
              <label className="font-heading text-xs font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1')}</label>
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                value={form[k] || ''}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          )
        )}
        <div>
          <label className="font-heading text-xs font-semibold">Subjects of interest (comma-separated)</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            value={form.subjectsOfInterest}
            onChange={(e) => setForm((f) => ({ ...f, subjectsOfInterest: e.target.value }))}
          />
        </div>
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 font-heading text-sm text-white">
          Save changes
        </button>
      </form>

      <form onSubmit={savePw} className="mt-8 max-w-xl space-y-3 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-heading font-semibold">Security</h2>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Current password"
          value={pw.current}
          onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
        />
        <input
          type="password"
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="New password"
          value={pw.next}
          onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
        />
        <input
          type="password"
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Confirm new password"
          value={pw.confirm}
          onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
        />
        <button type="submit" className="rounded-lg bg-blue px-4 py-2 font-heading text-sm text-white">
          Update password
        </button>
      </form>

      <div className="mt-8 max-w-xl rounded-xl border border-red-100 bg-red-50/50 p-6">
        <h2 className="font-heading font-semibold text-red-800">Account</h2>
        <button type="button" className="mt-3 text-sm text-red-700 underline" onClick={delAccount}>
          Delete account
        </button>
      </div>
    </div>
  )
}

export function StudentNotifications() {
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

  async function markRead(id) {
    try {
      await apiJson(`/api/notifications/${id}/read`, { method: 'PATCH' })
      await load()
    } catch (e) {
      toast.error(e.message || 'Could not update notification')
    }
  }

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-navy">Notifications</h1>
        <div className="flex gap-2">
          <button type="button" onClick={readAll} className="rounded-lg border px-3 py-1.5 text-sm">
            Mark all read
          </button>
          <button type="button" onClick={clearAll} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700">
            Clear all
          </button>
        </div>
      </div>
      <ul className="mt-6 space-y-2">
        {items.length === 0 ? (
          <li className="rounded-xl bg-white p-8 text-center text-mid shadow-sm">You&apos;re all caught up.</li>
        ) : (
          items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => !n.read_at && markRead(n.id)}
                className={`w-full rounded-xl border border-gray-100 p-4 text-left shadow-sm transition hover:bg-gray-50 ${
                  n.read_at ? 'bg-white' : 'bg-sky/5'
                }`}
              >
                <p className="font-heading font-semibold text-navy">{n.title}</p>
                {n.body ? <p className="mt-1 font-sans text-sm text-mid">{n.body}</p> : null}
                <p className="mt-2 font-sans text-xs text-mid">{formatRelativeTime(n.created_at)}</p>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
