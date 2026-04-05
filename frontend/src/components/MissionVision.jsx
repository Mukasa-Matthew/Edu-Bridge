/** Mission & vision cards */
export default function MissionVision() {
  return (
    <section id="about" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-3xl font-bold text-navy sm:text-4xl">
          Who We Are
        </h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Mission */}
          <article className="rounded-xl border border-gray bg-white p-8 shadow-sm lg:p-10">
            <div className="flex h-full flex-col border-l-4 border-navy pl-6">
              <span className="text-navy" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </svg>
              </span>
              <h3 className="mt-4 font-heading text-xl font-semibold text-navy">Our Mission</h3>
              <p className="mt-3 text-mid">
                EduBridge is Uganda&apos;s premier online tutoring marketplace, empowering students
                to find expert tutors and educators to grow thriving teaching businesses. We bridge
                the gap between talent and opportunity through technology.
              </p>
            </div>
          </article>
          {/* Vision */}
          <article className="rounded-xl border border-gray bg-white p-8 shadow-sm lg:p-10">
            <div className="flex h-full flex-col border-l-4 border-sky pl-6">
              <span className="text-sky" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M8 22c4-8 12-12 20-14-2 8-6 16-14 20-2-6-4-10-6-6z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <circle cx="22" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
              <h3 className="mt-4 font-heading text-xl font-semibold text-navy">Our Vision</h3>
              <p className="mt-3 text-mid">
                To become the most trusted and accessible education technology platform in East
                Africa, making quality learning available to every student regardless of background
                or location.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
