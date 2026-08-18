# ADR-002: NestJS Backend

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Backend REST API untuk platform penerbitan buku. Membutuhkan validasi input, otorisasi berbasis peran, error handling konsisten, dan hardening dasar.
- **Alternatives:**
  - Express/Fastify murni — fleksibel tetapi butuh banyak setup manual (DI, guard, pipe).
  - FastAPI (Python) — stack berbeda dari frontend (TypeScript).
- **Decision:** Gunakan **NestJS + TypeScript** sebagai kerangka backend.
  - REST API dengan prefix global `api`.
  - Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
  - `helmet` untuk security headers.
  - CORS allowlist via env (`FRONTEND_URL`).
  - **Error response konsisten**:

    ```json
    { "success": false, "message": "...", "code": "..." }
    ```

    Diimplementasikan via exception filter global; tidak ada stack trace ke client production.
  - **Rate limiting** pada endpoint sensitif (login, register, forgot/reset password, upload, submission, kontak) via `@nestjs/throttler`.
  - `GET /health` untuk health check (DB + aplikasi).
  - Modular monolith sesuai ADR-001.
- **Consequences:**
  - Struktur standar NestJS memudahkan onboarding dan konsistensi antar modul.
  - Perlu exception filter + rate limiter + health module yang dibangun/disusun di awal.
  - Logging terstruktur tanpa PII (password, JWT, secret, isi dokumen).
