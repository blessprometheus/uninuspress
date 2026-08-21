# ADR-002: Approve Admin + Pilih Pelaksana Satu Action

**Status:** Accepted  
**Date:** 2026-08-21

## Context
Setelah admin selesai review dan menyetujui pengajuan, perlu ada pelaksana yang ditugaskan. Awalnya dipertimbangkan dua langkah terpisah: approve dulu, baru pilih pelaksana.

## Decision
Approve dan pilih pelaksana dilakukan dalam satu action (`POST /admin/submissions/{id}/approve-assign` dengan body `executor_id`). Begitu admin approve, status langsung `ASSIGNED_TO_EXECUTOR`.

## Consequences
- Satu request API, tidak ada state `APPROVED_BUT_NOT_ASSIGNED`.
- Admin harus sudah menentukan pelaksana sebelum approve.
- Lebih sederhana di frontend (satu tombol + satu dropdown).