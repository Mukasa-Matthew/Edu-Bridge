import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import {
  AdminHomeOverview,
  AdminTutorApplications,
  AdminStudentsPage,
  AdminTutorsManagePage,
  AdminMaterialsPage,
  AdminBookingsPage,
  AdminPaymentsPage,
  AdminStatsPage,
  AdminNotifyPage,
  AdminSettingsPage,
} from './admin/AdminSubpages.jsx'

const base = '/dashboard/admin'

const ic = {
  home: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm11-4v6m3-3h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  chart: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19V5M9 19V9M14 19v-6M19 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  doc: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h8l4 4v14H7V4z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 4v4h4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  cal: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  money: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  bell: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  gear: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
}

const adminNav = [
  { to: base, label: 'Overview', icon: ic.home },
  { to: `${base}/applications`, label: 'Tutor apps', icon: ic.users },
  { to: `${base}/students`, label: 'Students', icon: ic.users },
  { to: `${base}/tutors-list`, label: 'Tutors', icon: ic.users },
  { to: `${base}/materials`, label: 'Materials', icon: ic.doc },
  { to: `${base}/bookings`, label: 'Bookings', icon: ic.cal },
  { to: `${base}/payments`, label: 'Payments', icon: ic.money },
  { to: `${base}/analytics`, label: 'Statistics', icon: ic.chart },
  { to: `${base}/notify`, label: 'Broadcast', icon: ic.bell },
  { to: `${base}/settings`, label: 'Settings', icon: ic.gear },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout basePath={base} navItems={adminNav} variant="admin" sidebarSubtitle="Admin panel">
      <Routes>
        <Route index element={<AdminHomeOverview />} />
        <Route path="applications" element={<AdminTutorApplications />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="tutors-list" element={<AdminTutorsManagePage />} />
        <Route path="materials" element={<AdminMaterialsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="analytics" element={<AdminStatsPage />} />
        <Route path="notify" element={<AdminNotifyPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Routes>
    </DashboardLayout>
  )
}
