"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import "../page.css";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Gagal mendaftar");
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

      {status === "error" && <p className="form-msg error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Mendaftar..." : "Daftar"}
      </button>

      <p className="auth-alt">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="auth-link">
          Masuk
        </Link>
      </p>
    </form>
  );
}