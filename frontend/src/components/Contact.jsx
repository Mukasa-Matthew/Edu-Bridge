import { useState } from 'react'

/** Approximate map pin: Kisowera Road / Goma area, Mukono Municipality */
const OFFICE_MAP = {
  lat: 0.35287,
  lon: 32.75371,
}

const osmBbox = `${OFFICE_MAP.lon - 0.012},${OFFICE_MAP.lat - 0.009},${OFFICE_MAP.lon + 0.012},${OFFICE_MAP.lat + 0.009}`
const MAP_EMBED_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(osmBbox)}&layer=mapnik&marker=${OFFICE_MAP.lat}%2C${OFFICE_MAP.lon}`

const GOOGLE_MAPS_OFFICE_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Plot 14 Kisowera Road, Goma Division, Mukono Municipality, Uganda'
)}`

const OSM_OFFICE_URL = `https://www.openstreetmap.org/?mlat=${OFFICE_MAP.lat}&mlon=${OFFICE_MAP.lon}#map=17/${OFFICE_MAP.lat}/${OFFICE_MAP.lon}`

/** Contact info + validated form */
export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
    e.target.reset()
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Get In Touch</h2>
            <ul className="mt-8 space-y-4 text-mid">
              <li>
                <h3 className="font-heading text-base font-semibold text-navy">Address</h3>
                <p className="mt-1">
                  The Peak Office Suites, 2nd Floor
                  <br />
                  Plot 14, Kisowera Road
                  <br />
                  Goma Division, Mukono Municipality
                  <br />
                  Uganda
                </p>
              </li>
              <li>
                <h3 className="font-heading text-base font-semibold text-navy">Email</h3>
                <p className="mt-1">
                  <a href="mailto:info@edubridge.ug" className="text-blue hover:text-sky">
                    info@edubridge.ug
                  </a>
                </p>
              </li>
              <li>
                <h3 className="font-heading text-base font-semibold text-navy">Phone</h3>
                <p className="mt-1">
                  <a href="tel:+256740014177" className="text-blue hover:text-sky">
                    +256740014177
                  </a>
                </p>
              </li>
            </ul>
            <figure className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/[0.04]">
              <figcaption className="border-b border-slate-100 bg-navy px-4 py-3 text-left">
                <span className="font-heading text-sm font-semibold text-white">Office location</span>
                <span className="mt-0.5 block font-sans text-xs text-white/80">
                  Pin: Kisowera Road · Goma, Mukono
                </span>
              </figcaption>
              <div className="relative aspect-[4/3] w-full min-h-[220px] bg-slate-100 sm:min-h-[260px]">
                <iframe
                  title="Map: EduBridge office near Kisowera Road, Goma, Mukono, Uganda"
                  src={MAP_EMBED_SRC}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-center font-sans text-sm">
                <a
                  href={GOOGLE_MAPS_OFFICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue hover:text-sky hover:underline"
                >
                  Open in Google Maps
                </a>
                <span className="hidden text-mid sm:inline" aria-hidden="true">
                  ·
                </span>
                <a
                  href={OSM_OFFICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue hover:text-sky hover:underline"
                >
                  Larger map (OpenStreetMap)
                </a>
              </div>
            </figure>
          </div>

          <div>
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-gray bg-gray/50 p-6 shadow-sm sm:p-8"
              noValidate
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="font-heading text-sm font-medium text-navy">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-mid/20 bg-white px-4 py-3 text-mid outline-none ring-blue/30 transition focus:ring-2"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="font-heading text-sm font-medium text-navy">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-mid/20 bg-white px-4 py-3 text-mid outline-none ring-blue/30 transition focus:ring-2"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="font-heading text-sm font-medium text-navy">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    className="mt-1 w-full rounded-lg border border-mid/20 bg-white px-4 py-3 text-mid outline-none ring-blue/30 transition focus:ring-2"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="font-heading text-sm font-medium text-navy">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="mt-1 w-full resize-y rounded-lg border border-mid/20 bg-white px-4 py-3 text-mid outline-none ring-blue/30 transition focus:ring-2"
                    placeholder="Your message..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="font-heading mt-6 w-full rounded-lg bg-blue py-3 text-base font-medium text-white transition-all duration-200 hover:scale-[1.01] hover:bg-sky"
              >
                Send Message
              </button>
              {sent ? (
                <p className="mt-3 text-center text-sm text-mid" role="status">
                  Thanks — we&apos;ll get back to you soon.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
