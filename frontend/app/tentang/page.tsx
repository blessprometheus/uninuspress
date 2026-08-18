import type { Metadata } from "next";
import "../page.css";

export const metadata: Metadata = { title: "Tentang Kami" };

export default function TentangPage() {
  return (
    <div className="static-page container">
      <h1 className="page-title">Tentang Kami</h1>
      <p className="page-lead">
        Uninus Press adalah penerbit akademis di lingkungan Universitas Islam
        Nusantara yang menerbitkan buku untuk kepentingan akademis, pendidikan,
        dan kebudayaan.
      </p>

      <h2>Visi</h2>
      <p>
        Menjadi penerbit perguruan tinggi yang mendukung komunikasi ilmiah para
        pakar dan profesional dalam mendiseminasikan karya melalui multiplatform
        bagi komunitas ilmiah.
      </p>

      <h2>Misi</h2>
      <ul className="page-list">
        <li>
          Menyediakan layanan penerbitan buku yang profesional dan terpercaya.
        </li>
        <li>
          Mendukung pengembangan karya akademik dan kreatif sivitas akademika
          maupun masyarakat umum.
        </li>
        <li>
          Menyelenggarakan layanan penerbitan yang cepat, mudah, dan terjangkau.
        </li>
      </ul>

      <h2>Sejarah</h2>
      <p>
        Sebagai penerbit akademis, Uninus Press terus berkembang memberikan
        layanan penerbitan bagi sivitas maupun nonsivitas universitas, termasuk
        layanan penerbitan untuk karya fiksi bagi masyarakat umum guna
        menyebarkan hasil olah pikir kreatif.
      </p>
    </div>
  );
}
