import Link from "next/link";
import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Beranda | Penerbitan Buku",
  description:
    "UNINUS Press melayani pengajuan penerbitan buku bagi dosen, peneliti, mahasiswa, dan masyarakat umum dengan proses yang transparan.",
};

const services = [
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    title: "Pengajuan Naskah",
    desc: "Ajukan naskah buku Anda secara online, pantau statusnya kapan saja.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Verifikasi Dokumen",
    desc: "Verifikasi kelengkapan dokumen dilakukan oleh admin secara transparan.",
  },
  {
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    title: "Layouting & Desain",
    desc: "Pelaksana melakukan layouting dan desain hingga menghasilkan PDF siap cetak.",
  },
  {
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Distribusi & Perpusnas",
    desc: "Naskah diusulkan ke Perpustakaan Nasional untuk mendapatkan ISBN/QR.",
  },
  {
    icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
    title: "Monitoring Transparan",
    desc: "Pantau setiap tahap penerbitan melalui notifikasi dan riwayat status.",
  },
  {
    icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
    title: "Dokumen Terenkripsi",
    desc: "Dokumen naskah Anda aman dan hanya dapat diakses oleh pihak yang berwenang.",
  },
];

const books = [
  { title: "Manajemen Pendidikan Islam", author: "Dr. Ahmad Fauzi, M.Ag.", year: 2025 },
  { title: "Ekonomi Syariah Kontemporer", author: "Prof. Siti Nurhaliza, M.Ec.", year: 2025 },
  { title: "Teknologi Pendidikan Digital", author: "Rudi Hartono, M.Pd.", year: 2024 },
  { title: "Hukum Bisnis Islam", author: "Dr. Muhammad Rizal, M.H.", year: 2024 },
  { title: "Metodologi Penelitian Kuantitatif", author: "Dr. Lia Kurniawati, M.Si.", year: 2024 },
  { title: "Sejarah Peradaban Islam", author: "Dr. Hasan Basri, M.A.", year: 2023 },
];

const benefits = [
  { title: "Layanan Terpadu", desc: "Satu pintu untuk seluruh proses penerbitan, dari verifikasi hingga distribusi." },
  { title: "Editor & Layouter Profesional", desc: "Tim editor dan layouter berpengalaman untuk hasil naskah yang siap terbit." },
  { title: "Hemat Waktu & Biaya", desc: "Alur online yang efisien memangkas waktu dan biaya penerbitan." },
  { title: "Format Digital & Cetak", desc: "Dukungan format buku digital dan/atau cetak sesuai kebutuhan." },
  { title: "Royalti Terjamin", desc: "Sistem bagi hasil yang transparan untuk setiap judul yang terbit." },
  { title: "Pemasaran Buku", desc: "Dukungan pemasaran buku melalui katalog, toko buku, dan marketplace." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-uninus-dark">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-uninus-yellow">
              Selamat Datang di UNINUS Press
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Terbitkan Buku Anda
              <br />
              dengan Mudah & Transparan
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              UNINUS Press melayani pengajuan penerbitan buku bagi dosen,
              mahasiswa, dan masyarakat umum. Ajukan naskah Anda dan pantau
              prosesnya secara real-time melalui dashboard.
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
                className="rounded-full border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-uninus-dark"
              >
                Lihat Layanan
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/10" />
            <div className="relative rounded-[2rem] bg-white p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-uninus-dark">
                  Status Pengajuan
                </span>
                <span className="rounded-full bg-uninus-soft px-3 py-1 text-xs font-bold text-uninus">
                  Sedang Diverifikasi
                </span>
              </div>
              <div className="mt-6 space-y-6">
                {[
                  { label: "Pengajuan & Verifikasi", done: true },
                  { label: "Review Pelaksana", done: false },
                  { label: "Layouting", done: false },
                  { label: "Perpusnas & Penerbitan", done: false },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        step.done
                          ? "bg-uninus text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {step.label}
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${step.done ? "bg-uninus" : "w-0"}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Layanan Penerbitan"
          subtitle="Proses penerbitan buku yang lengkap, mulai dari pengajuan hingga distribusi."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={service.icon}
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Mengapa Memilih UNINUS Press?"
          subtitle="Kemudahan transaksi dan pengiriman untuk transaksi penerbitan buku Anda."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
            >
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-uninus-soft text-uninus">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-uninus py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: "500+", label: "Judul Terbit" },
            { value: "300+", label: "Penulis" },
            { value: "10+", label: "Tahun Berkarya" },
            { value: "100%", label: "Proses Transparan" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-extrabold">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/85">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Terbitan Terbaru"
          subtitle="Koleksi buku yang telah diterbitkan oleh UNINUS Press."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <article
              key={book.title}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex aspect-[3/4] items-center justify-center bg-uninus-soft p-6">
                <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-uninus/30 bg-white p-4">
                  <div className="text-center">
                    <p className="text-sm font-bold leading-snug text-uninus-dark">
                      {book.title}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">{book.year}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-base font-bold text-gray-900">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{book.author}</p>
              </div>
            </article>
          ))}
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

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Pembayaran & Pengiriman"
            subtitle="Berbagai pilihan pembayaran dan pengiriman untuk kemudahan transaksi Anda."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                VA Multibank &amp; QRIS
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Kami menerima pembayaran melalui Virtual Account BNI, Mandiri,
                BRI, BJB, Permata, dan QRIS.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Kurir Pengiriman
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Pengiriman buku dapat diambil langsung di UNINUS Press (gratis)
                atau dikirim melalui kurir.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-uninus-soft text-uninus">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Harga Terjangkau
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Paket penerbitan dengan biaya terjangkau, cocok untuk dosen,
                peneliti, dan mahasiswa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-uninus-soft py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-uninus-dark sm:text-4xl">
            Siap Menerbitkan Buku Anda?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Daftar akun dan ajukan naskah Anda. Tim kami akan memandu setiap
            tahap penerbitan hingga buku Anda terbit.
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