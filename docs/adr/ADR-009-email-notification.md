# ADR-009: Email Notification Strategy

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Sistem mengirim email transaksional: konfirmasi registrasi, verifikasi email, reset password, submission dikirim, dan perubahan status submission (Section 22). Kegagalan email tidak boleh membatalkan perubahan bisnis (Section 23).
- **Alternatives:**
  - Email sinkron dalam transaction DB — SMTP lambat/gagal dapat memblokir atau menggagalkan transaksi.
  - Queue/job worker (BullMQ) — kuat tetapi menambah kompleksitas infrastruktur di luar MVP.
- **Decision:** Implementasikan dengan **sinkron non-blocking + EmailLog + retry sederhana** di MVP:
  - Email dikirim **setelah** transaction DB commit; kegagalan email **tidak** membatalkan perubahan status.
  - Setiap percobaan dicatat di **`EmailLog`**: `type`, `recipient`, `reference_id`, `status`, `attempt_count`, `sent_at`, `error`, `created_at`.
  - **Retry**: maksimum 3 percobaan (backoff sederhana) pada proses selanjutnya; status final `sent` / `failed`.
  - Template handlebars (`welcome`, `verify`, `reset`, `status`) dalam Bahasa Indonesia.
  - Email status submission memuat: judul, status baru, catatan (jika ada), dan langkah berikutnya.
  - SMTP dikonfigurasi via env; dev memakai SMTP sandbox (Mailpit/Ethereal).
  - Log tidak memuat password, JWT, secret, isi dokumen, atau PII berlebih (Section 37).
- **Consequences:**
  - Perlu entity `EmailLog` + modul retry terjadwal (atau dipicu saat event berikutnya) — retry dimasukkan ke P1 (Section 49).
  - Retention log email: 90 hari (keputusan #13).
  - Jika beban naik, solusi queue dapat menggantikan mekanisme ini (dicatat untuk P2).
