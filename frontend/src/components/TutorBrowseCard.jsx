import { Link } from 'react-router-dom'

function initialsFromName(name) {
  const parts = (name || '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (name || '?').slice(0, 2).toUpperCase()
}

function formatUgx(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `UGX ${Number(n).toLocaleString()}`
}

function formatSessionMode(mode) {
  if (mode === 'online') return 'Online'
  if (mode === 'in_person') return 'In person'
  if (mode === 'both') return 'Online & in person'
  return mode || '—'
}

function formatLevels(levels) {
  if (levels == null) return '—'
  if (Array.isArray(levels)) return levels.length ? levels.join(' · ') : '—'
  return String(levels)
}

function formatQual(q) {
  if (!q) return null
  return String(q).replace(/_/g, ' ')
}

/**
 * @param {object} props
 * @param {Record<string, unknown>} props.tutor — row from GET /api/tutors
 */
export default function TutorBrowseCard({ tutor }) {
  const name = tutor.full_name || 'Tutor'
  const src = tutor.profile_photo_url || null

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        {src ? (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-100">
            <img
              src={src}
              alt={`${name} — tutor profile photo`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white"
            aria-hidden="true"
          >
            {initialsFromName(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-navy">{name}</h2>
          <p className="mt-0.5 text-sm text-mid">
            {[tutor.primary_subject, tutor.secondary_subject].filter(Boolean).join(' · ') || '—'}
          </p>
          {tutor.average_rating != null && Number(tutor.average_rating) > 0 ? (
            <p className="mt-1 text-sm text-navy">
              <span className="text-gold" aria-hidden="true">
                ★
              </span>{' '}
              <span className="font-semibold">{Number(tutor.average_rating).toFixed(1)}</span>
              {tutor.total_reviews != null ? (
                <span className="text-mid"> ({tutor.total_reviews} reviews)</span>
              ) : null}
            </p>
          ) : (
            <p className="mt-1 text-sm text-mid">New on EduBridge</p>
          )}
        </div>
      </div>

      <dl className="mt-4 grid gap-2 border-t border-slate-100 pt-4 font-sans text-sm text-mid">
        <div className="flex justify-between gap-2">
          <dt className="text-navy/80">Levels</dt>
          <dd className="text-right font-medium text-navy">{formatLevels(tutor.teaching_levels)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-navy/80">Sessions</dt>
          <dd className="text-right font-medium text-navy">{formatSessionMode(tutor.session_mode)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-navy/80">Group (from)</dt>
          <dd className="text-right font-medium text-navy">{formatUgx(tutor.group_session_rate_ugx)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-navy/80">1-on-1 (from)</dt>
          <dd className="text-right font-medium text-navy">{formatUgx(tutor.one_on_one_rate_ugx)}</dd>
        </div>
        {tutor.district ? (
          <div className="flex justify-between gap-2">
            <dt className="text-navy/80">District</dt>
            <dd className="text-right font-medium text-navy">{tutor.district}</dd>
          </div>
        ) : null}
        {formatQual(tutor.highest_qualification) ? (
          <div className="flex justify-between gap-2">
            <dt className="text-navy/80">Qualification</dt>
            <dd className="text-right font-medium capitalize text-navy">
              {formatQual(tutor.highest_qualification)}
            </dd>
          </div>
        ) : null}
      </dl>

      {tutor.bio ? (
        <p className="mt-4 line-clamp-3 flex-1 border-t border-slate-100 pt-4 text-sm leading-relaxed text-mid">
          {tutor.bio}
        </p>
      ) : null}

      <p className="mt-4 font-sans text-xs text-mid">
        Book sessions after{' '}
        <Link to="/register/student" className="font-medium text-blue hover:text-sky hover:underline">
          creating a student account
        </Link>
        .
      </p>
    </article>
  )
}
