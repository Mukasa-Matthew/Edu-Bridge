export async function getPlatformSettings(fastify) {
  const { rows } = await fastify.db.query(`SELECT * FROM platform_settings WHERE id = 1`)
  if (!rows.length) {
    return {
      platform_fee_percent: 20,
      subscription_price_ugx: 10000,
      max_upload_bytes: 10485760,
      allowed_file_types: 'pdf,doc,docx',
    }
  }
  return rows[0]
}

export function splitFees(amountUgx, feePercent) {
  const p = Math.min(100, Math.max(0, Number(feePercent) || 20))
  const platformFee = Math.floor((amountUgx * p) / 100)
  const tutorEarnings = amountUgx - platformFee
  return { platformFee, tutorEarnings, feePercent: p }
}
