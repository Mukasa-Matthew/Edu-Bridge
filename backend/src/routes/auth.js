import bcrypt from 'bcrypt'
import { registerStudentBody, registerTutorBody, loginBody, changePasswordBody } from '../schemas/auth.js'
import { authenticate } from '../middleware/authenticate.js'
import { cacheSession, deleteSession, getCachedSession } from '../lib/session.js'
import { fetchUserWithProfiles } from '../lib/user.js'
import {
  dashboardUrlForRole,
  mapEducationLevel,
  levelCategoryFromClass,
  mapQualification,
  mapExperience,
  mapSessionMode,
} from '../lib/maps.js'
import { sendWelcomeStudentEmail, sendWelcomeTutorEmail } from '../lib/mail.js'

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function cookieOpts() {
  return {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE_MS,
  }
}

export default async function authRoutes(fastify) {
  fastify.post(
    '/register/student',
    { schema: { body: registerStudentBody } },
    async (request, reply) => {
      const b = request.body
      let eduLevel
      let levelCat
      try {
        eduLevel = mapEducationLevel(b.classLevel)
        levelCat = levelCategoryFromClass(b.classLevel)
      } catch (e) {
        return reply.status(400).send({ error: 'Bad Request', message: e.message })
      }

      const hash = await bcrypt.hash(b.password, 12)
      const client = await fastify.db.getClient()
      try {
        await client.query('BEGIN')
        const {
          rows: [u],
        } = await client.query(
          `INSERT INTO users (email, phone, password_hash, role, account_status, full_name, email_verified)
           VALUES ($1, $2, $3, 'student', 'active', $4, false)
           RETURNING id, email, phone, role, account_status, full_name, email_verified, created_at`,
          [b.email.toLowerCase().trim(), b.phone.trim(), hash, b.fullName.trim()]
        )
        await client.query(
          `INSERT INTO student_profiles (
            user_id, school_name, class_level, level_category, district, physical_address,
            parent_guardian_name, parent_guardian_phone, subjects_of_interest, subscription_status
          ) VALUES ($1, $2, $3, $4::level_category, $5, $6, $7, $8, $9, 'inactive')`,
          [
            u.id,
            b.schoolName.trim(),
            eduLevel,
            levelCat,
            b.district.trim(),
            b.physicalAddress.trim(),
            b.parentGuardianName.trim(),
            b.parentGuardianPhone.trim(),
            b.subjectsOfInterest,
          ]
        )
        await client.query('COMMIT')

        const token = await reply.jwtSign(
          { sub: u.id, email: u.email, role: u.role, fullName: u.full_name },
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        )
        reply.setCookie('token', token, cookieOpts())
        await cacheSession(fastify.redis, { ...u, full_name: u.full_name })

        void sendWelcomeStudentEmail(fastify.log, { to: u.email, fullName: u.full_name })

        return reply.send({
          message: 'Registration successful',
          user: {
            id: u.id,
            email: u.email,
            phone: u.phone,
            role: u.role,
            fullName: u.full_name,
            accountStatus: u.account_status,
            emailVerified: u.email_verified,
          },
          redirectUrl: dashboardUrlForRole(u.role),
        })
      } catch (err) {
        await client.query('ROLLBACK')
        if (err.code === '23505') {
          return reply.status(409).send({ error: 'Conflict', message: 'Email or phone already registered' })
        }
        fastify.log.error({ err }, 'register student failed')
        return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not complete registration' })
      } finally {
        client.release()
      }
    }
  )

  fastify.post(
    '/register/tutor',
    { schema: { body: registerTutorBody } },
    async (request, reply) => {
      const b = request.body
      let qual, exp, sess
      try {
        qual = mapQualification(b.qualification)
        exp = mapExperience(b.experience)
        sess = mapSessionMode(b.sessionMode)
      } catch (e) {
        return reply.status(400).send({ error: 'Bad Request', message: e.message })
      }

      const hash = await bcrypt.hash(b.password, 12)
      const client = await fastify.db.getClient()
      try {
        await client.query('BEGIN')
        const {
          rows: [u],
        } = await client.query(
          `INSERT INTO users (email, phone, password_hash, role, account_status, full_name, email_verified)
           VALUES ($1, $2, $3, 'tutor', 'pending', $4, false)
           RETURNING id, email, phone, role, account_status, full_name`,
          [b.email.toLowerCase().trim(), b.phone.trim(), hash, b.fullName.trim()]
        )
        await client.query(
          `INSERT INTO tutor_profiles (
            user_id, national_id, highest_qualification, institution_attended, graduation_year,
            current_employer, years_experience, bio, primary_subject, secondary_subject,
            teaching_levels, session_mode, group_session_rate_ugx, one_on_one_rate_ugx, district, tutor_status
          ) VALUES ($1, $2, $3::qualification_level, $4, $5, $6, $7::experience_band, $8, $9, $10, $11, $12::session_mode_type, $13, $14, $15, 'pending')`,
          [
            u.id,
            b.nationalId.trim(),
            qual,
            b.institution.trim(),
            b.graduationYear,
            b.employer.trim(),
            exp,
            b.bio.trim(),
            b.primarySubject,
            b.secondarySubject?.trim() || null,
            b.teachingLevels,
            sess,
            b.groupRateUgx,
            b.oneOnOneRateUgx,
            b.district.trim(),
          ]
        )
        await client.query('COMMIT')

        void sendWelcomeTutorEmail(fastify.log, { to: u.email, fullName: u.full_name })

        return reply.status(201).send({
          message:
            'Your tutor application has been received and is under review. You will be notified within 24–48 hours once your profile is verified.',
          user: {
            id: u.id,
            email: u.email,
            role: u.role,
            accountStatus: u.account_status,
          },
        })
      } catch (err) {
        await client.query('ROLLBACK')
        if (err.code === '23505') {
          return reply.status(409).send({ error: 'Conflict', message: 'Email or phone already registered' })
        }
        fastify.log.error({ err }, 'register tutor failed')
        return reply.status(500).send({ error: 'Internal Server Error', message: 'Could not submit application' })
      } finally {
        client.release()
      }
    }
  )

  fastify.post('/login', { schema: { body: loginBody } }, async (request, reply) => {
    const { email, password } = request.body
    const { rows } = await fastify.db.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase().trim()])
    if (!rows.length) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' })
    }
    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' })
    }
    if (user.role === 'tutor') {
      const { rows: tp } = await fastify.db.query(`SELECT tutor_status FROM tutor_profiles WHERE user_id = $1`, [
        user.id,
      ])
      const status = tp[0]?.tutor_status
      if (status === 'pending' || user.account_status === 'pending') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Your tutor account is awaiting approval. Please check back after 24–48 hours.',
        })
      }
      if (status === 'rejected') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Your tutor application was not successful. Please contact support for more information.',
        })
      }
      if (status === 'suspended' || user.account_status === 'suspended') {
        return reply.status(403).send({ error: 'Forbidden', message: 'This account is suspended.' })
      }
    } else if (user.account_status !== 'active') {
      return reply.status(403).send({ error: 'Forbidden', message: 'This account is not active.' })
    }

    const token = await reply.jwtSign(
      { sub: user.id, email: user.email, role: user.role, fullName: user.full_name },
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    reply.setCookie('token', token, cookieOpts())
    await cacheSession(fastify.redis, user)

    return reply.send({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.full_name,
        accountStatus: user.account_status,
        emailVerified: user.email_verified,
      },
      role: user.role,
      redirectUrl: dashboardUrlForRole(user.role),
    })
  })

  fastify.post('/logout', async (request, reply) => {
    try {
      await request.jwtVerify()
      const sub = request.user.sub
      await deleteSession(fastify.redis, sub)
    } catch {
      /* ignore */
    }
    reply.clearCookie('token', { path: '/' })
    return reply.send({ message: 'Logged out successfully' })
  })

  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user.sub
    const hadRedisSession = Boolean(await getCachedSession(fastify.redis, userId))
    const full = await fetchUserWithProfiles(fastify.db, userId)
    if (!full) return reply.status(404).send({ error: 'Not Found', message: 'User not found' })
    if (!hadRedisSession) await cacheSession(fastify.redis, full.user)
    return reply.send({
      user: full.user,
      studentProfile: full.studentProfile,
      tutorProfile: full.tutorProfile,
    })
  })

  fastify.patch(
    '/me/password',
    { preHandler: [authenticate], schema: { body: changePasswordBody } },
    async (request, reply) => {
      const userId = request.user.sub
      const { currentPassword, newPassword } = request.body
      const { rows } = await fastify.db.query(`SELECT password_hash FROM users WHERE id = $1`, [userId])
      if (!rows.length) return reply.status(404).send({ error: 'Not Found' })
      const ok = await bcrypt.compare(currentPassword, rows[0].password_hash)
      if (!ok) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Current password is incorrect' })
      }
      const hash = await bcrypt.hash(newPassword, 12)
      await fastify.db.query(`UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`, [userId, hash])
      return reply.send({ message: 'Password updated' })
    }
  )

  fastify.delete('/me/account', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user.sub
    await deleteSession(fastify.redis, userId)
    await fastify.db.query(`DELETE FROM users WHERE id = $1`, [userId])
    reply.clearCookie('token', { path: '/' })
    return reply.send({ message: 'Account deleted' })
  })
}
