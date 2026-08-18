"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import "./header.css";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/layanan", label: "Layanan" },
  { href: "/paket-penerbitan", label: "Harga Paket" },
  { href: "/toko-buku", label: "Toko Buku" },
  { href: "/kontak", label: "Kontak" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-contact">
            <a href="https://wa.me/628110000000" className="topbar-link">
              <span aria-hidden>📞</span> 0811-xxxx-xxxx
            </a>
            <a href="mailto:press@uninus.ac.id" className="topbar-link">
              <span aria-hidden>✉️</span> press@uninus.ac.id
            </a>
          </div>
          <div className="topbar-tagline">Penerbit Universitas Islam Nusantara</div>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-badge">UN</span>
            <span className="brand-text">
              <strong>Uninus Press</strong>
              <small>Penerbit Universitas</small>
            </span>
          </Link>

        <button
          type="button"
          className={`hamburger ${open ? "is-open" : ""}`}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${open ? "is-open" : ""}`}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <div className="nav-user">
              {user.role === "AUTHOR" ? (
                <Link
                  href="/dashboard"
                  className="nav-link"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="nav-link"
                  onClick={() => setOpen(false)}
                >
                  Panel Admin
                </Link>
              )}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/masuk"
                className="btn btn-outline btn-sm"
                onClick={() => setOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="btn btn-primary btn-sm"
                onClick={() => setOpen(false)}
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}