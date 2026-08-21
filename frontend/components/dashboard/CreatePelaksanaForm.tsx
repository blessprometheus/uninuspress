"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError, firstError } from "@/lib/api";
import type { CreatePelaksanaResponse } from "@/lib/types";

interface CreatePelaksanaFormProps {
  token: string;
  onDone: () => void;
}

export default function CreatePelaksanaForm({
  token,
  onDone,
}: CreatePelaksanaFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api<CreatePelaksanaResponse>("/admin/pelaksana", {
        method: "POST",
        token,
        body: { name, email, phone: phone || null, password },
      });
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setOpen(false);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? firstError(err.errors, err.message)
          : "Gagal mendaftarkan pelaksana.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Tambah Pelaksana</h3>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-full bg-uninus px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-uninus-dark"
        >
          + Tambah Pelaksana
        </button>
      ) : (
        <>
          {error && (
            <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                placeholder="Nama pelaksana"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                placeholder="email@uninus.ac.id"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Telepon
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                placeholder="0812xxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                placeholder="Min. 8 karakter"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
              >
                {busy ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
              >
                Batal
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}