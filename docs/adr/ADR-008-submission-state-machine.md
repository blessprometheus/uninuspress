# ADR-008: Submission State Machine

- **Status:** Accepted (diperbarui 2026-08-13)
- **Tanggal:** 2026-08-12
- **Context:** Pengajuan naskah memiliki status dengan transisi terbatas berdasarkan peran. Perlu mencegah transisi ilegal, mencatat riwayat, dan mewajibkan alasan saat ditolak.
- **Alternatives:**
  - Bebas ubah status oleh siapa pun — melanggar Section 16.
  - Transisi hanya divalidasi di frontend — melanggar prinsip backend-as-source-of-truth.
- **Decision:** Modelkan status sebagai **state machine** di layer service (bukan controller), dengan daftar transisi + aktor:

```
| From           | To             | Aktor                          |
| -------------- | -------------- | ------------------------------ |
| Draft          | Submitted      | Penulis                        |
| Submitted      | Review         | Editor/Admin                   |
| Review         | Diterima       | Editor/Admin                   |
| Review         | Ditolak        | Editor/Admin                   |
| Diterima       | Dalam Produksi | Editor/Admin                   |
| Dalam Produksi | Terbit         | Admin (keputusan #8)           |
| Ditolak        | Submitted      | Penulis (pengajuan ulang)      |
```

  - Transisi ilegal ditolak backend (`400`/`403`).
  - **Rejection reason wajib** saat `REJECTED` (Section 17) — tersimpan di histori.
  - Riwayat disimpan di tabel status history (audit trail, Section 18): `submission_id`, `from`, `to`, `changed_by`, `note`, `created_at`.
  - Perubahan status + pembuatan history dilakukan dalam **satu transaction** (Section 32).
  - Email notification dipicu setelah commit transaction, **non-blocking** (ADR-009).
- **Consequences:**
  - Migration Prisma untuk tabel history (jika belum ada) dan penyesuaian enum.
  - Logika mudah diuji secara unit (murni fungsi transisi + service).
  - Nama entity mengikuti istilah spec (`Submission`); penyesuaian dari `Manuscript` dikerjakan sebagai refactor terarah.
