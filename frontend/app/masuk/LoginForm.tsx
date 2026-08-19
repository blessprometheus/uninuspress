"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import "../page.css";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
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
      const user = await login(email, password);
      router.push(user.role === "AUTHOR" ? "/dashboard" : "/admin");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Gagal masuk");
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={handleSubmit}>
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
        {status === "submitting" ? "Memproses..." : "Masuk"}
      </button>

      <p className="auth-alt">
        Lupa password?{" "}
        <Link href="/lupa-password" className="auth-link">
          Reset di sini
        </Link>
      </p>

      <p className="auth-alt">
        Belum punya akun?{" "}
        <Link href="/daftar" className="auth-link">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}