import { Link } from 'react-router-dom'

/** Pricing models (subscription + sessions) + accepted payment methods */

function CheckItem({ children, markClass = 'text-blue' }) {
  return (
    <li className="flex gap-2 font-sans text-sm">
      <span
        className={`mt-0.5 shrink-0 font-heading font-bold ${markClass}`}
        aria-hidden="true"
      >
        ✓
      </span>
      <span className="min-w-0 leading-snug">{children}</span>
    </li>
  )
}

function LogoFrameSm({ children }) {
  return (
    <div className="flex h-14 w-full items-center justify-center rounded-lg bg-white px-2 py-2 shadow-inner sm:h-16">
      {children}
    </div>
  )
}

const payMethods = [
  {
    name: 'MTN Mobile Money',
    badge: 'Instant',
    accent: 'border-gold',
    logo: (
      <LogoFrameSm>
        <img
          src="/payments/mtn.svg"
          alt="MTN Mobile Money logo"
          className="max-h-9 w-auto max-w-full object-contain sm:max-h-10"
          width={120}
          height={42}
          loading="lazy"
          decoding="async"
        />
      </LogoFrameSm>
    ),
  },
  {
    name: 'Airtel Money',
    badge: 'Instant',
    accent: 'border-[#EF4444]',
    logo: (
      <LogoFrameSm>
        <img
          src="/payments/airtel.svg"
          alt="Airtel"
          className="max-h-10 w-auto max-w-[120px] object-contain"
          width={110}
          height={40}
          loading="lazy"
          decoding="async"
        />
      </LogoFrameSm>
    ),
  },
  {
    name: 'Bank Transfer',
    badge: '1-2 days',
    accent: 'border-sky',
    logo: (
      <LogoFrameSm>
        <img
          src="/payments/bank-transfer.svg"
          alt="Bank transfer payment icon"
          className="h-9 w-auto max-w-[72px] object-contain sm:h-10"
          width={80}
          height={40}
          loading="lazy"
          decoding="async"
        />
      </LogoFrameSm>
    ),
  },
]

export default function Payments() {
  return (
    <section id="payments" className="bg-navy py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-white sm:text-4xl">
          Simple &amp; Secure Payments
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-white/90">
          Two simple ways to access EduBridge — a flat monthly subscription and flexible session
          bookings.
        </p>

        {/* Row 1 — pricing models */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Student Subscription */}
          <article className="flex flex-col rounded-2xl border-2 border-gold bg-white p-6 shadow-xl sm:p-8">
            <span className="inline-flex w-fit rounded-full bg-gold px-3 py-1 font-heading text-xs font-semibold text-navy">
              Most Popular
            </span>
            <h3 className="mt-4 font-heading text-xl font-semibold text-navy">Student Subscription</h3>
            <p className="mt-3 font-heading text-2xl font-bold text-navy sm:text-3xl">
              UGX 10,000 / month
            </p>
            <p className="mt-3 font-sans text-base font-normal text-mid">
              Access all study materials, past papers, and revision notes. Cancel anytime.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              <CheckItem markClass="text-gold">
                <span className="text-mid">Unlimited past papers</span>
              </CheckItem>
              <CheckItem markClass="text-gold">
                <span className="text-mid">Revision notes &amp; resources</span>
              </CheckItem>
              <CheckItem markClass="text-gold">
                <span className="text-mid">Cancel anytime</span>
              </CheckItem>
            </ul>
            <Link
              to="/#contact"
              className="font-heading mt-8 inline-flex w-full items-center justify-center rounded-lg bg-gold px-6 py-3 text-center text-sm font-semibold text-navy transition-all duration-200 hover:scale-[1.02] hover:brightness-105"
            >
              Subscribe Now
            </Link>
          </article>

          {/* Session Booking */}
          <article className="flex flex-col rounded-2xl border-2 border-blue bg-white p-6 shadow-xl sm:p-8">
            <span className="inline-flex w-fit rounded-full bg-blue/10 px-3 py-1 font-heading text-xs font-semibold text-blue ring-1 ring-blue/30">
              Pay Per Session
            </span>
            <h3 className="mt-4 font-heading text-xl font-semibold text-navy">Book a Tutor Session</h3>
            <p className="mt-3 font-heading text-2xl font-bold text-navy sm:text-3xl">
              From UGX 3,000 / session
            </p>
            <p className="mt-3 font-sans text-base font-normal text-mid">
              Tutors set their own rates within our affordable guidelines. Group sessions from UGX
              3,000, one-on-one from UGX 8,000.
            </p>
            <ul className="mt-5 flex flex-col gap-2.5">
              <CheckItem markClass="text-blue">
                <span className="text-mid">Group sessions: </span>
                <span className="font-heading font-bold text-navy">UGX 3,000 – 5,000</span>
                <span className="text-mid"> / student</span>
              </CheckItem>
              <CheckItem markClass="text-blue">
                <span className="text-mid">One-on-one: </span>
                <span className="font-heading font-bold text-navy">UGX 8,000 – 15,000</span>
                <span className="text-mid"> / session</span>
              </CheckItem>
              <CheckItem markClass="text-blue">
                <span className="text-mid">Premium tutors: </span>
                <span className="font-heading font-bold text-navy">UGX 15,000 – 30,000</span>
                <span className="text-mid"> / session</span>
              </CheckItem>
            </ul>
            <p className="mt-4 font-sans text-sm font-normal text-mid">
              EduBridge takes 20% · Tutors keep 80%
            </p>
            <Link
              to="/register/tutor"
              className="font-heading mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky"
            >
              Find a Tutor
            </Link>
          </article>
        </div>

        {/* Value comparison — between pricing and payment rails */}
        <aside
          className="mt-10 rounded-r-lg border-l-[3px] border-blue bg-[#EFF6FF] px-4 py-4 sm:px-5 sm:py-5"
          role="note"
        >
          <p className="font-sans text-sm font-normal leading-relaxed text-navy">
            💡 A group session on EduBridge costs less than a chapati and juice — and far less than
            the UGX 30,000–80,000 charged by private tutors in Kampala.
          </p>
        </aside>

        {/* Row 2 — how you pay */}
        <h3 className="mt-14 text-center font-heading text-lg font-semibold text-white sm:text-xl">
          Accepted Payment Methods
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-center font-sans text-sm text-white/75">
          Pay your subscription or session bookings with any of these options.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {payMethods.map(({ name, badge, accent, logo }) => (
            <article
              key={name}
              className={`rounded-xl border-2 ${accent} bg-blue/20 p-4 shadow-md backdrop-blur-sm`}
            >
              {logo}
              <h3 className="mt-3 font-heading text-sm font-semibold text-white">{name}</h3>
              <p className="mt-2">
                <span className="inline-block rounded-full bg-white/15 px-2.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-white/95 ring-1 ring-white/20 sm:text-xs">
                  {badge}
                </span>
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-center text-white/90 sm:flex-row sm:gap-3">
          <span className="text-sky" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4l10 4v8c0 5-4 9-10 10-6-1-10-5-10-10V8l10-4z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="font-heading text-sm font-medium text-white">
            All transactions are secured and encrypted
          </p>
        </div>
      </div>
    </section>
  )
}
