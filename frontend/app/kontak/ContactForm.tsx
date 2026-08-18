"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await fetchApi("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Nama
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          minLength={2}
        />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Subjek
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          minLength={3}
        />
      </label>
      <label>
        Pesan
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          required
          minLength={10}
        />
      </label>

      {status === "success" && (
        <p className="form-msg success">
          Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.
        </p>
      )}
      {status === "error" && <p className="form-msg error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  );
}
