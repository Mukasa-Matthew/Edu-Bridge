import nodemailer from 'nodemailer'

export function isEmailEnabled() {
  return String(process.env.EMAIL_ENABLED || '').toLowerCase() === 'true'
}

function getTransporter() {
  const host = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST
  const port = Number(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587)
  const user = process.env.BREVO_SMTP_USER || process.env.BREVO_SMTP_LOGIN || process.env.SMTP_USER
  const pass = process.env.BREVO_SMTP_PASS || process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

function fromAddress() {
  const addr = (
    process.env.EMAIL_SENDER_WELCOME ||
    process.env.EMAIL_SENDER_SUPPORT ||
    process.env.BREVO_SMTP_LOGIN ||
    ''
  ).trim()
  const name = (process.env.EMAIL_SENDER_NAME || 'EduBridge').trim()
  if (!addr) return null
  return name ? `"${name.replace(/"/g, '')}" <${addr}>` : addr
}

const supportEmail = () =>
  (process.env.EMAIL_SENDER_SUPPORT || process.env.EMAIL_SENDER_WELCOME || '').trim() || 'support@example.com'

const appUrl = () => (process.env.FRONTEND_URL || '').replace(/\/$/, '') || 'http://localhost:5173'

/**
 * Fire-and-forget friendly: never throws to callers; logs on failure.
 * @param {{ warn?: Function, error?: Function }} log
 */
export async function sendWelcomeStudentEmail(log, { to, fullName }) {
  if (!isEmailEnabled()) return
  const transport = getTransporter()
  const from = fromAddress()
  if (!transport || !from) {
    log?.warn?.('[mail] EMAIL_ENABLED=true but SMTP (host/user/pass) or sender address is missing')
    return
  }
  const first = String(fullName || 'there').trim().split(/\s+/)[0] || 'there'
  const subject = 'Welcome to EduBridge — your learning journey starts here'
  const text = `Hi ${first},

Welcome to EduBridge! We're glad you joined our community of students preparing for success.

Here's what you can do next:
• Complete your profile and explore study materials for your level (with an active subscription).
• Find verified tutors for one-on-one or group sessions.
• Manage bookings and subscriptions from your student dashboard.

Log in anytime: ${appUrl()}/login

Questions? Reply to this email or write us at ${supportEmail()}.

Study well,
The EduBridge Team`

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1e293b;max-width:560px;">
  <p>Hi ${escapeHtml(first)},</p>
  <p><strong>Welcome to EduBridge!</strong> We're glad you joined our community of students.</p>
  <p><strong>What to do next</strong></p>
  <ul>
    <li>Explore study materials matched to your level (subscription required to read in the app).</li>
    <li>Find verified tutors for online or in-person sessions.</li>
    <li>Use your dashboard to manage bookings and your subscription.</li>
  </ul>
  <p><a href="${escapeHtml(appUrl())}/login" style="color:#2563eb;">Log in to your dashboard</a></p>
  <p style="font-size:14px;color:#64748b;">Questions? Contact us at <a href="mailto:${escapeHtml(supportEmail())}">${escapeHtml(supportEmail())}</a>.</p>
  <p>— The EduBridge Team</p>
</body></html>`

  const replyTo = supportEmail()
  try {
    await transport.sendMail({ from, to, replyTo, subject, text, html })
    log?.info?.({ to }, '[mail] welcome student sent')
  } catch (err) {
    log?.error?.({ err, to }, '[mail] welcome student failed')
  }
}

export async function sendWelcomeTutorEmail(log, { to, fullName }) {
  if (!isEmailEnabled()) return
  const transport = getTransporter()
  const from = fromAddress()
  if (!transport || !from) {
    log?.warn?.('[mail] EMAIL_ENABLED=true but SMTP or sender address is missing')
    return
  }
  const first = String(fullName || 'there').trim().split(/\s+/)[0] || 'there'
  const subject = 'We received your EduBridge tutor application'
  const text = `Hi ${first},

Thank you for applying to teach on EduBridge!

Our team will review your profile and qualifications. This usually takes about 24–48 hours. You'll be able to sign in once your account is approved.

While you wait:
• Keep an eye on your email for updates.
• Prepare any documents we might request.
• Think about how you'd like to present your subjects and availability on the platform.

Dashboard (after approval): ${appUrl()}/login

If you have questions, contact us at ${supportEmail()}.

We're excited about the possibility of working with you,
The EduBridge Team`

  const html = `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1e293b;max-width:560px;">
  <p>Hi ${escapeHtml(first)},</p>
  <p>Thank you for applying to teach on <strong>EduBridge</strong>.</p>
  <p>Our team will review your profile. You can typically expect a decision within <strong>24–48 hours</strong>. You'll receive another email when your account is approved and you can sign in to your tutor dashboard.</p>
  <p><strong>While you wait</strong></p>
  <ul>
    <li>Watch your inbox for messages from us.</li>
    <li>Have your qualifications and bio details ready if we follow up.</li>
  </ul>
  <p><a href="${escapeHtml(appUrl())}/login" style="color:#2563eb;">Go to login</a> (available after approval)</p>
  <p style="font-size:14px;color:#64748b;">Questions? <a href="mailto:${escapeHtml(supportEmail())}">${escapeHtml(supportEmail())}</a></p>
  <p>— The EduBridge Team</p>
</body></html>`

  const replyTo = supportEmail()
  try {
    await transport.sendMail({ from, to, replyTo, subject, text, html })
    log?.info?.({ to }, '[mail] welcome tutor sent')
  } catch (err) {
    log?.error?.({ err, to }, '[mail] welcome tutor failed')
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
