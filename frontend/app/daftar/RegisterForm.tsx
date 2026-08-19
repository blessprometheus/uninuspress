"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import "../page.css";

export default function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await register(name, email, password);
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Gagal mendaftar");
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={handleSubmit}>
      <label>
        Nama Lengkap
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
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
        {status === "submitting"
          ? "Mendaftar..."
          : status === "success"
            ? "Terdaftar"
            : "Daftar"}
      </button>

      {status === "success" ? (
        <p className="auth-alt">
          Sudah verifikasi email?{" "}
          <Link href="/masuk" className="auth-link">
            Masuk sekarang
          </Link>
        </p>
      ) : (
        <p className="auth-alt">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="auth-link">
            Masuk
          </Link>
        </p>
      )}
    </form>
  );
}