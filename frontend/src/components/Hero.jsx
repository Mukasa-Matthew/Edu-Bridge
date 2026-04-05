import { Link } from 'react-router-dom'

/** Hero: headline, CTAs, floating tutor card mockup */
export default function Hero() {
  return (
    <section
      id="home"
      className="bg-navy pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="mb-4 inline-flex rounded-full bg-sky/20 px-4 py-1.5 font-heading text-sm font-medium text-sky">
            Uganda&apos;s #1 EdTech Platform
          </p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
            Master Your UNEB Exams &amp; Bridge the Gap to University Learning
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 lg:mx-0 lg:max-w-none">
            Connect with verified tutors, access past papers, and unlock your full academic
            potential — right from your phone.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/register/student"
              className="font-heading inline-flex items-center justify-center rounded-lg bg-blue px-6 py-3 text-center text-base font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-sky"
            >
              Start Learning Now
            </Link>
            <Link
              to="/register/tutor"
              className="font-heading inline-flex items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-center text-base font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-white/10"
            >
              Become a Tutor
            </Link>
          </div>
        </div>

        {/* Floating tutor card */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm animate-float rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-lg font-bold text-white"
                  aria-label="John Mukasa"
                >
                  JM
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-semibold text-navy">John Mukasa</p>
                  <p className="mt-0.5 text-sm text-mid">Mathematics · A-Level</p>
                  <div className="mt-2 flex items-center gap-1 text-gold" aria-label="4.9 out of 5 stars">
                    <span className="text-base" aria-hidden="true">
                      ★★★★★
                    </span>
                    <span className="font-heading text-sm font-semibold text-navy">4.9</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 font-heading text-xl font-bold text-navy">
                From UGX 3,000 / session
              </p>
              <p className="mt-1 font-sans text-sm font-normal text-mid">
                One-on-one from UGX 8,000
              </p>
              <p className="mt-2 inline-flex max-w-full flex-wrap rounded-full bg-gray px-3 py-1.5 text-center font-heading text-[11px] font-semibold leading-snug text-mid sm:text-xs">
                EduBridge fee: 20% · Tutor keeps 80%
              </p>
              <button
                type="button"
                className="font-heading mt-4 w-full rounded-lg bg-blue py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-sky"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
