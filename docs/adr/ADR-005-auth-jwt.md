# ADR-005: JWT Authentication

- **Status:** Accepted (diperbarui 2026-08-13)
- **Tanggal:** 2026-08-12
- **Context:** Sistem memiliki tiga peran (Admin, Editor, Penulis). Penulis registrasi mandiri dan wajib verifikasi email sebelum login. Perlu reset password, role-based authorization, dan akses token ber-expiry.
- **Alternatives:**
  - Session-based (cookie stateful) — butuh store, kurang cocok untuk REST API.
  - JWT tanpa verifikasi email — tidak memenuhi Section 13.
- **Decision:** Gunakan **JWT (access token) dengan Passport** di NestJS.
  - `@nestjs/passport` + `passport-jwt` untuk strategi; password di-hash **bcrypt (cost 10)**.
  - Access token **expiry 8 jam**; klaim: `sub`, `email`, `role`.
  - **Refresh token: P2** — tidak diimplementasikan di MVP; design/rotation direview saat P2 (Section 50 #4).
  - `JWT_SECRET` wajib dari environment; **tidak ada fallback secret** di kode production.
  - **Email verification**: Penulis wajib verifikasi email sebelum login; token verifikasi hashed, ber-expiry, sekali pakai. Admin/Editor dibuat via seed (aktif langsung).
  - **Forgot/reset password**: token hashed + expiry; respons seragam untuk email terdaftar maupun tidak (Section 14).
  - Logout: client-side (token dihapus); karena stateless, token berlaku sampai expiry.
- **Consequences:**
  - Role di dalam token bisa basi; pada P2 pertimbangkan lookup role per-request atau refresh rotation.
  - Perlu entity `EmailVerification`, `PasswordResetToken`, `RefreshToken(P2)`.
  - Secret tidak boleh fallback ke nilai hardcoded pada environment selain development.
