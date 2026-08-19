"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import "../page.css";

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetchApi<{ message: string }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verifikasi gagal");
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={handleSubmit}>
      <label>
        Token Verifikasi
        <input value={token} disabled placeholder="Token dari email Anda" />
      </label>

      {message && (
        <p className={`form-msg ${status === "error" ? "error" : "success"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting" || !token}
      >
        {status === "submitting" ? "Memverifikasi..." : "Verifikasi Email"}
      </button>

      <p className="auth-alt">
        Tidak menerima email?{" "}
        <Link href="/masuk" className="auth-link">
          Kembali ke Masuk
        </Link>
      </p>
    </form>
  );
}