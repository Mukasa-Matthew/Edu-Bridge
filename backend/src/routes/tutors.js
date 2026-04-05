import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { patchTutorProfileBody, withdrawalBody } from '../schemas/tutors.js'
import { mapQualification, mapExperience, mapSessionMode } from '../lib/maps.js'

export default async function tutorRoutes(fastify) {
  fastify.get('/', async (request) => {
    const { subject, level, district, minRating, search, sessionMode, minPrice, maxPrice } = request.query
    const params = []
    let i = 1
    let where = `u.role = 'tutor' AND u.account_status = 'active' AND tp.tutor_status = 'approved'`
    if (subject) {
      where += ` AND (tp.primary_subject ILIKE $${i} OR tp.secondary_subject ILIKE $${i})`
      params.push(`%${subject}%`)
      i++
    }
    if (search) {
      const q = `%${search.trim()}%`
      where += ` AND (u.full_name ILIKE $${i} OR tp.primary_subject ILIKE $${i} OR COALESCE(tp.secondary_subject,'') ILIKE $${i})`
      params.push(q)
      i++
    }
    if (district) {
      where += ` AND tp.district ILIKE $${i}`
      params.push(`%${district}%`)
      i++
    }
    if (level) {
      where += ` AND $${i} = ANY(tp.teaching_levels)`
      params.push(level)
      i++
    }
    if (minRating !== undefined && minRating !== '' && !Number.isNaN(Number(minRating))) {
      where += ` AND tp.average_rating >= $${i}`
      params.push(Number(minRating))
      i++
    }
    if (sessionMode === 'online') {
      where += ` AND tp.session_mode IN ('online', 'both')`
    } else if (sessionMode === 'in_person') {
      where += ` AND tp.session_mode IN ('in_person', 'both')`
    }
    if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
      where += ` AND GREATEST(tp.group_session_rate_ugx, tp.one_on_one_rate_ugx) >= $${i}`
      params.push(Number(minPrice))
      i++
    }
    if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
      where += ` AND LEAST(tp.group_session_rate_ugx, tp.one_on_one_rate_ugx) <= $${i}`
      params.push(Number(maxPrice))
      i++
    }
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.full_name, u.email, u.profile_photo_url,
              tp.primary_subject, tp.secondary_subject, tp.teaching_levels, tp.session_mode,
              tp.group_session_rate_ugx, tp.one_on_one_rate_ugx, tp.district,
              tp.average_rating, tp.total_reviews, tp.bio, tp.current_employer,
              tp.institution_attended, tp.highest_qualification, tp.years_experience
       FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE ${where}
       ORDER BY tp.average_rating DESC NULLS LAST`,
      params
    )
    return { tutors: rows }
  })

  const tutorOnly = { preHandler: [authenticate, authorize('tutor')] }

  fastify.patch('/me', { ...tutorOnly, schema: { body: patchTutorProfileBody } }, async (request, reply) => {
    const userId = request.user.sub
    const b = request.body || {}
    try {
      await fastify.db.query(
        `UPDATE tutor_profiles SET
          bio = COALESCE($2, bio),
          primary_subject = COALESCE($3, primary_subject),
          secondary_subject = COALESCE($4, secondary_subject),
          group_session_rate_ugx = COALESCE($5, group_session_rate_ugx),
          one_on_one_rate_ugx = COALESCE($6, one_on_one_rate_ugx),
          district = COALESCE($7, district),
          institution_attended = COALESCE($8, institution_attended),
          graduation_year = COALESCE($9, graduation_year),
          current_employer = COALESCE($10, current_employer),
          updated_at = now()
        WHERE user_id = $1`,
        [
          userId,
          b.bio ?? null,
          b.primarySubject ?? null,
          b.secondarySubject ?? null,
          b.groupRateUgx ?? null,
          b.oneOnOneRateUgx ?? null,
          b.district ?? null,
          b.institution ?? null,
          b.graduationYear ?? null,
          b.currentEmployer ?? null,
        ]
      )
      if (b.qualification) {
        await fastify.db.query(
          `UPDATE tutor_profiles SET highest_qualification = $2::qualification_level, updated_at = now() WHERE user_id = $1`,
          [userId, mapQualification(b.qualification)]
        )
      }
      if (b.yearsExperience) {
        await fastify.db.query(
          `UPDATE tutor_profiles SET years_experience = $2::experience_band, updated_at = now() WHERE user_id = $1`,
          [userId, mapExperience(b.yearsExperience)]
        )
      }
      if (b.sessionMode) {
        const sm = mapSessionMode(b.sessionMode === 'in_person' ? 'inperson' : b.sessionMode)
        await fastify.db.query(
          `UPDATE tutor_profiles SET session_mode = $2::session_mode_type, updated_at = now() WHERE user_id = $1`,
          [userId, sm]
        )
      }
      if (b.teachingLevels?.length) {
        await fastify.db.query(
          `UPDATE tutor_profiles SET teaching_levels = $2::text[], updated_at = now() WHERE user_id = $1`,
          [userId, b.teachingLevels]
        )
      }
    } catch (err) {
      fastify.log.error({ err }, 'tutor profile map')
      return reply.status(400).send({ error: 'Bad Request', message: err.message })
    }
    if (b.fullName) {
      await fastify.db.query(`UPDATE users SET full_name = $2 WHERE id = $1`, [userId, b.fullName])
    }
    if (b.email) {
      try {
        await fastify.db.query(`UPDATE users SET email = $2, updated_at = now() WHERE id = $1`, [
          userId,
          b.email.toLowerCase().trim(),
        ])
      } catch (err) {
        if (err.code === '23505') {
          return reply.status(409).send({ error: 'Conflict', message: 'Email already in use' })
        }
        throw err
      }
    }
    if (b.phone) {
      await fastify.db.query(`UPDATE users SET phone = $2, updated_at = now() WHERE id = $1`, [userId, b.phone.trim()])
    }
    return reply.send({ message: 'Profile updated' })
  })

  fastify.get('/me/bookings', { ...tutorOnly }, async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT b.*, su.full_name AS student_name, su.email AS student_email
       FROM bookings b
       JOIN users su ON su.id = b.student_id
       WHERE b.tutor_id = $1
       ORDER BY b.scheduled_at DESC`,
      [userId]
    )
    return { bookings: rows }
  })

  fastify.get('/me/earnings', { ...tutorOnly }, async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT
         COALESCE(SUM(tutor_earnings) FILTER (WHERE status = 'completed'), 0)::bigint AS total_earnings_ugx,
         COALESCE(SUM(platform_fee) FILTER (WHERE status = 'completed'), 0)::bigint AS total_platform_fees_ugx,
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_count
       FROM bookings WHERE tutor_id = $1`,
      [userId]
    )
    return { summary: rows[0] }
  })

  fastify.get('/me/earnings/monthly', { ...tutorOnly }, async (request) => {
    const userId = request.user.sub
    const months = Math.min(12, Math.max(1, Number(request.query.months) || 6))
    const { rows } = await fastify.db.query(
      `SELECT
         date_trunc('month', scheduled_at) AS month,
         COALESCE(SUM(tutor_earnings) FILTER (WHERE status = 'completed'), 0)::bigint AS tutor_earnings_ugx,
         COALESCE(SUM(platform_fee) FILTER (WHERE status = 'completed'), 0)::bigint AS platform_fees_ugx,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS sessions_completed
       FROM bookings
       WHERE tutor_id = $1 AND scheduled_at >= now() - $2::interval
       GROUP BY 1
       ORDER BY 1 ASC`,
      [userId, `${months} months`]
    )
    return { monthly: rows }
  })

  fastify.post('/me/withdrawals', { ...tutorOnly, schema: { body: withdrawalBody } }, async (request, reply) => {
    const userId = request.user.sub
    const { amountUgx, method, accountDetail } = request.body
    const { rows } = await fastify.db.query(
      `INSERT INTO withdrawal_requests (tutor_id, amount_ugx, method, account_detail)
       VALUES ($1, $2, $3::payment_method_type, $4)
       RETURNING *`,
      [userId, amountUgx, method, accountDetail.trim()]
    )
    return reply.status(201).send({ withdrawal: rows[0] })
  })

  fastify.get('/me/withdrawals', { ...tutorOnly }, async (request) => {
    const userId = request.user.sub
    const { rows } = await fastify.db.query(
      `SELECT * FROM withdrawal_requests WHERE tutor_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    )
    return { withdrawals: rows }
  })

  fastify.get('/:id/reviews', async (request, reply) => {
    const { id } = request.params
    const { rows: ok } = await fastify.db.query(
      `SELECT 1 FROM users u JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'tutor' AND tp.tutor_status = 'approved'`,
      [id]
    )
    if (!ok.length) return reply.status(404).send({ error: 'Not Found' })
    const { rows } = await fastify.db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS student_name
       FROM reviews r
       JOIN users u ON u.id = r.student_id
       WHERE r.tutor_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    )
    return { reviews: rows }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params
    if (id === 'me') return reply.status(404).send({ error: 'Not Found' })
    const { rows } = await fastify.db.query(
      `SELECT u.id, u.full_name, u.email, u.profile_photo_url, tp.*
       FROM users u
       JOIN tutor_profiles tp ON tp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'tutor' AND u.account_status = 'active' AND tp.tutor_status = 'approved'`,
      [id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Tutor not found' })
    return { tutor: rows[0] }
  })
}
