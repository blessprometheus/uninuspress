import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import "../page.css";

export const metadata: Metadata = { title: "Kontak" };

export default function KontakPage() {
  return (
    <div className="container static-page">
      <h1 className="page-title">Kontak</h1>
      <p className="page-lead">
        Hubungi kami untuk informasi layanan penerbitan atau kunjungi kantor
        Uninus Press.
      </p>

      <div className="contact-grid">
        <div>
          <h2>Alamat</h2>
          <p>
            Uninus Press
            <br />
            Kampus Universitas Islam Nusantara
            <br />
            Jl. Soekarno-Hatta No. 530, Bandung
          </p>
          <h2>Email</h2>
          <p>press@uninus.ac.id</p>
          <h2>Telepon</h2>
          <p>(022) 780XXXX</p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
