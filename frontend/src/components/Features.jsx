/** Six core feature cards */
const items = [
  {
    title: 'Smart Tutor Search',
    body: 'Filter by subject, level, rating, location and price to find your perfect match.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Session Booking',
    body: 'Book group sessions from UGX 3,000/student or one-on-one sessions from UGX 8,000. Tutors set their own rates within our affordable platform guidelines.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="8" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M6 14h20M12 6v4M20 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Mobile Money Payments',
    body: 'Subscribe for UGX 10,000/month to access all materials, or book group sessions from UGX 3,000 and one-on-one sessions from UGX 8,000 — paid securely via MTN MoMo or Airtel Money.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M5 16h22" stroke="currentColor" strokeWidth="2" />
        <circle cx="22" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'UNEB Past Papers',
    body: 'Access a library of past exam papers and revision notes curated by expert tutors.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M8 6h12l6 6v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M20 6v6h6M10 18h12M10 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Tutor Reviews & Ratings',
    body: 'Read verified student reviews before booking to ensure quality.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 4l4 8 8 1-6 6 2 9-8-4-8 4 2-9-6-6 8-1 4-8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'WhatsApp Notifications',
    body: 'Get instant booking confirmations and session reminders via WhatsApp.',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M8 26l2-6a10 10 0 116 6l-8 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="16" r="1" fill="currentColor" />
        <circle cx="16" cy="16" r="1" fill="currentColor" />
        <circle cx="19" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
]

export default function Features() {
  return (
    <section id="features" className="bg-gray py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          Everything You Need to Succeed
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ title, body, icon }) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-xl border border-white/80 bg-white p-6 shadow-sm transition-all duration-200 before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:origin-top before:scale-x-0 before:bg-blue before:transition-transform before:duration-200 hover:-translate-y-1 hover:shadow-lg hover:before:scale-x-100"
            >
              <div className="text-blue transition-colors group-hover:text-sky">{icon}</div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-mid">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
