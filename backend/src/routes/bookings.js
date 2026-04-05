import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import {
  createBookingBody,
  tutorResponseBody,
  meetingLinkBody,
  cancelBookingBody,
  reviewBody,
} from '../schemas/bookings.js'
import { getPlatformSettings, splitFees } from '../lib/platform.js'
import { notifyUser } from '../lib/notify.js'

function randomRef(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export default async function bookingRoutes(fastify) {
  fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params
    const uid = request.user.sub
    const role = request.user.role
    const { rows } = await fastify.db.query(
      `SELECT b.*,
              su.full_name AS student_name, tu.full_name AS tutor_name,
              r.id AS review_id, r.rating AS review_rating, r.comment AS review_comment
       FROM bookings b
       JOIN users su ON su.id = b.student_id
       JOIN users tu ON tu.id = b.tutor_id
       LEFT JOIN reviews r ON r.booking_id = b.id
       WHERE b.id = $1`,
      [id]
    )
    if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Booking not found' })
    const b = rows[0]
    if (role !== 'admin' && b.student_id !== uid && b.tutor_id !== uid) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Not allowed' })
    }
    return { booking: b }
  })

  fastify.post(
    '/',
    { preHandler: [authenticate, authorize('student')], schema: { body: createBookingBody } },
    async (request, reply) => {
      const b = request.body
      const {
        tutorId,
        subject,
        sessionType,
        sessionMode,
        scheduledAt,
        durationMinutes,
        amountStudentPays,
        notes,
        meetingLink,
        paymentMethod,
        paymentReference,
      } = b
      if (!tutorId || !subject || !sessionType || !sessionMode || !scheduledAt || !durationMinutes || !amountStudentPays) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Missing required booking fields' })
      }

      const { rows: tu } = await fastify.db.query(
        `SELECT u.id, tp.tutor_status FROM users u
         JOIN tutor_profiles tp ON tp.user_id = u.id
         WHERE u.id = $1 AND u.role = 'tutor' AND u.account_status = 'active' AND tp.tutor_status = 'approved'`,
        [tutorId]
      )
      if (!tu.length) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Invalid or unapproved tutor' })
      }

      const amount = Number(amountStudentPays)
      if (!Number.isInteger(amount) || amount <= 0) {
        return reply.status(400).send({ error: 'Bad Request', message: 'amountStudentPays must be a positive integer (UGX)' })
      }

      const settings = await getPlatformSettings(fastify)
      const { platformFee, tutorEarnings } = splitFees(amount, settings.platform_fee_percent)

      const studentId = request.user.sub
      const ref = paymentReference?.trim() || randomRef('BK')

      const client = await fastify.db.getClient()
      let bookingRow
      try {
        await client.query('BEGIN')
        const {
          rows: [bk],
        } = await client.query(
          `INSERT INTO bookings (
          student_id, tutor_id, subject, session_type, session_mode, scheduled_at, duration_minutes,
          amount_student_pays, platform_fee, tutor_earnings, status, notes, meeting_link
        ) VALUES ($1, $2, $3, $4::session_type_booking, $5::booking_session_mode, $6, $7, $8, $9, $10, 'pending', $11, $12)
        RETURNING *`,
          [
            studentId,
            tutorId,
            subject,
            sessionType,
            sessionMode,
            scheduledAt,
            durationMinutes,
            amount,
            platformFee,
            tutorEarnings,
            notes || null,
            meetingLink || null,
          ]
        )
        bookingRow = bk
        await client.query(
          `INSERT INTO payments (user_id, payment_type, amount, payment_method, payment_reference, status, booking_id, metadata)
           VALUES ($1, 'session_booking', $2, $3::payment_method_type, $4, 'completed', $5, $6::jsonb)`,
          [
            studentId,
            amount,
            paymentMethod,
            ref,
            bk.id,
            JSON.stringify({ simulated: true }),
          ]
        )
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        fastify.log.error({ err }, 'booking create')
        return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not create booking' })
      } finally {
        client.release()
      }

      await notifyUser(fastify, tutorId, {
        type: 'booking_request',
        title: 'New booking request',
        body: `${request.user.fullName || 'A student'} requested a session: ${subject}`,
        metadata: { bookingId: bookingRow.id },
      })

      return reply.status(201).send({ booking: bookingRow })
    }
  )

  fastify.patch(
    '/:id/tutor-response',
    { preHandler: [authenticate, authorize('tutor')], schema: { body: tutorResponseBody } },
    async (request, reply) => {
      const { id } = request.params
      const decision = request.body?.decision
      const declineReason = request.body?.declineReason?.trim() || null
      if (!['accept', 'decline'].includes(decision)) {
        return reply.status(400).send({ error: 'Bad Request', message: 'decision must be accept or decline' })
      }
      const tutorId = request.user.sub
      const status = decision === 'accept' ? 'accepted' : 'declined'
      const { rows } = await fastify.db.query(
        `UPDATE bookings SET
           status = $3::booking_status,
           decline_reason = CASE WHEN $3::text = 'declined' THEN $4 ELSE decline_reason END,
           updated_at = now()
         WHERE id = $1 AND tutor_id = $2 AND status = 'pending'
         RETURNING *`,
        [id, tutorId, status, declineReason]
      )
      if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Booking not found or not pending' })
      const booking = rows[0]
      if (status === 'accepted') {
        await notifyUser(fastify, booking.student_id, {
          type: 'booking_accepted',
          title: 'Booking confirmed',
          body: 'Your tutor accepted the session request.',
          metadata: { bookingId: booking.id },
        })
      } else {
        await notifyUser(fastify, booking.student_id, {
          type: 'booking_declined',
          title: 'Booking declined',
          body: declineReason || 'Your tutor declined this session.',
          metadata: { bookingId: booking.id },
        })
      }
      return reply.send({ booking })
    }
  )

  fastify.patch(
    '/:id/meeting-link',
    { preHandler: [authenticate, authorize('tutor')], schema: { body: meetingLinkBody } },
    async (request, reply) => {
      const { id } = request.params
      const tutorId = request.user.sub
      const meetingLink = request.body.meetingLink
      const { rows } = await fastify.db.query(
        `UPDATE bookings SET meeting_link = $3, updated_at = now()
         WHERE id = $1 AND tutor_id = $2 AND status = 'accepted'
         RETURNING *`,
        [id, tutorId, meetingLink]
      )
      if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Booking not found' })
      const booking = rows[0]
      await notifyUser(fastify, booking.student_id, {
        type: 'meeting_link',
        title: 'Meeting link added',
        body: 'Your tutor added a link for your online session.',
        metadata: { bookingId: booking.id },
      })
      return reply.send({ booking })
    }
  )

  fastify.patch(
    '/:id/cancel',
    { preHandler: [authenticate, authorize('student')], schema: { body: cancelBookingBody } },
    async (request, reply) => {
      const { id } = request.params
      const studentId = request.user.sub
      const reason = request.body?.reason?.trim() || null
      const { rows } = await fastify.db.query(
        `UPDATE bookings SET
           status = 'cancelled'::booking_status,
           cancelled_at = now(),
           cancelled_by = $2,
           cancellation_reason = $3,
           updated_at = now()
         WHERE id = $1 AND student_id = $2
           AND status IN ('pending', 'accepted')
           AND (
             status = 'pending'
             OR scheduled_at > now() + interval '24 hours'
           )
         RETURNING *`,
        [id, studentId, reason]
      )
      if (!rows.length) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Cannot cancel this booking (too close to session time or invalid status).',
        })
      }
      const booking = rows[0]
      await notifyUser(fastify, booking.tutor_id, {
        type: 'booking_cancelled',
        title: 'Session cancelled',
        body: `A student cancelled: ${booking.subject}`,
        metadata: { bookingId: booking.id },
      })
      return reply.send({ booking })
    }
  )

  fastify.patch(
    '/:id/complete',
    { preHandler: [authenticate, authorize('tutor')] },
    async (request, reply) => {
      const { id } = request.params
      const tutorId = request.user.sub
      const { rows } = await fastify.db.query(
        `UPDATE bookings SET status = 'completed'::booking_status, updated_at = now()
         WHERE id = $1 AND tutor_id = $2 AND status = 'accepted'
         RETURNING *`,
        [id, tutorId]
      )
      if (!rows.length) return reply.status(404).send({ error: 'Not Found', message: 'Booking not found' })
      const booking = rows[0]
      await notifyUser(fastify, booking.student_id, {
        type: 'session_completed',
        title: 'Session completed',
        body: 'Leave a review for your tutor when you have a moment.',
        metadata: { bookingId: booking.id, tutorId: booking.tutor_id },
      })
      return reply.send({ booking })
    }
  )

  fastify.post(
    '/:id/review',
    { preHandler: [authenticate, authorize('student')], schema: { body: reviewBody } },
    async (request, reply) => {
      const { id } = request.params
      const { rating, comment } = request.body || {}
      const r = Number(rating)
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return reply.status(400).send({ error: 'Bad Request', message: 'rating must be an integer 1–5' })
      }
      const studentId = request.user.sub

      const { rows: bk } = await fastify.db.query(
        `SELECT * FROM bookings WHERE id = $1 AND student_id = $2 AND status = 'completed'`,
        [id, studentId]
      )
      if (!bk.length) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Completed booking not found' })
      }
      const b = bk[0]

      const client = await fastify.db.getClient()
      try {
        await client.query('BEGIN')
        await client.query(
          `INSERT INTO reviews (booking_id, student_id, tutor_id, rating, comment)
           VALUES ($1, $2, $3, $4, $5)`,
          [b.id, studentId, b.tutor_id, r, comment || null]
        )
        await client.query(
          `UPDATE tutor_profiles SET
            total_reviews = (SELECT COUNT(*)::int FROM reviews WHERE tutor_id = $1),
            average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE tutor_id = $1), 0),
            updated_at = now()
          WHERE user_id = $1`,
          [b.tutor_id]
        )
        await client.query('COMMIT')
        await notifyUser(fastify, b.tutor_id, {
          type: 'new_review',
          title: 'New review',
          body: `You received a ${r}-star review.`,
          metadata: { bookingId: b.id },
        })
        return reply.status(201).send({ message: 'Review submitted' })
      } catch (err) {
        await client.query('ROLLBACK')
        if (err.code === '23505') {
          return reply.status(409).send({ error: 'Conflict', message: 'This booking already has a review' })
        }
        fastify.log.error({ err }, 'review insert')
        return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not save review' })
      } finally {
        client.release()
      }
    }
  )
}
