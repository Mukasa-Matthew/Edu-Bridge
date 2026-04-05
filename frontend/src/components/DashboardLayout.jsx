import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { apiJson } from '../api/client.js'

import NotificationBell from './NotificationBell.jsx'
import BrandLogo from './BrandLogo.jsx'

/**
 * Shared shell: navy sidebar (desktop), bottom nav (mobile), main area.
 * @param {{ basePath: string, navItems: { to: string, label: string, icon: React.ReactNode }[], children: React.ReactNode, notificationsPath?: string, variant?: 'default' | 'admin', sidebarSubtitle?: string }} props
 */
export default function DashboardLayout({ basePath, navItems, children, notificationsPath, variant = 'default', sidebarSubtitle }) {
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  async function handleLogout() {
    try {
      await apiJson('/api/auth/logout', { method: 'POST' })
    } catch {
      /* still sign out locally */
    }
    navigate('/')
  }

  const shellBg =
    variant === 'admin'
      ? 'min-h-screen bg-gradient-to-br from-slate-100 via-[#F3F4F6] to-sky-50/50 pb-20 lg:pb-0'
      : 'min-h-screen bg-gray pb-20 lg:pb-0'

  return (
    <div className={shellBg}>
      {/* Desktop sidebar */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[240px] flex-col bg-navy lg:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Link to="/" className="flex items-center text-white" onClick={() => setMobileNavOpen(false)}>
            <BrandLogo size="compact" />
          </Link>
          {sidebarSubtitle ? (
            <p className="mt-2 font-heading text-[10px] font-semibold uppercase tracking-wider text-sky/90">{sidebarSubtitle}</p>
          ) : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-4" aria-label="Dashboard">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === basePath}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 font-heading text-sm font-medium transition-colors ${
                  isActive ? 'bg-sky/20 text-sky' : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="shrink-0 opacity-90" aria-hidden="true">
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left font-heading text-sm font-medium text-red-400 transition hover:bg-white/10 hover:text-red-300"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-[240px]">
        {notificationsPath ? (
          <div className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-gray-200/80 bg-gray/90 px-4 py-2 backdrop-blur-sm">
            <NotificationBell fullPath={notificationsPath} />
          </div>
        ) : null}
        <div className="min-h-screen">{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-navy lg:hidden"
        aria-label="Mobile dashboard"
      >
        {navItems.slice(0, 3).map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === basePath}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-heading font-medium ${
                isActive ? 'text-sky' : 'text-white/70'
              }`
            }
          >
            <span className="h-5 w-5 shrink-0 [&_svg]:mx-auto">{icon}</span>
            <span className="line-clamp-1 px-0.5 text-center">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-heading font-medium text-white/70"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-expanded={mobileNavOpen}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          More
        </button>
      </nav>

      {/* Mobile full menu overlay */}
      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      {mobileNavOpen ? (
        <div className="fixed bottom-16 left-2 right-2 z-[70] max-h-[55vh] overflow-y-auto rounded-xl border border-white/10 bg-navy p-3 shadow-xl lg:hidden">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === basePath}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 font-heading text-sm font-medium ${
                      isActive ? 'bg-sky/20 text-sky' : 'text-white/90'
                    }`
                  }
                >
                  {icon}
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false)
                  handleLogout()
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-heading text-sm font-medium text-red-400"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}
