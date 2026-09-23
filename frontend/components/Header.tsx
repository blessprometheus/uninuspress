"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/layanan", label: "Layanan" },
  { href: "/#paket-penerbitan", label: "Paket" },
  { href: "/toko-buku", label: "Toko Buku" },
  { href: "/kontak", label: "Kontak" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-uninus.jpg"
            alt="Logo UNINUS"
            width={48}
            height={48}
            className="h-11 w-auto"
            priority
          />
          <span className="text-lg font-extrabold tracking-tight text-uninus-dark">
            UNINUS<span className="text-uninus-yellow"> Press</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-uninus"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <>
              <span className="text-sm font-semibold text-gray-600">
                {user.name}
              </span>
              <Link
                href="/dashboard"
                className="rounded-full bg-uninus px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-uninus-dark"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/masuk"
                className="text-sm font-semibold text-gray-700 transition-colors hover:text-uninus"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-full bg-uninus px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-uninus-dark"
              >
                Ajukan Naskah
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Buka menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-uninus lg:hidden"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-uninus-soft hover:text-uninus"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-full bg-uninus px-5 py-2.5 text-center text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/masuk"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-uninus px-5 py-2.5 text-center text-sm font-semibold text-uninus"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-uninus px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Ajukan Naskah
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}