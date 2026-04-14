import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { listUsersQuery } from '../schemas/admin.js'
import { getPlatformSettings } from '../lib/platform.js'
import { notifyUser } from '../lib/notify.js'
import { readUploadFile, mimeForMaterialFileType } from '../lib/materialFile.js'

async function fetchWebsiteTrafficStats(db) {
  const { rows: tableRows } = await db.query(
    `SELECT to_regclass('public.website_page_analytics_daily') AS table_name`
  )
  if (!tableRows[0]?.table_name) {
    return {
      pageViews30d: 0,
      uniqueVisitors30d: 0,
      avgBounceRate30d: 0,
      avgSessionSeconds30d: 0,
      topPages: [],
      dailyTrend: [],
    }
  }

  const { rows: summaryRows } = await db.query(
    `SELECT
       COALESCE(SUM(page_views), 0)::bigint AS views_30d,
       COALESCE(SUM(unique_visitors), 0)::bigint AS visitors_30d,
       COALESCE(AVG(bounce_rate_percent), 0)::numeric(5,2) AS bounce_30d,
       COALESCE(AVG(avg_session_seconds), 0)::numeric(10,2) AS session_seconds_30d
     FROM website_page_analytics_daily
     WHERE day >= current_date - interval '30 days'`
  )

  const { rows: topPageRows } = await db.query(
    `SELECT
       page_path,
       COALESCE(SUM(page_views), 0)::bigint AS page_views,
       COALESCE(SUM(unique_visitors), 0)::bigint AS unique_visitors
     FROM website_page_analytics_daily
     WHERE day >= current_date - interval '30 days'
     GROUP BY page_path
     ORDER BY page_views DESC, unique_visitors DESC
     LIMIT 5`
  )

  const { rows: dailyRows } = await db.query(
    `SELECT
       day,
       COALESCE(SUM(page_views), 0)::bigint AS page_views,
       COALESCE(SUM(unique_visitors), 0)::bigint AS unique_visitors
     FROM website_page_analytics_daily
     WHERE day >= current_date - interval '14 days'
     GROUP BY day
     ORDER BY day ASC`
  )

  return {
    pageViews30d: Number(summaryRows[0]?.views_30d || 0),
    uniqueVisitors30d: Number(summaryRows[0]?.visitors_30d || 0),
    avgBounceRate30d: Number(summaryRows[0]?.bounce_30d || 0),
    avgSessionSeconds30d: Math.round(Number(summaryRows[0]?.session_seconds_30d || 0)),
    topPages: topPageRows.map((r) => ({
      pagePath: r.page_path,
      pageViews: Number(r.page_views || 0),
      uniqueVisitors: Number(r.unique_visitors || 0),
    })),
    dailyTrend: dailyRows.map((r) => ({
      day: r.day,
      pageViews: Number(r.page_views || 0),
      uniqueVisitors: Number(r.unique_visitors || 0),
    })),
  }
}

export default async function adminRoutes(fastify) {
  fastify.addHook('preHandler', authenticate)
  fastify.addHook('preHandler', authorize('admin'))

  fastify.get('/settings/platform', async () => {
    const s = await getPlatformSettings(fastify)
    return { settings: s }
  })

  fastify.patch('/settings/platform', async (request, reply) => {
    const b = request.body || {}
    const { rows } = await fastify.db.query(
      `UPDATE platform_settings SET
        platform_fee_percent = COALESCE($2, platform_fee_percent),
        subscription_price_ugx = COALESCE($3, subscription_price_ugx),
        max_upload_bytes = COALESCE($4, max_upload_bytes),
        allowed_file_types = COALESCE($5, allowed_file_types),
        updated_at = now()
       WHERE id = 1
       RETURNING *`,
      [
        1,
        b.platformFeePercent != null ? Number(b.platformFeePercent) : null,
        b.subscriptionPriceUgx != null ? Number(b.subscriptionPriceUgx) : null,
        b.maxUploadBytes != null ? Number(b.maxUploadBytes) : null,
        b.allowedFileTypes ?? null,
      ]
    )
    if (!rows.length) return reply.status(500).send({ error: 'Settings row missing' })
    return { settings: rows[0] }
  })

  fastify.post('/notifications/broadcast', async (request, reply) => {
    const { audience, title, message } = request.body || {}
    if (!title || !message) {
      return reply.status(400).send({ error: 'Bad Request', message: 'title and message required' })
    }
    let userIds = []
    if (audience === 'all_students') {
      const { rows } = await fastify.db.query(`SELECT id FROM users WHERE role = 'student'`)
      userIds = rows.map((r) => r.id)
    } else if (audience === 'all_tutors') {
      const { rows } = await fastify.db.query(`SELECT id FROM users WHERE role = 'tutor'`)
      userIds = rows.map((r) => r.id)
    } else if (audience === 'user' && request.body.userId) {
      userIds = [request.body.userId]
    } else {
      return reply.status(400).send({ error: 'Bad Request', message: 'Invalid audience' })
    }
    for (const uid of userIds) {
      await notifyUser(fastify, uid, {
        type: 'admin_broadcast',
        title,
        body: message,
        metadata: {},
      })
    }
    return reply.send({ sent: userIds.length })
  })

  fastify.get('/tutors/pending', async () => {
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.email, u.phone, u.full_name, u.created_at, tp.*
       FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE u.role = 'tutor' AND tp.tutor_status = 'pending'
       ORDER BY u.created_at ASC`
    )
    return { applications: rows }
  })

  fastify.get('/tutors/by-status', async (request) => {
    const status = request.query.status || 'pending'
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.email, u.phone, u.full_name, u.account_status, u.created_at, tp.*
       FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE u.role = 'tutor' AND tp.tutor_status = $1::tutor_approval_status
       ORDER BY u.created_at DESC
       LIMIT 500`,
      [status]
    )
    return { tutors: rows }
  })

  fastify.post('/tutors/:id/approve', async (request, reply) => {
    const { id } = request.params
    const client = await fastify.db.getClient()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        `UPDATE tutor_profiles SET tutor_status = 'approved', rejection_reason = NULL, updated_at = now() WHERE user_id = $1 AND tutor_status = 'pending' RETURNING user_id`,
        [id]
      )
      if (!rows.length) {
        await client.query('ROLLBACK')
        return reply.status(404).send({ error: 'Not Found', message: 'Pending application not found' })
      }
      await client.query(`UPDATE users SET account_status = 'active', updated_at = now() WHERE id = $1`, [id])
      await client.query('COMMIT')
      await notifyUser(fastify, id, {
        type: 'tutor_approved',
        title: 'Application approved',
        body: 'Your tutor profile is now live. Students can book you.',
        metadata: {},
      })
      return reply.send({ message: 'Tutor approved' })
    } catch (err) {
      await client.query('ROLLBACK')
      fastify.log.error({ err }, 'approve tutor')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not approve tutor' })
    } finally {
      client.release()
    }
  })

  fastify.post('/tutors/:id/reject', async (request, reply) => {
    const { id } = request.params
    const reason = request.body?.reason?.trim() || null
    const client = await fastify.db.getClient()
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        `UPDATE tutor_profiles SET tutor_status = 'rejected', rejection_reason = $2, updated_at = now() WHERE user_id = $1 AND tutor_status = 'pending' RETURNING user_id`,
        [id, reason]
      )
      if (!rows.length) {
        await client.query('ROLLBACK')
        return reply.status(404).send({ error: 'Not Found', message: 'Pending application not found' })
      }
      await client.query(`UPDATE users SET account_status = 'suspended', updated_at = now() WHERE id = $1`, [id])
      await client.query('COMMIT')
      await notifyUser(fastify, id, {
        type: 'tutor_rejected',
        title: 'Application update',
        body: reason || 'Your tutor application was not approved.',
        metadata: {},
      })
      return reply.send({ message: 'Tutor application rejected' })
    } catch (err) {
      await client.query('ROLLBACK')
      fastify.log.error({ err }, 'reject tutor')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not reject tutor' })
    } finally {
      client.release()
    }
  })

  fastify.post('/tutors/:id/suspend', async (request, reply) => {
    const { id } = request.params
    await fastify.db.query(
      `UPDATE tutor_profiles SET tutor_status = 'suspended', updated_at = now() WHERE user_id = $1`,
      [id]
    )
    await fastify.db.query(`UPDATE users SET account_status = 'suspended', updated_at = now() WHERE id = $1`, [id])
    await notifyUser(fastify, id, {
      type: 'account_warning',
      title: 'Account suspended',
      body: 'Your tutor account has been suspended. Contact support for details.',
      metadata: {},
    })
    return reply.send({ message: 'Suspended' })
  })

  fastify.post('/tutors/:id/reactivate', async (request, reply) => {
    const { id } = request.params
    await fastify.db.query(
      `UPDATE tutor_profiles SET tutor_status = 'approved', updated_at = now() WHERE user_id = $1`,
      [id]
    )
    await fastify.db.query(`UPDATE users SET account_status = 'active', updated_at = now() WHERE id = $1`, [id])
    return reply.send({ message: 'Reactivated' })
  })

  fastify.post('/tutors/:id/reconsider', async (request, reply) => {
    const { id } = request.params
    const { rows } = await fastify.db.query(
      `UPDATE tutor_profiles SET tutor_status = 'pending', rejection_reason = NULL, updated_at = now()
       WHERE user_id = $1 AND tutor_status = 'rejected' RETURNING user_id`,
      [id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
    await fastify.db.query(`UPDATE users SET account_status = 'pending', updated_at = now() WHERE id = $1`, [id])
    return reply.send({ message: 'Moved to pending' })
  })

  fastify.get('/materials/pending', async () => {
    const { rows } = await fastify.db.query(
      `SELECT m.*, u.full_name AS uploader_name, u.email AS uploader_email
       FROM materials m
       JOIN users u ON u.id = m.uploaded_by
       WHERE m.approval_status = 'pending'
       ORDER BY m.created_at ASC`
    )
    return { materials: rows }
  })

  fastify.get('/materials/by-status', async (request) => {
    const status = request.query.status || 'pending'
    const { rows } = await fastify.db.query(
      `SELECT m.*, u.full_name AS uploader_name FROM materials m
       JOIN users u ON u.id = m.uploaded_by
       WHERE m.approval_status = $1::material_approval_status
       ORDER BY m.created_at DESC LIMIT 500`,
      [status]
    )
    return { materials: rows }
  })

  fastify.post('/materials/:id/approve', async (request, reply) => {
    const { id } = request.params
    const { rows } = await fastify.db.query(
      `UPDATE materials SET approval_status = 'approved', rejection_reason = NULL, updated_at = now() WHERE id = $1 AND approval_status = 'pending' RETURNING id, uploaded_by`,
      [id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Pending material not found' })
    await notifyUser(fastify, rows[0].uploaded_by, {
      type: 'material_approved',
      title: 'Material approved',
      body: 'Your upload was approved and is now visible to students.',
      metadata: { materialId: id },
    })
    return reply.send({ message: 'Material approved' })
  })

  fastify.post('/materials/:id/reject', async (request, reply) => {
    const { id } = request.params
    const reason = request.body?.reason?.trim() || null
    const { rows } = await fastify.db.query(
      `UPDATE materials SET approval_status = 'rejected', rejection_reason = $2, updated_at = now() WHERE id = $1 AND approval_status = 'pending' RETURNING id, uploaded_by`,
      [id, reason]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Pending material not found' })
    await notifyUser(fastify, rows[0].uploaded_by, {
      type: 'material_rejected',
      title: 'Material needs changes',
      body: reason || 'Your upload was not approved.',
      metadata: { materialId: id },
    })
    return reply.send({ message: 'Material rejected' })
  })

  fastify.post('/materials/:id/reconsider', async (request, reply) => {
    const { id } = request.params
    const { rows } = await fastify.db.query(
      `UPDATE materials SET approval_status = 'pending', rejection_reason = NULL, updated_at = now()
       WHERE id = $1 AND approval_status = 'rejected' RETURNING id`,
      [id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
    return reply.send({ message: 'Moved to pending' })
  })

  /** Preview any material file (pending, rejected, or approved) — streamed; does not increment download_count. */
  fastify.get('/materials/:id/file', async (request, reply) => {
    const { id } = request.params
    const { rows } = await fastify.db.query(
      `SELECT file_url, file_name, file_type FROM materials WHERE id = $1`,
      [id]
    )
    if (!rows.length || !rows[0].file_url) {
      return reply.status(404).send({ error: 'Not Found', message: 'File not available' })
    }
    const mat = rows[0]
    try {
      const { buf } = await readUploadFile(fastify.uploadRoot, mat.file_url)
      const name = (mat.file_name || 'material').replace(/[^\w.\- ()]/g, '_')
      reply
        .type(mimeForMaterialFileType(mat.file_type))
        .header('Content-Disposition', `inline; filename="${name}"`)
        .header('Cache-Control', 'private, no-store')
        .send(buf)
    } catch (e) {
      if (e.statusCode === 400) {
        return reply.status(400).send({ error: 'Bad Request', message: e.message })
      }
      fastify.log.error({ err: e }, 'admin material file')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not read file' })
    }
  })

  fastify.get('/bookings', async (request) => {
    const { status, from, to } = request.query
    const params = []
    let i = 1
    let where = '1=1'
    if (status) {
      where += ` AND b.status = $${i}::booking_status`
      params.push(status)
      i++
    }
    if (from) {
      where += ` AND b.scheduled_at >= $${i}::timestamptz`
      params.push(from)
      i++
    }
    if (to) {
      where += ` AND b.scheduled_at <= $${i}::timestamptz`
      params.push(to)
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT b.*, su.full_name AS student_name, tu.full_name AS tutor_name
       FROM bookings b
       JOIN users su ON su.id = b.student_id
       JOIN users tu ON tu.id = b.tutor_id
       WHERE ${where}
       ORDER BY b.scheduled_at DESC
       LIMIT 500`,
      params
    )
    return { bookings: rows }
  })

  fastify.patch('/bookings/:id/status', async (request, reply) => {
    const { id } = request.params
    const status = request.body?.status
    if (!['completed', 'cancelled', 'accepted'].includes(status)) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Invalid status' })
    }
    const { rows } = await fastify.db.query(
      `UPDATE bookings SET status = $2::booking_status, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
    return { booking: rows[0] }
  })

  fastify.get('/payments', async (request) => {
    const { type, status } = request.query
    const params = []
    let i = 1
    let where = '1=1'
    if (type) {
      where += ` AND p.payment_type = $${i}::payment_type`
      params.push(type)
      i++
    }
    if (status) {
      where += ` AND p.status = $${i}::payment_status`
      params.push(status)
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT p.*, u.full_name AS user_name, u.role AS user_role
       FROM payments p
       JOIN users u ON u.id = p.user_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT 500`,
      params
    )
    return { payments: rows }
  })

  fastify.post('/subscriptions/:id/extend', async (request, reply) => {
    const { id } = request.params
    const days = Number(request.body?.days) || 30
    const { rows } = await fastify.db.query(
      `UPDATE subscriptions SET expiry_date = expiry_date + ($2::int * interval '1 day'), updated_at = now()
       WHERE id = $1 AND status = 'active'
       RETURNING *`,
      [id, days]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
    const sub = rows[0]
    await fastify.db.query(
      `UPDATE student_profiles SET subscription_expires_at = $2, updated_at = now() WHERE user_id = $1`,
      [sub.student_id, sub.expiry_date]
    )
    return { subscription: sub }
  })

  fastify.get('/students', async (request) => {
    const { q, district, subscription } = request.query
    const params = []
    let i = 1
    let where = `u.role = 'student'`
    if (q) {
      where += ` AND (u.full_name ILIKE $${i} OR u.email ILIKE $${i} OR sp.school_name ILIKE $${i})`
      params.push(`%${q}%`)
      i++
    }
    if (district) {
      where += ` AND sp.district ILIKE $${i}`
      params.push(`%${district}%`)
      i++
    }
    if (subscription) {
      where += ` AND sp.subscription_status = $${i}::subscription_status`
      params.push(subscription)
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.email, u.phone, u.full_name, u.created_at, u.account_status, sp.*
       FROM users u
       JOIN student_profiles sp ON sp.user_id = u.id
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT 500`,
      params
    )
    return { students: rows }
  })

  fastify.get('/tutors/manage', async (request) => {
    const { q, subject, district, status } = request.query
    const params = []
    let i = 1
    let where = `u.role = 'tutor'`
    if (q) {
      where += ` AND (u.full_name ILIKE $${i} OR u.email ILIKE $${i})`
      params.push(`%${q}%`)
      i++
    }
    if (subject) {
      where += ` AND (tp.primary_subject ILIKE $${i} OR tp.secondary_subject ILIKE $${i})`
      params.push(`%${subject}%`)
      i++
    }
    if (district) {
      where += ` AND tp.district ILIKE $${i}`
      params.push(`%${district}%`)
      i++
    }
    if (status) {
      where += ` AND tp.tutor_status = $${i}::tutor_approval_status`
      params.push(status)
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.email, u.phone, u.full_name, u.created_at, tp.*
       FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT 500`,
      params
    )
    return { tutors: rows }
  })

  fastify.post('/users/:id/suspend', async (request, reply) => {
    const { id } = request.params
    await fastify.db.query(`UPDATE users SET account_status = 'suspended', updated_at = now() WHERE id = $1`, [id])
    return reply.send({ message: 'Suspended' })
  })

  fastify.delete('/users/:id', async (request, reply) => {
    const { id } = request.params
    await fastify.db.query(`DELETE FROM users WHERE id = $1`, [id])
    return reply.send({ message: 'Deleted' })
  })

  fastify.get('/stats', async () => {
    const { rows: u } = await fastify.db.query(`SELECT COUNT(*)::int AS c FROM users`)
    const { rows: stu } = await fastify.db.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'student'`)
    const { rows: tut } = await fastify.db.query(
      `SELECT COUNT(*)::int AS c FROM tutor_profiles WHERE tutor_status = 'approved'`
    )
    const { rows: tutPen } = await fastify.db.query(
      `SELECT COUNT(*)::int AS c FROM tutor_profiles WHERE tutor_status = 'pending'`
    )
    const { rows: sub } = await fastify.db.query(
      `SELECT COUNT(*)::int AS c FROM subscriptions WHERE status = 'active'`
    )
    const { rows: bk } = await fastify.db.query(`SELECT COUNT(*)::int AS c FROM bookings`)
    const { rows: matPen } = await fastify.db.query(
      `SELECT COUNT(*)::int AS c FROM materials WHERE approval_status = 'pending'`
    )
    const { rows: rev } = await fastify.db.query(
      `SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'completed' AND payment_type = 'subscription'), 0)::bigint AS sub_rev
       FROM payments`
    )
    const { rows: pf } = await fastify.db.query(
      `SELECT COALESCE(SUM(platform_fee), 0)::bigint AS platform_from_bookings
       FROM bookings WHERE status = 'completed'`
    )
    const subRev = rev[0]?.sub_rev ?? 0
    const platformFromBookings = pf[0]?.platform_from_bookings ?? 0
    const settings = await getPlatformSettings(fastify)
    const websiteTraffic = await fetchWebsiteTrafficStats(fastify.db)
    return {
      totalUsers: u[0].c,
      totalStudents: stu[0].c,
      approvedTutors: tut[0].c,
      pendingTutorApplications: tutPen[0].c,
      activeSubscriptions: sub[0].c,
      totalBookings: bk[0].c,
      pendingMaterials: matPen[0].c,
      totalRevenueUgx: Number(subRev) + Number(platformFromBookings),
      subscriptionRevenueUgx: subRev,
      platformBookingFeesUgx: platformFromBookings,
      platformFeePercent: settings.platform_fee_percent,
      websiteTraffic,
    }
  })

  fastify.get('/stats/revenue-monthly', async () => {
    const { rows } = await fastify.db.query(
      `SELECT date_trunc('month', created_at) AS month,
              COALESCE(SUM(amount) FILTER (WHERE payment_type = 'subscription' AND status = 'completed'), 0)::bigint AS subscription_ugx,
              COALESCE(SUM(amount) FILTER (WHERE payment_type = 'session_booking' AND status = 'completed'), 0)::bigint AS bookings_ugx
       FROM payments
       WHERE created_at >= now() - interval '6 months'
       GROUP BY 1 ORDER BY 1 ASC`
    )
    return { monthly: rows }
  })

  fastify.get('/activity', async () => {
    const { rows: reg } = await fastify.db.query(
      `SELECT u.id, u.full_name, u.role, u.created_at FROM users u ORDER BY u.created_at DESC LIMIT 8`
    )
    const { rows: bk } = await fastify.db.query(
      `SELECT b.id, b.created_at, b.subject, su.full_name AS student_name, tu.full_name AS tutor_name
       FROM bookings b
       JOIN users su ON su.id = b.student_id
       JOIN users tu ON tu.id = b.tutor_id
       ORDER BY b.created_at DESC LIMIT 8`
    )
    const { rows: mat } = await fastify.db.query(
      `SELECT m.id, m.title, m.created_at, u.full_name AS uploader_name
       FROM materials m JOIN users u ON u.id = m.uploaded_by
       ORDER BY m.created_at DESC LIMIT 8`
    )
    return { recentRegistrations: reg, recentBookings: bk, recentMaterials: mat }
  })

  fastify.get('/users', { schema: { querystring: listUsersQuery } }, async (request) => {
    const { role, status } = request.query
    const params = []
    let i = 1
    let where = '1=1'
    if (role) {
      where += ` AND u.role = $${i}::user_role`
      params.push(role)
      i++
    }
    if (status) {
      where += ` AND u.account_status = $${i}::account_status`
      params.push(status)
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.email, u.phone, u.role, u.account_status, u.full_name, u.email_verified, u.created_at
       FROM users u
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT 500`,
      params
    )
    return { users: rows }
  })
}
