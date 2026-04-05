/**
 * Shared SEO constants and helpers for PageSeo and future dynamic updates.
 * Keep in sync with index.html defaults where possible.
 */

export const SITE_ORIGIN = 'https://edubridge-ug.netlify.app'

export const DEFAULT_PAGE_TITLE =
  "EduBridge UG — Uganda's #1 Online Tutoring Platform for UNEB Exam Preparation"

export const DEFAULT_META_DESCRIPTION =
  'EduBridge connects Ugandan students with verified tutors for UNEB exam preparation. Access past papers, revision notes, and book affordable tutoring sessions from UGX 3,000. Join 12,000+ students today.'

/** Per-route defaults for {@link ../components/PageSeo.jsx PageSeo} */
export const ROUTE_SEO = {
  home: {
    title: DEFAULT_PAGE_TITLE,
    description: DEFAULT_META_DESCRIPTION,
  },
  login: {
    title: 'Log In — EduBridge UG',
    description:
      'Sign in to your EduBridge student or tutor account. Access your dashboard, bookings, and UNEB study materials.',
  },
  studentRegister: {
    title: 'Create Student Account — EduBridge UG',
    description:
      'Join EduBridge as a student. Access UNEB past papers, revision notes, and connect with verified tutors across Uganda.',
  },
  tutorRegister: {
    title: 'Become a Tutor — EduBridge UG',
    description:
      'Join EduBridge as a tutor. Reach students across Uganda, set your own rates, and grow your teaching business.',
  },
  browseTutors: {
    title: 'Browse Tutors — EduBridge UG',
    description:
      'Search verified UNEB and university tutors in Uganda by subject and level. Compare rates, session types, and ratings on EduBridge.',
  },
  programs: {
    title: 'Programs & Courses — EduBridge UG',
    description:
      'O-Level, A-Level, and university tutoring; past papers library; group and one-on-one sessions. See how EduBridge supports Ugandan students.',
  },
}

/**
 * @param {keyof typeof ROUTE_SEO} routeKey
 * @returns {{ title: string, description: string }}
 */
export function getRouteSeo(routeKey) {
  return ROUTE_SEO[routeKey] || ROUTE_SEO.home
}

/**
 * Optional: update document title without PageSeo (e.g. legacy code paths).
 * @param {string} title
 */
export function setDocumentTitle(title) {
  if (typeof document !== 'undefined') document.title = title
}
