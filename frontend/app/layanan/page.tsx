import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Layanan Penerbitan",
  description:
    "Alur penerbitan buku yang jelas dan terstruktur di UNINUS Press. Layanan ISBN, editing, layout, desain sampul, dan pemasaran buku.",
};

const steps = [
  { no: "01", title: "Registrasi & Pengajuan", desc: "Daftar akun lalu ajukan naskah beserta dokumen kelengkapan (sinopsis, naskah, cover, kwitansi, dan bukti cek plagiasi)." },
  { no: "02", title: "Verifikasi Dokumen", desc: "Admin memverifikasi kelengkapan dan kesesuaian dokumen. Jika ada yang kurang, Anda akan diminta memperbaiki." },
  { no: "03", title: "Review & Layouting", desc: "Pelaksana meninjau naskah dan melakukan proses layouting hingga menghasilkan PDF dan Word final." },
  { no: "04", title: "Pengusulan Perpusnas", desc: "Hasil layout diajukan ke Perpustakaan Nasional untuk mendapatkan ISBN dan identitas katalog." },
  { no: "05", title: "Penerbitan", desc: "PDF hasil resmi diunggah, Anda dapat mengunduhnya, dan buku dapat dipajang di Toko Buku kami." },
];

const requirements = [
  { label: "Sinopsis", note: "DOC/PDF, maks. 10 MB" },
  { label: "Naskah Buku", note: "DOCX/DOC, maks. 20 MB" },
  { label: "Cover Depan & Belakang", note: "JPG/PNG, maks. 5 MB" },
  { label: "Kwitansi Lunas Keuangan", note: "JPG/PNG, maks. 5 MB" },
  { label: "Bukti Cek Plagiasi", note: "PDF" },
];

const serviceDetails = [
  {
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    title: "Pengurusan ISBN",
    desc: "Pengurusan ISBN buku Anda melalui Perpustakaan Nasional dengan proses yang terjamin dan terdokumentasi.",
  },
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Layanan Terpadu (One Stop Service)",
    desc: "Seluruh proses penerbitan ditangani dari satu pintu: pengajuan, verifikasi, produksi, hingga distribusi.",
  },
  {
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    title: "Penyuntingan & Layout",
    desc: "Penyuntingan bahasa dan pengaturan tata letak (layouting) oleh editor dan layouter profesional.",
  },
  {
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Desain Sampul Buku",
    desc: "Desain sampul depan dan belakang yang menarik sesuai tema dan kaidah penerbitan buku.",
  },
  {
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    title: "Pemasaran Buku",
    desc: "Buku yang terbit dipasarkan melalui katalog, toko buku pengarang, dan marketplace.",
  },
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    title: "Buku Digital & Cetak",
    desc: "Hasil akhir tersedia dalam format digital (PDF) dan/atau cetak sesuai kebutuhan penulis.",
  },
];

export default function LayananPage() {
  return (
    <>
      <PageHero
        title="Layanan Penerbitan Buku"
        subtitle="Alur penerbitan yang jelas, terstruktur, dan dapat dipantau setiap saat."
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Alur Penerbitan"
          subtitle="Lima tahap dari pengajuan hingga buku Anda terbit."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.no}
              className="relative rounded-2xl border border-ink/10 bg-white p-6 shadow-sm"
            >
              <span className="font-display text-4xl font-semibold text-uninus/30">
                {step.no}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Layanan Spesifik"
          subtitle="UNINUS Press menyediakan berbagai layanan penerbitan untuk mendukung karya ilmiah Anda."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceDetails.map((svc) => (
            <div
              key={svc.title}
              className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
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
                    d={svc.icon}
                  />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold text-ink">{svc.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-uninus-soft py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading
            title="Dokumen yang Diperlukan"
            subtitle="Siapkan dokumen berikut sebelum mengajukan naskah."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {requirements.map((req) => (
                <div
                  key={req.label}
                  className="rounded-2xl border border-ink/10 bg-white p-5 text-center shadow-sm"
                >
                  <p className="font-display text-base font-semibold text-ink">{req.label}</p>
                <p className="mt-1 text-xs text-gray-500">{req.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/daftar"
              className="rounded-full bg-uninus px-10 py-4 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Mulai Pengajuan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}