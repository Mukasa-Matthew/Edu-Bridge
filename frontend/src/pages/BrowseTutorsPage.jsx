import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import MarketingLayout from '../components/MarketingLayout.jsx'
import PageSeo from '../components/PageSeo.jsx'
import TutorBrowseCard from '../components/TutorBrowseCard.jsx'
import { ROUTE_SEO, SITE_ORIGIN } from '../seo.js'

export default function BrowseTutorsPage() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    const delay = search.trim() ? 320 : 0
    const t = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const q = new URLSearchParams()
        if (search.trim()) q.set('search', search.trim())
        const qs = q.toString()
        const data = await apiJson(`/api/tutors${qs ? `?${qs}` : ''}`, { signal: ctrl.signal })
        if (!ctrl.signal.aborted) setTutors(data.tutors || [])
      } catch (e) {
        if (e.name === 'AbortError') return
        setError(e.message || 'Could not load tutors.')
        setTutors([])
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, delay)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [search])

  return (
    <MarketingLayout>
      <PageSeo
        title={ROUTE_SEO.browseTutors.title}
        description={ROUTE_SEO.browseTutors.description}
        canonical={`${SITE_ORIGIN}/tutors`}
      />
      <main id="main-content" className="min-h-screen bg-gray pb-16 pt-24 sm:pt-28">
        <section className="border-b border-white/10 bg-navy px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="font-heading text-xs font-semibold uppercase tracking-wide text-sky">Verified tutors</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">Browse tutors</h1>
            <p className="mt-3 max-w-2xl font-sans text-base text-white/85">
              Active, approved EduBridge tutors across Uganda — subjects, rates, and session types. Sign in as a
              student to book.
            </p>
            <div className="mt-6 max-w-md">
              <label htmlFor="tutor-search" className="sr-only">
                Search tutors by name or subject
              </label>
              <input
                id="tutor-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or subject…"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 font-sans text-sm text-white placeholder:text-white/50 outline-none ring-sky/40 transition focus:border-sky focus:bg-white/15 focus:ring-2"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-live="polite">
          {error ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="font-sans text-mid">Loading tutors…</p>
          ) : tutors.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="font-heading text-lg font-semibold text-navy">
                {search.trim() ? 'No tutors match your search' : 'No tutors listed yet'}
              </p>
              <p className="mt-2 font-sans text-sm text-mid">
                {search.trim() ? (
                  <>
                    Try another keyword, or{' '}
                    <Link to="/register/tutor" className="font-medium text-blue hover:underline">
                      apply to teach on EduBridge
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Approved tutors will appear here.{' '}
                    <Link to="/register/tutor" className="font-medium text-blue hover:underline">
                      Become a tutor
                    </Link>{' '}
                    or check back soon.
                  </>
                )}
              </p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tutors.map((tutor) => (
                <li key={tutor.id}>
                  <TutorBrowseCard tutor={tutor} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </MarketingLayout>
  )
}
