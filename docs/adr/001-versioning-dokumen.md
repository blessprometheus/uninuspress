# ADR-001: Versioning Dokumen per Jenis

**Status:** Accepted  
**Date:** 2026-08-21

## Context
User dapat mengunggah ulang dokumen saat revisi. Dokumen lama tidak boleh hilang karena diperlukan untuk audit trail dan perbandingan.

## Decision
Setiap unggahan dokumen mendapatkan versi baru per jenis dokumen (`synopsis_v1`, `synopsis_v2`, dst). Media Library Spatie menyimpan semua versi; versi terbaru adalah media dengan `id` terbesar di collection tersebut. Dokumen lama tidak dihapus, hanya ditimpa secara logis dengan versi baru.

## Consequences
- Semua versi dokumen tetap tersimpan di storage.
- History upload terekam otomatis di audit trail.
- Collection name yang sama digunakan untuk semua versi; versi dibedakan via `usingFileName()`.