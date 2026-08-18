# ADR-006: S3-Compatible Object Storage

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Pengajuan naskah membutuhkan upload manuskrip, sampul, dan proposal. File sensitif (PII ringan) harus privat dan dilindungi authorization sebelum download (Section 20).
- **Alternatives:**
  - Upload ke disk server lokal — sederhana tetapi tidak scalable dan berisiko saat redeploy/backup.
  - Public bucket — melanggar Section 20 (file tidak boleh punya URL publik permanen).
- **Decision:** Gunakan **S3-compatible object storage** dengan:
  - **Private bucket**; tidak ada object yang dapat diakses via URL publik permanen.
  - Upload via backend (bukan presigned upload dari client) agar validasi dan otorisasi terpusat (Section 21: konsistensi DB-storage ditangani di storage layer).
  - Download: **authorization backend → signed URL** (expiry singkat, mis. 15 menit) → object privat (alur Section 20).
  - **Object key acak** (uuid), tidak memakai nama file asli sebagai path (Section 20). Contoh: `manuscripts/{submissionId}/{uuid}.{ext}`.
  - Validasi upload: extension + MIME type + **file signature/magic bytes** + batas ukuran (Section 20, keputusan #1–#2).
  - Strategi kegagalan/orphan: operasi DB + upload memakai langkah idempoten; orphan object dibersihkan via reconciliation/sweep.
- **Consequences:**
  - Perlu kredensial storage di environment variables (tidak pernah di commit).
  - Presigned URL expiry pendek untuk menekan jendela akses.
  - Detail provider: ADR-007.
