import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { mapEducationLevel, levelCategoryFromClass } from '../lib/maps.js'
import { patchStudentProfileBody, subscriptionRenewBody } from '../schemas/students.js'
import { getPlatformSettings } from '../lib/platform.js'
import { notifyUser } from '../lib/notify.js'

function randomRef(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export default async function studentRoutes(fastify) {
  fastify.addHook('preHandler', authenticate)
  fastify.addHook('preHandler', authorize('student'))

  fastify.get('/me/profile', async (request) => {
    const userId = request.user.sub
    const { rows: sp } = await fastify.db.query(`SELECT * FROM student_profiles WHERE user_id = $1`, [userId])
    const { rows: u } = await fastify.db.query(
      `SELECT id, email, phone, full_name, profile_photo_url, email_verified FROM users WHERE id = $1`,
      [userId]
    )
    return { user: u[0], profile: sp[0] || null }
  })

  fastify.patch('/me/profile', { schema: { body: patchStudentProfileBody } }, async (request, reply) => {
    const userId = request.user.sub
    const b = request.body || {}
    try {
      if (b.email) {
        await fastify.db.query(`UPDATE users SET email = $2, updated_at = now() WHERE id = $1`, [
          userId,
          b.email.toLowerCase().trim(),
        ])
      }
      if (b.phone) {
        await fastify.db.query(`UPDATE users SET phone = $2, updated_at = now() WHERE id = $1`, [userId, b.phone.trim()])
      }
      if (b.classLevel) {
        const edu = mapEducationLevel(b.classLevel)
        const cat = levelCategoryFromClass(b.classLevel)
        await fastify.db.query(
          `UPDATE student_profiles SET
            school_name = COALESCE($2, school_name),
            class_level = $3::education_level,
            level_category = $4::level_category,
            district = COALESCE($5, district),
            physical_address = COALESCE($6, physical_address),
            parent_guardian_name = COALESCE($7, parent_guardian_name),
            parent_guardian_phone = COALESCE($8, parent_guardian_phone),
            subjects_of_interest = COALESCE($9, subjects_of_interest),
            updated_at = now()
          WHERE user_id = $1`,
          [
            userId,
            b.schoolName ?? null,
            edu,
            cat,
            b.district ?? null,
            b.physicalAddress ?? null,
            b.parentGuardianName ?? null,
            b.parentGuardianPhone ?? null,
            b.subjectsOfInterest ?? null,
          ]
        )
      } else {
        await fastify.db.query(
          `UPDATE student_profiles SET
            school_name = COALESCE($2, school_name),
            district = COALESCE($3, district),
            physical_address = COALESCE($4, physical_address),
            parent_guardian_name = COALESCE($5, parent_guardian_name),
            parent_guardian_phone = COALESCE($6, parent_guardian_phone),
            subjects_of_interest = COALESCE($7, subjects_of_interest),
            updated_at = now()
          WHERE user_id = $1`,
          [
            userId,
            b.schoolName ?? null,
            b.district ?? null,
            b.physicalAddress ?? null,
            b.parentGuardianName ?? null,
            b.parentGuardianPhone ?? null,
            b.subjectsOfInterest ?? null,
          ]
        )
      }
      if (b.fullName) {
        await fastify.db.query(`UPDATE users SET full_name = $2, updated_at = now() WHERE id = $1`, [
          userId,
          b.fullName,
        ])
      }
      return reply.send({ message: 'Profile updated' })
    } catch (err) {
      if (err.code === '23505') {
        return reply.status(409).send({ error: 'Conflict', message: 'Email or phone already in use' })
      }
      fastify.log.error({ err }, 'student profile update')
      return reply.status(400).send({ error: 'Bad Request', message: err.message })
    }
  })

  fastify.get('/me/bookings', async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT b.*, tu.full_name AS tutor_name, tu.email AS tutor_email,
              r.id AS review_id, r.rating AS review_rating, r.comment AS review_comment
       FROM bookings b
       JOIN users tu ON tu.id = b.tutor_id
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE b.student_id = $1
       ORDER BY b.scheduled_at DESC`,
      [userId]
    )
    return { bookings: rows }
  })

  fastify.get('/me/payments', async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
      [userId]
    )
    return { payments: rows }
  })

  fastify.get('/me/subscription', async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT * FROM subscriptions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [userId]
    )
    const { rows: sp } = await fastify.db.query(
      `SELECT subscription_status, subscription_expires_at FROM student_profiles WHERE user_id = $1`,
      [userId]
    )
    return { subscriptions: rows, profileSubscription: sp[0] || null }
  })

  fastify.post('/me/subscription/renew', { schema: { body: subscriptionRenewBody } }, async (request, reply) => {
    const userId = request.user.sub
    const { paymentMethod, paymentReference, accountHint } = request.body
    const settings = await getPlatformSettings(fastify)
    const price = Number(settings.subscription_price_ugx)
    const ref = paymentReference?.trim() || randomRef('SUB')

    const { rows: sp } = await fastify.db.query(
      `SELECT subscription_expires_at FROM student_profiles WHERE user_id = $1`,
      [userId]
    )
    const now = new Date()
    const currentExp = sp[0]?.subscription_expires_at ? new Date(sp[0].subscription_expires_at) : null
    const base = currentExp && currentExp > now ? currentExp : now
    const expiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)

    const client = await fastify.db.getClient()
    try {
      await client.query('BEGIN')
      const {
        rows: [sub],
      } = await client.query(
        `INSERT INTO subscriptions (student_id, amount_ugx, status, start_date, expiry_date, payment_method, payment_reference)
         VALUES ($1, $2, 'active', now(), $3, $4, $5)
         RETURNING *`,
        [userId, price, expiry.toISOString(), paymentMethod, ref]
      )
      await client.query(
        `INSERT INTO payments (user_id, payment_type, amount, payment_method, payment_reference, status, subscription_id, metadata)
         VALUES ($1, 'subscription', $2, $3::payment_method_type, $4, 'completed', $5, $6::jsonb)`,
        [
          userId,
          price,
          paymentMethod,
          ref,
          sub.id,
          JSON.stringify({ accountHint: accountHint || null, simulated: true }),
        ]
      )
      await client.query(
        `UPDATE student_profiles SET subscription_status = 'active', subscription_expires_at = $2, updated_at = now() WHERE user_id = $1`,
        [userId, expiry.toISOString()]
      )
      await client.query('COMMIT')
      await notifyUser(fastify, userId, {
        type: 'subscription_renewed',
        title: 'Subscription renewed',
        body: `Your plan is active until ${expiry.toLocaleDateString()}.`,
        metadata: { subscriptionId: sub.id },
      })
      return reply.status(201).send({ subscription: sub, subscriptionExpiresAt: expiry.toISOString() })
    } catch (err) {
      await client.query('ROLLBACK')
      fastify.log.error({ err }, 'subscription renew')
      return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not renew subscription' })
    } finally {
      client.release()
    }
  })

  fastify.post('/me/subscription/cancel', async (request, reply) => {
    const userId = request.user.sub
    await fastify.db.query(
      `UPDATE student_profiles SET subscription_status = 'cancelled', updated_at = now() WHERE user_id = $1`,
      [userId]
    )
    await fastify.db.query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = now() WHERE student_id = $1 AND status = 'active'`,
      [userId]
    )
    return reply.send({ message: 'Subscription cancelled' })
  })
}
