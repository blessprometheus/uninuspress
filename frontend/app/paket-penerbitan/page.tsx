import type { Metadata } from "next";
import { fetchApi } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import PilihPaketButton from "./PilihPaketButton";
import "../page.css";

export const metadata: Metadata = { title: "Harga Paket Penerbitan" };

type Package = {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
};

const FALLBACK_PACKAGES: Package[] = [
  {
    id: "dasar",
    name: "Paket Dasar",
    description: "Untuk penulis yang ingin menerbitkan buku secara mandiri.",
    price: "1500000",
    features: [
      "Pengurusan ISBN",
      "Tata letak standar",
      "Desain sampul",
      "Eksemplar penulis",
      "Format cetak",
    ],
  },
  {
    id: "pro",
    name: "Paket Pro",
    description: "Paket paling laris dengan layanan pemasaran.",
    price: "3000000",
    features: [
      "Semua fitur Paket Dasar",
      "Penyuntingan bahasa",
      "Format cetak & digital",
      "Pemasaran buku",
      "Royalti terjamin",
    ],
  },
  {
    id: "eksklusif",
    name: "Paket Eksklusif",
    description: "Layanan lengkap untuk buku berkualitas penerbitan besar.",
    price: "5000000",
    features: [
      "Semua fitur Paket Pro",
      "Editor khusus",
      "Pemasaran intensif",
      "Jumlah eksemplar lebih banyak",
      "Prioritas produksi",
    ],
  },
];

async function getPackages(): Promise<Package[]> {
  try {
    const data = await fetchApi<Package[]>("/cms/packages");
    return data.length > 0 ? data : FALLBACK_PACKAGES;
  } catch {
    return FALLBACK_PACKAGES;
  }
}

export default async function PaketPage() {
  const packages = await getPackages();

  return (
    <div className="container pricing-page">
      <div className="pricing-head">
        <h1 className="page-title">Harga Paket Penerbitan</h1>
        <p className="page-lead">
          Pilih paket penerbitan yang sesuai dengan kebutuhan Anda. Setiap paket
          telah mencakup layanan terpadu penerbitan.
        </p>
      </div>

      <div className="pricing-grid">
        {packages.map((pkg, i) => (
          <div
            key={pkg.id}
            className={`pricing-card ${i === 1 ? "featured" : ""}`}
          >
            {i === 1 && <span className="badge">Terlaris</span>}
            <h3>{pkg.name}</h3>
            <p className="pricing-desc">{pkg.description}</p>
            <div className="price">{formatIDR(pkg.price)}</div>
            <ul>
              {pkg.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <PilihPaketButton />
          </div>
        ))}
      </div>

      <p className="pricing-note">
        Harga dapat berubah sewaktu-waktu. Hubungi kami untuk konsultasi paket
        sesuai kebutuhan.
      </p>
    </div>
  );
}
