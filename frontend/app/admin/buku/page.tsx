"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { BOOK_NEXT_TRANSITIONS, BOOK_STATUS_LABEL } from "@/lib/labels";

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  externalUrl?: string | null;
  published: boolean;
  status: string;
};

const EMPTY = { title: "", author: "", description: "", externalUrl: "" };

export default function BukuPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setBooks(await fetchApi<Book[]>("/books/all"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, externalUrl: form.externalUrl || undefined };
      if (editId) {
        await fetchApi(`/books/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/books", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  async function changeStatus(book: Book, status: string) {
    setError("");
    setBusy(book.id);
    try {
      await fetchApi(`/books/${book.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setBusy("");
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus buku ini?")) return;
    setError("");
    try {
      await fetchApi(`/books/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus buku");
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Katalog Buku</h1>
      <p className="admin-page-desc">Kelola buku yang tampil di toko buku.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Judul Buku
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label>
          Penulis
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            required
          />
        </label>
        <label className="full">
          Deskripsi
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label className="full">
          Link Eksternal (toko buku/Tokopedia)
          <input
            type="url"
            value={form.externalUrl}
            onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
            placeholder="https://bookstore.example.com"
          />
        </label>
        {error && <p className="form-msg error full">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm2">
            {editId ? "Simpan Perubahan" : "Tambah Buku"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-outline btn-sm2"
              onClick={() => {
                setEditId(null);
                setForm(EMPTY);
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Penulis</th>
              <th>Link</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.title}</strong></td>
                <td>{b.author}</td>
                <td>
                  {b.externalUrl ? (
                    <a href={b.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                      Buka ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <span
                    className={`badge badge-${b.status?.toLowerCase() ?? "draft"}`}
                  >
                    {BOOK_STATUS_LABEL[b.status] ?? (b.published ? "Terbit" : "Draf")}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-sm2"
                      onClick={() => {
                        setEditId(b.id);
                        setForm({
                          title: b.title,
                          author: b.author,
                          description: b.description,
                          externalUrl: b.externalUrl ?? "",
                        });
                      }}
                    >
                      Edit
                    </button>
                    {(BOOK_NEXT_TRANSITIONS[b.status] ?? []).map((t) => (
                      <button
                        key={t.to}
                        className="btn btn-primary btn-sm2"
                        onClick={() => changeStatus(b, t.to)}
                        disabled={busy === b.id}
                      >
                        {t.label}
                      </button>
                    ))}
                    {isAdmin && (
                      <button
                        className="btn btn-danger btn-sm2"
                        onClick={() => remove(b.id)}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
