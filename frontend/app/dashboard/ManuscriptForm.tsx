"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";

export default function ManuscriptForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">(
    "idle",
  );
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await fetchApi("/manuscripts", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTitle("");
      setDescription("");
      setStatus("success");
      onCreated();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Gagal membuat pengajuan");
    }
  }

  return (
    <form className="ms-form" onSubmit={handleSubmit}>
      <h2 className="dashboard-section">Ajukan Naskah Baru</h2>
      <label>
        Judul Naskah
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </label>
      <label>
        Deskripsi
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          minLength={10}
        />
      </label>
      {status === "error" && <p className="form-msg error">{error}</p>}
      {status === "success" && (
        <p className="form-msg success">
          Pengajuan berhasil dibuat. Silakan upload file naskah.
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Menyimpan..." : "Simpan Pengajuan"}
      </button>
    </form>
  );
}