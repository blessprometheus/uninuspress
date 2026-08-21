import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/layanan", label: "Layanan Penerbitan" },
  { href: "/toko-buku", label: "Toko Buku" },
  { href: "/kontak", label: "Kontak" },
  { href: "/daftar", label: "Daftar" },
  { href: "/masuk", label: "Masuk" },
];

export default function Footer() {
  return (
    <footer className="bg-uninus-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/logo-uninus.png"
              alt="Logo UNINUS"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-lg font-extrabold">
              UNINUS<span className="text-uninus-yellow"> Press</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
            Unit penerbitan Universitas Islam Nusantara yang melayani pengajuan
            dan penerbitan buku dengan proses yang transparan dan terpercaya.
          </p>
        </div>

        <div>
          <h3 className="inline-block border-b-2 border-uninus-yellow pb-2 text-base font-bold">
            Tautan
          </h3>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-white/80 transition-all hover:pl-1 hover:text-uninus-yellow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="inline-block border-b-2 border-uninus-yellow pb-2 text-base font-bold">
            Kontak
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/80">
            <li>Jl. Soekarno-Hatta No.530, Bandung</li>
            <li>Jawa Barat 40286, Indonesia</li>
            <li>Email: press@uninus.ac.id</li>
            <li>Telepon: 0811-2311-530</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} UNINUS Press. Universitas Islam
        Nusantara.
      </div>
    </footer>
  );
}