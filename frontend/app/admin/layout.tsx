"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import "./admin.css";

const MENU = [
  { href: "/admin", label: "Ringkasan", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/pengajuan", label: "Pengajuan Naskah", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/konten", label: "Konten Halaman", roles: ["ADMIN"] },
  { href: "/admin/layanan", label: "Layanan", roles: ["ADMIN"] },
  { href: "/admin/paket", label: "Paket Harga", roles: ["ADMIN"] },
  { href: "/admin/buku", label: "Katalog Buku", roles: ["ADMIN", "EDITOR"] },
  { href: "/admin/pesan", label: "Pesan Kontak", roles: ["ADMIN"] },
  { href: "/admin/pengguna", label: "Pengguna", roles: ["ADMIN"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/masuk");
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    return <div className="admin-loading">Memuat...</div>;
  }

  const menu = MENU.filter((m) => m.roles.includes(user.role));

  return (
    <div className="admin-wrap">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <strong>Panel Admin</strong>
          <small>{user.role}</small>
        </div>
        <nav className="admin-nav">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
