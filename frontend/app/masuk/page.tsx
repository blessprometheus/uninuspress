import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import GuestOnly from "@/components/GuestOnly";
import "../page.css";

export const metadata: Metadata = { title: "Masuk" };

export default function MasukPage() {
  return (
    <GuestOnly>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="page-title">Masuk</h1>
          <p className="page-lead">Masuk untuk mengelola pengajuan naskah Anda.</p>
          <LoginForm />
        </div>
      </div>
    </GuestOnly>
  );
}