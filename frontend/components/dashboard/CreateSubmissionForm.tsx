"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError, firstError } from "@/lib/api";
import type { SubmissionActionResponse } from "@/lib/types";

interface CreateSubmissionFormProps {
  token: string;
  onDone: () => void;
}

export default function CreateSubmissionForm({
  token,
  onDone,
}: CreateSubmissionFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [category, setCategory] = useState("BUKU");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api<SubmissionActionResponse>("/submissions", {
        method: "POST",
        token,
        body: {
          title,
          author_name: authorName || undefined,
          synopsis: synopsis || undefined,
          category,
        },
      });
      setTitle("");
      setAuthorName("");
      setSynopsis("");
      setCategory("BUKU");
      setOpen(false);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? firstError(err.errors, err.message)
          : "Gagal membuat pengajuan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-uninus px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-uninus-dark"
        >
          + Buat Pengajuan Baru
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Pengajuan Baru</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="create-title"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Judul Buku <span className="text-red-500">*</span>
              </label>
              <input
                id="create-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
                placeholder="Judul buku Anda"
              />
            </div>
            <div>
              <label
                htmlFor="create-author"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Nama Penulis
              </label>
              <input
                id="create-author"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
                placeholder="Kosongkan untuk menggunakan nama akun"
              />
            </div>
            <div>
              <label
                htmlFor="create-synopsis"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Sinopsis
              </label>
              <textarea
                id="create-synopsis"
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
                placeholder="Sinopsis singkat buku"
              />
            </div>
            <div>
              <label
                htmlFor="create-category"
                className="mb-1 block text-sm font-semibold text-gray-700"
              >
                Kategori
              </label>
              <select
                id="create-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
              >
                <option value="BUKU">Buku</option>
                <option value="MODUL">Modul</option>
                <option value="MONOGRAF">Monograf</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-uninus px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-uninus-dark disabled:opacity-60"
            >
              {busy ? "Menyimpan..." : "Simpan Draft"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}