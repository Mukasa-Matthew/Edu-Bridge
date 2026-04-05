import { useState } from 'react'

const faqs = [
  {
    q: 'How do I find the right tutor?',
    a: 'Use our smart search to filter tutors by subject, academic level, location, rating, and price. You can read reviews before booking.',
  },
  {
    q: 'How do I pay for a session?',
    a: 'We accept MTN Mobile Money, Airtel Money, and bank transfers. All payments are in UGX and processed securely.',
  },
  {
    q: 'Can I get a free trial session?',
    a: 'Yes! Many tutors on EduBridge offer a free first session so you can find the right fit before committing.',
  },
  {
    q: 'Is EduBridge available outside Kampala?',
    a: 'Absolutely. Online sessions are available to students across all of Uganda and beyond.',
  },
  {
    q: 'How do I become a tutor on EduBridge?',
    a: 'Sign up as a tutor, complete your profile, set your subjects and rates, and start receiving booking requests.',
  },
  {
    q: 'What subjects are available?',
    a: 'We cover all UNEB subjects including Mathematics, Physics, Chemistry, Biology, English, History, and many more.',
  },
]

function Chevron({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-blue transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Accordion FAQ */
export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="faq" className="bg-gray py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <ul className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const open = openIdx === i
            return (
              <li key={item.q} className="rounded-xl border border-mid/10 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-heading text-base font-semibold text-navy transition-colors hover:text-blue"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? null : i)}
                >
                  {item.q}
                  <Chevron open={open} />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 pt-0 text-mid">{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
