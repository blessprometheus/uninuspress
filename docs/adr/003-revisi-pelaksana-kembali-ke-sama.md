# ADR-003: Revisi Pelaksana Kembali ke Pelaksana yang Sama

**Status:** Accepted  
**Date:** 2026-08-21

## Context
Ketika pelaksana meminta revisi ke user, setelah user submit ulang, pengajuan harus kembali ke pelaksana yang sama (bukan ke admin pool).

## Decision
Field `assigned_executor_id` tidak direset saat revisi. Saat user submit ulang dari `NEEDS_USER_REVISION_EXECUTOR`, status kembali ke `EXECUTOR_REVIEW` dengan pelaksana yang sama.

## Consequences
- `assigned_executor_id` tetap terisi selama siklus hidup pengajuan.
- Pelaksana tidak perlu menunggu admin untuk reassign.
- Konsisten dengan ekspektasi user ("saya sudah tahu siapa pelaksana saya").