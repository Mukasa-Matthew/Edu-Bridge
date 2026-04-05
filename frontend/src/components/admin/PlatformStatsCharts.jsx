import { formatUgx } from '../../lib/dashboardFormat.js'

const NAVY = '#1E3A5F'
const BLUE = '#2563EB'
const SKY = '#0EA5E9'
const GOLD = '#F59E0B'
const EMERALD = '#10B981'
const SLATE = '#94A3B8'

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${largeArc} 1 ${start.x} ${start.y} Z`
}

/**
 * @param {{
 *   segments: { label: string; value: number; color: string }[];
 *   size?: number;
 *   centerLine1?: string;
 *   centerLine2?: string;
 * }} props
 */
function SvgDonut({ segments, size = 200, centerLine1, centerLine2 = 'total' }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const total = segments.reduce((s, x) => s + x.value, 0)

  if (total <= 0) return null

  const line1 = centerLine1 ?? String(total)

  let angle = 0
  const paths = segments
    .filter((s) => s.value > 0)
    .map((seg) => {
      const sweep = (seg.value / total) * 360
      const start = angle
      const end = angle + sweep
      angle = end
      if (sweep >= 359.5) {
        return (
          <g key={seg.label}>
            <path d={describeSlice(cx, cy, r, start, start + 180)} fill={seg.color} stroke="#fff" strokeWidth="2" />
            <path d={describeSlice(cx, cy, r, start + 180, start + 360)} fill={seg.color} stroke="#fff" strokeWidth="2" />
          </g>
        )
      }
      const d = describeSlice(cx, cy, r, start, end)
      return <path key={seg.label} d={d} fill={seg.color} stroke="#fff" strokeWidth="2" className="transition-opacity hover:opacity-90" />
    })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto shrink-0" role="img" aria-label="Pie chart">
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
      <text x={cx} y={cy - (centerLine2 ? 4 : 0)} textAnchor="middle" dominantBaseline="middle" className="fill-navy font-heading text-[11px] font-bold">
        {line1}
      </text>
      {centerLine2 ? (
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-mid font-sans text-[9px]">
          {centerLine2}
        </text>
      ) : null}
    </svg>
  )
}

function Legend({ items }) {
  return (
    <ul className="mt-4 space-y-2 font-sans text-sm text-mid">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
            {item.label}
          </span>
          <span className="font-heading font-semibold text-navy">{item.valueLabel}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * @param {{ stats: Record<string, unknown> | null }} props
 */
export function UserCompositionPie({ stats }) {
  const students = Number(stats?.totalStudents ?? 0)
  const tutors = Number(stats?.approvedTutors ?? 0)
  const total = Number(stats?.totalUsers ?? 0)
  const other = Math.max(0, total - students - tutors)

  const segments = [
    { label: 'Students', value: students, color: BLUE },
    { label: 'Approved tutors', value: tutors, color: NAVY },
    { label: 'Other (admin, pending, etc.)', value: other, color: SLATE },
  ]

  const hasSegments = segments.some((s) => s.value > 0)

  if (!hasSegments || total === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 text-center font-sans text-sm text-mid">
        No users to chart yet — segments appear when students and tutors join the platform.
      </div>
    )
  }

  const legendItems = segments.map((s) => ({
    ...s,
    valueLabel: String(s.value),
  }))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-navy">Users by role</h2>
      <p className="mt-1 font-sans text-xs text-mid">How registered accounts split between students, tutors, and everyone else.</p>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        <SvgDonut segments={segments} size={220} centerLine1={String(total)} centerLine2="accounts" />
        <div className="w-full max-w-xs">
          <Legend items={legendItems} />
        </div>
      </div>
    </div>
  )
}

/**
 * @param {{ stats: Record<string, unknown> | null }} props
 */
export function RevenueSourcePie({ stats }) {
  const sub = Number(stats?.subscriptionRevenueUgx ?? 0)
  const fees = Number(stats?.platformBookingFeesUgx ?? 0)

  const segments = [
    { label: 'Subscription revenue', value: sub, color: EMERALD },
    { label: 'Platform booking fees', value: fees, color: GOLD },
  ]

  const total = sub + fees
  const hasSegments = total > 0

  if (!hasSegments) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 text-center font-sans text-sm text-mid">
        No revenue yet — completed subscription and session payments will appear here.
      </div>
    )
  }

  const legendItems = segments.map((s) => ({
    ...s,
    valueLabel: `UGX ${formatUgx(s.value)}`,
  }))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-navy">Revenue mix</h2>
      <p className="mt-1 font-sans text-xs text-mid">Subscriptions vs platform share from completed session bookings.</p>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        <SvgDonut
          segments={segments}
          size={220}
          centerLine1={`UGX ${formatUgx(total)}`}
          centerLine2="combined"
        />
        <div className="w-full max-w-xs">
          <Legend items={legendItems} />
        </div>
      </div>
    </div>
  )
}

/**
 * @param {{ monthly: Array<{ month: string, subscription_ugx?: unknown, bookings_ugx?: unknown }> }} props
 */
export function MonthlyRevenueBar({ monthly }) {
  const rows = (monthly || []).map((row) => ({
    label: new Date(row.month).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
    sub: Number(row.subscription_ugx ?? 0),
    book: Number(row.bookings_ugx ?? 0),
  }))

  const maxVal = Math.max(1, ...rows.flatMap((r) => [r.sub, r.book]))
  const hasAny = rows.some((r) => r.sub > 0 || r.book > 0)

  if (!rows.length || !hasAny) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 text-center font-sans text-sm text-mid">
        No payments in the last 6 months — stacked bars will grow as subscriptions and bookings are paid.
      </div>
    )
  }

  const chartH = 200
  const barW = Math.min(48, Math.floor(280 / Math.max(rows.length, 1)))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-navy">Revenue by month</h2>
      <p className="mt-1 font-sans text-xs text-mid">Last 6 months — stacked: subscriptions (green) + session payments (blue).</p>
      <div className="mt-6 overflow-x-auto">
        <svg
          width={Math.max(320, rows.length * (barW + 16) + 40)}
          height={chartH + 48}
          className="mx-auto font-sans text-[10px] text-mid"
          role="img"
          aria-label="Monthly revenue bar chart"
        >
          {rows.map((row, i) => {
            const x = 32 + i * (barW + 16)
            const hSub = (row.sub / maxVal) * chartH
            const hBook = (row.book / maxVal) * chartH
            const baseY = 24 + chartH
            return (
              <g key={row.label}>
                <rect x={x} y={baseY - hSub - hBook} width={barW} height={hSub} rx={hBook === 0 ? 4 : 0} fill={EMERALD} />
                <rect x={x} y={baseY - hBook} width={barW} height={hBook} rx={4} fill={BLUE} />
                <text x={x + barW / 2} y={baseY + 16} textAnchor="middle" className="fill-mid">
                  {row.label}
                </text>
              </g>
            )
          })}
          <text x={8} y={24 + chartH / 2} className="fill-mid" fontSize="9">
            UGX
          </text>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-4 font-sans text-xs text-mid">
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: EMERALD }} /> Subscriptions
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: BLUE }} /> Session payments
        </span>
      </div>
    </div>
  )
}

/**
 * @param {{ stats: Record<string, unknown> | null }} props
 */
export function OperationsBar({ stats }) {
  const data = [
    { name: 'Total bookings', count: Number(stats?.totalBookings ?? 0), color: BLUE },
    { name: 'Active subscriptions', count: Number(stats?.activeSubscriptions ?? 0), color: SKY },
    { name: 'Pending tutor applications', count: Number(stats?.pendingTutorApplications ?? 0), color: GOLD },
    { name: 'Materials awaiting approval', count: Number(stats?.pendingMaterials ?? 0), color: NAVY },
  ]

  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-navy">Activity snapshot</h2>
      <p className="mt-1 font-sans text-xs text-mid">Relative scale — bookings, subscriptions, and moderation queues.</p>
      <div className="mt-6 space-y-4">
        {data.map((row) => (
          <div key={row.name}>
            <div className="mb-1 flex justify-between font-sans text-xs text-mid">
              <span>{row.name}</span>
              <span className="font-heading font-semibold text-navy">{row.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(row.count / max) * 100}%`,
                  backgroundColor: row.color,
                  minWidth: row.count > 0 ? '4px' : 0,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
