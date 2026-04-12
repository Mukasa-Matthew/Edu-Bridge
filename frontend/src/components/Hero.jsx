import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const MARTHA = encodeURI('/students/Martha proj')

/** Student hero photos (public/students/Martha proj/) */
const SLIDE_IMAGES = [
  `${MARTHA}/pexels-ilead-rwanda-2148150079-30649802.jpg.jpeg`,
  `${MARTHA}/pexels-lutha-dindi-198849148-11526757.jpg.jpeg`,
  `${MARTHA}/pexels-daniwura-tci-492293783-33938403.jpg.jpeg`,
  `${MARTHA}/pexels-daniwura-tci-492293783-33938404.jpg.jpeg`,
]

const SLIDE_INTERVAL_MS = 5500

/** Hero: slideshow of real students + brand overlay, headline, CTAs, tutor card */
export default function Hero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % SLIDE_IMAGES.length)
    }, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section id="home" className="relative isolate min-h-[min(92vh,720px)] overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
      {/* Background slideshow */}
      <div className="absolute inset-0 -z-20 bg-navy" aria-hidden="true">
        {SLIDE_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-none ${
              i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
            }`}
          />
        ))}
        {/* Brand: deep navy + soft blue wash (readable + on-brand) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy/88 via-navy/72 to-blue/45"
          aria-hidden="true"
        />
        {/* Extra blue veil on the primary focal area (left / headline side) */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-blue/25 via-transparent to-transparent sm:from-blue/30"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <p className="mb-4 inline-flex rounded-full border border-white/50 bg-white/95 px-4 py-1.5 font-heading text-sm font-semibold text-navy shadow-md backdrop-blur-sm">
            Uganda&apos;s #1 EdTech Platform
          </p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
            Master Your UNEB Exams &amp; Bridge the Gap to University Learning
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/90 drop-shadow-sm lg:mx-0 lg:max-w-none">
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
              className="font-heading inline-flex items-center justify-center rounded-lg border-2 border-white/90 px-6 py-3 text-center text-base font-medium text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/15"
            >
              Become a Tutor
            </Link>
          </div>
        </div>

        {/* Slideshow controls + floating tutor card */}
        <div className="flex flex-col items-center gap-5 lg:items-end">
          <div className="flex justify-center gap-2 lg:justify-end" role="tablist" aria-label="Hero image slides">
            {SLIDE_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-sky' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
          <div className="w-full max-w-sm animate-float rounded-2xl border border-white/15 bg-white/10 p-1 shadow-2xl backdrop-blur-md">
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
