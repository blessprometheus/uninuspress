# ADR-011: Private File Access Strategy

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Section 20 menetapkan: file naskah privat; akses hanya melalui authorization backend → signed URL → private object. Penulis hanya file miliknya sendiri; Admin seluruh file; Editor sesuai kewenangan.
- **Alternatives:**
  - Signed URL langsung tanpa cek kepemilikan — memungkinkan IDOR (ditemukan pada kode awal: siapa pun ber-role author dapat meminta URL file milik author lain).
  - Proksi file melalui backend — menambah beban dan bandwidth backend.
- **Decision:** Enforce **object-level authorization sebelum membuat signed URL**:
  - Endpoint download menerima `fileId`, lalu backend:
    1. memuat record file + parent submission;
    2. **Penulis**: hanya jika `submission.userId === user.id` — selain itu `403`;
    3. **Editor/Admin**: sesuai kewenangan (Editor: submission yang menjadi kewenangannya — lihat keputusan #6; Admin: semua);
    4. menghasilkan **signed URL** (expiry pendek, ±15 menit) ke private object;
    5. URL tidak pernah disimpan/disajikan sebagai URL publik permanen.
  - Object key acak (uuid) dan tidak memakai nama file asli (ADR-006).
  - Upload juga tunduk pada cek kepemilikan/status submission.
- **Consequences:**
  - Menutup celah IDOR / horizontal privilege escalation pada file.
  - Presigned URL pendek mengurangi risiko URL bocor/terpakai ulang.
  - Perlu test authorization untuk semua role + pemilik vs non-pemilik (Section 43, 45).
