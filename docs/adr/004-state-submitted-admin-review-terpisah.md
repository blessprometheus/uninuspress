# ADR-004: State SUBMITTED dan ADMIN_REVIEW Dipisah

**Status:** Accepted  
**Date:** 2026-08-21

## Context
Perlu pembedaan antara "user baru saja submit" dan "admin sudah mulai mereview" untuk kepentingan audit trail dan notifikasi, meskipun tampilan ke user sama ("Sedang Diverifikasi").

## Decision
`SUBMITTED` → `ADMIN_REVIEW` adalah dua state terpisah. Admin harus secara eksplisit memulai review (`POST /admin/submissions/{id}/start-review`) untuk transisi dari `SUBMITTED` ke `ADMIN_REVIEW`. Tampilan ke user tetap sama.

## Consequences
- Audit trail lebih granular.
- Memungkinkan notifikasi berbeda: "Baru diajukan" vs "Sedang direview admin".
- Satu langkah ekstra di API admin.