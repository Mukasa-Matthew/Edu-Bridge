import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

/** Shared input/select/textarea field styling for registration flows */
export const registerFieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 font-sans text-sm text-navy shadow-sm outline-none transition placeholder:text-mid/50 focus:border-blue focus:ring-2 focus:ring-blue/20'

/** Card wrapper for form content */
/** Step chips (1-based current step) */
export function RegisterStepProgress({ labels, currentStep }) {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
      {labels.map((label, i) => {
        const n = i + 1
        const active = n === currentStep
        const done = n < currentStep
        return (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 font-heading text-xs font-semibold shadow-sm transition sm:px-4 sm:text-sm ${
              active
                ? 'border-blue bg-blue text-white'
                : done
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-mid'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                active ? 'bg-white/20 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-mid'
              }`}
            >
              {done ? '✓' : n}
            </span>
            <span className="max-w-[140px] leading-tight sm:max-w-none">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function RegisterFormCard({ children, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-navy/5 ring-1 ring-navy/5 ${className}`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-blue via-sky to-blue" aria-hidden="true" />
      <div className="px-6 py-8 sm:px-10 sm:py-10">{children}</div>
    </div>
  )
}

/**
 * Registration pages: sticky navy header with full site navigation + mobile menu.
 */
export default function RegisterPageShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLink =
    'font-heading text-sm font-medium text-white/90 transition hover:text-white'
  const regLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 font-heading text-sm font-semibold transition ${
      isActive ? 'bg-white/15 text-sky' : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-gray">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center text-white"
            onClick={() => setMenuOpen(false)}
          >
            <BrandLogo size="default" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex lg:gap-2" aria-label="Registration site">
            <Link to="/" className={`${navLink} px-2 py-2`}>
              Home
            </Link>
            <Link to="/tutors" className={`${navLink} px-2 py-2`}>
              Browse
            </Link>
            <Link to="/#contact" className={`${navLink} px-2 py-2`}>
              Contact
            </Link>
            <Link to="/login" className={`${navLink} ml-2 rounded-lg border border-white/30 px-3 py-2 hover:border-white hover:bg-white/10`}>
              Log in
            </Link>
            <span className="mx-1 hidden h-6 w-px bg-white/20 xl:inline-block" aria-hidden="true" />
            <NavLink to="/register/student" className={regLink} end>
              Student sign up
            </NavLink>
            <NavLink to="/register/tutor" className={regLink}>
              Tutor sign up
            </NavLink>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-white lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="register-mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        <div
          id="register-mobile-nav"
          className={`lg:hidden ${menuOpen ? 'max-h-[320px] border-t border-white/10' : 'max-h-0 overflow-hidden'} bg-navy transition-all duration-300`}
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            <Link
              to="/"
              className="rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/tutors"
              className="rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Browse tutors
            </Link>
            <Link
              to="/#contact"
              className="rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              to="/login"
              className="rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>
            <div className="my-2 border-t border-white/10 pt-2">
              <NavLink
                to="/register/student"
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 font-heading text-sm font-semibold ${
                    isActive ? 'bg-white/15 text-sky' : 'text-white hover:bg-white/10'
                  }`
                }
                onClick={() => setMenuOpen(false)}
                end
              >
                Student sign up
              </NavLink>
              <NavLink
                to="/register/tutor"
                className={({ isActive }) =>
                  `mt-1 block rounded-lg px-3 py-2.5 font-heading text-sm font-semibold ${
                    isActive ? 'bg-white/15 text-sky' : 'text-white hover:bg-white/10'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Tutor sign up
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="font-sans text-sm text-mid">Need help? Visit our website or contact support.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="font-heading text-sm font-semibold text-blue hover:text-sky">
              ← Back to home
            </Link>
            <Link to="/#contact" className="font-heading text-sm font-semibold text-navy hover:text-blue">
              Contact us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
