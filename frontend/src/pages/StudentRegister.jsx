import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageSeo from '../components/PageSeo.jsx'
import { apiJson } from '../api/client.js'
import { ROUTE_SEO, SITE_ORIGIN } from '../seo.js'
import { useToast } from '../context/ToastContext.jsx'
import RegisterPageShell, {
  RegisterFormCard,
  RegisterStepProgress,
  registerFieldClass,
} from '../components/RegisterPageShell.jsx'

const CLASS_OPTIONS = [
  'S.1',
  'S.2',
  'S.3',
  'S.4',
  'S.5',
  'S.6',
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
]

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Computer Studies',
  'Fine Art',
]

const inputClass = registerFieldClass
const labelClass = 'mb-1 block font-heading text-sm font-semibold text-navy'

function firstNameFromFull(full) {
  const p = full.trim().split(/\s+/)
  return p[0] || 'Student'
}

export default function StudentRegister() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [schoolName, setSchoolName] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [subjects, setSubjects] = useState([])
  const [, setPhoto] = useState(null)

  function validateStep1() {
    const e = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!phone.trim()) e.phone = 'Phone number is required'
    if (!parentName.trim()) e.parentName = 'Parent/Guardian name is required'
    if (!parentPhone.trim()) e.parentPhone = 'Parent/Guardian phone is required'
    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!schoolName.trim()) e.schoolName = 'School name is required'
    if (!classLevel) e.classLevel = 'Select your class/year level'
    if (!district.trim()) e.district = 'District is required'
    if (!address.trim()) e.address = 'Physical address is required'
    if (subjects.length === 0) e.subjects = 'Select at least one subject'
    if (subjects.length > 4) e.subjects = 'Select up to 4 subjects'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function toggleSubject(name) {
    setSubjects((prev) => {
      if (prev.includes(name)) return prev.filter((s) => s !== name)
      if (prev.length >= 4) return prev
      return [...prev, name]
    })
    setErrors((er) => ({ ...er, subjects: undefined }))
  }

  function handleNext() {
    if (validateStep1()) {
      setErrors({})
      setStep(2)
    }
  }

  async function handleSubmit() {
    if (!validateStep2()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await apiJson('/api/auth/register/student', {
        method: 'POST',
        body: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          parentGuardianName: parentName.trim(),
          parentGuardianPhone: parentPhone.trim(),
          schoolName: schoolName.trim(),
          classLevel,
          district: district.trim(),
          physicalAddress: address.trim(),
          subjectsOfInterest: subjects,
        },
      })
      toast.success('Account created. You can sign in to your student dashboard.')
      setSuccess(true)
    } catch (e) {
      const m = e.message || 'Registration failed. Please try again.'
      setSubmitError(m)
      toast.error(m)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    const fn = firstNameFromFull(fullName)
    return (
      <RegisterPageShell>
        <PageSeo
          title="Welcome — EduBridge UG"
          description={ROUTE_SEO.studentRegister.description}
          canonical={`${SITE_ORIGIN}/register/student`}
        />
        <div className="mx-auto max-w-[600px]">
          <RegisterFormCard>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="font-heading text-2xl font-bold text-navy">Account Created Successfully!</h1>
              <p className="mt-3 font-sans text-mid">
                Welcome to EduBridge, {fn}! Your student account is ready.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/student')}
                  className="font-heading rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky"
                >
                  Go to Dashboard
                </button>
                <Link
                  to="/"
                  className="font-heading inline-flex items-center justify-center rounded-lg border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-navy transition hover:border-blue hover:text-blue"
                >
                  Back to website
                </Link>
              </div>
            </div>
          </RegisterFormCard>
        </div>
      </RegisterPageShell>
    )
  }

  return (
    <RegisterPageShell>
      <PageSeo
        title={ROUTE_SEO.studentRegister.title}
        description={ROUTE_SEO.studentRegister.description}
        canonical={`${SITE_ORIGIN}/register/student`}
      />
      <div className="mx-auto max-w-[600px]">
        <RegisterFormCard>
          <p className="mb-1 text-center font-heading text-xs font-semibold uppercase tracking-wide text-blue">
            Student registration
          </p>
          <h1 className="text-center font-heading text-2xl font-bold text-navy sm:text-3xl">
            Create your account
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center font-sans text-sm text-mid">
            Join thousands of Ugandan students preparing for UNEB with verified tutors and study materials.
          </p>

          <RegisterStepProgress
            labels={['Personal details', 'School & subjects']}
            currentStep={step}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (step === 2) handleSubmit()
            }}
            className="mt-2 space-y-5"
            noValidate
          >
            {step === 1 ? (
              <>
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="font-heading text-base font-semibold text-navy">Personal information</h2>
                  <p className="mt-0.5 font-sans text-xs text-mid">Tell us who you are and how we can reach you.</p>
                </div>
              <div>
                <label htmlFor="sr-fullName" className={labelClass}>
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-fullName"
                  className={`${inputClass} mt-1`}
                  value={fullName}
                  onChange={(ev) => setFullName(ev.target.value)}
                  required
                />
                {errors.fullName ? <p className="mt-1 font-sans text-sm text-red-500">{errors.fullName}</p> : null}
              </div>
              <div>
                <label htmlFor="sr-email" className={labelClass}>
                  Email Address <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-email"
                  type="email"
                  className={`${inputClass} mt-1`}
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  required
                />
                {errors.email ? <p className="mt-1 font-sans text-sm text-red-500">{errors.email}</p> : null}
              </div>
              <div>
                <label htmlFor="sr-phone" className={labelClass}>
                  Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-phone"
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  className={`${inputClass} mt-1`}
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  required
                />
                {errors.phone ? <p className="mt-1 font-sans text-sm text-red-500">{errors.phone}</p> : null}
              </div>
              <div>
                <label htmlFor="sr-parentName" className={labelClass}>
                  Parent/Guardian Full Name <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-parentName"
                  className={`${inputClass} mt-1`}
                  value={parentName}
                  onChange={(ev) => setParentName(ev.target.value)}
                  required
                />
                {errors.parentName ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.parentName}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="sr-parentPhone" className={labelClass}>
                  Parent/Guardian Phone <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-parentPhone"
                  type="tel"
                  className={`${inputClass} mt-1`}
                  value={parentPhone}
                  onChange={(ev) => setParentPhone(ev.target.value)}
                  required
                />
                {errors.parentPhone ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.parentPhone}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="sr-password" className={labelClass}>
                  Password <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-password"
                  type="password"
                  className={`${inputClass} mt-1`}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  minLength={8}
                  required
                />
                {errors.password ? <p className="mt-1 font-sans text-sm text-red-500">{errors.password}</p> : null}
              </div>
              <div>
                <label htmlFor="sr-confirm" className={labelClass}>
                  Confirm Password <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-confirm"
                  type="password"
                  className={`${inputClass} mt-1`}
                  value={confirmPassword}
                  onChange={(ev) => setConfirmPassword(ev.target.value)}
                  required
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.confirmPassword}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="font-heading mt-2 w-full rounded-lg bg-blue py-3 text-sm font-semibold text-white transition hover:bg-sky"
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-slate-100 pb-2">
                <h2 className="font-heading text-base font-semibold text-navy">Academic profile</h2>
                <p className="mt-0.5 font-sans text-xs text-mid">Your school, level, and subjects you want help with.</p>
              </div>
              <div>
                <label htmlFor="sr-school" className={labelClass}>
                  School Name <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-school"
                  className={`${inputClass} mt-1`}
                  value={schoolName}
                  onChange={(ev) => setSchoolName(ev.target.value)}
                  required
                />
                {errors.schoolName ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.schoolName}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="sr-class" className={labelClass}>
                  Class/Year Level <span className="text-gold">*</span>
                </label>
                <select
                  id="sr-class"
                  className={`${inputClass} mt-1`}
                  value={classLevel}
                  onChange={(ev) => setClassLevel(ev.target.value)}
                  required
                >
                  <option value="">Select level</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.classLevel ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.classLevel}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="sr-district" className={labelClass}>
                  District <span className="text-gold">*</span>
                </label>
                <input
                  id="sr-district"
                  className={`${inputClass} mt-1`}
                  value={district}
                  onChange={(ev) => setDistrict(ev.target.value)}
                  required
                />
                {errors.district ? <p className="mt-1 font-sans text-sm text-red-500">{errors.district}</p> : null}
              </div>
              <div>
                <label htmlFor="sr-address" className={labelClass}>
                  Physical Address <span className="text-gold">*</span>
                </label>
                <textarea
                  id="sr-address"
                  rows={2}
                  className={`${inputClass} mt-1 resize-y`}
                  value={address}
                  onChange={(ev) => setAddress(ev.target.value)}
                  required
                />
                {errors.address ? <p className="mt-1 font-sans text-sm text-red-500">{errors.address}</p> : null}
              </div>
              <fieldset className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <legend className={`${labelClass} px-1`}>
                  Subjects of interest <span className="text-gold">*</span>{' '}
                  <span className="font-sans font-normal text-mid">(up to 4)</span>
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUBJECT_OPTIONS.map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 font-sans text-sm text-mid">
                      <input
                        type="checkbox"
                        checked={subjects.includes(s)}
                        onChange={() => toggleSubject(s)}
                        className="h-4 w-4 rounded border-slate-300 text-blue focus:ring-blue/30"
                      />
                      {s}
                    </label>
                  ))}
                </div>
                {errors.subjects ? <p className="mt-1 font-sans text-sm text-red-500">{errors.subjects}</p> : null}
              </fieldset>
              {submitError ? (
                <p className="font-sans text-sm text-red-500" role="alert">
                  {submitError}
                </p>
              ) : null}
              <div>
                <label htmlFor="sr-photo" className={labelClass}>
                  Profile Photo <span className="font-sans font-normal text-mid">(optional)</span>
                </label>
                <input
                  id="sr-photo"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full font-sans text-sm text-mid file:mr-3 file:rounded-lg file:border-0 file:bg-gray file:px-3 file:py-2 file:font-heading file:text-sm file:font-medium file:text-navy"
                  onChange={(ev) => setPhoto(ev.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setErrors({})
                  }}
                  className="font-heading order-2 w-full rounded-lg border-2 border-blue px-4 py-3 text-sm font-semibold text-blue transition hover:bg-blue/5 sm:order-1 sm:w-auto sm:flex-1"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-heading order-1 w-full rounded-lg bg-blue py-3 text-sm font-semibold text-white transition hover:bg-sky disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:flex-[2]"
                >
                  {submitting ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </>
          )}
          </form>
        </RegisterFormCard>
      </div>
    </RegisterPageShell>
  )
}
