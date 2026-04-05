export async function fetchUserWithProfiles(db, userId) {
  const { rows: urows } = await db.query(
    `SELECT id, email, phone, role, account_status, full_name, profile_photo_url, email_verified, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  )
  if (!urows.length) return null
  const user = urows[0]

  let studentProfile = null
  let tutorProfile = null

  if (user.role === 'student') {
    const { rows } = await db.query(`SELECT * FROM student_profiles WHERE user_id = $1`, [userId])
    studentProfile = rows[0] || null
  }
  if (user.role === 'tutor') {
    const { rows } = await db.query(`SELECT * FROM tutor_profiles WHERE user_id = $1`, [userId])
    tutorProfile = rows[0] || null
  }

  return { user, studentProfile, tutorProfile }
}
