import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import GuestOnly from "@/components/GuestOnly";
import "../page.css";

export const metadata: Metadata = { title: "Daftar" };

export default function DaftarPage() {
  return (
    <GuestOnly>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="page-title">Daftar</h1>
          <p className="page-lead">Buat akun untuk mengajukan naskah Anda.</p>
          <RegisterForm />
        </div>
      </div>
    </GuestOnly>
  );
}