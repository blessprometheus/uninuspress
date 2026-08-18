# AGENTS.md — Uninus Press

## Aturan Komunikasi

- Seluruh komunikasi dengan pengguna menggunakan **Bahasa Indonesia**.
- Jawaban harus ringkas, langsung ke poin, dan tidak bertele-tele.
- Gunakan terminologi teknis yang umum dipahami, tetapi jelaskan bila diperlukan.

## Tech Stack Project

- **Backend:** NestJS (TypeScript, REST API)
- **Frontend:** Next.js (React, App Router)
- **Database:** PostgreSQL
- **ORM:** Prisma (default) — kecuali ada keputusan lain
- **Auth:** JWT (Pasport) — untuk peran admin/editor
- **Deployment target:** belum ditentukan (perlu diklarifikasi)

## Aturan Pengerjaan

1. Sebelum memulai implementasi fitur, pastikan requirements terdokumentasi dan disetujui pengguna.
2. Gunakan skill yang tersedia di `.opencode/skills/` yang relevan dengan tugas, terutama:
   - `senior-architect` — untuk desain arsitektur, diagram, keputusan database
   - `senior-backend` — untuk desain API, keamanan, pola backend NestJS
   - `tech-stack-evaluator` — bila perlu evaluasi perbandingan teknologi
   - `ci-cd-pipeline-builder` — untuk pipeline CI/CD saat dibutuhkan
   - `tech-debt-tracker` — untuk memantau utang teknis
   - `changelog-generator` — untuk changelog / rilis
3. Jangan menulis dokumentasi atau file tanpa diminta, kecuali memang diperlukan untuk kelancaran project.
4. Ikuti konvensi kode yang sudah ada pada file di sekitarnya.
5. Jangan pernah meng-commit atau push tanpa instruksi eksplisit dari pengguna.
6. Jangan pernah menyimpan secret/key di dalam kode; gunakan environment variables.
7. Setiap keputusan arsitektur penting dicatat sebagai ADR (Architecture Decision Record) di `docs/adr/`.

## Referensi Website

- Referensi utama: https://press.unpad.ac.id/ (Unpad Press)
- Target: membangun situs serupa untuk press.uninus.ac.id
- Fitur inti yang diamati dari referensi:
  - Beranda (hero, layanan, CTA pengajuan naskah)
  - Tentang Kami / Profil
  - Layanan Penerbitan Buku
  - Harga Paket Penerbitan
  - Toko Buku (link eksternal)
  - Kontak
  - Registrasi / Login pengguna (pengajuan naskah)
