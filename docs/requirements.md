# Requirements Readiness — UNINUS Press

Dokumen readiness hasil sesi grilling sebelum implementasi. Dokumen ini adalah **sumber kebenaran tambahan** di samping AGENTS.md. Setiap perubahan harus disetujui user.

## Daftar Jawaban Terverifikasi

### Fase 1 — Aktor & Auth
1. Admin dibuat via seeder; admin menambah pelaksana dari dashboard.
2. Verifikasi email: belum perlu.
3. Role ganda diperbolehkan (USER + PELAKSANA dalam satu akun).
4. Auth: Laravel Sanctum (JWT/API token).

### Fase 2 & 3 — Business Rules & Data
5. Multi-submission boleh (buku berbeda, diproses paralel).
6. Format file:
   - Sinopsis: DOC/PDF, maks 10MB.
   - Naskah: docx/doc, maks 20MB.
   - Cover depan, cover belakang, kwitansi: gambar JPG/PNG, maks 5MB per file.
   - Bukti cek plagiasi: PDF.
7. Paket Penerbitan dihapus dari sistem **dan** dari landing page.
8. Semua dokumen diunggah bersamaan saat submit pertama (pra-admin).
9. Biaya dibayar user sebelum submit (kwitansi lunas disertakan saat submit).
10. Batas maksimal 10 pengajuan aktif per user.

### Fase 4 — Status & Notifikasi
11. Mapping status ke bahasa user disetujui:
    | State | Tampil ke user |
    |---|---|
    | `DRAFT` | Draf |
    | `SUBMITTED` / `ADMIN_REVIEW` | Sedang Diverifikasi |
    | `NEEDS_USER_REVISION_ADMIN` | Perlu Perbaikan |
    | `ADMIN_APPROVED` / `ASSIGNED_TO_EXECUTOR` | Disetujui |
    | `EXECUTOR_REVIEW` | Sedang Direview Pelaksana |
    | `NEEDS_USER_REVISION_EXECUTOR` | Perlu Perbaikan |
    | `EXECUTOR_APPROVED` / `LAYOUTING` | Proses Layouting |
    | `LAYOUT_COMPLETED` | Menunggu Pengiriman |
    | `PERPUSNAS_SUBMISSION` / `WAITING_PERPUSNAS` | Menunggu Hasil Perpusnas |
    | `PERPUSNAS_RESULT_RECEIVED` | Hasil Siap Diunduh |
    | `COMPLETED` | Selesai |
12. Event notifikasi di dashboard: pengajuan diajukan, revisi diminta, pengajuan disetujui/ditugaskan, hasil layout masuk, hasil Perpusnas masuk.
13. Audit trail wajib tercatat (siapa, apa, dari status, ke status, catatan, waktu) dan tidak boleh dihapus.

### Fase 5 — Infrastruktur
14. Deployment: VPS self-managed.
15. Storage: Wasabi S3 (bucket + region via env).
16. Perpusnas: **tanpa integrasi API** — hanya status manual + upload PDF hasil oleh admin.

### Fase 6 & 7 — Non-fungsional & UI/UX
17. Perkiraan skala awal: ~100 user.
18. Akses file privat: pemilik pengajuan, admin, dan pelaksana yang ditugaskan.
19. ~~Buku dipublish ke landing page setelah `COMPLETED`, data diinput manual oleh admin.~~
    **Direvisi (2026-09-23, lihat ADR-005):** buku tampil di Toko Buku sejak
    admin mengusulkan ke Perpusnas (`PERPUSNAS_SUBMISSION`), bukan menunggu
    `COMPLETED` — karena daftar pengajuan ISBN ke Perpusnas mengharuskan
    pencantuman link buku. Data diambil otomatis dari submission (judul,
    penulis, sinopsis, kategori, cover depan sebagai cover sementara). Admin
    mengganti cover dengan versi ber-ISBN + mengisi nomor ISBN setelah nomor
    terbit dari Perpusnas (dashboard admin → Toko Buku).
20. Menu Toko Buku = daftar buku terpublish, tanpa pembayaran online di rilis pertama.
21. Brand: logo UNINUS akan dimasukkan user ke folder; warna landing page mengikuti uninus.ac.id; konten disiapkan sebagai draft oleh tim teknis lalu direvisi user.

### Fase 8 — Milestone
22. Milestone:
    - **M0**: setup repo (backend + frontend) + landing page statis.
    - **M1**: auth + role + workflow pengajuan inti (create → submit → verifikasi admin → assignment).
    - **M2**: review pelaksana + revisi + layouting + upload hasil.
    - **M3**: alur Perpusnas manual + notifikasi + dashboard lengkap + hardening.

## Open Questions

- **O1.** Tujuan utama/KPI rilis pertama (Fase 0 di-skip saat sesi grilling).
- **O2.** Detail deployment VPS: OS, domain/SSL, strategi backup, kebutuhan CI/CD.
- **O3.** Logging, monitoring, rate limiting.
- **O4.** Metode pengujian (unit/e2e/manual) dan definisi "selesai" per fitur.
- **O5.** Menunggu logo/brand dimasukkan ke folder.

## Area Berisiko

- **Fitur publish buku ke landing page** — sudah diimplementasikan (model `Book`, auto-publish saat `submitToPerpusnas`, admin bisa update ISBN/harga/cover). Lihat ADR-005.
- **Versioning dokumen revisi** — kompleksitas tinggi; pola versi harus diputuskan sebelum coding M1.
- **Role ganda (USER + PELAKSANA)** — butuh middleware akses yang ketat.
- **Batas 10 pengajuan aktif** — wajib di-enforce di backend, bukan frontend.

## Perubahan Setelah Sesi Awal

- **2026-09-23 — PDF bukti pengajuan.** Setiap kali user submit/submit ulang,
  sistem otomatis membuat PDF ringkasan isian pengajuan (judul, penulis,
  kategori, checklist 6 dokumen wajib, konfirmasi bukti bayar) sebagai bukti
  fisik yang bisa dicetak. Disimpan sebagai media ter-versi
  (`submission_receipt`) mengikuti pola versioning ADR-001, bisa diunduh user
  dari dashboard.
- **2026-09-23 — Publish buku sebelum ISBN terbit.** Lihat revisi poin #19 di
  atas dan ADR-005.