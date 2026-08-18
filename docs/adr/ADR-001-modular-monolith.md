# ADR-001: Modular Monolith Architecture

- **Status:** Accepted
- **Tanggal:** 2026-08-12 (diperbarui 2026-08-13)
- **Context:** Backend menangani auth, pengguna, pengajuan naskah, CMS, katalog buku, dan notifikasi email. Tim kecil — sesuai skill `senior-architect`, kurang dari 10 developer → modular monolith. Backend dan frontend dikembangkan dan di-deploy bersama sebagai satu produk.
- **Alternatives:**
  - Monolith sederhana (satu module) — cepat tetapi sulit dirawat.
  - Microservices — overkill untuk skala dan ukuran tim.
  - Multi-repo terpisah untuk backend dan frontend.
- **Decision:** Gunakan **modular monolith** (satu aplikasi, modul terpisah per domain) dalam struktur **monorepo**:

```
/
├── backend/    # NestJS + Prisma
├── frontend/   # Next.js (App Router)
├── docs/       # requirements, ADR, dll
├── docker-compose.yml
└── AGENTS.md
```

Modul per domain: `auth`, `users`, `submission`, `files`, `cms`, `books`, `mail`.

- **Consequences:**
  - Disiplin pada batas antar-modul; hindari import silang yang menciptakan circular dependency.
  - Konvensi nama dan batas modul yang jelas agar tidak terjadi coupling antar folder.
  - Satu source of truth; versi API dan konsumen frontend dapat disinkronkan dalam satu PR.
  - Git history tercampur; mitigasi dengan commit terpisah per aplikasi.
