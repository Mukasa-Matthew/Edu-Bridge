import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageSeo from '../components/PageSeo.jsx'
import { apiJson } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import BrandLogo from '../components/BrandLogo.jsx'
import { ROUTE_SEO, SITE_ORIGIN } from '../seo.js'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-200 bg-white py-3 px-4 font-sans text-sm text-navy placeholder:text-[#9ca3af] focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20'

const fieldErrorClass = 'mt-1 font-sans text-xs text-red-500 animate-fadeIn'

function EyeShowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeHideIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

const ROLES = [
  { id: 'student', label: 'Student', path: '/dashboard/student' },
  { id: 'tutor', label: 'Tutor', path: '/dashboard/tutor' },
  { id: 'admin', label: 'Admin', path: '/dashboard/admin' },
]

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [roleError, setRoleError] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setRoleError('')
    setFormError('')
    if (!validate()) return
    if (!selectedRole) {
      setRoleError('Please select your account type')
      return
    }
    setLoading(true)
    try {
      const data = await apiJson('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
          role: selectedRole,
          rememberMe,
        },
      })
      const dest = data.redirectUrl || ROLES.find((r) => r.id === selectedRole)?.path || '/'
      toast.success('Signed in successfully.')
      navigate(dest, { replace: true })
    } catch (err) {
      const m = err.message || 'Sign-in failed. Please try again.'
      setFormError(m)
      toast.error(m)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <PageSeo
        title={ROUTE_SEO.login.title}
        description={ROUTE_SEO.login.description}
        canonical={`${SITE_ORIGIN}/login`}
      />
      {/* Left: brand panel — desktop only */}
      <aside className="relative hidden min-h-screen w-[40%] flex-col bg-[#1E3A5F] px-8 py-12 lg:flex">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
            <BrandLogo className="justify-center" size="hero" noInnerPanel />

            <h2 className="mt-10 font-heading text-2xl font-bold leading-tight text-white">
              Empowering Students &amp; Educators Across Uganda
            </h2>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-white/75">
              Join thousands of students preparing for UNEB with verified tutors and study materials.
            </p>

            <ul className="mt-10 flex w-full max-w-xs flex-col items-center gap-4">
              <li className="flex items-center gap-2 font-sans text-sm text-white">
                <span className="text-sky" aria-hidden="true">
                  🎓
                </span>
                <span>500+ Verified Tutors</span>
              </li>
              <li className="flex items-center gap-2 font-sans text-sm text-white">
                <span className="text-sky" aria-hidden="true">
                  ★
                </span>
                <span>4.8 Average Rating</span>
              </li>
              <li className="flex items-center gap-2 font-sans text-sm text-white">
                <span className="text-sky" aria-hidden="true">
                  👥
                </span>
                <span>12,000+ Students</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md shrink-0 text-center">
          <p className="font-sans text-sm text-white/60">New to EduBridge?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/register/student"
              className="rounded-lg border-2 border-white px-5 py-2.5 font-heading text-sm font-semibold text-white transition hover:bg-white hover:text-navy"
            >
              Join as Student
            </Link>
            <Link
              to="/register/tutor"
              className="rounded-lg border-2 border-white px-5 py-2.5 font-heading text-sm font-semibold text-white transition hover:bg-white hover:text-navy"
            >
              Join as Tutor
            </Link>
          </div>
        </div>
      </aside>

      {/* Right: form */}
      <main className="flex min-h-screen flex-1 flex-col bg-[#F3F4F6] lg:w-[60%]">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8">
          <div className="mx-auto w-full max-w-[440px]">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-1 font-sans text-sm text-mid transition hover:text-navy"
            >
              <span aria-hidden="true">←</span>
              Back to home
            </Link>

            {/* Mobile-only logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <BrandLogo className="justify-center" size="default" onLightBackground />
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white p-10 shadow-lg">
              <h1 className="font-heading text-2xl font-bold text-navy">Welcome back</h1>
              <p className="mt-1 font-sans text-sm text-mid">Sign in to your EduBridge account</p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                {formError ? (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800"
                    role="alert"
                  >
                    {formError}
                  </div>
                ) : null}
                <div>
                  <label htmlFor="login-email" className="block font-heading text-sm font-semibold text-navy">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setFieldErrors((f) => ({ ...f, email: undefined }))
                    }}
                  />
                  {fieldErrors.email ? <p className={fieldErrorClass}>{fieldErrors.email}</p> : null}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="login-password" className="font-heading text-sm font-semibold text-navy">
                      Password
                    </label>
                    <Link to="/#contact" className="font-sans text-sm text-blue hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className={`${inputClass} pr-12`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setFieldErrors((f) => ({ ...f, password: undefined }))
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-mid transition hover:bg-gray-100 hover:text-navy"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-pressed={showPassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeHideIcon /> : <EyeShowIcon />}
                    </button>
                  </div>
                  {fieldErrors.password ? <p className={fieldErrorClass}>{fieldErrors.password}</p> : null}
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue accent-blue focus:ring-2 focus:ring-blue/20"
                  />
                  <span className="font-sans text-sm text-mid">Remember me on this device</span>
                </label>

                <div>
                  <p className="font-heading text-xs font-semibold uppercase tracking-wider text-mid">
                    Signing in as:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Account type">
                    {ROLES.map(({ id, label }) => {
                      const active = selectedRole === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(id)
                            setRoleError('')
                          }}
                          className={`rounded-full border px-4 py-2 font-heading text-sm font-semibold transition ${
                            active
                              ? 'border-navy bg-navy text-white'
                              : 'border-gray-200 bg-white text-mid hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                  {roleError ? <p className={fieldErrorClass}>{roleError}</p> : null}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#2563EB] py-3 font-heading text-sm font-semibold text-white transition duration-200 ease-out hover:scale-[1.01] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Log In'}
                </button>
              </form>

              <div className="mt-8 border-t border-gray-200 pt-8">
                <p className="text-center font-sans text-sm text-mid">Don&apos;t have an account?</p>
                <p className="mt-3 flex flex-wrap items-center justify-center gap-1 text-center font-sans text-sm">
                  <Link to="/register/student" className="text-blue underline hover:text-blue-700">
                    Student sign up
                  </Link>
                  <span className="text-mid" aria-hidden="true">
                    ·
                  </span>
                  <Link to="/register/tutor" className="text-blue underline hover:text-blue-700">
                    Tutor sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
