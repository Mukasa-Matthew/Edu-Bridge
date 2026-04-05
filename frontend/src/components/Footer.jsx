import { Link } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

/** Site footer: links + social */

export default function Footer() {
  const link = 'text-sm text-white/80 transition-colors hover:text-white'
  const iconWrap =
    'inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:scale-110 hover:bg-sky hover:text-navy'

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center">
              <BrandLogo size="default" />
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/75">
              Empowering Students &amp; Educators Across Uganda
            </p>
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className={link}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tutors" className={link}>
                  Browse Tutors
                </Link>
              </li>
              <li>
                <Link to="/programs" className={link}>
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/#about" className={link}>
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/#faq" className={link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/#contact" className={link}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/#contact" className={link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/#contact" className={link}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading text-sm font-semibold text-white">Follow Us</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.instagram.com/edub4920/"
                target="_blank"
                rel="noopener noreferrer"
                className={iconWrap}
                aria-label="EduBridge on Instagram (opens in new tab)"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17" cy="7" r="1" fill="currentColor" />
                </svg>
              </a>
              <Link to="/" className={iconWrap} aria-label="LinkedIn">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.5 8.5h3V21h-3V8.5zM8 4.25A1.75 1.75 0 106.25 6 1.75 1.75 0 008 4.25zM13.5 8.5H16v1.7h.05c.4-.75 1.4-1.55 2.9-1.55 3.1 0 3.65 2 3.65 4.6V21h-3v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.55-2.3 3.15V21h-3V8.5z" />
                </svg>
              </Link>
              <a
                href="https://x.com/EduBridge7866"
                target="_blank"
                rel="noopener noreferrer"
                className={iconWrap}
                aria-label="EduBridge on X (opens in new tab)"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l16 16M20 4L4 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <Link to="/" className={iconWrap} aria-label="WhatsApp">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3a8 8 0 00-6.9 12L4 21l6.2-1.6A8 8 0 1012 3z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="15" cy="12" r="1" fill="currentColor" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-8">
          <p className="text-center text-sm text-white/60">
            © 2026 EduBridge UG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
