import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import bcrypt from 'bcrypt'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '..', 'migrations')

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)
}

async function isApplied(client, filename) {
  const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [filename])
  return rows.length > 0
}

async function recordMigration(client, filename) {
  await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
}

async function seedAdmin(client) {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase()
  const plainPassword = process.env.ADMIN_SEED_PASSWORD
  const fullName = process.env.ADMIN_SEED_FULL_NAME?.trim() || 'Platform Admin'
  const phone = process.env.ADMIN_SEED_PHONE?.trim() || '+256700000000'

  if (!email || !plainPassword) {
    console.warn(
      '[migrate] Skipping admin seed: set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in backend/.env (never commit real values to git).'
    )
    return
  }

  const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [email])
  if (rows.length > 0) {
    console.log('[migrate] Admin user already exists, skipping seed.')
    return
  }
  const passwordHash = await bcrypt.hash(plainPassword, 12)
  await client.query(
    `INSERT INTO users (email, phone, password_hash, role, account_status, full_name, email_verified)
     VALUES ($1, $2, $3, 'admin', 'active', $4, true)`,
    [email, phone, passwordHash, fullName]
  )
  console.log(`[migrate] Seeded admin user (${fullName}, ${email}).`)
}

async function run() {
  const { Client } = pg
  const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  const client = new Client({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl,
  })

  await client.connect()
  console.log('[migrate] Connected to PostgreSQL.')

  try {
    await ensureMigrationsTable(client)

    const files = (await fs.readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (await isApplied(client, file)) {
        console.log(`[migrate] Skipped (already applied): ${file}`)
        continue
      }

      if (file === '009_seed_admin.sql') {
        await seedAdmin(client)
        await recordMigration(client, file)
        console.log(`[migrate] Applied: ${file} (programmatic seed)`)
        continue
      }

      const fullPath = path.join(migrationsDir, file)
      const sql = await fs.readFile(fullPath, 'utf8')
      const trimmed = sql.replace(/^\uFEFF/, '').trim()
      if (!trimmed) {
        await recordMigration(client, file)
        console.log(`[migrate] Applied: ${file} (empty)`)
        continue
      }

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await recordMigration(client, file)
        await client.query('COMMIT')
        console.log(`[migrate] Applied: ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error(`[migrate] Failed on ${file}:`, err.message)
        process.exitCode = 1
        throw err
      }
    }

    console.log('[migrate] All migrations finished.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('[migrate] Fatal:', err)
  process.exit(1)
})
