"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import "../page.css";

export default function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Konfirmasi password tidak cocok");
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetchApi<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Reset gagal");
    }
  }

  return (
    <form className="contact-form auth-form" onSubmit={handleSubmit}>
      <label>
        Password Baru
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          placeholder="Minimal 8 karakter, huruf dan angka"
        />
      </label>
      <label>
        Konfirmasi Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        disabled={status === "submitting" || !token}
      >
        {status === "submitting" ? "Menyimpan..." : "Reset Password"}
      </button>

      <p className="auth-alt">
        {status === "success" ? (
          <Link href="/masuk" className="auth-link">
            Masuk sekarang
          </Link>
        ) : (
          <Link href="/masuk" className="auth-link">
            Kembali ke Masuk
          </Link>
        )}
      </p>
    </form>
  );
}