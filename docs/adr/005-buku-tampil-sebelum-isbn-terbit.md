# ADR-005: Buku Tampil di Toko Buku Sejak Diusulkan ke Perpusnas (Sebelum ISBN Terbit)

**Status:** Accepted
**Date:** 2026-09-23

## Context
Aturan awal (requirements.md #19): buku dipublish ke landing page setelah
status `COMPLETED`, data diinput manual oleh admin. Namun proses pengajuan
ISBN ke Perpustakaan Nasional mengharuskan pencantuman **link buku** pada
daftar pengajuan — link ini harus sudah ada sebelum ISBN terbit, bukan
setelahnya. Proses penomoran oleh Perpusnas bisa memakan waktu ±1 bulan.

## Decision
- Buku otomatis dibuat & dipublish ke Toko Buku pada saat admin mengusulkan
  pengajuan ke Perpusnas (transisi `LAYOUT_COMPLETED` → `PERPUSNAS_SUBMISSION`,
  lihat `SubmissionService::submitToPerpusnas()`), bukan menunggu `COMPLETED`.
- Data buku (judul, penulis, sinopsis, kategori) diambil otomatis dari data
  submission — admin tidak perlu input ulang manual. Cover awal memakai cover
  depan yang diunggah user saat submit (cover sementara, belum ber-ISBN).
- Setelah admin menerima nomor ISBN dari Perpusnas (idealnya dalam tahap
  `WAITING_PERPUSNAS`/`PERPUSNAS_RESULT_RECEIVED`, tapi tidak dikunci ke stage
  tertentu — kapan pun admin sudah punya nomornya), admin mengisi field `isbn`
  dan mengunggah cover pengganti (yang sudah mencantumkan ISBN) lewat dashboard
  admin → Toko Buku (`PATCH /admin/books/{book}`, `POST /admin/books/{book}/cover`).
- Model `Book` terpisah dari `Submission` (relasi `submission_id`, satu buku
  per submission) — bukan menambah field ke `Submission` — supaya siklus hidup
  publikasi (bisa diedit ulang, unpublish, dsb.) tidak bercampur dengan alur
  workflow pengajuan yang sudah baku.

## Consequences
- Toko Buku publik bisa menampilkan buku yang belum final (cover sementara,
  ISBN kosong). Frontend menampilkan badge "Proses Penomoran ISBN" selama
  `isbn` masih kosong agar pengunjung tidak salah paham bahwa buku sudah final.
- Admin punya kontrol manual kapan mengganti cover + isi ISBN — tidak terikat
  ke transisi stage submission tertentu, karena momen admin benar-benar
  menerima nomor ISBN dari Perpusnas bisa bervariasi.
- `Book.submission_id` unik — satu submission hanya menghasilkan satu entri
  buku, dibuat idempoten (`BookService::publishFromSubmission`) supaya aman
  bila alur perpusnas diulang/dikoreksi.
