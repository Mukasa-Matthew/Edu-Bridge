# EduBridge — VPS production setup

This guide assumes **Ubuntu 22.04 LTS** (or similar) and a single VPS running **nginx**, **Node.js**, **PostgreSQL**, and the EduBridge monorepo. Adjust paths and domains to match your server.

---

## 1. System packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw
```

### Node.js 20 LTS (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v20.x
```

### PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Create database and user (replace passwords):

```bash
sudo -u postgres psql <<'SQL'
CREATE USER edubridge WITH PASSWORD 'YOUR_STRONG_DB_PASSWORD';
CREATE DATABASE edubridge OWNER edubridge;
GRANT ALL PRIVILEGES ON DATABASE edubridge TO edubridge;
SQL
```

For PostgreSQL 15+ you may need schema privileges:

```bash
sudo -u postgres psql -d edubridge -c "GRANT ALL ON SCHEMA public TO edubridge;"
```

### Optional: Redis (recommended if you enable `REDIS_ENABLED=true`)

```bash
sudo apt install -y redis-server
sudo systemctl enable --now redis-server
```

Set a password in `redis.conf` (`requirepass`) and match it in `backend/.env`.

---

## 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 3. Deploy user and app directory

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/edubridge
sudo chown deploy:deploy /var/www/edubridge
```

As **deploy**:

```bash
cd /var/www/edubridge
git clone https://github.com/Mukasa-Matthew/Edu-Bridge.git .
npm install
```

### Git: “detected dubious ownership”

If the app directory is owned by **`deploy`** but you run **`git pull` as root**, Git 2.35+ may refuse with *dubious ownership*. Prefer updates as `deploy`:

```bash
sudo -u deploy -H bash -lc 'cd /var/www/edubridge && git pull && npm install && npm run build -w frontend'
```

Or allow that path for root’s Git (one-time):

```bash
git config --global --add safe.directory /var/www/edubridge
```

---

## 4. Backend environment (`backend/.env`)

On the VPS, create **`backend/.env`** (never commit this file):

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set at least:

| Variable | Production example |
| -------- | ------------------ |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://your-domain.com` (exact browser origin; required for CORS + cookies) |
| `PG_HOST` | `localhost` (or your DB host) |
| `PG_PORT` | `5432` |
| `PG_DATABASE` | `edubridge` |
| `PG_USER` | `edubridge` |
| `PG_PASSWORD` | (strong password) |
| `JWT_SECRET` | Long random string (32+ characters) |
| `REDIS_ENABLED` | `false` or `true` (if Redis is configured) |
| `ADMIN_SEED_*` | Real admin email/password for first platform admin |
| `DEMO_SEED_ENABLED` | `false` for a clean production site, or `true` only for demos |
| `EMAIL_*` / `BREVO_*` | Your SMTP credentials if email is enabled |

Ensure the uploads directory exists:

```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

---

## 5. Database migrations and seeds

From the **repository root** (so workspace scripts resolve):

```bash
cd /var/www/edubridge
npm run migrate -w backend
```

Optional demo data (tutors, students, materials):

```bash
npm run seed:demo -w backend
npm run seed:demo:materials -w backend
```

Or use the root shortcut (same as local `dev:prepare` without starting Vite):

```bash
npm run dev:prepare
```

**Note:** `npm run dev` on the VPS will also start Vite in dev mode — use **build + nginx + PM2** below for production, not `npm run dev`.

---

## 6. Build the frontend

```bash
cd /var/www/edubridge
npm run build -w frontend
```

Output: `frontend/dist/`. With nginx serving the SPA and proxying `/api` to Node, leave `VITE_API_BASE_URL` **unset** so the browser calls `/api/...` on the same origin.

### If `vite build` fails on Linux (Rolldown / Lightning CSS native `.node`)

**Vite 8** pulls **Rolldown** and **Lightning CSS**, which use platform-specific optional packages. In an npm **workspace** install they sometimes never land under `frontend/node_modules` ([npm/cli#4828](https://github.com/npm/cli/issues/4828)). This repo lists common **Lightning CSS** bindings as `optionalDependencies` in `frontend/package.json`; after `git pull`, run **`npm install` from the repo root** so they install.

If you still see **`lightningcss.linux-x64-gnu.node`** or **`@rolldown/binding-linux-x64-gnu`** missing, install explicitly, then rebuild:

```bash
cd /var/www/edubridge
npm install -w frontend lightningcss-linux-x64-gnu@1.32.0
npm run build -w frontend
```

(Use the same version as the `lightningcss` package required by your installed `vite`, e.g. check `npm ls lightningcss -w frontend`.)

Full clean reinstall from root:

```bash
cd /var/www/edubridge
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
npm run build -w frontend
```

---

## 7. Run the API with PM2

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Start the API **with working directory `backend`** so `dotenv`, migrations-relative paths, and `./uploads` resolve correctly:

```bash
cd /var/www/edubridge/backend
pm2 start src/app.js --name edubridge-api
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy
```

Health check:

```bash
curl -s http://127.0.0.1:3001/api/health
```

After code updates:

```bash
cd /var/www/edubridge && git pull && npm install && npm run build -w frontend
cd /var/www/edubridge && npm run migrate -w backend
cd /var/www/edubridge/backend && pm2 restart edubridge-api
```

---

## 8. nginx (HTTPS + SPA + API proxy)

Replace `your-domain.com` and SSL paths (e.g. from **Certbot**).

```bash
sudo nano /etc/nginx/sites-available/edubridge
```

Example site:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    root /var/www/edubridge/frontend/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/xml;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/edubridge /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### TLS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 9. Checklist

- [ ] `FRONTEND_URL` matches the URL users open (scheme + host, no trailing slash).
- [ ] `JWT_SECRET` is unique and long.
- [ ] PostgreSQL user/database created; migrations ran without errors.
- [ ] `curl https://your-domain.com/api/health` returns JSON `ok: true`.
- [ ] Login and file uploads work (cookies are `SameSite`/`Secure`-friendly over HTTPS).
- [ ] `DEMO_SEED_ENABLED=false` unless you intentionally want demo accounts on production.

---

## 10. Alternative: Docker Compose (Postgres + Redis only)

You can run only databases in Docker and keep Node on the host:

```bash
cd /var/www/edubridge
# Set PG_* in .env to match compose, or use defaults in docker-compose.yml
docker compose up -d postgres redis
```

Point `PG_HOST` to `127.0.0.1` if ports are published, or use the Docker network and run the API in another container (see `docker-compose.yml` for the full stack variant).

---

## Support when you SSH in

When you are on the VPS and share outputs (nginx `-t`, `pm2 logs`, `curl /api/health`, migration errors), we can debug the next layer step by step.
