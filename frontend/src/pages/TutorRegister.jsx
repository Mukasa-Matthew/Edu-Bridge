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

const QUALIFICATIONS = [
  'Certificate',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Other',
]

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', '10+ years']

const SUBJECTS_PRIMARY = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English Language',
  'English Literature',
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
  return p[0] || 'Tutor'
}

export default function TutorRegister() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [, setPhoto] = useState(null)

  const [qualification, setQualification] = useState('')
  const [institution, setInstitution] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [employer, setEmployer] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')

  const [primarySubject, setPrimarySubject] = useState('')
  const [secondarySubject, setSecondarySubject] = useState('')
  const [levels, setLevels] = useState({ olevel: false, alevel: false, uni: false })
  const [sessionMode, setSessionMode] = useState('')
  const [groupRate, setGroupRate] = useState('')
  const [oneOnOneRate, setOneOnOneRate] = useState('')
  const [tutorDistrict, setTutorDistrict] = useState('')

  const bioLen = bio.length

  function validateStep1() {
    const e = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email'
    if (!phone.trim()) e.phone = 'Phone number is required'
    if (!nationalId.trim()) e.nationalId = 'National ID is required'
    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep2() {
    const e = {}
    if (!qualification) e.qualification = 'Select your highest qualification'
    if (!institution.trim()) e.institution = 'Institution is required'
    const y = Number(gradYear)
    if (!gradYear) e.gradYear = 'Year of graduation is required'
    else if (Number.isNaN(y) || y < 1990 || y > 2026) e.gradYear = 'Enter a year between 1990 and 2026'
    if (!employer.trim()) e.employer = 'Current employer/school is required'
    if (!experience) e.experience = 'Select years of experience'
    if (!bio.trim()) e.bio = 'Bio is required'
    else if (bio.length > 300) e.bio = 'Bio must be 300 characters or less'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function validateStep3() {
    const e = {}
    if (!primarySubject) e.primarySubject = 'Select a primary subject'
    if (secondarySubject && secondarySubject === primarySubject) {
      e.secondarySubject = 'Cannot match primary subject'
    }
    if (!levels.olevel && !levels.alevel && !levels.uni) e.levels = 'Select at least one teaching level'
    if (!sessionMode) e.sessionMode = 'Select a session mode'
    const g = Number(groupRate)
    const o = Number(oneOnOneRate)
    if (!groupRate.trim()) e.groupRate = 'Group session rate is required'
    else if (Number.isNaN(g) || g <= 0) e.groupRate = 'Enter a valid amount (UGX)'
    if (!oneOnOneRate.trim()) e.oneOnOneRate = 'One-on-one rate is required'
    else if (Number.isNaN(o) || o <= 0) e.oneOnOneRate = 'Enter a valid amount (UGX)'
    if (!tutorDistrict.trim()) e.tutorDistrict = 'District/location is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function toggleLevel(key) {
    setLevels((prev) => ({ ...prev, [key]: !prev[key] }))
    setErrors((er) => ({ ...er, levels: undefined }))
  }

  async function handleSubmit() {
    if (!validateStep3()) return
    const teachingLevels = []
    if (levels.olevel) teachingLevels.push('O-Level')
    if (levels.alevel) teachingLevels.push('A-Level')
    if (levels.uni) teachingLevels.push('University')
    setSubmitting(true)
    setSubmitError('')
    try {
      await apiJson('/api/auth/register/tutor', {
        method: 'POST',
        body: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          nationalId: nationalId.trim(),
          password,
          qualification,
          institution: institution.trim(),
          graduationYear: Number(gradYear),
          employer: employer.trim(),
          experience,
          bio: bio.trim(),
          primarySubject,
          secondarySubject: secondarySubject || undefined,
          teachingLevels,
          sessionMode,
          groupRateUgx: Number(groupRate),
          oneOnOneRateUgx: Number(oneOnOneRate),
          district: tutorDistrict.trim(),
        },
      })
      toast.success('Application submitted. We will review it shortly.')
      setPending(true)
    } catch (e) {
      const m = e.message || 'Could not submit application. Please try again.'
      setSubmitError(m)
      toast.error(m)
    } finally {
      setSubmitting(false)
    }
  }

  if (pending) {
    const fn = firstNameFromFull(fullName)
    return (
      <RegisterPageShell>
        <PageSeo
          title="Application submitted — EduBridge UG"
          description={ROUTE_SEO.tutorRegister.description}
          canonical={`${SITE_ORIGIN}/register/tutor`}
        />
        <div className="mx-auto max-w-[680px]">
          <RegisterFormCard>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold">
                <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="font-heading text-2xl font-bold text-navy">Application submitted</h1>
              <p className="mt-4 font-sans text-mid">
                Thank you {fn}! Your tutor application is under review. Our team will verify your details
                and notify you within 24–48 hours via <span className="font-medium text-navy">{email}</span> and{' '}
                <span className="font-medium text-navy">{phone}</span>.
              </p>
              <p className="mt-4 font-sans text-sm text-mid">
                You will receive an SMS and email once your account is approved. Students cannot book you until
                your profile is verified.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="font-heading rounded-lg bg-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky"
                >
                  Back to home
                </button>
                <Link
                  to="/login"
                  className="font-heading inline-flex items-center justify-center rounded-lg border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-navy transition hover:border-blue hover:text-blue"
                >
                  Log in
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
        title={ROUTE_SEO.tutorRegister.title}
        description={ROUTE_SEO.tutorRegister.description}
        canonical={`${SITE_ORIGIN}/register/tutor`}
      />
      <div className="mx-auto max-w-[680px]">
        <RegisterFormCard>
          <div className="mb-6 flex gap-3 rounded-xl border border-navy/10 bg-navy/5 px-4 py-3">
            <span className="text-lg" aria-hidden="true">
              🔒
            </span>
            <p className="font-sans text-sm leading-relaxed text-navy">
              Your information is securely stored and only used for account verification purposes.
            </p>
          </div>
          <p className="mb-1 text-center font-heading text-xs font-semibold uppercase tracking-wide text-blue">
            Tutor application
          </p>
          <h1 className="text-center font-heading text-2xl font-bold text-navy sm:text-3xl">
            Become an EduBridge tutor
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-center font-sans text-sm text-mid">
            Share your expertise, set your rates, and reach students across Uganda. Complete all three steps to
            submit your profile for review.
          </p>

          <RegisterStepProgress
            labels={['Personal details', 'Professional', 'Teaching']}
            currentStep={step}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (step === 3) handleSubmit()
            }}
            className="mt-2 space-y-5"
            noValidate
          >
            {step === 1 ? (
              <>
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="font-heading text-base font-semibold text-navy">Personal information</h2>
                  <p className="mt-0.5 font-sans text-xs text-mid">Identity, contact, and login credentials.</p>
                </div>
              <div>
                <label htmlFor="tr-name" className={labelClass}>
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-name"
                  className={`${inputClass} mt-1`}
                  value={fullName}
                  onChange={(ev) => setFullName(ev.target.value)}
                />
                {errors.fullName ? <p className="mt-1 font-sans text-sm text-red-500">{errors.fullName}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-email" className={labelClass}>
                  Email Address <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-email"
                  type="email"
                  className={`${inputClass} mt-1`}
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
                {errors.email ? <p className="mt-1 font-sans text-sm text-red-500">{errors.email}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-phone" className={labelClass}>
                  Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-phone"
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  className={`${inputClass} mt-1`}
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                />
                {errors.phone ? <p className="mt-1 font-sans text-sm text-red-500">{errors.phone}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-nid" className={labelClass}>
                  National ID Number <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-nid"
                  className={`${inputClass} mt-1`}
                  value={nationalId}
                  onChange={(ev) => setNationalId(ev.target.value)}
                />
                {errors.nationalId ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.nationalId}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-pass" className={labelClass}>
                  Password <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-pass"
                  type="password"
                  className={`${inputClass} mt-1`}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  minLength={8}
                />
                {errors.password ? <p className="mt-1 font-sans text-sm text-red-500">{errors.password}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-confirm" className={labelClass}>
                  Confirm Password <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-confirm"
                  type="password"
                  className={`${inputClass} mt-1`}
                  value={confirmPassword}
                  onChange={(ev) => setConfirmPassword(ev.target.value)}
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.confirmPassword}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-photo" className={labelClass}>
                  Profile Photo <span className="font-sans font-normal text-mid">(optional)</span>
                </label>
                <input
                  id="tr-photo"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full font-sans text-sm text-mid file:mr-3 file:rounded-lg file:border-0 file:bg-gray file:px-3 file:py-2 file:font-heading file:text-sm file:font-medium file:text-navy"
                  onChange={(ev) => setPhoto(ev.target.files?.[0] ?? null)}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) {
                    setErrors({})
                    setStep(2)
                  }
                }}
                className="font-heading mt-2 w-full rounded-lg bg-blue py-3 text-sm font-semibold text-white transition hover:bg-sky"
              >
                Next →
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="border-b border-slate-100 pb-2">
                <h2 className="font-heading text-base font-semibold text-navy">Professional background</h2>
                <p className="mt-0.5 font-sans text-xs text-mid">Qualifications, experience, and a short bio for your public profile.</p>
              </div>
              <div>
                <label htmlFor="tr-qual" className={labelClass}>
                  Highest Qualification <span className="text-gold">*</span>
                </label>
                <select
                  id="tr-qual"
                  className={`${inputClass} mt-1`}
                  value={qualification}
                  onChange={(ev) => setQualification(ev.target.value)}
                >
                  <option value="">Select qualification</option>
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                {errors.qualification ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.qualification}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-inst" className={labelClass}>
                  Institution/University Attended <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-inst"
                  className={`${inputClass} mt-1`}
                  value={institution}
                  onChange={(ev) => setInstitution(ev.target.value)}
                />
                {errors.institution ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.institution}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-year" className={labelClass}>
                  Year of Graduation <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-year"
                  type="number"
                  min={1990}
                  max={2026}
                  className={`${inputClass} mt-1`}
                  value={gradYear}
                  onChange={(ev) => setGradYear(ev.target.value)}
                />
                {errors.gradYear ? <p className="mt-1 font-sans text-sm text-red-500">{errors.gradYear}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-emp" className={labelClass}>
                  Current Employer/School <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-emp"
                  placeholder="e.g. Makerere University, Kampala Parents School"
                  className={`${inputClass} mt-1`}
                  value={employer}
                  onChange={(ev) => setEmployer(ev.target.value)}
                />
                {errors.employer ? <p className="mt-1 font-sans text-sm text-red-500">{errors.employer}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-exp" className={labelClass}>
                  Years of Teaching Experience <span className="text-gold">*</span>
                </label>
                <select
                  id="tr-exp"
                  className={`${inputClass} mt-1`}
                  value={experience}
                  onChange={(ev) => setExperience(ev.target.value)}
                >
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {errors.experience ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.experience}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-bio" className={labelClass}>
                  Short Bio <span className="text-gold">*</span>
                </label>
                <textarea
                  id="tr-bio"
                  rows={4}
                  maxLength={300}
                  className={`${inputClass} mt-1 resize-y`}
                  value={bio}
                  onChange={(ev) => setBio(ev.target.value)}
                />
                <div className="mt-1 flex justify-end font-sans text-xs text-mid" aria-live="polite">
                  {bioLen}/300
                </div>
                {errors.bio ? <p className="mt-1 font-sans text-sm text-red-500">{errors.bio}</p> : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setErrors({})
                  }}
                  className="font-heading w-full rounded-lg border-2 border-blue px-4 py-3 text-sm font-semibold text-blue sm:w-auto sm:flex-1"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) {
                      setErrors({})
                      setStep(3)
                    }
                  }}
                  className="font-heading w-full rounded-lg bg-blue py-3 text-sm font-semibold text-white sm:flex-[2]"
                >
                  Next →
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="border-b border-slate-100 pb-2">
                <h2 className="font-heading text-base font-semibold text-navy">Teaching &amp; rates</h2>
                <p className="mt-0.5 font-sans text-xs text-mid">Subjects, levels, session preferences, and pricing within platform guidelines.</p>
              </div>
              <div>
                <label htmlFor="tr-pri" className={labelClass}>
                  Primary Subject — Major <span className="text-gold">*</span>
                </label>
                <select
                  id="tr-pri"
                  className={`${inputClass} mt-1`}
                  value={primarySubject}
                  onChange={(ev) => {
                    setPrimarySubject(ev.target.value)
                    setErrors((er) => ({ ...er, primarySubject: undefined, secondarySubject: undefined }))
                  }}
                >
                  <option value="">Select one</option>
                  {SUBJECTS_PRIMARY.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.primarySubject ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.primarySubject}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-sec" className={labelClass}>
                  Secondary Subject (optional — max 1)
                </label>
                <select
                  id="tr-sec"
                  className={`${inputClass} mt-1`}
                  value={secondarySubject}
                  onChange={(ev) => setSecondarySubject(ev.target.value)}
                >
                  <option value="">None</option>
                  {SUBJECTS_PRIMARY.filter((s) => s !== primarySubject).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.secondarySubject ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.secondarySubject}</p>
                ) : null}
              </div>
              <fieldset>
                <legend className={labelClass}>
                  Teaching Level <span className="text-gold">*</span>
                </legend>
                <div className="mt-2 space-y-2 font-sans text-sm text-mid">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={levels.olevel}
                      onChange={() => toggleLevel('olevel')}
                      className="h-4 w-4 rounded border-slate-300 text-blue"
                    />
                    O-Level (S.1–S.4)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={levels.alevel}
                      onChange={() => toggleLevel('alevel')}
                      className="h-4 w-4 rounded border-slate-300 text-blue"
                    />
                    A-Level (S.5–S.6)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={levels.uni}
                      onChange={() => toggleLevel('uni')}
                      className="h-4 w-4 rounded border-slate-300 text-blue"
                    />
                    University
                  </label>
                </div>
                {errors.levels ? <p className="mt-1 font-sans text-sm text-red-500">{errors.levels}</p> : null}
              </fieldset>
              <fieldset>
                <legend className={labelClass}>
                  Preferred Session Mode <span className="text-gold">*</span>
                </legend>
                <div className="mt-2 space-y-2 font-sans text-sm text-mid">
                  {[
                    ['Online Only', 'online'],
                    ['In-Person Only', 'inperson'],
                    ['Both Online & In-Person', 'both'],
                  ].map(([lab, val]) => (
                    <label key={val} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sessionMode"
                        value={val}
                        checked={sessionMode === val}
                        onChange={() => setSessionMode(val)}
                        className="h-4 w-4 border-slate-300 text-blue"
                      />
                      {lab}
                    </label>
                  ))}
                </div>
                {errors.sessionMode ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.sessionMode}</p>
                ) : null}
              </fieldset>
              <div>
                <label htmlFor="tr-grp" className={labelClass}>
                  Group session rate (UGX) <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-grp"
                  type="number"
                  min={1}
                  placeholder="e.g. 5000"
                  className={`${inputClass} mt-1`}
                  value={groupRate}
                  onChange={(ev) => setGroupRate(ev.target.value)}
                />
                <p className="mt-1 font-sans text-xs text-mid">UGX 3,000–5,000 per student</p>
                {errors.groupRate ? <p className="mt-1 font-sans text-sm text-red-500">{errors.groupRate}</p> : null}
              </div>
              <div>
                <label htmlFor="tr-121" className={labelClass}>
                  One-on-one rate (UGX) <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-121"
                  type="number"
                  min={1}
                  placeholder="e.g. 10000"
                  className={`${inputClass} mt-1`}
                  value={oneOnOneRate}
                  onChange={(ev) => setOneOnOneRate(ev.target.value)}
                />
                <p className="mt-1 font-sans text-xs text-mid">UGX 8,000–15,000 per session</p>
                {errors.oneOnOneRate ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.oneOnOneRate}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="tr-dist" className={labelClass}>
                  District/Location <span className="text-gold">*</span>
                </label>
                <input
                  id="tr-dist"
                  className={`${inputClass} mt-1`}
                  value={tutorDistrict}
                  onChange={(ev) => setTutorDistrict(ev.target.value)}
                />
                {errors.tutorDistrict ? (
                  <p className="mt-1 font-sans text-sm text-red-500">{errors.tutorDistrict}</p>
                ) : null}
              </div>
              {submitError ? (
                <p className="font-sans text-sm text-red-500" role="alert">
                  {submitError}
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2)
                    setErrors({})
                  }}
                  className="font-heading w-full rounded-lg border-2 border-blue px-4 py-3 text-sm font-semibold text-blue sm:w-auto sm:flex-1"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-heading w-full rounded-lg bg-blue py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-[2]"
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </>
          ) : null}
          </form>
        </RegisterFormCard>
      </div>
    </RegisterPageShell>
  )
}
