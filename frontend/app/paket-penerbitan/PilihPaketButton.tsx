"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function PilihPaketButton() {
  const { user } = useAuth();
  return (
    <Link
      href={user ? "/dashboard" : "/daftar"}
      className="btn btn-primary btn-block"
    >
      {user ? "Ajukan Naskah" : "Pilih Paket"}
    </Link>
  );
}
