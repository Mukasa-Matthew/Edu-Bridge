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

> **Security:** This repository is configured to **track `backend/.env`** for your VPS/team workflow. Treat the GitHub repo as sensitive: use a **private** repository, restrict collaborators, and **never** make it public without removing `.env` from history and **rotating every secret** (database, JWT, SMTP, API keys). For maximum safety, prefer only committing `backend/.env.example` and injecting real values on the server.

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

## VPS deployment (outline)

1. Install Node.js, PostgreSQL, and optionally Redis on the server (or use Docker for databases only).  
2. Clone the repo, `npm install`, `cp backend/.env.example backend/.env`, set `NODE_ENV=production`, strong `JWT_SECRET`, production `FRONTEND_URL`, and DB credentials.  
3. Run `npm run migrate -w backend` and `npm run seed:demo -w backend` / `seed:demo:materials` if you want demo data (optional in production).  
4. `npm run build` then serve `frontend/dist` with nginx (or similar) and run the API with `npm run start -w backend` behind a process manager (systemd, PM2).  
5. Configure HTTPS and proxy `/api` (and `/uploads` if served from the API) to the backend port.

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
