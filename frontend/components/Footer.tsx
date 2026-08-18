import Link from "next/link";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <span className="brand-badge">UN</span>
            <strong>Uninus Press</strong>
          </div>
          <p className="footer-desc">
            Penerbit Universitas Islam Nusantara yang melayani penerbitan buku
            akademik, pendidikan, dan karya kreatif.
          </p>
        </div>

        <div>
          <h4>Layanan</h4>
          <ul>
            <li><Link href="/layanan">Penerbitan Buku</Link></li>
            <li><Link href="/paket-penerbitan">Harga Paket</Link></li>
            <li><Link href="/toko-buku">Toko Buku</Link></li>
          </ul>
        </div>

        <div>
          <h4>Informasi</h4>
          <ul>
            <li><Link href="/tentang">Tentang Kami</Link></li>
            <li><Link href="/kontak">Kontak</Link></li>
            <li><Link href="/masuk">Masuk</Link></li>
            <li><Link href="/daftar">Daftar</Link></li>
          </ul>
        </div>

        <div>
          <h4>Kontak</h4>
          <ul>
            <li>Kampus Universitas Islam Nusantara</li>
            <li>Email: press@uninus.ac.id</li>
            <li>Telepon: (022) 780XXXX</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Uninus Press. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
