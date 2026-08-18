# ADR-007: Wasabi Storage

- **Status:** Accepted
- **Tanggal:** 2026-08-12 (diperbarui 2026-08-13)
- **Context:** Provider object storage untuk menyimpan file naskah privat (S3-compatible, lihat ADR-006).
- **Alternatives:**
  - AWS S3 — murah bandwidth egress, fitur lengkap, tetapi biaya egress tinggi.
  - Google Cloud Storage / Backblaze — alternatif lain S3-compatible.
- **Decision:** Gunakan **Wasabi Cloud** (S3-compatible).
  - Backend memakai AWS SDK v3 dengan `endpoint` Wasabi (`S3_ENDPOINT`).
  - Kredensial via env: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`.
  - Bucket bersifat **private**; sampul buku terbit juga disajikan via **signed URL** (bukan URL publik permanen) untuk konsistensi kebijakan file.
  - Kebijakan backup/versioning Wasabi ditentukan sebelum production launch (Section 40).
- **Consequences:**
  - Menambah dependency AWS SDK di backend.
  - Credential tidak pernah di commit; dikelola via `.env` VPS.
  - Vendor dapat diganti tanpa mengubah kode selama endpoint S3-compatible.
