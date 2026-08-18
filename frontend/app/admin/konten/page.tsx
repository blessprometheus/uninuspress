"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Page = { id: string; slug: string; title: string; content: string };

const EMPTY = { slug: "", title: "", content: "" };

export default function KontenPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setPages(await fetchApi<Page[]>("/cms/pages"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editId) {
        await fetchApi(`/cms/pages/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await fetchApi("/cms/pages", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus halaman ini?")) return;
    await fetchApi(`/cms/pages/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(page: Page) {
    setEditId(page.id);
    setForm({ slug: page.slug, title: page.title, content: page.content });
  }

  return (
    <>
      <h1 className="admin-page-title">Konten Halaman</h1>
      <p className="admin-page-desc">Kelola halaman informatif situs.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Slug
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="tentang"
            required
          />
        </label>
        <label>
          Judul
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label className="full">
          Konten
          <textarea
            rows={5}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </label>
        {error && <p className="form-msg error full">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm2">
            {editId ? "Simpan Perubahan" : "Tambah Halaman"}
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
              <th>Slug</th>
              <th>Judul</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id}>
                <td><code>{p.slug}</code></td>
                <td>{p.title}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-outline btn-sm2" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm2" onClick={() => remove(p.id)}>
                      Hapus
                    </button>
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
