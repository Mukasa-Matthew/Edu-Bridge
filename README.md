# EduBridge

**EduBridge** is a full-stack education platform for Uganda: students connect with verified tutors for UNEB preparation, access study materials, and book group or one-to-one sessions. The product includes student, tutor, and admin dashboards, payments-oriented flows, and a public marketing site.

This repository is a **monorepo** (npm workspaces): a **React (Vite)** frontend and a **Node.js (Fastify)** API backed by **PostgreSQL** (optional **Redis** for sessions in production).

---

## Features

- Public site: hero, programs, **browse tutors** (live from the API), testimonials, team, FAQ, contact with map, SEO-oriented metadata
- **Student** registration, subscription and materials library, tutor search, bookings
- **Tutor** onboarding, profile, bookings, earnings, withdrawals
- **Admin**: users, tutors, materials, bookings, notifications, platform stats
- REST API with JWT auth, file uploads, rate limiting, demo seed data for local and demo environments

---

## Tech stack

| Layer    | Technologies                          |
| -------- | ------------------------------------- |
| Frontend | React 18, React Router, Vite, Tailwind |
| Backend  | Fastify 4, PostgreSQL, bcrypt, JWT    |
| Infra    | Docker Compose (Postgres, Redis, optional app containers) |

---

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (local or Docker)
- Optional: **Redis** for production-grade session storage (`REDIS_ENABLED=true`)

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/Mukasa-Matthew/Edu-Bridge.git
cd Edu-Bridge
npm install
```

### 2. Environment

Copy the backend template and edit values (database, JWT, optional email):

```bash
cp backend/.env.example backend/.env
```

Ensure PostgreSQL is running and matches `PG_*` in `backend/.env`.

> **Security / GitHub:** Do **not** commit `backend/.env` with real SMTP keys or passwords. [GitHub Push Protection](https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection/working-with-push-protection-from-the-command-line) will block the push. Keep secrets only on your machine and VPS: after `git clone`, copy `backend/.env` to the server with `scp`, or create it from `backend/.env.example` and fill values there.

If a push is already blocked because `backend/.env` exists in **old commits**, GitHub scans the whole branch history. **Deleting the file today is not enough** — you must rewrite history, then force-push (coordinate with anyone else on `main`).

**Option A — Windows (PowerShell, no extra tools):** from the repo root, with a clean working tree (`git status` empty):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/purge-backend-env-from-history.ps1
```

If Git reports a dirty tree, either commit your work first or let the script stash it (including untracked files), then restore it when finished:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/purge-backend-env-from-history.ps1 -Stash
```

**Option B — `git filter-repo` (any OS):** [install](https://github.com/newren/git-filter-repo) once, then:

```bash
git filter-repo --path backend/.env --invert-paths --force
git push origin main --force
```

**Option C — Git Bash / stock Git:**

```bash
git filter-branch -f --index-filter "git rm --cached --ignore-unmatch backend/.env" --prune-empty -- main
git for-each-ref --format="%(refname)" refs/original | xargs -r -n1 git update-ref -d
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push origin main --force
```

Afterward: run `git rm --cached backend/.env` if Git still tracks it, keep `**/.env` in `.gitignore`, and **revoke the leaked Sendinblue (Brevo) SMTP key** in the Brevo dashboard and put the new key only in local/VPS `backend/.env`.

### 3. Run the stack (migrations + seeds + dev servers)

From the repository root:

```bash
npm run dev
```

This runs, in order:

1. **Database migrations** (`npm run migrate -w backend`) — schema + admin seed from env vars  
2. **Demo seed** (`seed:demo`) — demo students, tutors, materials, sample bookings when `DEMO_SEED_ENABLED=true`  
3. **Demo materials refresh** (`seed:demo:materials`) — library refresh pass  
4. **Concurrently:** Vite (frontend, default `http://localhost:5173`) and nodemon (API, default `http://localhost:3001`)

To start **frontend + API only** without re-running migrate/seeds (faster iteration):

```bash
npm run dev:app-only
```

### 4. Demo logins

With demo seed enabled, see `backend/src/seed-demo.js` header comments for shared demo password and email addresses for students and tutors.

---

## Useful scripts (root)

| Script                    | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Migrate + seeds + frontend + backend             |
| `npm run dev:app-only`    | Frontend + backend only                          |
| `npm run dev:prepare`     | Migrate + both seed scripts only                 |
| `npm run build`           | Production build of the frontend                 |
| `npm run migrate`         | Run migrations (backend)                         |
| `npm run seed:demo`       | Full demo seed                                   |
| `npm run seed:demo:materials` | Demo materials-only pass                     |
| `npm run lint`            | ESLint (frontend)                                |

Backend-only scripts are also available under `npm run <script> -w backend`.

---

## Docker

`docker-compose.yml` defines PostgreSQL, Redis, and optional backend/frontend services. Adjust env files and build context for your VPS. Typical pattern: run Postgres (and Redis if needed), point `backend/.env` at those services, then run migrate + seeds once, then `npm run start -w backend` and serve the built frontend or use a reverse proxy.

---

## VPS deployment

Step-by-step production setup (Ubuntu, nginx, PM2, PostgreSQL, TLS) is in **[VPS-SETUP.md](./VPS-SETUP.md)**.

Short outline:

1. Install Node.js, PostgreSQL, and optionally Redis (or Docker for DBs only).  
2. Clone the repo, `npm install`, create `backend/.env` from `backend/.env.example` with production values (`NODE_ENV`, `FRONTEND_URL`, `JWT_SECRET`, `PG_*`).  
3. Run `npm run migrate -w backend` and optional seeds.  
4. `npm run build -w frontend`, serve `frontend/dist` with nginx, proxy `/api` and `/uploads` to the Node API (see **VPS-SETUP.md**).  
5. Run the API with PM2 or systemd; enable HTTPS (e.g. Certbot).

---

## Repository layout

```
├── frontend/          # Vite + React SPA
├── backend/           # Fastify API, migrations, seeds
├── docker-compose.yml # Local / server Postgres + Redis
└── package.json       # Workspace root scripts
```

---

## Publishing to GitHub

Initialize and push (replace the remote if needed):

```bash
git init
git add .
git commit -m "Initial commit: EduBridge monorepo"
git branch -M main
git remote add origin https://github.com/Mukasa-Matthew/Edu-Bridge.git
git push -u origin main
```

---

## License and ownership

Copyright © 2026 EduBridge UG. All rights reserved.

This project and its contents are proprietary to the authors unless otherwise stated.

---

## Support

For product or deployment questions, use the contact details published on the live EduBridge site or your internal team channels.
