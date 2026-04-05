import { Link } from 'react-router-dom'
import MarketingLayout from '../components/MarketingLayout.jsx'
import PageSeo from '../components/PageSeo.jsx'
import { ROUTE_SEO, SITE_ORIGIN } from '../seo.js'

const programs = [
  {
    title: 'O-Level & S4 UNEB prep',
    subtitle: 'S.1 – S.4',
    body: 'Structured support for lower secondary and O-Level candidates: core subjects, past papers, and revision with tutors who know the UNEB syllabus.',
    accent: 'border-navy',
  },
  {
    title: 'A-Level & S6 UNEB prep',
    subtitle: 'S.5 – S.6',
    body: 'Deep dives in Sciences, Arts, and combinations that matter for S6 exams and university entry. Group revision and one-on-one clarification sessions.',
    accent: 'border-blue',
  },
  {
    title: 'University & bridging',
    subtitle: 'Year 1 – Year 4',
    body: 'Course-specific tutoring, assignments, and exam seasons — online or in person where tutors offer it. Ideal for students balancing work and study.',
    accent: 'border-sky',
  },
  {
    title: 'Digital study library',
    subtitle: 'Past papers & notes',
    body: 'Student subscription unlocks curated UNEB past papers, revision notes, and resources from verified educators — one affordable monthly plan.',
    accent: 'border-gold',
  },
  {
    title: 'Live tutoring sessions',
    subtitle: 'Group & 1-on-1',
    body: 'Book group sessions from UGX 3,000 per student or one-on-one from UGX 8,000. Tutors set rates within platform guidelines; you see ratings before you book.',
    accent: 'border-blue',
  },
  {
    title: 'WhatsApp reminders',
    subtitle: 'Stay on track',
    body: 'Booking confirmations and session reminders via WhatsApp so you never miss a slot — built for how students in Uganda actually communicate.',
    accent: 'border-navy',
  },
]

const subjectsTeaser =
  'Mathematics, Physics, Chemistry, Biology, English, History, Geography, Economics, ICT, Literature, and more — search tutors by subject on EduBridge.'

export default function ProgramsPage() {
  return (
    <MarketingLayout>
      <PageSeo
        title={ROUTE_SEO.programs.title}
        description={ROUTE_SEO.programs.description}
        canonical={`${SITE_ORIGIN}/programs`}
      />
      <main id="main-content" className="min-h-screen bg-white pb-16 pt-24 sm:pt-28">
        <section className="border-b border-slate-100 bg-gray px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-wide text-blue">What we offer</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-navy sm:text-4xl">Programs & learning paths</h1>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-base text-mid">
              EduBridge combines self-serve study materials with live tutoring — built for UNEB and university learners
              across Uganda.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/tutors"
                className="font-heading inline-flex rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky"
              >
                Browse tutors
              </Link>
              <Link
                to="/register/student"
                className="font-heading inline-flex rounded-lg border-2 border-navy px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
              >
                Join as a student
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="sr-only">Program list</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <li key={p.title}>
                <article
                  className={`flex h-full flex-col rounded-xl border-2 ${p.accent} bg-white p-6 shadow-sm transition-shadow hover:shadow-md`}
                >
                  <h3 className="font-heading text-lg font-semibold text-navy">{p.title}</h3>
                  <p className="mt-1 font-heading text-xs font-semibold uppercase tracking-wide text-blue">{p.subtitle}</p>
                  <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-mid">{p.body}</p>
                </article>
              </li>
            ))}
          </ul>

          <aside className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h3 className="font-heading text-lg font-semibold text-navy">Subjects covered</h3>
            <p className="mt-2 font-sans text-sm leading-relaxed text-mid">{subjectsTeaser}</p>
            <Link to="/tutors" className="mt-4 inline-block font-heading text-sm font-semibold text-blue hover:text-sky hover:underline">
              Find a tutor by subject →
            </Link>
          </aside>
        </section>
      </main>
    </MarketingLayout>
  )
}
