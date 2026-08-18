# ADR-010: Docker Compose Deployment

- **Status:** Accepted (diperbarui 2026-08-13)
- **Tanggal:** 2026-08-12
- **Context:** Deployment target VPS self-hosted (keputusan #16). Tiga proses: PostgreSQL, backend NestJS, frontend Next.js; reverse proxy untuk HTTPS.
- **Alternatives:**
  - Install manual (Node, PostgreSQL) di VPS — rawan perbedaan environment.
  - Kubernetes — overkill untuk satu VPS.
- **Decision:** Gunakan **Docker Compose** dengan servis:

```yaml
services:
  db:            # postgres:16-alpine, persistent volume, port TIDAK diekspos ke publik
  backend:       # NestJS; prisma migrate deploy + node dist/main.js
  frontend:      # Next.js (standalone output)
  reverse-proxy: # Caddy — terminate TLS (Let's Encrypt), proxy ke frontend/backend
```

  - **Caddy** sebagai reverse proxy (keputusan #17): HTTPS otomatis.
  - **DB tidak diekspos ke internet**; hanya diakses dalam Docker network (Section 39).
  - Container backend & frontend berjalan sebagai **non-root user**.
  - **Healthcheck** untuk db/backend/frontend; backend menyediakan `GET /health`.
  - `migrate deploy` dijalankan sebelum start backend (migration versioned).
  - Env vars dikelola `.env` di VPS (bukan di repo) — `DATABASE_URL`, `JWT_SECRET`, `S3_*`, `SMTP_*`.
  - Backup DB: `pg_dump` terjadwal (keputusan #14) + restore procedure terdokumentasi.
- **Consequences:**
  - VPS perlu Docker Engine + Caddy.
  - Update container = `docker compose pull/build up -d`; rollback via tag/commit lama.
  - Prosedur restore/rebuild/rollback didokumentasikan (Section 41).
