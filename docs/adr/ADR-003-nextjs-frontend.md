# ADR-003: Next.js Frontend

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Frontend publik (informasi, katalog buku, auth, dashboard penulis) dan panel admin. Perlu responsif, aksesibel (WCAG 2.1 AA), dan SEO untuk halaman publik.
- **Alternatives:**
  - React SPA (Vite) — kurang SEO, perlu setup routing/SSR terpisah.
  - Next.js Pages Router — bisa, tetapi App Router adalah konvensi modern dan sudah dipakai.
- **Decision:** Gunakan **Next.js + React + TypeScript (App Router)**.
  - Halaman publik: **Server Components** (fetch data di server, SEO-ready).
  - Interaktivitas & area berauth (dashboard, admin, form): **Client Components**.
  - Konteks auth via `AuthProvider` (JWT di localStorage + `useAuth`); `GuestOnly` untuk redirect user yang sudah login dari `/masuk` dan `/daftar`.
  - Navigasi & menu berbasis role (ADMIN/EDITOR/AUTHOR); frontend **tidak dipercaya** untuk authorization — backend selalu menegakkan (Section 8, 33).
  - Loading / error / empty state pada semua data fetch.
  - Metadata, Open Graph, sitemap, robots untuk halaman publik.
- **Consequences:**
  - Server/client boundary harus dijaga konsisten (fetch di server vs client).
  - State auth bersifat client-side; token disimpan aman dan dihapus saat logout.
  - Konten CMS dirender dari API; perubahan konten tidak perlu rebuild frontend.
