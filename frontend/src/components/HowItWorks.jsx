/** Three-step flow with connecting dotted line (desktop) */
const steps = [
  {
    n: 1,
    title: 'Search',
    body: 'Browse verified tutors by subject, level or location',
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M17 17l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: 2,
    title: 'Book',
    body: 'Choose a time slot and confirm your session instantly',
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="5" y="6" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M5 12h18M10 4v4M18 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: 3,
    title: 'Learn',
    body: 'Join your session online or in-person and excel',
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M6 22l8-16 8 16M10 16h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          How EduBridge Works
        </h2>
        <div className="relative mt-16">
          {/* Dotted connectors — desktop only */}
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-0 border-t-2 border-dotted border-mid/40 lg:block"
            aria-hidden="true"
          />
          <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((s) => (
              <li key={s.n} className="relative flex flex-col items-center text-center">
                <article className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white">
                    {s.n}
                  </div>
                  <div className="mt-4 text-blue" aria-hidden="true">
                    {s.icon}
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-mid">{s.body}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
