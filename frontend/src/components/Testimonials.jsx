/** User quotes */
const cards = [
  {
    initials: 'BK',
    bg: 'bg-navy',
    name: 'Brian Kato',
    role: 'S.6 Student, Kampala',
    stars: 5,
    quote:
      'EduBridge helped me find an amazing Maths tutor in just minutes. I went from a D to a B in two months!',
  },
  {
    initials: 'MN',
    bg: 'bg-blue',
    name: 'Mary Nakato',
    role: 'Mathematics Tutor, EduBridge',
    stars: 5,
    quote:
      'As a tutor, EduBridge gave me a platform to reach students across Uganda. My income has tripled since joining.',
  },
  {
    initials: 'JO',
    bg: 'bg-sky',
    name: 'James Okello',
    role: 'Parent, Gulu',
    stars: 4,
    quote:
      "I can now monitor my child's tutoring sessions and pay easily via MTN MoMo. Highly recommended!",
  },
]

function StarRow({ count }) {
  return (
    <p className="text-lg text-gold" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
      {'☆'.repeat(5 - count)}
    </p>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-gray py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          What Our Users Say
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {cards.map((c) => (
            <article
              key={c.name}
              className="flex h-full flex-col rounded-xl border border-white/80 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white ${c.bg}`}
                  aria-label={c.name}
                >
                  {c.initials}
                </div>
                <div>
                  <p className="font-heading font-semibold text-navy">{c.name}</p>
                  <p className="text-sm text-mid">{c.role}</p>
                </div>
              </div>
              <div className="mt-3">
                <StarRow count={c.stars} />
              </div>
              <blockquote className="mt-4 flex-1">
                <p className="italic text-mid">&ldquo;{c.quote}&rdquo;</p>
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
