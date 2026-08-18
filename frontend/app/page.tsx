import Link from "next/link";
import { fetchApi } from "@/lib/api";
import "./home.css";

type Service = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
};

const FALLBACK_SERVICES: Service[] = [
  {
    id: "isbn",
    title: "Pengurusan ISBN",
    description:
      "Bantu pengurusan ISBN untuk setiap buku yang diterbitkan agar memiliki nomor resmi nasional.",
  },
  {
    id: "oss",
    title: "Layanan Terpadu (One Stop Service)",
    description:
      "Seluruh proses penerbitan dari pengajuan hingga terbit ditangani dalam satu layanan terpadu.",
  },
  {
    id: "editing",
    title: "Penyuntingan dan Tata Letak",
    description:
      "Editor dan layouter profesional untuk menyempurnakan naskah Anda.",
  },
  {
    id: "cover",
    title: "Desain Sampul Buku",
    description:
      "Desain sampul yang menarik sesuai tema dan target pembaca buku Anda.",
  },
  {
    id: "marketing",
    title: "Pemasaran Buku",
    description:
      "Buku Anda dipasarkan melalui toko online dan kanal distribusi Uninus Press.",
  },
];

async function getServices(): Promise<Service[]> {
  try {
    const data = await fetchApi<Service[]>("/cms/services");
    return data.length > 0 ? data : FALLBACK_SERVICES;
  } catch {
    return FALLBACK_SERVICES;
  }
}

export default async function Home() {
  const services = await getServices();

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Selamat datang di laman <span className="text-accent">Uninus Press</span>
            </h1>
            <p className="hero-subtitle">
              Sebagai penerbit akademis, Uninus Press menerbitkan buku-buku untuk
              kepentingan akademis, pendidikan, dan kebudayaan.
            </p>
            <div className="hero-actions">
              <Link href="/toko-buku" className="btn btn-light">
                Belanja Buku
              </Link>
              <Link href="/daftar" className="btn btn-outline btn-outline-light">
                Ingin Terbitkan Buku?
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-card hero-card-1">📚</div>
            <div className="hero-card hero-card-2">✍️</div>
            <div className="hero-card hero-card-3">🖋️</div>
          </div>
        </div>
      </section>

      {/* Layanan */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Daftar Layanan</h2>
            <p className="section-subtitle">
              Uninus Press berkomitmen memberikan jasa layanan penerbitan bagi
              sivitas maupun nonsivitas universitas.
            </p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon ?? "📘"}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Pengajuan */}
      <section className="section section-soft">
        <div className="container">
          <div className="cta-box">
            <div>
              <h2 className="section-title">Anda memiliki naskah yang belum diterbitkan?</h2>
              <p className="cta-desc">
                Tunggu apa lagi? Segera ajukan naskah Anda dan wujudkan karya
                menjadi buku terbitan resmi.
              </p>
            </div>
            <Link href="/daftar" className="btn btn-primary">
              Ajukan Sekarang
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
