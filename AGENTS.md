# AGENTS.md — Uninus Press

## Aturan Komunikasi

- Seluruh komunikasi dengan pengguna menggunakan **Bahasa Indonesia**.
- Jawaban ringkas, langsung ke poin, tidak bertele-tele.
- Gunakan terminologi teknis yang umum, jelaskan bila perlu.

## Tech Stack Project

- **Backend:** Laravel (PHP, REST API) — sumber kebenaran untuk authorization, validasi, dan workflow.
- **Frontend:** Next.js (React, App Router).
- **Database:** PostgreSQL.
- **Storage file:** Wasabi S3 (bucket + region dikonfigurasi via env).
- **Auth:** JWT (Laravel Sanctum/Passport — pilih sesuai kebutuhan, diklarifikasi dengan user).
- **Deployment target:** belum ditentukan (perlu diklarifikasi).

## Sumber Kebenaran Bisnis

Business process pengajuan naskah UNINUS Press di bawah ini adalah **single source of truth**. Jangan menambahkan tahapan, approval, role, atau business rule yang tidak disebutkan tanpa klarifikasi ke user.

### Role
1. **USER** — registrasi mandiri, login, buat/ajukan naskah, unggah dokumen, lihat status, terima/kerjakan catatan perbaikan, submit ulang, terima & unduh hasil Perpusnas.
2. **ADMIN** — lihat semua pengajuan, verifikasi dokumen, beri catatan perbaikan, setujui, pilih pelaksana, terima hasil layout, usulkan ke Perpusnas, unggah PDF hasil Perpusnas, kirim hasil ke user.
3. **PELAKSANA** — hanya melihat pengajuan yang ditugaskan kepadanya, review naskah, beri catatan perbaikan, layouting, hasilkan PDF layout + Word final, kirim hasil ke admin.

### Alur Utama
```
REGISTER → LOGIN → CREATE SUBMISSION → DRAFT → SUBMIT → ADMIN VERIFICATION
  ├─ tidak sesuai → REQUEST REVISION (admin) → USER → perbaiki → SUBMIT ULANG → ADMIN VERIFICATION
  └─ sesuai → APPROVE → ASSIGN EXECUTOR → EXECUTOR REVIEW
        ├─ tidak sesuai → REQUEST REVISION (pelaksana) → USER → perbaiki → SUBMIT ULANG → langsung ke pelaksana yang sama → EXECUTOR REVIEW
        └─ sesuai → APPROVED → LAYOUTING → UPLOAD PDF + WORD FINAL → SEND TO ADMIN
              → PERPUSNAS SUBMISSION → WAITING FOR PERPUSNAS → RECEIVE RESULT → UPLOAD RESULT PDF → USER RECEIVES RESULT → COMPLETED
```

### Dokumen yang Diunggah User
- Sinopsis (DOC/PDF, maks 10 MB), Naskah Word, Cover Depan, Cover Belakang, Kwitansi Lunas Keuangan, Bukti Cek Plagiasi.

### State Workflow
`DRAFT, SUBMITTED, ADMIN_REVIEW, NEEDS_USER_REVISION_ADMIN, ADMIN_APPROVED, ASSIGNED_TO_EXECUTOR, EXECUTOR_REVIEW, NEEDS_USER_REVISION_EXECUTOR, EXECUTOR_APPROVED, LAYOUTING, LAYOUT_COMPLETED, PERPUSNAS_SUBMISSION, WAITING_PERPUSNAS, PERPUSNAS_RESULT_RECEIVED, COMPLETED`

Status tampil ke user menggunakan bahasa sederhana (mis. `ADMIN_REVIEW` → "Sedang Diverifikasi", `LAYOUTING` → "Sedang Dalam Proses Layouting").

### Aturan Penting (Jangan Dilanggar)
1. User tidak bisa mengajukan sebelum login.
2. DRAFT belum masuk proses administrasi.
3. Setelah SUBMIT, user tidak bisa mengubah dokumen bebas kecuali dikembalikan untuk perbaikan.
4. Revisi admin → kembali ke user → submit ulang → kembali ke admin.
5. Revisi pelaksana → kembali ke user → submit ulang → kembali ke **pelaksana yang sama** (bukan ke admin).
6. Admin wajib memilih pelaksana setelah approve.
7. Pelaksana hanya melihat pengajuan yang ditugaskan kepadanya.
8. Setelah layouting selesai, pelaksana kirim PDF + Word final ke admin. **TIDAK ADA approval/review admin tambahan setelah layouting** — langsung lanjut ke usulan Perpusnas.
9. Perpusnas adalah proses eksternal; sistem hanya mencatat status menunggu hasil.
10. Admin mengunggah PDF hasil Perpusnas → user bisa mengunduh → status SELESAI.

### Konsep Penting
- Pisahkan `current_stage`, `current_status`, `assigned_executor_id`, `submitted_at`, `completed_at` — jangan satukan dalam satu field status.
- Setiap perubahan status tercatat dalam history/audit trail (siapa, apa, dari status, ke status, catatan, waktu). History tidak boleh dihapus.
- Dokumen revisi memakai **versioning** (mis. `synopsis_v1`, `manuscript_v2`, dst) — jangan menimpa versi lama.
- Notifikasi di tahap awal cukup notification center di dashboard; email/WhatsApp bisa ditambahkan kemudian.

## Aturan Pengerjaan

1. Sebelum implementasi fitur, pastikan requirements terdokumentasi dan disetujui user. Jika ada yang ambigu/kontradiktif — **tanyakan, jangan memutuskan sendiri**.
2. Gunakan skill yang tersedia yang relevan, terutama:
   - `grilling-me-with-docs` — untuk sesi klarifikasi/kesiapan docs sebelum mulai.
   - `senior-architect` — desain arsitektur, diagram, keputusan database.
   - `senior-backend` — desain API Laravel, keamanan, pola backend.
   - `database-designer` / `database-schema-designer` — skema & migrasi PostgreSQL.
   - `senior-frontend` — desain halaman Next.js/React, optimization.
   - `epic-design` — desain landing page yang kuat.
   - `api-design-reviewer` — review API contract.
   - `api-test-suite-builder` / `senior-qa` — pengujian.
   - `tech-stack-evaluator` — evaluasi perbandingan teknologi bila perlu.
   - `ci-cd-pipeline-builder` — pipeline CI/CD saat dibutuhkan.
   - `changelog-generator` — changelog / rilis.
3. Jangan menulis dokumentasi/file tanpa diminta, kecuali memang diperlukan untuk kelancaran project.
4. Ikuti konvensi kode pada file di sekitarnya.
5. Jangan pernah commit/push tanpa instruksi eksplisit dari user.
6. Jangan pernah menyimpan secret/key di kode; gunakan environment variables.
7. Keputusan arsitektur penting dicatat sebagai ADR di `docs/adr/`.
8. Backend adalah sumber kebenaran; frontend tidak boleh menentukan sendiri status workflow.

## Referensi Website

- Referensi utama: **https://press.unpad.ac.id/** — hanya **output visual/penampilan**-nya yang ditiru untuk landing page press.uninus.ac.id, bukan struktur/internal sistemnya.
- Target konten landing page (mengikuti referensi): Beranda (hero, layanan, CTA pengajuan naskah), Tentang Kami, Layanan Penerbitan Buku, Paket Penerbitan, Toko Buku, Kontak, Registrasi/Login pengguna.