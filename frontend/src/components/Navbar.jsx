import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

/** Fixed top nav: logo, links, auth CTAs, mobile menu */
export default function Navbar() {
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [ddOpen, setDdOpen] = useState(false)
  const ddRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(ev) {
      if (ddRef.current && !ddRef.current.contains(ev.target)) setDdOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const linkBase =
    'font-heading font-medium text-sm text-white/90 hover:text-white transition-colors duration-200'
  const linkActive =
    'font-heading font-medium text-sm text-white underline decoration-sky decoration-2 underline-offset-4'

  const isHome = pathname === '/' && (!hash || hash === '#home')
  const isTutors = pathname === '/tutors'
  const isPrograms = pathname === '/programs'
  const isAbout = pathname === '/' && hash === '#about'
  const isContact = pathname === '/' && hash === '#contact'

  const handleNavClick = () => setOpen(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-navy transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/25' : ''
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8"
        aria-label="Main"
      >
        <Link to="/" onClick={handleNavClick} className="flex shrink-0 items-center py-0.5">
          <BrandLogo size="default" />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          <li>
            <Link
              to="/"
              className={isHome ? linkActive : linkBase}
              aria-current={isHome ? 'page' : undefined}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/tutors"
              className={isTutors ? linkActive : linkBase}
              aria-current={isTutors ? 'page' : undefined}
            >
              Browse Tutors
            </Link>
          </li>
          <li>
            <Link
              to="/programs"
              className={isPrograms ? linkActive : linkBase}
              aria-current={isPrograms ? 'page' : undefined}
            >
              Programs
            </Link>
          </li>
          <li>
            <Link
              to="/#about"
              className={isAbout ? linkActive : linkBase}
              aria-current={isAbout ? 'page' : undefined}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/#contact"
              className={isContact ? linkActive : linkBase}
              aria-current={isContact ? 'page' : undefined}
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="font-heading hidden rounded-lg border-2 border-white/40 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-white hover:bg-white/10 sm:inline-flex"
          >
            Log In
          </Link>
          <div className="relative" ref={ddRef}>
            <button
              type="button"
              onClick={() => setDdOpen((v) => !v)}
              className="font-heading inline-flex items-center gap-1 rounded-lg bg-blue px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-sky"
              aria-expanded={ddOpen}
              aria-haspopup="true"
            >
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {ddOpen ? (
              <div
                className="absolute right-0 z-[60] mt-2 min-w-[200px] rounded-xl border border-white/10 bg-navy py-2 shadow-xl ring-1 ring-black/20"
                role="menu"
              >
                <Link
                  to="/register/student"
                  role="menuitem"
                  className="block px-4 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
                  onClick={() => setDdOpen(false)}
                >
                  Join as Student
                </Link>
                <Link
                  to="/register/tutor"
                  role="menuitem"
                  className="block px-4 py-2.5 font-heading text-sm font-medium text-white hover:bg-white/10"
                  onClick={() => setDdOpen(false)}
                >
                  Join as Tutor
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Open menu</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`lg:hidden ${open ? 'max-h-[28rem] border-t border-white/10' : 'max-h-0 overflow-hidden'} bg-navy transition-all duration-300 ease-out`}
      >
        <nav aria-label="Mobile" className="px-0">
        <ul className="flex flex-col gap-1 px-4 py-3 sm:px-6">
          {[
            ['Home', '/', isHome],
            ['Browse Tutors', '/tutors', isTutors],
            ['Programs', '/programs', isPrograms],
            ['About', '/#about', isAbout],
            ['Contact', '/#contact', isContact],
          ].map(([label, href, active]) => (
            <li key={href}>
              <Link
                to={href}
                onClick={handleNavClick}
                className={`block rounded-lg px-3 py-2 font-heading text-sm font-medium ${
                  active ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-white/10 pt-3">
            <Link
              to="/register/student"
              onClick={handleNavClick}
              className="block rounded-lg px-3 py-2 font-heading text-sm font-medium text-white hover:bg-white/10"
            >
              Join as Student
            </Link>
            <Link
              to="/register/tutor"
              onClick={handleNavClick}
              className="block rounded-lg px-3 py-2 font-heading text-sm font-medium text-white hover:bg-white/10"
            >
              Join as Tutor
            </Link>
          </li>
          <li className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row">
            <Link
              to="/login"
              onClick={handleNavClick}
              className="font-heading rounded-lg border-2 border-white/40 px-4 py-2 text-center text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-white/10"
            >
              Log In
            </Link>
            <Link
              to="/register/student"
              onClick={handleNavClick}
              className="font-heading rounded-lg bg-blue px-4 py-2 text-center text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-sky"
            >
              Get Started
            </Link>
          </li>
        </ul>
        </nav>
      </div>
    </header>
  )
}
