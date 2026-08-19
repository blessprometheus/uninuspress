"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import "../page.css";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetchApi<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Permintaan gagal");
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={handleSubmit}>
      <p className="auth-hint">
        Masukkan email yang terdaftar. Jika email terdaftar, kami akan mengirim
        tautan untuk mereset password.
      </p>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      {message && (
        <p className={`form-msg ${status === "error" ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Mengirim..." : "Kirim Tautan Reset"}
      </button>

      <p className="auth-alt">
        <Link href="/masuk" className="auth-link">
          Kembali ke Masuk
        </Link>
      </p>
    </form>
  );
}