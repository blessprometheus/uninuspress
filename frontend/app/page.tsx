import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Beranda | UNINUS Press",
  description:
    "UNINUS Press melayani pengajuan penerbitan buku bagi dosen, peneliti, mahasiswa, dan masyarakat umum dengan proses yang transparan.",
};

const services = [
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    title: "Pengajuan Naskah",
    desc: "Ajukan naskah buku Anda secara online, pantau statusnya kapan saja dari dashboard.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Verifikasi Dokumen",
    desc: "Kelengkapan dokumen diverifikasi admin secara transparan, dengan catatan bila perlu revisi.",
  },
  {
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    title: "Layouting & Desain",
    desc: "Pelaksana menata letak dan desain hingga menghasilkan PDF serta Word final siap terbit.",
  },
  {
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Perpusnas & ISBN",
    desc: "Naskah diusulkan ke Perpustakaan Nasional untuk penetapan ISBN dan registrasi nasional.",
  },
  {
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    title: "Monitoring Transparan",
    desc: "Setiap tahap tercatat dalam riwayat status dan notifikasi, sehingga proses dapat dipantau.",
  },
  {
    icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    title: "Dokumen Aman",
    desc: "Naskah Anda tersimpan terenkripsi dan hanya dapat diakses pihak yang berwenang.",
  },
];

const benefits = [
  { title: "Layanan Terpadu", desc: "Satu pintu untuk seluruh proses penerbitan, dari verifikasi hingga distribusi." },
  { title: "Editor & Layouter Profesional", desc: "Tim editor dan layouter berpengalaman untuk hasil naskah yang siap terbit." },
  { title: "Hemat Waktu", desc: "Alur online yang efisien memangkas waktu penerbitan tanpa bolak-balik berkas." },
  { title: "Format Digital & Cetak", desc: "Dukungan format buku digital dan/atau cetak sesuai kebutuhan penulis." },
  { title: "Royalti Transparan", desc: "Sistem bagi hasil yang jelas untuk setiap judul yang terbit." },
  { title: "Pendampingan Penulis", desc: "Tim kami memandu setiap tahap hingga buku Anda resmi terbit." },
];

const steps = [
  { no: "01", title: "Ajukan Naskah", desc: "Daftar, lengkapi dokumen, dan bayar biaya penerbitan di awal." },
  { no: "02", title: "Verifikasi & Review", desc: "Admin lalu pelaksana meninjau naskah dan memberi catatan bila perlu." },
  { no: "03", title: "Layouting", desc: "Pelaksana menata naskah menjadi PDF dan Word final yang rapi." },
  { no: "04", title: "Perpusnas & Terbit", desc: "Usulan ke Perpusnas, penetapan ISBN, lalu buku siap didistribusikan." },
];

const books = [
  { title: "Manajemen Pendidikan Islam", author: "Dr. Ahmad Fauzi, M.Ag.", year: 2025, color: "#008f4f", h: 232 },
  { title: "Ekonomi Syariah Kontemporer", author: "Prof. Siti Nurhaliza, M.Ec.", year: 2025, color: "#004d29", h: 200 },
  { title: "Teknologi Pendidikan Digital", author: "Rudi Hartono, M.Pd.", year: 2024, color: "#fbc02d", h: 256 },
  { title: "Hukum Bisnis Islam", author: "Dr. Muhammad Rizal, M.H.", year: 2024, color: "#006f3c", h: 216 },
  { title: "Metodologi Penelitian Kuantitatif", author: "Dr. Lia Kurniawati, M.Si.", year: 2024, color: "#0b2a1e", h: 244 },
  { title: "Sejarah Peradaban Islam", author: "Dr. Hasan Basri, M.A.", year: 2023, color: "#2e7d4f", h: 188 },
];

const stats = [
  { value: "500+", label: "Judul Terbit" },
  { value: "300+", label: "Penulis" },
  { value: "10+", label: "Tahun Berkarya" },
  { value: "100%", label: "Proses Transparan" },
];

const packages = [
  {
    name: "Dasar",
    note: "Untuk naskah yang sudah rapi dan siap terbit.",
    features: ["Pengurusan ISBN", "Layouting dasar", "1x revisi naskah"],
    highlight: false,
  },
  {
    name: "Standar",
    note: "Paling banyak dipilih penulis pemula.",
    features: [
      "Semua fitur Dasar",
      "Desain sampul depan & belakang",
      "Editing & proofreading",
      "Distribusi ke Toko Buku",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    note: "Pendampingan penuh hingga pemasaran.",
    features: [
      "Semua fitur Standar",
      "Pemasaran prioritas",
      "Format cetak & digital",
      "Pendampingan khusus penulis",
    ],
    highlight: false,
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-uninus-dark">
        <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_38px,#ffffff_38px,#ffffff_40px)]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-uninus-yellow">
              Penerbitan Buku UNINUS
            </p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
              Dari naskah menjadi buku,
              <span className="text-uninus-yellow"> terbitan resmi.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              UNINUS Press melayani pengajuan penerbitan buku bagi dosen,
              mahasiswa, peneliti, dan masyarakat umum. Pantau perjalanan
              naskah Anda dari verifikasi hingga ISBN&mdash;semua tercatat
              dan transparan.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/daftar"
                className="rounded-full bg-uninus-yellow px-8 py-3.5 text-base font-bold text-uninus-dark shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Ajukan Naskah Sekarang
              </Link>
              <Link
                href="/layanan"
                className="rounded-full border-2 border-white/70 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-uninus-dark"
              >
                Lihat Layanan
              </Link>
            </div>
          </div>

          {/* Perjalanan Naskah — tracker bertema spine */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-[1.75rem] bg-paper p-7 shadow-2xl ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Perjalanan Naskah</span>
                <span className="rounded-full bg-uninus-soft px-3 py-1 text-xs font-bold text-uninus-dark">
                  Sedang Diverifikasi
                </span>
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { label: "Pengajuan & Verifikasi", done: true },
                  { label: "Review Pelaksana", done: false },
                  { label: "Layouting", done: false },
                  { label: "Perpusnas & Terbit", done: false },
                ].map((step, i) => (
                  <li key={step.label} className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        step.done
                          ? "bg-uninus text-white"
                          : "bg-ink/5 text-ink/40"
                      }`}
                      style={{ borderLeft: step.done ? "3px solid #fbc02d" : "3px solid transparent" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${step.done ? "text-ink" : "text-ink/50"}`}>
                        {step.label}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                        <div
                          className={`h-full rounded-full bg-uninus ${step.done ? "w-full" : "w-0"}`}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Layanan Penerbitan"
          subtitle="Proses penerbitan buku yang lengkap, mulai dari pengajuan hingga distribusi."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-ink/10 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-ink">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MENGAPA MEMILIH */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Mengapa Memilih UNINUS Press?"
            subtitle="Pendampingan menyeluruh agar naskah Anda layak dan siap terbit."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
              >
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-uninus-soft text-uninus">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALUR PENERBITAN */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Cara Menerbitkan Buku"
          subtitle="Empat tahap jelas, dari naskah masuk hingga buku resmi terbit."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.no} className="relative rounded-2xl border border-ink/10 bg-white p-7">
              <span className="font-display block text-4xl font-semibold text-uninus/30">{step.no}</span>
              <h3 className="mt-3 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAKET PENERBITAN */}
      <section id="paket-penerbitan" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Paket Penerbitan"
          subtitle="Pilihan layanan penerbitan yang dapat disesuaikan dengan kebutuhan naskah Anda."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all ${
                pkg.highlight
                  ? "border-uninus bg-uninus text-white shadow-lg"
                  : "border-ink/10 bg-white hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
              }`}
            >
              {pkg.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-uninus-yellow px-4 py-1 text-xs font-bold text-uninus-dark">
                  Paling Populer
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold">{pkg.name}</h3>
              <p className={`mt-2 text-sm ${pkg.highlight ? "text-white/80" : "text-gray-500"}`}>
                {pkg.note}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <svg
                      className={`mt-0.5 h-5 w-5 shrink-0 ${pkg.highlight ? "text-uninus-yellow" : "text-uninus"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={pkg.highlight ? "text-white/90" : "text-gray-700"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/kontak"
                className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                  pkg.highlight
                    ? "bg-uninus-yellow text-uninus-dark hover:bg-white"
                    : "bg-uninus text-white hover:bg-uninus-dark"
                }`}
              >
                Tanya Harga
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          * Konten paket masih draf dan akan direvisi sesuai kebutuhan.
        </p>
      </section>

      {/* STATS */}
      <section className="bg-uninus py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-5xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/85">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TERBITAN TERBARU — SIGNATURE: Rak Buku */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Terbitan Terbaru"
          subtitle="Koleksi buku yang telah diterbitkan oleh UNINUS Press."
        />
        <div className="mt-14">
          <div className="flex min-h-[260px] items-end justify-center gap-3 sm:gap-5">
            {books.map((book) => (
              <div
                key={book.title}
                className="group relative flex w-16 shrink-0 flex-col justify-between overflow-hidden rounded-t-md px-2 py-4 text-center shadow-md transition-transform hover:-translate-y-2 sm:w-20"
                style={{ height: `${book.h}px`, backgroundColor: book.color }}
              >
                <span
                  className="mx-auto block text-[11px] font-bold uppercase tracking-wide text-white/90 [writing-mode:vertical-rl] rotate-180"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                >
                  {book.title}
                </span>
                <span className="mx-auto block text-[9px] font-medium text-white/70 [writing-mode:vertical-rl] rotate-180">
                  {book.year}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-auto h-3 max-w-3xl rounded-b-sm bg-uninus-dark shadow-inner" />
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-gray-500">
            Rak di atas menampilkan sebagian judul terbitan kami.
          </p>
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/toko-buku"
            className="rounded-full bg-uninus px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-uninus-dark"
          >
            Lihat Semua Buku
          </Link>
        </div>
      </section>

      {/* BIAYA & PENGIRIMAN */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Biaya & Pengiriman"
            subtitle="Biaya lunas di awal, lalu naskah diproses hingga buku tiba di tangan Anda."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-ink">Biaya Lunass Di Awal</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Bayar biaya penerbitan sebelum submit, lalu unggah kwitansi
                lunas bersama dokumen naskah Anda.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-ink">Ambil di UNINUS Press</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Buku cetak dapat diambil langsung di kampus UNINUS tanpa
                biaya kirim.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-ink">Kurir Pengiriman</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Buku dapat dikirim ke alamat Anda melalui kurir sesuai
                kesepakatan pengiriman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-uninus-soft py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
            Siap Menerbitkan Buku Anda?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Daftar akun dan ajukan naskah. Tim kami memandu setiap tahap
            penerbitan hingga buku Anda terbit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/daftar"
              className="rounded-full bg-uninus px-10 py-4 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/kontak"
              className="rounded-full border-2 border-uninus px-10 py-4 text-base font-semibold text-uninus transition-colors hover:bg-uninus hover:text-white"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
