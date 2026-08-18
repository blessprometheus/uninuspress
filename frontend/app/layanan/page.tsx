import type { Metadata } from "next";
import Link from "next/link";
import "../page.css";

export const metadata: Metadata = { title: "Layanan Penerbitan Buku" };

const STEPS = [
  {
    title: "Ajukan Naskah",
    desc: "Daftar akun dan ajukan naskah Anda melalui formulir pengajuan online.",
  },
  {
    title: "Review & Penyuntingan",
    desc: "Editor kami menelaah naskah, melakukan penyuntingan, dan tata letak.",
  },
  {
    title: "Desain Sampul",
    desc: "Sampul buku didesain sesuai tema dan target pembaca.",
  },
  {
    title: "ISBN & Terbit",
    desc: "Pengurusan ISBN dan buku siap terbit dalam format cetak dan/atau digital.",
  },
  {
    title: "Pemasaran",
    desc: "Buku dipasarkan melalui toko online dan kanal distribusi.",
  },
];

export default function LayananPage() {
  return (
    <div className="static-page container">
      <h1 className="page-title">Layanan Penerbitan Buku</h1>
      <p className="page-lead">
        Uninus Press menyediakan layanan terpadu penerbitan buku bagi sivitas
        maupun nonsivitas universitas, dari pengajuan naskah hingga pemasaran.
      </p>

      <h2>Alur Penerbitan</h2>
      <ol className="steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="step">
            <span className="step-num">{i + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="cta-inline">
        <p>Sudah siap menerbitkan buku Anda?</p>
        <Link href="/daftar" className="btn btn-primary">
          Ajukan Naskah
        </Link>
        <Link href="/paket-penerbitan" className="btn btn-outline">
          Lihat Harga Paket
        </Link>
      </div>
    </div>
  );
}
