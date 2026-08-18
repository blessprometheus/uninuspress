# Requirements & Engineering Specification — press.uninus.ac.id

**Status:** Baseline — Open Decisions (#1–#20) telah diselesaikan dan disetujui
**Versi:** 1.0
**Bahasa:** Bahasa Indonesia
**Target:** MVP Production-Ready

---

## 1. Tujuan Dokumen

Dokumen ini menjadi acuan utama untuk:

* Software Engineer
* QA Engineer
* DevOps Engineer
* Product/Project Owner
* AI Coding Agent

Dokumen mendefinisikan kebutuhan bisnis, fitur, role, workflow, keamanan, kualitas, arsitektur, deployment, dan acceptance criteria untuk pengembangan **press.uninus.ac.id**.

Implementasi tidak boleh mengambil keputusan bisnis penting yang belum didefinisikan di dokumen ini tanpa terlebih dahulu mencatat keputusan tersebut sebagai perubahan requirement atau ADR.

---

# 2. Ringkasan Produk

Membangun situs penerbit universitas **press.uninus.ac.id** dengan referensi struktur informasi, UX, dan fitur dari **press.unpad.ac.id**.

Referensi tersebut digunakan sebagai inspirasi dan benchmark fitur, **bukan untuk menyalin identitas visual, konten, aset, kode, maupun elemen proprietary**.

Sistem merupakan platform penerbitan buku yang memungkinkan:

1. Pengunjung memperoleh informasi mengenai layanan penerbitan.
2. Penulis membuat akun.
3. Penulis mengajukan naskah secara online.
4. Penulis mengunggah dokumen naskah dan dokumen pendukung.
5. Penulis memantau status pengajuan.
6. Editor melakukan review pengajuan.
7. Admin mengelola website, pengguna, layanan, harga, buku, dan pengajuan.
8. Pengunjung melihat katalog buku dan diarahkan ke toko eksternal untuk pembelian.

---

# 3. Tujuan MVP

MVP harus mampu menyediakan alur utama berikut:

```text
Pengunjung
    ↓
Website Informasi
    ↓
Registrasi / Login
    ↓
Penulis
    ↓
Pengajuan Naskah
    ↓
Upload Dokumen
    ↓
Submitted
    ↓
Editor Review
    ↓
Diterima / Ditolak
    ↓
Dalam Produksi
    ↓
Terbit
```

Setiap aktivitas penting harus memiliki kontrol authorization, audit trail, dan error handling yang sesuai.

---

# 4. Non-Goals MVP

Fitur berikut **tidak termasuk MVP** kecuali disetujui melalui perubahan requirement:

* Payment gateway
* Checkout internal
* Shopping cart
* Order management internal
* Sistem marketplace internal
* Integrasi Google Analytics
* CAPTCHA pihak ketiga
* Mobile application
* Multi-language
* Integrasi SSO
* Integrasi pihak ketiga selain storage dan SMTP
* Workflow produksi buku yang sangat detail
* Sistem editorial collaboration real-time

---

# 5. Technology Stack

## Backend

* NestJS
* TypeScript
* REST API
* Prisma ORM
* PostgreSQL
* Passport
* JWT
* class-validator
* Helmet
* bcrypt

## Frontend

* Next.js
* React
* App Router
* TypeScript

## Storage

* S3-compatible object storage
* Wasabi Cloud

File naskah dan dokumen pendukung harus disimpan sebagai **private object**.

## Email

* Nodemailer
* SMTP transaksional

## Deployment

* VPS self-hosted
* Docker
* Docker Compose
* Reverse proxy
* HTTPS

## Repository

Monorepo:

```text
press-uninus/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── README.md
└── ...
```

---

# 6. Bahasa

Bahasa utama dan satu-satunya bahasa pada MVP:

**Bahasa Indonesia.**

Semua:

* UI
* pesan validasi
* email
* notifikasi
* CMS
* dokumentasi pengguna

menggunakan Bahasa Indonesia, kecuali istilah teknis yang memang diperlukan.

---

# 7. Role Pengguna

Sistem memiliki tiga role utama:

### 7.1 Admin

Memiliki akses administratif penuh terhadap sistem.

Hak utama:

* mengelola konten CMS
* mengelola layanan
* mengelola harga
* mengelola katalog buku
* mengelola pengguna
* melihat seluruh pengajuan
* mengelola status pengajuan sesuai workflow
* melihat audit trail
* melihat log notifikasi
* mengelola pengaturan sistem

### 7.2 Editor

Berfokus pada pengelolaan dan review naskah.

Hak utama:

* melihat pengajuan yang menjadi kewenangannya
* melihat dokumen pengajuan
* melakukan review
* memberikan catatan
* mengubah status sesuai workflow yang diizinkan
* melihat histori pengajuan

Editor tidak memiliki akses untuk mengelola:

* user
* konfigurasi sistem
* CMS umum
* harga
* katalog buku

kecuali permission tersebut secara eksplisit diberikan pada implementasi berikutnya.

### 7.3 Penulis

Hak utama:

* registrasi
* login
* mengelola profil
* membuat draft pengajuan
* mengunggah dokumen
* mengirim pengajuan
* melihat pengajuan miliknya sendiri
* melihat status
* melihat histori status
* menerima notifikasi

Penulis **tidak boleh mengakses data pengajuan milik penulis lain**.

---

# 8. Permission Matrix

| Resource / Action          | Admin |            Editor |         Penulis |
| -------------------------- | ----: | ----------------: | --------------: |
| Login                      |     ✅ |                 ✅ |               ✅ |
| Kelola profil sendiri      |     ✅ |                 ✅ |               ✅ |
| Kelola user                |     ✅ |                 ❌ |               ❌ |
| Kelola CMS                 |     ✅ |                 ❌ |               ❌ |
| Kelola layanan             |     ✅ |                 ❌ |               ❌ |
| Kelola harga               |     ✅ |                 ❌ |               ❌ |
| Kelola buku                |     ✅ |                 ❌ |               ❌ |
| Lihat seluruh submission   |     ✅ |                 ✅ |               ❌ |
| Membuat submission         |    ❌* |                ❌* |               ✅ |
| Melihat submission sendiri |    ❌* |                ❌* |               ✅ |
| Review submission          |     ✅ |                 ✅ |               ❌ |
| Mengubah status submission |     ✅ |          Terbatas |               ❌ |
| Melihat file submission    |     ✅ | Sesuai kewenangan |   Milik sendiri |
| Melihat audit trail        |     ✅ | Sesuai kewenangan | Histori sendiri |
| Melihat log email          |     ✅ |                 ❌ |               ❌ |

`*` Admin/editor dapat memiliki kemampuan teknis tertentu untuk support/operasional jika ditentukan kemudian, tetapi bukan bagian dari workflow utama MVP.

Authorization harus ditegakkan di **backend**, bukan hanya frontend.

---

# 9. Modul MVP

## 9.1 Website Informasi

Halaman minimal:

* Beranda
* Tentang Kami
* Layanan Penerbitan Buku
* Harga Paket Penerbitan
* Kontak
* Katalog Buku
* Detail Buku

Konten yang bersifat dinamis dikelola melalui CMS.

---

# 10. Homepage

Homepage minimal memiliki:

### Hero

* headline
* deskripsi
* CTA pengajuan naskah
* gambar/visual

### Layanan

Menampilkan layanan penerbitan.

### Harga

Menampilkan paket penerbitan.

### CTA

Mengarahkan pengguna untuk melakukan pengajuan.

### Buku Terbit

Menampilkan katalog buku pilihan.

Struktur field dapat dikembangkan melalui CMS tanpa mengubah kode frontend untuk perubahan konten rutin.

---

# 11. CMS

CMS minimal mengelola:

* halaman informatif
* layanan penerbitan
* paket harga
* buku
* pengaturan situs dasar

Entity CMS sebaiknya terstruktur, bukan hanya menyimpan seluruh konten sebagai blob JSON.

Entity awal yang dipertimbangkan:

```text
Page
Service
PricingPackage
Book
SiteSetting
```

CMS MVP tidak membutuhkan page builder kompleks.

---

# 12. Registrasi & Authentication

Sistem menyediakan:

* registrasi
* login
* logout
* email verification
* forgot password
* reset password
* JWT authentication
* role-based authorization

## Password

Password harus:

* disimpan menggunakan bcrypt
* tidak pernah disimpan plaintext
* tidak pernah muncul dalam log
* memiliki minimum complexity yang ditentukan saat implementasi

## JWT

Access token harus memiliki expiry.

Mekanisme refresh token harus menggunakan pendekatan yang aman dan mendukung revocation/rotation jika diterapkan.

Detail final authentication lifecycle dicatat dalam ADR.

---

# 13. Email Verification

Setelah registrasi:

```text
Register
   ↓
Email Verification
   ↓
Account Active
   ↓
Login
```

Email yang belum diverifikasi tidak dapat melakukan aktivitas tertentu yang membutuhkan akun aktif.

Token verifikasi harus:

* memiliki expiry
* tidak disimpan sebagai plaintext jika memungkinkan
* tidak dapat digunakan ulang setelah berhasil digunakan

---

# 14. Password Reset

Pengguna harus dapat meminta reset password.

Alur:

```text
Forgot Password
      ↓
Email
      ↓
Reset Token
      ↓
Set New Password
      ↓
Token Invalidated
```

Sistem tidak boleh mengungkapkan apakah sebuah email terdaftar melalui pesan yang berbeda secara eksplisit.

---

# 15. Pengajuan Naskah

Penulis dapat membuat pengajuan naskah.

Data minimal yang dibutuhkan ditentukan dalam data model, sekurang-kurangnya mencakup:

* judul naskah
* informasi penulis
* deskripsi/sinopsis
* jenis naskah
* dokumen naskah
* proposal bila diperlukan
* sampul bila diperlukan
* informasi pendukung lainnya

Form harus memiliki validasi frontend dan backend.

Backend adalah sumber kebenaran validasi.

---

# 16. Submission State Machine

Status pengajuan:

```text
DRAFT
SUBMITTED
REVIEW
ACCEPTED
REJECTED
IN_PRODUCTION
PUBLISHED
```

Alur normal:

```text
DRAFT
  │
  ▼
SUBMITTED
  │
  ▼
REVIEW
  │
  ├──────────────► REJECTED
  │
  ▼
ACCEPTED
  │
  ▼
IN_PRODUCTION
  │
  ▼
PUBLISHED
```

## Allowed Transition

| From           | To             | Aktor                          |
| -------------- | -------------- | ------------------------------ |
| Draft          | Submitted      | Penulis                        |
| Submitted      | Review         | Editor/Admin                   |
| Review         | Diterima       | Editor/Admin                   |
| Review         | Ditolak        | Editor/Admin                   |
| Diterima       | Dalam Produksi | Editor/Admin                   |
| Dalam Produksi | Terbit         | Admin                          |
| Ditolak        | Submitted      | Penulis (pengajuan ulang)      |

Transition yang tidak tercantum harus ditolak oleh backend.

Contoh:

```text
PUBLISHED → REVIEW
```

tidak diperbolehkan dalam MVP.

---

# 17. Rejection Reason

Ketika submission berubah menjadi:

```text
REJECTED
```

editor/admin wajib memberikan alasan penolakan.

Contoh:

```text
Status: Ditolak

Alasan:
Naskah belum memenuhi standar penerbitan.
```

Alasan penolakan menjadi bagian dari histori submission.

---

# 18. Audit Trail

Setiap perubahan status harus dicatat.

Data minimal:

```text
SubmissionStatusHistory

id
submission_id
from_status
to_status
changed_by
note
created_at
```

Sistem harus dapat menjawab:

* siapa yang mengubah?
* kapan?
* dari status apa?
* menjadi status apa?
* apa catatannya?

Audit trail tidak boleh dapat diubah oleh Penulis.

---

# 19. Upload File

Jenis file MVP:

### Manuskrip

* PDF
* Microsoft Word

### Sampul

* JPEG
* PNG
* format gambar lain jika disetujui

### Proposal

* PDF
* Microsoft Word

Ukuran maksimum setiap jenis file harus ditentukan sebelum implementasi final.

---

# 20. File Security

File harus:

* disimpan pada private bucket/object storage
* tidak dapat diakses melalui URL publik permanen
* divalidasi extension
* divalidasi MIME type
* divalidasi file signature/magic bytes jika memungkinkan
* memiliki ukuran maksimum
* menggunakan object key yang tidak mudah ditebak
* tidak menggunakan nama file asli sebagai path storage langsung
* memiliki authorization sebelum download

Akses file:

```text
User
  ↓
NestJS Authorization
  ↓
Ownership / Role Check
  ↓
Signed URL
  ↓
Private Wasabi Object
```

Penulis hanya boleh mengakses file miliknya sendiri.

Admin dapat mengakses seluruh file.

Editor hanya dapat mengakses file sesuai kewenangannya.

---

# 21. Storage Failure

Kegagalan upload ke storage harus ditangani tanpa meninggalkan record database yang tidak konsisten.

Sistem harus memiliki strategi untuk:

* upload gagal
* database gagal
* object berhasil tetapi database gagal
* database berhasil tetapi upload gagal
* orphan object

Strategi cleanup/reconciliation ditentukan dalam implementasi storage layer.

---

# 22. Notification

Perubahan status submission menghasilkan email notification.

Minimal event:

* registrasi
* verifikasi email
* reset password
* submission berhasil dikirim
* perubahan status submission

Email status submission minimal mencantumkan:

* judul naskah
* status baru
* catatan jika tersedia
* informasi tindakan berikutnya jika relevan

---

# 23. Email Failure Handling

Kegagalan email tidak boleh membatalkan perubahan status bisnis.

Contoh:

```text
Status berubah
     ↓
Database berhasil
     ↓
Email gagal
```

Submission tetap berada pada status baru.

Kegagalan email harus dicatat dan dapat di-retry.

Jika asynchronous job/queue digunakan, kegagalan delivery harus memiliki:

* retry policy
* maximum retry
* error logging
* final failure state

---

# 24. Email Log

Sistem menyimpan informasi pengiriman email secara aman.

Minimal:

```text
EmailLog

id
type
recipient
reference_id
status
attempt_count
sent_at
error
created_at
```

Informasi sensitif tidak boleh dimasukkan ke log secara berlebihan.

---

# 25. Katalog Buku

Website memiliki katalog buku.

Data minimal:

```text
Book

id
title
slug
author
isbn
description
cover
publication_date
purchase_url
is_published
created_at
updated_at
```

Pembelian dilakukan di luar website.

Website hanya menyediakan link menuju external bookstore.

Tidak ada:

* cart
* checkout
* payment gateway
* internal order

pada MVP.

---

# 26. API

Backend menyediakan REST API.

API harus memiliki:

* versioning bila diperlukan
* consistent response format
* validation
* authentication
* authorization
* pagination
* filtering sesuai kebutuhan
* error handling
* HTTP status code yang tepat

Endpoint administratif harus membutuhkan authentication dan authorization.

---

# 27. Error Handling

Backend tidak boleh mengembalikan stack trace atau informasi internal kepada client production.

Error response harus konsisten.

Contoh:

```json
{
  "success": false,
  "message": "Naskah tidak ditemukan",
  "code": "SUBMISSION_NOT_FOUND"
}
```

Detail internal dicatat di server log.

---

# 28. Security Baseline

MVP minimal menerapkan:

* HTTPS
* Helmet
* CORS policy
* rate limiting
* input validation
* JWT expiry
* secure password hashing
* RBAC
* object-level authorization
* upload validation
* private object storage
* secure HTTP headers
* database least privilege
* secrets melalui environment configuration
* dependency security review

JWT, password, secret key, SMTP credential, database credential, dan storage credential tidak boleh di-commit ke repository.

---

# 29. Rate Limiting

Rate limiting minimal diterapkan pada endpoint sensitif:

* login
* register
* forgot password
* reset password
* upload
* submission
* endpoint lain yang rawan abuse

CAPTCHA pihak ketiga tidak digunakan pada MVP.

Bot/abuse mitigation dilakukan melalui rate limiting, validation, request size restriction, dan mekanisme keamanan backend lainnya.

---

# 30. Database

Database:

**PostgreSQL**

ORM:

**Prisma**

Entity awal yang dipertimbangkan:

```text
User
Role
Submission
SubmissionFile
SubmissionStatusHistory
Book
Page
Service
PricingPackage
SiteSetting
EmailLog
RefreshToken / Session
EmailVerification
PasswordResetToken
```

Entity final ditetapkan setelah domain modeling.

Semua schema change harus menggunakan migration.

Migration tidak boleh dilakukan dengan mengubah database production secara manual tanpa prosedur yang terdokumentasi.

---

# 31. Database Integrity

Relationship dan constraint harus diterapkan di level database jika memungkinkan.

Contoh:

* unique email
* unique slug
* foreign key
* required fields
* enum status
* timestamp

Business rule tetap divalidasi pada application layer.

---

# 32. Transaction

Operasi yang memerlukan atomicity harus menggunakan database transaction.

Contoh:

```text
Perubahan status
+
pembuatan status history
```

harus konsisten.

Jika salah satu gagal, operasi database harus rollback.

Pengiriman email tidak boleh menjadi bagian dari transaction database utama.

---

# 33. Frontend

Next.js menggunakan App Router.

Frontend harus:

* responsive
* accessible
* menggunakan semantic HTML
* memiliki loading state
* memiliki error state
* memiliki empty state
* memiliki form validation
* menangani unauthorized/forbidden
* tidak mempercayai authorization dari frontend

---

# 34. Accessibility

Target minimal:

**WCAG 2.1 AA**, sejauh memungkinkan dalam scope MVP.

Minimal mencakup:

* keyboard navigation
* semantic HTML
* label form
* alt text
* sufficient contrast
* focus state
* accessible error message

---

# 35. SEO

Halaman publik minimal harus memiliki:

* title
* meta description
* canonical URL bila diperlukan
* Open Graph metadata
* semantic heading
* sitemap
* robots configuration

SEO tidak menjadi prioritas untuk dashboard internal.

---

# 36. Performance

Target awal MVP:

* halaman publik memiliki loading performance yang baik pada koneksi mobile
* API umum memiliki response time yang wajar
* pagination digunakan untuk dataset besar
* file tidak dilewatkan melalui backend apabila direct/presigned upload lebih sesuai
* image menggunakan optimization yang sesuai Next.js

Angka SLA/performance final dapat ditetapkan setelah baseline testing.

---

# 37. Observability

Backend minimal menyediakan:

```text
/health
```

Health check harus dapat memastikan aplikasi berjalan.

Production harus memiliki:

* application logs
* error logs
* container logs
* database health
* storage health bila memungkinkan

Log tidak boleh berisi:

* password
* JWT
* refresh token
* secret
* isi dokumen
* PII yang tidak diperlukan

---

# 38. Deployment Architecture

Target:

```text
Internet
   │
   ▼
Reverse Proxy
   │
   ├──────────────► Next.js
   │
   └──────────────► NestJS
                         │
                         ├──► PostgreSQL
                         │
                         ├──► Wasabi
                         │
                         └──► SMTP
```

Docker Compose digunakan untuk menjalankan service aplikasi.

PostgreSQL harus menggunakan persistent volume.

---

# 39. Production Security

VPS minimal harus memiliki:

* HTTPS
* firewall
* hanya port yang diperlukan terbuka
* SSH security
* Docker network isolation
* secret management melalui environment
* automatic restart policy
* regular update/security patch
* database tidak diekspos langsung ke public internet

---

# 40. Backup

Backup merupakan requirement production.

Minimal:

### Database

* backup terjadwal
* retention policy
* backup disimpan di lokasi yang sesuai
* restore procedure terdokumentasi

### File

Storage backup/versioning policy harus ditentukan untuk Wasabi.

Backup dianggap valid hanya setelah **restore test berhasil dilakukan**.

---

# 41. Recovery

Dokumentasi deployment harus mencakup:

* cara restore database
* cara restore file
* cara rebuild container
* cara mengganti environment variable
* cara rollback deployment
* cara memulihkan aplikasi setelah VPS failure

Target recovery seperti RPO/RTO dapat ditentukan sebelum production launch.

---

# 42. CI/CD

CI/CD belum menjadi requirement MVP.

Jika CI/CD disetujui kemudian, pipeline minimal harus melakukan:

```text
Lint
  ↓
Unit Test
  ↓
Build
  ↓
Integration/E2E Test
  ↓
Docker Build
  ↓
Deploy
```

Implementasi CI/CD dibahas melalui ADR tersendiri.

---

# 43. Testing Strategy

Testing merupakan bagian dari development, bukan aktivitas setelah development selesai.

Minimal:

### Unit Test

Untuk:

* business rules
* service
* state transition
* validation
* utility

### Integration Test

Untuk:

* database
* authentication
* authorization
* storage integration
* email integration

### E2E Test

Minimal mencakup:

```text
Register
Login
Submit manuscript
Upload file
Editor review
Accept
Reject
Production
Published
```

### Security Test

Minimal:

* unauthorized access
* horizontal privilege escalation
* vertical privilege escalation
* invalid JWT
* expired JWT
* upload bypass
* IDOR
* rate limit
* malformed input

---

# 44. Acceptance Criteria

Fitur dianggap selesai apabila:

1. Requirement bisnis terpenuhi.
2. Backend validation berjalan.
3. Authorization berjalan.
4. Error handling tersedia.
5. Unit/integration/E2E test yang relevan lulus.
6. Tidak terdapat critical/high security issue yang belum ditangani.
7. Logging relevan tersedia.
8. Dokumentasi teknis diperbarui.
9. Migration database tersedia bila terdapat perubahan schema.
10. Deployment dapat dilakukan menggunakan prosedur yang terdokumentasi.

---

# 45. Submission Acceptance Criteria

Contoh acceptance criteria:

### Submit

**Given**

Penulis telah login dan memiliki draft valid.

**When**

Penulis mengirim pengajuan.

**Then**

* submission berhasil dibuat
* status menjadi `SUBMITTED`
* file telah tersedia
* histori status tercatat
* penulis dapat melihat submission
* editor/admin dapat melihat submission sesuai authorization
* notification dibuat

### Reject

**Given**

Submission berada pada `REVIEW`.

**When**

Editor menolak submission.

**Then**

* status menjadi `REJECTED`
* rejection reason wajib tersedia
* histori tercatat
* editor tercatat sebagai actor
* notification dibuat
* penulis dapat melihat alasan penolakan

### Unauthorized Access

**Given**

Penulis A login.

**When**

Penulis A mencoba mengakses submission Penulis B.

**Then**

Request ditolak oleh backend.

---

# 46. Definition of Done

Sebuah fitur hanya dianggap selesai apabila:

```text
Requirement terpenuhi
        +
Code selesai
        +
Validation selesai
        +
Authorization selesai
        +
Test selesai
        +
Security review selesai
        +
Documentation selesai
```

"Berhasil tampil di browser" tidak dianggap sebagai Definition of Done.

---

# 47. Architecture Decision Records

Keputusan arsitektur penting disimpan di:

```text
docs/adr/
```

ADR awal:

```text
ADR-001 — Modular Monolith Architecture
ADR-002 — NestJS Backend
ADR-003 — Next.js Frontend
ADR-004 — PostgreSQL and Prisma
ADR-005 — JWT Authentication
ADR-006 — S3-Compatible Object Storage
ADR-007 — Wasabi Storage
ADR-008 — Submission State Machine
ADR-009 — Email Notification Strategy
ADR-010 — Docker Compose Deployment
ADR-011 — Private File Access Strategy
```

Format ADR:

```text
# Context

# Decision

# Alternatives

# Consequences
```

---

# 48. Engineering Principles

Development harus mengikuti prinsip:

1. Security by design.
2. Backend adalah sumber kebenaran business rule.
3. Frontend tidak dipercaya untuk authorization.
4. Data sensitif tidak dimasukkan ke log.
5. File naskah bersifat private.
6. Business transaction tidak bergantung pada SMTP.
7. Database migration harus versioned.
8. Perubahan arsitektur penting harus memiliki ADR.
9. Semua workflow penting memiliki test.
10. Semua production deployment harus dapat diulang dan dipulihkan.

---

# 49. Prioritas MVP

## P0 — Wajib

* Website publik
* Authentication
* Role & authorization
* Submission
* Upload file
* Submission workflow
* Editor review
* Admin CMS
* Book catalog
* Email notification
* Audit trail
* Private file access
* Security baseline
* Database migration
* Production deployment
* Backup

## P1 — Penting

* Email retry
* Notification log
* Health check
* Monitoring dasar
* E2E test
* Security testing
* Restore testing

## P2 — Setelah MVP

* CI/CD
* Advanced monitoring
* Advanced analytics
* Additional integrations
* Workflow editorial lanjutan

---

# 50. Open Decisions

Open Decisions di bawah telah diselesaikan — lihat **Section 53**.

---

# 51. Rule Implementasi AI Agent

AI coding agent yang digunakan dalam project harus:

* membaca requirements sebelum coding
* membaca ADR yang relevan
* tidak mengubah requirement bisnis tanpa persetujuan
* tidak membuat asumsi terhadap requirement yang ambigu
* memberi tahu jika menemukan contradiction
* membuat test untuk business logic
* tidak menghapus test untuk membuat build lulus
* tidak menonaktifkan security control untuk mengatasi error
* tidak menyimpan secret di source code
* tidak melakukan destructive database operation tanpa konfirmasi
* memperbarui dokumentasi jika perubahan arsitektur terjadi

Jika requirement tidak cukup jelas, agent harus:

```text
STOP
↓
IDENTIFY AMBIGUITY
↓
ASK / DOCUMENT DECISION
↓
IMPLEMENT
```

bukan:

```text
GUESS
↓
IMPLEMENT
```

---

# 52. Status Dokumen

Dokumen ini menjadi **baseline engineering** setelah seluruh bagian Open Decisions diselesaikan (lihat Section 53).

Perubahan requirement setelah baseline harus:

1. dicatat;
2. dianalisis dampaknya;
3. memperbarui dokumentasi terkait;
4. memperbarui test/acceptance criteria;
5. memperbarui ADR jika perubahan bersifat arsitektural.

**Target akhir:** sistem yang bukan hanya dapat berjalan, tetapi dapat diuji, diamankan, dideploy, dimonitor, dan dipulihkan secara terukur.

---

# 53. Open Decisions — Resolved (Disetujui)

Keputusan berikut disetujui pada baseline dan menjadi dasar implementasi:

| # | Keputusan | Nilai yang disetujui |
|---|---|---|
| 1 | Batas ukuran file | Manuskrip/Proposal: **20 MB**; Sampul: **5 MB** |
| 2 | Format file final | Manuskrip/Proposal: **PDF, DOCX, DOC**; Sampul: **JPEG, PNG, WebP** |
| 3 | Email verification wajib sebelum login | **Ya**, untuk role Penulis. Admin/Editor dibuat via seed (aktif langsung). |
| 4 | Refresh token/session | Desain dicatat di ADR-005; **implementasi P2**. MVP: access token (expiry 8 jam). |
| 5 | Password policy | Min 8 karakter, wajib huruf + angka, bcrypt cost 10, tanpa lockout (rate limit cukup). |
| 6 | Permission final Admin vs Editor | Sesuai matrix Section 8 persis. Editor: hanya lihat/review submission; tanpa kelola buku/CMS/harga/layanan/user. |
| 7 | Editor ubah `ACCEPTED → IN_PRODUCTION` | **Ya** |
| 8 | `IN_PRODUCTION → PUBLISHED` | **Admin saja** |
| 9 | REJECTED boleh diajukan ulang | **Ya** — `REJECTED → SUBMITTED` oleh Penulis |
| 10 | Field submission final | Judul, penulis, sinopsis/deskripsi, jenis naskah, manuskrip (wajib), proposal (opsional), sampul (opsional), catatan |
| 11 | Struktur CMS final | `Page`, `Service`, `PricingPackage`, `SiteSetting` (key-value); tanpa page builder |
| 12 | Provider SMTP | Dikonfigurasi via `.env`; dev menggunakan SMTP sandbox (Mailpit/Ethereal) |
| 13 | Retention email log | **90 hari** |
| 14 | Backup schedule & retention | **pg_dump harian**, retensi 14 hari, backup mingguan offsite |
| 15 | RPO/RTO | RPO ≤ 24 jam; RTO ≤ 4 jam |
| 16 | VPS spec | **2 vCPU / 4 GB RAM / 50 GB SSD** |
| 17 | Reverse proxy | **Caddy** (HTTPS otomatis via Let's Encrypt) |
| 18 | Domain & HTTPS | `press.uninus.ac.id` + Let's Encrypt |
| 19 | Production env config | `.env` di VPS (bukan di repo); `.env.example` bebas secret; gitignore ketat |
| 20 | CI/CD MVP | **Tidak** — dibahas via ADR tersendiri setelah MVP |
